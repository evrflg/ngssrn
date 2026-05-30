import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface Props {
  fill?: string;
  showBorder?: boolean;
}

// 含圆角的填充路径（顶部保持直线，凹口区域不填充）
const FILL_PATH =
  'M377 58H2V4H151.728C156.987 4 161.179 8.19778 163.185 13.059C167.532 23.5893 177.9 31 190 31C202.1 31 212.468 23.5893 216.815 13.059C218.821 8.19778 223.013 4 228.272 4H377V58Z';

// 顶部边缘描边路径（两侧保持直线，仅中间保留凹陷弧）
const BORDER_PATH =
  'M2 4H151.728C156.987 4 161.179 8.19778 163.185 13.059C167.532 23.5893 177.9 31 190 31C202.1 31 212.468 23.5893 216.815 13.059C218.821 8.19778 223.013 4 228.272 4H377';

const Background = ({ fill = 'currentColor', showBorder = false }: Props) => (
  <Svg width="100%" height="54" viewBox="2 4 375 54" preserveAspectRatio="none">
    {showBorder && (
      <Defs>
        <LinearGradient id="s1NavBorder" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#f7a01d" />
          <Stop offset="0.3" stopColor="#ffe44d" />
          <Stop offset="0.5" stopColor="#fffec9" />
          <Stop offset="0.7" stopColor="#ffe44d" />
          <Stop offset="1" stopColor="#f7a01d" />
        </LinearGradient>
      </Defs>
    )}
    <Path d={FILL_PATH} fill={fill} />
    {showBorder && (
      <Path d={BORDER_PATH} stroke="url(#s1NavBorder)" strokeWidth="3" fill="none" />
    )}
  </Svg>
);

export default Background;
