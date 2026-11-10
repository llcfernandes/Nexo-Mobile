import { Package } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { fotoSugerida } from '../constants/fotos'
import { useTema } from '../context/TemaContext'
import type { Produto } from '../types'

type Props = {
  produto: Pick<Produto, 'nome' | 'categoria' | 'foto'>
  style?: StyleProp<ViewStyle>
  icone?: number
}

export default function FotoProduto({ produto, style, icone = 28 }: Props) {
  const { cores } = useTema()
  const [falhou, setFalhou] = useState(false)
  const uri = produto.foto || fotoSugerida(produto)

  useEffect(() => {
    setFalhou(false)
  }, [uri])

  return (
    <View style={[styles.base, { backgroundColor: cores.superficieAlt }, style]}>
      {!falhou ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setFalhou(true)} />
      ) : (
        <Package color={cores.destaque} size={icone} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
