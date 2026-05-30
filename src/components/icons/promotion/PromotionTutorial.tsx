import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export default function ({ color }: SvgProps) {
  return (
    <Svg
      width={30}
      height={30}
      viewBox="0 0 60 60">
      <Path opacity="0.4" fill={color} d="M52.5,17.5v25C52.5,50,48.8,55,40,55H20c-8.8,0-12.5-5-12.5-12.5v-25C7.5,10,11.2,5,20,5h20
	      C48.8,5,52.5,10,52.5,17.5z" />
      <Path fill={color} d="M38.8,5v19.6c0,1.1-1.3,1.6-2.1,0.9l-5.8-5.4c-0.5-0.5-1.2-0.5-1.7,0l-5.8,5.4c-0.8,0.8-2.1,0.2-2.1-0.9V5H38.8
	      z" />
      <Path fill={color}
        d="M43.8,36.9H33.1c-1,0-1.9-0.8-1.9-1.9s0.8-1.9,1.9-1.9h10.6c1,0,1.9,0.8,1.9,1.9S44.8,36.9,43.8,36.9z" />
      <Path fill={color}
        d="M43.8,46.9H22.5c-1,0-1.9-0.8-1.9-1.9s0.9-1.9,1.9-1.9h21.2c1,0,1.9,0.8,1.9,1.9S44.8,46.9,43.8,46.9z" />
    </Svg>
  )
}
