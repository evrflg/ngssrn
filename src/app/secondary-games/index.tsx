import {
  getGameGroupsServer,
  getMissionGameList,
  getPartnerListServer,
  getSecondaryGamesServer,
} from "@/api";
import { SimpleHeader } from "@/components/common/Header";
import NoData from "@/components/common/NoData";
import { useToast } from "@/components/common/toast";
import { autoExchangeAccInfo, goToThreeGame } from "@/components/home/utils/util";
import { formatGameCardNameForWideScreen } from "@/components/home/utils/formatGameName";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { AppDispatch, RootState } from "@/store/store";
import { getStoreJson, setStoreJson } from "@/utils/storage";
import Octicons from "@expo/vector-icons/Octicons";
import { Input } from "@rneui/themed";
import { useIsFocused } from "@react-navigation/native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { SECONDARY_GAME_ROW_HEIGHT_RATIO } from "@/components/home/utils/const";
import GameTipPopup from "@/components/home/components/popup/GameTipPopup";
import TestUserPopup from "@/components/home/components/popup/TestUserPopup";
import { stationConfig } from "@/store/tenant/tenantSlice";
const { height: screenHeigth } = Dimensions.get("window");
/** 与厂商 Tab 行 ScrollView / tabWebInnerRow 布局一致 */
const TAB_PADDING_LEFT = 2;
const TAB_PADDING_RIGHT = 12;
const TAB_MARGIN_LEFT = 10;
const TAB_CHIP_W = 64;
const TAB_STRIDE = TAB_MARGIN_LEFT + TAB_CHIP_W;
const SecondaryGames = () => {
  const WebDiv: any = View;
  const { width: windowWidth } = useWindowDimensions();
  /** PC Web：用 div 式横向滚动（RN Web 的 View + overflow），滚动条行为优于 ScrollView */
  const isPcWeb =
    Platform.OS === "web" && windowWidth > 768;
  const tabWebScrollRef = useRef<any>(null);
  const tabScrollViewRef = useRef<ScrollView | null>(null);
  const tabScrollViewportWRef = useRef(0);
  const tabWebDragStateRef = useRef({
    dragging: false,
    startClientX: 0,
    startScrollLeft: 0,
  });
  const insets = useSafeAreaInsets();
  const userInfo: any = useSelector(
    (state: RootState) => state?.user?.userInfo
  );
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const [searchText, setSearchText] = useState("");
  const [gameList, setGameList]: any = useState([]);
  /** 列表接口未返回前不展示 NoData，避免与全局 loading 叠在一起 */
  const [isListAwaiting, setIsListAwaiting] = useState(true);
  const [allGames, setAllGames]: any = useState([]);
  const [gameType]: any = useState("");
  const [gameProviders, setGameProviders]: any = useState([]);
  const [currentProviderId, setCurrentProviderId]: any = useState(null);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [gameGroups, setGameGroups] = useState<
    { groupCode: string; groupName: string; sort: number }[]
  >([]);
  const [currentGroupCode, setCurrentGroupCode] = useState("");
  const [singlePartnerId, setSinglePartnerId] = useState<string | null>(null);
  const dispatch: AppDispatch = useDispatch();
  // 获取二级游戏tab 0--体育 1-真人 2-电子 3--彩票 4--棋牌 5--红包 6--电竞 7--捕鱼 10--热门 11-大厅
  const { type, id, tabLabel } = useLocalSearchParams();
  const cfg_global_switch: any = useSelector((state: RootState) => state?.user?.cfg_global_switch);
  const isShowGameModel = useSelector((state: RootState) => state?.game?.isShowGameModel);
  const isFocused = useIsFocused();
  const siteConfig = useSelector(stationConfig);
  useFocusEffect(
    useCallback(() => {
      if (userInfo?.isLogin) {
        getStoreJson("lastGame").then((res: any) => {
          if (res?.gameId) {
            autoExchangeAccInfo(dispatch, res?.gameId)//自动转出
          }
        })

      }
      // 返回清理函数（组件卸载或失去焦点时执行）
      return () => { };
    }, []) // 依赖数组为空表示仅在焦点变化时执行
  );
  useEffect(() => {
    getSecondaryGames();

  }, []);


  useEffect(() => {
    if (searchText) {
      let list: any = [];
      allGames.map((item: any) => {
        item.map((gameItem: any) => {
          if (
            gameItem?.name?.toLowerCase().includes(searchText.toLowerCase())
          ) {
            list.push(gameItem);
          }
        });
      });
      let gameArr: any = chunkArray(list, 3);
      setGameList(gameArr);
    } else {
      setGameList(allGames);
    }
  }, [searchText]);

  const getSecondaryGames = async () => {

    if (id == "98" || id == "99") {
      if (id == "98") {
        toast.loading(true);
        getStoreJson("currenGameArr")
          .then(async (res: any) => {
            if (res?.length > 0) {
              await initFavoriteGames(res);
            } else {
              setGameList([]);
            }
          })
          .finally(() => {
            toast.loading(false);
            setIsListAwaiting(false);
          });
      } else if (id == "99") {
        getStoreJson("favoriteGames")
          .then(async (res: any) => {
            if (res?.length > 0) {
              await initFavoriteGames(res);
            } else {
              setGameList([]);
            }
          })
          .finally(() => {
            setIsListAwaiting(false);
          });
      }

    } else {
      await fetchPartnerList()
    }

  };
  const fetchPartnerList = async () => {
    if (!type) {
      setIsListAwaiting(false);
      return;
    }
    toast.loading(true);
    const response = await getPartnerListServer({
      gameType: type,
    }).finally(() => {
      toast.loading(false);
    });
    if (response?.data?.data) {
      const providers = response.data.data;
      if (providers.length > 0) {
        const isLottery = Number(type) === 8;
        if (isLottery && providers.length === 1) {
          setIsGroupMode(true);
          setGameProviders([]);
          const pid = String(providers[0].id);
          setSinglePartnerId(pid);
          setCurrentProviderId(providers[0].id);
          await applyLotteryGroupMode(pid);
          return;
        }
        setIsGroupMode(false);
        setSinglePartnerId(null);
        setGameGroups([]);
        setCurrentGroupCode("");
        setGameProviders(providers);
        const partnerId = providers[0]?.id;
        setCurrentProviderId(partnerId);
        await getGamesByProvider(partnerId);
      } else {
        setIsGroupMode(false);
        setSinglePartnerId(null);
        setGameGroups([]);
        setCurrentGroupCode("");
        const parms = {
          pageNo: 1,
          pageSize: 50,
          gameZoneId: id,
        };
        toast.loading(true);
        try {
          const res: any = await getSecondaryGamesServer(parms);
          if (res?.data?.data) {
            const { list } = res.data.data;
            if (list && list.length > 0) {
              await initFavoriteGames(list);
            } else {
              setGameList([]);
            }
          } else {
            setGameList([]);
          }
        } finally {
          toast.loading(false);
          setIsListAwaiting(false);
        }
      }
    } else {
      setIsGroupMode(false);
      setSinglePartnerId(null);
      setGameGroups([]);
      setCurrentGroupCode("");
      setGameList([]);
      setIsListAwaiting(false);
    }
  };

  const fetchGamesForLotteryGroup = async (
    groupCode: string,
    partnerId: string,
  ) => {
    const parms = {
      pageNo: 1,
      pageSize: 50,
      partnerId,
      gameType: String(type),
      groupCode,
    };
    setIsListAwaiting(true);
    toast.loading(true);
    try {
      const res = await getMissionGameList(parms);
      if (res?.data?.data) {
        const { list } = res.data.data;
        if (list && list.length > 0) {
          await initFavoriteGames(list);
        } else {
          setGameList([]);
          setAllGames([]);
        }
      } else {
        setGameList([]);
        setAllGames([]);
      }
    } finally {
      toast.loading(false);
      setIsListAwaiting(false);
    }
  };

  const applyLotteryGroupMode = async (partnerId: string) => {
    setIsListAwaiting(true);
    try {
      const res = await getGameGroupsServer({ silentErrorToast: true });
      const payload = res?.data;
      if (payload?.code === 0 && Array.isArray(payload.data)) {
        const groups = [...payload.data].sort(
          (a: { sort: number }, b: { sort: number }) => a.sort - b.sort,
        );
        setGameGroups(groups);
        if (groups.length > 0) {
          const first = groups[0].groupCode;
          setCurrentGroupCode(first);
          await fetchGamesForLotteryGroup(first, partnerId);
        } else {
          setCurrentGroupCode("");
          setGameList([]);
          setAllGames([]);
          setIsListAwaiting(false);
        }
      } else {
        setGameGroups([]);
        setCurrentGroupCode("");
        setGameList([]);
        setAllGames([]);
        setIsListAwaiting(false);
      }
    } catch {
      setGameGroups([]);
      setCurrentGroupCode("");
      setGameList([]);
      setAllGames([]);
      setIsListAwaiting(false);
    }
  };

  const getGamesByProvider = async (partnerId: string) => {
    const parms = {
      pageNo: 1,
      pageSize: 50,
      gameZoneId: type,
      partnerId: partnerId,
    };
    setIsListAwaiting(true);
    toast.loading(true);
    try {
      const res = await getMissionGameList(parms);
      if (res?.data?.data) {
        const { list } = res.data.data;
        if (list && list.length > 0) {
          await initFavoriteGames(list);
        } else {
          setGameList([]);
        }
      } else {
        setGameList([]);
      }
    } finally {
      toast.loading(false);
      setIsListAwaiting(false);
    }
  };
  // 初始化收藏游戏
  const initFavoriteGames = async (gameArr: any) => {
    let list = (await getStoreJson("favoriteGames")) || [];
    if (gameArr.length > 0) {
      gameArr.map((item: any) => {
        item.isSave = list.some((game: any) => game.name == item.name); //判断是否在收藏夹
      });
      let gamelist: any = chunkArray(gameArr, 3);
      setGameList(gamelist);
      setAllGames(gamelist);
    }
  };
  //将数组分割成指定大小的块
  const chunkArray = (arr: any, chunkSize = 3) => {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  };

  const toLogin = () => {
    navigation.push("login");
  };

  const toPlayGame = (gameItem: any) => {
    if (userInfo?.isLogin) {
      // 处理游戏跳转
      goToThreeGame(gameItem?.id, gameItem, dispatch, userInfo, toast, t, siteConfig?.isTestSite);
    } else {
      toLogin();
    }
  };
  const addFavoriteGames = async (item: any) => {
    let list = (await getStoreJson("favoriteGames")) || [];
    // 检查是否已经收藏
    let isExist = list.some((game: any) => game.name === item.name);
    if (!isExist) {
      item.czCode ||= gameType // 补充游戏类型代号
      await setStoreJson("favoriteGames", [...list, item]);
    } else {
      // 如果已经收藏，则从列表中移除
      list = list.filter((game: any) => game.name !== item.name);
      await setStoreJson("favoriteGames", list);
    }
  };

  const scrollTabWebTo = useCallback((left: number) => {
    const el = tabWebScrollRef.current as any;
    if (!el) return;
    el.scrollLeft = left;
  }, []);

  const handleTabBarViewportLayout = useCallback((e: LayoutChangeEvent) => {
    tabScrollViewportWRef.current = e.nativeEvent.layout.width;
  }, []);

  const scrollProviderTabIntoCenter = useCallback(
    (index: number) => {
      const n = gameProviders.length;
      if (n <= 0 || index < 0 || index >= n) return;

      const firstTabLeft = TAB_PADDING_LEFT + TAB_MARGIN_LEFT;
      const tabCenterX = firstTabLeft + index * TAB_STRIDE + TAB_CHIP_W / 2;
      const contentW = TAB_PADDING_LEFT + TAB_PADDING_RIGHT + n * TAB_STRIDE;

      const apply = () => {
        if (isPcWeb) {
          const el = tabWebScrollRef.current as any;
          if (!el) return;
          const vw =
            Number(el.clientWidth ?? 0) ||
            tabScrollViewportWRef.current ||
            windowWidth;
          const max = Math.max(
            0,
            Number(el.scrollWidth ?? 0) - vw,
          );
          const next = Math.max(
            0,
            Math.min(tabCenterX - vw / 2, max),
          );
          scrollTabWebTo(next);
          return;
        }
        const vw =
          tabScrollViewportWRef.current > 0
            ? tabScrollViewportWRef.current
            : windowWidth;
        const max = Math.max(0, contentW - vw);
        const next = Math.max(0, Math.min(tabCenterX - vw / 2, max));
        tabScrollViewRef.current?.scrollTo({ x: next, animated: true });
      };

      requestAnimationFrame(() => requestAnimationFrame(apply));
    },
    [
      gameProviders.length,
      isPcWeb,
      scrollTabWebTo,
      windowWidth,
    ],
  );

  /** PC Web：滚轮纵向增量映射为横向滚动（与 ActiveBlock 一致） */
  const handleTabWebWheelNative = useCallback(
    (event: any) => {
      if (!isPcWeb) return;
      const el = tabWebScrollRef.current as any;
      if (!el) return;
      const deltaX = Number(event?.deltaX ?? event?.nativeEvent?.deltaX ?? 0);
      const deltaY = Number(event?.deltaY ?? event?.nativeEvent?.deltaY ?? 0);
      const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      if (!delta) return;

      const max = Math.max(
        0,
        Number(el.scrollWidth ?? 0) - Number(el.clientWidth ?? 0),
      );
      const next = Math.max(
        0,
        Math.min(Number(el.scrollLeft ?? 0) + delta, max),
      );
      if (Math.abs(next - Number(el.scrollLeft ?? 0)) < 0.5) return;

      if (typeof event?.preventDefault === "function") event.preventDefault();
      scrollTabWebTo(next);
    },
    [isPcWeb, scrollTabWebTo],
  );

  const handleTabWebMouseDown = useCallback(
    (event: any) => {
      if (!isPcWeb) return;
      const el = tabWebScrollRef.current as any;
      if (!el) return;
      tabWebDragStateRef.current.dragging = true;
      tabWebDragStateRef.current.startClientX = Number(
        event?.clientX ?? event?.nativeEvent?.clientX ?? 0,
      );
      tabWebDragStateRef.current.startScrollLeft = Number(el.scrollLeft ?? 0);
    },
    [isPcWeb],
  );

  useEffect(() => {
    if (!(Platform.OS === "web" && isPcWeb)) return;
    const onMove = (e: MouseEvent) => {
      if (!tabWebDragStateRef.current.dragging) return;
      const el = tabWebScrollRef.current as any;
      if (!el) return;
      const clientX = Number(e?.clientX ?? 0);
      const dx = clientX - tabWebDragStateRef.current.startClientX;
      const max = Math.max(
        0,
        Number(el.scrollWidth ?? 0) - Number(el.clientWidth ?? 0),
      );
      const next = Math.max(
        0,
        Math.min(tabWebDragStateRef.current.startScrollLeft - dx, max),
      );
      scrollTabWebTo(next);
    };
    const onUp = () => {
      tabWebDragStateRef.current.dragging = false;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isPcWeb, scrollTabWebTo]);

  const renderProviderTabs = () =>
    gameProviders.map((item: any, index: number) => (
      <Pressable
        key={String(item?.id ?? index)}
        onPress={() => {
          setCurrentProviderId(item?.id);
          getGamesByProvider(item?.id);
          scrollProviderTabIntoCenter(index);
        }}
        className="flex justify-center items-center"
        style={{
          width: 64,
          height: 60,
          marginLeft: 10,
          borderRadius: 8,
          backgroundColor: Colors[theme].cardBg1,
          flexShrink: 0,
        }}
      >
        {currentProviderId == item?.id ? (
          <LinearGradient
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={{
              width: 64,
              height: 60,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            colors={[Colors[theme].gradient, Colors[theme].primary]}
          >
            <Image
              source={{ uri: item?.selectIcon }}
              style={{ width: 44, height: 26 }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 12,
                color: Colors[theme].text,
                width: 52,
                textAlign: "center",
              }}
            >
              {item?.name}
            </Text>
          </LinearGradient>
        ) : (
          <View className="flex justify-center items-center">
            <Image
              source={{ uri: item?.icon }}
              style={{ width: 44, height: 26 }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 12,
                color: Colors[theme].text,
                width: 52,
                textAlign: "center",
              }}
            >
              {item?.name}
            </Text>
          </View>
        )}
      </Pressable>
    ));

  const groupTabPadding = { paddingVertical: 10, paddingHorizontal: 14 };
  const groupTabMinH = 44;

  const renderGroupTabs = () =>
    gameGroups.map((g) => {
      const selected = currentGroupCode === g.groupCode;
      return (
        <Pressable
          key={g.groupCode}
          onPress={() => {
            setCurrentGroupCode(g.groupCode);
            if (singlePartnerId) {
              void fetchGamesForLotteryGroup(g.groupCode, singlePartnerId);
            }
          }}
          style={{
            marginLeft: 10,
            flexShrink: 0,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {selected ? (
            <LinearGradient
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={{
                minHeight: groupTabMinH,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 8,
                ...groupTabPadding,
              }}
              colors={[Colors[theme].gradient, Colors[theme].primary]}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: Colors[theme].text,
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                {g.groupName}
              </Text>
            </LinearGradient>
          ) : (
            <View
              style={{
                minHeight: groupTabMinH,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 8,
                backgroundColor: Colors[theme].cardBg1,
                ...groupTabPadding,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: Colors[theme].text,
                  textAlign: "center",
                }}
              >
                {g.groupName}
              </Text>
            </View>
          )}
        </Pressable>
      );
    });

  const showTabRow =
    gameProviders?.length > 0 || (isGroupMode && gameGroups.length > 0);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors[theme].background }}
    >
      <View className="flex-1">
        <SimpleHeader title={tabLabel} />
        <View className="px-3 my-2.5" style={{ height: 40 }}>
          <Input
            containerStyle={{ paddingHorizontal: 0 }}
            placeholder={t("home.searchGame")}
            value={searchText}
            style={styles.input}
            inputContainerStyle={[
              styles.searchInputContainer,
              {
                backgroundColor: Colors[theme].cardBg1,
                borderColor: Colors[theme].lightText,
              },
            ]}
            disabledInputStyle={{ backgroundColor: "red" }}
            inputStyle={{ paddingLeft: 4 }}
            onChangeText={(value) => {
              setSearchText(value);
            }}
            onFocus={() => {
              setSearchText("");
            }}
            leftIconContainerStyle={styles.iconStyle}
            leftIcon={<View style={{ width: 10, height: 20 }}></View>}
            errorStyle={{ height: 0 }}
            rightIconContainerStyle={[
              styles.iconStyle,
              { width: 40, marginLeft: 0 },
            ]}
            rightIcon={
              <Octicons
                name="search"
                size={20}
                color={Colors[theme].lightText}
              />
            }
          />
        </View>
        {showTabRow ? (
          <View>
            {isPcWeb ? (
              <WebDiv
                ref={tabWebScrollRef}
                className="hide-scrollbar"
                style={styles.tabWebScroller as any}
                onLayout={handleTabBarViewportLayout as any}
                onWheel={handleTabWebWheelNative as any}
                onMouseDown={handleTabWebMouseDown as any}
              >
                <View style={styles.tabWebInnerRow}>
                  {isGroupMode ? renderGroupTabs() : renderProviderTabs()}
                </View>
              </WebDiv>
            ) : (
              <ScrollView
                ref={tabScrollViewRef}
                horizontal
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator
                style={{ height: 60 }}
                onLayout={handleTabBarViewportLayout}
                contentContainerStyle={{
                  flexDirection: "row",
                  paddingRight: 12,
                  paddingLeft: 2,
                  alignItems: "center",
                }}
              >
                {isGroupMode ? renderGroupTabs() : renderProviderTabs()}
              </ScrollView>
            )}
          </View>
        ) : null}
        <View
          className="px-3 py-2.5"
          style={{
            height: screenHeigth - (showTabRow ? 166 : 110),
            paddingBottom: insets.bottom + 10,
          }}
        >
          {gameList?.length > 0 ? (
            <FlatList
              data={gameList}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              ListFooterComponent={() => <View style={{ height: 60 }} />}
              renderItem={({ item, index }) => {
                let gameArr: any = item;
                if (gameArr.length < 3) {
                  let arr = new Array(3 - gameArr.length).fill(0);
                  gameArr = gameArr.concat(arr);
                }

                return (
                  <View
                    className="flex-row justify-between"
                    key={index}
                    style={{
                      width: "100%",
                      aspectRatio: 1 / (cfg_global_switch?.tenantGameConfig?.showGameName ? SECONDARY_GAME_ROW_HEIGHT_RATIO : 0.4),
                      marginTop: 10,
                    }}
                  >

                    {gameArr?.length > 0 &&
                      gameArr.map((gameItem: any, gameIndex: number) => {
                        const img = gameItem?.icon ?? "";
                        const isShowGameName = (siteConfig?.isTestSite ? [2, 4, 8] : [4, 8]).includes(Number(gameItem?.gameType))
                        return (
                          <View
                            key={gameIndex}
                            className="flex-1"
                            style={{
                              marginLeft: gameIndex == 0 ? 0 : 10,
                              minHeight: 0,
                            }}
                          >
                            {gameItem ? (
                              <>
                                <TouchableOpacity
                                  onPress={() => {
                                    toPlayGame(gameItem);
                                  }}
                                  className="relative justify-center items-center"
                                  style={{
                                    borderRadius: 8,
                                    flex: 1,
                                    minHeight: 0,
                                    width: "100%",
                                    backgroundColor: Colors[theme].cardBg1,

                                  }}
                                >
                                  <ImageBackground
                                    source={require('@/assets/images/home/zhanwei.png')} // Local image
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode='contain'
                                  >
                                    <Image
                                      source={{ uri: img }}
                                      resizeMode="stretch"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: 8,
                                      }}
                                    />
                                  </ImageBackground>

                                  {/* 展示彩票名称 */
                                    isShowGameName && (
                                      <LinearGradient
                                        colors={["transparent", "rgba(0,0,0,0.82)"]}
                                        locations={[0, 1]}
                                        style={{
                                          position: "absolute",
                                          left: 0,
                                          right: 0,
                                          bottom: 0,
                                          width: "100%",
                                          minHeight: 52,
                                          paddingHorizontal: 6,
                                          paddingTop: 14,
                                          paddingBottom: 8,
                                          justifyContent: "flex-end",
                                          borderBottomLeftRadius: 8,
                                          borderBottomRightRadius: 8,
                                        }}
                                      >
                                        <Text
                                          numberOfLines={2}
                                          className="text-center font-semibold text-white text-xs leading-4"
                                        >
                                          {gameItem?.name}
                                        </Text>
                                      </LinearGradient>
                                    )}
                                </TouchableOpacity>
                                {cfg_global_switch?.tenantGameConfig?.showGameName && <Text
                                  className="text-center mt-1"
                                  numberOfLines={1}
                                  style={{ color: Colors[theme].text, fontSize: 12 }}>
                                  {gameItem.name}
                                </Text>
                                }
                                <View
                                  className="absolute w-[32px] h-[32px] top-0 right-0"
                                  onTouchStart={(e) => {
                                    e.stopPropagation(); // 阻止事件冒泡
                                  }}
                                >
                                  <TouchableOpacity
                                    className="flex-1 justify-center items-center"
                                    onPress={() => {
                                      gameItem.isSave = !gameItem.isSave;
                                      setGameList([...gameList]);
                                      addFavoriteGames(gameItem);
                                    }}
                                  >
                                    <Image
                                      source={gameItem?.isSave ? require('@/assets/images/home/star_active.png') : require('@/assets/images/home/star.png')}
                                      style={{ width: 24, height: 24 }}
                                      resizeMode="contain"
                                    />
                                  </TouchableOpacity>
                                </View>
                                {gameItem?.isRecommendation && (
                                  <View className="absolute top-0 left-0 pl-[2px]">
                                    <Image source={require('@/assets/images/home/game/hot1.gif')}
                                      style={{ width: 30, height: 30 }} resizeMode="contain" />
                                  </View>
                                )}
                              </>
                            ) : null}
                          </View>
                        );
                      })}
                  </View>
                );
              }}
            />
          ) : !isListAwaiting ? (
            <NoData style={{ marginTop: 150 }} />
          ) : null}
        </View>
        {isFocused && !isShowGameModel && <GameTipPopup />}
      </View>
    </SafeAreaView>
  );
};
export default SecondaryGames;

const styles = StyleSheet.create({
  /** PC Web：外层仅负责 overflow（与 ActiveBlock.webScroller 一致），内层横向排布 */
  tabWebScroller: {
    height: 60,
    paddingLeft: 2,
    paddingRight: 12,
    width: "100%",
    overflowX: "scroll",
    overflowY: "hidden",
    WebkitOverflowScrolling: "touch",
  } as any,
  tabWebInnerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    fontSize: 14,
    color: "#666",
    borderWidth: 0,
    minHeight: 32,
  },
  searchInputContainer: {
    borderWidth: 1,
    borderRadius: 30,
    paddingLeft: 10,
    borderEndWidth: 1,
    height: 38,
  },
  iconStyle: {
    height: 32,
  },
  item: {
    width: 100,
    borderRadius: 8,
  },
});
