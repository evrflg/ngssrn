
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
        <Path d="M8.48528 41.0122C3.79899 36.3259 3.79899 28.7279 8.48528 24.0416L24.0416 8.48529C28.7279 3.79899 36.3259 3.799 41.0122 8.48529L56.5685 24.0416C61.2548 28.7279 61.2548 36.3259 56.5685 41.0122L41.0122 56.5685C36.3259 61.2548 28.7279 61.2548 24.0416 56.5685L8.48528 41.0122Z" fill="url(#paint0_linear_1338_4719)" />
        <Path d="M37.112 33.2683C37.6588 32.7434 38.5339 32.7437 39.0808 33.2683C39.6277 33.7933 39.6277 34.6245 39.0808 35.1277L33.1745 40.7282C32.6276 41.253 31.7526 41.2532 31.2058 40.7282L27.9245 37.6218C27.378 37.1187 27.3779 36.2874 27.9245 35.7624C28.4713 35.2375 29.3464 35.2376 29.8933 35.7624L32.1902 37.9499L37.112 33.2683Z" fill={backgroundColor} />
        <Path d="M33.0652 20.0779C34.0714 20.0779 34.9031 20.8876 34.9031 21.9157C34.903 22.9219 34.0714 23.7527 33.0652 23.7527C32.0592 23.7524 31.2283 22.9218 31.2282 21.9157C31.2282 20.9096 32.0591 20.0781 33.0652 20.0779Z" fill={backgroundColor} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M25.4558 10.5984C29.361 6.69312 35.6931 6.69312 39.5984 10.5984L54.4558 25.4558C58.3609 29.361 58.361 35.6932 54.4558 39.5984L39.5984 54.4558C35.6932 58.361 29.361 58.3609 25.4558 54.4558L10.5984 39.5984C6.69312 35.6931 6.69312 29.361 10.5984 25.4558L25.4558 10.5984ZM22.9372 21.8933C21.9311 21.8934 21.1003 22.725 21.1003 23.7312V43.9001C21.1004 44.9062 21.9311 45.7369 22.9372 45.737H43.1941C44.2001 45.7368 45.0313 44.9062 45.0095 43.9001V23.7312C45.0095 22.7249 44.1778 21.8933 43.1716 21.8933H42.2527V24.6501C42.2526 25.6562 41.4219 26.4869 40.4157 26.487H25.6941C24.6879 26.487 23.8563 25.6563 23.8562 24.6501V21.8933H22.9372ZM31.3152 18.2409C30.3531 19.1593 30.3087 19.2033 26.6345 21.8933V22.8122C26.6345 23.8183 27.4653 24.6499 28.4714 24.6501H37.6589C38.687 24.6501 39.4968 23.8404 39.4968 22.8122V21.8933C35.844 19.2029 35.8653 19.094 34.9685 18.2409H31.3152Z" fill={backgroundColor} />
        <Defs>
          <LinearGradient id="paint0_linear_1338_4719" x1="5" y1="32.9957" x2="60.5" y2="32.9957" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;