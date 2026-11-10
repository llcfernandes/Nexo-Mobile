import { router, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import BarraApp from '../components/BarraApp'
import TextoVerde from '../components/TextoVerde'
import CotacaoTag from '../components/CotacaoTag'
import { useCarrinho } from '../context/CarrinhoContext'
import { useTema } from '../context/TemaContext'
import { auth } from '../services/firebase'

export default function Confirmacao() {
  const { totalBRL, cotacaoUSD, cotacaoEUR } = useLocalSearchParams<{
    totalBRL: string
    cotacaoUSD: string
    cotacaoEUR: string
  }>()
  const { cores } = useTema()
  const { itens } = useCarrinho()

  const total = Number(totalBRL)
  const usd = Number(cotacaoUSD)
  const eur = Number(cotacaoEUR)

  useEffect(() => {
    if (!auth.currentUser?.uid) {
      router.replace('/login')
    }
  }, [])

  const handleVoltar = () => {
    router.back()
  }

  const handleConfirmar = () => {
    router.push('/pagamento')
  }

  return (
    <View style={[styles.tela, { backgroundColor: cores.fundo }]}>
      <BarraApp titulo="Compra" voltar />
      <View style={styles.container}>
      <View style={styles.lista}>
        {itens.map((item) => (
          <View key={item.produto_id} style={styles.linha}>
            <Text style={[styles.linhaNome, { color: cores.texto }]}>
              {item.quantidade}x {item.nome}
            </Text>
            <Text style={[styles.linhaPreco, { color: cores.texto }]}>R$ {(item.preco_brl * item.quantidade).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.totais, { borderTopColor: cores.linha }]}>
        <CotacaoTag moeda="BRL" valor={`R$ ${total.toFixed(2)}`} />
        <CotacaoTag moeda="USD" valor={`US$ ${(total / usd).toFixed(2)}`} />
        <CotacaoTag moeda="EUR" valor={`€ ${(total / eur).toFixed(2)}`} />
      </View>

      <View style={styles.acoes}>
      <Pressable style={[styles.botaoSecundario, { borderColor: cores.destaque }]} onPress={handleVoltar}>
        <TextoVerde style={styles.botaoSecundarioTexto}>Voltar</TextoVerde>
      </Pressable>

      <Pressable style={[styles.botaoPrimario, { backgroundColor: cores.destaque }]} onPress={handleConfirmar}>
        <Text style={[styles.botaoPrimarioTexto, { color: cores.destaqueTexto }]}>Ir para o pagamento</Text>
      </Pressable>
      </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  lista: {
    gap: 8,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linhaNome: {
    fontSize: 16,
  },
  linhaPreco: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totais: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  sucesso: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  erro: {
    textAlign: 'center',
  },
  acoes: {
    marginTop: 'auto',
    gap: 12,
    paddingBottom: 16,
  },
  botaoSecundario: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoSecundarioTexto: {
    fontWeight: 'bold',
  },
  botaoPrimario: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoPrimarioTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})
