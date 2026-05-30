import * as React from "react";
import { Platform } from "react-native";
import Svg, {
  Defs,
  Ellipse,
  FeBlend,
  FeColorMatrix,
  FeComposite,
  FeFlood,
  FeGaussianBlur,
  FeOffset,
  Filter,
  G,
  LinearGradient,
  Mask,
  Path,
  Rect,
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

export function SpecialBonusIcon(props: SvgProps) {
  const id = useStableIds("specialbonus");
  const isNative = Platform.OS !== "web";

  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
      <G {...(!isNative ? { filter: `url(#${id("filter0_i")})` } : {})}>
        <Path
          d="M0 10.6667C0 4.77563 4.77563 0 10.6667 0H29.3333C35.2244 0 40 4.77563 40 10.6667V29.3333C40 35.2244 35.2244 40 29.3333 40H10.6667C4.77563 40 0 35.2244 0 29.3333V10.6667Z"
          fill={`url(#${id("paint0_linear")})`}
        />
      </G>
      <Mask
        id={id("mask0")}
        maskUnits="userSpaceOnUse"
        x={6}
        y={6}
        width={28}
        height={28}
      >
        <Rect x={6.66667} y={6.66669} width={26.6667} height={26.6667} fill="#D9D9D9" />
      </Mask>
      <G mask={`url(#${id("mask0")})`}>
        <Path
          d="M24.4445 20.7221V24.8332C24.4445 28.2999 21.2111 31.111 17.2222 31.111C13.2333 31.111 10 28.2999 10 24.8332V20.7221C10 24.1888 13.2333 26.6666 17.2222 26.6666C21.2111 26.6666 24.4445 24.1888 24.4445 20.7221Z"
          fill="white"
        />
        <Path
          opacity={0.5}
          d="M24.4445 15.1666V20.7221C24.4445 24.1888 21.2111 26.6666 17.2222 26.6666C13.2333 26.6666 10 24.1888 10 20.7221V15.1666C10 16.1777 10.2778 17.111 10.7667 17.911C11.9556 19.8666 14.4 21.111 17.2222 21.111C20.0445 21.111 22.4889 19.8666 23.6778 17.911C24.1667 17.111 24.4445 16.1777 24.4445 15.1666Z"
          fill="white"
        />
        <Path
          d="M24.4445 15.1667C24.4445 16.1778 24.1667 17.1111 23.6778 17.9111C22.4889 19.8667 20.0445 21.1111 17.2222 21.1111C14.4 21.1111 11.9556 19.8667 10.7667 17.9111C10.2778 17.1111 10 16.1778 10 15.1667C10 11.7 13.2333 8.88892 17.2222 8.88892C19.2222 8.88892 21.0222 9.58892 22.3334 10.7222C23.6334 11.8667 24.4445 13.4334 24.4445 15.1667Z"
          fill="white"
        />
        <Ellipse opacity={0.5} cx={25} cy={24.4444} rx={5.55556} ry={6.66667} fill="white" />
        <Ellipse cx={26.7778} cy={24.4444} rx={5.55556} ry={6.66667} fill="white" />
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
        <LinearGradient
          id={id("paint0_linear")}
          x1={20}
          y1={0}
          x2={20}
          y2={40}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#7B34FF" />
          <Stop offset={1} stopColor="#6495FF" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

