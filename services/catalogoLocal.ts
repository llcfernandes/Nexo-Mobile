import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Produto } from '../types'

export type AjusteProduto = Omit<Produto, 'id'>

type Estado = {
  criados: Produto[]
  ajustes: Record<string, AjusteProduto>
  ocultos: string[]
}

const CHAVE = 'nexo-catalogo-local'

const vazio = (): Estado => ({ criados: [], ajustes: {}, ocultos: [] })

export const lerCatalogoLocal = async (): Promise<Estado> => {
  try {
    const salvo = await AsyncStorage.getItem(CHAVE)
    if (!salvo) return vazio()
    const dados = JSON.parse(salvo) as Partial<Estado>
    return {
      criados: Array.isArray(dados.criados) ? dados.criados : [],
      ajustes: dados.ajustes && typeof dados.ajustes === 'object' ? dados.ajustes : {},
      ocultos: Array.isArray(dados.ocultos) ? dados.ocultos : [],
    }
  } catch (e) {
    console.error('[catalogo] falha ao ler:', e)
    return vazio()
  }
}

export const gravarCatalogoLocal = async (estado: Estado): Promise<void> => {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(estado))
}

export const mesclarCatalogo = (remotos: Produto[], estado: Estado): Produto[] => {
  const visiveis = remotos
    .filter((item) => !estado.ocultos.includes(item.id))
    .map((item) => {
      const ajuste = estado.ajustes[item.id]
      return ajuste ? { ...item, ...ajuste, id: item.id } : item
    })
  const ids = new Set(visiveis.map((item) => item.id))
  const extras = estado.criados.filter((item) => !ids.has(item.id) && !estado.ocultos.includes(item.id))
  return [...extras, ...visiveis].sort((a, b) => String(a.nome).localeCompare(String(b.nome), 'pt-BR'))
}
