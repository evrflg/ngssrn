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

const APPDownloadIcon: React.FC<Props> = ({
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
        <Defs>
          <Filter
            id="filter0_d_1338_4529"
            x="0"
            y="0"
            width="54"
            height="54"
            filterUnits="userSpaceOnUse"
          >
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <FeOffset />
            <FeGaussianBlur stdDeviation="1" />
            <FeComposite in2="hardAlpha" operator="out" />
            <FeColorMatrix
              type="matrix"
              values="0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0 0.0666667 0 0 0 0.15 0"
            />
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1338_4529" />
            <FeBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1338_4529"
              result="shape"
            />
          </Filter>
          <LinearGradient
            id="paint0_linear_1338_4529"
            x1="2"
            y1="27"
            x2="52"
            y2="27"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor={gradientStart} />
            <Stop offset="1" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>

        <G filter="url(#filter0_d_1338_4529)">
          <Circle  cx="27" cy="27" r="25" fill="#292C2B" />
          <Circle  cx="27" cy="27" r="25" fill="url(#paint0_linear_1338_4529)" />
        </G>

        <Path
          d="M28.792 38.2002C29.177 38.2002 29.4922 38.5154 29.4922 38.9004C29.492 39.2852 29.1769 39.5996 28.792 39.5996H25.292C24.9071 39.5996 24.592 39.2852 24.5918 38.9004C24.5918 38.5154 24.907 38.2002 25.292 38.2002H28.792Z"
          fill={backgroundColor}
        />
        <Path
          d="M33.6924 34.7002V36.1699C33.6924 36.9048 33.1181 37.4998 32.4043 37.5H21.6797C20.9658 37.4998 20.3916 36.9048 20.3916 36.1699V34.7002H33.6924Z"
          fill={backgroundColor}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.7979 23.1777L24.0107 31.5215H22.6465L21.8623 29.373H18.2705L17.4941 31.5215H16.1357L19.3486 23.1777H20.7979ZM20.0557 24.543L18.6631 28.3232H21.4766L20.0977 24.543H20.0557Z"
          fill={backgroundColor}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M28.2949 23.1777C30.2829 23.1777 31.2773 24.025 31.2773 25.7119C31.2773 27.4198 30.2761 28.2743 28.2744 28.2744H26.1113V31.5215H24.8369V23.1777H28.2949ZM26.1113 24.2695V27.1885H28.1895C28.8195 27.1885 29.2824 27.0699 29.5693 26.8389C29.8562 26.5939 30.0029 26.2226 30.0029 25.7188C30.0029 25.1938 29.8555 24.8301 29.5615 24.6201C29.2746 24.3892 28.82 24.2696 28.1973 24.2695H26.1113Z"
          fill={backgroundColor}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M35.918 23.1777C37.9059 23.1777 38.9004 24.025 38.9004 25.7119C38.9004 27.4198 37.8991 28.2743 35.8975 28.2744H33.7344V31.5215H32.46V23.1777H35.918ZM33.7334 24.2627V27.1885H35.8125C36.4423 27.1885 36.9044 27.0697 37.1914 26.8389C37.4784 26.5939 37.626 26.2227 37.626 25.7188C37.626 25.1939 37.4786 24.8233 37.1777 24.6133C36.8907 24.3823 36.4355 24.2627 35.8125 24.2627H33.7334Z"
          fill={backgroundColor}
        />
        <Path
          d="M32.4043 15.3311C33.1181 15.3312 33.6924 15.9262 33.6924 16.6611V20H20.3916V16.6611C20.3916 15.9262 20.9658 15.3312 21.6797 15.3311H32.4043Z"
          fill={backgroundColor}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M27 5C39.1503 5 49 14.8497 49 27C49 39.1503 39.1503 49 27 49C14.8497 49 5 39.1503 5 27C5 14.8497 14.8497 5 27 5ZM20.7422 13C19.1953 13 17.9425 14.2529 17.9424 15.7998V20H15.7998C14.253 20.0001 13.0001 21.253 13 22.7998V31.9004C13.0002 33.4471 14.253 34.7001 15.7998 34.7002H17.9424V38.2002C17.9425 39.7471 19.1953 41 20.7422 41H33.3418C34.8887 41 36.1415 39.7471 36.1416 38.2002V34.7002H38.2002C39.7469 34.7001 40.9998 33.4471 41 31.9004V22.7998C40.9999 21.253 39.747 20.0001 38.2002 20H36.1416V15.7998C36.1415 14.2529 34.8887 13 33.3418 13H20.7422Z"
          fill={backgroundColor}
        />
      </Svg>
    </View>
  );
};

export default APPDownloadIcon;