
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
      <Path opacity={opacity} d="M17 7C17.26 7 17.51 7.00981 17.75 7.0498C20.2508 7.34059 21.8964 9.14424 21.9951 11.75H19C17.4858 11.75 16.25 12.9858 16.25 14.5C16.25 16.0142 17.4858 17.25 19 17.25H21.9951C21.8869 20.1106 19.9159 22 17 22H7C4 22 2 20 2 17V12C2 9.28 3.64043 7.37957 6.19043 7.05957C6.45028 7.01962 6.72017 7 7 7H17Z" fill={color} />
      <Path d="M17.5 14.5C17.5 13.6716 18.1716 13 19 13L22 13V16H19C18.1716 16 17.5 15.3284 17.5 14.5Z" fill={color} />
      <Path d="M16.2 4.82C16.47 5.09 16.24 5.51 15.86 5.51L8.18 5.5C7.74 5.5 7.51 4.96 7.83 4.65L9.45 3.02C10.82 1.66 13.04 1.66 14.41 3.02L16.16 4.79C16.17 4.8 16.19 4.81 16.2 4.82Z" fill={color} />
    </Svg>
  );
};

export default Icon;
