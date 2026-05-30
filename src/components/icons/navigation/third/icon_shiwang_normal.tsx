
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
      <Mask id="mask0_698_13348" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <Rect width="24" height="24" fill="#D9D9D9" />
      </Mask>
      <G mask="url(#mask0_698_13348)">
        <Path d="M3.35288 8.95043C4.00437 6.17301 6.17301 4.00437 8.95043 3.35288C10.9563 2.88237 13.0437 2.88237 15.0496 3.35288C17.827 4.00437 19.9956 6.17301 20.6471 8.95044C21.1176 10.9563 21.1176 13.0437 20.6471 15.0496C19.9956 17.827 17.827 19.9956 15.0496 20.6471C13.0437 21.1176 10.9563 21.1176 8.95044 20.6471C6.17301 19.9956 4.00437 17.827 3.35288 15.0496C2.88237 13.0437 2.88237 10.9563 3.35288 8.95043Z" fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5" />
        <Path d="M15.5417 12H8.45833C7.65833 12 7 11.21 7 10.25V7.75C7 6.79 7.65833 6 8.45833 6H15.5417C16.3417 6 17 6.79 17 7.75V10.25C17 11.21 16.3417 12 15.5417 12Z" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" fill='none' />
        <Path d="M10.3 15.2793L8 17.5793" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8.03125 15.3105L10.3312 17.6105" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M16.4883 15.3301H16.5083" stroke={color} strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M14.4883 17.5005V17.4805" stroke={color} strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
};

export default Icon;
