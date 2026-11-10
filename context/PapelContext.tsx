import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Papel = 'cliente' | 'operador'

type PapelContextValue = {
  papel: Papel
  pronto: boolean
  definirPapel: (papel: Papel) => void
}

const CHAVE = 'nexo-papel'
const PapelContext = createContext<PapelContextValue | null>(null)

export const PapelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [papel, setPapel] = useState<Papel>('cliente')
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(CHAVE)
      .then((salvo) => {
        if (salvo === 'cliente' || salvo === 'operador') setPapel(salvo)
      })
      .catch((e) => console.error('[papel] falha ao ler:', e))
      .finally(() => setPronto(true))
  }, [])

  const value = useMemo<PapelContextValue>(
    () => ({
      papel,
      pronto,
      definirPapel: (proximo) => {
        setPapel(proximo)
        AsyncStorage.setItem(CHAVE, proximo).catch((e) => console.error('[papel] falha ao salvar:', e))
      },
    }),
    [papel, pronto]
  )

  return <PapelContext.Provider value={value}>{children}</PapelContext.Provider>
}

export const usePapel = (): PapelContextValue => {
  const context = useContext(PapelContext)
  if (!context) {
    throw new Error('usePapel precisa ser usado dentro de um PapelProvider')
  }
  return context
}
