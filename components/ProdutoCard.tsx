import { Minus, Plus } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import FotoProduto from './FotoProduto'
import { useTema } from '../context/TemaContext'
import type { ItemCarrinho } from '../types'

type Props = {
  item: ItemCarrinho
  onMais: (produtoId: string) => void
  onMenos: (produtoId: string) => void
}

export default function ProdutoCard({ item, onMais, onMenos }: Props) {
  const { cores } = useTema()
  const total = item.preco_brl * item.quantidade

  return (
    <View style={[styles.container, { backgroundColor: cores.superficie }]}>
      <FotoProduto
        produto={{ nome: item.nome, categoria: item.categoria ?? '', foto: item.foto }}
        style={styles.foto}
        icone={22}
      />
      <View style={styles.info}>
        <Text style={[styles.nome, { color: cores.texto }]} numberOfLines={2}>
          {item.nome}
        </Text>
        <Text style={[styles.detalhe, { color: cores.textoSuave }]}>
          {item.quantidade} un · R$ {item.preco_brl.toFixed(2)}
        </Text>
        <View style={[styles.passo, { backgroundColor: cores.superficieAlt }]}>
          <Pressable style={styles.passoBotao} onPress={() => onMenos(item.produto_id)} accessibilityLabel="Diminuir quantidade">
            <Minus color={cores.texto} size={14} />
          </Pressable>
          <Text style={[styles.quantidade, { color: cores.texto }]}>{item.quantidade}</Text>
          <Pressable
            style={[styles.passoBotao, styles.mais, { backgroundColor: cores.destaque }]}
            onPress={() => onMais(item.produto_id)}
            accessibilityLabel="Aumentar quantidade"
          >
            <Plus color={cores.destaqueTexto} size={14} />
          </Pressable>
        </View>
      </View>
      <Text style={[styles.total, { color: cores.texto }]}>R$ {total.toFixed(2)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 12,
  },
  foto: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nome: {
    fontSize: 15,
    fontWeight: '800',
  },
  detalhe: {
    fontSize: 12,
  },
  passo: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 3,
    gap: 4,
  },
  passoBotao: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mais: {},
  quantidade: {
    minWidth: 16,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
  },
  total: {
    fontSize: 14,
    fontWeight: '800',
  },
})
