import { useEffect, type ReactNode } from 'react'
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native'
import { useTema } from '../context/TemaContext'

const LARGURA_CELULAR = 430

type Props = {
  children: ReactNode
}

export default function MolduraCelular({ children }: Props) {
  const { width } = useWindowDimensions()
  const { cores } = useTema()
  const largura = Math.min(width, LARGURA_CELULAR)

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return
    const estilo = document.createElement('style')
    estilo.setAttribute('data-nexo-moldura', '1')
    estilo.textContent =
      'html,body,#root{height:100%;margin:0;}body{overflow:hidden;}*{scrollbar-width:none;-ms-overflow-style:none;}*::-webkit-scrollbar{display:none;width:0;height:0;}'
    document.head.appendChild(estilo)
    document.body.style.background = cores.fundo
    return () => {
      estilo.remove()
      document.body.style.background = ''
    }
  }, [cores.fundo])

  if (Platform.OS !== 'web') return children

  return (
    <View style={[styles.palco, { backgroundColor: cores.fundo }]}>
      <View style={[styles.celular, { width: largura, backgroundColor: cores.fundo }]}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  palco: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  celular: {
    height: '100%',
    overflow: 'hidden',
  },
})
