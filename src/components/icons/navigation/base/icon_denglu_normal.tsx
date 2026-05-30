

import Svg, { Path } from 'react-native-svg';

const Icon = ({ color }: { color: string }) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill='none'>
      <Path d="M9 16V18C9 20.2091 10.7909 22 13 22H18C20.2091 22 22 20.2091 22 18V6C22 3.79086 20.2091 2 18 2H13C10.7909 2 9 3.79086 9 6V8" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
      <Path d="M14 15L16.2929 12.7071C16.6834 12.3166 16.6834 11.6834 16.2929 11.2929L14 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M16 12L4 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M11 20.0948C15.4183 20.0948 19 16.4919 19 12.0474C19 7.60295 15.4183 4 11 4C6.58172 4 3 7.60295 3 12.0474C3 16.4919 6.58172 20.0948 11 20.0948Z" fillOpacity="0.25" />
    </Svg>
  )
}

export default Icon;
