
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
        <Path d="M8.48528 41.0121C3.79899 36.3258 3.79899 28.7279 8.48528 24.0416L24.0416 8.48523C28.7279 3.79893 36.3259 3.79893 41.0122 8.48523L56.5685 24.0416C61.2548 28.7279 61.2548 36.3258 56.5685 41.0121L41.0122 56.5685C36.3259 61.2548 28.7279 61.2548 24.0416 56.5685L8.48528 41.0121Z" fill="url(#paint0_linear_1338_4763)" />
        <Path d="M39.4626 36.4001C39.8762 36.4001 40.2146 36.7133 40.2146 37.0954C40.2175 37.4773 39.8766 37.7896 39.4665 37.7898H26.5359C26.1225 37.7897 25.7851 37.4773 25.7849 37.0954C25.7849 36.7134 26.1224 36.4002 26.5359 36.4001H39.4626Z" fill={backgroundColor} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M25.4558 10.5984C29.361 6.69312 35.6931 6.69312 39.5984 10.5984L54.4558 25.4558C58.3607 29.3609 58.3606 35.6922 54.4558 39.5974L39.5984 54.4558C35.6932 58.361 29.361 58.3609 25.4558 54.4558L10.5984 39.5984C6.69312 35.6931 6.69312 29.361 10.5984 25.4558L25.4558 10.5984ZM20.9988 33.8669C19.667 35.0956 19.6671 37.0914 20.9988 38.32L30.5925 46.0788C31.9246 47.3073 34.0809 47.3074 35.4099 46.0788L45.0036 38.32C46.3321 37.0914 46.3322 35.0988 45.0036 33.8669H20.9988ZM33.0007 18.9997C27.2209 19 22.5329 23.8887 22.5329 29.9236C22.5329 30.9183 22.6593 31.8803 22.8991 32.7927H31.7732L29.2478 30.1579C29.1247 30.0295 29.1249 29.8187 29.2478 29.6902L32.7771 26.0066C32.9002 25.8782 33.1022 25.8782 33.2253 26.0066L36.7546 29.6902C36.8775 29.8187 36.8776 30.0296 36.7546 30.1579L34.2292 32.7927H43.1032C43.34 31.877 43.4695 30.915 43.4695 29.9236C43.4663 23.8919 38.7808 18.9997 33.0007 18.9997Z" fill={backgroundColor} />
        <Defs>
          <LinearGradient id="paint0_linear_1338_4763" x1="5" y1="32.9956" x2="60.5" y2="32.9956" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;