import { router } from 'expo-router'
import { ShoppingCart } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import BarraApp from '../components/BarraApp'
import BarraInferior from '../components/BarraInferior'
import ProdutoCard from '../components/ProdutoCard'
import TextoVerde from '../components/TextoVerde'
import { useCarrinho } from '../context/CarrinhoContext'
import { usePapel } from '../context/PapelContext'
import { useTema } from '../context/TemaContext'
import { buscarCotacoes, converter } from '../services/exchange'
import type { Cotacoes } from '../types'

export default function Carrinho() {
  const { cores } = useTema()
  const { papel } = usePapel()
  const { itens, totalBRL, aumentarQuantidade, diminuirQuantidade } = useCarrinho()
  const cliente = papel === 'cliente'

  const [cotacoes, setCotacoes] = useState<Cotacoes | null>(null)
  const [carregandoCotacoes, setCarregandoCotacoes] = useState(true)
  const [cotacaoIndisponivel, setCotacaoIndisponivel] = useState(false)
  const [cotacaoDesatualizada, setCotacaoDesatualizada] = useState(false)
  const temCotacaoRef = useRef(false)

  useEffect(() => {
    const buscar = async () => {
      try {
        const novas = await buscarCotacoes()
        temCotacaoRef.current = true
        setCotacoes(novas)
        setCotacaoIndisponivel(false)
        setCotacaoDesatualizada(false)
      } catch (e) {
        console.error('Erro ao buscar cotações:', e)
        if (temCotacaoRef.current) {
          setCotacaoDesatualizada(true)
        } else {
          setCotacaoIndisponivel(true)
        }
      } finally {
        setCarregandoCotacoes(false)
      }
    }

    buscar()
  }, [])

  const podePagar = itens.length > 0

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <BarraApp titulo="Carrinho" />

      {itens.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={[styles.vazioTexto, { color: cores.textoSuave }]}>
            {cliente ? 'Seu carrinho está vazio' : 'Nenhum produto no caixa'}
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.lista}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaConteudo}
          data={itens}
          keyExtractor={(item) => item.produto_id}
          renderItem={({ item }) => (
            <ProdutoCard item={item} onMais={aumentarQuantidade} onMenos={diminuirQuantidade} />
          )}
        />
      )}

      <View style={[styles.rodape, { borderTopColor: cores.linha, backgroundColor: cores.superficie }]}>
        {carregandoCotacoes ? (
          <ActivityIndicator color={cores.destaque} />
        ) : cotacaoIndisponivel ? (
          <Text style={[styles.avisoErro, { color: cores.perigo }]}>Cotação indisponível</Text>
        ) : (
          <>
            {cotacaoDesatualizada ? <Text style={styles.avisoDiscreto}>Cotação desatualizada</Text> : null}
            <View style={styles.linhaTotal}>
              <Text style={[styles.rotulo, { color: cores.textoSuave }]}>Subtotal</Text>
              <Text style={[styles.valor, { color: cores.texto }]}>R$ {totalBRL.toFixed(2)}</Text>
            </View>
            <View style={styles.linhaTotal}>
              <Text style={[styles.rotulo, { color: cores.textoSuave }]}>Dólar</Text>
              <Text style={[styles.valor, { color: cores.texto }]}>{cotacoes ? `US$ ${converter(totalBRL, cotacoes.usd)}` : '—'}</Text>
            </View>
            <View style={styles.linhaTotal}>
              <Text style={[styles.rotulo, { color: cores.textoSuave }]}>Euro</Text>
              <Text style={[styles.valor, { color: cores.texto }]}>{cotacoes ? `€ ${converter(totalBRL, cotacoes.eur)}` : '—'}</Text>
            </View>
            <View style={[styles.linhaTotal, styles.totalFinal, { borderTopColor: cores.linha }]}>
              <Text style={[styles.totalRotulo, { color: cores.texto }]}>Total</Text>
              <TextoVerde style={styles.totalValor}>R$ {totalBRL.toFixed(2)}</TextoVerde>
            </View>
          </>
        )}

        <Pressable onPress={() => router.push(cliente ? '/produtos' : '/caixa')}>
          <Text style={[styles.link, { color: cores.textoSuave }]}>
            {cliente ? 'Continuar comprando' : 'Voltar ao caixa'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.botaoPrimario, { backgroundColor: podePagar ? cores.destaque : cores.destaqueSuave }]}
          onPress={() => router.push('/pagamento')}
          disabled={!podePagar}
        >
          <ShoppingCart color={podePagar ? cores.destaqueTexto : cores.textoSuave} size={18} />
          <Text style={[styles.botaoPrimarioTexto, { color: podePagar ? cores.destaqueTexto : cores.textoSuave }]}>
            {cliente ? 'Comprar agora' : 'Receber pagamento'}
          </Text>
        </Pressable>
      </View>
      <BarraInferior />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lista: {
    flex: 1,
  },
  listaConteudo: {
    padding: 16,
    gap: 12,
  },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  vazioTexto: {
    fontSize: 16,
    textAlign: 'center',
  },
  rodape: {
    padding: 16,
    paddingBottom: 108,
    borderTopWidth: 1,
    gap: 12,
  },
  linhaTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rotulo: {
    fontSize: 14,
  },
  valor: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalFinal: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
  },
  totalRotulo: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalValor: {
    fontSize: 22,
    fontWeight: '800',
  },
  link: {
    textAlign: 'center',
    fontWeight: '700',
  },
  avisoErro: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  avisoDiscreto: {
    color: '#b7791f',
    textAlign: 'center',
    fontSize: 12,
  },
  botaoPrimario: {
    borderRadius: 18,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botaoPrimarioTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})
