import React, { createContext, useContext, useMemo, useState } from 'react'

type PainelContextValue = {
  aberto: boolean
  abrir: () => void
  fechar: () => void
}

const PainelContext = createContext<PainelContextValue | null>(null)

export const PainelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aberto, setAberto] = useState(false)
  const value = useMemo<PainelContextValue>(
    () => ({
      aberto,
      abrir: () => setAberto(true),
      fechar: () => setAberto(false),
    }),
    [aberto]
  )
  return <PainelContext.Provider value={value}>{children}</PainelContext.Provider>
}

export const usePainel = (): PainelContextValue => {
  const context = useContext(PainelContext)
  if (!context) {
    throw new Error('usePainel precisa ser usado dentro de um PainelProvider')
  }
  return context
}
