import { memo } from "react";
import { View } from "react-native";
import { Skeleton } from "@/components/home/components/Skeleton";
import {
  BLOCK3_CARD_W,
  BLOCK3_CARDS_PER_ROW,
  BLOCK3_PHOTO_BASE_H,
  BLOCK3_PHOTO_NAMED_H,
  BLOCK3_PHOTO_PC_EXTRA_H,
  BLOCK3_ROW_GAP,
} from "./layout";

interface Props {
  rows: 1 | 2;
  showGameName: boolean;
  pcWeb: boolean;
}

/**
 * type3 / type4 占位骨架。
 * 结构 1:1 对齐 GameBlock3：
 *   - header(30) icon + 标题 / 左翻 + 右翻 + 更多
 *   - 卡片网格：每行 BLOCK3_CARDS_PER_ROW 张 BLOCK3_CARD_W × photoH
 *   - rows === 2 则两行，间距 BLOCK3_ROW_GAP
 *
 * 注意：本组件本身不设固定 height，由父级 (GameArea3 的占位 View) 控制高度，
 * 这样能与 gameAreaHeight 测量值保持一致，避免 isLoaded 切换时跳动。
 */
function ZoneSkeleton3Inner({ rows, showGameName, pcWeb }: Props) {
  const pcH = pcWeb ? BLOCK3_PHOTO_PC_EXTRA_H : 0;
  const photoH =
    (showGameName ? BLOCK3_PHOTO_NAMED_H : BLOCK3_PHOTO_BASE_H) + pcH;

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
      {Array.from({ length: BLOCK3_CARDS_PER_ROW }).map((_, i) => (
        <View key={i} style={{ width: BLOCK3_CARD_W, marginHorizontal: 4 }}>
          <Skeleton width={BLOCK3_CARD_W} height={photoH} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ marginTop: 4, paddingBottom: 10 }}>
      {/* header 行：30 高，左右对齐 */}
      <View
        style={{
          height: 30,
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Skeleton width={20} height={20} />
          <View style={{ width: 6 }} />
          <Skeleton width={56} height={12} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Skeleton width={30} height={30} />
          <View style={{ width: 5 }} />
          <Skeleton width={30} height={30} />
          <View style={{ width: 8 }} />
          <Skeleton width={56} height={30} />
        </View>
      </View>
      {/* 卡片网格 */}
      <View style={{ paddingTop: 10 }}>
        {renderRow("r1", 0)}
        {rows === 2 ? renderRow("r2", BLOCK3_ROW_GAP) : null}
      </View>
    </View>
  );
}

export const ZoneSkeleton3 = memo(ZoneSkeleton3Inner);
