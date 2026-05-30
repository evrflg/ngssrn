/**代理icon */
import React from "react";
import Svg, { Path } from "react-native-svg";

interface AgenteProps {
  width?: number;
  height?: number;
  color?: string;
  highlightColor?: string;
}

export default function Agent({
  width = 20,
  height = 20,
  color = "#333333",
  highlightColor = "#4781FF",
}: AgenteProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10.5674 3.30033C10.9674 3.89199 11.2008 4.60033 11.2008 5.36699C11.1924 7.36699 9.61745 8.99199 7.63411 9.05866C7.55078 9.05033 7.45078 9.05033 7.35911 9.05866C5.37578 8.99199 3.80078 7.36699 3.80078 5.36699C3.80078 3.32533 5.45078 1.66699 7.50078 1.66699"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 17C12.3137 17 15 14.3137 15 11C15 7.68629 12.3137 5 9 5C5.68629 5 3 7.68629 3 11C3 14.3137 5.68629 17 9 17Z"
        fill={highlightColor}
        fillOpacity={0.25}
      />
      <Path
        d="M13.6747 3.33301C15.2914 3.33301 16.5914 4.64134 16.5914 6.24967C16.5914 7.82467 15.3414 9.10801 13.7831 9.16634C13.7164 9.15801 13.6414 9.15801 13.5664 9.16634"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.46758 12.133C1.45091 13.483 1.45091 15.683 3.46758 17.0247C5.75924 18.558 9.51758 18.558 11.8092 17.0247C13.8259 15.6747 13.8259 13.4747 11.8092 12.133C9.52591 10.608 5.76758 10.608 3.46758 12.133Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.2832 16.667C15.8832 16.542 16.4499 16.3003 16.9165 15.942C18.2165 14.967 18.2165 13.3587 16.9165 12.3837C16.4582 12.0337 15.8999 11.8003 15.3082 11.667"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
