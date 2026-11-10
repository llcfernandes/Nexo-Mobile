import { router, useFocusEffect } from 'expo-router'
import { ChevronRight, Heart, Menu, Motorbike, Plus, ScanBarcode, Search, ShoppingBag } from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BarraInferior from '../components/BarraInferior'
import AtalhosLoja from '../components/AtalhosLoja'
import FotoProduto from '../components/FotoProduto'
import FundoDegrade from '../components/FundoDegrade'
import TextoVerde from '../components/TextoVerde'
import { CURIOSIDADES } from '../constants/curiosidades'
import { useFavoritos } from '../context/FavoritosContext'
import { usePainel } from '../context/PainelContext'
import { usePapel } from '../context/PapelContext'
import { useTema } from '../context/TemaContext'
import { observarSessao } from '../services/auth'
import { listarProdutos } from '../services/firebase'
import type { Produto } from '../types'

const precoTexto = (valor: number): string => {
  const preco = Number(valor)
  return Number.isFinite(preco) ? `R$ ${preco.toFixed(2)}` : '—'
}

export default function Inicio() {
  const { tema, cores } = useTema()
  const { abrir } = usePainel()
  const { papel } = usePapel()
  const { ehFavorito, alternarFavorito } = useFavoritos()
  const cliente = papel === 'cliente'
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState<string | null>(null)
  const [pronto, setPronto] = useState(false)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = observarSessao((user) => {
      if (!user) {
        router.replace('/login')
        return
      }
      setEmail(user.email)
      setPronto(true)
    })
    return unsubscribe
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (!pronto) return
      const carregar = async () => {
        try {
          setProdutos(await listarProdutos())
          setErro(null)
        } catch (e) {
          console.error('[inicio] falha ao listar produtos:', e)
          setErro('Não foi possível carregar os produtos.')
        }
      }
      carregar()
    }, [pronto])
  )

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return produtos
    return produtos.filter((item) =>
      `${item.nome} ${item.categoria} ${item.codigo_barras}`.toLowerCase().includes(termo)
    )
  }, [busca, produtos])

  if (!pronto) {
    return (
      <View style={[styles.centro, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color={cores.destaque} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FundoDegrade />
      <ScrollView contentContainerStyle={[styles.conteudo, { paddingTop: insets.top + 16, paddingBottom: 120 }]}>
        <View style={styles.topo}>
          <Pressable
            style={[styles.menu, { backgroundColor: cores.superficie, borderColor: cores.linha }]}
            onPress={abrir}
            accessibilityLabel="Abrir configurações"
          >
            <Menu color={cores.texto} size={20} />
          </Pressable>
          <View style={styles.topoTexto}>
            <TextoVerde style={styles.kicker}>Bem-vindo</TextoVerde>
            <Text style={[styles.email, { color: cores.texto }]} numberOfLines={1}>
              {email ?? 'Conta sem e-mail'}
            </Text>
          </View>
          <AtalhosLoja />
        </View>

        <View style={[styles.entrega, { backgroundColor: cores.superficie }]}>
          <View style={[styles.moto, { backgroundColor: cores.destaque }]}>
            <Motorbike color={cores.destaqueTexto} size={22} />
          </View>
          <View style={styles.bannerTexto}>
            <Text style={[styles.bannerTitulo, { color: cores.texto }]}>Entregamos para todo o RJ</Text>
            <Text style={[styles.bannerSub, { color: cores.textoSuave }]}>Do Leme a Santa Cruz, o pedido chega na cidade.</Text>
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={[styles.secaoTitulo, { color: cores.texto }]}>Curiosidades</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.faixa}>
          {CURIOSIDADES.map((item) => (
            <View key={item.id} style={[styles.curiosidade, { backgroundColor: cores.superficie }]}>
              <item.Icone color={tema === 'escuro' ? cores.destaque : cores.destaqueTexto} size={18} />
              <Text style={[styles.curiosidadeTitulo, { color: cores.texto }]}>{item.titulo}</Text>
              <Text style={[styles.curiosidadeTexto, { color: cores.textoSuave }]}>{item.texto}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.busca, { backgroundColor: cores.superficie }]}>
          <Search color={cores.textoSuave} size={18} />
          <TextInput
            style={[styles.buscaInput, { color: cores.texto }]}
            placeholder="Buscar produto ou categoria"
            placeholderTextColor={cores.textoSuave}
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {cliente ? (
          <>
            <Pressable style={[styles.banner, { backgroundColor: cores.superficie }]} onPress={() => router.push('/produtos')}>
              <View style={[styles.bannerIcone, { backgroundColor: cores.destaque }]}>
                <ShoppingBag color={cores.destaqueTexto} size={22} />
              </View>
              <View style={styles.bannerTexto}>
                <Text style={[styles.bannerTitulo, { color: cores.texto }]}>Começar a comprar</Text>
                <Text style={[styles.bannerSub, { color: cores.textoSuave }]}>Escolha um produto e pague do seu jeito</Text>
              </View>
              <ChevronRight color={cores.destaque} size={20} />
            </Pressable>
            <Pressable onPress={() => router.push('/caixa')}>
              <TextoVerde style={styles.verTodos}>Escanear na loja</TextoVerde>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={[styles.banner, { backgroundColor: cores.superficie }]} onPress={() => router.push('/editor')}>
              <View style={[styles.bannerIcone, { backgroundColor: cores.destaque }]}>
                <Plus color={cores.destaqueTexto} size={22} />
              </View>
              <View style={styles.bannerTexto}>
                <Text style={[styles.bannerTitulo, { color: cores.texto }]}>Cadastrar produto</Text>
                <Text style={[styles.bannerSub, { color: cores.textoSuave }]}>Nome, preço, código e foto</Text>
              </View>
              <ChevronRight color={cores.destaque} size={20} />
            </Pressable>
            <Pressable style={[styles.banner, { backgroundColor: cores.superficie }]} onPress={() => router.push('/caixa')}>
              <View style={[styles.bannerIcone, { backgroundColor: cores.destaque }]}>
                <ScanBarcode color={cores.destaqueTexto} size={22} />
              </View>
              <View style={styles.bannerTexto}>
                <Text style={[styles.bannerTitulo, { color: cores.texto }]}>Escanear no caixa</Text>
                <Text style={[styles.bannerSub, { color: cores.textoSuave }]}>Lê o código e soma na conta</Text>
              </View>
              <ChevronRight color={cores.destaque} size={20} />
            </Pressable>
          </>
        )}

        <View style={styles.secao}>
          <Text style={[styles.secaoTitulo, { color: cores.texto }]}>Produtos</Text>
          <Pressable onPress={() => router.push('/produtos')}>
            <TextoVerde style={styles.verTodos}>Ver todos</TextoVerde>
          </Pressable>
        </View>

        {erro ? <Text style={[styles.aviso, { color: cores.perigo }]}>{erro}</Text> : null}
        {!erro && visiveis.length === 0 ? (
          <Text style={[styles.aviso, { color: cores.textoSuave }]}>Nenhum produto encontrado.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.faixa}>
            {visiveis.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.card, { backgroundColor: cores.superficie }]}
                onPress={() => router.push(`/produto/${item.id}`)}
              >
                <View style={styles.capa}>
                  <FotoProduto produto={item} style={StyleSheet.absoluteFill} />
                  <Pressable
                    style={styles.coracao}
                    onPress={() => alternarFavorito(item)}
                    accessibilityLabel="Favoritar produto"
                  >
                    <Heart
                      color={ehFavorito(item.id) ? cores.perigo : cores.textoSuave}
                      fill={ehFavorito(item.id) ? cores.perigo : 'transparent'}
                      size={18}
                    />
                  </Pressable>
                </View>
                <Text style={[styles.cardNome, { color: cores.texto }]} numberOfLines={2}>
                  {item.nome}
                </Text>
                <TextoVerde style={styles.cardPreco}>{precoTexto(item.preco_brl)}</TextoVerde>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </ScrollView>
      <BarraInferior />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  conteudo: { paddingHorizontal: 20, gap: 16 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menu: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  topoTexto: { flex: 1, gap: 2 },
  kicker: { fontSize: 13, fontWeight: '700' },
  email: { fontSize: 20, fontWeight: '800' },
  entrega: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 22, padding: 14 },
  moto: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  curiosidade: { width: 220, borderRadius: 18, padding: 14, gap: 6 },
  curiosidadeTitulo: { fontSize: 15, fontWeight: '800' },
  curiosidadeTexto: { fontSize: 13, lineHeight: 18 },
  busca: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, paddingHorizontal: 14, minHeight: 50 },
  buscaInput: { flex: 1, fontSize: 15, paddingVertical: 10 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 22, padding: 16 },
  bannerIcone: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bannerTexto: { flex: 1, gap: 2 },
  bannerTitulo: { fontSize: 16, fontWeight: '800' },
  bannerSub: { fontSize: 13 },
  secao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secaoTitulo: { fontSize: 18, fontWeight: '800' },
  verTodos: { fontSize: 14, fontWeight: '700' },
  aviso: { fontSize: 14 },
  faixa: { gap: 12, paddingRight: 8 },
  card: { width: 150, borderRadius: 18, padding: 10, gap: 8 },
  capa: { height: 96, borderRadius: 14, overflow: 'hidden' },
  coracao: { position: 'absolute', top: 8, right: 8 },
  cardNome: { fontSize: 14, fontWeight: '700', minHeight: 36 },
  cardPreco: { fontSize: 15, fontWeight: '800' },
})
