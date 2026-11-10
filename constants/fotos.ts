import type { Produto } from '../types'

const url = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`

const normalizar = (texto: string) => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const REGRAS: { termo: string; foto: string }[] = [
  { termo: 'acai', foto: url('photo-1590301157890-4810ed352733') },
  { termo: 'coco', foto: url('photo-1615485290382-441e4d049cb5') },
  { termo: 'sorvete', foto: url('photo-1497034825429-c343d7c6a68f') },
  { termo: 'picole', foto: url('photo-1497034825429-c343d7c6a68f') },
  { termo: 'chocolate', foto: url('photo-1511381939415-e44015466834') },
  { termo: 'bombom', foto: url('photo-1511381939415-e44015466834') },
  { termo: 'cafe', foto: url('photo-1495474472287-4d71bcdd2085') },
  { termo: 'cerveja', foto: url('photo-1608270586620-248524c67de9') },
  { termo: 'chopp', foto: url('photo-1608270586620-248524c67de9') },
  { termo: 'suco', foto: url('photo-1572490122747-3968b75cc699') },
  { termo: 'refri', foto: url('photo-1527960471264-932f39eb5846') },
  { termo: 'soda', foto: url('photo-1527960471264-932f39eb5846') },
  { termo: 'guarana', foto: url('photo-1527960471264-932f39eb5846') },
  { termo: 'agua', foto: url('photo-1548839140-29a749e1cf4d') },
  { termo: 'garrafa', foto: url('photo-1548839140-29a749e1cf4d') },
  { termo: 'chinelo', foto: url('photo-1603487742131-4160ec999306') },
  { termo: 'sandalia', foto: url('photo-1603487742131-4160ec999306') },
  { termo: 'havaiana', foto: url('photo-1603487742131-4160ec999306') },
  { termo: 'camiseta', foto: url('photo-1521572163474-6864f9cf17ab') },
  { termo: 'camisa', foto: url('photo-1521572163474-6864f9cf17ab') },
  { termo: 'blusa', foto: url('photo-1521572163474-6864f9cf17ab') },
  { termo: 'bone', foto: url('photo-1588850561407-ed78c282e89b') },
  { termo: 'chapeu', foto: url('photo-1588850561407-ed78c282e89b') },
  { termo: 'oculos', foto: url('photo-1511499767150-a48a237f0083') },
  { termo: 'protetor', foto: url('photo-1556228720-195a672e8a03') },
  { termo: 'solar', foto: url('photo-1556228720-195a672e8a03') },
  { termo: 'toalha', foto: url('photo-1507525428034-b723cf961d3e') },
  { termo: 'canga', foto: url('photo-1507525428034-b723cf961d3e') },
  { termo: 'cristo', foto: url('photo-1483729558449-99ef09a8c325') },
  { termo: 'postal', foto: url('photo-1483729558449-99ef09a8c325') },
  { termo: 'cartao', foto: url('photo-1483729558449-99ef09a8c325') },
  { termo: 'chaveiro', foto: url('photo-1599599810769-bcde5a160d32') },
  { termo: 'lembranca', foto: url('photo-1599599810769-bcde5a160d32') },
  { termo: 'souvenir', foto: url('photo-1599599810769-bcde5a160d32') },
  { termo: 'biscoito', foto: url('photo-1566478989037-eec170784d0b') },
  { termo: 'salgad', foto: url('photo-1566478989037-eec170784d0b') },
  { termo: 'snack', foto: url('photo-1566478989037-eec170784d0b') },
  { termo: 'fruta', foto: url('photo-1559181567-c3190ca9959b') },
  { termo: 'banana', foto: url('photo-1528825871115-3581a5387919') },
]

const FOTO_LOJA = url('photo-1483729558449-99ef09a8c325')

export const fotoSugerida = (produto: Pick<Produto, 'nome' | 'categoria'>): string => {
  const texto = normalizar(`${produto.nome} ${produto.categoria}`)
  const regra = REGRAS.find((item) => texto.includes(item.termo))
  return regra?.foto ?? FOTO_LOJA
}
