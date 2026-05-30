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
      <Circle cx={24} cy={13} r={8} fill={color} />
      <Path fillRule="evenodd" clipRule="evenodd" opacity="0.4" fill={color} d="M34.1,6.6c0.2-0.5,0.8-0.7,1.3-0.4C37,6.9,40,9.4,40,13.5c0,4.2-3.1,6.3-4.6,6.9c-0.5,0.2-1.1-0.1-1.3-0.6
        c-0.2-0.5,0.1-1.1,0.6-1.3c1.1-0.4,3.4-2,3.4-5.1c0-3.1-2.3-5-3.4-5.6C34.1,7.6,33.9,7,34.1,6.6z" />
      <Path fill={color} d="M11,35c0-4.4,3.6-8,8-8h10c4.4,0,8,3.6,8,8v8H11V35z" />
      <Path fillRule="evenodd" clipRule="evenodd" opacity="0.4" fill={color} d="M37.6,27.6c0.2-0.5,0.8-0.8,1.3-0.6c2.2,0.8,3.6,2.1,4.5,3.6c0.9,1.5,1.1,3.2,1.1,4.8V42c0,0.6-0.4,1-1,1
        s-1-0.4-1-1v-6.5c0-1.4-0.2-2.7-0.9-3.8c-0.6-1.1-1.7-2.1-3.5-2.7C37.6,28.7,37.4,28.2,37.6,27.6z" />
      <Path fillRule="evenodd" clipRule="evenodd" opacity="0.4" fill={color} d="M14.4,6.6c-0.2-0.5-0.8-0.7-1.3-0.4c-1.5,0.8-4.6,3.3-4.6,7.4c0,4.2,3.1,6.3,4.6,6.9c0.5,0.2,1.1-0.1,1.3-0.6
        c0.2-0.5-0.1-1.1-0.6-1.3c-1.1-0.4-3.4-2-3.4-5.1c0-3.1,2.3-5,3.4-5.6C14.4,7.6,14.6,7,14.4,6.6z" />
      <Path fillRule="evenodd" clipRule="evenodd" opacity="0.4" fill={color} d="M10.9,27.6c-0.2-0.5-0.8-0.8-1.3-0.6c-2.2,0.8-3.6,2.1-4.5,3.6C4.3,32.2,4,33.9,4,35.5V42c0,0.6,0.4,1,1,1
        c0.6,0,1-0.4,1-1v-6.5c0-1.4,0.2-2.7,0.9-3.8c0.6-1.1,1.7-2.1,3.5-2.7C10.9,28.7,11.1,28.2,10.9,27.6z" />
    </Svg>
  )
}
