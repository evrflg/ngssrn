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
        <G filter="url(#filter0_d_1338_4365)">
          <Circle cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4365)" />
        </G>
        <Path fillRule="evenodd" clipRule="evenodd" d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM16.0742 37.7148C16.0743 38.7587 16.3802 39.5675 16.9912 40.1406C17.6023 40.7137 18.5508 41 19.8359 41H25.7773V26.1084H16.0742V37.7148ZM29.2227 26.1084V41H35.1641C36.4494 41 37.3876 40.6976 37.9775 40.0938C38.5673 39.4899 38.8725 38.6658 38.8936 37.6221V26.1084H29.2227ZM16.6123 18.9229C15.9381 18.9229 15.5 19.0302 15.2998 19.2451C15.0997 19.4601 15 19.8036 15 20.2744V22.9766C15.0001 23.4881 15.1109 23.8667 15.332 24.1123C15.5533 24.3578 15.9905 24.4805 16.6436 24.4805H25.7773V18.9229H16.6123ZM29.2227 18.9229V24.4805H38.3564C39.0094 24.4805 39.4466 24.3631 39.668 24.1279C39.8892 23.8925 40 23.5284 40 23.0371V20.3965C39.9999 19.9259 39.879 19.5624 39.6367 19.3066C39.3944 19.0508 38.9359 18.9229 38.2617 18.9229H29.2227ZM22.459 13.1816C22.1851 13.0179 21.9533 12.966 21.7637 13.0273C21.574 13.0888 21.4216 13.2123 21.3057 13.3965C21.1899 13.5806 21.1003 13.8054 21.0371 14.0713C20.9739 14.3374 20.9312 14.5834 20.9102 14.8086C20.868 15.0337 20.8467 15.2744 20.8467 15.5303C20.8467 15.7859 20.8783 16.0161 20.9414 16.2207C21.0046 16.4253 21.1155 16.5945 21.2734 16.7275C21.4314 16.8606 21.6582 16.9267 21.9531 16.9268H26.2197C26.4936 16.9268 26.705 16.8758 26.8525 16.7734C26.9998 16.6711 27.0834 16.543 27.1045 16.3896C27.1255 16.2362 27.0838 16.0724 26.9785 15.8984C26.8732 15.7246 26.7153 15.566 26.5049 15.4229C26.3363 15.3205 26.0883 15.1818 25.7617 15.0078C25.4352 14.8339 25.0823 14.6397 24.7031 14.4248C24.3239 14.2099 23.9335 13.9952 23.5332 13.7803C23.133 13.5654 22.775 13.3658 22.459 13.1816ZM33.1416 13.0273C32.952 12.966 32.7201 13.0071 32.4463 13.1504C32.1303 13.3346 31.7723 13.5342 31.3721 13.749C30.9718 13.9639 30.5763 14.1787 30.1865 14.3936C29.7968 14.6084 29.4388 14.8036 29.1123 14.9775C28.7857 15.1515 28.5479 15.2893 28.4004 15.3916C28.1687 15.5349 28.0008 15.6942 27.8955 15.8682C27.7902 16.0421 27.7475 16.2059 27.7686 16.3594C27.7897 16.5128 27.8741 16.6409 28.0215 16.7432C28.169 16.8455 28.3906 16.8965 28.6855 16.8965H32.9199C33.2147 16.8965 33.4416 16.8301 33.5996 16.6973C33.7576 16.5642 33.8684 16.3951 33.9316 16.1904C33.9949 15.9857 34.0264 15.7549 34.0264 15.499C34.0264 15.2433 34.0162 15.0024 33.9951 14.7773C33.953 14.5524 33.9052 14.3122 33.8525 14.0566C33.7999 13.8008 33.7154 13.5807 33.5996 13.3965C33.4837 13.2123 33.3312 13.0888 33.1416 13.0273Z" fill={backgroundColor} />
        <Defs>
          <Filter id="filter0_d_1338_4365" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4365" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1338_4365" result="shape" />
          </Filter>
          <LinearGradient id="paint0_linear_1338_4365" x1="2" y1="27" x2="52" y2="27" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;
