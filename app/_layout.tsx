import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AvisoCarrinho from '../components/AvisoCarrinho'
import MolduraCelular from '../components/MolduraCelular'
import PainelConfig from '../components/PainelConfig'
import { CarrinhoProvider } from '../context/CarrinhoContext'
import { FavoritosProvider } from '../context/FavoritosContext'
import { PainelProvider } from '../context/PainelContext'
import { PapelProvider } from '../context/PapelContext'
import { TemaProvider, useTema } from '../context/TemaContext'

function Casco() {
  const { tema, cores } = useTema()

  return (
    <MolduraCelular>
      <View style={{ flex: 1, backgroundColor: cores.fundo }}>
        <StatusBar style={tema === 'escuro' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }} />
        <PainelConfig />
        <AvisoCarrinho />
      </View>
    </MolduraCelular>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TemaProvider>
        <CarrinhoProvider>
          <FavoritosProvider>
            <PapelProvider>
              <PainelProvider>
                <Casco />
              </PainelProvider>
            </PapelProvider>
          </FavoritosProvider>
        </CarrinhoProvider>
      </TemaProvider>
    </SafeAreaProvider>
  )
}
