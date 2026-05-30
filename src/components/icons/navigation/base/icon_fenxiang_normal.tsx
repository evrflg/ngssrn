

import Svg, { Path } from 'react-native-svg';

const Icon = ({ color }: { color: string }) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill='none'>
      <Path d="M9.50012 20.0948C13.9184 20.0948 17.5001 16.4919 17.5001 12.0474C17.5001 7.60295 13.9184 4 9.50012 4C5.08184 4 1.50012 7.60295 1.50012 12.0474C1.50012 16.4919 5.08184 20.0948 9.50012 20.0948Z" fillOpacity="0.25" />
      <Path d="M15 4.5C15 5.88071 16.1193 7 17.5 7C18.8807 7 20 5.88071 20 4.5C20 3.11929 18.8807 2 17.5 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M5.5 14C6.88071 14 8 12.8807 8 11.5C8 10.1193 6.88071 9 5.5 9C4.11929 9 3 10.1193 3 11.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M15 6L8 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7.5 13.5L15 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20 19.5C20 20.8807 18.8807 22 17.5 22C16.1193 22 15 20.8807 15 19.5C15 18.1193 16.1193 17 17.5 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  )
}

export default Icon;