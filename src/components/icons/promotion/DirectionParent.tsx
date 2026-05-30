import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Circle } from 'react-native-svg';

export default function ({ color }: SvgProps) {
  return (
    <Svg
      width={25}
      height={25}
      viewBox="0 0 48 48"
      fill="none"
    >
      <Circle cx={19} cy={13} r={8} fill={color} />
      <Path fill={color} d="M3,35c0-4.4,3.6-8,8-8h16c4.4,0,8,3.6,8,8v8H3V35z" />
      <Path fillRule="evenodd" clipRule="evenodd" opacity="0.4" fill={color} d="M30.1,5.2c0.2-0.5,0.8-0.8,1.3-0.6C34.7,6,37,9.2,37,13c0,3.8-2.3,7-5.6,8.3c-0.5,0.2-1.1,0-1.3-0.6
	      c-0.2-0.5,0-1.1,0.6-1.3c2.6-1,4.4-3.6,4.4-6.5c0-2.9-1.8-5.5-4.4-6.5C30.1,6.3,29.9,5.7,30.1,5.2z M37,27c0.1-0.5,0.7-0.9,1.2-0.7
	      c4,1,6.8,4.9,6.8,10.7v5c0,0.6-0.4,1-1,1s-1-0.4-1-1v-5c0-5.2-2.4-8-5.2-8.8C37.2,28.1,36.9,27.5,37,27z" />
    </Svg>
  )
}
