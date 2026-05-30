
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
        <G filter="url(#filter0_d_1338_4470)">
          <Circle cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4470)" />
        </G>
        <Path d="M26.8623 14.9316C31.7045 14.9316 35.7262 18.4625 36.5713 23.1172C36.4838 23.2297 36.4092 23.3487 36.3467 23.4736C34.9163 19.6017 31.2133 16.8351 26.8564 16.835C22.5182 16.835 18.8246 19.5768 17.3848 23.4238C17.3096 23.3393 17.231 23.2575 17.1465 23.1855C17.9635 18.4966 21.9983 14.9316 26.8623 14.9316Z" fill={backgroundColor} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM26.8594 13C21.1251 13 16.3605 17.1539 15.3057 22.6475C14.2573 22.8417 13.4937 23.7589 13.5 24.8262V29.1924C13.5 30.4163 14.483 31.4092 15.6943 31.4092C16.3767 31.4092 16.9812 31.0864 17.3818 30.5918C18.3521 33.1491 20.3111 35.2149 22.8213 36.3105C22.8525 36.2482 22.8901 36.189 22.9307 36.1328C22.9713 36.0829 23.0152 36.0383 23.0527 36.0381C23.0903 36.0381 23.1279 36.0514 23.1592 36.0732C22.5801 35.6412 20.493 33.4311 20.0391 30.3418C19.8419 28.9834 20.8588 27.647 22.0449 27.4277C23.948 27.074 25.842 26.6697 27.7451 26.3223C28.9564 26.1031 29.7822 25.436 30.2861 24.3311C30.4051 24.0712 30.578 23.5489 30.6562 22.7979C30.675 22.6852 30.7719 22.6006 30.8877 22.6006C30.9627 22.6006 31.0314 22.638 31.0752 22.6973L31.1289 22.666C31.8801 23.7554 33.3663 26.1692 33.5791 28.7109C33.8232 31.6188 33.6892 33.6098 31.4639 35.6475L31.4541 35.6562C31.4228 35.6907 31.4043 35.7353 31.4043 35.7822C31.4044 35.8415 31.4355 35.8974 31.4854 35.9287C31.5041 35.935 31.5232 35.9478 31.542 35.9541C31.5575 35.9572 31.5704 35.9608 31.5859 35.9639C31.6013 35.9638 31.6136 35.9602 31.626 35.9541C31.6572 35.9385 31.6885 35.9191 31.7197 35.9004C33.992 34.6452 35.7012 32.5704 36.4932 30.0977C36.8238 30.5848 37.3316 30.9239 37.9082 31.043C36.9691 35.3281 33.1439 38.0142 28.4082 38.418C28.1077 37.6855 27.3942 37.2088 26.6055 37.2119C25.5351 37.212 24.665 38.061 24.665 39.1064C24.6652 40.1518 25.5352 40.9999 26.6055 41C27.438 41.0031 28.1803 40.4713 28.4434 39.6826C33.9238 39.238 38.3181 35.9792 39.2354 30.918C40.0711 30.5736 40.6162 29.7591 40.6162 28.8545V24.4443C40.6225 23.2079 39.6139 22.2061 38.3682 22.2061C38.3496 22.2061 38.334 22.209 38.3154 22.209C37.0978 16.9347 32.4401 13.0001 26.8594 13ZM29.9102 31.7305C29.8282 31.6949 29.7323 31.7253 29.6885 31.8018C29.683 31.81 29.2178 32.5615 27.3994 32.8076C27.1398 32.8431 26.8747 32.8623 26.6123 32.8623C25.351 32.8623 24.781 32.3892 24.7666 32.3789C24.7011 32.3216 24.6055 32.3215 24.5371 32.376C24.4716 32.4306 24.4548 32.5288 24.501 32.6025C25.0588 33.4994 26.0514 34.0578 27.0986 34.0605C28.422 34.0605 29.5954 33.2047 30.0029 31.9443C30.0302 31.8597 29.992 31.7688 29.9102 31.7305Z" fill={backgroundColor} />
        <Defs>
          <Filter id="filter0_d_1338_4470" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4470" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1338_4470" result="shape" />
          </Filter>
          <LinearGradient id="paint0_linear_1338_4470" x1="2" y1="27" x2="52" y2="27" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;
