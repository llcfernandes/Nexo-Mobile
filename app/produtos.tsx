import { router, useFocusEffect } from 'expo-router'
import { Gift, GlassWater, Heart, Package, Pencil, Plus, Search, Shirt, Tag, Utensils } from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Animated, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import BarraApp from '../components/BarraApp'
import BarraInferior from '../components/BarraInferior'
import TextoVerde from '../components/TextoVerde'
import FotoProduto from '../components/FotoProduto'
import { useCarrinho } from '../context/CarrinhoContext'
import { useFavoritos } from '../context/FavoritosContext'
import { usePapel } from '../context/PapelContext'
import { useTema } from '../context/TemaContext'
import { observarSessao } from '../services/auth'
import { listarProdutos } from '../services/firebase'
import type { Produto } from '../types'

const precoTexto = (valor: number): string => {
  const preco = Number(valor)
  return Number.isFinite(preco) ? `R$ ${preco.toFixed(2)}` : '—'
}

const iconeDaCategoria = (nome: string) => {
  const texto = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (texto.includes('beb')) return GlassWater
  if (texto.includes('comida') || texto.includes('alimento')) return Utensils
  if (texto.includes('vest') || texto.includes('roupa')) return Shirt
  if (texto.includes('lembr') || texto.includes('souven')) return Gift
  return Tag
}

function BotaoMais({ cor, corIcone, onPress }: { cor: string; corIcone: string; onPress: () => void }) {
  const escala = useRef(new Animated.Value(1)).current

  const soltar = () => {
    onPress()
    escala.setValue(0.7)
    Animated.spring(escala, { toValue: 1, friction: 3, useNativeDriver: true }).start()
  }

  return (
    <Animated.View style={{ transform: [{ scale: escala }] }}>
      <Pressable style={[styles.mais, { backgroundColor: cor }]} onPress={soltar} accessibilityLabel="Adicionar ao carrinho">
        <Plus color={corIcone} size={16} />
      </Pressable>
    </Animated.View>
  )
}

export default function Produtos() {
  const { cores } = useTema()
  const { papel } = usePapel()
  const { adicionarItem } = useCarrinho()
  const { ehFavorito, alternarFavorito } = useFavoritos()
  const operador = papel === 'operador'
  const [pronto, setPronto] = useState(false)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = observarSessao((user) => {
      if (!user) {
        router.replace('/login')
        return
      }
      setPronto(true)
    })
    return unsubscribe
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (!pronto) return
      const carregar = async () => {
        setCarregando(true)
        setErro(null)
        try {
          setProdutos(await listarProdutos())
        } catch (e) {
          console.error('[produtos] falha ao listar produtos:', e)
          setErro('Não foi possível carregar os produtos.')
        } finally {
          setCarregando(false)
        }
      }
      carregar()
    }, [pronto])
  )

  const categorias = useMemo(() => {
    const nomes = Array.from(new Set(produtos.map((item) => item.categoria).filter(Boolean)))
    return nomes.sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [produtos])

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return produtos.filter((item) => {
      const naCategoria = !categoria || item.categoria === categoria
      const noTexto = !termo || `${item.nome} ${item.categoria} ${item.codigo_barras}`.toLowerCase().includes(termo)
      return naCategoria && noTexto
    })
  }, [busca, categoria, produtos])

  const cabecalho = (
    <View style={styles.cabecalho}>
      <View style={[styles.busca, { backgroundColor: cores.superficie }]}>
        <Search color={cores.textoSuave} size={18} />
        <TextInput
          style={[styles.buscaInput, { color: cores.texto }]}
          placeholder="Buscar produto"
          placeholderTextColor={cores.textoSuave}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <View style={styles.secao}>
        <Text style={[styles.secaoTitulo, { color: cores.texto }]}>Categorias</Text>
        {operador ? (
          <Pressable onPress={() => router.push('/editor')}>
            <TextoVerde style={styles.link}>Novo</TextoVerde>
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.faixa}>
        {['Todas', ...categorias].map((item) => {
          const ativa = item === 'Todas' ? categoria === null : categoria === item
          const Icone = item === 'Todas' ? Tag : iconeDaCategoria(item)
          return (
            <Pressable key={item} style={styles.categoria} onPress={() => setCategoria(item === 'Todas' ? null : item)}>
              <View style={[styles.circulo, { backgroundColor: ativa ? cores.destaque : cores.superficie }]}>
                <Icone color={ativa ? cores.destaqueTexto : cores.texto} size={20} />
              </View>
              <Text style={[styles.categoriaNome, { color: ativa ? cores.texto : cores.textoSuave }]} numberOfLines={1}>
                {item}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      <View style={styles.secao}>
        <Text style={[styles.secaoTitulo, { color: cores.texto }]}>Produtos</Text>
        <Text style={[styles.link, { color: cores.textoSuave }]}>{visiveis.length}</Text>
      </View>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <BarraApp titulo="Produtos" voltar={false} />
      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={cores.destaque} />
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={[styles.aviso, { color: cores.perigo }]}>{erro}</Text>
        </View>
      ) : (
        <FlatList
          data={visiveis}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={cabecalho}
          columnWrapperStyle={styles.colunas}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Package color={cores.textoSuave} size={32} />
              <Text style={[styles.aviso, { color: cores.textoSuave }]}>Nenhum produto encontrado.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, { backgroundColor: cores.superficie }]}
              onPress={() => router.push(`/produto/${item.id}`)}
            >
              <View style={styles.fotoCaixa}>
                <FotoProduto produto={item} style={styles.foto} />
                <Pressable style={styles.coracao} onPress={() => alternarFavorito(item)} accessibilityLabel="Favoritar produto">
                  <Heart
                    color={ehFavorito(item.id) ? cores.perigo : '#FFFFFF'}
                    fill={ehFavorito(item.id) ? cores.perigo : 'transparent'}
                    size={16}
                  />
                </Pressable>
                {operador ? (
                  <Pressable
                    style={[styles.lapis, { backgroundColor: cores.superficie }]}
                    onPress={() => router.push({ pathname: '/editor', params: { id: item.id } })}
                    accessibilityLabel="Editar produto"
                  >
                    <Pencil color={cores.texto} size={14} />
                  </Pressable>
                ) : null}
              </View>
              <Text style={[styles.nome, { color: cores.texto }]} numberOfLines={2}>
                {item.nome}
              </Text>
              <Text style={[styles.detalhe, { color: cores.textoSuave }]} numberOfLines={1}>
                {item.categoria}
              </Text>
              <View style={styles.rodapeCard}>
                <Text style={[styles.preco, { color: cores.texto }]}>{precoTexto(item.preco_brl)}</Text>
                <BotaoMais cor={cores.destaque} corIcone={cores.destaqueTexto} onPress={() => adicionarItem(item)} />
              </View>
            </Pressable>
          )}
        />
      )}
      <BarraInferior />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  aviso: { fontSize: 15, textAlign: 'center' },
  lista: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  cabecalho: { gap: 14, paddingTop: 8, paddingBottom: 4 },
  busca: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, paddingHorizontal: 14, minHeight: 50 },
  buscaInput: { flex: 1, fontSize: 15, paddingVertical: 10 },
  secao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secaoTitulo: { fontSize: 18, fontWeight: '800' },
  link: { fontSize: 14, fontWeight: '700' },
  faixa: { gap: 14, paddingRight: 8 },
  categoria: { width: 72, alignItems: 'center', gap: 6 },
  circulo: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  categoriaNome: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  colunas: { gap: 12 },
  card: { flex: 1, maxWidth: '48.5%', borderRadius: 22, padding: 10, gap: 6 },
  fotoCaixa: { height: 120, borderRadius: 16, overflow: 'hidden' },
  foto: { flex: 1, borderRadius: 16 },
  coracao: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12,13,16,0.35)',
  },
  lapis: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: { fontSize: 14, fontWeight: '800', minHeight: 36 },
  detalhe: { fontSize: 12 },
  rodapeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  preco: { fontSize: 15, fontWeight: '800', flex: 1 },
  mais: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  vazio: { alignItems: 'center', gap: 8, paddingVertical: 24 },
})
