import { router, useRootNavigationState } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FundoDegrade from '../components/FundoDegrade'
import TextoVerde from '../components/TextoVerde'
import { useTema } from '../context/TemaContext'
import { observarSessao } from '../services/auth'

const EQUIPE = ['Lucas', 'Douglas', 'Freitas', 'Diego', 'Gabriel']

export default function BoasVindas() {
  const { tema, cores } = useTema()
  const insets = useSafeAreaInsets()
  const navegadorPronto = Boolean(useRootNavigationState()?.key)
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    if (!navegadorPronto) return
    return observarSessao((user) => {
      if (!user) {
        router.replace('/login')
        return
      }
      setPronto(true)
    })
  }, [navegadorPronto])

  if (!pronto) {
    return (
      <View style={[styles.espera, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color={cores.destaque} />
      </View>
    )
  }

  return (
    <View style={[styles.tela, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 }]}>
      <FundoDegrade />
      <StatusBar style={tema === 'escuro' ? 'light' : 'dark'} />
      <View style={styles.centro}>
        <Text style={[styles.logo, { color: cores.texto }]}>
          NEXO<TextoVerde>.</TextoVerde>
        </Text>
        <Text style={[styles.boas, { color: cores.texto }]}>Bem-vindo</Text>
        <Text style={[styles.equipe, { color: cores.textoSuave }]}>{EQUIPE.join('  ·  ')}</Text>
      </View>
      <Pressable style={[styles.botao, { backgroundColor: cores.destaque }]} onPress={() => router.replace('/inicio')}>
        <Text style={[styles.botaoTexto, { color: cores.destaqueTexto }]}>Continuar</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  espera: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tela: { flex: 1, paddingHorizontal: 24 },
  centro: { flex: 1, justifyContent: 'center' },
  logo: { fontSize: 48, fontWeight: '800', letterSpacing: -1 },
  boas: { marginTop: 18, fontSize: 32, fontWeight: '800' },
  equipe: { marginTop: 16, fontSize: 15, fontWeight: '700', lineHeight: 24 },
  botao: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  botaoTexto: { fontSize: 16, fontWeight: '800' },
})
