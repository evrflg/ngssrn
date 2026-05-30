import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export default function ({ color }: SvgProps) {
  return (
    <Svg
      width={30}
      height={30}
      viewBox="0 0 60 60">
      <Path opacity="0.4" fill={color} d="M40.5,5H19.5C10.4,5,5,10.4,5,19.5v20.9C5,49.5,10.4,55,19.5,55h20.9C49.6,55,55,49.5,55,40.4V19.5
	      C55,10.4,49.6,5,40.5,5z" />
      <Path fill={color} d="M25.3,27.9h-6.6c-1.6,0-2.8,1.3-2.8,2.8v12.8h9.5V27.9L25.3,27.9z" />
      <Path opacity="0.4" fill={color}
        d="M31.9,16.5h-3.8c-1.6,0-2.8,1.3-2.8,2.9v24.2h9.5V19.3C34.7,17.8,33.5,16.5,31.9,16.5z" />
      <Path fill={color} d="M41.4,32.1h-6.6v11.4h9.5V35C44.2,33.4,42.9,32.1,41.4,32.1z" />
    </Svg>
  )
}
