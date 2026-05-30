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
        <Path d="M8.48528 41.0122C3.79899 36.3259 3.79899 28.7279 8.48528 24.0416L24.0416 8.48529C28.7279 3.79899 36.3259 3.799 41.0122 8.48529L56.5685 24.0416C61.2548 28.7279 61.2548 36.3259 56.5685 41.0122L41.0122 56.5685C36.3259 61.2548 28.7279 61.2548 24.0416 56.5685L8.48528 41.0122Z" fill="url(#paint0_linear_1338_4629)" />
        <Path fillRule="evenodd" clipRule="evenodd" d="M25.4558 10.5984C29.361 6.69318 35.6931 6.69318 39.5984 10.5984L54.4558 25.4558C58.3609 29.3611 58.361 35.6932 54.4558 39.5984L39.5984 54.4558C35.6932 58.361 29.361 58.361 25.4558 54.4558L10.5984 39.5984C6.69312 35.6932 6.69312 29.3611 10.5984 25.4558L25.4558 10.5984ZM22.6501 25.9998C21.1918 26.0001 19.9997 27.1885 19.9997 28.6414V42.3592C19.9998 43.8119 21.1919 44.9995 22.6501 44.9998H43.3493C44.8077 44.9996 45.9996 43.812 45.9997 42.3592V38.0603C45.9997 37.7066 45.7112 37.4188 45.3562 37.4187H39.3445C37.8861 37.4186 36.6942 36.231 36.6941 34.7781C36.6942 33.3253 37.8861 32.1376 39.3445 32.1375H45.3562C45.7111 32.1406 45.9995 31.8534 45.9997 31.4998V28.6414C45.9997 27.1885 44.8077 26 43.3493 25.9998H22.6501ZM39.5564 33.1424C38.7601 33.1425 38.1101 33.7971 38.1101 34.5994C38.1102 35.4049 38.7572 36.0563 39.5534 36.0564C40.3529 36.0563 40.9996 35.4046 40.9997 34.6023V34.5994C40.9997 33.7937 40.3528 33.1424 39.5564 33.1424ZM23.7839 19.0652C23.1666 18.987 22.595 19.4651 22.5105 20.1297L21.9997 24.1717L40.0505 24.1121L40.2654 22.4129C40.3499 21.7481 39.9141 21.1391 39.2966 21.0603L23.7839 19.0652Z" fill={backgroundColor} />
        <Defs>
          <LinearGradient id="paint0_linear_1338_4629" x1="5" y1="32.9957" x2="60.5" y2="32.9957" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;
