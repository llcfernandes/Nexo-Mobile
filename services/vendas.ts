import AsyncStorage from '@react-native-async-storage/async-storage'
import { addDoc, collection, getDocs, query, serverTimestamp, where, type DocumentReference } from 'firebase/firestore'
import { db } from './firebase'
import type { Venda } from '../types'

export type VendaLista = {
  id: string
  total_brl: number
  quando: string
  forma?: string
  itens: number
}

type CompraLocal = Venda & { id: string; quando: string }

const chaveCompras = (uid: string) => `nexo-compras:${uid}`

const lerComprasLocais = async (uid: string): Promise<CompraLocal[]> => {
  try {
    const salvo = await AsyncStorage.getItem(chaveCompras(uid))
    return salvo ? (JSON.parse(salvo) as CompraLocal[]) : []
  } catch (e) {
    console.error('[vendas] falha ao ler compras locais:', e)
    return []
  }
}

export const registrarCompraLocal = async (uid: string, venda: Venda): Promise<void> => {
  const lista = await lerComprasLocais(uid)
  lista.unshift({ ...venda, id: `local-${Date.now()}`, quando: new Date().toISOString() })
  await AsyncStorage.setItem(chaveCompras(uid), JSON.stringify(lista))
}

export const salvarVenda = (venda: Venda): Promise<DocumentReference> =>
  addDoc(collection(db, 'vendas'), {
    ...venda,
    created_at: serverTimestamp(),
  })

const rotuloForma = (forma: unknown): string | undefined => {
  if (forma === 'pix') return 'PIX'
  if (forma === 'cartao') return 'Cartão'
  if (forma === 'vale_refeicao') return 'Vale refeição'
  if (forma === 'vale_alimentacao') return 'Vale alimentação'
  if (forma === 'dinheiro') return 'Dinheiro'
  return undefined
}

export const resumirVendas = async (operadorId: string): Promise<{ quantidade: number; totalBRL: number }> => {
  let quantidade = 0
  let total = 0
  try {
    const snap = await getDocs(query(collection(db, 'vendas'), where('operador_id', '==', operadorId)))
    quantidade = snap.size
    snap.forEach((item) => {
      const valor = Number(item.data().total_brl)
      if (Number.isFinite(valor)) total += valor
    })
  } catch (e) {
    console.error('[vendas] falha ao resumir:', e)
  }
  const locais = await lerComprasLocais(operadorId)
  quantidade += locais.length
  total += locais.reduce((soma, item) => soma + (Number.isFinite(item.total_brl) ? item.total_brl : 0), 0)
  return { quantidade, totalBRL: Math.round(total * 100) / 100 }
}

export const listarVendas = async (operadorId: string): Promise<VendaLista[]> => {
  const lista: VendaLista[] = []
  try {
    const snap = await getDocs(query(collection(db, 'vendas'), where('operador_id', '==', operadorId)))
    snap.forEach((item) => {
      const dados = item.data()
      const marca = dados.created_at as { toDate?: () => Date } | undefined
      const criado = marca?.toDate?.()
      lista.push({
        id: item.id,
        total_brl: Number(dados.total_brl) || 0,
        quando: criado ? criado.toLocaleString('pt-BR') : 'Registrada',
        forma: rotuloForma(dados.forma_pagamento),
        itens: Array.isArray(dados.itens) ? dados.itens.length : 0,
      })
    })
  } catch (e) {
    console.error('[vendas] falha ao listar:', e)
  }
  const locais = await lerComprasLocais(operadorId)
  locais.forEach((item) => {
    lista.push({
      id: item.id,
      total_brl: item.total_brl,
      quando: new Date(item.quando).toLocaleString('pt-BR'),
      forma: rotuloForma(item.forma_pagamento),
      itens: item.itens.length,
    })
  })
  return lista
}
