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
import React from 'react';
import { View } from 'react-native';
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
        <G filter="url(#filter0_d_1338_4547)">
          <Circle  cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle  cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4547)" />
        </G>
        <Path fillRule="evenodd" clipRule="evenodd" d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM22.0459 13C21.4932 13 20.9773 13.1063 20.499 13.3193C20.0207 13.5324 19.6007 13.8204 19.2393 14.1826C18.8778 14.5449 18.5905 14.9659 18.3779 15.4453C18.1654 15.9246 18.0596 16.4413 18.0596 16.9951V23.0049H22.0459V16.9951H36.0137V37.0049H22.0459V30.9951H18.0596V37.0049C18.0596 37.5587 18.1654 38.0754 18.3779 38.5547C18.5905 39.0341 18.8778 39.4551 19.2393 39.8174C19.6007 40.1796 20.0207 40.4676 20.499 40.6807C20.9773 40.8937 21.4932 41 22.0459 41H36.0137C36.5664 41 37.0822 40.8938 37.5605 40.6807C38.0389 40.4676 38.4589 40.1796 38.8203 39.8174C39.1817 39.4552 39.4681 39.0341 39.6807 38.5547C39.8932 38.0753 40 37.5588 40 37.0049V16.9951C40 16.4412 39.8932 15.9247 39.6807 15.4453C39.4681 14.9659 39.1817 14.5448 38.8203 14.1826C38.4589 13.8204 38.0389 13.5324 37.5605 13.3193C37.0822 13.1062 36.5664 13 36.0137 13H22.0459ZM27.0527 21.3428C26.6914 21.0445 26.42 20.9482 26.2393 21.0547C26.0586 21.1612 25.9678 21.4275 25.9678 21.8535V23.3877C25.9678 23.7926 25.867 24.1659 25.665 24.5068C25.4631 24.8478 25.1279 25.0186 24.6602 25.0186H23.0664C22.4073 25.0186 21.6891 25.0126 20.9131 25.002C20.1372 24.9913 19.3348 24.9814 18.5059 24.9707C17.6769 24.9601 16.9114 24.9491 16.21 24.9385C15.5084 24.9278 14.9019 24.9229 14.3916 24.9229H13.4033C12.8506 24.9229 12.4785 25.0023 12.2871 25.1621C12.0958 25.3219 12 25.7111 12 26.3291V27.959C12 28.3425 12.1117 28.6146 12.335 28.7744C12.5581 28.9341 12.8187 29.0137 13.1162 29.0137H24.916C25.2135 29.0137 25.4631 29.11 25.665 29.3018C25.8669 29.4935 25.9678 29.7915 25.9678 30.1963V31.7305C25.9678 32.3697 26.0855 32.6845 26.3193 32.6738C26.5532 32.6629 26.9146 32.4544 27.4033 32.0498C27.786 31.7302 28.2859 31.3786 28.9023 30.9951C29.5188 30.6116 30.1515 30.2232 30.7998 29.8291C31.4482 29.4349 32.0648 29.0506 32.6494 28.6777C33.2339 28.3049 33.696 27.9692 34.0361 27.6709C34.27 27.4791 34.3877 27.1812 34.3877 26.7764C34.3877 26.3715 34.2381 26.0518 33.9404 25.8174C33.5578 25.4978 33.0479 25.1402 32.4102 24.7461C31.7725 24.352 31.1188 23.9526 30.4492 23.5479C29.7795 23.143 29.1361 22.7488 28.5195 22.3652C27.9032 21.9818 27.4141 21.641 27.0527 21.3428Z" fill={backgroundColor} />
        <Defs>
          <Filter id="filter0_d_1338_4547" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4547" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1338_4547" result="shape" />
          </Filter>
          <LinearGradient id="paint0_linear_1338_4547" x1="2" y1="27" x2="52" y2="27" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;
