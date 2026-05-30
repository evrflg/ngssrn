import { DeviceEventEmitter, Dimensions, InteractionManager, View, Text, useWindowDimensions, Platform, StyleSheet } from "react-native"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image as ExpoImage } from 'expo-image';
import { getGameListServer, getGameZoneDictServer } from "@/api"
import { useFocusEffect } from 'expo-router';
import { getStoreJson, setStoreJson } from "@/utils/storage";
import { useTranslation } from "react-i18next";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { changeGameAreaBaseOffset, changeGameAreaHeight, changeGameAreaOffsetMap, changeGameList, changeGameZoneDict } from "@/store/game/gameSlice";
import { usePriorityPartner } from "@/hooks/usePriorityPartner";
import { rf } from "@/utils/scaleFont";
import { GameBlock5 } from "./GameBlock5";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { screen } from "@/utils/screen";
import { Skeleton } from "@/components/home/components/Skeleton";
/**
 * 根据 zone 数据推算 GameBlock5 wrapper 高度（含 outer margin 14px）。
 * 公式来自 GameBlock5 布局常量：
 *   header(43) + bar(24) - overlap(10) + pt(10) + cards + pb(10) + marginTop(4) + marginBottom(10)
 *   cardW = ceil((min(screenW,480) - 58) / 4) - 3
 *   coverH = cardW / 0.732（GAME_CARD_COVER_ASPECT_RATIO）
 */
import { estimateBlock5ZoneH } from "./layout";
import { ZoneSkeleton5 } from "./ZoneSkeleton5";

/** 提取一个 zone 内所有游戏图片 URL（用于预取） */
function getZone5ImageUrls(zone: any): string[] {
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
import { MAX_WIDTH } from "@/hooks/useMaxWidth";
const isPCWeb = Platform.OS === "web" && screen.get("window").width >= MAX_WIDTH;
export const GameArea5 = () => {
  const { width } = useWindowDimensions();
  const contentWidth = isPCWeb ? Math.min(width, MAX_WIDTH) : width;
  const skeletonWidth = contentWidth / 3 - 14;
  const gameSkeletonHeight = isPCWeb ? 190 : 160;
  const rootRef = useRef<View | null>(null);
  const zoneWrapperRefMap = useRef<Record<string, View | null>>({});
  const [gameList, setGameList] = useState<any[]>([]);
  const partnerZones = usePriorityPartner();
  const baseGameListRef = useRef<any[]>([]);
  const partnerZonesRef = useRef(partnerZones);
  const allZones = useMemo(() => [...gameList, ...partnerZones], [gameList, partnerZones]);
  const [gameZoneDict, setGameZoneDict] = useState<any[]>([])
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const cfg_global_switch: any = useSelector(
    (state: RootState) => state?.user?.cfg_global_switch,
  );
  const showGameName = Boolean(cfg_global_switch?.tenantGameConfig?.showGameName);
  const gameAreaHeightRef = useRef<Record<string, number>>({});
  const gameAreaOffsetRef = useRef<Record<string, number>>({});
  const [gameListLoaded, setGameListLoaded] = useState(false)
  const gameAreaBaseOffsetRef = useRef(0);
  const lastZoneSignatureRef = useRef<string>("");
  const lastFavoriteSignatureRef = useRef<string>("");
  const lastRecentSignatureRef = useRef<string>("");
  const focusAliveRef = useRef(false);
  const getGameListSeqRef = useRef(0);
  const loadedZonesRef = useRef<Set<string>>(new Set());
  const prefetchedZonesRef = useRef<Set<string>>(new Set());
  const [, setLoadedVersion] = useState(0);
  const allZonesRef = useRef<any[]>([]);
  const showGameNameRef = useRef(showGameName);
  // Tab 点击跳转期间抑制滚动懒加载，防止动画途经分区被全量标记
  const tabJumpActiveRef = useRef(false);
  const tabJumpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme } = useTheme();

  const handleAreaLayout = useCallback(
    (gameZone: string | number, layoutY: number | undefined, height: number) => {
      const zoneKey = String(gameZone ?? "");
      if (!zoneKey) return;
      // 仅在有「相对首页游戏根容器」的 y 时写 offset（来自 measureLayout）。
      // GameBlock5 的 onLayout 里 layout.y 是相对父级，多为 0，写入会导致全分区 offset 相同、Tab 点击滚动目标不变。
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
    [dispatch]
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
        () => {
          // ignore
        },
      );
    });
  }, [handleAreaLayout]);

  // 首次渲染/数据更新后兜底触发一次全量测量，避免某些机型上 measureAllZones 调用过早（refs 未就绪）
  // 导致 gameAreaOffsetMap 长时间缺失、Tab 点击回退到累计兜底，越往后误差越大。
  const measureBootstrapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  useEffect(() => {
    showGameNameRef.current = showGameName;
  }, [showGameName]);

  /** 将 zones 数据同步到 ref，并按高度预估标记初始可见分区为已加载 */
  const markInitialZones = useCallback((zones: any[]) => {
    const SCREEN_H = Dimensions.get("window").height;
    const INITIAL_H = SCREEN_H * 1;
    const PREFETCH_H = SCREEN_H * 3;
    let cumY = 0;
    let newAdded = false;
    for (const zone of zones) {
      if (cumY > PREFETCH_H) break;
      const key = String(zone?.gameZone ?? "");
      if (key) {
        if (!prefetchedZonesRef.current.has(key)) {
          prefetchedZonesRef.current.add(key);
          const urls = getZone5ImageUrls(zone);
          if (urls.length > 0) ExpoImage.prefetch(urls).catch(() => {});
        }
        if (cumY <= INITIAL_H && !loadedZonesRef.current.has(key)) {
          loadedZonesRef.current.add(key);
          newAdded = true;
        }
      }
      cumY += estimateBlock5ZoneH(zone, showGameNameRef.current);
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
    const LOAD_AHEAD = SCREEN_H * 1.5;
    const LOAD_BACK = SCREEN_H * 0.5;
    const PREFETCH_AHEAD = SCREEN_H * 3;
    const sub = DeviceEventEmitter.addListener("home-float-scroll-y", (scrollY: number) => {
      if (tabJumpActiveRef.current) return;
      const zones = allZonesRef.current;
      if (!zones.length) return;
      let newAdded = false;
      let cumY = gameAreaBaseOffsetRef.current;
      for (const zone of zones) {
        const key = String(zone?.gameZone ?? "");
        if (!key) { cumY += estimateBlock5ZoneH(zone, showGameNameRef.current); continue; }
        const measured = gameAreaOffsetRef.current[key];
        const zoneY = (Number.isFinite(measured) && measured >= 0)
          ? gameAreaBaseOffsetRef.current + measured
          : cumY;
        const zoneH = gameAreaHeightRef.current[key] ?? estimateBlock5ZoneH(zone, showGameNameRef.current);
        cumY = (Number.isFinite(measured) && measured >= 0)
          ? gameAreaBaseOffsetRef.current + measured + zoneH
          : cumY + zoneH;
        // 预取窗口：在渲染范围外但在 3 屏以内，提前下载图片
        if (!prefetchedZonesRef.current.has(key) &&
            !loadedZonesRef.current.has(key) &&
            zoneY + zoneH >= scrollY - LOAD_BACK &&
            zoneY <= scrollY + PREFETCH_AHEAD) {
          prefetchedZonesRef.current.add(key);
          const urls = getZone5ImageUrls(zone);
          if (urls.length > 0) ExpoImage.prefetch(urls).catch(() => {});
        }
        // 渲染窗口
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

  useEffect(() => {
    const SCREEN_H = Dimensions.get("window").height;
    const AHEAD = SCREEN_H * 1.5;
    const BACK = SCREEN_H * 0.5;
    const PREFETCH_AHEAD = SCREEN_H * 3;
    const sub = DeviceEventEmitter.addListener("home-tab-jump-target-y", (targetScrollY: number) => {
      const zones = allZonesRef.current;
      if (!zones.length) return;
      let newAdded = false;
      let cumY = gameAreaBaseOffsetRef.current;
      for (const zone of zones) {
        const key = String(zone?.gameZone ?? "");
        if (!key) { cumY += estimateBlock5ZoneH(zone, showGameNameRef.current); continue; }
        const measured = gameAreaOffsetRef.current[key];
        const zoneY = (Number.isFinite(measured) && measured >= 0)
          ? gameAreaBaseOffsetRef.current + measured
          : cumY;
        const zoneH = gameAreaHeightRef.current[key] ?? estimateBlock5ZoneH(zone, showGameNameRef.current);
        cumY = (Number.isFinite(measured) && measured >= 0)
          ? gameAreaBaseOffsetRef.current + measured + zoneH
          : cumY + zoneH;
        // 预取：目标附近 3 屏范围的图片
        if (!prefetchedZonesRef.current.has(key) &&
            !loadedZonesRef.current.has(key) &&
            zoneY + zoneH >= targetScrollY - BACK &&
            zoneY <= targetScrollY + PREFETCH_AHEAD) {
          prefetchedZonesRef.current.add(key);
          const urls = getZone5ImageUrls(zone);
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
    getGameZoneDictServer({ type: 'game_zone' })
      .then((res: any) => {
        if (!focusAliveRef.current) return;
        if (res?.data?.data) {
          let current = { id: '98', label: t("home.recent"), value: '98', sort: 98, dictType: 'game_zone' }
          let collect = { id: '99', label: t("home.collect"), value: '99', sort: 99, dictType: 'game_zone' }
          setGameZoneDict([...res.data.data, ...[current], ...[collect]])
          dispatch(changeGameZoneDict([...res.data.data, ...[current], ...[collect]]))
        }
      })
      .catch(() => { });
  }

  const getGameList = async () => {
    const seq = ++getGameListSeqRef.current;
    setGameListLoaded(false);

    try {
      // 先用本地缓存渲染（更快），同时总是请求服务端刷新缓存供下次使用
      let list: any[] = [];
      const cached = await getStoreJson("rn_gameList");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            list = parsed;
          }
        } catch {
          // ignore invalid cache
        }
      }

      if (!focusAliveRef.current || seq !== getGameListSeqRef.current) return;

      // 继续沿用原逻辑：处理收藏/最近、更新 redux & 本地 gameList，并触发测量（先用缓存）
      await initFavoriteGames(list);

      // 无论缓存是否命中，都请求服务端拿最新数据写入缓存；若与当前不同，则刷新 UI
      const res = await getGameListServer({ size: 12 });
      if (!focusAliveRef.current || seq !== getGameListSeqRef.current) return;

      let freshList: any[] = [];
      if (res?.data?.data?.length > 0) {
        freshList = sortList(res.data.data.filter((item: any) => item?.gameList?.length > 0));
      }

      // 写入缓存（无数据也写空数组，避免下次读取到旧缓存）
      setStoreJson("rn_gameList", JSON.stringify(freshList));

      // 仅当数据确实变化时才刷新 UI，避免重复重排/重测量
      const freshSig = JSON.stringify(
        (freshList || []).map((g: any) => ({
          z: String(g?.gameZone ?? ""),
          s: Number(g?.sort ?? 0),
          // 这里用长度即可，避免深比较带来开销
          n: Array.isArray(g?.gameList) ? g.gameList.length : 0,
        })),
      );
      const cachedSig = JSON.stringify(
        (list || []).map((g: any) => ({
          z: String(g?.gameZone ?? ""),
          s: Number(g?.sort ?? 0),
          n: Array.isArray(g?.gameList) ? g.gameList.length : 0,
        })),
      );
      if (freshSig !== cachedSig) {
        await initFavoriteGames(freshList);
      }

    } catch (e) {
      // 请求失败也需要结束 loading，避免卡住；不在这里 toast，避免首页反复弹窗
    } finally {
      if (!focusAliveRef.current || seq !== getGameListSeqRef.current) return;
      setGameListLoaded(true);
    }
  }

  const sortList = (list: any[]) => {
    const copy = [...list].sort((a: any, b: any) => {
      return (a.sort) - (b.sort)
    })
    // 根据 tab.type 排序，type 数值越小，排序越靠前
    return copy
  }
  // 格式化游戏列表，处理收藏夹
  const formatGameArr = (gameArr: any, favoriteGameArr: any, currenGameArr: any) => {
    const favoriteNameSet = new Set(
      (favoriteGameArr || [])
        .map((item: any) => item?.name)
        .filter((name: any) => !!name)
    );
    //处理最近游戏
    if (currenGameArr.length > 0) {
      let isSave = gameArr.some((game: any) => game.gameZone === 98)
      if (isSave) {
        gameArr = gameArr.map((game: any) => {
          if (game.gameZone === 98) {
            return { ...game, gameList: [...currenGameArr] }
          }
          return game
        })
      } else {
        let recentGames = {
          id: "98",
          gameZone: 98,
          customName: t("home.recent"),
          gameList: [...currenGameArr],
          sort: 98,
        }
        gameArr = [...gameArr, ...[recentGames]]
      }
    }

    //处理收藏夹
    if (favoriteGameArr.length > 0) {
      let isSave = gameArr.some((game: any) => game.gameZone === 99)
      if (isSave) {
        gameArr = gameArr.map((game: any) => {
          if (game.gameZone === 99) {
            return { ...game, gameList: [...favoriteGameArr] }
          }
          return game
        })
      } else {
        let savedGames = {
          id: "99",
          gameZone: 99,
          customName: t("home.collect"),
          gameList: [...favoriteGameArr],
          sort: 99,
        }
        gameArr = [...gameArr, ...[savedGames]]
      }
    } else {
      gameArr = gameArr.filter((game: any) => {
        return game.gameZone !== 99
      })
    }

    gameArr = gameArr.map((e: any) => {
      e.gameList = sortList(e?.gameList)
      if (e.gameList.length > 4) {
        const rowsize = e.gameList.length < 8 ? 4 : Math.ceil(e.gameList.length / 2)
        const row1 = e.gameList.slice(0, rowsize)
        const row2 = e.gameList.slice(rowsize)
        let newrow = []
        for (let i = 0; i < row1.length; i++) {
          let arr = []
          if (row1[i]) {
            arr.push(row1[i])
          }
          if (row2[i]) {
            arr.push(row2[i])
          }
          newrow.push(arr)
        }

        return { ...e, rows: 2, gameList2: newrow }
      } else {
        return { ...e, rows: 1 }
      }
    })

    gameArr = gameArr.map((e: any) => {
      if (e?.rows == 1) {
        const list = e?.gameList.map((k: any) => {
          return { ...k, isSave: favoriteNameSet.has(k?.name) }
        })
        return { ...e, gameList: list }
      } else if (e?.rows == 2) {
        const list = e?.gameList2.map((row: any) => {
          return row.map((k: any) => {
            return { ...k, isSave: favoriteNameSet.has(k?.name) }
          })
        })
        return { ...e, gameList2: list }
      }
      return e
    })
    return gameArr

  }

  const initFavoriteGames = async (gameArr: any) => {
    let favoriteGameArr = await getStoreJson('favoriteGames') || [];
    if (!focusAliveRef.current) return;
    let currenGameArr = await getStoreJson('currenGameArr') || [];
    if (!focusAliveRef.current) return;

    const favoriteSignature = JSON.stringify(
      (favoriteGameArr || [])
        .map((g: any) => String(g?.name ?? ""))
        .filter(Boolean)
        .sort(),
    );
    const recentSignature = JSON.stringify(
      (currenGameArr || [])
        .map((g: any) => String(g?.id ?? g?.name ?? ""))
        .filter(Boolean)
        .sort(),
    );
    const favoriteOrRecentChanged =
      lastFavoriteSignatureRef.current !== favoriteSignature ||
      lastRecentSignatureRef.current !== recentSignature;
    lastFavoriteSignatureRef.current = favoriteSignature;
    lastRecentSignatureRef.current = recentSignature;

    gameArr = formatGameArr(gameArr, favoriteGameArr, currenGameArr)
    if (!focusAliveRef.current) return;
    const countGamesInZone = (g: any) => {
      const rows = Number(g?.rows ?? 1);
      if (rows === 2 && Array.isArray(g?.gameList2)) {
        return g.gameList2.reduce((acc: number, row: any) => {
          if (!Array.isArray(row)) return acc;
          return acc + row.filter(Boolean).length;
        }, 0);
      }
      return Array.isArray(g?.gameList) ? g.gameList.filter(Boolean).length : 0;
    };
    // 分区结构 / 各分区游戏数量 / 是否展示游戏名 变化时，需要重新测量（收藏/最近会改变高度与相对 y）
    const nextSignature = JSON.stringify(
      (gameArr || []).map((g: any) => ({
        z: String(g?.gameZone ?? ""),
        r: Number(g?.rows ?? 1),
        n: countGamesInZone(g),
        showName: Boolean(cfg_global_switch?.tenantGameConfig?.showGameName),
      }))
    );
    const shouldResetMeasures =
      lastZoneSignatureRef.current !== nextSignature || favoriteOrRecentChanged;
    lastZoneSignatureRef.current = nextSignature;
    if (shouldResetMeasures) {
      // 不重挂载、不把高度打回兜底（会闪）。只清 offset，并主动 measure 触发全量重测。
      gameAreaOffsetRef.current = {};
      dispatch(changeGameAreaOffsetMap({}));
      // 同时给每个分区一个兜底高度，避免测量尚未回填时 Tab 计算出现 0 高度
      const provisionalHeights: Record<string, number> = {};
      (gameArr || []).forEach((g: any) => {
        const z = g?.gameZone;
        if (z === undefined || z === null) return;
        const key = String(z);
        provisionalHeights[key] =
          gameAreaHeightRef.current[key] ?? estimateBlock5ZoneH(g, showGameName);
      });
      gameAreaHeightRef.current = { ...provisionalHeights };
      dispatch(changeGameAreaHeight(provisionalHeights));
    }
    if (!focusAliveRef.current) return;
    baseGameListRef.current = gameArr;
    setGameList([...gameArr]);
    dispatch(changeGameList([...gameArr, ...partnerZonesRef.current]));

    if (shouldResetMeasures) {
      InteractionManager.runAfterInteractions(() => {
        // 等列表更新/布局稳定后再测量
        requestAnimationFrame(() => {
          measureAllZones();
        });
      });
    }

  }

  // partnerZones 异步到达时，同步 ref 并补发合并后的 gameList 到 Redux（供 GameTab5 / Index3 感知）
  useEffect(() => {
    partnerZonesRef.current = partnerZones;
    if (partnerZones.length > 0 && baseGameListRef.current.length > 0) {
      dispatch(changeGameList([...baseGameListRef.current, ...partnerZones]));
      // 为尚未测量的 partner 分区补充预估高度，避免 Tab 使用硬编码 fallback 造成累计定位误差
      const extra: Record<string, number> = {};
      partnerZones.forEach((zone) => {
        const key = String(zone.gameZone ?? "");
        if (!key || (gameAreaHeightRef.current[key] ?? 0) > 0) return;
        extra[key] = estimateBlock5ZoneH(zone, showGameName);
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
    const list = [...gameList]
    initFavoriteGames(list)
  }

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
      onLayout={(event: any) => {
        const nextBaseOffset = Math.max(
          0,
          Math.round(Number(event?.nativeEvent?.layout?.y ?? 0))
        );
        if (gameAreaBaseOffsetRef.current === nextBaseOffset) return;
        gameAreaBaseOffsetRef.current = nextBaseOffset;
        dispatch(changeGameAreaBaseOffset(nextBaseOffset));
      }}
    >
      {allZones.length > 0 ? allZones.map((gameItem: any, index: number) => {
        const zoneKey = String(gameItem?.gameZone ?? index);
        const isLoaded = loadedZonesRef.current.has(zoneKey);
        const placeholderH = gameAreaHeightRef.current[zoneKey] ?? estimateBlock5ZoneH(gameItem, showGameName);
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
              <GameBlock5
                data={{ gameItem, refreshData, gameZoneDict, onAreaLayout: handleAreaLayout }}
                shouldLoad={true}
              />
            ) : (
              <View style={{ height: placeholderH, overflow: "hidden" }}>
                <ZoneSkeleton5
                  rows={Number(gameItem?.rows) === 2 ? 2 : 1}
                  showGameName={showGameName}
                />
              </View>
            )}
          </View>
        );
      }) : (
        <View>
          {(gameListLoaded && gameList.length === 0) ? (
            <View className="w-full py-2 justify-center items-center">
              <Text
                className="text-center"
                style={{ fontSize: rf(14), color: Colors[theme].text }}
              >
                {t("home.gameArea.noData")}
              </Text>
            </View>
          ) : (
            <View style={{ width: contentWidth }}>
              {skeletonList}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gameItem: {
    marginHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
