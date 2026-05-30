import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ImageBackground,
  DeviceEventEmitter,
  Platform,
} from "react-native";
import { FlatList, Gesture, GestureDetector } from "react-native-gesture-handler";
import { Image as ExpoImage } from "expo-image";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { forwardRef, memo, useImperativeHandle, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { GameTypeIcon3 } from "../type3/GameTypeIcon";
import { fontTextSize } from "../utils/const";
import { Skeleton } from "@/components/home/components/Skeleton";


const TAB_WIDTH = 58;
const TAB_HEIGHT = 72;
const TAB_MARGIN_RIGHT = 8;
const SCROLL_X = TAB_WIDTH + TAB_MARGIN_RIGHT;
const ROW1_FALLBACK_HEIGHT = 240;
const ROW2_FALLBACK_HEIGHT = 446;
const TAB_SCROLL_UP_OFFSET_FALLBACK = -332;

// 组件外定义：避免 tabData 先空后有时多跑 hook 触发 “Rendered more hooks”
const horizontalPan = Gesture.Simultaneous(
  Gesture.Native(),
  Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-12, 12])
);

export type GameTabRef = {
  updateCurrentIndex: (index: any) => void;
};

/** 网络图标加载失败时显示默认 GameTypeIcon3 */
const TabZoneIcon5 = memo(function TabZoneIcon5({
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
  onPress,
  tabBgSource,
  tabTextColor,
  isListenedItem,
}: {
  item: any;
  onPress: (index: number, gameZone: string) => void;
  tabBgSource: any;
  tabTextColor: string;
  isListenedItem: boolean;
}) => {
  return (
    <Pressable
      key={item.gameZone ?? item._tabIndex}
      onPress={() => onPress(item._tabIndex, item.gameZone)}
      style={styles.tabWrapper}
    >
      <ImageBackground
        source={tabBgSource}
        style={[
          styles.tabCard,
          { opacity: isListenedItem ? 0.6 : 1 },
        ]}
        resizeMode="stretch"
      >
        <View style={styles.tabIcon}>
          <TabZoneIcon5 gameZone={item.gameZone} iconUri={item.icon} />
        </View>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.tabText,
            {
              color: tabTextColor,
              paddingTop: 8,
              fontSize: fontTextSize,
              lineHeight: fontTextSize,
            },
          ]}
        >
          {item._customName}
        </Text>
      </ImageBackground>
    </Pressable>
  );
};
const MemoTabItem = memo(
  TabItem,
  (prev, next) =>
    prev.item === next.item &&
    prev.tabBgSource === next.tabBgSource &&
    prev.tabTextColor === next.tabTextColor &&
    prev.isListenedItem === next.isListenedItem
);

export const GameTab5 = forwardRef(({ data }: any, ref: any) => {
  const { theme } = useTheme();
  const { gameScrollViewRef, tabScrollViewRef } = data;
  const gameList: any = useSelector((state: RootState) => state?.game?.gameList);
  const gameZoneDict: any = useSelector((state: RootState) => state?.game?.gameZoneDict);
  const topAreaHeight: any = useSelector((state: RootState) => state?.game?.topAreaHeight);
  const gameAreaHeight: any = useSelector((state: RootState) => state?.game?.gameAreaHeight);
  const gameAreaOffsetMap: any = useSelector((state: RootState) => state?.game?.gameAreaOffsetMap);
  const gameAreaBaseOffset: any = useSelector((state: RootState) => state?.game?.gameAreaBaseOffset);

  const tabBgSourceMap: any = {
    greenBlack: require("@/assets/images/home/game/gameTabBg-blackGreen.png"),
    blueWhite: require("@/assets/images/home/game/gameTabBg-blueWhite.png"),
    orangeWhite: require("@/assets/images/home/game/gameTabBg-orangeWhite.png"),
  };
  const tabBgSource = tabBgSourceMap[theme];

  const tabTextColor = Colors[theme].gameListTabTextColor ?? Colors[theme].text;
  const tabListRef = useRef<FlatList<any> | null>(null);
  const [listenedIndex, setListenedIndex] = useState(0);
  const listenedIndexRef = useRef(0);
  const latestZoneOffsetMapRef = useRef<Record<string, number>>({});
  const latestTopAreaHeightRef = useRef(Number(topAreaHeight || 0));
  const latestGameAreaOffsetMapRef = useRef<Record<string, number>>(
    (gameAreaOffsetMap ?? {}) as Record<string, number>
  );
  const latestGameAreaBaseOffsetRef = useRef<number>(Number(gameAreaBaseOffset || 0));
  const correctionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activityList = useSelector((state: RootState) => state?.active?.activityList);
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  // 用 useMemo 避免模块变量 + useEffect 赋值延迟导致点击时取到旧值（与 GameTab/GameTab4 保持一致）
  const tabScrollUpOffset = useMemo(() => {
    const h = Number(topAreaHeight || 0);
    return h > 0 ? -h : TAB_SCROLL_UP_OFFSET_FALLBACK;
  }, [topAreaHeight]);

  const gameZoneLabelMap = useMemo(() => {
    const dict: Record<string, string> = {};
    if (Array.isArray(gameZoneDict)) {
      gameZoneDict.forEach((item: any) => {
        const key = String(item?.value ?? "");
        if (key) {
          dict[key] = item?.label ?? "";
        }
      });
    }
    return dict;
  }, [gameZoneDict]);



  const gameZoneOffsetMap = useMemo(() => {
    const map: Record<string, number> = {};
    // offset 从 0 开始（代表相对 GameArea 容器的偏移量）。
    // tabScrollUpOffset（=-topAreaHeight）在 scrollTo 时补回 topAreaHeight，
    // 若此处从 topAreaHeight 开始则双重叠加，导致所有分区定位偏高一整个 carousel 高度。
    let offset = 0;
    const baseOffset = Math.max(0, Number(gameAreaBaseOffset || 0));

    if (Array.isArray(gameList)) {
      gameList.forEach((item: any) => {
        const zoneKey = String(item?.gameZone ?? "");
        if (!zoneKey) return;
        // 注意：收藏/最近等插入会改变前面分区高度，导致后续分区“位置变了但自身高度没变”，
        // 某些机型上后续分区 onLayout 不一定回调，进而 gameAreaOffsetMap 里的 y 可能是旧值。
        // 这里优先保证 offset 单调递增：只有 measuredOffset 合理时才采用，否则按累计高度推导。
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
          latestGameAreaOffsetMapRef.current[key] ??
          (gameAreaOffsetMap?.[key] as any)
        );
        return Number.isFinite(measured) && measured >= 0;
      };
      
      const scrollToZone = (animated: boolean) => {
        const measuredOffset = Number(
          latestGameAreaOffsetMapRef.current[key] ??
          (gameAreaOffsetMap?.[key] as any)
        );
        const baseOffset =
          Number.isFinite(latestGameAreaBaseOffsetRef.current) &&
            latestGameAreaBaseOffsetRef.current > 0
            ? latestGameAreaBaseOffsetRef.current
            : Math.max(0, Number(gameAreaBaseOffset || 0));

        // 优先使用测量值（返回页面后更稳定）；没有测量值再回退到兜底 map
        // iOS 上有时点击发生在 ref 尚未同步最新 map 的同一帧，需同时兜底用闭包内的 gameZoneOffsetMap。
        const fallbackOffset =
          latestZoneOffsetMapRef.current[key] ?? gameZoneOffsetMap[key];
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
    [gameScrollViewRef, gameAreaOffsetMap, gameZoneOffsetMap, tabScrollUpOffset, gameAreaBaseOffset]
  );

  useImperativeHandle(ref, () => ({
    updateCurrentIndex: (_index: any) => { },
  }));

  const onTabPress = useCallback(
    (index: number, gameZone: string) => {
      toGameType(gameZone);
    },
    [toGameType]
  );

  const tabData = useMemo(() => {
    if (!gameList.length) return [];

    const dictReady = Array.isArray(gameZoneDict) && gameZoneDict.length > 0;

    return gameList.map((item: any, index: number) => ({
      ...item,
      _tabIndex: index,
      _customName: dictReady
        ? gameZoneLabelMap[String(item?.gameZone)] ?? item?.customName ?? ""
        : "",
    }));
  }, [gameList, gameZoneDict, gameZoneLabelMap]);



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

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      "home-type5-zone-change",
      (payload: { index?: number; gameZone?: string }) => {
        const nextIndex = Number(payload?.index ?? -1);
        if (!Number.isFinite(nextIndex) || nextIndex < 0) return;
        listenedIndexRef.current = nextIndex;
        setListenedIndex((prev) => (prev === nextIndex ? prev : nextIndex));
      }
    );
    return () => {
      sub.remove();
    };
  }, []);

  // listenedIndex 通过 extraData 通知 FlatList 刷新，renderTabItem 不依赖它避免频繁新建函数引用
  const renderTabItem = useCallback(
    ({ item }: { item: any }) => {
      const itemIndex = Number(item?._tabIndex ?? 0);
      return (
        <MemoTabItem
          item={item}
          onPress={onTabPress}
          tabBgSource={tabBgSource}
          tabTextColor={tabTextColor}
          isListenedItem={itemIndex === listenedIndexRef.current}
        />
      );
    },
    [onTabPress, tabBgSource, tabTextColor]
  );

  if (!tabData.length) {
    return null;
  }

  const tabBarBox = (
    <View
      style={[
        styles.boxDefault,
        { backgroundColor: Colors[theme].background },
      ]}
    >
      {tabData.length > 0 ? <FlatList
        data={tabData}
        horizontal
        ref={tabListRef}
        extraData={listenedIndex}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        className="hide-scrollbar"
        contentContainerStyle={styles.scrollContent}
        keyExtractor={(item: any, index: number) =>
          String(item?.gameZone ?? item?.id ?? index)
        }
        renderItem={renderTabItem}
        getItemLayout={(_, index) => ({
          length: SCROLL_X,
          offset: SCROLL_X * index,
          index,
        })}
        initialNumToRender={tabData.length || 30}
        maxToRenderPerBatch={tabData.length || 30}
        windowSize={21}
        removeClippedSubviews={false}
      />:<View className="flex-row" style={{ width: '100%', height: TAB_HEIGHT }}>
        {Array.from({ length: 6 }).map((_, index: number) => (
          <View key={index} className="mr-2" style={{ width: TAB_WIDTH, height: TAB_HEIGHT }}>
            <Skeleton width={TAB_WIDTH} height={TAB_HEIGHT} />
          </View>
        ))}
      </View>}
    </View> 
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      {Platform.OS === "android" ? (
        <GestureDetector gesture={horizontalPan}>{tabBarBox}</GestureDetector>
      ) : (
        tabBarBox
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: -1,
    marginBottom: 10,
    width: '100%',
    height: TAB_HEIGHT,
  },
  boxDefault: {
    height: TAB_HEIGHT,
    borderRadius: 0,
    paddingHorizontal: 10,
    overflow: "hidden",
  },
  scrollContent: {
    paddingRight: 8,
  },
  tabWrapper: {
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
    marginRight: TAB_MARGIN_RIGHT,
  },
  tabCard: {
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 18,
  },
  tabIcon: {
    height: 20,
    marginBottom: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 10,
    fontWeight: "500",
    paddingHorizontal: 4,
    maxWidth: "100%",
  },
});