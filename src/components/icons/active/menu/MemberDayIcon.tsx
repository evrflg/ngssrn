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

export function MemberDayIcon(props: SvgProps) {
  const id = useStableIds("memberday");
  const isNative = Platform.OS !== "web";

  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
      <G {...(!isNative ? { filter: `url(#${id("filter0_i")})` } : {})}>
        <Path
          d="M0 10.6667C0 4.77563 4.77563 0 10.6667 0H29.3333C35.2244 0 40 4.77563 40 10.6667V29.3333C40 35.2244 35.2244 40 29.3333 40H10.6667C4.77563 40 0 35.2244 0 29.3333V10.6667Z"
          fill={`url(#${id("paint0_linear")})`}
        />
      </G>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.5556 8.05554C16.0158 8.05554 16.3889 8.42864 16.3889 8.88888V12.2222C16.3889 12.6824 16.0158 13.0555 15.5556 13.0555C15.0953 13.0555 14.7222 12.6824 14.7222 12.2222V8.88888C14.7222 8.42864 15.0953 8.05554 15.5556 8.05554Z"
        fill="white"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24.4444 8.05554C24.9047 8.05554 25.2778 8.42864 25.2778 8.88888V12.2222C25.2778 12.6824 24.9047 13.0555 24.4444 13.0555C23.9842 13.0555 23.6111 12.6824 23.6111 12.2222V8.88888C23.6111 8.42864 23.9842 8.05554 24.4444 8.05554Z"
        fill="white"
      />
      <Path
        opacity={0.5}
        d="M30.5556 15.9667V25.7C30.5556 25.8778 30.5444 26.0555 30.5333 26.2222H9.46667C9.45556 26.0555 9.44445 25.8778 9.44445 25.7V15.9667C9.44445 12.9778 11.8667 10.5555 14.8556 10.5555H25.1444C28.1333 10.5555 30.5556 12.9778 30.5556 15.9667Z"
        fill="white"
      />
      <Path
        d="M30.5328 26.2224C30.2662 28.9668 27.955 31.1112 25.1439 31.1112H14.855C12.0439 31.1112 9.73282 28.9668 9.46616 26.2224H30.5328Z"
        fill="white"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.4812 14.834C19.6603 14.3146 20.3482 14.3146 20.5272 14.834L21.5852 17.8428C21.7141 18.2066 22.1394 18.344 22.4359 18.1174L24.6744 16.4095C25.1164 16.0698 25.7087 16.5414 25.5186 17.0963L23.1911 22.9394C23.1127 23.1721 22.8998 23.3333 22.6648 23.3333H17.3328C17.0978 23.3333 16.8849 23.1781 16.8065 22.9394L14.4791 17.0963C14.2944 16.5412 14.8875 16.0698 15.3352 16.404L17.5737 18.1109C17.8702 18.3433 18.2892 18.2063 18.4179 17.8363L19.4812 14.834ZM19.5398 20.46L19.9999 22.0312L20.46 20.46L19.9999 18.8889L19.5398 20.46Z"
        fill="white"
      />
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
          y1={40}
          x2={20}
          y2={0}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FFDA34" />
          <Stop offset={1} stopColor="#FFAB51" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

