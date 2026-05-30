
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
        <G filter="url(#filter0_d_1338_4424)">
          <Circle cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4424)" />
        </G>
        <Path fillRule="evenodd" clipRule="evenodd" d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM19.0391 32.3486C18.9645 32.6468 18.9646 33.0012 19.0391 33.4111C19.095 33.7652 19.2073 34.2081 19.375 34.7393C19.5427 35.2704 19.8409 35.8905 20.2695 36.5986C20.6235 37.2134 20.9543 37.7443 21.2617 38.1914C21.5692 38.6387 21.8674 39.007 22.1562 39.2959C22.445 39.5846 22.7478 39.7987 23.0645 39.9385C23.3812 40.0782 23.7261 40.1484 24.0986 40.1484H25.6924C26.1583 40.1484 26.424 40.0177 26.4893 39.7568C26.5543 39.496 26.5036 39.1651 26.3359 38.7646C26.1682 38.364 25.9209 37.9167 25.5947 37.4229C25.2686 36.929 24.9467 36.458 24.6299 36.0107C24.3691 35.6382 24.1453 35.2933 23.959 34.9766C23.7728 34.66 23.6235 34.3808 23.5117 34.1387C23.3813 33.8778 23.2699 33.6348 23.1768 33.4111C22.9904 33.3366 22.7852 33.262 22.5615 33.1875C22.3567 33.113 22.1284 33.0437 21.877 32.9785C21.6255 32.9133 21.3411 32.8431 21.0244 32.7686C20.7077 32.7127 20.4278 32.6565 20.1855 32.6006C19.9433 32.5447 19.738 32.4982 19.5703 32.4609C19.3653 32.405 19.1882 32.3673 19.0391 32.3486ZM35.4209 15.0166C34.7687 15.0911 34.0416 15.5104 33.2402 16.2744C32.4389 17.0199 31.5443 17.6302 30.5566 18.1055C29.5689 18.5807 28.5578 18.9728 27.5234 19.2803C26.4892 19.5877 25.4735 19.8298 24.4766 20.0068C23.4796 20.1839 22.585 20.347 21.793 20.4961C21.0009 20.6452 20.3484 20.8039 19.8359 20.9717C19.3235 21.1394 19.0296 21.3534 18.9551 21.6143V30.3643C19.0296 30.5506 19.3796 30.7094 20.0039 30.8398C20.6282 30.9703 21.4062 31.1054 22.3379 31.2451C23.2697 31.3849 24.2949 31.5427 25.4131 31.7197C26.5312 31.8968 27.6354 32.1301 28.7256 32.4189C29.8158 32.7078 30.8226 33.0621 31.7451 33.4814C32.6675 33.9007 33.3991 34.427 33.9395 35.0605C34.4986 35.6942 35.0344 36.0582 35.5469 36.1514C36.0593 36.2445 36.5391 36.1322 36.9863 35.8154C37.4335 35.4987 37.8388 35.0144 38.2021 34.3623C38.5655 33.7101 38.8831 32.9505 39.1533 32.084C39.4236 31.2174 39.6278 30.2895 39.7676 29.3018C39.9073 28.3141 39.9775 27.3265 39.9775 26.3389C39.9775 25.3511 39.9214 24.3119 39.8096 23.2217C39.6978 22.1315 39.5303 21.0878 39.3066 20.0908C39.083 19.0938 38.7945 18.1896 38.4404 17.3789C38.0864 16.5683 37.6574 15.9535 37.1543 15.5342C36.6511 15.1149 36.0732 14.9421 35.4209 15.0166ZM15.4326 21.7539C14.9482 21.754 14.5332 21.9214 14.1885 22.2568C13.8437 22.5923 13.6719 23.0028 13.6719 23.4873V27.876C13.6719 28.3605 13.8438 28.771 14.1885 29.1064C14.5332 29.4418 14.9482 29.6093 15.4326 29.6094H17.1943V21.7539H15.4326Z" fill={backgroundColor} />
        <Defs>
          <Filter id="filter0_d_1338_4424" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0" />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4424" />
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1338_4424" result="shape" />
          </Filter>
          <LinearGradient id="paint0_linear_1338_4424" x1="2" y1="27" x2="52" y2="27" gradientUnits="userSpaceOnUse">
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
};

export default CenterIcon;
