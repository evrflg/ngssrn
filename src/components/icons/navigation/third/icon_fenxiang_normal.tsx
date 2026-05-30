
import Svg, { Path, Mask, Rect, G } from 'react-native-svg';

interface Props {
  color: string;
  fillOpacity?: string;
}

const Icon: React.FC<Props> = ({
  color,
  fillOpacity = 0.15,
}) => {

  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Mask id="mask0_698_13382" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <Rect width="24" height="24" fill="#D9D9D9" />
      </Mask>
      <G mask="url(#mask0_698_13382)">
        <Path d="M3.68764 9.06849C4.31391 6.39859 6.39859 4.31391 9.06849 3.68764C10.9967 3.23535 13.0033 3.23535 14.9315 3.68764C17.6014 4.31391 19.6861 6.39859 20.3124 9.0685C20.7646 10.9967 20.7647 13.0033 20.3124 14.9315C19.6861 17.6014 17.6014 19.6861 14.9315 20.3124C13.0033 20.7647 10.9967 20.7646 9.0685 20.3124C6.3986 19.6861 4.31391 17.6014 3.68764 14.9315C3.23535 13.0033 3.23535 10.9967 3.68764 9.06849Z" fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5" />
        <Path d="M14.4368 11.488H14.1627C13.6105 11.488 13.1627 11.0403 13.1627 10.488V8.6083C13.1627 7.93636 12.7875 7.80037 12.3299 8.30432L12 8.66829L9.20859 11.748C8.82513 12.168 8.98594 12.512 9.56318 12.512H9.83726C10.3895 12.512 10.8373 12.9597 10.8373 13.512V15.3917C10.8373 16.0636 11.2125 16.1996 11.6701 15.6957L12 15.3317L14.7914 12.252C15.1749 11.832 15.0141 11.488 14.4368 11.488Z" stroke={color} strokeWidth="1.5" fill="none" />
      </G>
    </Svg>
  );
};

export default Icon;
