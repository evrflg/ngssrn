import { memo } from "react";
import { View } from "react-native";
import { Skeleton } from "@/components/home/components/Skeleton";
import {
  BLOCK5_CARD_W,
  BLOCK5_CARDS_PER_ROW,
  BLOCK5_COVER_H,
  BLOCK5_ROW_GAP,
  BLOCK5_TEXT_H,
} from "./layout";

interface Props {
  rows: 1 | 2;
  showGameName: boolean;
}

/**
 * type5 占位骨架。
 * 1:1 对齐 GameBlock5 的版式（不复刻装饰性渐变 / 阴影 / 金条，避免视觉过重）：
 *   - 上方 header 带状（43）
 *   - 卡片区：BLOCK5_CARDS_PER_ROW 张卡片，BLOCK5_CARD_W × (cover + text)
 *   - rows === 2 则两行，间距 BLOCK5_ROW_GAP
 *
 * 注意：高度由父级 (GameArea5 的占位 View) 控制，骨架自身只决定布局而不锁高。
 */
function ZoneSkeleton5Inner({ rows, showGameName }: Props) {
  const cardH = BLOCK5_COVER_H + (showGameName ? BLOCK5_TEXT_H : 0);

  const renderRow = (key: string, marginTop = 0) => (
    <View
      key={key}
      style={{
        flexDirection: "row",
        paddingLeft: 7,
        paddingRight: 5,
        marginTop,
      }}
    >
      {Array.from({ length: BLOCK5_CARDS_PER_ROW }).map((_, i) => (
        <View key={i} style={{ width: BLOCK5_CARD_W, marginHorizontal: 4 }}>
          <Skeleton width={BLOCK5_CARD_W} height={cardH} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ marginTop: 4, marginBottom: 10 }}>
      {/* header 带状：43 高 */}
      <View
        style={{
          height: 43,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Skeleton width={20} height={20} />
          <View style={{ width: 6 }} />
          <Skeleton width={70} height={14} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Skeleton width={24} height={24} />
          <View style={{ width: 5 }} />
          <Skeleton width={24} height={24} />
          <View style={{ width: 8 }} />
          <Skeleton width={48} height={24} />
        </View>
      </View>

      {/* 卡片区：marginHorizontal:12 + 上下 padding 与真实块一致 */}
      <View
        style={{
          marginHorizontal: 12,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        {renderRow("r1", 0)}
        {rows === 2 ? renderRow("r2", BLOCK5_ROW_GAP) : null}
      </View>
    </View>
  );
}

export const ZoneSkeleton5 = memo(ZoneSkeleton5Inner);
