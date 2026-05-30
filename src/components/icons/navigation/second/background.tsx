import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface Props {
  fill?: string;
  showBorder?: boolean;
}

// 左右直角；顶部直线 + 中间凹槽（描边仍用 BORDER_PATH）
const FILL_PATH =
  'M377 54H2V0H143.218C151.175 0 158.805 3.16071 164.431 8.78678L178.042 22.3972C184.29 28.6456 194.421 28.6456 200.669 22.3972L214.28 8.78678C219.906 3.16071 227.536 0 235.493 0H377V54Z';

// 顶部边缘描边路径（两侧保持直线，仅中间保留凹陷弧）
const BORDER_PATH =
  'M2 0H143.218C151.175 0 158.805 3.16071 164.431 8.78678L178.042 22.3972C184.29 28.6456 194.421 28.6456 200.669 22.3972L214.28 8.78678C219.906 3.16071 227.536 0 235.493 0H377';

const Background = ({ fill = 'currentColor', showBorder = false }: Props) => (
  <Svg width="100%" height="54" viewBox="2 0 371 54" preserveAspectRatio="none">
    {showBorder && (
      <Defs>
        <LinearGradient id="s2NavBorder" x1="0" y1="0" x2="1" y2="0">
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
      <Path d={BORDER_PATH} stroke="url(#s2NavBorder)" strokeWidth="3" fill="none" />
    )}
  </Svg>
);

export default Background;
