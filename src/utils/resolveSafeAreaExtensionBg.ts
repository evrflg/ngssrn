import type { ThemeType } from "@/hooks/theme/ThemeProvider";

/** 與 footer navigation 一致：`safeAreaBgColor ?? (greenBlack ? #313536 : #f7f7f7)` */
export function resolveSafeAreaExtensionBg(
  theme: ThemeType,
  safeAreaBgColor?: string
): string {
  if (safeAreaBgColor) return safeAreaBgColor;
  return theme === "greenBlack" ? "#313536" : "#f7f7f7";
}
