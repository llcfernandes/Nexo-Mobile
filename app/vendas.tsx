import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import BarraApp from '../components/BarraApp'
import BarraInferior from '../components/BarraInferior'
import TextoVerde from '../components/TextoVerde'
import { usePapel } from '../context/PapelContext'
import { useTema } from '../context/TemaContext'
import { observarSessao } from '../services/auth'
import { listarVendas, type VendaLista } from '../services/vendas'

export default function Vendas() {
  const { cores } = useTema()
  const { papel, pronto: papelPronto } = usePapel()
  const [uid, setUid] = useState<string | null>(null)
  const [vendas, setVendas] = useState<VendaLista[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (papelPronto && papel !== 'operador') router.replace('/inicio')
  }, [papel, papelPronto])

  useEffect(() => {
    const unsubscribe = observarSessao((user) => {
      if (!user) {
        router.replace('/login')
        return
      }
      setUid(user.uid)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!uid) return
    const carregar = async () => {
      setCarregando(true)
      try {
        setVendas(await listarVendas(uid))
        setErro(null)
      } catch (e) {
        console.error('[vendas] falha ao abrir:', e)
        setErro('Não foi possível carregar as vendas.')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [uid])

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <BarraApp titulo="Vendas" voltar={false} />
      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={cores.destaque} />
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={[styles.aviso, { color: cores.perigo }]}>{erro}</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          data={vendas}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={[styles.aviso, { color: cores.textoSuave }]}>Nenhuma venda registrada ainda.</Text>}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: cores.superficie, borderColor: cores.linha }]}>
              <View style={styles.linha}>
                <Text style={[styles.valor, { color: cores.texto }]}>R$ {item.total_brl.toFixed(2)}</Text>
                <TextoVerde style={styles.forma}>{item.forma ?? 'Sem forma'}</TextoVerde>
              </View>
              <Text style={[styles.meta, { color: cores.textoSuave }]}>
                {item.quando} · {item.itens} {item.itens === 1 ? 'item' : 'itens'}
              </Text>
            </View>
          )}
        />
      )}
      <BarraInferior />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  lista: { padding: 16, paddingBottom: 120, gap: 10 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 4 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  valor: { fontSize: 18, fontWeight: '800' },
  forma: { fontSize: 13, fontWeight: '800' },
  meta: { fontSize: 13 },
  aviso: { textAlign: 'center', fontSize: 15 },
})
