import { router } from 'expo-router'
import { Heart, Plus } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import BarraApp from '../components/BarraApp'
import BarraInferior from '../components/BarraInferior'
import FotoProduto from '../components/FotoProduto'
import TextoVerde from '../components/TextoVerde'
import { useCarrinho } from '../context/CarrinhoContext'
import { useFavoritos, type Favorito } from '../context/FavoritosContext'
import { useTema } from '../context/TemaContext'
import { observarSessao } from '../services/auth'
import type { Produto } from '../types'

const comoProduto = (item: Favorito): Produto => ({
  id: item.id,
  nome: item.nome,
  preco_brl: item.preco_brl,
  categoria: item.categoria,
  foto: item.foto,
  codigo_barras: '',
})

export default function Favoritos() {
  const { cores } = useTema()
  const { favoritos, alternarFavorito } = useFavoritos()
  const { adicionarItem } = useCarrinho()
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    return observarSessao((user) => {
      if (!user) {
        router.replace('/login')
        return
      }
      setPronto(true)
    })
  }, [])

  if (!pronto) return <View style={[styles.container, { backgroundColor: cores.fundo }]} />

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <BarraApp titulo="Favoritos" />
      {favoritos.length === 0 ? (
        <View style={styles.vazio}>
          <Heart color={cores.textoSuave} size={28} />
          <Text style={[styles.vazioTexto, { color: cores.textoSuave }]}>
            Nenhum favorito ainda. O coração fica no produto.
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.lista}
          contentContainerStyle={styles.listaConteudo}
          data={favoritos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable style={[styles.card, { backgroundColor: cores.superficie }]} onPress={() => router.push(`/produto/${item.id}`)}>
              <FotoProduto produto={item} style={styles.foto} icone={22} />
              <View style={styles.info}>
                <Text style={[styles.nome, { color: cores.texto }]} numberOfLines={2}>
                  {item.nome}
                </Text>
                <Text style={[styles.detalhe, { color: cores.textoSuave }]} numberOfLines={1}>
                  {item.categoria}
                </Text>
                <TextoVerde style={styles.preco}>R$ {Number(item.preco_brl).toFixed(2)}</TextoVerde>
              </View>
              <Pressable
                style={[styles.acao, { backgroundColor: cores.superficieAlt }]}
                onPress={() => alternarFavorito(item)}
                accessibilityLabel="Tirar dos favoritos"
              >
                <Heart color={cores.perigo} fill={cores.perigo} size={16} />
              </Pressable>
              <Pressable
                style={[styles.acao, { backgroundColor: cores.destaque }]}
                onPress={() => adicionarItem(comoProduto(item))}
                accessibilityLabel="Adicionar ao carrinho"
              >
                <Plus color={cores.destaqueTexto} size={16} />
              </Pressable>
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
  lista: { flex: 1 },
  listaConteudo: { padding: 16, paddingBottom: 120, gap: 12 },
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 10 },
  vazioTexto: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, padding: 12 },
  foto: { width: 72, height: 72, borderRadius: 16 },
  info: { flex: 1, gap: 3 },
  nome: { fontSize: 15, fontWeight: '800' },
  detalhe: { fontSize: 12 },
  preco: { fontSize: 14, fontWeight: '800' },
  acao: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
})
