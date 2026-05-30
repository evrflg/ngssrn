import Svg, { Path } from 'react-native-svg';

const Icon = ({ color }: { color: string }) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M6.58717 20.4098C8.14731 21.4161 10.0055 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.88 2.5188 15.6389 3.42104 17.1412" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
      <Path d="M13 21.0948C17.4183 21.0948 21 17.4919 21 13.0474C21 8.60295 17.4183 5 13 5C8.58172 5 5 8.60295 5 13.0474C5 17.4919 8.58172 21.0948 13 21.0948Z" fillOpacity="0.25" />
      <Path d="M10.4085 10.4092L14.8279 9.17172L13.5905 13.5911L9.17109 14.8286L10.4085 10.4092Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export default Icon;
