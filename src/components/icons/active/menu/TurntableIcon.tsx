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

export function TurntableIcon(props: SvgProps) {
  const id = useStableIds("turntable");
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
        <Mask
          id={id("mask0")}
          maskUnits="userSpaceOnUse"
          x={6}
          y={6}
          width={28}
          height={28}
        >
          <Rect x={6.66666} y={6.66669} width={26.6667} height={26.6667} fill="#D9D9D9" />
        </Mask>
        <G mask={`url(#${id("mask0")})`}>
          <Path
            d="M20 8C13.3719 8 7.99998 13.3719 7.99998 20C7.99998 26.6281 13.3719 32 20 32C26.6281 32 32 26.6281 32 20C32 13.3719 26.6281 8 20 8ZM27.425 27.425L22.7539 22.7516C22.2523 23.2508 21.6476 23.5883 21.0101 23.7594L22.7211 30.1461C21.8398 30.3828 20.9304 30.5 20.0023 30.5C19.0742 30.5 18.1648 30.3805 17.2836 30.1461L18.9945 23.7594C18.357 23.5906 17.7523 23.2531 17.2508 22.7516L12.575 27.425C11.6094 26.4594 10.8523 25.3367 10.325 24.0875C10.1351 23.6398 9.9781 23.1828 9.85388 22.7188L16.2383 21.0078C16.0625 20.3469 16.0625 19.6508 16.2383 18.9922L9.85388 17.2812C9.9781 16.8172 10.1351 16.3602 10.325 15.9125C10.8547 14.6633 11.6117 13.5383 12.575 12.575L17.2461 17.2461C17.7476 16.7469 18.3523 16.4094 18.9898 16.2383L17.2812 9.85391C18.1625 9.61953 19.0719 9.5 20 9.5C20.9281 9.5 21.8375 9.61953 22.7187 9.85391L21.0078 16.2383C21.6453 16.4094 22.25 16.7445 22.7515 17.2461L27.4226 12.5727C28.3883 13.5383 29.1453 14.6609 29.6726 15.9102C29.8625 16.3578 30.0195 16.8148 30.1437 17.2789L23.757 18.9898C23.9328 19.6484 23.9328 20.3445 23.757 21.0055L30.1437 22.7164C30.0195 23.1805 29.8625 23.6375 29.6726 24.0852C29.1476 25.3367 28.3883 26.4594 27.425 27.425Z"
            fill="white"
            fillOpacity={0.5}
          />
          <Path
            d="M20.6329 16.765C20.6329 16.765 20.2489 16.6994 20.0007 16.6993C19.7705 16.6993 19.4141 16.7556 19.4141 16.7556C18.7766 16.8704 18.1626 17.1751 17.6704 17.6673C16.3837 18.954 16.3837 21.04 17.6704 22.3267C18.9571 23.6134 21.043 23.6134 22.3298 22.3267C23.6165 21.04 23.6165 18.954 22.3298 17.6673C21.8469 17.1868 21.254 16.8868 20.6329 16.765Z"
            fill="white"
          />
          <Path
            d="M19.9945 18.1998H19.4941C18.8738 18.1998 18.619 17.4944 18.93 16.6328L19.1812 15.9394L19.4323 15.246C19.9973 14.0004 19.9945 13.9997 20.5623 15.246L20.8134 15.9394L21.0646 16.6328C21.3756 17.4944 21.1208 18.1998 20.5005 18.1998H19.9945Z"
            fill="white"
            stroke="white"
            strokeWidth={1.5}
            strokeMiterlimit={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
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
          x={5.99998}
          y={8}
          width={28}
          height={28}
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
            values="0 0 0 0 1 0 0 0 0 0.411765 0 0 0 0 0.329412 0 0 0 0.25 0"
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
          <Stop stopColor="#FF6954" />
          <Stop offset={1} stopColor="#FFE0D2" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

