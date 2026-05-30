import * as React from "react";
import { Platform } from "react-native";
import Svg, {
  Defs,
  FeBlend,
  FeColorMatrix,
  FeComposite,
  FeFlood,
  FeGaussianBlur,
  FeOffset,
  Filter,
  G,
  LinearGradient,
  Path,
  Stop,
  SvgProps,
} from "react-native-svg";

function useStableIds(prefix: string) {
  const reactId = (React as any).useId?.() as string | undefined;
  const fallback = React.useMemo(
    () => `r${Math.random().toString(16).slice(2)}`,
    [],
  );
  const base = `${prefix}-${(reactId || fallback).replace(/:/g, "_")}`;
  return React.useCallback((name: string) => `${base}-${name}`, [base]);
}

export function BeDealtIcon(props: SvgProps) {
  const id = useStableIds("bedealt");
  const isNative = Platform.OS !== "web";

  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
      <G {...(!isNative ? { filter: `url(#${id("filter0_i")})` } : {})}>
        <Path
          d="M0 10.6667C0 4.77563 4.77563 0 10.6667 0H29.3333C35.2244 0 40 4.77563 40 10.6667V29.3333C40 35.2244 35.2244 40 29.3333 40H10.6667C4.77563 40 0 35.2244 0 29.3333V10.6667Z"
          fill={`url(#${id("paint0_linear")})`}
        />
      </G>
      <G {...(!isNative ? { filter: `url(#${id("filter1_d")})` } : {})}>
        <Path
          opacity={0.5}
          d="M24.7111 10.7222H15.2889C12.5444 10.7222 10.3222 12.9556 10.3222 15.6889V26.1445C10.3222 28.8778 12.5556 31.1111 15.2889 31.1111H24.7C27.4444 31.1111 29.6667 28.8778 29.6667 26.1445V15.6889C29.6778 12.9445 27.4444 10.7222 24.7111 10.7222Z"
          fill="white"
        />
        <Path
          d="M22.6111 8.88892H17.3889C16.2333 8.88892 15.2889 9.82225 15.2889 10.9778V12.0222C15.2889 13.1778 16.2222 14.1111 17.3778 14.1111H22.6111C23.7667 14.1111 24.7 13.1778 24.7 12.0222V10.9778C24.7111 9.82225 23.7667 8.88892 22.6111 8.88892Z"
          fill="white"
        />
        <Path
          d="M23.3333 21.0556H15.5556C15.1 21.0556 14.7222 20.6778 14.7222 20.2222C14.7222 19.7667 15.1 19.3889 15.5556 19.3889H23.3333C23.7889 19.3889 24.1667 19.7667 24.1667 20.2222C24.1667 20.6778 23.7889 21.0556 23.3333 21.0556Z"
          fill="white"
        />
        <Path
          d="M20.4222 25.5H15.5556C15.1 25.5 14.7222 25.1223 14.7222 24.6667C14.7222 24.2112 15.1 23.8334 15.5556 23.8334H20.4222C20.8778 23.8334 21.2556 24.2112 21.2556 24.6667C21.2556 25.1223 20.8778 25.5 20.4222 25.5Z"
          fill="white"
        />
      </G>
      <Defs>
        <Filter
          id={id("filter0_i")}
          x={0}
          y={0}
          width={40}
          height={40}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <FeFlood floodOpacity={0} result="BackgroundImageFix" />
          <FeBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <FeColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <FeOffset />
          <FeGaussianBlur stdDeviation={4} />
          <FeComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
          <FeColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
          />
          <FeBlend mode="normal" in2="shape" result="effect1_innerShadow" />
        </Filter>
        <Filter
          id={id("filter1_d")}
          x={4.66666}
          y={6.66669}
          width={30.6667}
          height={30.6667}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <FeFlood floodOpacity={0} result="BackgroundImageFix" />
          <FeColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <FeOffset dy={2} />
          <FeGaussianBlur stdDeviation={1} />
          <FeComposite in2="hardAlpha" operator="out" />
          <FeColorMatrix
            type="matrix"
            values="0 0 0 0 0.45098 0 0 0 0 0.776471 0 0 0 0 0.0392157 0 0 0 0.25 0"
          />
          <FeBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <FeBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </Filter>
        <LinearGradient
          id={id("paint0_linear")}
          x1={20}
          y1={0}
          x2={20}
          y2={40}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#73C60A" />
          <Stop offset={1} stopColor="#D0EEAB" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

