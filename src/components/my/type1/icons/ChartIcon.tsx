/**图表icon */
import React from "react";
import Svg, { Path } from "react-native-svg";

interface ChartIconProps {
  width?: number;
  height?: number;
  color?: string;
  highlightColor?: string;
}

export default function ChartIcon({
  width = 20,
  height = 20,
  color = "#333333",
  highlightColor = "#4781FF",
}: ChartIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M1.66602 18.333H18.3327"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 19C12.3137 19 15 16.3137 15 13C15 9.68629 12.3137 7 9 7C5.68629 7 3 9.68629 3 13C3 16.3137 5.68629 19 9 19Z"
        fill={highlightColor}
        fillOpacity={0.25}
      />
      <Path
        d="M8.125 3.33366V18.3337H11.875V3.33366C11.875 2.41699 11.5 1.66699 10.375 1.66699H9.625C8.5 1.66699 8.125 2.41699 8.125 3.33366Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.83333 8.33366C5.83333 7.41699 5.5 6.66699 4.5 6.66699H3.83333C2.83333 6.66699 2.5 7.41699 2.5 8.33366V18.3337H5.83333V11.6587"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.166 12.4997V18.333H17.4993V12.4997C17.4993 11.583 17.166 10.833 16.166 10.833H15.4993C14.4993 10.833 14.166 11.583 14.166 12.4997Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
