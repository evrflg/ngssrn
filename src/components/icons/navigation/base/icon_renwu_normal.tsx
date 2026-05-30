
import Svg, { Path } from 'react-native-svg';

const Icon = ({ color }: { color: string }) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M12.5 22.0948C16.9183 22.0948 20.5 18.4919 20.5 14.0474C20.5 9.60295 16.9183 6 12.5 6C8.08172 6 4.5 9.60295 4.5 14.0474C4.5 18.4919 8.08172 22.0948 12.5 22.0948Z" fill={color} fillOpacity="0.25" />
      <Path d="M4 10.5V6C4 3.79086 5.79086 2 8 2H16C18.2091 2 20 3.79086 20 6V18C20 20.2091 18.2091 22 16 22H8C5.79086 22 4 20.2091 4 18V15" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
      <Path d="M8 7H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M8 12H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M16 7H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M16 12H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M8 17H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  )
}

export default Icon;
