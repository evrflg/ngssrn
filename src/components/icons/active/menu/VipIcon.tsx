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

export function VipIcon(props: SvgProps) {
  const id = useStableIds("vip");
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
          d="M31.1071 13.0106V23.655C31.1071 26.7217 28.6182 29.2106 25.5516 29.2106H14.4405C13.9293 29.2106 13.4405 29.1439 12.9627 29.0106C12.2738 28.8217 12.0516 27.9439 12.5627 27.4328L24.3738 15.6217C24.6182 15.3773 24.9849 15.3217 25.3293 15.3884C25.6849 15.455 26.0738 15.355 26.3516 15.0884L29.2071 12.2217C30.2516 11.1773 31.1071 11.5217 31.1071 13.0106Z"
          fill="white"
        />
        <Path
          opacity={0.5}
          d="M22.9333 14.8439L11.3 26.4773C10.7666 27.0106 9.87774 26.8773 9.52219 26.2106C9.11108 25.455 8.88885 24.5773 8.88885 23.655V13.0106C8.88885 11.5217 9.74441 11.1773 10.7889 12.2217L13.6555 15.0995C14.0889 15.5217 14.8 15.5217 15.2333 15.0995L19.2111 11.1106C19.6444 10.6773 20.3555 10.6773 20.7889 11.1106L22.9444 13.2661C23.3666 13.6995 23.3666 14.4106 22.9333 14.8439Z"
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
          x={6.88885}
          y={10.7856}
          width={26.2183}
          height={22.425}
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
            values="0 0 0 0 0.85098 0 0 0 0 0.294118 0 0 0 0 1 0 0 0 0.25 0"
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
          <Stop stopColor="#D94BFF" />
          <Stop offset={1} stopColor="#EFC0FF" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

