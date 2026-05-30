import Svg, { Path, Mask, Rect, G } from 'react-native-svg';

interface Props {
  color: string;
  fillOpacity?: string;
}

const Icon = ({ color, fillOpacity = '0.15' }: Props) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Mask id="mask0_698_13409" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <Rect width="24" height="24" fill="#D9D9D9" />
      </Mask>
      <G mask="url(#mask0_698_13409)">
        <Path d="M8.73525 8.95043C9.16958 6.17301 10.6153 4.00437 12.467 3.35288C13.8042 2.88237 15.1958 2.88237 16.533 3.35288C18.3847 4.00437 19.8304 6.17301 20.2647 8.95044C20.5784 10.9563 20.5784 13.0437 20.2647 15.0496C19.8304 17.827 18.3847 19.9956 16.533 20.6471C15.1958 21.1176 13.8042 21.1176 12.467 20.6471C10.6153 19.9956 9.16958 17.827 8.73525 15.0496C8.42158 13.0437 8.42158 10.9563 8.73525 8.95043Z" fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5" />
        <Path d="M4 12L14.5 12M14.5 12L12 9.5M14.5 12L12 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  )
}

export default Icon;
