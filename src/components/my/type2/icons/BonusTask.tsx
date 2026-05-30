import React from "react";
import { Svg, G, Path, Defs, Mask, Rect } from "react-native-svg";

interface BonusTaskProps {
  width?: number;
  height?: number;
}

export default function BonusTask({ width = 32, height = 32 }: BonusTaskProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Defs>
        <Mask
          id="mask0_1133_8888"
          x={0}
          y={0}
          width={32}
          height={32}
          maskUnits="userSpaceOnUse"
        >
          <Rect width={32} height={32} fill="#D9D9D9" />
        </Mask>
        <Mask id="path-4-inside-1_1133_8888" fill="white">
          <Rect
            x={10.8945}
            y={17.1445}
            width={5.71428}
            height={5.71428}
            rx={1}
            transform="rotate(45 10.8945 17.1445)"
          />
        </Mask>
      </Defs>

      <G mask="url(#mask0_1133_8888)">
        <Path
          d="M28.1154 6.73183V3.93818C28.1154 2.39748 26.8852 1.14453 25.3725 1.14453H7.54397C5.27563 1.14453 3.42969 3.02466 3.42969 5.33501V22.0969C3.42969 25.1713 5.89003 26.2874 7.54397 26.2874H28.1154C29.6281 26.2874 30.8583 25.0344 30.8583 23.4937V9.52548C30.8583 7.98479 29.6281 6.73183 28.1154 6.73183ZM7.54397 6.73183C7.19086 6.71574 6.85744 6.56155 6.61315 6.30136C6.36886 6.04116 6.23252 5.69502 6.23252 5.33501C6.23252 4.97499 6.36886 4.62885 6.61315 4.36866C6.85744 4.10846 7.19086 3.95427 7.54397 3.93818H25.3725V6.73183H7.54397Z"
          fill="#F48D16"
        />
        <Path
          d="M10.8594 11.4297C16.2195 11.4299 20.5771 15.7941 20.5771 21.1475C20.5771 26.5007 16.2127 30.8582 10.8594 30.8584C5.50587 30.8584 1.14852 26.508 1.14844 21.1475C1.14844 15.7869 5.50582 11.4297 10.8594 11.4297ZM7.47363 21.1826L10.1953 23.9053C10.5858 24.2955 11.2189 24.2956 11.6094 23.9053L14.3311 21.1826L10.9023 17.7539L7.47363 21.1826Z"
          fill="#F48D16"
          fillOpacity={0.5}
        />
        <Rect
          x={10.8945}
          y={17.1445}
          width={5.71428}
          height={5.71428}
          rx={1}
          transform="rotate(45 10.8945 17.1445)"
          stroke="white"
          strokeWidth={3}
          mask="url(#path-4-inside-1_1133_8888)"
        />
      </G>
    </Svg>
  );
}
