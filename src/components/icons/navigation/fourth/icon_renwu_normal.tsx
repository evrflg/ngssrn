
import Svg, { Path } from 'react-native-svg';

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
      <Path opacity={opacity} d="M3.25 6C3.25 3.37665 5.37665 1.25 8 1.25H16C18.6234 1.25 20.75 3.37665 20.75 6V18C20.75 20.6234 18.6234 22.75 16 22.75H8C5.37665 22.75 3.25 20.6234 3.25 18V6Z" fill={color} />
      <Path d="M8 7H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M8 12H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M8 17H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

    </Svg>
  );
};

export default Icon;
