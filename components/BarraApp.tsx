import { router } from 'expo-router'
import { ArrowLeft, Menu } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePainel } from '../context/PainelContext'
import { useTema } from '../context/TemaContext'

type Props = {
  titulo: string
  voltar?: boolean
}

export default function BarraApp({ titulo, voltar = true }: Props) {
  const insets = useSafeAreaInsets()
  const { cores } = useTema()
  const { abrir } = usePainel()

  return (
    <View style={[styles.barra, { paddingTop: insets.top + 8 }]}>
      {voltar ? (
        <Pressable
          style={[styles.botao, { backgroundColor: cores.superficie, borderColor: cores.linha }]}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
        >
          <ArrowLeft color={cores.texto} size={20} />
        </Pressable>
      ) : (
        <View style={styles.espaco} />
      )}
      <Text style={[styles.titulo, { color: cores.texto }]} numberOfLines={1}>
        {titulo}
      </Text>
      <Pressable
        style={[styles.botao, { backgroundColor: cores.superficie, borderColor: cores.linha }]}
        onPress={abrir}
        accessibilityLabel="Abrir configurações"
      >
        <Menu color={cores.texto} size={20} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  botao: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  espaco: {
    width: 44,
    height: 44,
  },
  titulo: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
  },
})
