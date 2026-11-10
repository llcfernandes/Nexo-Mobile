import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Platform } from 'react-native'
import { TEMAS, type Cores, type NomeTema } from '../constants/tema'

const CHAVE_TEMA = 'nexo-tema'

type TemaContextValue = {
  tema: NomeTema
  cores: Cores
  alternarTema: () => void
}

const TemaContext = createContext<TemaContextValue | null>(null)

export const TemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tema, setTema] = useState<NomeTema>('escuro')

  useEffect(() => {
    const carregar = async () => {
      try {
        const salvo = await AsyncStorage.getItem(CHAVE_TEMA)
        if (salvo === 'claro' || salvo === 'escuro') setTema(salvo)
      } catch (e) {
        console.error('[tema] falha ao ler preferência:', e)
      }
    }
    carregar()
  }, [])

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return
    const id = 'nexo-contorno-verde'
    const existente = document.getElementById(id)
    if (tema !== 'claro') {
      existente?.remove()
      return
    }
    const el = existente ?? document.createElement('style')
    el.id = id
    el.textContent = '[data-verde="1"]{-webkit-text-stroke:1.5px #000;paint-order:stroke fill;}'
    if (!existente) document.head.appendChild(el)
  }, [tema])

  const alternarTema = () => {
    setTema((atual) => {
      const proximo: NomeTema = atual === 'claro' ? 'escuro' : 'claro'
      AsyncStorage.setItem(CHAVE_TEMA, proximo).catch((e) => {
        console.error('[tema] falha ao salvar preferência:', e)
      })
      return proximo
    })
  }

  const value = useMemo<TemaContextValue>(
    () => ({ tema, cores: TEMAS[tema], alternarTema }),
    [tema]
  )

  return <TemaContext.Provider value={value}>{children}</TemaContext.Provider>
}

export const useTema = (): TemaContextValue => {
  const context = useContext(TemaContext)
  if (!context) {
    throw new Error('useTema precisa ser usado dentro de um TemaProvider')
  }
  return context
}
