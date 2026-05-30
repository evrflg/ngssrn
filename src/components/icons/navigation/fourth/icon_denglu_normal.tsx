
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
      <Path opacity={opacity}
        d="M18 2C20.2091 2 22 3.79086 22 6V18C22 20.2091 20.2091 22 18 22H13C10.7909 22 9 20.2091 9 18V6C9 3.79086 10.7909 2 13 2H18Z"
        fill={color} />
      <Path d="M14 15L16.2929 12.7071C16.6834 12.3166 16.6834 11.6834 16.2929 11.2929L14 9M16 12L4 12"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" />

    </Svg>
  );
};

export default Icon;