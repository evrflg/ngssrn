/**选择语言icon */
import React from "react";
import Svg, { Path } from "react-native-svg";

interface LanguageIconProps {
  width?: number;
  height?: number;
  color?: string;
  highlightColor?: string;
}

export default function LanguageIcon({
  width = 20,
  height = 20,
  color = "#333333",
  highlightColor = "#4781FF",
}: LanguageIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M9.99935 18.3332C14.6017 18.3332 18.3327 14.6022 18.3327 9.99984C18.3327 5.39746 14.6017 1.6665 9.99935 1.6665C5.39698 1.6665 1.66602 5.39746 1.66602 9.99984C1.66602 14.6022 5.39698 18.3332 9.99935 18.3332Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 19C15.3137 19 18 16.3137 18 13C18 9.68629 15.3137 7 12 7C8.68629 7 6 9.68629 6 13C6 16.3137 8.68629 19 12 19Z"
        fill={highlightColor}
        fillOpacity={0.25}
      />
      <Path
        d="M6.2832 10C6.2832 12.5333 6.69154 15.0667 7.49987 17.5H6.66654"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <Path
        d="M6.66732 2.5H7.50065C7.09232 3.71667 6.79232 4.95833 6.58398 6.21667"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.4417 13.6333C13.2333 14.9333 12.925 16.2333 12.5 17.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.5 2.5C13.3083 4.93333 13.7167 7.46667 13.7167 10"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <Path
        d="M2.5 13.3333V12.5C7.36667 14.125 12.6333 14.125 17.5 12.5V13.3333"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.5 7.5C7.36667 5.875 12.6333 5.875 17.5 7.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
