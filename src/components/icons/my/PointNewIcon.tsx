/**积分新icon */
import React from "react";
import Svg, { Rect, Defs, LinearGradient, Stop } from "react-native-svg";

interface PointNewIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

export default function PointNewIcon({
  width = 22,
  height = 22,
  fill = "#4781FF",
}: PointNewIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 22 22" fill="none">
      <Defs>
        <LinearGradient id="pattern0_837_26596" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={fill} stopOpacity={0.8} />
          <Stop offset="100%" stopColor={fill} stopOpacity={0.6} />
        </LinearGradient>
      </Defs>
      <Rect
        x={2}
        y={4}
        width={14}
        height={14}
        fill="url(#pattern0_837_26596)"
        rx={2}
      />
    </Svg>
  );
}
