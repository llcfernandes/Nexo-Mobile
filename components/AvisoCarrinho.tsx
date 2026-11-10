import { ShoppingCart } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCarrinho } from '../context/CarrinhoContext'
import { useTema } from '../context/TemaContext'

export default function AvisoCarrinho() {
  const { aviso } = useCarrinho()
  const { cores } = useTema()
  const insets = useSafeAreaInsets()
  const opacidade = useRef(new Animated.Value(0)).current
  const deslocamento = useRef(new Animated.Value(-28)).current
  const escala = useRef(new Animated.Value(0.92)).current

  useEffect(() => {
    if (!aviso) return
    opacidade.setValue(0)
    deslocamento.setValue(-28)
    escala.setValue(0.92)
    const entrada = Animated.parallel([
      Animated.spring(deslocamento, { toValue: 0, friction: 7, useNativeDriver: true }),
      Animated.spring(escala, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(opacidade, { toValue: 1, duration: 180, useNativeDriver: true }),
    ])
    const saida = Animated.timing(opacidade, { toValue: 0, duration: 280, useNativeDriver: true })
    entrada.start()
    const timer = setTimeout(() => saida.start(), 1500)
    return () => {
      clearTimeout(timer)
      entrada.stop()
      saida.stop()
    }
  }, [aviso, deslocamento, escala, opacidade])

  if (!aviso) return null

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.aviso,
        {
          top: insets.top + 12,
          backgroundColor: cores.destaque,
          opacity: opacidade,
          transform: [{ translateY: deslocamento }, { scale: escala }],
        },
      ]}
    >
      <ShoppingCart color={cores.destaqueTexto} size={18} />
      <Text style={[styles.texto, { color: cores.destaqueTexto }]} numberOfLines={1}>
        {aviso.nome} entrou no carrinho
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  aviso: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 70,
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  texto: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
})
