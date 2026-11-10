import { Coins, CreditCard, ScanBarcode, Store, type LucideIcon } from 'lucide-react-native'

export type Curiosidade = {
  id: string
  titulo: string
  texto: string
  Icone: LucideIcon
}

export const CURIOSIDADES: Curiosidade[] = [
  {
    id: 'moedas',
    titulo: 'Três moedas',
    texto: 'O mesmo pedido aparece em real, dólar e euro, com a cotação do momento.',
    Icone: Coins,
  },
  {
    id: 'pagamento',
    titulo: 'Cinco jeitos de pagar',
    texto: 'PIX, cartão, vale refeição, vale alimentação ou dinheiro.',
    Icone: CreditCard,
  },
  {
    id: 'scanner',
    titulo: 'Código na hora',
    texto: 'Na loja, o scanner lê o código e o produto entra direto no carrinho.',
    Icone: ScanBarcode,
  },
  {
    id: 'papeis',
    titulo: 'Dois papéis',
    texto: 'Você compra como cliente. Nos três traços, vira operador e cuida da vitrine.',
    Icone: Store,
  },
]
