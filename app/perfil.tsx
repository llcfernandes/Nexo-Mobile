import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Camera, ChevronRight, Heart, LogOut } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import BarraApp from '../components/BarraApp'
import BarraInferior from '../components/BarraInferior'
import { useFavoritos } from '../context/FavoritosContext'
import { usePapel } from '../context/PapelContext'
import { useTema } from '../context/TemaContext'
import { logout, observarSessao } from '../services/auth'
import { auth } from '../services/firebase'
import { resumirVendas } from '../services/vendas'

const chaveFoto = (uid: string) => `nexo-foto:${uid}`

export default function Perfil() {
  const { cores } = useTema()
  const { papel } = usePapel()
  const { favoritos } = useFavoritos()
  const cliente = papel === 'cliente'
  const [email, setEmail] = useState<string | null>(null)
  const [uid, setUid] = useState<string | null>(null)
  const [foto, setFoto] = useState<string | null>(null)
  const [pronto, setPronto] = useState(false)
  const [saindo, setSaindo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resumo, setResumo] = useState({ quantidade: 0, totalBRL: 0 })
  const [carregandoResumo, setCarregandoResumo] = useState(true)

  useEffect(() => {
    const unsubscribe = observarSessao((user) => {
      if (!user) {
        router.replace('/login')
        return
      }
      setEmail(user.email)
      setUid(user.uid)
      setPronto(true)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!uid) return
    const carregar = async () => {
      try {
        const salva = await AsyncStorage.getItem(chaveFoto(uid))
        setFoto(salva)
      } catch (e) {
        console.error('[perfil] falha ao ler foto:', e)
      }
      setCarregandoResumo(true)
      try {
        setResumo(await resumirVendas(uid))
      } catch (e) {
        console.error('[perfil] falha ao resumir vendas:', e)
        setErro('Não foi possível carregar as vendas.')
      } finally {
        setCarregandoResumo(false)
      }
    }
    carregar()
  }, [uid])

  const escolherFoto = async () => {
    setErro(null)
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissao.granted) {
      setErro('Permita o acesso às fotos para escolher a imagem.')
      return
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    })
    if (resultado.canceled || !resultado.assets[0]) return
    const asset = resultado.assets[0]
    const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri
    const operador = auth.currentUser?.uid
    if (!operador) return
    try {
      await AsyncStorage.setItem(chaveFoto(operador), uri)
      setFoto(uri)
    } catch (e) {
      console.error('[perfil] falha ao salvar foto:', e)
      setErro('Não foi possível salvar a foto.')
    }
  }

  const apagarFoto = async () => {
    if (!uid) return
    setErro(null)
    try {
      await AsyncStorage.removeItem(chaveFoto(uid))
      setFoto(null)
    } catch (e) {
      console.error('[perfil] falha ao apagar foto:', e)
      setErro('Não foi possível apagar a foto.')
    }
  }

  const handleSair = async () => {
    setErro(null)
    setSaindo(true)
    try {
      await logout()
      router.replace('/login')
    } catch (e) {
      console.error('[perfil] falha ao sair:', e)
      setErro('Não foi possível sair. Tente novamente.')
      setSaindo(false)
    }
  }

  const letra = (email ?? 'N').charAt(0).toUpperCase()
  const totalTexto = `R$ ${resumo.totalBRL.toFixed(2)}`

  if (!pronto) {
    return (
      <View style={[styles.centro, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color={cores.destaque} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <BarraApp titulo="Perfil" voltar={false} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Pressable onPress={escolherFoto} accessibilityLabel="Escolher foto de perfil">
          <View style={[styles.avatar, { backgroundColor: cores.destaque }]}>
            {foto ? <Image source={{ uri: foto }} style={styles.foto} /> : <Text style={[styles.letra, { color: cores.destaqueTexto }]}>{letra}</Text>}
          </View>
          <View style={[styles.badge, { backgroundColor: cores.superficie, borderColor: cores.linha }]}>
            <Camera color={cores.texto} size={14} />
          </View>
        </Pressable>
        <Text style={[styles.nome, { color: cores.texto }]}>{email ?? 'Sem e-mail'}</Text>
        <Text style={[styles.cargo, { color: cores.textoSuave }]}>{cliente ? 'Cliente' : 'Operador'}</Text>
        {foto ? (
          <Pressable onPress={apagarFoto} accessibilityLabel="Remover foto de perfil">
            <Text style={[styles.remover, { color: cores.perigo }]}>Remover foto</Text>
          </Pressable>
        ) : null}

        <View style={styles.stats}>
          <View style={[styles.stat, { backgroundColor: cores.destaque }]}>
            <Text style={[styles.statValor, { color: cores.destaqueTexto }]}>{carregandoResumo ? '…' : resumo.quantidade}</Text>
            <Text style={[styles.statRotulo, { color: cores.destaqueTexto }]}>{cliente ? 'Compras' : 'Vendas'}</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: cores.destaque }]}>
            <Text style={[styles.statValor, { color: cores.destaqueTexto }]}>{favoritos.length}</Text>
            <Text style={[styles.statRotulo, { color: cores.destaqueTexto }]}>Favoritos</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: cores.destaque }]}>
            <Text style={[styles.statValor, { color: cores.destaqueTexto }]} numberOfLines={1}>
              {carregandoResumo ? '…' : totalTexto}
            </Text>
            <Text style={[styles.statRotulo, { color: cores.destaqueTexto }]}>Total</Text>
          </View>
        </View>

        <Text style={[styles.secao, { color: cores.texto }]}>Favoritos</Text>
        {favoritos.length === 0 ? (
          <Text style={[styles.vazio, { color: cores.textoSuave }]}>Nenhum produto favoritado ainda. O coração fica no produto.</Text>
        ) : (
          favoritos.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.linha, { borderBottomColor: cores.linha }]}
              onPress={() => router.push(`/produto/${item.id}`)}
            >
              <Heart color={cores.perigo} fill={cores.perigo} size={18} />
              <View style={styles.linhaTexto}>
                <Text style={[styles.linhaNome, { color: cores.texto }]}>{item.nome}</Text>
                <Text style={[styles.linhaSub, { color: cores.textoSuave }]}>R$ {Number(item.preco_brl).toFixed(2)}</Text>
              </View>
              <ChevronRight color={cores.textoSuave} size={18} />
            </Pressable>
          ))
        )}

        {erro ? <Text style={[styles.erro, { color: cores.perigo }]}>{erro}</Text> : null}

        <Pressable style={[styles.linha, { borderBottomColor: cores.linha }]} onPress={handleSair} disabled={saindo}>
          <LogOut color={cores.perigo} size={18} />
          <Text style={[styles.linhaNome, { color: cores.perigo, flex: 1 }]}>{saindo ? 'Saindo...' : 'Sair'}</Text>
        </Pressable>
      </ScrollView>
      <BarraInferior />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  conteudo: { paddingHorizontal: 20, paddingBottom: 120, alignItems: 'center' },
  avatar: { width: 108, height: 108, borderRadius: 54, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  foto: { width: 108, height: 108 },
  letra: { fontSize: 40, fontWeight: '800' },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: { marginTop: 14, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  cargo: { marginTop: 2, marginBottom: 16, fontSize: 14 },
  remover: { marginTop: -8, marginBottom: 16, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 8, alignSelf: 'stretch', marginBottom: 18 },
  stat: { flex: 1, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center', gap: 2 },
  statValor: { fontSize: 14, fontWeight: '800' },
  statRotulo: { fontSize: 11, fontWeight: '700' },
  secao: { alignSelf: 'stretch', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  vazio: { alignSelf: 'stretch', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  linha: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  linhaTexto: { flex: 1, gap: 2 },
  linhaNome: { fontSize: 15, fontWeight: '700' },
  linhaSub: { fontSize: 13 },
  erro: { marginTop: 8, textAlign: 'center' },
})
