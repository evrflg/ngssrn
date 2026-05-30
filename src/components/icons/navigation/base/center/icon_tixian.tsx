
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
        <G filter="url(#filter0_d_1338_4412)">
          <Circle cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4412)" />
        </G>
        <Path d="M17.9893 34.6592C18.1936 34.6592 18.3604 34.8346 18.3604 35.0469V35.4277C18.3602 35.643 18.1935 35.8144 17.9893 35.8145H15.6631C15.4588 35.8144 15.2922 35.6398 15.292 35.4277V35.0469C15.292 34.8315 15.4587 34.6592 15.6631 34.6592H17.9893Z" fill={backgroundColor} />
        <Path d="M22.3594 34.6562C22.508 34.6563 22.6289 34.7814 22.6289 34.9375V35.5332C22.6289 35.6861 22.508 35.8144 22.3594 35.8145H19.8262C19.6775 35.8145 19.5567 35.6893 19.5566 35.5332V34.9375C19.5566 34.7845 19.6775 34.6562 19.8262 34.6562H22.3594Z" fill={backgroundColor} />
        <Path d="M35.0078 33.1953C35.1905 33.1953 35.3236 33.3734 35.2803 33.5576L34.8008 35.5928C34.7698 35.7238 34.6583 35.8143 34.5283 35.8145H30.709C30.5264 35.8143 30.3933 35.6362 30.4365 35.4521L30.917 33.417C30.948 33.2859 31.0594 33.1953 31.1895 33.1953H35.0078Z" fill={backgroundColor} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM14 26.7354V36.5703C14.0001 37.357 14.6164 38 15.3721 38H36.6279C37.3836 38 37.9999 37.357 38 36.5703V26.7354H14ZM21.6162 14.0312C20.8773 13.8697 20.1412 14.3486 19.9795 15.1006L18.9619 19.877H37.4697C38.332 19.8771 39.0359 20.5917 39.0361 21.4678V32C39.2739 31.8074 39.4517 31.534 39.5215 31.2109L41.9316 19.9209C42.0902 19.1688 41.6139 18.4194 40.875 18.2578L21.6162 14.0312ZM15.3721 21C14.6165 21 14.0002 21.6431 14 22.4297V24.8438H38V22.4297C37.9998 21.6431 37.3804 21 36.6279 21H15.3721Z" fill={backgroundColor} />
        <Defs>
          <Filter id="filter0_d_1338_4412" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4412" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1338_4412" result="shape" />
          </Filter>
          <LinearGradient id="paint0_linear_1338_4412" x1="2" y1="27" x2="52" y2="27" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;
