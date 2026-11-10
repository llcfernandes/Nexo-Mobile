import { router, useLocalSearchParams } from 'expo-router'
import { Heart, Pencil, Plus } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import BarraApp from '../../components/BarraApp'
import FotoProduto from '../../components/FotoProduto'
import TextoVerde from '../../components/TextoVerde'
import { useCarrinho } from '../../context/CarrinhoContext'
import { useFavoritos } from '../../context/FavoritosContext'
import { usePapel } from '../../context/PapelContext'
import { useTema } from '../../context/TemaContext'
import { observarSessao } from '../../services/auth'
import { buscarProdutoPorId } from '../../services/firebase'
import type { Produto } from '../../types'

const precoTexto = (valor: number): string => {
  const preco = Number(valor)
  return Number.isFinite(preco) ? `R$ ${preco.toFixed(2)}` : '—'
}

export default function DetalheProduto() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { cores } = useTema()
  const { adicionarItem, itens } = useCarrinho()
  const { ehFavorito, alternarFavorito } = useFavoritos()
  const { papel } = usePapel()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = observarSessao((user) => {
      if (!user) router.replace('/login')
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!id) return
    const carregar = async () => {
      setCarregando(true)
      setErro(null)
      try {
        const encontrado = await buscarProdutoPorId(id)
        setProduto(encontrado)
        if (!encontrado) setErro('Produto não encontrado.')
      } catch (e) {
        console.error('[produto] falha ao abrir produto:', e)
        setErro('Não foi possível abrir o produto.')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [id])

  const quantidade = produto ? (itens.find((item) => item.produto_id === produto.id)?.quantidade ?? 0) : 0

  const handleAdicionar = () => {
    if (!produto) return
    adicionarItem(produto)
  }

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <BarraApp titulo="Produto" />
      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={cores.destaque} />
        </View>
      ) : erro || !produto ? (
        <View style={styles.centro}>
          <Text style={[styles.erro, { color: cores.perigo }]}>{erro ?? 'Produto não encontrado.'}</Text>
        </View>
      ) : (
        <View style={styles.conteudo}>
          <FotoProduto produto={produto} style={styles.capa} icone={48} />
          <View style={[styles.painel, { backgroundColor: cores.superficie }]}>
            <View style={styles.nomeLinha}>
              <Text style={[styles.nome, { color: cores.texto }]}>{produto.nome}</Text>
              <Pressable onPress={() => alternarFavorito(produto)} accessibilityLabel="Favoritar produto">
                <Heart
                  color={ehFavorito(produto.id) ? cores.perigo : cores.textoSuave}
                  fill={ehFavorito(produto.id) ? cores.perigo : 'transparent'}
                  size={22}
                />
              </Pressable>
            </View>
            <TextoVerde style={styles.preco}>{precoTexto(produto.preco_brl)}</TextoVerde>
            <View style={styles.chips}>
              <Text style={[styles.chip, { backgroundColor: cores.superficieAlt, color: cores.texto }]}>{produto.categoria}</Text>
              <Text style={[styles.chip, { backgroundColor: cores.superficieAlt, color: cores.textoSuave }]}>
                {produto.codigo_barras}
              </Text>
            </View>
            <Text style={[styles.nota, { color: cores.textoSuave }]}>
              O preço em dólar e euro aparece no carrinho, com a cotação do momento.
            </Text>
            {quantidade > 0 ? (
              <Text style={[styles.nota, { color: cores.texto }]}>
                {quantidade} {quantidade === 1 ? 'unidade no carrinho' : 'unidades no carrinho'}
              </Text>
            ) : null}
            <Pressable style={[styles.botao, { backgroundColor: cores.destaque }]} onPress={handleAdicionar}>
              <Plus color={cores.destaqueTexto} size={18} />
              <Text style={[styles.botaoTexto, { color: cores.destaqueTexto }]}>Adicionar ao carrinho</Text>
            </Pressable>
            {papel === 'operador' ? (
              <Pressable
                style={[styles.botao, { backgroundColor: cores.superficieAlt }]}
                onPress={() => router.push({ pathname: '/editor', params: { id: produto.id } })}
              >
                <Pencil color={cores.texto} size={18} />
                <Text style={[styles.botaoTexto, { color: cores.texto }]}>Editar produto</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  conteudo: { flex: 1, paddingHorizontal: 16, gap: 16 },
  capa: { height: 180, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  painel: { borderRadius: 24, padding: 18, gap: 10 },
  nomeLinha: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  nome: { flex: 1, fontSize: 22, fontWeight: '800' },
  preco: { fontSize: 26, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { overflow: 'hidden', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontWeight: '700' },
  nota: { fontSize: 14, lineHeight: 20 },
  erro: { textAlign: 'center', fontSize: 16 },
  botao: {
    marginTop: 8,
    minHeight: 54,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botaoTexto: { fontSize: 16, fontWeight: '800' },
})
