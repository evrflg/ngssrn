
import Svg, { Path } from 'react-native-svg';

const Icon = ({ color }: { color: string }) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
<Path d="M13.8281 20.6494C18.2464 20.6494 21.8281 17.0677 21.8281 12.6494C21.8281 8.23114 18.2464 4.64941 13.8281 4.64941C9.40985 4.64941 5.82812 8.23114 5.82812 12.6494C5.82812 17.0677 9.40985 20.6494 13.8281 20.6494Z" fill={color} fillOpacity="0.25"/>
<Path d="M11.5 4L7 4C4.23858 4 2 6.23858 2 9V15C2 17.7614 4.23858 20 7 20H17C19.7614 20 22 17.7614 22 15V9C22 6.23858 19.7614 4 17 4H16" stroke={color} strokeWidth="1.5" strokeLinecap="square"/>
<Path d="M2 9.5H22" stroke={color} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"/>
<Path d="M6 15.5H11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</Svg>

  )
}

export default Icon;
