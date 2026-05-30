/**消息中心icon */
import React from "react";
import Svg, { Path } from "react-native-svg";

interface NoticeProps {
  width?: number;
  height?: number;
  color?: string;
  highlightColor?: string;
}

export default function Notice({
  width = 20,
  height = 20,
  color = "#333333",
  highlightColor = "#4781FF",
}: NoticeProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M13 13C16.3137 13 19 10.3137 19 7C19 3.68629 16.3137 1 13 1C9.68629 1 7 3.68629 7 7C7 10.3137 9.68629 13 13 13Z"
        fill={highlightColor}
        fillOpacity={0.25}
      />
      <Path
        d="M1.66602 6.66699C1.66602 3.33366 3.33268 1.66699 6.66602 1.66699H13.3327C16.666 1.66699 18.3327 3.33366 18.3327 6.66699V10.8337C18.3327 14.167 16.666 15.8337 13.3327 15.8337H12.916C12.6577 15.8337 12.4077 15.9587 12.2493 16.167L10.9993 17.8337C10.4493 18.567 9.54935 18.567 8.99935 17.8337L7.74935 16.167C7.61602 15.9837 7.30768 15.8337 7.08268 15.8337H6.66602C3.33268 15.8337 1.66602 15.0003 1.66602 10.8337V10.0003"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <Path
        d="M13.3301 9.16667H13.3375"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.99607 9.16667H10.0036"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.66209 9.16667H6.66957"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
