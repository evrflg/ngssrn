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
        <G filter="url(#filter0_d_1338_4520)">
          <Circle cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4520)" />
        </G>
        <Path fillRule="evenodd" clipRule="evenodd" d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM35.4854 13.1064C34.4627 12.8754 33.3908 13.0247 32.4707 13.5273C31.5507 14.0299 30.8454 14.8507 30.4873 15.8359C30.1292 16.8213 30.1426 17.9038 30.5254 18.8799L24.0273 23.5039C23.0934 22.5713 21.8961 21.9467 20.5967 21.7148C19.2975 21.483 17.9586 21.6552 16.7598 22.207C15.5608 22.759 14.5593 23.6648 13.8906 24.8027C13.2221 25.9405 12.9183 27.2556 13.0195 28.5713C13.1209 29.8872 13.6221 31.141 14.457 32.1631C15.292 33.1852 16.4202 33.9271 17.6895 34.2891C18.9588 34.651 20.3091 34.6156 21.5576 34.1875C22.8061 33.7594 23.8937 32.9591 24.6738 31.8945L32.4766 35.8057C32.2607 36.8316 32.4271 37.901 32.9434 38.8135C33.4596 39.7259 34.2907 40.4193 35.2812 40.7627C36.2718 41.1061 37.3539 41.0758 38.3242 40.6787C39.2943 40.2816 40.0862 39.5446 40.5518 38.6055C41.0173 37.6661 41.1243 36.5887 40.8525 35.5762C40.5808 34.5637 39.9494 33.6846 39.0762 33.1045C38.203 32.5244 37.148 32.283 36.1094 32.4248C35.0706 32.5668 34.1192 33.0829 33.4336 33.876L25.6426 29.9717C26.1201 28.4111 25.9892 26.7269 25.2764 25.2588L31.7881 20.624C32.5955 21.2928 33.619 21.6451 34.667 21.6133C35.7149 21.5814 36.7152 21.1677 37.4805 20.4512C38.2457 19.7345 38.7238 18.7633 38.8242 17.7197C38.9246 16.6763 38.6409 15.6316 38.0264 14.7822C37.4118 13.9329 36.508 13.3375 35.4854 13.1064Z" fill={backgroundColor} />
        <Defs>
          <Filter id="filter0_d_1338_4520" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4520" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1338_4520" result="shape" />
          </Filter>
          <LinearGradient id="paint0_linear_1338_4520" x1="2" y1="27" x2="52" y2="27" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;
