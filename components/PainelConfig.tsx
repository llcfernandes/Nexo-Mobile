import Constants from 'expo-constants'
import { router } from 'expo-router'
import { Moon, Store, Sun, Trash2, UserRound, X } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCarrinho } from '../context/CarrinhoContext'
import { usePainel } from '../context/PainelContext'
import { usePapel } from '../context/PapelContext'
import { useTema } from '../context/TemaContext'

export default function PainelConfig() {
  const { aberto, fechar } = usePainel()
  const { tema, cores, alternarTema } = useTema()
  const { papel, definirPapel } = usePapel()
  const { itens, limparCarrinho } = useCarrinho()
  const insets = useSafeAreaInsets()
  const progresso = useRef(new Animated.Value(0)).current
  const versao = Constants.expoConfig?.version ?? '1.0.0'

  useEffect(() => {
    Animated.timing(progresso, {
      toValue: aberto ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [aberto, progresso])

  const limpar = () => {
    limparCarrinho()
    fechar()
  }

  return (
    <View
      style={styles.cobertura}
      pointerEvents={aberto ? 'auto' : 'none'}
      accessibilityElementsHidden={!aberto}
      importantForAccessibility={aberto ? 'auto' : 'no-hide-descendants'}
    >
      <Animated.View style={[styles.velo, { opacity: progresso, backgroundColor: cores.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={fechar} accessibilityLabel="Fechar configurações" />
      </Animated.View>
      <Animated.View
        style={[
          styles.painel,
          {
            backgroundColor: cores.superficie,
            paddingTop: insets.top + 18,
            paddingBottom: insets.bottom + 18,
            transform: [
              {
                translateX: progresso.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-320, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.cabecalho}>
          <Text style={[styles.titulo, { color: cores.texto }]}>Configurações</Text>
          <Pressable onPress={fechar} accessibilityLabel="Fechar">
            <X color={cores.texto} size={22} />
          </Pressable>
        </View>

        <Pressable
          style={styles.item}
          onPress={() => {
            definirPapel(papel === 'cliente' ? 'operador' : 'cliente')
            fechar()
            router.replace('/inicio')
          }}
        >
          {papel === 'cliente' ? <Store color={cores.destaque} size={20} /> : <UserRound color={cores.texto} size={20} />}
          <View style={styles.textos}>
            <Text style={[styles.itemTitulo, { color: cores.texto }]}>
              {papel === 'cliente' ? 'Entrar como operador' : 'Entrar como cliente'}
            </Text>
            <Text style={[styles.itemSub, { color: cores.textoSuave }]}>
              {papel === 'cliente' ? 'Agora você está comprando' : 'Agora você cuida da loja'}
            </Text>
          </View>
        </Pressable>

        <Pressable style={styles.item} onPress={alternarTema}>
          {tema === 'claro' ? <Moon color={cores.texto} size={20} /> : <Sun color={cores.destaque} size={20} />}
          <View style={styles.textos}>
            <Text style={[styles.itemTitulo, { color: cores.texto }]}>{tema === 'claro' ? 'Tema escuro' : 'Tema claro'}</Text>
            <Text style={[styles.itemSub, { color: cores.textoSuave }]}>A escolha fica salva neste aparelho</Text>
          </View>
        </Pressable>

        <Pressable style={styles.item} onPress={limpar} disabled={itens.length === 0}>
          <Trash2 color={itens.length === 0 ? cores.textoSuave : cores.perigo} size={20} />
          <View style={styles.textos}>
            <Text style={[styles.itemTitulo, { color: itens.length === 0 ? cores.textoSuave : cores.texto }]}>Limpar carrinho</Text>
            <Text style={[styles.itemSub, { color: cores.textoSuave }]}>
              {itens.length === 0 ? 'O carrinho já está vazio' : 'Remove os itens do carrinho'}
            </Text>
          </View>
        </Pressable>

        <Text style={[styles.versao, { color: cores.textoSuave }]}>NEXO Mobile {versao}</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  cobertura: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
  },
  velo: {
    ...StyleSheet.absoluteFillObject,
  },
  painel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    paddingHorizontal: 18,
    gap: 8,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  itemTitulo: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 13,
  },
  versao: {
    marginTop: 'auto',
    fontSize: 13,
  },
})
