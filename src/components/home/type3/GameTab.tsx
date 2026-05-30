import { View, StyleSheet, FlatList, Text, Pressable, Platform, DeviceEventEmitter } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { GameTypeIcon3 } from "./GameTypeIcon";
import { changeCurrentTabId } from "@/store/game/gameSlice";

/** 与 Tab 列宽一致，供 FlatList getItemLayout 与 Index3.syncTabByIndex 横向联动 */
export const GAME_TAB3_ITEM_STRIDE_PX = 90;
const TAB_WIDTH = GAME_TAB3_ITEM_STRIDE_PX;
const SCROLL_X = GAME_TAB3_ITEM_STRIDE_PX;

const ROW1_FALLBACK_HEIGHT = 240;
const ROW2_FALLBACK_HEIGHT = 446;
const TOP_AREA_HEIGHT_FALLBACK = 258;
const isWeb = Platform.OS === "web";
const isIOS = Platform.OS === "ios";
// 子组件暴露的方法类型
export type GameTabRef = {
  updateCurrentIndex: (index:any) => void;
};

/** 网络 tab 图标加载失败时显示默认 GameTypeIcon3 */
const TabZoneIcon = memo(function TabZoneIcon({
  gameZone,
  iconUri,
}: {
  gameZone: any;
  iconUri?: string | null;
}) {
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [iconUri]);

  if (!iconUri || loadFailed) {
    return <GameTypeIcon3 type={gameZone} />;
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
  isActive,
  onPress,
  theme,
}: {
  item: any;
  isActive: boolean;
  onPress: (index: number, gameZone: string) => void;
  theme: any;
}) => {
  // Android：backgroundColor 用 "" 时列表复用 cell 可能不清除背景，出现多个 Tab「看起来像高亮」
  const tabStyle = {
    width: TAB_WIDTH,
    height: 56,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: isActive
      ? Colors[theme].lightPrimary
      : Colors[theme].cardBg1,
    borderBottomWidth: isActive ? 1 : 0,
    borderBottomColor: isActive ? Colors[theme].primary : "transparent",
  };

  return (
    <Pressable
      onPress={() => onPress(item.index, item.gameZone)}
      style={tabStyle}
    >
      <TabZoneIcon gameZone={item.gameZone} iconUri={item.icon} />
      <Text
        className="mt-1 pl-1 pr-1"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          fontSize: 12,
          color: isActive ? Colors[theme].primary : Colors[theme].text,
        }}
      >
        {item.tabLabel}
      </Text>
    </Pressable>
  );
};

const MemoTabItem = memo(
  TabItem,
  (prev, next) =>
    prev.item === next.item &&
    prev.isActive === next.isActive &&
    prev.theme === next.theme
);

export const GameTab = forwardRef(({ data }: any, ref: any) => {
  const { theme } = useTheme();
  const dispatch: AppDispatch = useDispatch();
  const { gameScrollViewRef, tabScrollViewRef, onTabInteraction } = data;
  const gameList: any = useSelector((state: RootState) => state?.game?.gameList);
  const gameZoneDict: any = useSelector((state: RootState) => state?.game?.gameZoneDict);
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
  /** 与 GameTab4 一致：首页外层列表纵向补偿 */
  const tabScrollUpOffset = useMemo(() => {
    // 之前用 let + useEffect 会导致点击时仍用旧值（effect 尚未执行），造成滚动不准
    const h = Number(topAreaHeight || 0);
    return h > 0 ? -h : -240;
  }, [topAreaHeight]);

  useEffect(() => {
    if (gameList.length > 0) {
      dispatch(changeCurrentTabId(gameList[currentIndex]?.gameZone));
    }
  }, [currentIndex, gameList, dispatch]);

  const gameZoneOffsetMap = useMemo(() => {
    const map: Record<string, number> = {};
    // 注意：offset 必须从 0 开始（代表相对 GameArea 容器的偏移量）。
    // TAB_SCROLL_UP_OFFSET（=-topAreaHeight）会在 scrollTo 时补回 topAreaHeight，
    // 若此处从 topAreaHeight 开始则会双重叠加，导致所有分区定位偏高一个 carousel 高度。
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
        // 通知 GameArea 提前加载目标分区图片，使动画播放期间图片已开始下载
        DeviceEventEmitter.emit("home-tab-jump-target-y", targetScrollY);
        scroller.scrollTo({ y: targetScrollY, animated });
        return true;
      };

      if (correctionTimerRef.current) {
        clearTimeout(correctionTimerRef.current);
        correctionTimerRef.current = null;
      }

      // 首次 animated 滚动，让用户立即得到反馈
      scrollToZone(true);

      // 测量未到达时轮询，直到拿到准确值再修正；100ms × 50 = 最多等 5s，分区多时布局慢仍能补偿
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
    [
      gameScrollViewRef,
      gameAreaOffsetMap,
      gameZoneOffsetMap,
      tabScrollUpOffset,
      gameAreaBaseOffset,
    ],
  );

  useImperativeHandle(
    ref,
    () => ({
      updateCurrentIndex: (index: any) => {
        setCurrentIndex((prev) => (prev === index ? prev : index));
      },
    }),
    [],
  );

  // 字典 value 可能是字符串，gameList 里 gameZone 可能是数字，必须统一成字符串 key 才能命中翻译后的 label
  const gameZoneLabelMap = useMemo(() => {
    const dict: Record<string, string> = {};
    if (!Array.isArray(gameZoneDict)) return dict;
    gameZoneDict.forEach((zone: any) => {
      const v = zone?.value;
      if (v === undefined || v === null) return;
      dict[String(v)] = zone?.label ?? "";
    });
    return dict;
  }, [gameZoneDict]);

  const handleTabPress = useCallback(
    (index: number, gameZone: string) => {
      setCurrentIndex(index);
      onTabInteraction?.();
      toGameType(String(gameZone));
      tabListRef.current?.scrollToOffset({
        offset: Math.max(0, index * SCROLL_X - SCROLL_X),
        animated: true,
      });
    },
    [onTabInteraction, toGameType],
  );

  // 有 gameList 即可出 Tab；Tab 文案仅在 getGameZoneDict 就绪后显示（字典 + customName 兜底）
  const tabItems = useMemo(() => {
    if (!gameList.length) return [];

    const dictReady = Array.isArray(gameZoneDict) && gameZoneDict.length > 0;

    return gameList.map((item: any, index: number) => {
      const tabLabel = dictReady
        ? gameZoneLabelMap[String(item?.gameZone)] ?? item?.customName ?? ""
        : "";

      return {
        ...item,
        index,
        tabLabel,
        key: item.id || item.gameZone || index,
      };
    });
  }, [gameList, gameZoneDict, gameZoneLabelMap]);

  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: Colors[theme].cardBg1 }],
    [theme],
  );

  const boxStyle = useMemo(
    () => [styles.box1, { backgroundColor: Colors[theme].cardBg1 }],
    [theme],
  );

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

  const renderTabItem = useCallback(
    ({ item }: { item: any }) => {
      return (
        <MemoTabItem
          item={item}
          isActive={currentIndex === item.index}
          onPress={handleTabPress}
          theme={theme}
        />
      );
    },
    [handleTabPress, theme, currentIndex],
  );

  return (
    <View style={containerStyle}>
      <View style={boxStyle}>
        <FlatList
          data={tabItems}
          extraData={currentIndex}
          horizontal
          ref={tabListRef}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item: any, index: number) => String(item?.key ?? index)}
          renderItem={renderTabItem}
          getItemLayout={(_, index) => ({
            length: SCROLL_X,
            offset: SCROLL_X * index,
            index,
          })}
          // Tab 栏 item 少（通常 15-30 个），全量初始渲染避免快速滑动时批次延迟造成的 1-2s 空白
          initialNumToRender={tabItems.length || 30}
          maxToRenderPerBatch={tabItems.length || 30}
          windowSize={21}
          removeClippedSubviews={false}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
    container: {
      marginTop:-1
    },
    box1:{
      height: 56,
      overflow:'hidden'
    },
    box2:{
      height: 56,
      borderRadius:8,
      marginHorizontal:12,
      overflow:'hidden'
    }
  });