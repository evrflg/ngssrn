
import Svg, { Path } from 'react-native-svg';

const Icon = ({ color }: { color: string }) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill='none'>
      <Path d="M12 22.0948C16.4183 22.0948 20 18.4919 20 14.0474C20 9.60295 16.4183 6 12 6C7.58172 6 4 9.60295 4 14.0474C4 18.4919 7.58172 22.0948 12 22.0948Z" fillOpacity="0.25" />
      <Path d="M21 15V12C21 7.02944 16.9706 3 12 3C10.3607 3 9.32378 3.23423 8 4M3 16V12C3 10.1599 3.55223 8.44877 4.5 7.02331" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
      <Path d="M3 15V16.9999C3 18.84 3 21 8 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M16 14C16 12.8954 16.8954 12 18 12H19C20.1046 12 21 12.8954 21 14V16C21 17.1046 20.1046 18 19 18H18C16.8954 18 16 17.1046 16 16V14Z" stroke={color} strokeWidth="1.5" />
      <Path d="M8 14C8 12.8954 7.10457 12 6 12H5C3.89543 12 3 12.8954 3 14V16C3 17.1046 3.89543 18 5 18H6C7.10457 18 8 17.1046 8 16V14Z" stroke={color} strokeWidth="1.5" />
    </Svg>
  )
}

export default Icon;
