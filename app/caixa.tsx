import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera'
import { router } from 'expo-router'
import { ArrowLeft, Menu, ShoppingCart } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BarraInferior from '../components/BarraInferior'
import TextoVerde from '../components/TextoVerde'
import { useCarrinho } from '../context/CarrinhoContext'
import { usePainel } from '../context/PainelContext'
import { useTema } from '../context/TemaContext'
import { buscarProdutoPorCodigo } from '../services/firebase'

const TIPOS_DE_CODIGO = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] as const
const TEMPO_DE_LIBERACAO_MS = 1500

type Feedback = {
  tipo: 'sucesso' | 'erro'
  mensagem: string
}

export default function Caixa() {
  const insets = useSafeAreaInsets()
  const [permission, requestPermission] = useCameraPermissions()
  const [travado, setTravado] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const travadoRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { quantidadeTotal, adicionarItem } = useCarrinho()
  const { cores } = useTema()
  const { abrir } = usePainel()

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    // A trava real é a ref: setState é assíncrono e a CameraView pode chamar
    // onBarcodeScanned várias vezes antes do próximo render aplicar `travado`.
    if (travadoRef.current) return
    travadoRef.current = true
    setTravado(true)
    try {
      const produto = await buscarProdutoPorCodigo(data)
      if (produto) {
        adicionarItem(produto)
        setFeedback({ tipo: 'sucesso', mensagem: 'Produto adicionado' })
      } else {
        setFeedback({ tipo: 'erro', mensagem: 'Produto não cadastrado' })
      }
    } catch (e) {
      console.error('Erro ao consultar produto:', e)
      setFeedback({ tipo: 'erro', mensagem: 'Não foi possível consultar o produto' })
    } finally {
      timerRef.current = setTimeout(() => {
        travadoRef.current = false
        setTravado(false)
        setFeedback(null)
      }, TEMPO_DE_LIBERACAO_MS)
    }
  }

  if (!permission) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centro, { backgroundColor: cores.fundo }]}>
        <Text style={[styles.permissaoTexto, { color: cores.texto }]}>
          Precisamos da sua permissão para usar a câmera e escanear os produtos.
        </Text>
        <Pressable style={[styles.botaoPermissao, { backgroundColor: cores.destaque }]} onPress={requestPermission}>
          <Text style={[styles.botaoPermissaoTexto, { color: cores.destaqueTexto }]}>Permitir acesso à câmera</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/inicio')}>
          <TextoVerde style={styles.linkInicio}>Voltar ao início</TextoVerde>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo, paddingTop: insets.top + 8 }]}>
      <View style={styles.topo}>
        <Pressable style={[styles.botaoMenu, { backgroundColor: cores.superficie, borderColor: cores.linha }]} onPress={() => router.back()} accessibilityLabel="Voltar">
          <ArrowLeft color={cores.texto} size={20} />
        </Pressable>
        <Text style={[styles.titulo, { color: cores.texto }]}>Escanear</Text>
        <Pressable style={[styles.botaoMenu, { backgroundColor: cores.superficie, borderColor: cores.linha }]} onPress={abrir} accessibilityLabel="Abrir configurações">
          <Menu color={cores.texto} size={20} />
        </Pressable>
      </View>

      <View style={[styles.janela, { backgroundColor: '#000' }]}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: [...TIPOS_DE_CODIGO] }}
          onBarcodeScanned={travado ? undefined : handleBarcodeScanned}
        />
        {feedback ? (
          <View style={[styles.feedback, feedback.tipo === 'erro' && styles.feedbackErro]}>
            <Text style={styles.feedbackTexto}>{feedback.mensagem}</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.dica, { color: cores.textoSuave }]}>Encaixe o código na janela.</Text>

      {quantidadeTotal > 0 ? (
        <Pressable style={[styles.botaoCarrinho, { backgroundColor: cores.destaque }]} onPress={() => router.push('/carrinho')}>
          <ShoppingCart color={cores.destaqueTexto} size={20} />
          <Text style={[styles.botaoCarrinhoTexto, { color: cores.destaqueTexto }]}>
            Ver carrinho ({quantidadeTotal})
          </Text>
        </Pressable>
      ) : (
        <Text style={[styles.dica, { color: cores.textoSuave }]}>O carrinho aparece aqui depois do primeiro produto.</Text>
      )}
      <BarraInferior />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 14,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titulo: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
  },
  janela: {
    height: 320,
    borderRadius: 28,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  dica: {
    textAlign: 'center',
    fontSize: 14,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  permissaoTexto: {
    textAlign: 'center',
    fontSize: 16,
  },
  botaoPermissao: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  botaoPermissaoTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkInicio: {
    fontWeight: 'bold',
  },
  botaoMenu: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedback: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(39,174,96,0.92)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  feedbackErro: {
    backgroundColor: 'rgba(192,57,43,0.9)',
  },
  feedbackTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  botaoCarrinho: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  botaoCarrinhoTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})
