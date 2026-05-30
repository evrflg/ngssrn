
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
      <Circle cx="17.5" cy="4.5" r="2.5" fill={color} stroke={color} strokeWidth="1.5" />
      <Circle cx="5.5" cy="11.5" r="2.5" fill={color} stroke={color} strokeWidth="1.5" />
      <Path opacity={opacity} d="M15 6L8 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path opacity={opacity} d="M7.5 13.5L15 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="17.5" cy="19.5" r="2.5" fill={color} stroke={color} strokeWidth="1.5" />

    </Svg>
  );
};

export default Icon;
