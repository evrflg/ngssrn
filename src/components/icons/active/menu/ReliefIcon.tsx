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

export function ReliefIcon(props: SvgProps) {
  const id = useStableIds("salary");
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
          d="M31.1111 17.4445C31.1111 21.4333 27.8778 24.6667 23.8889 24.6667C23.7 24.6667 23.5 24.6556 23.3111 24.6444C23.0333 21.1222 20.2111 18.3 16.6889 18.0222C16.6778 17.8333 16.6667 17.6333 16.6667 17.4445C16.6667 13.4556 19.9 10.2222 23.8889 10.2222C27.8778 10.2222 31.1111 13.4556 31.1111 17.4445Z"
          fill="white"
        />
        <Path
          opacity={0.5}
          d="M23.3333 25.2222C23.3333 29.2111 20.1 32.4444 16.1111 32.4444C12.1222 32.4444 8.88889 29.2111 8.88889 25.2222C8.88889 21.2333 12.1222 18 16.1111 18C16.3 18 16.5 18.0111 16.6889 18.0222C20.2111 18.3 23.0333 21.1222 23.3111 24.6444C23.3222 24.8333 23.3333 25.0333 23.3333 25.2222Z"
          fill="white"
        />
        <Path
          d="M15.1333 24.2445L16.1111 22.4445L17.0889 24.2445L18.8889 25.2222L17.0889 26.2L16.1111 28L15.1333 26.2L13.3333 25.2222L15.1333 24.2445Z"
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
          x={4.66667}
          y={8}
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
            values="0 0 0 0 1 0 0 0 0 0.560784 0 0 0 0 0.203922 0 0 0 0.25 0"
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
          <Stop stopColor="#FF8F34" />
          <Stop offset={1} stopColor="#FFD2B1" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

