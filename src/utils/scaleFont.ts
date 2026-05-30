import { MAX_WIDTH } from "@/hooks/useMaxWidth";
import { Dimensions, PixelRatio, Platform } from "react-native";

/** Figma / 设计稿逻辑宽度基准（与常见 Vue 活动 H5 的 375 稿一致） */
export const FONT_DESIGN_WIDTH = 375;

/**
 * 以 375 为基准、按「当前用于排版的宽度」线性缩放字号。
 * 思路对齐 Vue3 里 postcss-px-to-viewport 一类：`font ≈ 设计稿 px × (视口宽 / 375)`。
 * 这里用 `Math.min(width, MAX_WIDTH)` 作为有效视口宽，避免 PC Web 整屏过宽时字号跟着飙太大。
 */
let cachedWindowWidth = Dimensions.get("window").width;
let cachedWindowHeight = Dimensions.get("window").height;
let hasBoundDimensionListener = false;

const MOBILE_WIDTH_HEIGHT_RATE_THRESHOLD = 930 / 1334;
const PC_WIDTH_HEIGHT_RATE_THRESHOLD = 850 / 1334;

function bindDimensionListenerOnce() {
  if (hasBoundDimensionListener) return;
  hasBoundDimensionListener = true;
  Dimensions.addEventListener("change", ({ window }) => {
    cachedWindowWidth = window.width;
    cachedWindowHeight = window.height;
  });
}

/**
 * 对齐 ngss-vue/useAppResize：
 * - 横屏：直接使用当前宽度
 * - 竖屏：当 width/height 超阈值时按阈值限制有效宽度
 */
function getVueLikeEffectiveWidth(width: number, height: number): number {
  if (width <= 0) return 0;
  if (height <= 0) return width;

  if (width > height) {
    return width;
  }

  const threshold =
    Platform.OS === "web"
      ? PC_WIDTH_HEIGHT_RATE_THRESHOLD
      : MOBILE_WIDTH_HEIGHT_RATE_THRESHOLD;
  const widthHeightRate = width / height;

  return widthHeightRate > threshold ? threshold * height : width;
}

function getAutoLayoutWidth() {
  bindDimensionListenerOnce();
  if (Platform.OS !== "web") {
    const { width, height } = Dimensions.get("window");
    return getVueLikeEffectiveWidth(width, height);
  }
  return getVueLikeEffectiveWidth(cachedWindowWidth, cachedWindowHeight);
}

/**
 * @param pxAt375 设计稿上 375 宽时的字号（px）
 * @param layoutWidth 可选：外层容器逻辑宽；不传则用当前窗口宽（Web 用缓存，随 resize 更新）
 */
export function rf(pxAt375: number, layoutWidth?: number): number {
  let width = layoutWidth ?? getAutoLayoutWidth();
  width = Math.min(width, MAX_WIDTH);
  const scaled = (pxAt375 * width) / FONT_DESIGN_WIDTH;
  return PixelRatio.roundToNearestPixel(scaled);
}
