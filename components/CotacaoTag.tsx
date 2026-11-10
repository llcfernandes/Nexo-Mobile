import { StyleSheet, Text, View } from 'react-native'
import { useTema } from '../context/TemaContext'

type Props = {
  moeda: string
  valor: string
}

export default function CotacaoTag({ moeda, valor }: Props) {
  const { cores } = useTema()

  return (
    <View style={[styles.container, { backgroundColor: cores.superficieAlt }]}>
      <Text style={[styles.moeda, { color: cores.textoSuave }]}>{moeda}</Text>
      <Text style={[styles.valor, { color: cores.texto }]}>{valor}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 80,
  },
  moeda: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  valor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})
