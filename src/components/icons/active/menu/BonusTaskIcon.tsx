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

export default function BonusTaskIcon(props: SvgProps) {
  const id = useStableIds("bonustask");
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
          d="M20.498 8C22.0152 8.00017 23.3121 9.00746 23.7949 10.3984H28.3789C29.8239 10.3984 31 11.6136 31 13.1006V29.2979C31 30.7849 29.8239 32 28.3789 32H12.6221C11.1759 32 10 30.7849 10 29.2979V13.1006C10 11.6136 11.1759 10.3984 12.6221 10.3984H17.1982C17.6787 9.00734 18.9761 8 20.498 8ZM20.498 10.3984C19.8531 10.3984 19.3301 10.9417 19.3301 11.5977C19.3301 12.2692 19.8531 12.7969 20.498 12.7969C21.1417 12.7967 21.665 12.2691 21.665 11.5977C21.665 10.9418 21.1417 10.3987 20.498 10.3984Z"
          fill="#FBFBFB"
          fillOpacity={0.5}
        />
        <Path
          d="M25.0471 14.3544C24.7355 14.3544 24.4241 14.4705 24.1864 14.7021L22.5933 16.2546L26.0504 19.6235L27.6435 18.071C28.1188 17.6078 28.1188 16.8567 27.6435 16.3935L25.9078 14.7021C25.6701 14.4705 25.3587 14.3544 25.0471 14.3544ZM21.7326 17.0933L15.3464 23.3159L14.0359 27.1346C13.8602 27.6462 14.3598 28.1338 14.8848 27.9626L18.8042 26.6854L25.1897 20.4622L21.7326 17.0933Z"
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
          x={6}
          y={6}
          width={29}
          height={32}
          filterUnits="userSpaceOnUse"
        >
          <FeFlood floodOpacity={0} result="BackgroundImageFix" />
          <FeColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <FeOffset dy={2} />
          <FeGaussianBlur stdDeviation={2} />
          <FeComposite in2="hardAlpha" operator="out" />
          <FeColorMatrix
            type="matrix"
            values="0 0 0 0 0.0823529 0 0 0 0 0.556863 0 0 0 0 0.996078 0 0 0 0.25 0"
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
          <Stop stopColor="#158EFE" />
          <Stop offset={1} stopColor="#B2ECFF" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}
