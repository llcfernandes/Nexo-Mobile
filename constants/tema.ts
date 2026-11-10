export type NomeTema = 'claro' | 'escuro'

export type Cores = {
  fundo: string
  superficie: string
  superficieAlt: string
  texto: string
  textoSuave: string
  linha: string
  destaque: string
  destaqueSuave: string
  destaqueTexto: string
  perigo: string
  overlay: string
  menu: string
}

export const TEMAS: Record<NomeTema, Cores> = {
  claro: {
    fundo: '#C5C8D0',
    superficie: '#F4F5F7',
    superficieAlt: '#E1E3E8',
    texto: '#101114',
    textoSuave: '#3E424A',
    linha: '#A8ADB6',
    destaque: '#B6D23A',
    destaqueSuave: '#D5E48A',
    destaqueTexto: '#16180C',
    perigo: '#C2352B',
    overlay: 'rgba(12, 13, 16, 0.4)',
    menu: '#F4F5F7',
  },
  escuro: {
    fundo: '#0C0D10',
    superficie: '#17181D',
    superficieAlt: '#22242B',
    texto: '#F7F7F4',
    textoSuave: '#9B9BA4',
    linha: '#2E3038',
    destaque: '#D6F25C',
    destaqueSuave: '#2C3318',
    destaqueTexto: '#16180C',
    perigo: '#FF7A72',
    overlay: 'rgba(0, 0, 0, 0.62)',
    menu: '#17181D',
  },
}
