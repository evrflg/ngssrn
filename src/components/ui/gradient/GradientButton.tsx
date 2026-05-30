import React, { useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

export type GradientDirection = "vertical" | "horizontal";

/**
 * 渐变按钮（首页 IndexHeader 登录/注册、type2 ToolTab 充值/提现 等）
 *
 * 实现说明（相对早期手写 react-native-svg 版）：
 * - 现用 expo-linear-gradient：少一层 Svg 量宽/百分比在 Android 上的时序问题，代码更短。
 * - 原先用 Svg 主要是为了避开部分机型 expo-linear-gradient 朝向异常；若以后再遇到，可单点换回 Svg。
 */
export type GradientButtonProps = Omit<PressableProps, "style" | "children"> & {
  /** 渐变颜色（至少 2 个） */
  colors: [string, string, ...string[]];
  /** stop 位置（0~1），长度需与 colors 一致；不传则由 native 均分 */
  locations?: number[];
  /** 渐变方向；若同时传 start+end 则以此为准 */
  direction?: GradientDirection;
  /** 覆盖渐变起点（0~1，相对容器） */
  start?: { x: number; y: number };
  /** 覆盖渐变终点（0~1，相对容器） */
  end?: { x: number; y: number };
  /**
   * 把「底色 + 半透明叠层」预计算成不透明渐变的 stop，避免 iOS/Web 上多层 alpha 叠加与 Vue 观感不一致。
   * - backgroundColor：按钮所在区域看到的底色（例如 header 上该槽位的背景色）
   * - baseOverlayColor：按钮底层的半透色（例 rgba(255,255,255,0.06)）
   * - gradientOverlayColor：上层主题渐变叠色（例带 alpha 的主题色）
   * - stop：gradientOverlayColor 从该位置开始掺入（0~1）
   *
   * 传了 bakeSolid 后，会覆盖 colors / locations（等价于旧版里 Svg 多 stop 的那条路径）。
   */
  bakeSolid?: {
    backgroundColor: string;
    baseOverlayColor: string;
    gradientOverlayColor: string;
    stop: number;
  };
  /** 容器样式（padding、minWidth、height 等） */
  style?: StyleProp<ViewStyle>;
  /** 文案（与 children 二选一） */
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  /** 圆角；需与 style 里的 borderRadius 一致时以显式传入为准 */
  borderRadius?: number;
};

/**
 * 将 bakeSolid 三组色做 alpha 合成 → 3 个不透明色 + [0, stop, 1]，供 LinearGradient 一次画完。
 */
function bakeSolidToStops(bakeSolid: GradientButtonProps["bakeSolid"]): {
  colors: string[];
  locations: number[];
} | null {
  if (!bakeSolid) return null;

  const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
  const parseColor = (c: string) => {
    const s = (c || "").trim();
    const m = s.match(
      /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i,
    );
    if (m) {
      return {
        r: Number(m[1]),
        g: Number(m[2]),
        b: Number(m[3]),
        a: clamp01(m[4] == null ? 1 : Number(m[4])),
      };
    }
    if (s.startsWith("#")) {
      const hex = s.slice(1);
      if (hex.length === 3) {
        return {
          r: parseInt(hex[0] + hex[0], 16),
          g: parseInt(hex[1] + hex[1], 16),
          b: parseInt(hex[2] + hex[2], 16),
          a: 1,
        };
      }
      if (hex.length === 6) {
        return {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16),
          a: 1,
        };
      }
    }
    return null;
  };

  const blend = (
    top: { r: number; g: number; b: number; a: number },
    bot: { r: number; g: number; b: number; a: number },
  ) => {
    const a = top.a + bot.a * (1 - top.a);
    if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 };
    const r = (top.r * top.a + bot.r * bot.a * (1 - top.a)) / a;
    const g = (top.g * top.a + bot.g * bot.a * (1 - top.a)) / a;
    const b = (top.b * top.a + bot.b * bot.a * (1 - top.a)) / a;
    return { r, g, b, a };
  };

  const toHex = (c: { r: number; g: number; b: number }) => {
    const h = (n: number) => Math.round(n).toString(16).padStart(2, "0");
    return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
  };

  const bg = parseColor(bakeSolid.backgroundColor);
  const baseOverlay = parseColor(bakeSolid.baseOverlayColor);
  const grad = parseColor(bakeSolid.gradientOverlayColor);
  if (!bg || !baseOverlay || !grad) return null;

  const base = blend(baseOverlay, bg);
  const top = blend(grad, base);

  return {
    colors: [toHex(base), toHex(base), toHex(top)],
    locations: [0, clamp01(bakeSolid.stop), 1],
  };
}

export function GradientButton({
  colors,
  locations,
  direction = "vertical",
  start,
  end,
  bakeSolid,
  style,
  title,
  titleStyle,
  children,
  borderRadius = 10,
  disabled,
  ...rest
}: GradientButtonProps) {
  const baked = useMemo(() => bakeSolidToStops(bakeSolid), [bakeSolid]);
  const effectiveColors = baked?.colors ?? [...colors];
  const effectiveLocations = baked?.locations ?? locations;

  // start/end 优先；否则横向 (0,0)→(1,0)，纵向 (0,0)→(0,1)（与同目录 button.svg 里注册类竖直渐变一致可选用 theme 三色）
  const { gradStart, gradEnd } = useMemo(() => {
    if (start && end) {
      return { gradStart: start, gradEnd: end };
    }
    if (direction === "horizontal") {
      return { gradStart: { x: 0, y: 0 }, gradEnd: { x: 1, y: 0 } };
    }
    return { gradStart: { x: 0, y: 0 }, gradEnd: { x: 0, y: 1 } };
  }, [direction, start, end]);

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={[
        styles.root,
        { borderRadius, opacity: disabled ? 0.6 : 1 },
        style,
        // bakeSolid 已 bake 进 LinearGradient 的纯色 stop，外层不要再铺底色，否则会偏色（对齐旧 Svg 双层逻辑）
        bakeSolid ? { backgroundColor: "transparent" } : null,
      ]}
    >
      <LinearGradient
        colors={
          effectiveColors.length >= 2
            ? (effectiveColors as [string, string, ...string[]])
            : [effectiveColors[0], effectiveColors[0]]
        }
        {...(effectiveLocations && effectiveLocations.length === effectiveColors.length
          ? { locations: effectiveLocations as [number, number, ...number[]] }
          : {})}
        start={gradStart}
        end={gradEnd}
        // absoluteFill + 同值 borderRadius：与外层 overflow:hidden 一起裁圆角（Android/iOS/Web 通用写法）
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
      />
      {children ?? <Text style={[styles.title, titleStyle]}>{title ?? ""}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
});
