/**主题icon */
import React from "react";
import Svg, { Path } from "react-native-svg";

interface ThemeIconProps {
  width?: number;
  height?: number;
  color?: string;
  highlightColor?: string;
}

export default function ThemeIcon({
  width = 20,
  height = 20,
  color = "#333333",
  highlightColor = "#4781FF",
}: ThemeIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M4.16602 8.33317H5.83268C7.49935 8.33317 8.33268 7.49984 8.33268 5.83317V4.1665C8.33268 2.49984 7.49935 1.6665 5.83268 1.6665H4.16602C2.49935 1.6665 1.66602 2.49984 1.66602 4.1665V5.83317C1.66602 7.49984 2.49935 8.33317 4.16602 8.33317Z"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.8327 1.6665H14.166C12.4993 1.6665 11.666 2.49984 11.666 4.1665V5.83317C11.666 7.49984 12.4993 8.33317 14.166 8.33317H15.8327C17.4993 8.33317 18.3327 7.49984 18.3327 5.83317V4.1665"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <Path
        d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
        fill={highlightColor}
        fillOpacity={0.25}
      />
      <Path
        d="M14.166 18.3332H15.8327C17.4993 18.3332 18.3327 17.4998 18.3327 15.8332V14.1665C18.3327 12.4998 17.4993 11.6665 15.8327 11.6665H14.166C12.4993 11.6665 11.666 12.4998 11.666 14.1665V15.8332C11.666 17.4998 12.4993 18.3332 14.166 18.3332Z"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.16602 18.3332H5.83268C7.49935 18.3332 8.33268 17.4998 8.33268 15.8332V14.1665C8.33268 12.4998 7.49935 11.6665 5.83268 11.6665H4.16602C2.49935 11.6665 1.66602 12.4998 1.66602 14.1665V15.8332"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
