import React, { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

const VIEWBOX = { w: 151, h: 124 } as const;

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 与 `getType2ThemeTokens().linearGradient` 一致：左→右，[0] 左侧、[1] 右侧（与 expo-linear-gradient LTR 一致） */
  lineColors: [string, string];
};

function ThemedGradientLayer({ lineColors }: { lineColors: [string, string] }) {
  const gid = React.useId().replace(/:/g, "_");
  const [c0, c1] = lineColors;
  const { w, h } = VIEWBOX;

  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={gid} x1={0} y1={h / 2} x2={w} y2={h / 2} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={c0} stopOpacity={1} />
          <Stop offset="1" stopColor={c1} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect width={w} height={h} fill={`url(#${gid})`} />
    </Svg>
  );
}

export function GradientBg({ children, style, lineColors }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={[StyleSheet.absoluteFillObject, { pointerEvents: "none", zIndex: -1 }]}>
        <ThemedGradientLayer lineColors={lineColors} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    position: "relative",
  },
});
