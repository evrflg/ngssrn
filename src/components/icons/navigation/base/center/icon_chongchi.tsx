
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
import React from 'react';
import { View } from 'react-native';
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
        <G filter="url(#filter0_d_1338_4399)">
          <Circle  cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle  cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4399)" />
        </G>
        <Path fillRule="evenodd" clipRule="evenodd" d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM16.6504 21C15.192 21.0002 14 22.1887 14 23.6416V37.3594C14.0002 38.8121 15.1921 39.9998 16.6504 40H37.3496C38.8079 39.9998 39.9998 38.8121 40 37.3594V33.0605C40 32.7068 39.7115 32.419 39.3564 32.4189H33.3447C31.8863 32.4189 30.6946 31.2312 30.6943 29.7783C30.6945 28.3254 31.8863 27.1377 33.3447 27.1377H39.3564C39.7113 27.1408 39.9997 26.8535 40 26.5V23.6416C40 22.1887 38.808 21.0002 37.3496 21H16.6504ZM33.5566 28.1426C32.7603 28.1426 32.1104 28.7972 32.1104 29.5996C32.1106 30.4051 32.7574 31.0566 33.5537 31.0566C34.3531 31.0565 34.9998 30.4047 35 29.6025V29.5996C35 28.7939 34.353 28.1426 33.5566 28.1426ZM17.7842 14.0654C17.1667 13.9871 16.5953 14.4652 16.5107 15.1299L16 19.1719L34.0508 19.1123L34.2656 17.4131C34.3501 16.7483 33.9143 16.1393 33.2969 16.0605L17.7842 14.0654Z" fill={backgroundColor} />
        <Defs>
          <Filter id="filter0_d_1338_4399" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4399" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1338_4399" result="shape" />
          </Filter>
          <LinearGradient id="paint0_linear_1338_4399" x1="2" y1="27" x2="52" y2="27" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;