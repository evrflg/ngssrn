import { DeviceEventEmitter, Dimensions, InteractionManager, Platform, useWindowDimensions, View, StyleSheet, Text } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image as ExpoImage } from 'expo-image';
import { getGameListServer, getGameZoneDictServer } from "@/api";
import { useFocusEffect } from "expo-router";
import { getStoreJson } from "@/utils/storage";
import { useTranslation } from "react-i18next";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import {
  changeGameAreaBaseOffset,
  changeGameAreaHeight,
  changeGameAreaOffsetMap,
  changeGameList,
  changeGameZoneDict,
} from "@/store/game/gameSlice";
import { GameBlock3, seedGameBlock3LayoutHeights } from "./GameBlock3";
import { usePriorityPartner } from "@/hooks/usePriorityPartner";
import { screen } from "@/utils/screen";
import { Skeleton } from "@/components/home/components/Skeleton";
import { MAX_WIDTH } from "@/hooks/useMaxWidth";
import {
  BLOCK3_IS_PC_WEB as isPCWeb,
  estimateBlock3ZoneH,
} from "./layout";
import { ZoneSkeleton3 } from "./ZoneSkeleton3";

/** 提取一个 zone 内所有游戏图片 URL（用于预取） */
function getZone3ImageUrls(zone: any): string[] {
  const urls: string[] = [];
  if (Number(zone?.rows) === 2) {
    (zone?.gameList2 ?? []).forEach((row: any) => {
      (row ?? []).forEach((item: any) => { if (item?.icon) urls.push(item.icon); });
    });
  } else {
    (zone?.gameList ?? []).forEach((item: any) => { if (item?.icon) urls.push(item.icon); });
  }
  return urls;
}

export const GameArea3 = () => {
  const { width } = useWindowDimensions();
  const contentWidth = isPCWeb ? Math.min(width, MAX_WIDTH) : width;
  const skeletonWidth = contentWidth / 3 - 14;
  const gameSkeletonHeight = isPCWeb ? 190 : 160;
  const [gameList, setGameList] = useState<any[]>([]);
  const [gameZoneDict, setGameZoneDict] = useState<any[]>([]);
  const [gameListLoaded, setGameListLoaded] = useState(false);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const partnerZones = usePriorityPartner();
  const baseGameListRef = useRef<any[]>([]);
  const partnerZonesRef = useRef(partnerZones);
  const allZones = useMemo(() => [...gameList, ...partnerZones], [gameList, partnerZones]);
  const gameAreaHeight: any = useSelector((state: RootState) => state?.game?.gameAreaHeight);
  const cfg_global_switch: any = useSelector((state: RootState) => state?.user?.cfg_global_switch);
  const showGameName = Boolean(cfg_global_switch?.tenantGameConfig?.showGameName);
  const focusAliveRef = useRef(false);
  const lastZoneSignatureRef = useRef<string>("");
  const loadedZonesRef = useRef<Set<string>>(new Set());
  const prefetchedZonesRef = useRef<Set<string>>(new Set());
  const [loadedVersion, setLoadedVersion] = useState(0);
  const allZonesRef = useRef<any[]>([]);
  // Tab 点击跳转期间抑制滚动懒加载，防止动画途经分区被全量标记
  const tabJumpActiveRef = useRef(false);
  const tabJumpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showGameNameRef = useRef(showGameName);
  const rootRef = useRef<View | null>(null);
  const zoneWrapperRefMap = useRef<Record<string, View | null>>({});
  const gameAreaOffsetRef = useRef<Record<string, number>>({});
  const gameAreaHeightRef = useRef<Record<string, number>>({});
  const gameAreaBaseOffsetRef = useRef(0);
  const measureBootstrapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAreaLayout = useCallback(
    (gameZone: string | number, layoutY: number | undefined, height: number) => {
      const zoneKey = String(gameZone ?? "");
      if (!zoneKey) return;
      if (layoutY !== undefined && layoutY !== null && Number.isFinite(Number(layoutY))) {
        const nextOffset = Math.max(0, Math.round(Number(layoutY)));
        if (gameAreaOffsetRef.current[zoneKey] !== nextOffset) {
          const nextMap = { ...gameAreaOffsetRef.current, [zoneKey]: nextOffset };
          gameAreaOffsetRef.current = nextMap;
          dispatch(changeGameAreaOffsetMap(nextMap));
        }
      }
      const nextHeight = Math.max(0, Math.round(Number(height || 0)));
      if (gameAreaHeightRef.current[zoneKey] !== nextHeight) {
        const nextMap = { ...gameAreaHeightRef.current, [zoneKey]: nextHeight };
        gameAreaHeightRef.current = nextMap;
        dispatch(changeGameAreaHeight(nextMap));
      }
    },
    [dispatch],
  );

  const measureAllZones = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const zoneKeys = Object.keys(zoneWrapperRefMap.current);
    if (!zoneKeys.length) return;

    zoneKeys.forEach((zoneKey) => {
      const node = zoneWrapperRefMap.current[zoneKey];
      if (!node?.measureLayout) return;
      node.measureLayout(
        root,
        (_x: number, y: number, _w: number, h: number) => {
          if (!focusAliveRef.current) return;
          handleAreaLayout(zoneKey, y, h);
        },
        () => {},
      );
    });
  }, [handleAreaLayout]);

  useEffect(() => {
    if (!focusAliveRef.current) return;
    if (!Array.isArray(gameList) || gameList.length === 0) return;
    if (Object.keys(gameAreaOffsetRef.current || {}).length >= gameList.length) return;

    if (measureBootstrapTimerRef.current) {
      clearTimeout(measureBootstrapTimerRef.current);
    }
    measureBootstrapTimerRef.current = setTimeout(() => {
      if (!focusAliveRef.current) return;
      requestAnimationFrame(() => {
        measureAllZones();
      });
      measureBootstrapTimerRef.current = null;
    }, 80);

    return () => {
      if (measureBootstrapTimerRef.current) {
        clearTimeout(measureBootstrapTimerRef.current);
        measureBootstrapTimerRef.current = null;
      }
    };
  }, [gameList, measureAllZones]);

  // 每次新分区由占位切换为真实内容后，重新全量测量一次所有分区偏移量。
  // 原因：占位高度估算（estimateBlock3ZoneH）与真实渲染高度存在 ±6-8px 误差，
  // 导致相邻分区 y 发生位移；React Native 只在 View 的「尺寸」变化时可靠触发 onLayout，
  // 纯 y 位移（兄弟节点高度变化引起）并不总是触发，造成 gameAreaOffsetMap 累计偏差。
  // debounce 200ms 防止批量加载时重复测量。
  const remeasureAfterLoadRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loadedVersion) return;
    if (remeasureAfterLoadRef.current) clearTimeout(remeasureAfterLoadRef.current);
    remeasureAfterLoadRef.current = setTimeout(() => {
      remeasureAfterLoadRef.current = null;
      if (!focusAliveRef.current) return;
      requestAnimationFrame(() => {
        measureAllZones();
      });
    }, 200);
    return () => {
      if (remeasureAfterLoadRef.current) {
        clearTimeout(remeasureAfterLoadRef.current);
        remeasureAfterLoadRef.current = null;
      }
    };
  }, [loadedVersion, measureAllZones]);

  useEffect(() => {
    showGameNameRef.current = showGameName;
  }, [showGameName]);

  /** 将 zones 数据同步到 ref，并按高度预估标记初始可见分区为已加载 */
  const markInitialZones = useCallback((zones: any[]) => {
    const SCREEN_H = Dimensions.get("window").height;
    const INITIAL_H = SCREEN_H * 1;
    // 预取范围扩展到初始屏的 3 倍，提前把图片放入原生缓存
    const PREFETCH_H = SCREEN_H * 3;
    let cumY = 0;
    let newAdded = false;
    for (const zone of zones) {
      if (cumY > PREFETCH_H) break;
      const key = String(zone?.gameZone ?? "");
      if (key) {
        // 预取：超出初始屏但在预取范围内的 zone，只下载图片，不设 shouldLoad
        if (!prefetchedZonesRef.current.has(key)) {
          prefetchedZonesRef.current.add(key);
          const urls = getZone3ImageUrls(zone);
          if (urls.length > 0) ExpoImage.prefetch(urls).catch(() => {});
        }
        // 渲染：在初始屏范围内的 zone，设置 shouldLoad=true
        if (cumY <= INITIAL_H && !loadedZonesRef.current.has(key)) {
          loadedZonesRef.current.add(key);
          newAdded = true;
        }
      }
      cumY += estimateBlock3ZoneH(zone, showGameNameRef.current, isPCWeb);
    }
    if (newAdded) setLoadedVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    allZonesRef.current = allZones;
    if (!allZones.length) return;
    markInitialZones(allZones);
  }, [allZones, markInitialZones]);

  useEffect(() => {
    const SCREEN_H = Dimensions.get("window").height;
    // 窗口式加载（非累积式）：scrollY 经过某位置时，只加载视口附近的分区。
    // 关键：与 tabJumpActiveRef 配合。Tab 动画期间抑制此监听，
    // 动画结束后恢复时 scrollY 已在目标位置，窗口条件确保只加载目标附近，而非全部途经分区。
    const LOAD_AHEAD = SCREEN_H * 1.5;
    const LOAD_BACK = SCREEN_H * 0.5;
    const PREFETCH_AHEAD = SCREEN_H * 3; // 提前 3 屏预取图片进入原生缓存
    const sub = DeviceEventEmitter.addListener("home-float-scroll-y", (scrollY: number) => {
      if (tabJumpActiveRef.current) return; // Tab 跳转动画期间抑制
      const zones = allZonesRef.current;
      if (!zones.length) return;
      let newAdded = false;
      let cumY = gameAreaBaseOffsetRef.current;
      for (const zone of zones) {
        const key = String(zone?.gameZone ?? "");
        if (!key) { cumY += estimateBlock3ZoneH(zone, showGameNameRef.current, isPCWeb); continue; }
        const measured = gameAreaOffsetRef.current[key];
        const zoneY = (Number.isFinite(measured) && measured >= 0)
          ? gameAreaBaseOffsetRef.current + measured
          : cumY;
        const zoneH = gameAreaHeightRef.current[key] ?? estimateBlock3ZoneH(zone, showGameNameRef.current, isPCWeb);
        cumY = (Number.isFinite(measured) && measured >= 0)
          ? gameAreaBaseOffsetRef.current + measured + zoneH
          : cumY + zoneH;
        // 预取窗口：在渲染范围外但在 3 屏以内，提前下载图片
        if (!prefetchedZonesRef.current.has(key) &&
            !loadedZonesRef.current.has(key) &&
            zoneY + zoneH >= scrollY - LOAD_BACK &&
            zoneY <= scrollY + PREFETCH_AHEAD) {
          prefetchedZonesRef.current.add(key);
          const urls = getZone3ImageUrls(zone);
          if (urls.length > 0) ExpoImage.prefetch(urls).catch(() => {});
        }
        // 渲染窗口：分区在视口 [scrollY-BACK, scrollY+AHEAD] 范围内才加载
        if (!loadedZonesRef.current.has(key) &&
            zoneY + zoneH >= scrollY - LOAD_BACK &&
            zoneY <= scrollY + LOAD_AHEAD) {
          loadedZonesRef.current.add(key);
          newAdded = true;
        }
      }
      if (newAdded) setLoadedVersion((v) => v + 1);
    });
    return () => sub.remove();
  }, []);

  // Tab 点击时提前加载目标分区，同时抑制动画途经分区的懒加载
  useEffect(() => {
    const SCREEN_H = Dimensions.get("window").height;
    const AHEAD = SCREEN_H * 1.5;
    const BACK = SCREEN_H * 0.5;
    const PREFETCH_AHEAD = SCREEN_H * 3;
    const sub = DeviceEventEmitter.addListener("home-tab-jump-target-y", (targetScrollY: number) => {
      const zones = allZonesRef.current;
      if (!zones.length) return;
      // 立即加载目标视口附近的分区，使图片在动画播放期间开始下载，到达时已有内容
      let newAdded = false;
      let cumY = gameAreaBaseOffsetRef.current;
      for (const zone of zones) {
        const key = String(zone?.gameZone ?? "");
        if (!key) { cumY += estimateBlock3ZoneH(zone, showGameNameRef.current, isPCWeb); continue; }
        const measured = gameAreaOffsetRef.current[key];
        const zoneY = (Number.isFinite(measured) && measured >= 0)
          ? gameAreaBaseOffsetRef.current + measured
          : cumY;
        const zoneH = gameAreaHeightRef.current[key] ?? estimateBlock3ZoneH(zone, showGameNameRef.current, isPCWeb);
        cumY = (Number.isFinite(measured) && measured >= 0)
          ? gameAreaBaseOffsetRef.current + measured + zoneH
          : cumY + zoneH;
        // 预取：目标附近 3 屏范围的图片
        if (!prefetchedZonesRef.current.has(key) &&
            !loadedZonesRef.current.has(key) &&
            zoneY + zoneH >= targetScrollY - BACK &&
            zoneY <= targetScrollY + PREFETCH_AHEAD) {
          prefetchedZonesRef.current.add(key);
          const urls = getZone3ImageUrls(zone);
          if (urls.length > 0) ExpoImage.prefetch(urls).catch(() => {});
        }
        // 渲染：目标视口附近
        if (!loadedZonesRef.current.has(key) &&
            zoneY + zoneH >= targetScrollY - BACK &&
            zoneY <= targetScrollY + AHEAD) {
          loadedZonesRef.current.add(key);
          newAdded = true;
        }
      }
      if (newAdded) setLoadedVersion((v) => v + 1);
      // 开启抑制：阻止动画途经分区被 home-float-scroll-y 逐帧标记（2.5s 覆盖最长动画时长）
      if (tabJumpTimerRef.current) clearTimeout(tabJumpTimerRef.current);
      tabJumpActiveRef.current = true;
      tabJumpTimerRef.current = setTimeout(() => {
        tabJumpActiveRef.current = false;
        tabJumpTimerRef.current = null;
      }, 2500);
    });
    return () => {
      sub.remove();
      if (tabJumpTimerRef.current) {
        clearTimeout(tabJumpTimerRef.current);
        tabJumpTimerRef.current = null;
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      focusAliveRef.current = true;
      if (i18n.language) {
        getGameZoneDict();
        getGameList();
      }
      return () => {
        focusAliveRef.current = false;
      };
    }, [i18n.language]),
  );

  const getGameZoneDict = () => {
    getGameZoneDictServer({ type: "game_zone" })
      .then((res: any) => {
        if (!focusAliveRef.current) return;
        if (res?.data?.data) {
          let current = {
            id: "98",
            label: t("home.recent"),
            value: "98",
            sort: 98,
            dictType: "game_zone",
          };
          let collect = {
            id: "99",
            label: t("home.collect"),
            value: "99",
            sort: 99,
            dictType: "game_zone",
          };
          setGameZoneDict([...res.data.data, ...[current], ...[collect]]);
          dispatch(changeGameZoneDict([...res.data.data, ...[current], ...[collect]]));
        }
      })
      .catch(() => {});
  };

  const getGameList = () => {
    setGameListLoaded(false);
    getGameListServer({ size: 12 })
      .then((res: any) => {
        if (!focusAliveRef.current) return;
        let list: any[] = [];
        if (res?.data?.data?.length > 0) {
          list = sortList(res.data.data.filter((item: any) => item?.gameList?.length > 0));
        }
        initFavoriteGames(list);
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        if (!focusAliveRef.current) return;
        setGameListLoaded(true);
      });
  };

  const sortList = (list: any[]) => {
    const copy = [...list].sort((a: any, b: any) => {
      return a.sort - b.sort;
    });
    // 根据 tab.type 排序，type 数值越小，排序越靠前
    return copy;
  };
  // 格式化游戏列表，处理收藏夹
  const formatGameArr = (gameArr: any, favoriteGameArr: any, currenGameArr: any) => {
    //处理最近游戏
    if (currenGameArr.length > 0) {
      let isSave = gameArr.some((game: any) => game.gameZone === 98);
      if (isSave) {
        gameArr = gameArr.map((game: any) => {
          if (game.gameZone === 98) {
            return { ...game, gameList: [...currenGameArr] };
          }
          return game;
        });
      } else {
        let recentGames = {
          id: "98",
          gameZone: 98,
          customName: t("home.recent"),
          gameList: [...currenGameArr],
          sort: 98,
        };
        gameArr = [...gameArr, ...[recentGames]];
      }
    }

    //处理收藏夹
    if (favoriteGameArr.length > 0) {
      let isSave = gameArr.some((game: any) => game.gameZone === 99);
      if (isSave) {
        gameArr = gameArr.map((game: any) => {
          if (game.gameZone === 99) {
            return { ...game, gameList: [...favoriteGameArr] };
          }
          return game;
        });
      } else {
        let savedGames = {
          id: "99",
          gameZone: 99,
          customName: t("home.collect"),
          gameList: [...favoriteGameArr],
          sort: 99,
        };
        gameArr = [...gameArr, ...[savedGames]];
      }
    } else {
      gameArr = gameArr.filter((game: any) => {
        return game.gameZone !== 99;
      });
    }

    gameArr = gameArr.map((e: any) => {
      e.gameList = sortList(e?.gameList);
      if (e.gameList.length > 4) {
        const rowsize = e.gameList.length < 8 ? 4 : Math.ceil(e.gameList.length / 2);
        const row1 = e.gameList.slice(0, rowsize);
        const row2 = e.gameList.slice(rowsize);
        let newrow = [];
        for (let i = 0; i < row1.length; i++) {
          let arr = [];
          if (row1[i]) {
            arr.push(row1[i]);
          }
          if (row2[i]) {
            arr.push(row2[i]);
          }
          newrow.push(arr);
        }

        return { ...e, rows: 2, gameList2: newrow };
      } else {
        return { ...e, rows: 1 };
      }
    });

    if (favoriteGameArr?.length > 0) {
      gameArr = gameArr.map((e: any) => {
        if (e?.rows == 1) {
          let list = e?.gameList.map((k: any) => {
            let isSave = false;
            favoriteGameArr.forEach((item: any) => {
              if (k?.name == item?.name) {
                isSave = true;
              }
            });
            return { ...k, isSave };
          });
          return { ...e, gameList: list };
        } else if (e?.rows == 2) {
          let list = e?.gameList2.map((row: any) => {
            return row.map((k: any) => {
              let isSave = false;
              favoriteGameArr.forEach((item: any) => {
                if (k?.name == item?.name) {
                  isSave = true;
                }
              });
              return { ...k, isSave };
            });
          });
          return { ...e, gameList2: list };
        }
        return e;
      });
    } else {
      gameArr = gameArr.map((e: any) => {
        if (e?.rows == 1) {
          let list = e?.gameList.map((k: any) => {
            return { ...k, isSave: false };
          });
          return { ...e, gameList: list };
        } else if (e?.rows == 2) {
          let list = e?.gameList2.map((row: any) => {
            return row.map((k: any) => {
              return { ...k, isSave: false };
            });
          });
          return { ...e, gameList2: list };
        }
        return e;
      });
    }
    return gameArr;
  };

  const initFavoriteGames = async (gameArr: any) => {
    let favoriteGameArr = (await getStoreJson("favoriteGames")) || [];
    if (!focusAliveRef.current) return;
    let currenGameArr = (await getStoreJson("currenGameArr")) || [];
    if (!focusAliveRef.current) return;
    gameArr = formatGameArr(gameArr, favoriteGameArr, currenGameArr);
    if (!focusAliveRef.current) return;
    const nextSignature = JSON.stringify(
      (gameArr || []).map((g: any) => ({
        z: String(g?.gameZone ?? ""),
        r: Number(g?.rows ?? 1),
      })),
    );
    const shouldResetMeasures = lastZoneSignatureRef.current !== nextSignature;
    if (shouldResetMeasures) {
      lastZoneSignatureRef.current = nextSignature;
      gameAreaOffsetRef.current = {};
      dispatch(changeGameAreaOffsetMap({}));
      const provisional: Record<string, number> = {};
      (gameArr || []).forEach((g: any) => {
        if (g?.gameZone === undefined || g?.gameZone === null) return;
        const key = String(g.gameZone);
        const existing = Number(gameAreaHeight?.[key] ?? 0);
        const fallback = estimateBlock3ZoneH(g, showGameName, isPCWeb);
        provisional[key] = existing > 0 ? existing : fallback;
      });
      // 只为"当前分区集合"补齐高度；保留旧测量值，避免结构变化时全量回退兜底造成累计误差
      const nextHeights = { ...(gameAreaHeight ?? {}), ...provisional };
      gameAreaHeightRef.current = { ...provisional };
      seedGameBlock3LayoutHeights(nextHeights);
      dispatch(changeGameAreaHeight(nextHeights));
    }
    baseGameListRef.current = gameArr;
    setGameList([...gameArr]);
    dispatch(changeGameList([...gameArr, ...partnerZonesRef.current]));

    if (shouldResetMeasures) {
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          measureAllZones();
        });
      });
    }
  };

  // partnerZones 异步到达时，同步 ref 并补发合并后的 gameList 到 Redux（供 GameTab / Index3 感知）
  useEffect(() => {
    partnerZonesRef.current = partnerZones;
    if (partnerZones.length > 0 && baseGameListRef.current.length > 0) {
      dispatch(changeGameList([...baseGameListRef.current, ...partnerZones]));
      // 为尚未测量的 partner 分区补充预估高度，避免 Tab 使用硬编码 fallback 造成累计定位误差
      const extra: Record<string, number> = {};
      partnerZones.forEach((zone) => {
        const key = String(zone.gameZone ?? "");
        if (!key || (gameAreaHeightRef.current[key] ?? 0) > 0) return;
        extra[key] = estimateBlock3ZoneH(zone, showGameName, isPCWeb);
      });
      if (Object.keys(extra).length > 0) {
        const next = { ...gameAreaHeightRef.current, ...extra };
        gameAreaHeightRef.current = next;
        dispatch(changeGameAreaHeight(next));
      }
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          if (focusAliveRef.current) measureAllZones();
        });
      });
    }
  }, [partnerZones, dispatch, measureAllZones, showGameName]);

  const refreshData = () => {
    const list = [...gameList];
    initFavoriteGames(list);
  };

  const skeletonList = useMemo(() => {
    return Array.from({ length: 5 }).map((_, index: number) => (
      <View key={index} style={styles.gameItem}>
        <Skeleton width={skeletonWidth} height={gameSkeletonHeight} />
        <Skeleton width={skeletonWidth} height={gameSkeletonHeight} />
        <Skeleton width={skeletonWidth} height={gameSkeletonHeight} />
      </View>
    ));
  }, [gameSkeletonHeight, skeletonWidth]);

  return (
    <View
      ref={rootRef}
      collapsable={false}
      onLayout={(event: any) => {
        const nextBaseOffset = Math.max(
          0,
          Math.round(Number(event?.nativeEvent?.layout?.y ?? 0)),
        );
        if (gameAreaBaseOffsetRef.current !== nextBaseOffset) {
          gameAreaBaseOffsetRef.current = nextBaseOffset;
          dispatch(changeGameAreaBaseOffset(nextBaseOffset));
        }
      }}
    >
      {allZones.length > 0 ? (
        allZones.map((gameItem: any) => {
          const zoneKey = String(gameItem?.gameZone ?? "");
          const isLoaded = loadedZonesRef.current.has(zoneKey);
          const placeholderH = gameAreaHeightRef.current[zoneKey] ?? estimateBlock3ZoneH(gameItem, showGameName, isPCWeb);
          return (
            <View
              key={zoneKey}
              ref={(r) => {
                zoneWrapperRefMap.current[zoneKey] = r;
              }}
              collapsable={false}
              onLayout={(e: any) => {
                // wrapper 是 GameArea root 的直接子节点，layout.y 就是分区相对 root 的 Y，正好对应 gameAreaOffsetMap 需要的值
                if (!focusAliveRef.current) return;
                const { y, height } = e?.nativeEvent?.layout ?? {};
                if (typeof y !== "number") return;
                handleAreaLayout(zoneKey, y, height);
              }}
            >
              {isLoaded ? (
                <GameBlock3
                  data={{ gameItem, refreshData, gameZoneDict, onAreaLayout: handleAreaLayout }}
                  shouldLoad={true}
                />
              ) : (
                <View style={{ height: placeholderH, overflow: "hidden" }}>
                  <ZoneSkeleton3
                    rows={Number(gameItem?.rows) === 2 ? 2 : 1}
                    showGameName={showGameName}
                    pcWeb={isPCWeb}
                  />
                </View>
              )}
            </View>
          );
        })
      ) : (
        <View style={{ width: contentWidth, paddingTop: 12 }}>
          {gameListLoaded ? (
            <View className="w-full py-2 justify-center items-center">
              <Text className="text-center">{t("home.gameArea.noData")}</Text>
            </View>
          ) : (
            <View style={{ width: contentWidth }}>{skeletonList}</View>
          )}
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  gameItem: {
    marginHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
