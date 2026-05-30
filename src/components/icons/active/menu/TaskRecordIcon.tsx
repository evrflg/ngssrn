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

export function TaskRecordIcon(props: SvgProps) {
  const id = useStableIds("taskrecord");
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
          opacity={0.4}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24.4444 8.88892C28.3333 8.88892 30 11.1111 30 14.4445V20.7552C29.5699 20.5968 29.1087 20.5267 28.6198 20.5751C27.7038 20.6661 26.997 21.1486 26.505 21.5929L26.3064 21.7795L26.2988 21.7882L21.6873 26.3998C21.4287 26.6585 21.2471 26.9578 21.1306 27.1908C21.0114 27.4292 20.8954 27.7286 20.8377 28.0458L20.8322 28.0762L20.8279 28.1055L20.5718 29.872L20.5707 29.8796C20.5135 30.2874 20.5467 30.7121 20.6814 31.1111H15.5556C11.6667 31.1111 10 28.8889 10 25.5556V14.4445C10 11.1111 11.6667 8.88892 15.5556 8.88892H24.4444Z"
          fill="white"
        />
        <Path
          d="M18.444 15.9372C20.2503 16.0796 21.698 17.5274 21.8405 19.3337C21.8462 19.4304 21.8522 19.5328 21.8522 19.6296C21.8522 21.6752 20.1937 23.3337 18.1481 23.3337C16.1025 23.3337 14.444 21.6751 14.444 19.6296C14.444 17.584 16.1026 15.9255 18.1481 15.9255C18.2448 15.9255 18.3473 15.9315 18.444 15.9372ZM17.6471 19.1286L16.7233 19.6296L17.6471 20.1315L18.1481 21.0544L18.6491 20.1315L19.5729 19.6296L18.6491 19.1286L18.1481 18.2048L17.6471 19.1286ZM21.8288 12.2224C23.887 12.2224 25.5553 13.8907 25.5553 15.9489C25.5553 17.8178 24.1799 19.3599 22.3913 19.6296V19.5954C22.2136 17.371 20.4073 15.5653 18.1657 15.3874H18.1481C18.4176 13.5987 19.9598 12.2225 21.8288 12.2224Z"
          fill="white"
        />
        <Path
          d="M30.3666 22.9667C29.1999 21.8 28.2777 22.1778 27.4777 22.9667L22.8666 27.5778C22.6888 27.7556 22.5221 28.1 22.4777 28.3445L22.2221 30.1111C22.1333 30.7445 22.5777 31.2 23.211 31.1L24.9777 30.8445C25.2221 30.8111 25.5666 30.6333 25.7444 30.4556L30.3555 25.8445C31.1666 25.0556 31.5333 24.1333 30.3666 22.9667Z"
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
            values="0 0 0 0 0.14902 0 0 0 0 0.752941 0 0 0 0 0.796078 0 0 0 0.25 0"
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
          <Stop stopColor="#26C0CB" />
          <Stop offset={1} stopColor="#B2FFFA" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

