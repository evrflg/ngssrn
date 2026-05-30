import { Platform } from "react-native";

export const TAB_BAR_HEIGHT = 54;

export const WEB_LIST_FOOTER_BOTTOM_CSS =
  `calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom, 0px))` as const;

export type BottomNavLayoutKey = "1" | "2" | "3" | "4";

export type ScrollBottomSpacerValues = {
  native: number | string;
  web: number | string;
  pwa: number | string;
};

const row = (
  native: number | string,
  web: number | string,
  pwa: number | string,
): ScrollBottomSpacerValues => ({ native, web, pwa });

/**
 * 仅按 **底部菜单样式 (1–4)** 配置（首页、个人中心等共用同一套）。
 */
const SCROLL_BOTTOM_BY_NAV: Record<BottomNavLayoutKey, ScrollBottomSpacerValues> = {
  "1": row(90, 90, 120),
  "2": row(90, 90, 120),
  "3": row(90, 90, 120),
  "4": row(90, 90, 120),
};

export function isWebPWA(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  const mq = window.matchMedia?.("(display-mode: standalone)");
  if (mq?.matches) return true;
  const legacy = (window.navigator as Navigator & { standalone?: boolean })?.standalone;
  return legacy === true;
}

export function normalizeBottomNavType(raw: string | undefined): BottomNavLayoutKey {
  if (raw === "1" || raw === "2" || raw === "3" || raw === "4") return raw;
  return "4";
}

/**
 * 列表 / Scroll 底部留白（全站统一按底部导航样式）。
 * - `native`：iOS / Android
 * - `web`：浏览器（非 PWA）
 * - `pwa`：添加到主屏 / standalone
 */
export function getScrollBottomSpacer(bottomNavType?: string): number | string {
  const key = normalizeBottomNavType(bottomNavType);
  const cfg = SCROLL_BOTTOM_BY_NAV[key];

  if (Platform.OS !== "web") return cfg.native;
  if (isWebPWA()) return cfg.pwa;
  return cfg.web;
}
