import { StyleSheet, useWindowDimensions } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { useTema } from '../context/TemaContext'

export default function FundoDegrade() {
  const { tema } = useTema()
  const { width, height } = useWindowDimensions()
  const escuro = tema === 'escuro'

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="nexoFundo" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={escuro ? '#0C0D10' : '#C5C8D0'} />
          <Stop offset="0.62" stopColor={escuro ? '#10140F' : '#C2C6BE'} />
          <Stop offset="1" stopColor={escuro ? '#1A2B16' : '#A9B86E'} />
        </LinearGradient>
      </Defs>
      <Rect width={width} height={height} fill="url(#nexoFundo)" />
    </Svg>
  )
}
