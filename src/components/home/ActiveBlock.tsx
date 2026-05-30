import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Colors } from "@/constants/Colors";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AutoImage from "@/components/common/AutoImage";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useTranslation } from "react-i18next";
import { MAX_WIDTH } from "@/hooks/useMaxWidth";
import { setActiveTitle } from "@/store/active/activeSlice";
import { changeIsShowTestUserPopup } from "@/store/user/userSlice";
import { useRouter } from "expo-router";

export const ActiveBlock = () => {
  const WebDiv: any = View;
  const { theme } = useTheme(); //主题
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktopMode = width > MAX_WIDTH;
  const useDesktopScrollBehavior = isDesktopMode;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const listRef = useRef<FlatList<any> | null>(null);
  const webScrollRef = useRef<any>(null);
  const desktopOffsetRef = useRef(0);
  const desktopMaxOffsetRef = useRef(0);
  const webDragStateRef = useRef<{
    dragging: boolean;
    startClientX: number;
    startScrollLeft: number;
  }>({ dragging: false, startClientX: 0, startScrollLeft: 0 });
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const activityList = useSelector((state: RootState) => state?.active?.activityList);
  const isFetching = activityList === null;
  const cards = useMemo(() => {
    if (!Array.isArray(activityList)) return [];
    return activityList.filter((item: any) => item?.status == 1);
  }, [activityList]);
  const horizontalPadding = 12;
  const cardGap = 8;
  const maxPcWidth = MAX_WIDTH;
  const contentWidth = isDesktopMode ? Math.min(width, maxPcWidth) : width;
  const viewportWidth = contentWidth - horizontalPadding * 2;
  const cardWidth = Math.floor((viewportWidth - cardGap) / 2);
  const cardHeight = Math.round(cardWidth / 2.22);
  const cardStride = cardWidth + cardGap;
  const snapOffsets = useMemo(() => {
    const count = cards.length;
    if (count <= 1) return [0];
    const contentWidth = count * cardWidth + (count - 1) * cardGap;
    const maxOffset = Math.max(0, contentWidth - viewportWidth);
    const offsets = Array.from({ length: count }, (_, index) =>
      Math.min(index * cardStride, maxOffset),
    );
    return Array.from(new Set(offsets));
  }, [cards.length, cardGap, cardStride, cardWidth, viewportWidth]);
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  //登录
  const toLogin = () => {
    navigation.push("login");
  };

  const toActivePage = (item: any) => {
    
    if (userInfo?.isLogin) {
      if (userInfo?.isTestUser) {
        dispatch(changeIsShowTestUserPopup(true));
        return;
      }
      console.log('item',item);
      const type = item?.activityType;
      dispatch(setActiveTitle({ title: item?.activityName }));
      navigation.push("active/activeCenter", { id: item?.id, type: type });
      
    } else {
      toLogin();
    }
  };

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x;
      if (!snapOffsets.length || !listRef.current) return;

      let nearest = snapOffsets[0];
      let minDist = Math.abs(x - nearest);
      for (let i = 1; i < snapOffsets.length; i += 1) {
        const dist = Math.abs(x - snapOffsets[i]);
        if (dist < minDist) {
          minDist = dist;
          nearest = snapOffsets[i];
        }
      }

      if (Math.abs(x - nearest) > 0.5) {
        listRef.current.scrollToOffset({ offset: nearest, animated: false });
      }
    },
    [snapOffsets],
  );

  // 未登录也要显示活动入口；点击时再跳登录
  const shouldShowBlock = cards.length > 0 || isFetching;
  const containerStyle = useMemo(
    () => (isDesktopMode ? { width: contentWidth, alignSelf: "center" as const } : null),
    [contentWidth, isDesktopMode],
  );
  const handleDesktopScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!useDesktopScrollBehavior) return;
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      desktopOffsetRef.current = contentOffset.x;
      desktopMaxOffsetRef.current = Math.max(0, contentSize.width - layoutMeasurement.width);
    },
    [useDesktopScrollBehavior],
  );

  const handleWebNativeScroll = useCallback(() => {
    if (!useDesktopScrollBehavior) return;
    const el = webScrollRef.current as any;
    if (!el) return;
    const left = Number(el.scrollLeft ?? 0);
    const max = Math.max(0, Number(el.scrollWidth ?? 0) - Number(el.clientWidth ?? 0));
    desktopOffsetRef.current = left;
    desktopMaxOffsetRef.current = max;
  }, [useDesktopScrollBehavior]);

  const scrollWebTo = useCallback((left: number) => {
    const el = webScrollRef.current as any;
    if (!el) return;
    el.scrollLeft = left;
    desktopOffsetRef.current = left;
  }, []);

  const handleWebWheelNative = useCallback(
    (event: any) => {
      if (!useDesktopScrollBehavior) return;
      const el = webScrollRef.current as any;
      if (!el) return;
      const deltaX = Number(event?.deltaX ?? event?.nativeEvent?.deltaX ?? 0);
      const deltaY = Number(event?.deltaY ?? event?.nativeEvent?.deltaY ?? 0);
      const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      if (!delta) return;

      const max = Math.max(0, Number(el.scrollWidth ?? 0) - Number(el.clientWidth ?? 0));
      const next = Math.max(0, Math.min(Number(el.scrollLeft ?? 0) + delta, max));
      if (Math.abs(next - Number(el.scrollLeft ?? 0)) < 0.5) return;

      // PC 横向滚动：阻止页面垂直滚动“抢走”滚轮
      if (typeof event?.preventDefault === "function") event.preventDefault();
      scrollWebTo(next);
    },
    [scrollWebTo, useDesktopScrollBehavior],
  );

  const handleWebMouseDown = useCallback(
    (event: any) => {
      if (!useDesktopScrollBehavior) return;
      const el = webScrollRef.current as any;
      if (!el) return;
      webDragStateRef.current.dragging = true;
      webDragStateRef.current.startClientX = Number(event?.clientX ?? event?.nativeEvent?.clientX ?? 0);
      webDragStateRef.current.startScrollLeft = Number(el.scrollLeft ?? 0);
    },
    [useDesktopScrollBehavior],
  );

  useEffect(() => {
    if (!(Platform.OS === "web" && useDesktopScrollBehavior)) return;
    const onMove = (e: any) => {
      if (!webDragStateRef.current.dragging) return;
      const el = webScrollRef.current as any;
      if (!el) return;
      const clientX = Number(e?.clientX ?? 0);
      const dx = clientX - webDragStateRef.current.startClientX;
      const max = Math.max(0, Number(el.scrollWidth ?? 0) - Number(el.clientWidth ?? 0));
      const next = Math.max(0, Math.min(webDragStateRef.current.startScrollLeft - dx, max));
      scrollWebTo(next);
    };
    const onUp = () => {
      webDragStateRef.current.dragging = false;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove as any);
      window.removeEventListener("mouseup", onUp as any);
    };
  }, [scrollWebTo, useDesktopScrollBehavior]);

  const handleDesktopWheel = useCallback(
    (event: any) => {
      if (!useDesktopScrollBehavior || !listRef.current) return;
      const deltaX = Number(event?.nativeEvent?.deltaX ?? 0);
      const deltaY = Number(event?.nativeEvent?.deltaY ?? 0);
      const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      if (!delta) return;
      const next = Math.max(
        0,
        Math.min(desktopOffsetRef.current + delta, desktopMaxOffsetRef.current),
      );
      if (Math.abs(next - desktopOffsetRef.current) < 0.5) return;
      desktopOffsetRef.current = next;
      listRef.current.scrollToOffset({ offset: next, animated: false });
    },
    [useDesktopScrollBehavior],
  );
  const webWheelProps = useDesktopScrollBehavior
    ? ({ onWheel: handleDesktopWheel } as any)
    : ({} as any);

  const renderCardItem = useCallback(
    (item: any, index: number) => {
      const isRight = Number(item?.optional?.bgCompositionType) === 2;
      const reward = item?.ruleVOList?.[item?.ruleVOList?.length - 1]?.rewardValue ?? "--";
      const introText = String(item?.introduction ?? "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "");
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => toActivePage(item)}
          style={[
            styles.card,
            {
              width: cardWidth,
              height: cardHeight,
              marginRight: index === cards.length - 1 ? 0 : cardGap,
              borderColor: Colors[theme].lineColor,
              backgroundColor: Colors[theme].blockBg2,
            },
          ]}
        >
          <AutoImage
            uri={item?.coverImageURL}
            imageStyle={styles.cardImageFill}
            resizeMode="cover"
            defaultIsSvg={true}
            slotWidth={cardWidth}
            slotHeight={cardHeight}
          />
          <View
            style={[
              styles.introduction,
              isRight ? styles.introductionRight : styles.introductionLeft,
            ]}
          >
            <Text style={styles.introText}>
              {introText}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [cardGap, cardHeight, cardWidth, cards.length, t, theme, toActivePage],
  );

  const renderCard = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      return renderCardItem(item, index);
    },
    [renderCardItem],
  );

  if (!shouldShowBlock) {
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]} {...webWheelProps}>
      {cards.length > 0 ? (
        <>
          {Platform.OS === "web" && useDesktopScrollBehavior ? (
            <WebDiv
              ref={webScrollRef}
              className="pc-hscrollbar"
              style={styles.webScroller as any}
              onScroll={handleWebNativeScroll as any}
              onWheel={handleWebWheelNative as any}
              onMouseDown={handleWebMouseDown as any}
            >
              <View style={styles.webRow}>
                {cards.map((item: any, index: number) => (
                  <View key={String(item?.id ?? index)} style={styles.webItemWrap}>
                    {renderCardItem(item, index)}
                  </View>
                ))}
              </View>
            </WebDiv>
          ) : (
            <FlatList
              ref={listRef}
              horizontal
              data={cards}
              keyExtractor={(item: any, index) => String(item?.id ?? index)}
              removeClippedSubviews={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              className="hide-scrollbar"
              persistentScrollbar={useDesktopScrollBehavior}
              snapToOffsets={useDesktopScrollBehavior ? undefined : snapOffsets}
              snapToAlignment="start"
              decelerationRate={useDesktopScrollBehavior ? "normal" : "fast"}
              disableIntervalMomentum={!useDesktopScrollBehavior}
              bounces={false}
              overScrollMode="never"
              contentContainerStyle={styles.listContainer}
              onMomentumScrollEnd={useDesktopScrollBehavior ? undefined : handleMomentumEnd}
              onScrollEndDrag={useDesktopScrollBehavior ? undefined : handleMomentumEnd}
              onScroll={useDesktopScrollBehavior ? handleDesktopScroll : undefined}
              scrollEventThrottle={100}
              getItemLayout={(_, index) => ({
                length: cardStride,
                offset: cardStride * index,
                index,
              })}
              renderItem={renderCard}
            />
          )}
        </>
      ) : (
        <View style={[styles.placeholder, { height: cardHeight }]}>
          <View style={[styles.skeleton, { backgroundColor: Colors[theme].buttonBackground2 }]} />
          <View style={[styles.skeleton, { backgroundColor: Colors[theme].buttonBackground2 }]} />
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginTop: 7,
  },
  listContainer: {
    paddingVertical: 4,
  },
  webScroller: {
    overflowX: "scroll",
    overflowY: "hidden",
    WebkitOverflowScrolling: "touch",
    paddingBottom: 2,
  } as any,
  webRow: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  webItemWrap: {
    flexShrink: 0,
  },
  placeholder: {
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    overflow: "hidden",
  },
  skeleton: {
    flex: 1,
    borderRadius: 12,
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  cardImageFill: {
    width: "100%",
    height: "100%",
  },
  introduction: {
    width: "52%",
    position: "absolute",
    top: 6,
    bottom: 6,
    overflow: "hidden",
  },
  introductionLeft: {
    left: "2%",
    alignItems: "flex-start",
  },
  introductionRight: {
    left: "47%",
    alignItems: "flex-end",
  },
  introText: {
    width: "100%",
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 12,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 1,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
