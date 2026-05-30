
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  color: string;
  opacity?: string;
}

const Icon: React.FC<Props> = ({
  color,
  opacity = 0.3,
}) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Path d="M12 7.5V7C12 6.17157 11.3284 5.5 10.5 5.5C9.67157 5.5 9 4.82843 9 4V3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path opacity={opacity} d="M17 7.25C20.1756 7.25 22.75 9.82436 22.75 13V17C22.75 20.1756 20.1756 22.75 17 22.75H7C3.82436 22.75 1.25 20.1756 1.25 17V13C1.25 9.82436 3.82436 7.25 7 7.25H17Z" fill={color} />
      <Circle cx="18" cy="13.5" r="1" fill={color} />
      <Circle cx="16" cy="16.5" r="1" fill={color} />
      <Path d="M8 17L8 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 15H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export default Icon;
