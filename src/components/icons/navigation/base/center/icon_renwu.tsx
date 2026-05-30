
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
        <G filter="url(#filter0_d_1338_4495)">
          <Circle cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4495)" />
        </G>
        <Path d="M31.1123 28.2686C31.6591 27.7436 32.5342 27.7437 33.0811 28.2686C33.6279 28.7936 33.6279 29.6248 33.0811 30.1279L27.1748 35.7285C26.6279 36.2532 25.7528 36.2533 25.2061 35.7285L21.9248 32.6221C21.378 32.119 21.3781 31.2877 21.9248 30.7627C22.4717 30.2377 23.3467 30.2377 23.8936 30.7627L26.1904 32.9502L31.1123 28.2686Z" fill={backgroundColor} />
        <Path d="M27.0654 15.0781C28.0717 15.0781 28.9033 15.8879 28.9033 16.916C28.9031 17.9221 28.0716 18.7529 27.0654 18.7529C26.0594 18.7528 25.2287 17.922 25.2285 16.916C25.2285 15.9098 26.0593 15.0782 27.0654 15.0781Z" fill={backgroundColor} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM16.9375 16.8936C15.9312 16.8936 15.0996 17.7252 15.0996 18.7314V38.9004C15.0998 39.9065 15.9314 40.7373 16.9375 40.7373H37.1934C38.1995 40.7373 39.0314 39.9065 39.0098 38.9004V18.7314C39.0098 17.7252 38.1781 16.8936 37.1719 16.8936H36.2529V19.6504C36.2527 20.6563 35.422 21.4871 34.416 21.4873H19.6934C18.6874 21.4871 17.8567 20.6563 17.8564 19.6504V16.8936H16.9375ZM25.3154 13.2402C24.353 14.159 24.3094 14.2032 20.6348 16.8936V17.8125C20.6348 18.8187 21.4655 19.6503 22.4717 19.6504H31.6592C32.6873 19.6504 33.4971 18.8406 33.4971 17.8125V16.8936C29.8439 14.2029 29.8656 14.0934 28.9688 13.2402H25.3154Z" fill={backgroundColor} />
        <Defs>
          <Filter id="filter0_d_1338_4495" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4495" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1338_4495" result="shape" />
          </Filter>
          <LinearGradient id="paint0_linear_1338_4495" x1="2" y1="27" x2="52" y2="27" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;
