import React, { createContext, useContext, useMemo, useState } from 'react'
import type { ItemCarrinho, Produto } from '../types'

export type AvisoCarrinho = {
  id: number
  nome: string
}

type CarrinhoContextValue = {
  itens: ItemCarrinho[]
  quantidadeTotal: number
  totalBRL: number
  aviso: AvisoCarrinho | null
  adicionarItem: (produto: Produto) => void
  aumentarQuantidade: (produtoId: string) => void
  diminuirQuantidade: (produtoId: string) => void
  removerItem: (produtoId: string) => void
  limparCarrinho: () => void
}

const CarrinhoContext = createContext<CarrinhoContextValue | null>(null)

export const CarrinhoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [itens, setItens] = useState<ItemCarrinho[]>([])
  const [aviso, setAviso] = useState<AvisoCarrinho | null>(null)

  const adicionarItem = (produto: Produto) => {
    setAviso({ id: Date.now(), nome: produto.nome })
    setItens((atual) => {
      const existente = atual.find((item) => item.produto_id === produto.id)
      if (existente) {
        return atual.map((item) =>
          item.produto_id === produto.id
            ? { ...item, quantidade: item.quantidade + 1, foto: item.foto || produto.foto, categoria: item.categoria || produto.categoria }
            : item
        )
      }
      return [
        ...atual,
        {
          produto_id: produto.id,
          nome: produto.nome,
          preco_brl: produto.preco_brl,
          quantidade: 1,
          categoria: produto.categoria,
          foto: produto.foto,
        },
      ]
    })
  }

  const aumentarQuantidade = (produtoId: string) => {
    setItens((atual) =>
      atual.map((item) => (item.produto_id === produtoId ? { ...item, quantidade: item.quantidade + 1 } : item))
    )
  }

  const diminuirQuantidade = (produtoId: string) => {
    setItens((atual) =>
      atual.flatMap((item) => {
        if (item.produto_id !== produtoId) return [item]
        if (item.quantidade <= 1) return []
        return [{ ...item, quantidade: item.quantidade - 1 }]
      })
    )
  }

  const removerItem = (produtoId: string) => {
    setItens((atual) => atual.filter((item) => item.produto_id !== produtoId))
  }

  const limparCarrinho = () => setItens([])

  const quantidadeTotal = useMemo(() => itens.reduce((soma, item) => soma + item.quantidade, 0), [itens])

  const totalBRL = useMemo(() => {
    const total = itens.reduce((soma, item) => soma + item.preco_brl * item.quantidade, 0)
    return Math.round(total * 100) / 100
  }, [itens])

  const value: CarrinhoContextValue = {
    itens,
    quantidadeTotal,
    totalBRL,
    aviso,
    adicionarItem,
    aumentarQuantidade,
    diminuirQuantidade,
    removerItem,
    limparCarrinho,
  }

  return <CarrinhoContext.Provider value={value}>{children}</CarrinhoContext.Provider>
}

export const useCarrinho = (): CarrinhoContextValue => {
  const context = useContext(CarrinhoContext)
  if (!context) {
    throw new Error('useCarrinho precisa ser usado dentro de um CarrinhoProvider')
  }
  return context
}
