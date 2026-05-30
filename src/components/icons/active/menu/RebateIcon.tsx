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

export function RebateIcon(props: SvgProps) {
  const id = useStableIds("rebate");
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
          d="M20 24.1111V24.7889H8.8889V24.1111C8.8889 22.1556 9.37776 21.6667 11.3555 21.6667H17.5334C19.5112 21.6667 20 22.1556 20 24.1111Z"
          fill="white"
        />
        <Path
          d="M8.8889 24.7889V26.4555V28.6667C8.8889 30.6222 9.37776 31.1111 11.3555 31.1111H17.5334C19.5112 31.1111 20 30.6222 20 28.6667V26.4555V24.7889H8.8889Z"
          fill="white"
        />
        <G opacity={0.5}>
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M31.1111 22.5001C31.5713 22.5001 31.9444 22.8732 31.9444 23.3334C31.9444 28.0936 28.0936 31.9445 23.3333 31.9445C23.0331 31.9445 22.7561 31.783 22.6082 31.5218C22.4602 31.2605 22.4643 30.9399 22.6188 30.6824L23.7854 28.738C24.0222 28.3433 24.5341 28.2154 24.9287 28.4521C25.3234 28.6889 25.4514 29.2008 25.2146 29.5955L24.9131 30.0979C27.9899 29.3841 30.2778 26.6296 30.2778 23.3334C30.2778 22.8732 30.6509 22.5001 31.1111 22.5001Z"
            fill="white"
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.0869 9.9022C12.0101 10.616 9.72222 13.3705 9.72222 16.6667C9.72222 17.127 9.34913 17.5 8.88889 17.5C8.42865 17.5 8.05556 17.127 8.05556 16.6667C8.05556 11.9065 11.9064 8.0556 16.6667 8.0556C16.9669 8.0556 17.2439 8.2171 17.3918 8.47835C17.5398 8.73961 17.5357 9.06024 17.3812 9.31768L16.2146 11.2621C15.9778 11.6568 15.4659 11.7847 15.0713 11.548C14.6766 11.3112 14.5486 10.7993 14.7854 10.4046L15.0869 9.9022Z"
            fill="white"
          />
        </G>
        <Path
          opacity={0.5}
          d="M32.2222 13.8889H22.2222C22.2222 16.6445 24.4667 18.8889 27.2222 18.8889C29.9889 18.8889 32.2222 16.6445 32.2222 13.8889Z"
          fill="white"
        />
        <Path
          d="M32.2222 13.8889C32.2222 11.1222 29.9889 8.88892 27.2222 8.88892C24.4667 8.88892 22.2222 11.1222 22.2222 13.8889H32.2222Z"
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
            values="0 0 0 0 0.376471 0 0 0 0 0.321569 0 0 0 0 1 0 0 0 0.25 0"
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
          <Stop stopColor="#6052FF" />
          <Stop offset={1} stopColor="#C8C3FF" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

