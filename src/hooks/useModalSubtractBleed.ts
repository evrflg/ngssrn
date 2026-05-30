import { useCallback, useMemo, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

/** 對應 Vue 的 `MODAL_SUBTRACT_BLEED_TITLE`（識別用）。 */
export const MODAL_SUBTRACT_BLEED_TITLE = "modal-subtract-bleed-title";

/**
 * 與 Vue `--subtract-bleed` 相同：`left: -SUBTRACT_LEFT_BLEED_PX`、總寬 = 內層寬 + 此值
 * （等同 `width: calc(100% + var(--subtract-bleed))`）。
 */
const SUBTRACT_LEFT_BLEED_PX = 12;

/** 量到寬度前 SVG 最小寬度（px），避免首幀過窄。 */
const MIN_SUBTRACT_SVG_WIDTH = 149;

export type UseModalSubtractBleedRowResult = {
  bleedPx: number;
  subtractSvgWidth: number;
  /** 貼在 Vue `intro-inner` 同層的 `View` 上；寬度 = 標題塊實際寬（含 padding）。 */
  onIntroInnerLayout: (e: LayoutChangeEvent) => void;
};

/**
 * 動態寬度：與 Vue 一樣，由「包住標題」的 shrink-wrap 容器寬度驅動 SVG，
 * `subtractSvgWidth === 容器寬 + bleed`，右邊界與標題塊對齊。
 */
export function useModalSubtractBleedRow(): UseModalSubtractBleedRowResult {
  const [introInnerWidth, setIntroInnerWidth] = useState(0);

  const onIntroInnerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setIntroInnerWidth(width);
  }, []);

  const subtractSvgWidth = useMemo(() => {
    const inner = introInnerWidth;
    const withBleed =
      inner > 0 ? inner + SUBTRACT_LEFT_BLEED_PX : MIN_SUBTRACT_SVG_WIDTH;
    return Math.max(MIN_SUBTRACT_SVG_WIDTH, withBleed);
  }, [introInnerWidth]);

  return {
    bleedPx: SUBTRACT_LEFT_BLEED_PX,
    subtractSvgWidth,
    onIntroInnerLayout,
  };
}
