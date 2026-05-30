
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
        <G filter="url(#filter0_d_1338_4541)">
          <Circle cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4541)" />
        </G>
        <Path d="M33.4629 30.4004C33.8763 30.4004 34.2146 30.7128 34.2148 31.0947C34.218 31.4769 33.8762 31.79 33.4658 31.79H20.5361C20.1226 31.79 19.7852 31.4769 19.7852 31.0947C19.7854 30.7128 20.1227 30.4004 20.5361 30.4004H33.4629Z" fill={backgroundColor} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM14.999 27.8672C13.6672 29.0959 13.6671 31.0916 14.999 32.3203L24.5928 40.0781C25.9249 41.3069 28.0812 41.3069 29.4102 40.0781L39.0029 32.3203C40.3319 31.0916 40.3319 29.0992 39.0029 27.8672H14.999ZM27.001 13C21.221 13.0001 16.5332 17.8889 16.5332 23.9238C16.5332 24.9186 16.6595 25.8805 16.8994 26.793H25.7734L23.248 24.1572C23.1249 24.0288 23.1249 23.8179 23.248 23.6895L26.7773 20.0068C26.9005 19.8785 27.1025 19.8784 27.2256 20.0068L30.7549 23.6895C30.8779 23.8178 30.8777 24.0287 30.7549 24.1572L28.2295 26.793H37.1025C37.3393 25.8772 37.4687 24.9153 37.4688 23.9238C37.4656 17.8921 32.781 13 27.001 13Z" fill={backgroundColor} />
        <Defs>
          <Filter id="filter0_d_1338_4541" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4541" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1338_4541" result="shape" />
          </Filter>
          <LinearGradient id="paint0_linear_1338_4541" x1="2" y1="27" x2="52" y2="27" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;
