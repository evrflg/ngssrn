
import React from 'react';
import { View } from 'react-native';
import Svg, {
  Path,
  Defs,
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
  const size = 66;
  const gradientStart = color;
  const gradientEnd = colorMix(color);

  return (
    <View style={{
      width: 25,
      height: 25,
    }
    }>
      <Svg width={size} height={size} viewBox="0 0 66 66" fill="none" style={{
        position: 'absolute',
        left: '50%',
        transform: [
          { translateX: -size * 0.46 },
          { translateY: -40 },
        ],
      }}>
        <Path d="M8.48528 41.0122C3.79899 36.3259 3.79899 28.7279 8.48528 24.0416L24.0416 8.48529C28.7279 3.79899 36.3259 3.799 41.0122 8.48529L56.5685 24.0416C61.2548 28.7279 61.2548 36.3259 56.5685 41.0122L41.0122 56.5685C36.3259 61.2548 28.7279 61.2548 24.0416 56.5685L8.48528 41.0122Z" fill="url(#paint0_linear_1338_4667)" />
        <Path d="M37.0935 33.8797C37.4216 33.4628 38.03 33.3929 38.447 33.7244C38.8639 34.0551 38.9318 34.6619 38.6003 35.0789L33.8054 41.1189C33.6072 41.3667 33.323 41.4927 33.029 41.4842C32.7455 41.4857 32.4615 41.3597 32.2702 41.1189L27.4753 35.0789C27.2805 34.8337 27.2258 34.523 27.2976 34.241C27.3454 34.0438 27.458 33.8602 27.6286 33.7244C28.0455 33.393 28.654 33.463 28.9822 33.8797L33.0398 38.9842L37.0935 33.8797Z" fill={backgroundColor} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M25.4558 10.5984C29.361 6.69318 35.6931 6.69318 39.5984 10.5984L54.4558 25.4558C58.3609 29.3611 58.361 35.6932 54.4558 39.5984L39.5984 54.4558C35.6932 58.361 29.361 58.361 25.4558 54.4558L10.5984 39.5984C6.69312 35.6932 6.69312 29.3611 10.5984 25.4558L25.4558 10.5984ZM18.9997 30.6502L31.2741 45.3201C32.0657 46.2657 33.5163 46.2762 34.322 45.3426L46.9997 30.6502H18.9997ZM26.0681 22.6248C24.8664 22.6248 23.7281 23.1653 22.9685 24.0965L18.9997 28.9607H46.9997L42.5935 23.9754C41.8342 23.1166 40.7427 22.6248 39.5964 22.6248H26.0681Z" fill={backgroundColor} />
        <Defs>
          <LinearGradient id="paint0_linear_1338_4667" x1="5" y1="32.9957" x2="60.5" y2="32.9957" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;