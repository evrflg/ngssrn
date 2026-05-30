
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
        <G filter="url(#filter0_d_1338_4480)">
          <Circle cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4480)" />
        </G>
        <Path d="M18.8213 25.8457C19.4709 25.8457 20.0225 26.0724 20.4756 26.5254C20.9287 26.9785 21.1553 27.53 21.1553 28.1797C21.1553 28.5045 21.0952 28.8078 20.9756 29.0898C20.8559 29.3719 20.6893 29.6161 20.4756 29.8213C20.262 30.0263 20.0143 30.189 19.7324 30.3086C19.4503 30.4283 19.1461 30.4883 18.8213 30.4883C18.1717 30.4882 17.62 30.2657 17.167 29.8213C16.714 29.3768 16.4883 28.8293 16.4883 28.1797C16.4883 27.855 16.5474 27.5515 16.667 27.2695C16.7866 26.9875 16.9533 26.7391 17.167 26.5254C17.3807 26.3117 17.629 26.1451 17.9111 26.0254C18.1931 25.9057 18.4966 25.8457 18.8213 25.8457Z" fill={backgroundColor} />
        <Path d="M36.3379 25.8457V27H37.4922V29.334H36.3379V30.4883H34.0039V29.334H32.8242V27H34.0039V25.8457H36.3379Z" fill={backgroundColor} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM38.3125 17.9082C37.5602 17.6774 36.7521 17.6308 35.8887 17.7676C35.0254 17.9044 34.2521 18.2636 33.5684 18.8447C33.2777 19.0841 32.9135 19.4007 32.4775 19.7939C32.0417 20.187 31.5415 20.5713 30.9775 20.9473C30.4133 21.3234 29.7935 21.6483 29.1182 21.9219C28.443 22.1954 27.738 22.332 27.0029 22.332C26.2507 22.332 25.515 22.1996 24.7969 21.9346C24.079 21.6696 23.4164 21.3497 22.8096 20.9736C22.2026 20.5975 21.6594 20.2126 21.1807 19.8193C20.702 19.4261 20.3346 19.1012 20.0781 18.8447C19.4797 18.2634 18.7916 17.9044 18.0137 17.7676C17.2358 17.6308 16.4959 17.6825 15.7949 17.9219C15.0942 18.1612 14.4791 18.5713 13.9492 19.1523C13.4192 19.7336 13.1026 20.4435 13 21.2812V30.8721C13 31.5902 13.1066 32.2575 13.3203 32.873C13.534 33.4885 13.8465 34.0018 14.2568 34.4121C14.6671 34.8223 15.1588 35.0998 15.7314 35.2451C16.3042 35.3904 16.95 35.3604 17.668 35.1553C18.1294 35.0185 18.5571 34.8218 18.9502 34.5654C19.3433 34.309 19.7192 34.0523 20.0781 33.7959C20.4371 33.5395 20.8004 33.3128 21.168 33.1162C21.5355 32.9196 21.9247 32.8213 22.335 32.8213H31.6699C32.0802 32.8897 32.4652 33.0263 32.8242 33.2314C33.1832 33.4366 33.5424 33.6591 33.9014 33.8984C34.2602 34.1377 34.6363 34.3728 35.0293 34.6035C35.4225 34.8343 35.8592 35.0185 36.3379 35.1553C37.0559 35.3604 37.7017 35.3904 38.2744 35.2451C38.8468 35.0998 39.3337 34.8263 39.7354 34.4248C40.1371 34.023 40.4455 33.5181 40.6592 32.9111C40.8728 32.3043 40.9795 31.6418 40.9795 30.9238V21.2812C40.9795 20.4264 40.7229 19.7083 40.21 19.127C39.697 18.5456 39.0648 18.139 38.3125 17.9082Z" fill={backgroundColor} />
        <Defs>
          <Filter id="filter0_d_1338_4480" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4480" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1338_4480" result="shape" />
          </Filter>
          <LinearGradient id="paint0_linear_1338_4480" x1="2" y1="27" x2="52" y2="27" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;
