import {
  View,
  StyleSheet,
  Text,
  Image,
  Pressable,
  ImageBackground,
  TouchableOpacity,
  Platform,
} from "react-native";
import { ScrollView as GHScrollView } from "react-native-gesture-handler";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import { useCommon } from "@/hooks/CommonProvider";
import { useFocusEffect } from "expo-router";
import { getGameListServer, getGameZoneDictServer } from "@/api";
import { GameTypeIcon } from "./GameTypeIcon";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { addFavoriteGames, goToThreeGame } from "../utils/util";
import { useToast } from "@/components/common/toast";
import { getStoreJson } from "@/utils/storage";
import { changeGameList, changeGameZoneDict } from "@/store/game/gameSlice";
import NoData from "@/components/common/NoData";
import { usePriorityPartner } from "@/hooks/usePriorityPartner";

/** 首页 type2 卡片：高度 = 宽度 × φ（与二级页行比例分开） */
const CARD_GOLDEN_RATIO = 1.32;

/** 左侧 tab：网络 icon 加载失败时回退到 GameTypeIcon */
const TabSideIcon = memo(function TabSideIcon({
  tabItem,
  currentSelectedId,
}: {
  tabItem: any;
  currentSelectedId: any;
}) {
  const [iconFailed, setIconFailed] = useState(false);

  useEffect(() => {
    setIconFailed(false);
  }, [tabItem?.icon]);

  if (!tabItem?.icon || iconFailed) {
    return <GameTypeIcon type={tabItem.id} currentId={currentSelectedId} />;
  }

  return (
    <Image
      source={{ uri: tabItem.icon }}
      style={{ width: 24, height: 24 }}
      resizeMode="contain"
      onError={() => setIconFailed(true)}
    />
  );
});

export const GameArea2 = () => {
  const cardBg1 = useThemeColor({}, "cardBg1");
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch: AppDispatch = useDispatch();
  const toast = useToast();
  const { theme } = useTheme(); //主题
  const partnerZones = usePriorityPartner();
  const [allGameList, setAllGameList] = useState<any[]>([]);
  const [gameZoneDict, setGameZoneDict] = useState<any[]>([]);
  const [gameList, setGameList] = useState([]);
  const [tabList, setTabList] = useState<any[]>([]);
  const { t, i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rightTabIndex, setRightTabIndex] = useState(0);
  const [rightGameTitle, setRightGameTitle] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (i18n.language) {
        getGameZoneDict();
        getGameList();
      }
    }, [i18n.language]), // 依赖数组为空表示仅在焦点变化时执行
  );

  useEffect(() => {
    if (gameZoneDict?.length > 0 && allGameList?.length > 0) {
      // 普通分区：从 dict 里取 label，保留完整字段供导航使用
      const baseArr: any[] = [];
      allGameList.forEach((item: any) => {
        const dictItem = gameZoneDict.find(
          (e) => e.dictType === "game_zone" && String(e.value) === String(item?.gameZone),
        );
        if (dictItem) {
          baseArr.push({
            id: String(dictItem.value),
            gameZone: item.gameZone,
            label: dictItem.label,
            icon: item.icon,
            gameZoneId: item.id,
            // 供收藏/最近 tab 过滤使用
            gameList: item.gameList ?? [],
          });
        }
      });
      // partner 分区：直接用 customName，追加到末尾
      const partnerArr: any[] = partnerZones.map((zone) => ({
        id: String(zone.gameZone),
        gameZone: zone.gameZone,
        label: zone.customName,
        icon: zone.icon,
        gameZoneId: zone.id,
        _partnerId: zone._partnerId,
        _partnerGameType: zone._partnerGameType,
        gameList: zone.gameList ?? [],
      }));
      setTabList([...baseArr, ...partnerArr]);
    }
  }, [gameZoneDict, allGameList, partnerZones]);

  useEffect(() => {
    if (tabList?.length > 0) {
      // tabList 首次建好（或 partner 到达后重建）时，刷新当前分区的游戏列表
      const tab = tabList[currentIndex] ?? tabList[0];
      setRightGameTitle(tab.label);
      setRightTabIndex(0);
      initFavoriteGames(tab.gameList ?? []);
    }
  }, [tabList]);

  useEffect(() => {
    if (tabList?.length > 0) {
      const tab = tabList[currentIndex];
      if (!tab) return;
      initFavoriteGames(tab.gameList ?? []);
      setRightGameTitle(tab.label);
      setRightTabIndex(0);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (tabList?.length > 0) {
      const tab = tabList[currentIndex];
      if (!tab) return;
      const arr = tab.gameList ?? [];
      if (rightTabIndex === 0) {
        initFavoriteGames(arr);
      } else if (rightTabIndex === 1) {
        formatGameArr(arr).then((result: any) => {
          setGameList(result.filter((e: any) => e.islast === true));
        });
      } else if (rightTabIndex === 2) {
        // partner 分区用 _partnerGameType，普通分区用 id（gameZone 值）
        const gameType = tab._partnerGameType
          ? String(tab._partnerGameType)
          : tab.id;
        if (["1", "2", "3", "4", "5", "6", "7", "8"].includes(gameType)) {
          getStoreJson("favoriteGames").then((res: any) => {
            const resArr1 = (res || []).filter(
              (e: any) => String(e.gameType) === gameType,
            );
            setGameList(resArr1);
          });
        } else {
          formatGameArr(arr).then((result: any) => {
            setGameList(result.filter((e: any) => e.isSave === true));
          });
        }
      }
    }
  }, [rightTabIndex, tabList, currentIndex]);

  const getGameList = () => {
    getGameListServer({ size: 12 }).then((res: any) => {
      if (res?.data?.data) {
        if (res.data?.data?.length > 0) {
          let list = res.data.data.filter((item: any) => {
            return item?.gameList?.length > 0;
          });
          list = sortList(list);
          setAllGameList(list);
          dispatch(changeGameList(list));
        }
      }
    });
  };

  const initFavoriteGames = async (list: any) => {
    list = await formatGameArr(list);
    let arr: any = [...list];
    if (rightTabIndex == 2) {
      getStoreJson("favoriteGames").then((res: any) => {
        setGameList(res || []);
      });
    } else {
      setGameList(arr);
    }
  };

  const formatGameArr = async (gameArr: any) => {
    let favoriteGameArr = (await getStoreJson("favoriteGames")) || [];
    let currenGameArr = (await getStoreJson("currenGameArr")) || [];

    return gameArr.map((e: any) => {
      let ishave = false;
      let islast = false;
      favoriteGameArr.map((k: any) => {
        if (k.name == e.name) {
          ishave = true;
        }
      });

      currenGameArr.map((k: any) => {
        if (k.name == e.name) {
          islast = true;
        }
      });

      return { ...e, isSave: ishave, islast: islast };
    });
  };

  const sortList = (list: any[]) => {
    // 根据 tab.type 排序，type 数值越小，排序越靠前
    return [...list].sort((a: any, b: any) => {
      return a.sort - b.sort;
    });
  };

  const getGameZoneDict = () => {
    getGameZoneDictServer({ type: "game_zone" }).then((res: any) => {
      if (res?.data?.data) {
        setGameZoneDict(res.data.data);
        dispatch(changeGameZoneDict(res.data.data));
      }
    });
  };

  //登录
  const toLogin = () => {
    navigation.push("login");
  };

  const toSeeMore = (gameType: string, gameZoneId: string, tabLabel: string) => {
    navigation.push("secondary-games/index", {
      type: gameType,
      id: gameZoneId,
      tabLabel: tabLabel,
    });
  };

  const goToGame = (item: any) => {
    //直接跳转
    goToThreeGame(item?.id, item, dispatch, userInfo, toast, t);
  };

  const refreshData = () => {
    initFavoriteGames(gameList);
  };

  const gameRows = useMemo(() => {
    const list = gameList as any[];
    const rows: any[][] = [];
    for (let i = 0; i < list.length; i += 3) {
      rows.push(list.slice(i, i + 3));
    }
    return rows;
  }, [gameList]);

  return (
    <View style={[styles.box]}>
      <View style={[styles.leftArea, { backgroundColor: cardBg1 }]}>
        <GHScrollView
          className="hide-scrollbar"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={Platform.OS === "android" ? false : undefined}
        >
          {tabList.map((tabItem, index) => {
            return (
              <Pressable
                key={index}
                className="px-1"
                onPress={() => {
                  setCurrentIndex(index);
                }}
                style={[
                  styles.tabItem,
                  { borderTopRightRadius: index == 0 ? 10 : 0 },
                  currentIndex == index
                    ? {
                        backgroundColor: Colors[theme].lightPrimary,
                        borderRightWidth: 1,
                        borderRightColor: Colors[theme].primary,
                      }
                    : { borderRightWidth: 1, borderRightColor: cardBg1 },
                ]}
              >
                <TabSideIcon tabItem={tabItem} currentSelectedId={tabList[currentIndex]?.id} />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.tabItemText,
                    { color: currentIndex == index ? Colors[theme].primary : Colors[theme].text },
                  ]}
                >
                  {tabItem.label}
                </Text>
              </Pressable>
            );
          })}
        </GHScrollView>
      </View>
      <View style={styles.rightArea}>
        <View style={styles.rightAreaTab}>
          <Pressable
            onPress={() => {
              setRightTabIndex(0);
            }}
            style={[
              styles.rightTabItem,
              rightTabIndex == 0
                ? { borderBottomWidth: 1, borderBottomColor: Colors[theme].gradient }
                : { borderBottomWidth: 1, borderBottomColor: "transparent" },
            ]}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: rightTabIndex == 0 ? Colors[theme].gradient : Colors[theme].lightText,
                fontSize: 11,
              }}
            >
              {rightGameTitle}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setRightTabIndex(1);
            }}
            style={[
              styles.rightTabItem,
              rightTabIndex == 1
                ? { borderBottomWidth: 1, borderBottomColor: Colors[theme].gradient }
                : { borderBottomWidth: 1, borderBottomColor: "transparent" },
            ]}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: rightTabIndex == 1 ? Colors[theme].gradient : Colors[theme].lightText,
                fontSize: 11,
              }}
            >
              {t("home.recent")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setRightTabIndex(2);
            }}
            style={[
              styles.rightTabItem,
              rightTabIndex == 2
                ? { borderBottomWidth: 1, borderBottomColor: Colors[theme].gradient }
                : { borderBottomWidth: 1, borderBottomColor: "transparent" },
            ]}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: rightTabIndex == 2 ? Colors[theme].gradient : Colors[theme].lightText,
                fontSize: 11,
              }}
            >
              {t("home.collect")}
            </Text>
          </Pressable>
        </View>
        <View style={styles.gameFlatListViewport}>
          <GHScrollView
            style={styles.gameFlatList}
            contentContainerStyle={
              (gameList as any[]).length === 0
                ? styles.gameScrollContentEmpty
                : styles.gameScrollContent
            }
            showsVerticalScrollIndicator
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            scrollEventThrottle={16}
            {...(Platform.OS === "android" ? { persistentScrollbar: true } : {})}
          >
            {(gameList as any[]).length === 0 ? (
              <View
                style={{
                  height: 200,
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  marginTop: 50,
                }}
              >
                <NoData />
              </View>
            ) : (
              <>
                <View style={styles.gameGrid}>
                  {gameRows.map((row, rowIndex) => (
                    <View key={`game-row-${rowIndex}`} style={styles.gameRow}>
                      {row.map((item) => (
                        <View key={String(item.id)} style={styles.itemBlock}>
                          <View style={styles.itemBlockInner}>
                            <ImageBackground
                              source={require("@/assets/images/home/zhanwei.png")}
                              style={styles.background}
                              resizeMode="contain"
                            >
                              <TouchableOpacity
                                style={styles.itemTouchable}
                                onPress={() => {
                                  if (userInfo?.isLogin) {
                                    goToGame(item);
                                  } else {
                                    toLogin();
                                  }
                                }}
                              >
                                <Image
                                  source={{ uri: item?.icon }}
                                  resizeMode="stretch"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 8,
                                  }}
                                />
                              </TouchableOpacity>

                              <View
                                className="absolute w-[32px] h-[32px] top-0 right-0"
                                onTouchStart={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <TouchableOpacity
                                  className="flex-1 justify-center items-center"
                                  onPress={() => {
                                    addFavoriteGames(item, refreshData);
                                  }}
                                >
                                  <Image
                                    source={
                                      item?.isSave
                                        ? require("@/assets/images/home/star_active.png")
                                        : require("@/assets/images/home/star.png")
                                    }
                                    style={{ width: 24, height: 24 }}
                                    resizeMode="contain"
                                  />
                                </TouchableOpacity>
                              </View>

                              {item?.isRecommendation && (
                                <View className="absolute top-0 left-0 pl-[2px]">
                                  <Image
                                    source={require("@/assets/images/home/game/hot1.gif")}
                                    style={{ width: 30, height: 30 }}
                                    resizeMode="contain"
                                  />
                                </View>
                              )}

                              {(item?.gameType == "8" || item?.gameType == "4") && (
                                <View className="absolute bottom-0 left-0 right-0 h-[20px]">
                                  <Text
                                    style={[styles.font, { color: Colors[theme].text }]}
                                    numberOfLines={1}
                                  >
                                    {item?.name}
                                  </Text>
                                </View>
                              )}
                            </ImageBackground>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
                {rightTabIndex === 0 ? (
                  <TouchableOpacity
                    style={styles.moreBtn}
                    onPress={() => {
                      const tab = tabList[currentIndex];
                      const gameType = tab?._partnerGameType ?? tab?.gameZone;
                      const gameZoneId = tab?._partnerId ?? tab?.gameZoneId;
                      toSeeMore(String(gameType ?? ""), String(gameZoneId ?? ""), rightGameTitle);
                    }}
                  >
                    <Text style={{ color: Colors[theme].text, fontSize: 11 }}>
                      {t("common.more")}
                    </Text>
                    <AntDesign
                      name="right"
                      size={10}
                      className="ml-2.5"
                      color={Colors[theme].text}
                    />
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </GHScrollView>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  box: {
    display: "flex",
    flexDirection: "row",
  },
  leftArea: {
    width: 90,
    height: 500,
    borderTopRightRadius: 10,
  },
  tabItem: {
    height: 54,
    display: "flex",
    alignItems: "center",
    paddingTop: 8,
  },
  tabItemText: {
    fontSize: 12,
  },
  rightArea: {
    flex: 1,
    paddingHorizontal: 7,
  },
  rightAreaTab: {
    height: 40,
    width: "100%",
    paddingHorizontal: 3,
    flexDirection: "row",
    marginBottom: 10,
  },
  rightTabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gameFlatListViewport: {
    height: 450,
    overflow: "hidden",
  },
  gameFlatList: {
    height: 450,
    flexGrow: 0,
  },
  gameScrollContent: {
    flexGrow: 0,
    paddingBottom: 8,
  },
  gameScrollContentEmpty: {
    flexGrow: 1,
  },
  gameGrid: {
    width: "100%",
  },
  gameRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 6,
  },
  itemBlock: {
    width: "33.333333%",
    paddingHorizontal: 3,
    paddingBottom: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  itemBlockInner: {
    width: "100%",
    aspectRatio: 1 / CARD_GOLDEN_RATIO,
    borderRadius: 8,
    overflow: "hidden",
  },
  background: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  itemTouchable: {
    flex: 1,
    width: "100%",
  },
  moreBtn: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  font: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
  },
});
