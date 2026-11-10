import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { observarSessao } from '../services/auth'
import type { Produto } from '../types'

export type Favorito = {
  id: string
  nome: string
  preco_brl: number
  categoria: string
  foto?: string
}

type FavoritosContextValue = {
  favoritos: Favorito[]
  ehFavorito: (id: string) => boolean
  alternarFavorito: (produto: Pick<Favorito, 'id' | 'nome' | 'preco_brl' | 'categoria' | 'foto'> | Produto) => void
}

const FavoritosContext = createContext<FavoritosContextValue | null>(null)

const chave = (uid: string) => `nexo-favoritos:${uid}`

export const FavoritosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uid, setUid] = useState<string | null>(null)
  const [favoritos, setFavoritos] = useState<Favorito[]>([])

  useEffect(() => {
    const unsubscribe = observarSessao((user) => setUid(user?.uid ?? null))
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!uid) {
      setFavoritos([])
      return
    }
    const carregar = async () => {
      try {
        const salvo = await AsyncStorage.getItem(chave(uid))
        setFavoritos(salvo ? (JSON.parse(salvo) as Favorito[]) : [])
      } catch (e) {
        console.error('[favoritos] falha ao ler:', e)
        setFavoritos([])
      }
    }
    carregar()
  }, [uid])

  const gravar = (uidAtual: string, lista: Favorito[]) => {
    AsyncStorage.setItem(chave(uidAtual), JSON.stringify(lista)).catch((e) => {
      console.error('[favoritos] falha ao salvar:', e)
    })
  }

  const value = useMemo<FavoritosContextValue>(() => {
    const ehFavorito = (id: string) => favoritos.some((item) => item.id === id)
    const alternarFavorito = (produto: Favorito | Produto) => {
      if (!uid) return
      const item: Favorito = {
        id: produto.id,
        nome: produto.nome,
        preco_brl: produto.preco_brl,
        categoria: produto.categoria,
        foto: produto.foto,
      }
      setFavoritos((atual) => {
        const proxima = atual.some((favorito) => favorito.id === item.id)
          ? atual.filter((favorito) => favorito.id !== item.id)
          : [item, ...atual]
        gravar(uid, proxima)
        return proxima
      })
    }
    return { favoritos, ehFavorito, alternarFavorito }
  }, [favoritos, uid])

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>
}

export const useFavoritos = (): FavoritosContextValue => {
  const context = useContext(FavoritosContext)
  if (!context) {
    throw new Error('useFavoritos precisa ser usado dentro de um FavoritosProvider')
  }
  return context
}
