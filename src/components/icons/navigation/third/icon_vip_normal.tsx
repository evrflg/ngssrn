
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
      <Mask id="mask0_698_13366" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <Rect width="24" height="24" fill="#D9D9D9" />
      </Mask>
      <G mask="url(#mask0_698_13366)">
        <Path d="M20.4433 8.94418C21.3272 7.3252 19.3271 4.00034 16.2157 4L11.8275 4L7.44302 4.00592C4.32749 4.00592 2.32749 6.82485 3.20928 8.94409L8.66114 17.8709C9.95928 20.4739 13.67 20.4768 14.9721 17.8757L20.4433 8.94418Z" fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5" />
        <Path d="M8.7998 10L10.9998 12.9333C11.3998 13.4667 12.1998 13.4667 12.5998 12.9333L14.7998 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </G>
    </Svg>
  );
};

export default Icon;
