import { router, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import BarraApp from '../components/BarraApp'
import FotoProduto from '../components/FotoProduto'
import TextoVerde from '../components/TextoVerde'
import { usePapel } from '../context/PapelContext'
import { useTema } from '../context/TemaContext'
import { buscarProdutoPorId, excluirProduto, salvarProduto } from '../services/firebase'

const CATEGORIAS = ['Bebida', 'Comida', 'Lembrança', 'Vestuário', 'Outros']

export default function EditorProduto() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const { cores } = useTema()
  const { papel, pronto } = usePapel()
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [codigo, setCodigo] = useState('')
  const [categoria, setCategoria] = useState('Lembrança')
  const [foto, setFoto] = useState<string | undefined>(undefined)
  const [carregando, setCarregando] = useState(Boolean(id))
  const [salvando, setSalvando] = useState(false)
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (pronto && papel !== 'operador') router.replace('/inicio')
  }, [papel, pronto])

  useEffect(() => {
    if (!id) return
    const carregar = async () => {
      try {
        const produto = await buscarProdutoPorId(id)
        if (!produto) {
          setErro('Produto não encontrado.')
          return
        }
        setNome(produto.nome)
        setPreco(Number(produto.preco_brl).toFixed(2).replace('.', ','))
        setCodigo(produto.codigo_barras)
        setCategoria(produto.categoria)
        setFoto(produto.foto)
      } catch (e) {
        console.error('[editor] falha ao abrir:', e)
        setErro('Não foi possível abrir o produto.')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [id])

  const escolherFoto = async () => {
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
    setFoto(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri)
    setErro(null)
  }

  const salvar = async () => {
    const valor = Number(preco.replace(',', '.'))
    if (!nome.trim() || !codigo.trim() || !categoria.trim()) {
      setErro('Preencha nome, preço, código e categoria.')
      return
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      setErro('O preço precisa ser maior que zero.')
      return
    }
    setErro(null)
    setSalvando(true)
    try {
      await salvarProduto({
        id,
        nome,
        preco_brl: Math.round(valor * 100) / 100,
        codigo_barras: codigo,
        categoria,
        foto,
      })
      router.replace('/produtos')
    } catch (e) {
      console.error('[editor] falha ao salvar:', e)
      setErro('Não foi possível salvar o produto.')
      setSalvando(false)
    }
  }

  const excluir = async () => {
    if (!id || salvando) return
    setErro(null)
    setSalvando(true)
    try {
      await excluirProduto(Array.isArray(id) ? id[0] : id)
      router.replace('/produtos')
    } catch (e) {
      console.error('[editor] falha ao excluir:', e)
      setErro('Não foi possível excluir o produto.')
      setSalvando(false)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <BarraApp titulo={id ? 'Editar produto' : 'Novo produto'} />
      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={cores.destaque} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
          <FotoProduto produto={{ nome: nome || 'Produto', categoria, foto }} style={styles.capa} icone={42} />
          <Pressable style={[styles.secundario, { borderColor: cores.destaque }]} onPress={escolherFoto}>
            <TextoVerde style={styles.secundarioTexto}>Escolher foto</TextoVerde>
          </Pressable>
          {foto ? (
            <Pressable onPress={() => setFoto(undefined)}>
              <Text style={[styles.link, { color: cores.textoSuave }]}>Usar a foto sugerida pelo nome</Text>
            </Pressable>
          ) : (
            <Text style={[styles.ajuda, { color: cores.textoSuave }]}>
              Sem foto própria, o app usa uma imagem da internet de acordo com o nome.
            </Text>
          )}

          <TextInput
            style={[styles.input, { color: cores.texto, borderColor: cores.linha, backgroundColor: cores.superficie }]}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome"
            placeholderTextColor={cores.textoSuave}
          />
          <TextInput
            style={[styles.input, { color: cores.texto, borderColor: cores.linha, backgroundColor: cores.superficie }]}
            value={preco}
            onChangeText={setPreco}
            placeholder="Preço em reais"
            placeholderTextColor={cores.textoSuave}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={[styles.input, { color: cores.texto, borderColor: cores.linha, backgroundColor: cores.superficie }]}
            value={codigo}
            onChangeText={setCodigo}
            placeholder="Código de barras"
            placeholderTextColor={cores.textoSuave}
          />
          <View style={styles.chips}>
            {CATEGORIAS.map((item) => {
              const ativa = categoria === item
              return (
                <Pressable
                  key={item}
                  style={[styles.chip, { backgroundColor: ativa ? cores.destaque : cores.superficie, borderColor: cores.linha }]}
                  onPress={() => setCategoria(item)}
                >
                  <Text style={{ color: ativa ? cores.destaqueTexto : cores.texto, fontWeight: '700' }}>{item}</Text>
                </Pressable>
              )
            })}
          </View>
          <TextInput
            style={[styles.input, { color: cores.texto, borderColor: cores.linha, backgroundColor: cores.superficie }]}
            value={categoria}
            onChangeText={setCategoria}
            placeholder="Categoria"
            placeholderTextColor={cores.textoSuave}
          />

          {erro ? <Text style={[styles.erro, { color: cores.perigo }]}>{erro}</Text> : null}

          <Pressable style={[styles.botao, { backgroundColor: cores.destaque, opacity: salvando ? 0.7 : 1 }]} onPress={salvar} disabled={salvando}>
            {salvando ? <ActivityIndicator color={cores.destaqueTexto} /> : <Text style={[styles.botaoTexto, { color: cores.destaqueTexto }]}>Salvar produto</Text>}
          </Pressable>
          {id && confirmarExclusao ? (
            <View style={[styles.confirma, { backgroundColor: cores.superficie, borderColor: cores.linha }]}>
              <Text style={[styles.confirmaTexto, { color: cores.texto }]}>Excluir este produto da vitrine?</Text>
              <View style={styles.confirmaAcoes}>
                <Pressable style={[styles.confirmaBotao, { borderColor: cores.linha }]} onPress={() => setConfirmarExclusao(false)} disabled={salvando}>
                  <Text style={[styles.confirmaRotulo, { color: cores.texto }]}>Cancelar</Text>
                </Pressable>
                <Pressable style={[styles.confirmaBotao, { backgroundColor: cores.perigo, borderColor: cores.perigo }]} onPress={excluir} disabled={salvando}>
                  {salvando ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.confirmaRotulo, { color: '#FFFFFF' }]}>Excluir</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : id ? (
            <Pressable onPress={() => setConfirmarExclusao(true)} disabled={salvando}>
              <Text style={[styles.link, { color: cores.perigo }]}>Excluir produto</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  conteudo: { padding: 16, paddingBottom: 40, gap: 12 },
  capa: { height: 180, borderRadius: 24 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  botao: { minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  botaoTexto: { fontSize: 16, fontWeight: '800' },
  secundario: { borderWidth: 1, borderRadius: 14, minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  secundarioTexto: { fontWeight: '800' },
  ajuda: { fontSize: 13, lineHeight: 18 },
  link: { textAlign: 'center', fontWeight: '700' },
  confirma: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 12 },
  confirmaTexto: { textAlign: 'center', fontWeight: '800' },
  confirmaAcoes: { flexDirection: 'row', gap: 8 },
  confirmaBotao: { flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  confirmaRotulo: { fontWeight: '800' },
  erro: { textAlign: 'center' },
})
