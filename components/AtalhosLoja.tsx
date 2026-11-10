import { router } from 'expo-router'
import { Heart, ShoppingCart } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useCarrinho } from '../context/CarrinhoContext'
import { useFavoritos } from '../context/FavoritosContext'
import { useTema } from '../context/TemaContext'

export default function AtalhosLoja() {
  const { cores } = useTema()
  const { quantidadeTotal } = useCarrinho()
  const { favoritos } = useFavoritos()
  const totalFavoritos = favoritos.length

  return (
    <View style={styles.par}>
      <Pressable
        style={[styles.botao, { backgroundColor: cores.superficie, borderColor: cores.linha }]}
        onPress={() => router.push('/favoritos')}
        accessibilityLabel="Abrir favoritos"
      >
        <Heart
          color={totalFavoritos > 0 ? cores.perigo : cores.texto}
          fill={totalFavoritos > 0 ? cores.perigo : 'transparent'}
          size={18}
        />
        {totalFavoritos > 0 ? (
          <View style={[styles.selo, { backgroundColor: cores.perigo }]}>
            <Text style={styles.seloTexto}>{totalFavoritos > 9 ? '9+' : totalFavoritos}</Text>
          </View>
        ) : null}
      </Pressable>
      <Pressable
        style={[styles.botao, { backgroundColor: quantidadeTotal > 0 ? cores.destaque : cores.superficie, borderColor: quantidadeTotal > 0 ? cores.destaque : cores.linha }]}
        onPress={() => router.push('/carrinho')}
        accessibilityLabel="Abrir carrinho"
      >
        <ShoppingCart color={quantidadeTotal > 0 ? cores.destaqueTexto : cores.texto} size={18} />
        {quantidadeTotal > 0 ? (
          <View style={[styles.selo, { backgroundColor: cores.fundo }]}>
            <Text style={[styles.seloTexto, { color: cores.texto }]}>{quantidadeTotal > 9 ? '9+' : quantidadeTotal}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  par: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botao: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selo: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  seloTexto: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
})
