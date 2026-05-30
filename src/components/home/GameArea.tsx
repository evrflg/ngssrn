import { View, StyleSheet } from "react-native";
import { GameBlock } from "./components/GameBlock";
import { useCallback, useMemo, useRef, useState } from "react";
import { getGameListServer, getGameZoneDictServer } from "@/api";
import { useFocusEffect } from "expo-router";
import { getStoreJson } from "@/utils/storage";
import { useTranslation } from "react-i18next";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { changeGameList } from "@/store/game/gameSlice";
import { Skeleton } from "./components/Skeleton";
import { Dimensions } from "react-native";
import { usePriorityPartner } from "@/hooks/usePriorityPartner";

// 在组件外部计算，避免每次渲染都调用
const SCREEN_WIDTH = Dimensions.get("window").width;
const SKELETON_WIDTH = SCREEN_WIDTH / 3 - 14;

export const GameArea = () => {
  const [gameList, setGameList] = useState<any[]>([]);
  const [gameZoneDict, setGameZoneDict] = useState<any[]>([]);
  const partnerZones = usePriorityPartner();
  const { t, i18n } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  /** 失焦后为 false，弱网异步返回后不再 setState/dispatch，降低快速切页闪退概率 */
  const focusAliveRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      focusAliveRef.current = true;
      // 语言切换后需要重新拉字典/列表（GameBlock 的 tabLabel 依赖 gameZoneDict.label）
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
        }
      })
      .catch(() => {});
  };

  const getGameList = () => {
    getGameListServer({ size: 12 })
      .then((res: any) => {
        if (!focusAliveRef.current) return;
        if (res?.data?.data) {
          if (res.data?.data?.length > 0) {
            let list = res.data.data.filter((item: any) => {
              return item?.gameList?.length > 0;
            });
            list = sortList(list);
            initFavoriteGames(list);
            dispatch(changeGameList(list));
          }
        }
      })
      .catch(() => {});
  };

  const sortList = useCallback((list: any[]) => {
    // 根据 tab.type 排序，type 数值越小，排序越靠前
    return [...list].sort((a: any, b: any) => {
      return a.sort - b.sort;
    });
  }, []);

  // 格式化游戏列表，处理收藏夹 - 使用 useCallback 缓存
  const formatGameArr = useCallback(
    (gameArr: any, favoriteGameArr: any, currenGameArr: any) => {
      let result = [...gameArr];

      // 使用 Map 优化查找性能
      const favoriteMap = new Map(favoriteGameArr.map((item: any) => [item.name, item]));

      //处理最近游戏
      if (currenGameArr.length > 0) {
        const recentIndex = result.findIndex((game: any) => game.gameZone === 98);
        if (recentIndex >= 0) {
          result[recentIndex] = { ...result[recentIndex], gameList: [...currenGameArr] };
        } else {
          let recentGames = {
            id: "98",
            gameZone: 98,
            customName: t("home.recent"),
            gameList: [...currenGameArr],
            sort: 98,
          };
          result.push(recentGames);
        }
      }
      //处理收藏夹
      if (favoriteGameArr.length > 0) {
        const favoriteIndex = result.findIndex((game: any) => game.gameZone === 99);
        if (favoriteIndex >= 0) {
          result[favoriteIndex] = { ...result[favoriteIndex], gameList: [...favoriteGameArr] };
        } else {
          let savedGames = {
            id: "99",
            gameZone: 99,
            customName: t("home.collect"),
            gameList: [...favoriteGameArr],
            sort: 99,
          };
          result.push(savedGames);
        }
      } else {
        result = result.filter((game: any) => game.gameZone !== 99);
      }

      result = result.map((e: any) => {
        let gameList = e?.gameList.map((k: any) => {
          return { ...k, isSave: favoriteMap.has(k?.name) };
        });
        gameList = sortList(gameList);

        if (gameList.length > 4) {
          const rowsize = Math.ceil(gameList.length / 2);
          const row1 = gameList.slice(0, rowsize);
          const row2 = gameList.slice(rowsize);
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

          return { ...e, rows: 2, gameList: gameList, gameList2: newrow };
        } else {
          return { ...e, rows: 1, gameList: gameList };
        }
      });

      if (favoriteGameArr?.length > 0) {
        result = result.map((e: any) => {
          if (e?.rows == 1) {
            let gameList = e?.gameList.map((k: any) => {
              return { ...k, isSave: favoriteMap.has(k?.name) };
            });
            return { ...e, gameList };
          } else if (e?.rows == 2) {
            let gameList2 = e?.gameList2.map((row: any) => {
              return row.map((k: any) => {
                return { ...k, isSave: favoriteMap.has(k?.name) };
              });
            });
            return { ...e, gameList2 };
          }
          return e;
        });
      }

      return result;
    },
    [t, sortList],
  );

  const initFavoriteGames = useCallback(
    async (gameArr: any) => {
      let favoriteGameArr = (await getStoreJson("favoriteGames")) || [];
      if (!focusAliveRef.current) return;
      let currenGameArr = (await getStoreJson("currenGameArr")) || [];
      if (!focusAliveRef.current) return;
      gameArr = formatGameArr(gameArr, favoriteGameArr, currenGameArr);
      if (!focusAliveRef.current) return;
      setGameList(gameArr);
    },
    [formatGameArr],
  );

  const refreshData = useCallback(() => {
    if (gameList.length > 0) {
      initFavoriteGames(gameList);
    }
  }, [gameList, initFavoriteGames]);
  // 使用 useMemo 缓存骨架屏
  const skeletonList = useMemo(() => {
    return Array.from({ length: 5 }).map((_, index: number) => (
      <View key={index} style={Styles.gameItem}>
        <Skeleton width={SKELETON_WIDTH} height={160} />
        <Skeleton width={SKELETON_WIDTH} height={160} />
        <Skeleton width={SKELETON_WIDTH} height={160} />
      </View>
    ));
  }, []);

  const allZones = useMemo(
    () => [...gameList, ...partnerZones],
    [gameList, partnerZones],
  );

  const renderedGameList = useMemo(() => {
    if (allZones.length > 0) {
      return allZones.map((gameItem: any) => (
        <GameBlock
          key={gameItem.id || gameItem.gameZone}
          data={{ gameItem, refreshData, gameZoneDict }}
        />
      ));
    }
    return <View style={{ paddingTop: 12, width: "100%" }}>{skeletonList}</View>;
  }, [allZones, refreshData, gameZoneDict, skeletonList]);

  return <View>{renderedGameList}</View>;
};

const Styles = StyleSheet.create({
  gameItem: {
    // borderWidth: 1,
    // borderColor: 'red',
    height: 160,
    marginHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
