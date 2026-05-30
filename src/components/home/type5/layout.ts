import { screen } from "@/utils/screen";

/**
 * GameBlock5 / GameArea5 / ZoneSkeleton5 共享的版式常量与高度估算。
 * 单一事实来源：任何 type5 用到 cardwidth / zoneHeight 的地方都从这里读。
 */

const _sw = screen.get("window").width;
/** 限宽：超过 480 当 480 看待，避免大屏卡片过宽 */
const _ww = Math.ceil(_sw >= 480 ? 480 : _sw);

/** 单卡宽度。((480 或屏宽) - 58) / 4 - 3 */
export const BLOCK5_CARD_W = Math.ceil((_ww - 58) / 4) - 3;

/** 一行 FlatList 显示的卡片数，用于骨架占位 */
export const BLOCK5_CARDS_PER_ROW = 4;

/** 封面宽高比（width / height = 0.732） */
export const BLOCK5_COVER_ASPECT_RATIO = 0.732;

/** 封面高度 = cardW / aspectRatio */
export const BLOCK5_COVER_H = Math.ceil(BLOCK5_CARD_W / BLOCK5_COVER_ASPECT_RATIO);

/** 显示游戏名时下方文字行高 */
export const BLOCK5_TEXT_H = 18;

/** 两行卡片间距（rows === 2）*/
export const BLOCK5_ROW_GAP = 12;

/** header(43) + 金条(14净) + pt(10) + pb(10) + 上下 margin(14) */
export const BLOCK5_FIXED_OVERHEAD = 91;

/** 推算 GameBlock5 wrapper 高度，给 Tab 累计定位和骨架占位用 */
export function estimateBlock5ZoneH(zone: any, showGameName: boolean): number {
  const textH = showGameName ? BLOCK5_TEXT_H : 0;
  const singleCardH = BLOCK5_COVER_H + textH;
  const rows = Number(zone?.rows) === 2 ? 2 : 1;
  const cardAreaH = rows === 2 ? singleCardH * 2 + BLOCK5_ROW_GAP : singleCardH;
  return cardAreaH + BLOCK5_FIXED_OVERHEAD;
}
