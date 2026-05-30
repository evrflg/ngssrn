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

export function MissionCenterIcon(props: SvgProps) {
  const id = useStableIds("mission");
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
          <Rect x={6.66667} y={6.66669} width={26.6667} height={26.6667} fill="#D9D9D9" />
        </Mask>
        <G mask={`url(#${id("mask0")})`}>
          <Path
            opacity={0.5}
            d="M24.7487 8.66669H15.2513C11.126 8.66669 8.66666 11.126 8.66666 15.2514V24.7487C8.66666 28.874 11.126 31.3334 15.2513 31.3334H24.7487C28.874 31.3334 31.3333 28.874 31.3333 24.7487V15.2514C31.3333 11.126 28.874 8.66669 24.7487 8.66669Z"
            fill="white"
          />
          <Path
            d="M27.1616 16.4531C27.1616 16.9178 26.7876 17.3031 26.3116 17.3031H20.3616C19.897 17.3031 19.5116 16.9178 19.5116 16.4531C19.5116 15.9884 19.897 15.6031 20.3616 15.6031H26.3116C26.7876 15.6031 27.1616 15.9884 27.1616 16.4531Z"
            fill="white"
          />
          <Path
            d="M17.7059 15.3526L15.1559 17.9026C14.9859 18.0726 14.7706 18.1519 14.5552 18.1519C14.3399 18.1519 14.1132 18.0726 13.9546 17.9026L13.1046 17.0526C12.7646 16.7239 12.7646 16.1799 13.1046 15.8512C13.4332 15.5226 13.9659 15.5226 14.3059 15.8512L14.5552 16.1006L16.5046 14.1512C16.8332 13.8226 17.3659 13.8226 17.7059 14.1512C18.0346 14.4799 18.0346 15.0239 17.7059 15.3526Z"
            fill="white"
          />
          <Path
            d="M27.1616 24.3836C27.1616 24.8483 26.7876 25.2336 26.3116 25.2336H20.3616C19.897 25.2336 19.5116 24.8483 19.5116 24.3836C19.5116 23.919 19.897 23.5336 20.3616 23.5336H26.3116C26.7876 23.5336 27.1616 23.919 27.1616 24.3836Z"
            fill="white"
          />
          <Path
            d="M15.7701 24.5332C15.7701 24.2578 15.6428 24.0132 15.4407 23.8542L15.4362 23.8509C15.2924 23.7363 15.109 23.6667 14.9036 23.6667C14.7263 23.6667 14.56 23.7206 14.4231 23.8138L14.3665 23.8561C14.3631 23.8589 14.3595 23.8619 14.3561 23.8646C14.1633 24.0161 14.0371 24.2579 14.0371 24.5332C14.0371 24.6534 14.0629 24.7701 14.108 24.873L14.1595 24.9707L14.1621 24.9753L14.2142 25.0521C14.2504 25.1006 14.29 25.1436 14.332 25.181L14.3964 25.2331L14.4023 25.237L14.4557 25.2734C14.5847 25.3536 14.7369 25.3997 14.9036 25.3997C15.1235 25.3997 15.3161 25.3205 15.4661 25.1868L15.4889 25.168C15.5413 25.1245 15.5929 25.0649 15.638 24.9876L15.6478 24.9707L15.6992 24.873C15.7444 24.7701 15.7701 24.6535 15.7701 24.5332ZM17.4368 24.5332C17.4368 25.0075 17.3024 25.463 17.0677 25.8444L17.0664 25.8438C16.9365 26.0623 16.7726 26.2618 16.5748 26.4303L16.5755 26.431C16.5715 26.4345 16.5665 26.4372 16.5625 26.4408C16.559 26.4437 16.5562 26.4476 16.5527 26.4505L16.552 26.4499C16.1092 26.8354 15.5344 27.0664 14.9036 27.0664C14.3494 27.0664 13.8346 26.8877 13.4173 26.582V26.5814C13.139 26.38 12.9107 26.1251 12.7376 25.8398L12.7382 25.8392C12.5052 25.4587 12.3704 25.0057 12.3704 24.5332C12.3704 23.7402 12.7362 23.0171 13.3268 22.5534V22.554C13.7616 22.205 14.3142 22 14.9036 22C15.4947 22 16.0433 22.2024 16.4759 22.5475L16.4752 22.5482C17.0608 23.011 17.4368 23.7291 17.4368 24.5332Z"
            fill="white"
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
          x={6.66666}
          y={8.66669}
          width={26.6667}
          height={26.6667}
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
            values="0 0 0 0 0.0901961 0 0 0 0 0.807843 0 0 0 0 0.203922 0 0 0 0.25 0"
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
          <Stop stopColor="#17CE34" />
          <Stop offset={1} stopColor="#A8F3B4" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

