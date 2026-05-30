import Carouse, { DegreeInfo } from "@/components/active/vip/Carouse";
import {
  buildVipCarouselItems,
  getVipCarouselIndexForLevel,
} from "@/components/active/vip/VipCarouselUtil";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { degreeInfoAsync, vipListAsync } from "@/store/active/activeSlice";
import { AppDispatch, RootState } from "@/store/store";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { ICarouselInstance } from "react-native-reanimated-carousel";
import { useDispatch, useSelector } from "react-redux";

/** Web type4：單卡高度約 158px；寬度與 parallax 與先前可顯示相鄰卡片的設定一致 */
const VIP_CAROUSEL_CARD_HEIGHT = 158;
const VIP_CAROUSEL_CARD_WIDTH_RATIO = 0.88;
const VIP_PARALLAX_OFFSET = 32;

type VipProgressProps = {
  /** Called when the user swipes to a different VIP card */
  onIndexChange?: (index: number) => void;
};

/** 我的 type4：VIP 等级轮播 */
export default function VipProgress({ onIndexChange }: VipProgressProps = {}) {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const degreeInfo: any = useSelector((state: RootState) => state?.active?.degreeInfo);
  const vipList = useSelector((state: RootState) => state.active.vipList);

  const vipCarouselRef = useRef<ICarouselInstance>(null);
  const vipCarouselScrolledRef = useRef(false);
  const [vipCarouselWidth, setVipCarouselWidth] = useState(0);

  const vipLayoutWidth = vipCarouselWidth > 0 ? vipCarouselWidth : Math.max(windowWidth - 24, 280);

  const vipCarouselData = useMemo(
    () => buildVipCarouselItems(vipList, degreeInfo as DegreeInfo | null),
    [vipList, degreeInfo],
  );

  const vipCarouselLoading = vipList === null || degreeInfo === null;

  const vipListRef = useRef(vipList);
  vipListRef.current = vipList;

  useFocusEffect(
    useCallback(() => {
      dispatch(degreeInfoAsync() as any);
      const list = vipListRef.current;
      if (!list || !Array.isArray(list) || list.length === 0) {
        dispatch(vipListAsync() as any).catch(() => {});
      }
      vipCarouselScrolledRef.current = false;
    }, [dispatch]),
  );

  useFocusEffect(
    useCallback(() => {
      if (
        vipCarouselRef.current &&
        vipCarouselData.length > 0 &&
        degreeInfo &&
        !vipCarouselScrolledRef.current
      ) {
        const idx = getVipCarouselIndexForLevel(vipCarouselData, degreeInfo as DegreeInfo);
        vipCarouselRef.current.scrollTo({ index: idx, animated: true });
        vipCarouselScrolledRef.current = true;
      }
    }, [vipCarouselData, degreeInfo]),
  );

  const vipCarouselHeightRatio = useMemo(
    () => VIP_CAROUSEL_CARD_HEIGHT / Math.max(vipLayoutWidth, 1),
    [vipLayoutWidth],
  );

  if (!(vipCarouselLoading || (vipCarouselData.length > 0 && degreeInfo))) {
    return null;
  }

  return (
    <View
      style={styles.vipCarouselSection}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - vipCarouselWidth) > 1) {
          setVipCarouselWidth(w);
        }
      }}
    >
      {vipCarouselLoading ? (
        <View
          style={[styles.vipCarouselSkeletonCard, { backgroundColor: Colors[theme].blockBg }]}
        />
      ) : (
        <Carouse
          ref={vipCarouselRef}
          data={vipCarouselData}
          layoutWidth={vipLayoutWidth}
          info={degreeInfo as DegreeInfo}
          heightRatio={vipCarouselHeightRatio}
          cardWidthRatio={VIP_CAROUSEL_CARD_WIDTH_RATIO}
          parallaxScrollingOffset={VIP_PARALLAX_OFFSET}
          onIndexChange={onIndexChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  vipCarouselSection: {
    marginTop: 6,
    width: "100%",
    minHeight: 158,
  },
  vipCarouselSkeletonCard: {
    alignSelf: "center",
    width: `${VIP_CAROUSEL_CARD_WIDTH_RATIO * 100}%`,
    height: 158,
    borderRadius: 12,
    overflow: "hidden",
  },
});
