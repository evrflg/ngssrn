
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
        <Path d="M8.48528 41.0122C3.79899 36.3259 3.79899 28.7279 8.48528 24.0416L24.0416 8.48529C28.7279 3.79899 36.3259 3.799 41.0122 8.48529L56.5685 24.0416C61.2548 28.7279 61.2548 36.3259 56.5685 41.0122L41.0122 56.5685C36.3259 61.2548 28.7279 61.2548 24.0416 56.5685L8.48528 41.0122Z" fill="url(#paint0_linear_1338_4621)" />
        <Path d="M38.0935 31.8875C38.8069 31.8876 39.3844 32.3855 39.3845 32.9998C39.3845 33.6142 38.8069 34.1119 38.0935 34.1121C37.38 34.112 36.8015 33.6142 36.8015 32.9998C36.8016 32.3855 37.3801 31.8876 38.0935 31.8875Z" fill={backgroundColor} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M25.4558 10.5984C29.361 6.69318 35.6931 6.69318 39.5984 10.5984L54.4558 25.4558C58.3609 29.3611 58.361 35.6932 54.4558 39.5984L39.5984 54.4558C35.6932 58.361 29.361 58.361 25.4558 54.4558L10.5984 39.5984C6.69312 35.6932 6.69312 29.3611 10.5984 25.4558L25.4558 10.5984ZM22.8142 20.9998C20.711 21.0001 18.9989 22.6749 18.9988 24.7391V41.2605C18.9988 43.3217 20.7078 44.9995 22.8142 44.9998H43.1833C45.2867 44.9996 46.9988 43.3248 46.9988 41.2605V37.8435H37.2136C34.8034 37.8434 32.8318 35.9105 32.8318 33.5486V32.451C32.8319 30.0892 34.8035 28.1562 37.2136 28.156H46.9988V24.7391C46.9986 22.6778 45.2865 20.9999 43.1863 20.9998H22.8142ZM36.905 29.9998C36.1334 29.9998 35.4031 30.2608 34.8542 30.7361C34.3022 31.2114 33.9989 31.8375 33.9988 32.5017V33.4978C33.9989 34.1621 34.3023 34.7881 34.8542 35.2635C35.4063 35.7388 36.1334 35.9997 36.905 35.9998H46.9988V29.9998H36.905Z" fill={backgroundColor} />
        <Defs>
          <LinearGradient id="paint0_linear_1338_4621" x1="5" y1="32.9957" x2="60.5" y2="32.9957" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;