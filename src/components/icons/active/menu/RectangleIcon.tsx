import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

type RectangleIconProps = {
  width?: number;
  height?: number;
  arrowColor?: string;
  bgColor?: string;
  bgOpacity?: number;
  style?: StyleProp<ViewStyle>;
};

const RectangleIcon = ({
  width = 22,
  height = 22,
  arrowColor = "#292C2B",
  bgColor = "#000000",
  bgOpacity = 0.5,
  style,
}: RectangleIconProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 22 22"
      fill="none"
      style={style}
    >
      <Circle cx="11" cy="11" r="11" fill={bgColor} fillOpacity={bgOpacity} />
      <Path
        d="M9.75736 15.2426L13.2929 11.7071C13.6834 11.3166 13.6834 10.6834 13.2929 10.2929L9.75736 6.75736"
        stroke={arrowColor}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default RectangleIcon;