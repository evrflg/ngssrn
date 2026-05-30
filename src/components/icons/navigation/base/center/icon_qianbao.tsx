
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
        <G filter="url(#filter0_d_1338_4391)">
          <Circle cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4391)" />
        </G>
        <Path d="M32.0938 25.8877C32.8072 25.8879 33.3848 26.3856 33.3848 27C33.3848 27.6144 32.8072 28.1121 32.0938 28.1123C31.3801 28.1123 30.8018 27.6145 30.8018 27C30.8018 26.3855 31.3801 25.8877 32.0938 25.8877Z" fill={backgroundColor} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM16.8145 15C14.7111 15.0002 12.999 16.675 12.999 18.7393V35.2607C12.999 37.322 14.708 38.9998 16.8145 39H37.1836C39.287 38.9998 40.999 37.325 40.999 35.2607V31.8438H31.2139C28.8036 31.8437 26.832 29.9108 26.832 27.5488V26.4512C26.832 24.0892 28.8036 22.1563 31.2139 22.1562H40.999V18.7393C40.999 16.678 39.2869 15.0001 37.1865 15H16.8145ZM30.9053 24C30.1336 24 29.4034 24.2609 28.8545 24.7363C28.3024 25.2117 27.9991 25.8376 27.999 26.502V27.498C27.9991 28.1624 28.3024 28.7883 28.8545 29.2637C29.4066 29.7391 30.1336 30 30.9053 30H40.999V24H30.9053Z" fill={backgroundColor} />
        <Defs>
          <Filter id="filter0_d_1338_4391" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4391" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1338_4391" result="shape" />
          </Filter>
          <LinearGradient id="paint0_linear_1338_4391" x1="2" y1="27" x2="52" y2="27" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;
