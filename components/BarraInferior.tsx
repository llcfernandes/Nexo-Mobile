import { router, usePathname } from 'expo-router'
import { CircleUserRound, CreditCard, Heart, House, LayoutGrid, Receipt, ScanBarcode, ShoppingCart } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCarrinho } from '../context/CarrinhoContext'
import { useFavoritos } from '../context/FavoritosContext'
import { usePapel } from '../context/PapelContext'
import { useTema } from '../context/TemaContext'

const CLIENTE = [
  { rota: '/inicio', rotulo: 'Início', Icone: House },
  { rota: '/produtos', rotulo: 'Produtos', Icone: LayoutGrid },
  { rota: '/favoritos', rotulo: 'Favoritos', Icone: Heart },
  { rota: '/carrinho', rotulo: 'Carrinho', Icone: ShoppingCart },
  { rota: '/pagamento', rotulo: 'Pagar', Icone: CreditCard },
  { rota: '/perfil', rotulo: 'Perfil', Icone: CircleUserRound },
] as const

const OPERADOR = [
  { rota: '/inicio', rotulo: 'Início', Icone: House },
  { rota: '/produtos', rotulo: 'Produtos', Icone: LayoutGrid },
  { rota: '/caixa', rotulo: 'Escanear', Icone: ScanBarcode },
  { rota: '/vendas', rotulo: 'Vendas', Icone: Receipt },
  { rota: '/perfil', rotulo: 'Perfil', Icone: CircleUserRound },
] as const

export default function BarraInferior() {
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  const { cores } = useTema()
  const { papel } = usePapel()
  const { quantidadeTotal } = useCarrinho()
  const { favoritos } = useFavoritos()
  const itens = papel === 'operador' ? OPERADOR : CLIENTE

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.barra, { backgroundColor: cores.superficie, borderColor: cores.linha }]}>
        {itens.map(({ rota, rotulo, Icone }) => {
          const ativo = pathname === rota
          const cor = ativo ? cores.destaqueTexto : cores.textoSuave
          return (
            <Pressable
              key={rota}
              style={[styles.item, ativo && { backgroundColor: cores.destaque }]}
              onPress={() => {
                if (!ativo) router.push(rota)
              }}
              accessibilityLabel={rotulo}
            >
              <View>
                <Icone color={cor} size={20} />
                {rota === '/carrinho' && quantidadeTotal > 0 ? (
                  <View style={[styles.selo, { backgroundColor: ativo ? cores.fundo : cores.destaque }]}>
                    <Text style={[styles.seloTexto, { color: ativo ? cores.texto : cores.destaqueTexto }]}>
                      {quantidadeTotal > 9 ? '9+' : quantidadeTotal}
                    </Text>
                  </View>
                ) : null}
                {rota === '/favoritos' && favoritos.length > 0 ? (
                  <View style={[styles.selo, { backgroundColor: ativo ? cores.fundo : cores.perigo }]}>
                    <Text style={[styles.seloTexto, { color: ativo ? cores.texto : '#FFFFFF' }]}>
                      {favoritos.length > 9 ? '9+' : favoritos.length}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.rotulo, { color: cor }]}>{rotulo}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  barra: {
    flexDirection: 'row',
    borderRadius: 28,
    borderWidth: 1,
    padding: 6,
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 22,
  },
  rotulo: {
    fontSize: 10,
    fontWeight: '700',
  },
  selo: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  seloTexto: {
    fontSize: 9,
    fontWeight: '800',
  },
})
