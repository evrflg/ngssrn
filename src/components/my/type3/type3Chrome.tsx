import { Colors } from "@/constants/Colors";
import { buildMyCenterCardTheme } from "@/hooks/cardThemeFactory";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

export type Type3ChromeVariant = "header" | "tile" | "footer";

type Type3ChromeProps = {
  variant: Type3ChromeVariant;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/**
 * Vue CSS opacity mapping (color-mix percentages):
 *   header / tile: all 4 corners = 18%
 *   footer: TL=18%, TR=10%, BL=0%, BR=0%
 */
type CornerOpacities = { tl: number; tr: number; bl: number; br: number };

const CORNER_OPACITY: Record<Type3ChromeVariant, CornerOpacities> = {
  header: { tl: 0.18, tr: 0.18, bl: 0.18, br: 0.18 },
  tile: { tl: 0.18, tr: 0.18, bl: 0.18, br: 0.18 },
  footer: { tl: 0.18, tr: 0.10, bl: 0, br: 0 },
};

let _instanceCounter = 0;

export function Type3Chrome({ variant, containerStyle, contentStyle, children }: Type3ChromeProps) {
  const { theme } = useTheme();
  const { tokens } = buildMyCenterCardTheme(theme, 3);
  const { cornerTint, cornerOrb } = tokens;
  const uid = React.useRef(`t3c-${++_instanceCounter}`).current;

  const { w, h } = variant === "footer" ? cornerOrb.footer : cornerOrb.default;
  /**
   * tile 區塊高度只有 ~64px；
   * orb 若和 header 一樣大會在中心大量重疊，形成明顯亮帶。
   */
  const orbW = variant === "tile" ? w * 0.45 : w;
  const orbH = variant === "tile" ? h * 0.45 : h;
  const elevated = variant === "header";
  const opacities = CORNER_OPACITY[variant];

  return (
    <View
      style={[
        styles.shell,
        {
          backgroundColor: Colors[theme].cardBg1,
          ...(elevated
            ? Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                },
                android: { elevation: 3 },
                default: {},
              })
            : {}),
        },
        containerStyle,
      ]}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {opacities.tl > 0 && (
          <Svg width={orbW} height={orbH} style={[styles.cornerSvg, { top: 0, left: 0 }]}>
            <Defs>
              <RadialGradient id={`${uid}-tl`} cx="0%" cy="0%" r="100%">
                <Stop offset="0%" stopColor={cornerTint} stopOpacity={opacities.tl} />
                <Stop offset="100%" stopColor={cornerTint} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={orbW} height={orbH} fill={`url(#${uid}-tl)`} />
          </Svg>
        )}
        {opacities.tr > 0 && (
          <Svg width={orbW} height={orbH} style={[styles.cornerSvg, { top: 0, right: 0 }]}>
            <Defs>
              <RadialGradient id={`${uid}-tr`} cx="100%" cy="0%" r="100%">
                <Stop offset="0%" stopColor={cornerTint} stopOpacity={opacities.tr} />
                <Stop offset="100%" stopColor={cornerTint} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={orbW} height={orbH} fill={`url(#${uid}-tr)`} />
          </Svg>
        )}
        {opacities.bl > 0 && (
          <Svg width={orbW} height={orbH} style={[styles.cornerSvg, { bottom: 0, left: 0 }]}>
            <Defs>
              <RadialGradient id={`${uid}-bl`} cx="0%" cy="100%" r="100%">
                <Stop offset="0%" stopColor={cornerTint} stopOpacity={opacities.bl} />
                <Stop offset="100%" stopColor={cornerTint} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={orbW} height={orbH} fill={`url(#${uid}-bl)`} />
          </Svg>
        )}
        {opacities.br > 0 && (
          <Svg width={orbW} height={orbH} style={[styles.cornerSvg, { bottom: 0, right: 0 }]}>
            <Defs>
              <RadialGradient id={`${uid}-br`} cx="100%" cy="100%" r="100%">
                <Stop offset="0%" stopColor={cornerTint} stopOpacity={opacities.br} />
                <Stop offset="100%" stopColor={cornerTint} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={orbW} height={orbH} fill={`url(#${uid}-br)`} />
          </Svg>
        )}
      </View>
      <View style={[styles.foreground, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 8,
    overflow: "hidden",
  },
  cornerSvg: {
    position: "absolute",
  },
  foreground: {
    position: "relative",
    zIndex: 1,
  },
});
