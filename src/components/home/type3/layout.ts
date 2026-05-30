import { Platform } from "react-native";
import { screen } from "@/utils/screen";
import { MAX_WIDTH } from "@/hooks/useMaxWidth";

/**
 * GameBlock3 / GameArea3 / ZoneSkeleton3 共享的版式常量与高度估算。
 * 单一事实来源：任何 type3/4 用到 cardwidth / zoneHeight 的地方都从这里读。
 */

const _screenW = screen.get("window").width;

/** PC Web 宽屏判定（与 GameBlock3 / GameArea3 历史行为保持一致） */
export const BLOCK3_IS_PC_WEB = Platform.OS === "web" && _screenW >= MAX_WIDTH;

/** 单卡宽度。> 600 用固定 118，否则按 4 列均分，与 GameBlock3 历史公式一致 */
export const BLOCK3_CARD_W =
  Math.ceil(_screenW > 600 ? 118 : (_screenW - 30) / 4) - 3;

/** 一行 FlatList 显示的卡片数（含 margin），用于骨架占位 */
export const BLOCK3_CARDS_PER_ROW = 4;

/** 卡片封面基础高度 */
export const BLOCK3_PHOTO_BASE_H = 116;
/** 显示游戏名时封面 + 文字总高度 */
export const BLOCK3_PHOTO_NAMED_H = 138;
/** PC Web 模式下封面额外补齐高度 */
export const BLOCK3_PHOTO_PC_EXTRA_H = 30;

/** 行间距（rows === 2 时两行卡片之间） */
export const BLOCK3_ROW_GAP = 14;
/** header(30) + pb(10) + marginTop(4) 的固定外边距 */
export const BLOCK3_FIXED_OVERHEAD = 44;

/**
 * 根据 zone 数据推算 GameBlock3 wrapper 高度，比固定 fallback 更准，
 * 减少 Tab 累计定位误差。公式来自 GameBlock3 布局常量：
 *   header(30) + card(116/138) × rows + gap(14) + pb(10) + marginTop(4)
 */
export function estimateBlock3ZoneH(
  zone: any,
  showGameName: boolean,
  pcWeb: boolean,
): number {
  const pcH = pcWeb ? BLOCK3_PHOTO_PC_EXTRA_H : 0;
  const cardH = (showGameName ? BLOCK3_PHOTO_NAMED_H : BLOCK3_PHOTO_BASE_H) + pcH;
  const rows = Number(zone?.rows) === 2 ? 2 : 1;
  const cardAreaH = rows === 2 ? cardH * 2 + BLOCK3_ROW_GAP : cardH;
  return cardAreaH + BLOCK3_FIXED_OVERHEAD;
}
