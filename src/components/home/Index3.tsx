import {
  View,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  DeviceEventEmitter,
  FlatList,
  InteractionManager,
} from "react-native";
import { RefreshControl as NativeRefreshControl } from "react-native";
import { RefreshControl as WebRefreshControl } from "react-native-web-refresh-control";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getScrollBottomSpacer } from "@/config/layout/scrollBottomSpacer";
import { IndexHeader } from "./IndexHeader";
import { Wins } from "./Wins";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BottomFloatArea from "./BottomFloatArea";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { ToolTab } from "./type2/ToolTab";
import { CarouselBlock } from "./CarouselBlock";
import { BottomArea } from "./BottomArea";
import { GameArea3 } from "./type3/GameArea3";
import { GameArea5 } from "./type5/GameArea5";
import { GameTab, GameTabRef, GAME_TAB3_ITEM_STRIDE_PX } from "./type3/GameTab";
import { GameTab4, GAME_TAB4_ITEM_STRIDE_PX } from "./type4/GameTab4";
import { GameTab5 } from "./type5/GameTab5";
import { changeCurrentTabId, changeTopAreaHeight } from "@/store/game/gameSlice";
import { selectBottomNavigationType } from "@/store/user/selfConfig";
import { ActiveBlock } from "./ActiveBlock";
import { fetPersonalization } from "@/store/user/selfConfig";
import { fetchTenantInfo } from "@/store/tenant/tenantSlice";
import { configAsync, switchesAsync } from "@/store/user/userSlice";
import { activityListAsync } from "@/store/active/activeSlice";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useHomePullToRefresh } from "./components/useHomePullToRefresh";

/** 与 GameTab / GameArea5 一致：未测到高度时用兜底，避免累计高度塌缩导致吸顶 Tab 短时错位 */
const ZONE_ROW1_FALLBACK_H = 240;
const ZONE_ROW2_FALLBACK_H = 446;

type ScrollTargetRef = {
  scrollTo: (options: { x?: number; y?: number; animated?: boolean }) => void;
};
type HomeListItem = "top" | "tab" | "gameArea" | "wins" | "bottom";
type Index3PerfStats = {
  scrollEvents: number;
  zoneChecks: number;
  tabSyncCalls: number;
  tabSyncSkips: number;
  avgZoneCheckMs: number;
  maxZoneCheckMs: number;
  avgTabSyncMs: number;
  maxTabSyncMs: number;
  lastFlushAt: number;
};

export const Index3 = () => {
  const dispatch: AppDispatch = useDispatch();
  const { refreshing, onRefresh } = useHomePullToRefresh();
  const flatListRef = useRef<FlatList<HomeListItem> | null>(null);
  const gameScrollViewRef = useRef<ScrollTargetRef | null>(null);
  const tabScrollViewRef = useRef<ScrollTargetRef | null>(null);
  const indexGame: any = useSelector((state: RootState) => state?.selfConfig?.indexGame);
  const bottomNavType = useSelector(selectBottomNavigationType);
  const gameList: any = useSelector((state: RootState) => state?.game?.gameList, shallowEqual);
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const isLogin = Boolean(userInfo?.isLogin);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const RefreshControlImpl = Platform.OS === "web" ? WebRefreshControl : NativeRefreshControl;
  const prevIsLoginRef = useRef(isLogin);
  const topAreaHeight: any = useSelector((state: RootState) => state?.game?.topAreaHeight);
  const gameAreaHeight: any = useSelector(
    (state: RootState) => state?.game?.gameAreaHeight,
    shallowEqual,
  );
  const gameTabRef = useRef<GameTabRef>(null);
  const lastLinkedIndexRef = useRef(-1);
  const topAreaHeightRef = useRef(-1);
  const tabInteractionLockedRef = useRef(false);
  const tabInteractionUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatScrollingRef = useRef(false);
  const perfEnabled = __DEV__;
  const perfRef = useRef({
    scrollEvents: 0,
    zoneChecks: 0,
    tabSyncCalls: 0,
    tabSyncSkips: 0,
    zoneCheckTotalMs: 0,
    zoneCheckMaxMs: 0,
    tabSyncTotalMs: 0,
    tabSyncMaxMs: 0,
    lastFlushAt: Date.now(),
  });

  // 预计算每个游戏分区的起始 offset，联动时可用二分查找替代逐项遍历
  const { zoneStartOffsets, allGameHeight } = useMemo(() => {
    if (!Array.isArray(gameList) || gameList.length === 0) {
      return { zoneStartOffsets: [] as number[], allGameHeight: 0 };
    }

    const offsets: number[] = [];
    let accumulated = 0;

    gameList.forEach((item: any) => {
      offsets.push(accumulated);
      const zoneKey = item?.gameZone;
      const measured = Number(gameAreaHeight?.[zoneKey] ?? 0);
      const fallback = Number(item?.rows) === 2 ? ZONE_ROW2_FALLBACK_H : ZONE_ROW1_FALLBACK_H;
      const zoneHeight = measured > 0 ? measured : fallback;
      accumulated += zoneHeight;
    });

    return { zoneStartOffsets: offsets, allGameHeight: accumulated };
  }, [gameList, gameAreaHeight]);

  const getIndexByScrollY = useCallback(
    (y: number) => {
      if (zoneStartOffsets.length === 0) return 0;

      let left = 0;
      let right = zoneStartOffsets.length - 1;
      let ans = 0;

      while (left <= right) {
        const mid = (left + right) >> 1;
        if (zoneStartOffsets[mid] <= y) {
          ans = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      return ans;
    },
    [zoneStartOffsets],
  );

  // 检查当前滚动位置属于哪个游戏区 - 优化版本
  const syncTabByIndex = useCallback(
    (index: number, animated: boolean) => {
      if (index < 0 || index >= gameList.length) return;
      const syncStart = perfEnabled ? Date.now() : 0;
      if (index === lastLinkedIndexRef.current) {
        if (perfEnabled) {
          perfRef.current.tabSyncSkips += 1;
        }
        return;
      }
      lastLinkedIndexRef.current = index;
      if (perfEnabled) {
        perfRef.current.tabSyncCalls += 1;
      }
      const currentZone = gameList?.[index]?.gameZone;
      if (currentZone !== undefined && currentZone !== null) {
        dispatch(changeCurrentTabId(Number(currentZone)));
        DeviceEventEmitter.emit("home-type5-zone-change", {
          index,
          gameZone: String(currentZone),
        });
      }

      gameTabRef.current?.updateCurrentIndex(index);

      if (tabScrollViewRef.current) {
        const tabScrollX =
          indexGame === 5
            ? 66
            : indexGame === 4
              ? GAME_TAB4_ITEM_STRIDE_PX
              : GAME_TAB3_ITEM_STRIDE_PX;
        tabScrollViewRef.current.scrollTo({
          x: Math.max(0, index * tabScrollX - tabScrollX),
          animated,
        });
      }
      if (perfEnabled) {
        const elapsed = Date.now() - syncStart;
        perfRef.current.tabSyncTotalMs += elapsed;
        if (elapsed > perfRef.current.tabSyncMaxMs) {
          perfRef.current.tabSyncMaxMs = elapsed;
        }
      }
    },
    [indexGame, perfEnabled, gameList, dispatch],
  );

  const markTabInteraction = useCallback(() => {
    tabInteractionLockedRef.current = true;
    if (tabInteractionUnlockTimerRef.current) {
      clearTimeout(tabInteractionUnlockTimerRef.current);
    }
    // Fallback unlock in case scroll end callbacks don't fire on some devices.
    tabInteractionUnlockTimerRef.current = setTimeout(() => {
      tabInteractionLockedRef.current = false;
      tabInteractionUnlockTimerRef.current = null;
    }, 1500);
  }, []);

  const setScrollActive = useCallback((active: boolean) => {
    if (active) {
      if (!floatScrollingRef.current) {
        floatScrollingRef.current = true;
        DeviceEventEmitter.emit("home-scroll-active", { active: true });
      }
      return;
    }
    if (floatScrollingRef.current) {
      floatScrollingRef.current = false;
      DeviceEventEmitter.emit("home-scroll-active", { active: false });
    }
  }, []);

  const unlockTabInteraction = useCallback(() => {
    tabInteractionLockedRef.current = false;
    if (tabInteractionUnlockTimerRef.current) {
      clearTimeout(tabInteractionUnlockTimerRef.current);
      tabInteractionUnlockTimerRef.current = null;
    }
    setScrollActive(false);
  }, [setScrollActive]);

  const checkCurrentGameZone = useCallback(
    (scrollY: number) => {
      if (tabInteractionLockedRef.current) return;
      // 顶部区域（含吸顶切换临界点）强制归位到第一个，避免出现“滑到最上方但高亮不是第一个”
      if (scrollY <= topAreaHeight + 2) {
        syncTabByIndex(0, false);
        // 兜底：即使当前索引已是 0，也要把横向 tab 滚动条归位到最左
        tabScrollViewRef.current?.scrollTo({ x: 0, animated: false });
        return;
      }
      const zoneCheckStart = perfEnabled ? Date.now() : 0;
      if (!gameList.length || allGameHeight <= 0) return;

      // 减去顶部区域高度并添加偏移量
      const adjustedScrollY = scrollY - topAreaHeight + 20;
      if (allGameHeight <= 0) return;
      const clampedY = Math.max(0, Math.min(adjustedScrollY, allGameHeight - 1));
      const selectIndex = getIndexByScrollY(clampedY);

      // 滚动联动期间不做横向动画，避免动画风暴导致掉帧
      syncTabByIndex(selectIndex, false);
      if (perfEnabled) {
        const elapsed = Date.now() - zoneCheckStart;
        perfRef.current.zoneChecks += 1;
        perfRef.current.zoneCheckTotalMs += elapsed;
        if (elapsed > perfRef.current.zoneCheckMaxMs) {
          perfRef.current.zoneCheckMaxMs = elapsed;
        }
      }
    },
    [gameList, topAreaHeight, allGameHeight, getIndexByScrollY, syncTabByIndex, perfEnabled],
  );

  const rafRef = useRef<number | null>(null);
  const latestScrollYRef = useRef(0);
  const floatEmitRafRef = useRef<number | null>(null);
  const pendingFloatYRef = useRef<number | null>(null);
  const lastZoneCheckYRef = useRef(0);
  const lastZoneCheckTsRef = useRef(0);
  const lastScrollTsRef = useRef(0);
  const scrollEndCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { zoneCheckMinDelta, zoneCheckMinInterval } = useMemo(() => {
    const isAndroid = Platform.OS === "android";
    const manyZones = Array.isArray(gameList) && gameList.length >= 10;
    return {
      zoneCheckMinDelta: manyZones ? 16 : isAndroid ? 12 : 10,
      zoneCheckMinInterval: manyZones ? 48 : isAndroid ? 40 : 32,
    };
  }, [gameList]);
  const listData = useMemo<HomeListItem[]>(() => ["top", "tab", "gameArea", "wins", "bottom"], []);

  const bindFlatListRef = useCallback((ref: FlatList<HomeListItem> | null) => {
    flatListRef.current = ref;
    gameScrollViewRef.current = ref
      ? {
          scrollTo: ({ y = 0, animated = true }) => {
            ref.scrollToOffset({ offset: y, animated });
          },
        }
      : null;
  }, []);

  const runGameZoneCheck = useCallback(() => {
    rafRef.current = null;
    if (gameList.length > 0) {
      checkCurrentGameZone(latestScrollYRef.current);
    }
  }, [gameList, checkCurrentGameZone]);

  const flushFloatY = useCallback(() => {
    floatEmitRafRef.current = null;
    const y = pendingFloatYRef.current;
    if (y == null) return;
    pendingFloatYRef.current = null;
    DeviceEventEmitter.emit("home-float-scroll-y", y);
  }, []);

  // 手指离屏后轮询直到「距上次 onScroll 足够久」或超时，再 setScrollActive(false)（供 Refresh/EntryBar/AppDownBtn 同步回弹）。
  // 单一 setTimeout(180) 在惯性期若 idle<120 会直接收工且不重试，加上 iOS 偶发不发 onMomentumScrollEnd 时，home-scroll-active:false 丢失 → 浮层卡住。
  const scheduleScrollInactive = useCallback(() => {
    if (scrollEndCheckTimerRef.current) {
      clearTimeout(scrollEndCheckTimerRef.current);
    }
    const startAt = Date.now();
    const INACTIVE_MAX_MS = 3000;
    const tick = () => {
      scrollEndCheckTimerRef.current = null;
      const idleFor = Date.now() - lastScrollTsRef.current;
      if (idleFor >= 120) {
        setScrollActive(false);
        return;
      }
      if (Date.now() - startAt >= INACTIVE_MAX_MS) {
        setScrollActive(false);
        return;
      }
      scrollEndCheckTimerRef.current = setTimeout(tick, 100);
    };
    scrollEndCheckTimerRef.current = setTimeout(tick, 180);
  }, [setScrollActive]);

  // 处理滚动事件 - 使用 useCallback 优化
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrollActive(true);
      lastScrollTsRef.current = Date.now();
      // H5/iOS：onScrollEndDrag/onMomentumScrollEnd 偶发不触发，改用“scroll 续命定时器”稳定发 active:false
      if (scrollIdleTimerRef.current) {
        clearTimeout(scrollIdleTimerRef.current);
      }
      scrollIdleTimerRef.current = setTimeout(() => {
        scrollIdleTimerRef.current = null;
        const idleFor = Date.now() - lastScrollTsRef.current;
        if (idleFor >= 120) {
          setScrollActive(false);
        }
      }, 160);

      if (perfEnabled) {
        perfRef.current.scrollEvents += 1;
      }
      const y = event.nativeEvent.contentOffset.y;
      latestScrollYRef.current = y;

      // 合帧：滚动期间最多每帧发一次，避免 JS 线程被 emitter 洪泛拖慢
      pendingFloatYRef.current = y;
      if (floatEmitRafRef.current == null) {
        floatEmitRafRef.current = requestAnimationFrame(flushFloatY);
      }

      if (topAreaHeight === 0) return;

      const now = Date.now();
      const movedEnough = Math.abs(y - lastZoneCheckYRef.current) >= zoneCheckMinDelta;
      const waitedEnough = now - lastZoneCheckTsRef.current >= zoneCheckMinInterval;

      if (movedEnough || waitedEnough) {
        lastZoneCheckYRef.current = y;
        lastZoneCheckTsRef.current = now;
      } else {
        return;
      }

      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(runGameZoneCheck);
      }
    },
    [
      topAreaHeight,
      runGameZoneCheck,
      zoneCheckMinDelta,
      zoneCheckMinInterval,
      perfEnabled,
      flushFloatY,
      setScrollActive,
    ],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (floatEmitRafRef.current != null) {
        cancelAnimationFrame(floatEmitRafRef.current);
        floatEmitRafRef.current = null;
      }
      if (tabInteractionUnlockTimerRef.current) {
        clearTimeout(tabInteractionUnlockTimerRef.current);
      }
      if (scrollEndCheckTimerRef.current) {
        clearTimeout(scrollEndCheckTimerRef.current);
        scrollEndCheckTimerRef.current = null;
      }
      if (scrollIdleTimerRef.current) {
        clearTimeout(scrollIdleTimerRef.current);
        scrollIdleTimerRef.current = null;
      }
      DeviceEventEmitter.emit("home-scroll-active", { active: false });
    };
  }, []);

  useEffect(() => {
    lastLinkedIndexRef.current = -1;
  }, [indexGame, gameList]);

  useEffect(() => {
    topAreaHeightRef.current = topAreaHeight;
  }, [topAreaHeight]);

  // 未登录时滚到吸顶后再登录：gameList/top 高度会变，但 FlatList 仍保留旧 offset，sticky 会短时错位；回到已登录态后归零并同步 Tab
  useEffect(() => {
    const prev = prevIsLoginRef.current;
    prevIsLoginRef.current = isLogin;
    if (!isLogin || prev) return;

    let cancelled = false;
    const alignHomeAfterLogin = () => {
      if (cancelled) return;
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      latestScrollYRef.current = 0;
      lastZoneCheckYRef.current = 0;
      lastZoneCheckTsRef.current = Date.now();
      lastLinkedIndexRef.current = -1;
      DeviceEventEmitter.emit("home-float-reset");
      tabScrollViewRef.current?.scrollTo({ x: 0, animated: false });
      const firstZone = gameList?.[0]?.gameZone;
      if (firstZone !== undefined && firstZone !== null) {
        dispatch(changeCurrentTabId(Number(firstZone)));
      }
      gameTabRef.current?.updateCurrentIndex(0);
      checkCurrentGameZone(0);
    };

    alignHomeAfterLogin();
    const task = InteractionManager.runAfterInteractions(() => {
      if (!cancelled) alignHomeAfterLogin();
    });
    const t = setTimeout(() => {
      if (!cancelled) alignHomeAfterLogin();
    }, 180);
    return () => {
      cancelled = true;
      task.cancel();
      clearTimeout(t);
    };
  }, [isLogin, dispatch, gameList, checkCurrentGameZone]);

  useEffect(() => {
    if (!perfEnabled) return;

    const timer = setInterval(() => {
      const p = perfRef.current;
      const stats: Index3PerfStats = {
        scrollEvents: p.scrollEvents,
        zoneChecks: p.zoneChecks,
        tabSyncCalls: p.tabSyncCalls,
        tabSyncSkips: p.tabSyncSkips,
        avgZoneCheckMs:
          p.zoneChecks > 0 ? Number((p.zoneCheckTotalMs / p.zoneChecks).toFixed(2)) : 0,
        maxZoneCheckMs: p.zoneCheckMaxMs,
        avgTabSyncMs:
          p.tabSyncCalls > 0 ? Number((p.tabSyncTotalMs / p.tabSyncCalls).toFixed(2)) : 0,
        maxTabSyncMs: p.tabSyncMaxMs,
        lastFlushAt: Date.now(),
      };

      (globalThis as any).__NGSS_INDEX3_PERF__ = stats;
      p.lastFlushAt = stats.lastFlushAt;
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [perfEnabled]);

  const renderListItem = useCallback(
    ({ item }: { item: HomeListItem }) => {
      if (item === "top") {
        return (
          <View
            onLayout={(event: any) => {
              const { height } = event.nativeEvent.layout;
              const nextHeight = Math.round(height);
              if (topAreaHeightRef.current !== nextHeight) {
                topAreaHeightRef.current = nextHeight;
                dispatch(changeTopAreaHeight(nextHeight));
              }
            }}
          >
            <CarouselBlock />
            {indexGame == 5 && <ActiveBlock />}
            {(indexGame == 3 || indexGame == 5) && <ToolTab />}
          </View>
        );
      }

      if (item === "tab") {
        return indexGame == 3 ? (
          <GameTab
            ref={gameTabRef}
            data={{
              gameScrollViewRef: gameScrollViewRef,
              tabScrollViewRef: tabScrollViewRef,
              onTabInteraction: markTabInteraction,
            }}
          />
        ) : indexGame == 4 ? (
          <GameTab4
            ref={gameTabRef}
            data={{
              gameScrollViewRef: gameScrollViewRef,
              tabScrollViewRef: tabScrollViewRef,
              onTabInteraction: markTabInteraction,
            }}
          />
        ) : (
          <GameTab5
            ref={gameTabRef}
            data={{
              gameScrollViewRef: gameScrollViewRef,
              tabScrollViewRef: tabScrollViewRef,
              onTabInteraction: markTabInteraction,
            }}
          />
        );
      }

      if (item === "gameArea") {
        return (
          <>
            {(indexGame == 3 || indexGame == 4) && <GameArea3 />}
            {indexGame == 5 && <GameArea5 />}
          </>
        );
      }

      if (item === "wins") {
        return <Wins />;
      }

      return <BottomArea />;
    },
    [dispatch, indexGame, markTabInteraction],
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <IndexHeader />
      <View style={styles.containerBox}>
        <FlatList
          data={listData}
          keyExtractor={(item) => item}
          renderItem={renderListItem}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          className="hide-scrollbar"
          ref={bindFlatListRef}
          stickyHeaderIndices={[1]}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControlImpl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors[theme].primary]}
              tintColor={Colors[theme].primary}
              title={t("common.loading")}
              titleColor={Colors[theme].text}
            />
          }
          onScroll={handleScroll}
          onScrollBeginDrag={() => {
            lastScrollTsRef.current = Date.now();
            setScrollActive(true);
          }}
          onScrollEndDrag={() => {
            scheduleScrollInactive();
          }}
          onMomentumScrollEnd={unlockTabInteraction}
          // iOS JS 线程压力大时适当降频，配合 handleScroll 内部 rAF + 轻量节流不影响功能
          scrollEventThrottle={Platform.OS === "android" ? 64 : 48}
          // sticky 与 clip 子树组合易导致吸顶行短时错位，首页外层仅 5 行，关闭可接受
          removeClippedSubviews={false}
          ListFooterComponent={() => (
            <View
              style={{
                height: getScrollBottomSpacer(bottomNavType) as any,
              }}
            />
          )}
        />
      </View>
      <BottomFloatArea scrollViewRef={gameScrollViewRef} />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: "relative",
  },
  containerBox: {
    flex: 1,
    position: "relative",
  },
  contentContainer: {},
});
