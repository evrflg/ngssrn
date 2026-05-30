
import React from 'react';
import { View } from 'react-native';
import Svg, {
  G,
  Circle,
  Path,
  Defs,
  Filter,
  FeFlood,
  FeColorMatrix,
  FeOffset,
  FeGaussianBlur,
  FeComposite,
  FeBlend,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { colorMix } from '@/utils/color';

interface Props {
  color: string; // 主题颜色
  backgroundColor: string; // 背景颜色
}

const CenterIcon: React.FC<Props> = ({
  color,
  backgroundColor,
}) => {
  const size = 54;
  const gradientStart = color;
  const gradientEnd = colorMix(color);

  return (
    <View style={{
      width: 25,
      height: 25,
    }
    }>
      <Svg width={size} height={size} viewBox="0 0 54 54" fill="none" style={{
        position: 'absolute',
        left: '50%',
        transform: [
          { translateX: -size * 0.49 },
          { translateY: -40 },
        ],
      }}>
        <G filter="url(#filter0_d_1338_4444)">
          <Circle cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4444)" />
        </G>
        <Path d="M31.0938 26.8799C31.4219 26.4629 32.0303 26.3931 32.4473 26.7246C32.864 27.0553 32.9321 27.6622 32.6006 28.0791L27.8057 34.1191C27.6075 34.3669 27.3232 34.4929 27.0293 34.4844C26.7458 34.4859 26.4618 34.3599 26.2705 34.1191L21.4756 28.0791C21.2808 27.8339 21.2261 27.5232 21.2979 27.2412C21.3457 27.044 21.4583 26.8604 21.6289 26.7246C22.0458 26.3931 22.6542 26.4631 22.9824 26.8799L27.04 31.9844L31.0938 26.8799Z" fill={backgroundColor} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM13 23.6504L25.2744 38.3203C26.066 39.2657 27.5166 39.2764 28.3223 38.3428L41 23.6504H13ZM20.0684 15.625C18.8666 15.625 17.7284 16.1655 16.9688 17.0967L13 21.9609H41L36.5938 16.9756C35.8345 16.1168 34.743 15.625 33.5967 15.625H20.0684Z" fill={backgroundColor} />
        <Defs>
          <Filter id="filter0_d_1338_4444" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4444" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1338_4444" result="shape" />
          </Filter>
          <LinearGradient id="paint0_linear_1338_4444" x1="2" y1="27" x2="52" y2="27" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;
