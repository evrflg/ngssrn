import { useToast } from "@/components/common/toast";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { changeGameAreaHeight } from "@/store/game/gameSlice";
import { AppDispatch, RootState } from "@/store/store";
import { screen } from "@/utils/screen";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { GameTypeIcon } from "../type2/GameTypeIcon";
import { GameTypeIcon3 } from "../type3/GameTypeIcon";
import { formatGameCardNameForWideScreen } from "../utils/formatGameName";
import { addFavoriteGames, goToThreeGame } from "../utils/util";
import { LinearGradient } from "expo-linear-gradient";
import ImageFitWidth from "@/components/home/components/ImageFitWidth";
import { stationConfig } from '@/store/tenant/tenantSlice';
const cardwidth =
  Math.ceil(screen.get("window").width > 600 ? 118 : (screen.get("window").width - 30) / 3) - 3;
let layOutObj: any = {};

const GameBlockComponent = ({ data }: any) => {
  const flatListRef: any = useRef({});
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const cfg_global_switch: any = useSelector((state: RootState) => state?.user?.cfg_global_switch);
  const indexGame: any = useSelector((state: RootState) => state?.selfConfig?.indexGame);
  const currentTabId: any = useSelector((state: RootState) => state?.game?.currentTabId);
  const { theme } = useTheme(); //主题
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const toast = useToast();
  const { gameItem, refreshData, gameZoneDict } = data;
  const [currentIndex, setCurrentIndex]: any = useState(0);
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const [tabLabel, setTabLabel] = useState("");
  const siteConfig = useSelector(stationConfig);
  const handleLayout = useCallback(
    (item: any, event: any) => {
      const { height } = event.nativeEvent.layout;
      layOutObj[item?.gameZone] = Math.floor(height) + 10;
      setTimeout(() => {
        dispatch(changeGameAreaHeight(layOutObj));
      }, 0);
    },
    [dispatch],
  );

  useEffect(() => {
    if (gameItem && gameZoneDict?.length) {
      let tab = gameZoneDict.find(
        (item: any) => String(item.value) === String(gameItem?.gameZone || ""),
      );
      setTabLabel(tab?.label || gameItem?.customName || "");
    }
  }, [gameItem, gameZoneDict]);

  //登录
  const toLogin = useCallback(() => {
    navigation.push("login");
  }, [navigation]);

  //滚动
  const handleScrollToIndex = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({
      index: index,
      animated: true,
      viewPosition: 0.5,
    });
  }, []);

  const getGameListLength = useCallback(() => {
    return gameItem.rows == 1 ? gameItem?.gameList?.length || 0 : gameItem?.gameList2?.length || 0;
  }, [gameItem]);

  // 当前布局一屏大约可见 3 张；maxIndex 表示“最后一屏的起始 index”
  const getMaxIndex = useCallback(() => {
    const length = getGameListLength();
    return Math.max(0, length - 3);
  }, [getGameListLength]);

  //分页
  const toScroll = useCallback(
    (direction: string) => {
      if (direction == "left" && currentIndex > 0) {
        const newIndex = Math.max(0, currentIndex - 1);
        setCurrentIndex(newIndex);
        handleScrollToIndex(newIndex);
      } else if (direction == "right") {
        const maxIndex = getMaxIndex();
        if (maxIndex <= 0) return;
        const newIndex = Math.min(currentIndex + 1, maxIndex);
        setCurrentIndex(newIndex);
        handleScrollToIndex(newIndex);
      }
    },
    [currentIndex, getMaxIndex, handleScrollToIndex],
  );

  // 动态计算布局
  const getItemLayout = (_: any, index: any) => {
    let offset = 0;
    for (let i = 0; i < index + 1; i++) {
      offset += flatListRef.current[i] || 0; // 默认高度处理
    }
    return {
      length: flatListRef.current[index] || 0,
      offset,
      index,
    };
  };

  const goToGame = useCallback(
    (item: any) => {
      const isTestEev = siteConfig?.isTestSite
      //直接跳转
      goToThreeGame(item?.id, item, dispatch, userInfo, toast, t,isTestEev);
    },
    [dispatch, navigation, toast, t],
  );

  const toSeeMore = useCallback(
    (gameType: string, gameZoneId: string, tabLabel: string) => {
      navigation.push("secondary-games/index", {
        type: gameType,
        id: gameZoneId,
        tabLabel: tabLabel,
      });
    },
    [userInfo?.isLogin, navigation, toLogin],
  );

  const gameCard = useCallback(
    (item: any, index: number) => {
      const cardNameText = formatGameCardNameForWideScreen(
        item?.name,
        Dimensions.get("window").width,
      );
      return (
        <View style={[styles.item]}>
          <View style={styles.background}>
            <TouchableOpacity
              style={{ width: cardwidth }}
              onPress={() => {
                if (userInfo?.isLogin) {
                  goToGame(item);
                } else {
                  toLogin();
                }
              }}
            >
              <ImageFitWidth
                width={cardwidth}
                uri={typeof item?.icon === "string" ? item.icon : ""}
                // resizeMode=""
                imageStyle={{ borderRadius: 8 }}
              />
              {/* 展示彩票/体育名称 */}
              {(siteConfig?.isTestSite?[2,4,8]:[4,8]).includes(item?.gameType) && (
                <View className="absolute bottom-0 left-0 right-0 rounded-b-lg overflow-hidden">
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]}>
                    <Text
                      numberOfLines={2}
                      className="text-center font-semibold text-white text-xs leading-4 my-2"
                    >
                      {cardNameText}
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </TouchableOpacity>

            <View
              className="absolute w-[32px] h-[32px] top-0 right-0"
              onTouchStart={(e) => {
                e.stopPropagation(); // 阻止事件冒泡
              }}
            >
              <TouchableOpacity
                className="flex-1 justify-center items-center"
                onPress={() => {
                  addFavoriteGames(item, refreshData); // 添加到收藏夹
                  // 刷新数据
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
          </View>
          {cfg_global_switch?.tenantGameConfig?.showGameName && (
            <Text style={[styles.font, { color: Colors[theme].text }]} numberOfLines={1}>
              {item?.name}
            </Text>
          )}
        </View>
      );
    },
    [userInfo?.isLogin, goToGame, toLogin, refreshData, theme],
  );

  return (
    <View
      onLayout={(e: any) => handleLayout(gameItem, e)}
      key={gameItem.gameZone}
      className="mt-2.5"
    >
      <View className="px-3 justify-between items-center flex-row" style={{ height: 30 }}>
        <View className="flex-row items-center">
          {(indexGame == 3 || indexGame == 5) && <GameTypeIcon3 type={gameItem?.gameZone} />}
          {indexGame == 4 && <GameTypeIcon type={gameItem?.gameZone} currentId={currentTabId} />}
          <Text
            className="font-medium"
            style={{
              color: Colors[theme].text,
              fontSize: 13,
              marginLeft: indexGame == 1 ? 0 : 5,
            }}
          >
            {tabLabel}
          </Text>
        </View>
        <View className="justify-right items-center flex-row" style={{ height: 30 }}>
          <View
            className="ml-2.5 rounded-md"
            style={{
              height: 30,
              width: 30,
              backgroundColor: currentIndex == 0 ? Colors[theme].blockBg1 : Colors[theme].buttonBg3,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (currentIndex > 0) toScroll("left");
              }}
              className="flex-1 justify-center items-center"
            >
              <AntDesign
                name="left"
                size={12}
                color={currentIndex == 0 ? Colors[theme].lightText : Colors[theme].text}
              />
            </TouchableOpacity>
          </View>
          <View
            className="rounded-md"
            style={{
              height: 30,
              width: 30,
              marginLeft: 5,
              backgroundColor:
                currentIndex >= getMaxIndex()
                  ? Colors[theme].blockBg1
                  : Colors[theme].buttonBg3,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (currentIndex < getMaxIndex()) toScroll("right");
              }}
              className="flex-1 justify-center items-center"
            >
              <AntDesign
                name="right"
                size={12}
                color={
                  currentIndex >= getMaxIndex()
                    ? Colors[theme].lightText
                    : Colors[theme].text
                }
              />
            </TouchableOpacity>
          </View>
          <View
            className="rounded-md ml-2"
            style={{
              height: 30,
              paddingHorizontal: 10,
              backgroundColor: Colors[theme].buttonBg3,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                const gameType = gameItem?._partnerGameType ?? gameItem?.gameZone;
                const gameZoneId = gameItem?._partnerId ?? gameItem?.id;
                toSeeMore(gameType, gameZoneId, tabLabel);
              }}
              className="flex-1 justify-center items-center flex-row"
            >
              <Text className="font-medium" style={{ color: Colors[theme].text, fontSize: 12 }}>
                {t("common.more")}
              </Text>
              <AntDesign name="right" size={12} className="ml-2.5" color={Colors[theme].text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          className="hide-scrollbar"
          ref={flatListRef}
          style={{ paddingLeft: currentIndex == 0 ? 7 : 0, paddingRight: 5 }}
          data={gameItem.rows == 1 ? gameItem.gameList : gameItem.gameList2}
          keyExtractor={(item, index) => {
            if (gameItem.rows == 1) {
              return `${item.id || item.name || "item"}-${index}`;
            }
            return `row-${index}`;
          }}
          renderItem={({ item, index }) => {
            return (
              <View
                style={{ width: cardwidth, marginHorizontal: 4 }}
                onLayout={({ nativeEvent }) => {
                  const width = nativeEvent.layout.width + 8;
                  flatListRef.current[index] = width;
                }}
              >
                {gameItem.rows == 1 ? (
                  <View style={{ marginTop: 10 }}>{gameCard(item, index)}</View>
                ) : (
                  item?.map((it: any, i: number) => {
                    return (
                      <View key={it.id || i} style={{ marginTop: 10 }}>
                        {gameCard(it, i)}
                      </View>
                    );
                  })
                )}
              </View>
            );
          }}
          initialNumToRender={3} // 减少初始渲染数量
          maxToRenderPerBatch={3} // 每批渲染数量
          windowSize={3} // 减少渲染窗口大小
          removeClippedSubviews={true} // 移除屏幕外的视图
          updateCellsBatchingPeriod={50} // 批量更新周期
          getItemLayout={getItemLayout} // 固定高度优化
        />
      </View>
    </View>
  );
};

// 使用 React.memo 优化，避免不必要的重新渲染
export const GameBlock = memo(GameBlockComponent);

const styles = StyleSheet.create({
  item: {
    width: cardwidth, // 固定宽度（必填）
    justifyContent: "space-between",
  },
  background: {
    width: cardwidth,
    borderRadius: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  font: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
  },
});
