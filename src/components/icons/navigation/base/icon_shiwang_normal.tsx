
import Svg, { Circle, Path } from 'react-native-svg';

const Icon = ({ color }: { color: string }) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M12 20.0948C16.4183 20.0948 20 16.4919 20 12.0474C20 7.60295 16.4183 4 12 4C7.58172 4 4 7.60295 4 12.0474C4 16.4919 7.58172 20.0948 12 20.0948Z" fill={color} fillOpacity="0.25" />
      <Path d="M2 10.4857V10.0005C2 7.04244 4.55409 4.73102 7.49752 5.02536L11.403 5.41591C11.8 5.45561 12.2 5.45561 12.597 5.41591L16.5025 5.02536C19.4459 4.73102 22 7.04244 22 10.0005V16.0001C22 19.5933 17.3041 20.9552 15.3815 17.9196C14.0112 15.7559 10.8803 15.6837 9.4116 17.7818L9.12736 18.1879C6.93073 21.3259 2 19.7716 2 15.9412L2 15.0001" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
      <Circle cx="18" cy="9.97559" r="1" fill={color} />
      <Circle cx="16" cy="12.9756" r="1" fill={color} />
      <Path d="M8 13.4756L8 9.47565" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 11.4756H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export default Icon;
