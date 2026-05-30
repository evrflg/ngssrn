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
        <G filter="url(#filter0_d_1338_4476)">
          <Circle cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4476)" />
        </G>
        <Path fillRule="evenodd" clipRule="evenodd" d="M31.8906 20.3105C32.1404 20.2202 32.4107 20.2031 32.6699 20.2607C32.9294 20.3185 33.1675 20.4488 33.3555 20.6367C33.5432 20.8245 33.6737 21.0621 33.7314 21.3213C33.7892 21.5807 33.7711 21.8517 33.6807 22.1016L31.1211 29.2246C30.9636 29.6606 30.7126 30.057 30.3848 30.3848C30.057 30.7126 29.6606 30.9636 29.2246 31.1211L22.1016 33.6807C21.8517 33.7711 21.5807 33.7892 21.3213 33.7314C21.0621 33.6737 20.8245 33.5432 20.6367 33.3555C20.4488 33.1675 20.3185 32.9294 20.2607 32.6699C20.2031 32.4107 20.2202 32.1404 20.3105 31.8906L22.8945 24.7754C23.052 24.3393 23.304 23.9431 23.6318 23.6152C23.9597 23.2874 24.3559 23.0364 24.792 22.8789L31.9062 20.3105H31.8906ZM27 28.75H27.0166C27.0144 28.75 27.012 28.749 27.0098 28.749C27.0065 28.749 27.0033 28.75 27 28.75ZM27.3643 25.2852C27.0244 25.2163 26.6713 25.2499 26.3506 25.3818C26.0299 25.5138 25.7555 25.7382 25.5625 26.0264C25.3696 26.3145 25.2666 26.6533 25.2666 27C25.2666 27.4641 25.4511 27.9091 25.7793 28.2373C26.1059 28.5639 26.5481 28.7473 27.0098 28.749C27.3532 28.7503 27.6894 28.6514 27.9766 28.4629C28.2665 28.2726 28.493 28.0001 28.6279 27.6807C28.7628 27.3613 28.8 27.0094 28.7344 26.6689C28.6687 26.3285 28.5038 26.0149 28.2598 25.7686C28.0158 25.5223 27.704 25.3541 27.3643 25.2852Z" fill={backgroundColor} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM27 13C23.287 13 19.7261 14.4751 17.1006 17.1006C14.4751 19.7261 13 23.287 13 27C13 29.7689 13.821 32.476 15.3594 34.7783C16.8977 37.0805 19.0845 38.875 21.6426 39.9346C24.2007 40.9941 27.0158 41.2716 29.7314 40.7314C32.4471 40.1912 34.9415 38.8573 36.8994 36.8994C38.8573 34.9415 40.1912 32.4471 40.7314 29.7314C41.2716 27.0158 40.9941 24.2007 39.9346 21.6426C38.875 19.0845 37.0805 16.8977 34.7783 15.3594C32.476 13.821 29.7689 13 27 13Z" fill={backgroundColor} />
        <Defs>
          <Filter id="filter0_d_1338_4476" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4476" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1338_4476" result="shape" />
          </Filter>
          <LinearGradient id="paint0_linear_1338_4476" x1="2" y1="27" x2="52" y2="27" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;
