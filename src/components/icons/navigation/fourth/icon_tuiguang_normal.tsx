
import Svg, { Path, Mask, Rect, G } from 'react-native-svg';

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
      <Mask id="mask0_706_13675" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <Rect width="24" height="24" fill="#D9D9D9" />
      </Mask>
      <G mask="url(#mask0_706_13675)">
        <Path opacity={opacity} d="M2 9.41309C2 6.44357 4.40744 4.03613 7.37695 4.03613L10.4689 4.03613C11.4869 4.03613 12.3921 3.42745 13.2794 2.9285C13.7646 2.65565 14.3245 2.5 14.9209 2.5C16.5116 2.5 17.8871 3.61683 18.126 5.18945C18.3297 6.53108 18.5215 8.13589 18.5215 9.41309C18.5215 10.6903 18.3297 12.2951 18.126 13.6367C17.887 15.2093 16.5115 16.3262 14.9209 16.3262C14.3245 16.3262 13.7646 16.1705 13.2793 15.8976C12.3921 15.3987 11.4869 14.79 10.469 14.79H7.37695C4.40745 14.79 2.00002 12.3826 2 9.41309Z" fill={color} stroke={color} strokeWidth="1.5" />
        <Path d="M20.834 7.15234C21.5369 7.6197 22.0002 8.41888 22.0002 9.32625C22.0002 10.2336 21.5369 11.0328 20.834 11.5002" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <Path d="M2.94629 15.3115C4.18001 16.2397 5.7142 16.79 7.37695 16.79H7.47168L8.45117 20.2344C8.68204 20.9814 8.25633 21.7718 7.5 22L6.46484 22.2881C5.70855 22.5163 4.90802 22.0955 4.67676 21.3486L2.94629 15.3115Z" fill={color} />
      </G>
    </Svg>
  );
};

export default Icon;
