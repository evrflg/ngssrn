import { View, StyleSheet, FlatList, Pressable, Platform, DeviceEventEmitter } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  useRef,
} from "react";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { GameTypeIcon } from "../type2/GameTypeIcon";
import { changeCurrentTabId } from "@/store/game/gameSlice";

/** 与 styles.tabItem（width 42 + marginLeft 10）一致，供 FlatList getItemLayout 与首页联动滚动共用 */
export const GAME_TAB4_ITEM_STRIDE_PX = 42 + 10;

/** 与 GameTab5 / GameArea5 兜底高度一致 */
const ROW1_FALLBACK_HEIGHT = 240;
const ROW2_FALLBACK_HEIGHT = 446;

/** 横向 Tab 条高度（仅样式） */
const GAME_TAB4_TAB_STRIP_HEIGHT = 56;

// 子组件暴露的方法类型
export type GameTabRef = {
  updateCurrentIndex: (index: any) => void;
};

/** 网络 tab 图标加载失败时显示默认 GameTypeIcon */
const TabZoneIcon4 = memo(function TabZoneIcon4({
  gameZone,
  currentId,
  iconUri,
}: {
  gameZone: any;
  currentId: any;
  iconUri?: string | null;
}) {
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [iconUri]);

  if (!iconUri || loadFailed) {
    return <GameTypeIcon type={gameZone} currentId={currentId} />;
  }

  return (
    <ExpoImage
      source={{ uri: iconUri }}
      style={{ width: 24, height: 24 }}
      contentFit="contain"
      transition={0}
      onError={() => setLoadFailed(true)}
    />
  );
});

const TabItem = ({
  item,
  theme,
  isActive,
  currentGameZone,
  onPress,
}: {
  item: any;
  theme: any;
  isActive: boolean;
  currentGameZone: any;
  onPress: (item: any) => void;
}) => (
  <Pressable
    onPress={() => onPress(item)}
    style={[
      styles.tabItem,
      { backgroundColor: Colors[theme].cardBg1 },
      isActive && styles.tabItemActive,
    ]}
  >
    <TabZoneIcon4 gameZone={item.gameZone} currentId={currentGameZone} iconUri={item.icon} />
  </Pressable>
);

const MemoTabItem = memo(
  TabItem,
  (prev, next) =>
    prev.item === next.item &&
    prev.theme === next.theme &&
    prev.isActive === next.isActive &&
    prev.currentGameZone === next.currentGameZone,
);

export const GameTab4 = forwardRef(({ data }: any, ref: any) => {
  const { theme } = useTheme();
  const dispatch: AppDispatch = useDispatch();
  const { gameScrollViewRef, tabScrollViewRef, onTabInteraction } = data;
  const gameList: any = useSelector((state: RootState) => state?.game?.gameList);
  const topAreaHeight: any = useSelector((state: RootState) => state?.game?.topAreaHeight);
  const gameAreaHeight: any = useSelector((state: RootState) => state?.game?.gameAreaHeight);
  const gameAreaOffsetMap: any = useSelector((state: RootState) => state?.game?.gameAreaOffsetMap);
  const gameAreaBaseOffset: any = useSelector((state: RootState) => state?.game?.gameAreaBaseOffset);

  const [currentIndex, setCurrentIndex] = useState(0);
  const tabListRef = useRef<FlatList<any> | null>(null);
  const latestZoneOffsetMapRef = useRef<Record<string, number>>({});
  const latestTopAreaHeightRef = useRef(Number(topAreaHeight || 0));
  const latestGameAreaOffsetMapRef = useRef<Record<string, number>>(
    (gameAreaOffsetMap ?? {}) as Record<string, number>,
  );
  const latestGameAreaBaseOffsetRef = useRef<number>(Math.max(0, Number(gameAreaBaseOffset || 0)));
  const correctionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 用 useMemo 计算，避免模块变量 + useEffect 延迟赋值导致点击时取到旧值
  const tabScrollUpOffset = useMemo(() => {
    const h = Number(topAreaHeight || 0);
    return h > 0 ? -h : -170;
  }, [topAreaHeight]);

  useEffect(() => {
    if (gameList.length > 0) {
      dispatch(changeCurrentTabId(gameList[currentIndex]?.gameZone));
    }
  }, [currentIndex, gameList, dispatch]);

  /** 与 GameTab5.gameZoneOffsetMap 同源：测量 offset + 单调累计兜底，避免越往后偏差越大 */
  const gameZoneOffsetMap = useMemo(() => {
    const map: Record<string, number> = {};
    // offset 从 0 开始，代表相对 GameArea 容器的偏移量。
    // tabScrollUpOffset（=-topAreaHeight）在 scrollTo 时会补回 topAreaHeight，
    // 若此处从 topAreaHeight 开始则双重叠加，导致所有分区定位偏高一个 carousel 高度。
    let offset = 0;
    const baseOffset = Math.max(0, Number(gameAreaBaseOffset || 0));

    if (Array.isArray(gameList)) {
      gameList.forEach((item: any) => {
        const zoneKey = String(item?.gameZone ?? "");
        if (!zoneKey) return;
        const measuredOffset = Number(gameAreaOffsetMap?.[item?.gameZone]);
        const hasMeasuredOffset = Number.isFinite(measuredOffset) && measuredOffset >= 0;
        const measuredAbs = baseOffset + measuredOffset;
        const nextOffset =
          hasMeasuredOffset && measuredAbs >= offset ? measuredAbs : offset;
        map[zoneKey] = nextOffset;
        const zoneHeight = Number(gameAreaHeight?.[item?.gameZone] ?? 0);
        const fallbackHeight = item?.rows == 1 ? ROW1_FALLBACK_HEIGHT : ROW2_FALLBACK_HEIGHT;
        offset = nextOffset + (zoneHeight > 0 ? zoneHeight : fallbackHeight);
      });
    }

    return map;
  }, [gameList, gameAreaHeight, gameAreaOffsetMap, gameAreaBaseOffset]);

  const toGameType = useCallback(
    (gameZone: string) => {
      const key = String(gameZone ?? "");
      const hasMeasuredOffset = () => {
        const measured = Number(
          latestGameAreaOffsetMapRef.current[key] ?? (gameAreaOffsetMap?.[key] as any),
        );
        return Number.isFinite(measured) && measured >= 0;
      };

      const scrollToZone = (animated: boolean) => {
        const measuredOffset = Number(
          latestGameAreaOffsetMapRef.current[key] ?? (gameAreaOffsetMap?.[key] as any),
        );
        const baseOffset =
          Number.isFinite(latestGameAreaBaseOffsetRef.current) &&
          latestGameAreaBaseOffsetRef.current > 0
            ? latestGameAreaBaseOffsetRef.current
            : Math.max(0, Number(gameAreaBaseOffset || 0));

        const fallbackOffset = latestZoneOffsetMapRef.current[key] ?? gameZoneOffsetMap[key];
        const positionY =
          Number.isFinite(measuredOffset) && measuredOffset >= 0
            ? baseOffset + measuredOffset
            : fallbackOffset;

        if (typeof positionY !== "number" || !Number.isFinite(positionY)) return false;
        const scroller = gameScrollViewRef.current;
        if (!scroller) {
          return false;
        }
        const targetScrollY = Math.max(0, positionY - tabScrollUpOffset);
        DeviceEventEmitter.emit("home-tab-jump-target-y", targetScrollY);
        scroller.scrollTo({ y: targetScrollY, animated });
        return true;
      };

      if (correctionTimerRef.current) {
        clearTimeout(correctionTimerRef.current);
        correctionTimerRef.current = null;
      }

      scrollToZone(true);

      // 100ms × 50 = 最多等 5s，分区多时布局测量较慢
      if (!hasMeasuredOffset()) {
        let attempts = 0;
        const poll = () => {
          correctionTimerRef.current = null;
          if (hasMeasuredOffset()) {
            scrollToZone(false);
            return;
          }
          if (++attempts < 50) {
            correctionTimerRef.current = setTimeout(poll, 100);
          }
        };
        correctionTimerRef.current = setTimeout(poll, 100);
      }
    },
    [gameScrollViewRef, gameAreaOffsetMap, gameZoneOffsetMap, tabScrollUpOffset, gameAreaBaseOffset],
  );

  useImperativeHandle(ref, () => ({
    updateCurrentIndex: (index: any) => {
      setCurrentIndex((prev) => (prev === index ? prev : index));
    },
  }));

  useEffect(() => {
    latestZoneOffsetMapRef.current = gameZoneOffsetMap;
    latestTopAreaHeightRef.current = Number(topAreaHeight || 0);
    latestGameAreaOffsetMapRef.current = gameAreaOffsetMap ?? {};
    latestGameAreaBaseOffsetRef.current = Math.max(0, Number(gameAreaBaseOffset || 0));
  }, [gameZoneOffsetMap, topAreaHeight, gameAreaOffsetMap, gameAreaBaseOffset]);

  useEffect(() => {
    tabScrollViewRef.current = {
      scrollTo: ({ x = 0, animated = true }: { x?: number; animated?: boolean }) => {
        tabListRef.current?.scrollToOffset({ offset: Math.max(0, x), animated });
      },
    };
    return () => {
      tabScrollViewRef.current = null;
      if (correctionTimerRef.current) {
        clearTimeout(correctionTimerRef.current);
      }
    };
  }, [tabScrollViewRef]);

  const tabData = useMemo(() => {
    if (!Array.isArray(gameList) || gameList.length === 0) return [];
    return gameList.map((item: any, index: number) => ({
      ...item,
      _index: index,
    }));
  }, [gameList]);
  const handleTabPress = useCallback(
    (item: any) => {
      const idx = Number(item?._index ?? 0);
      // onTabInteraction 会锁住首页 zone 检测，期间不会走 syncTabByIndex → updateCurrentIndex，需本地立刻更新高亮
      setCurrentIndex(idx);
      onTabInteraction?.();
      toGameType(String(item.gameZone));
      const stride = GAME_TAB4_ITEM_STRIDE_PX;
      tabListRef.current?.scrollToOffset({
        offset: Math.max(0, idx * stride - stride),
        animated: true,
      });
    },
    [onTabInteraction, toGameType],
  );

  const currentGameZone = gameList[currentIndex]?.gameZone;
  const renderTabItem = useCallback(
    ({ item }: { item: any }) => (
      <MemoTabItem
        item={item}
        theme={theme}
        isActive={currentIndex == item._index}
        currentGameZone={currentGameZone}
        onPress={handleTabPress}
      />
    ),
    [theme, currentIndex, currentGameZone, handleTabPress],
  );

  // 横向 Tab 分区常 >10；98/99 多在末尾，initialNumToRender 过小则末尾项暂不 mount
  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={styles.box}>
        <FlatList
          data={tabData}
          horizontal
          ref={tabListRef}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item: any, index: number) => String(item?.gameZone ?? item?.id ?? index)}
          renderItem={renderTabItem}
          getItemLayout={(_, index) => ({
            length: GAME_TAB4_ITEM_STRIDE_PX,
            offset: GAME_TAB4_ITEM_STRIDE_PX * index,
            index,
          })}
          initialNumToRender={tabData.length || 30}
          maxToRenderPerBatch={tabData.length || 30}
          windowSize={21}
          removeClippedSubviews={false}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {},
  box: {
    height: GAME_TAB4_TAB_STRIP_HEIGHT,
    overflow: "hidden",
  },
  tabItem: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 10,
    marginTop: 6,
    borderWidth: 0,
    borderColor: "transparent",
  },
  tabItemActive: {
    borderWidth: 1,
    borderColor: "#A9E786",
  },
});
