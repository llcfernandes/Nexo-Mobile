import { Platform, Text, type TextProps, type TextStyle } from 'react-native'
import { useTema } from '../context/TemaContext'

const sombraClara: TextStyle = {
  textShadowColor: '#000000',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 2,
}

export default function TextoVerde({ style, ...props }: TextProps) {
  const { tema, cores } = useTema()
  const claro = tema === 'claro'

  return (
    <Text
      {...props}
      {...(claro && Platform.OS === 'web' ? { dataSet: { verde: '1' } } : null)}
      style={[style, { color: cores.destaque }, claro && Platform.OS !== 'web' ? sombraClara : null]}
    />
  )
}
