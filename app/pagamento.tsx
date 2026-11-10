import { router } from 'expo-router'
import { Apple, Banknote, CircleCheck, CreditCard, QrCode, Utensils } from 'lucide-react-native'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import BarraApp from '../components/BarraApp'
import BarraInferior from '../components/BarraInferior'
import TextoVerde from '../components/TextoVerde'
import { useCarrinho } from '../context/CarrinhoContext'
import { usePapel } from '../context/PapelContext'
import { useTema } from '../context/TemaContext'
import { buscarCotacoes } from '../services/exchange'
import { auth } from '../services/firebase'
import { registrarCompraLocal, salvarVenda } from '../services/vendas'
import type { FormaPagamento, Venda } from '../types'

const METODOS: { id: FormaPagamento; rotulo: string; Icone: typeof QrCode }[] = [
  { id: 'pix', rotulo: 'PIX', Icone: QrCode },
  { id: 'cartao', rotulo: 'Cartão', Icone: CreditCard },
  { id: 'vale_refeicao', rotulo: 'Vale refeição', Icone: Utensils },
  { id: 'vale_alimentacao', rotulo: 'Vale alimentação', Icone: Apple },
  { id: 'dinheiro', rotulo: 'Dinheiro', Icone: Banknote },
]

const rotulo = (forma: FormaPagamento) => METODOS.find((item) => item.id === forma)?.rotulo ?? 'Pagamento'

const dinheiro = (valor: number) => `R$ ${valor.toFixed(2)}`

function GradePix({ semente }: { semente: string }) {
  const celulas = useMemo(() => {
    let hash = 0
    for (let i = 0; i < semente.length; i += 1) hash = (hash * 33 + semente.charCodeAt(i)) >>> 0
    return Array.from({ length: 49 }, (_, indice) => {
      hash = (hash * 1664525 + 1013904223 + indice) >>> 0
      return ((hash >>> 8) & 1) === 1
    })
  }, [semente])

  return (
    <View style={styles.qr}>
      {celulas.map((ligado, indice) => (
        <View key={indice} style={[styles.celula, { backgroundColor: ligado ? '#111111' : '#F4F4F4' }]} />
      ))}
    </View>
  )
}

function NotificacaoOk({
  total,
  forma,
  onInicio,
  onOutro,
}: {
  total: string
  forma: string
  onInicio: () => void
  onOutro: () => void
}) {
  const { cores } = useTema()
  const opacidade = useRef(new Animated.Value(0)).current
  const escala = useRef(new Animated.Value(0.86)).current
  const subida = useRef(new Animated.Value(24)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(escala, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.spring(subida, { toValue: 0, friction: 7, useNativeDriver: true }),
      Animated.timing(opacidade, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start()
  }, [escala, opacidade, subida])

  return (
    <Animated.View style={{ opacity: opacidade, transform: [{ translateY: subida }, { scale: escala }] }}>
      <View style={[styles.sucessoCaixa, { backgroundColor: cores.destaque }]}>
        <View style={[styles.seloOk, { backgroundColor: cores.fundo }]}>
          <CircleCheck color={cores.destaque} size={42} />
        </View>
        <Text style={[styles.sucessoTitulo, { color: cores.destaqueTexto }]}>Pagamento aprovado</Text>
        <Text style={[styles.sucessoSub, { color: cores.destaqueTexto }]}>Está tudo certo</Text>
        <Text style={[styles.sucessoValor, { color: cores.destaqueTexto }]}>
          {total} · {forma}
        </Text>
        <Pressable style={[styles.botao, { backgroundColor: cores.fundo }]} onPress={onInicio}>
          <Text style={[styles.botaoTexto, { color: cores.texto }]}>Voltar ao início</Text>
        </Pressable>
        <Pressable onPress={onOutro}>
          <Text style={[styles.link, { color: cores.destaqueTexto }]}>Outro pagamento</Text>
        </Pressable>
      </View>
    </Animated.View>
  )
}

export default function Pagamento() {
  const { cores } = useTema()
  const { papel } = usePapel()
  const { itens, totalBRL, limparCarrinho } = useCarrinho()
  const [metodo, setMetodo] = useState<FormaPagamento>('pix')
  const [valorSimulado, setValorSimulado] = useState('25,00')
  const [numero, setNumero] = useState('')
  const [nome, setNome] = useState('')
  const [validade, setValidade] = useState('')
  const [cvv, setCvv] = useState('')
  const [codigoVale, setCodigoVale] = useState('')
  const [recebido, setRecebido] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)
  const [pago, setPago] = useState(false)
  const [cotacaoUSD, setCotacaoUSD] = useState(0)
  const [cotacaoEUR, setCotacaoEUR] = useState(0)

  const cliente = papel === 'cliente'
  const simulado = Number(valorSimulado.replace(',', '.'))
  const total = itens.length > 0 ? totalBRL : simulado
  const totalValido = Number.isFinite(total) && total > 0
  const valorRecebido = Number(recebido.replace(',', '.'))
  const troco = Number.isFinite(valorRecebido) ? valorRecebido - total : 0

  useEffect(() => {
    buscarCotacoes()
      .then((cotacoes) => {
        setCotacaoUSD(cotacoes.usd)
        setCotacaoEUR(cotacoes.eur)
      })
      .catch((e) => console.error('[pagamento] cotação indisponível:', e))
  }, [])

  const validar = (): string | null => {
    if (!totalValido) return 'Informe um valor maior que zero.'
    if (metodo === 'cartao') {
      const digitos = numero.replace(/\D/g, '')
      if (digitos.length < 13 || digitos.length > 16) return 'Digite o número do cartão.'
      if (nome.trim().length < 3) return 'Digite o nome impresso no cartão.'
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(validade)) return 'A validade fica no formato MM/AA.'
      if (!/^\d{3,4}$/.test(cvv)) return 'O código de segurança tem 3 ou 4 dígitos.'
    }
    if ((metodo === 'vale_refeicao' || metodo === 'vale_alimentacao') && !/^\d{6}$/.test(codigoVale)) {
      return 'O código do vale tem 6 números.'
    }
    if (metodo === 'dinheiro') {
      if (!Number.isFinite(valorRecebido) || valorRecebido <= 0) return 'Informe o valor recebido.'
      if (valorRecebido + 0.001 < total) return 'O valor recebido não cobre a compra.'
    }
    return null
  }

  const pagar = async () => {
    const falha = validar()
    if (falha) {
      setErro(falha)
      return
    }
    setErro(null)
    setProcessando(true)
    await new Promise((resolver) => setTimeout(resolver, 700))

    if (itens.length === 0) {
      setPago(true)
      setProcessando(false)
      return
    }

    const uid = auth.currentUser?.uid
    if (!uid) {
      router.replace('/login')
      return
    }

    const venda: Venda = {
      operador_id: uid,
      total_brl: totalBRL,
      cotacao_usd: cotacaoUSD,
      cotacao_eur: cotacaoEUR,
      itens,
      forma_pagamento: metodo,
      origem: cliente ? 'compra' : 'caixa',
    }

    try {
      await salvarVenda(venda)
    } catch (e) {
      console.error('[pagamento] falha ao registrar:', e)
      try {
        await registrarCompraLocal(uid, venda)
      } catch (local) {
        console.error('[pagamento] falha ao guardar local:', local)
        setErro('Não foi possível registrar o pagamento. Tente novamente.')
        setProcessando(false)
        return
      }
    }

    limparCarrinho()
    setNumero('')
    setCvv('')
    setPago(true)
    setProcessando(false)
  }

  const reiniciar = () => {
    setPago(false)
    setErro(null)
    setCodigoVale('')
    setRecebido('')
    setNumero('')
    setCvv('')
  }

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <BarraApp titulo={cliente ? 'Pagamento' : 'Receber'} voltar={false} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        {pago ? (
          <NotificacaoOk
            total={dinheiro(total)}
            forma={rotulo(metodo)}
            onInicio={() => router.replace('/inicio')}
            onOutro={reiniciar}
          />
        ) : (
          <>
            <View style={[styles.totalCaixa, { backgroundColor: cores.superficie }]}>
              <Text style={[styles.kicker, { color: cores.textoSuave }]}>
                {itens.length > 0 ? (cliente ? 'Sua compra' : 'Conta do caixa') : 'Valor da compra'}
              </Text>
              <Text style={[styles.total, { color: cores.texto }]}>{totalValido ? dinheiro(total) : '—'}</Text>
              {itens.length === 0 ? (
                <TextInput
                  style={[styles.input, { color: cores.texto, borderColor: cores.linha, backgroundColor: cores.fundo }]}
                  value={valorSimulado}
                  onChangeText={setValorSimulado}
                  keyboardType="decimal-pad"
                  placeholder="Valor"
                  placeholderTextColor={cores.textoSuave}
                />
              ) : (
                <Text style={[styles.resumo, { color: cores.textoSuave }]}>
                  {itens.length} {itens.length === 1 ? 'produto' : 'produtos'} no carrinho
                </Text>
              )}
            </View>

            <Text style={[styles.secao, { color: cores.texto }]}>Como pagar</Text>
            <View style={styles.metodos}>
              {METODOS.map((item) => {
                const ativo = metodo === item.id
                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.metodo,
                      { backgroundColor: ativo ? cores.destaque : cores.superficie, borderColor: ativo ? cores.destaque : cores.linha },
                    ]}
                    onPress={() => {
                      setMetodo(item.id)
                      setErro(null)
                    }}
                  >
                    <item.Icone color={ativo ? cores.destaqueTexto : cores.texto} size={18} />
                    <Text style={[styles.metodoTexto, { color: ativo ? cores.destaqueTexto : cores.texto }]}>{item.rotulo}</Text>
                  </Pressable>
                )
              })}
            </View>

            <View style={[styles.painel, { backgroundColor: cores.superficie }]}>
              {metodo === 'pix' ? (
                <>
                  <GradePix semente={`${total.toFixed(2)}-nexo`} />
                  <Text style={[styles.painelTitulo, { color: cores.texto }]}>PIX da loja</Text>
                  <TextoVerde style={styles.chave}>nexo@loja.rio</TextoVerde>
                  <Text style={[styles.ajuda, { color: cores.textoSuave }]}>Confirme quando o pagamento estiver feito.</Text>
                </>
              ) : null}

              {metodo === 'cartao' ? (
                <>
                  <Text style={[styles.painelTitulo, { color: cores.texto }]}>Cartão de crédito ou débito</Text>
                  <TextInput
                    style={[styles.input, { color: cores.texto, borderColor: cores.linha, backgroundColor: cores.fundo }]}
                    value={numero}
                    onChangeText={(texto) => setNumero(texto.replace(/[^\d ]/g, '').slice(0, 19))}
                    keyboardType="number-pad"
                    placeholder="Número do cartão"
                    placeholderTextColor={cores.textoSuave}
                  />
                  <TextInput
                    style={[styles.input, { color: cores.texto, borderColor: cores.linha, backgroundColor: cores.fundo }]}
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Nome impresso"
                    placeholderTextColor={cores.textoSuave}
                  />
                  <View style={styles.linha}>
                    <TextInput
                      style={[styles.input, styles.meio, { color: cores.texto, borderColor: cores.linha, backgroundColor: cores.fundo }]}
                      value={validade}
                      onChangeText={(texto) => {
                        const digitos = texto.replace(/\D/g, '').slice(0, 4)
                        setValidade(digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos)
                      }}
                      keyboardType="number-pad"
                      placeholder="MM/AA"
                      placeholderTextColor={cores.textoSuave}
                    />
                    <TextInput
                      style={[styles.input, styles.meio, { color: cores.texto, borderColor: cores.linha, backgroundColor: cores.fundo }]}
                      value={cvv}
                      onChangeText={(texto) => setCvv(texto.replace(/\D/g, '').slice(0, 4))}
                      keyboardType="number-pad"
                      placeholder="CVV"
                      placeholderTextColor={cores.textoSuave}
                      secureTextEntry
                    />
                  </View>
                  <Text style={[styles.ajuda, { color: cores.textoSuave }]}>
                    Os números ficam só nesta tela e não são enviados.
                  </Text>
                </>
              ) : null}

              {metodo === 'vale_refeicao' || metodo === 'vale_alimentacao' ? (
                <>
                  <Text style={[styles.painelTitulo, { color: cores.texto }]}>
                    {metodo === 'vale_refeicao' ? 'Vale refeição' : 'Vale alimentação'}
                  </Text>
                  <TextInput
                    style={[styles.input, { color: cores.texto, borderColor: cores.linha, backgroundColor: cores.fundo }]}
                    value={codigoVale}
                    onChangeText={(texto) => setCodigoVale(texto.replace(/\D/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    placeholder="Código de 6 números"
                    placeholderTextColor={cores.textoSuave}
                  />
                  <Text style={[styles.ajuda, { color: cores.textoSuave }]}>Digite o código de 6 números do vale.</Text>
                </>
              ) : null}

              {metodo === 'dinheiro' ? (
                <>
                  <Text style={[styles.painelTitulo, { color: cores.texto }]}>Dinheiro em mãos</Text>
                  <TextInput
                    style={[styles.input, { color: cores.texto, borderColor: cores.linha, backgroundColor: cores.fundo }]}
                    value={recebido}
                    onChangeText={setRecebido}
                    keyboardType="decimal-pad"
                    placeholder="Valor recebido"
                    placeholderTextColor={cores.textoSuave}
                  />
                  <Text style={[styles.ajuda, { color: cores.texto }]}>
                    Troco: {Number.isFinite(valorRecebido) && valorRecebido >= total ? dinheiro(troco) : '—'}
                  </Text>
                </>
              ) : null}

              {erro ? <Text style={[styles.erro, { color: cores.perigo }]}>{erro}</Text> : null}

              <Pressable
                style={[styles.botao, { backgroundColor: cores.destaque, opacity: processando ? 0.7 : 1 }]}
                onPress={pagar}
                disabled={processando}
              >
                {processando ? (
                  <ActivityIndicator color={cores.destaqueTexto} />
                ) : (
                  <Text style={[styles.botaoTexto, { color: cores.destaqueTexto }]}>
                    {metodo === 'pix' ? 'Já paguei' : cliente ? 'Pagar agora' : 'Confirmar recebimento'}
                  </Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
      <BarraInferior />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  conteudo: { padding: 16, paddingBottom: 120, gap: 12 },
  totalCaixa: { borderRadius: 20, padding: 16, gap: 6 },
  kicker: { fontSize: 13, fontWeight: '700' },
  total: { fontSize: 32, fontWeight: '800' },
  resumo: { fontSize: 14 },
  secao: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  metodos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metodo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metodoTexto: { fontSize: 13, fontWeight: '700' },
  painel: { borderRadius: 20, padding: 16, gap: 10, alignItems: 'stretch' },
  painelTitulo: { fontSize: 16, fontWeight: '800' },
  chave: { fontSize: 18, fontWeight: '800' },
  ajuda: { fontSize: 13, lineHeight: 18 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16 },
  linha: { flexDirection: 'row', gap: 8 },
  meio: { flex: 1 },
  botao: { minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  botaoTexto: { fontSize: 16, fontWeight: '800' },
  erro: { textAlign: 'center' },
  qr: { width: 168, height: 168, flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center', borderRadius: 12, overflow: 'hidden' },
  celula: { width: 24, height: 24 },
  sucessoCaixa: { borderRadius: 28, padding: 28, alignItems: 'center', gap: 8 },
  seloOk: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  sucessoTitulo: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  sucessoSub: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  sucessoValor: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  link: { fontWeight: '700', marginTop: 4 },
})
