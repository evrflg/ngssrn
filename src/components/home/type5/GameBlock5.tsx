import { useToast } from "@/components/common/toast";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { AppDispatch, RootState } from "@/store/store";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { fontTitleSize } from "../utils/const";
import { stationConfig } from '@/store/tenant/tenantSlice';
import { Image as ExpoImage } from 'expo-image';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { GameTypeIcon3 } from "../type3/GameTypeIcon";
import { formatGameCardNameForWideScreen } from "../utils/formatGameName";
import { addFavoriteGames, goToThreeGame } from "../utils/util";
import { LinearGradient } from "expo-linear-gradient";
import {
  BLOCK5_CARD_W as cardwidth,
  BLOCK5_COVER_ASPECT_RATIO as GAME_CARD_COVER_ASPECT_RATIO,
} from "./layout";

const screenWidth = Dimensions.get("window").width;

const GameCard5Item = memo(function GameCard5Item({
  item,
  showGameName,
  theme,
  isTestSite,
  shouldLoad,
  onPress,
  onFavorite,
}: {
  item: any;
  showGameName: boolean;
  theme: string;
  isTestSite: boolean;
  shouldLoad: boolean;
  onPress: () => void;
  onFavorite: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const cardNameText = formatGameCardNameForWideScreen(item?.name, screenWidth);
  const markLoaded = useCallback(() => setLoaded(true), []);

  return (
    <View style={styles.item}>
      <View style={styles.background}>
        <TouchableOpacity style={styles.coverTouchable} activeOpacity={0.85} onPress={onPress}>
          {shouldLoad && (
            <ExpoImage
              source={{ uri: item?.icon }}
              contentFit="fill"
              transition={0}
              style={{ width: "100%", height: "100%", borderRadius: 8 }}
              onLoad={markLoaded}
              onError={markLoaded}
            />
          )}
          {loaded && (isTestSite ? [2, 4, 8] : [4, 8]).includes(item?.gameType) && (
            <View className="absolute bottom-0 left-0 right-0 rounded-b-lg overflow-hidden">
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]}>
                <Text numberOfLines={2} className="text-center font-semibold text-white text-xs leading-4 my-2">
                  {cardNameText}
                </Text>
              </LinearGradient>
            </View>
          )}
        </TouchableOpacity>
        {/* 骨架屏覆盖图片，pointerEvents=none 不阻止触摸 */}
        {!loaded && (
          <View
            style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors[theme]?.blockBg1, borderRadius: 8 }]}
            pointerEvents="none"
          />
        )}
        {item?.isRecommendation && (
          <View className="absolute top-0 left-0 pl-[6px]">
            <Image source={require("@/assets/images/home/game/hot1.gif")} style={{ width: 30, height: 30 }} resizeMode="contain" />
          </View>
        )}
        <View
          className="absolute w-[32px] h-[32px] top-0 right-0"
          onTouchStart={(e) => { e.stopPropagation(); }}
        >
          <TouchableOpacity className="flex-1 justify-center items-center" onPress={onFavorite}>
            <Image
              source={item?.isSave ? require("@/assets/images/home/star_active.png") : require("@/assets/images/home/star.png")}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
      {showGameName && (
        <Text style={[styles.font, { color: loaded ? Colors[theme].text : "transparent" }]} numberOfLines={1}>
          {item?.name}
        </Text>
      )}
    </View>
  );
});
/** 与 GameTab5 一致：有网络 icon 则显示，加载失败回退 GameTypeIcon3 */
const BlockHeaderZoneIcon = memo(function BlockHeaderZoneIcon({
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

export const GameBlock5 = ({ data, shouldLoad }: { data: any; shouldLoad?: boolean }) => {
  // FlatList ref 只存实例；宽度缓存单独存，避免互相覆盖导致 scrollToIndex 跳动
  const flatListRef = useRef<any>(null);
  const itemWidthMapRef = useRef<Record<number, number>>({});
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const cfg_global_switch: any = useSelector((state: RootState) => state?.user?.cfg_global_switch);
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const toast = useToast();
  const { gameItem, refreshData, gameZoneDict, onAreaLayout } = data;
  const [currentIndex, setCurrentIndex]: any = useState(0);
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const [tabLabel, setTabLabel] = useState('');
  const siteConfig = useSelector(stationConfig);

  useEffect(() => {
    if (gameItem && gameZoneDict?.length) {
      let tab = gameZoneDict.find(
        (item: any) => String(item.value) === String(gameItem?.gameZone || ""),
      );
      setTabLabel(tab?.label || gameItem?.customName || "");
    }
  }, [gameItem, gameZoneDict]);

  const toLogin = useCallback(() => {
    navigation.push("login");
  }, [navigation]);

  const getGameListLength = useCallback(() => {
    return gameItem.rows === 1 ? gameItem?.gameList?.length || 0 : gameItem?.gameList2?.length || 0;
  }, [gameItem]);

  const getMaxIndex = useCallback(() => Math.max(0, getGameListLength() - 4), [getGameListLength]);

  const toScroll = useCallback((direction: string) => {
    if (direction === "left" && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true, viewPosition: 0 });
    } else if (direction === "right") {
      const maxIndex = getMaxIndex();
      if (maxIndex <= 0) return;
      const newIndex = Math.min(currentIndex + 1, maxIndex);
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true, viewPosition: 0 });
    }
  }, [currentIndex, getMaxIndex]);

  const getItemLayout = useCallback((_: any, index: any) => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += itemWidthMapRef.current[i] || 0;
    }
    return { length: itemWidthMapRef.current[index] || 0, offset, index };
  }, []);

  const goToGame = useCallback((item: any) => {
    const isTestEev = siteConfig?.isTestSite;
    goToThreeGame(item?.id, item, dispatch, userInfo, toast, t, isTestEev);
  }, [siteConfig?.isTestSite, dispatch, userInfo, toast, t]);

  const toSeeMore = useCallback((gameType: string, gameZoneId: string, label: string) => {
    navigation.push("secondary-games/index", { type: gameType, id: gameZoneId, tabLabel: label });
  }, [navigation]);

  const showGameName = Boolean(cfg_global_switch?.tenantGameConfig?.showGameName);
  const canLoad = shouldLoad !== false;

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    return (
      <View
        style={{ width: cardwidth, marginHorizontal: 4 }}
        onLayout={({ nativeEvent }) => {
          itemWidthMapRef.current[index] = nativeEvent.layout.width + 8;
        }}
      >
        {gameItem.rows === 1 ? (
          <GameCard5Item
            item={item}
            showGameName={showGameName}
            theme={theme}
            isTestSite={Boolean(siteConfig?.isTestSite)}
            shouldLoad={canLoad}
            onPress={() => { userInfo?.isLogin ? goToGame(item) : toLogin(); }}
            onFavorite={() => { addFavoriteGames(item, refreshData); }}
          />
        ) : (
          item?.map((it: any, i: number) => (
            <View key={i} style={i === 1 ? { marginTop: 12 } : undefined}>
              <GameCard5Item
                item={it}
                showGameName={showGameName}
                theme={theme}
                isTestSite={Boolean(siteConfig?.isTestSite)}
                shouldLoad={canLoad}
                onPress={() => { userInfo?.isLogin ? goToGame(it) : toLogin(); }}
                onFavorite={() => { addFavoriteGames(it, refreshData); }}
              />
            </View>
          ))
        )}
      </View>
    );
  }, [gameItem, showGameName, theme, siteConfig?.isTestSite, canLoad, userInfo?.isLogin, goToGame, toLogin, refreshData]);

  return (
    <View
      onLayout={(e: any) => {
        const layout = e?.nativeEvent?.layout;
        // 不写 layout.y：相对父级常为 0，会污染 Redux 的 gameAreaOffsetMap（应用 measureLayout 的 y）
        onAreaLayout?.(gameItem?.gameZone, undefined, layout?.height);
      }}
      key={gameItem.gameZone}
      style={{
        marginTop: 4,
        marginBottom: 10,
        borderRadius: 12,
        // 勿 hidden：会裁掉底部游戏列表区 LinearGradient 的阴影
        overflow: "visible",
        backgroundColor: Colors[theme].background,
        shadowColor: Colors[theme].shadowColor,
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      <View style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: "hidden" }}>
        <LinearGradient
          colors={["#f7a01d", "#fff3ae", "#ffe44d", "#fffec9", "#ffe44d", "#fff3ae", "#f7a01d"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: "100%",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            paddingTop: 3,

          }}
        >
          {Colors[theme].gameListTopBgGradient ? (
            <LinearGradient
              colors={Colors[theme].gameListTopBgGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                width: "100%",
                height: 40,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <BlockHeaderZoneIcon gameZone={gameItem?.gameZone} iconUri={gameItem?.icon} />
                <Text
                  style={{
                    color: Colors[theme].text,
                    fontSize: fontTitleSize,
                    marginLeft: 6,
                    fontWeight: "800",
                  }}
                >
                  {tabLabel}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: 30,
                }}
              >
                {/* 左箭頭按鈕 */}
                <View
                  style={{
                    height: 24,
                    width: 24,
                    marginLeft: 10,
                    borderRadius: 6,
                    backgroundColor:
                      currentIndex === 0 ? Colors[theme].blockBg1 : Colors[theme].buttonBg3,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      toScroll("left");
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <AntDesign
                      name="left"
                      size={12}
                      color={currentIndex === 0 ? Colors[theme].lightText : Colors[theme].text}
                    />
                  </TouchableOpacity>
                </View>

                {/* 右箭頭按鈕 */}
                <View
                  style={{
                    height: 24,
                    width: 24,
                    marginLeft: 5,
                    borderRadius: 6,
                    backgroundColor:
                      currentIndex >= Math.max(0, getGameListLength() - 4)
                        ? Colors[theme].blockBg1
                        : Colors[theme].buttonBg3,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      if (currentIndex < Math.max(0, getGameListLength() - 4)) {
                        toScroll("right");
                      }
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <AntDesign
                      name="right"
                      size={12}
                      color={
                        currentIndex >= Math.max(0, getGameListLength() - 4)
                          ? Colors[theme].lightText
                          : Colors[theme].text
                      }
                    />
                  </TouchableOpacity>
                </View>

                {/* 更多按鈕區塊 */}
                <View
                  style={{
                    height: 24,
                    marginLeft: 8,
                    paddingHorizontal: 10,
                    borderRadius: 6,
                    backgroundColor: Colors[theme].buttonBg3,
                    justifyContent: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      const gameType = gameItem?._partnerGameType
                        ? String(gameItem._partnerGameType)
                        : gameItem?.gameZone ? String(gameItem.gameZone) : "";
                      const gameZoneId = gameItem?._partnerId
                        ? String(gameItem._partnerId)
                        : gameItem?.id ? String(gameItem.id) : "";
                      toSeeMore(gameType, gameZoneId, tabLabel);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: Colors[theme].text,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {t("common.more")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          ) : (
            <View
              style={{
                width: "100%",
                height: 40,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: Colors[theme].gameListTopBg,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <BlockHeaderZoneIcon gameZone={gameItem?.gameZone} iconUri={gameItem?.icon} />
                <Text
                  style={{
                    color: Colors[theme].text,
                    fontSize: fontTitleSize,
                    marginLeft: 6,
                    fontWeight: "800",
                  }}
                >
                  {tabLabel}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: 30,
                }}
              >
                {/* 左箭頭按鈕 */}
                <View
                  style={{
                    height: 24,
                    width: 24,
                    marginLeft: 10,
                    borderRadius: 6,
                    backgroundColor:
                      currentIndex === 0 ? Colors[theme].blockBg1 : Colors[theme].buttonBg3,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      if (currentIndex > 0) toScroll("left");
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <AntDesign
                      name="left"
                      size={12}
                      color={currentIndex === 0 ? Colors[theme].lightText : Colors[theme].text}
                    />
                  </TouchableOpacity>
                </View>

                {/* 右箭頭按鈕 */}
                <View
                  style={{
                    height: 24,
                    width: 24,
                    marginLeft: 5,
                    borderRadius: 6,
                    backgroundColor:
                      currentIndex >= getMaxIndex()
                        ? Colors[theme].blockBg1
                        : Colors[theme].buttonBg3,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      if (currentIndex < getMaxIndex()) toScroll("right");
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
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

                {/* 更多按鈕區塊 */}
                <View
                  style={{
                    height: 24,
                    marginLeft: 8,
                    paddingHorizontal: 10,
                    borderRadius: 6,
                    backgroundColor: Colors[theme].buttonBg3,
                    justifyContent: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      const gameType = gameItem?._partnerGameType
                        ? String(gameItem._partnerGameType)
                        : gameItem?.gameZone ? String(gameItem.gameZone) : "";
                      const gameZoneId = gameItem?._partnerId
                        ? String(gameItem._partnerId)
                        : gameItem?.id ? String(gameItem.id) : "";
                      toSeeMore(gameType, gameZoneId, tabLabel);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: Colors[theme].text,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {t("common.more")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>

      <View
        style={{
          height: 24,
          backgroundColor: Colors[theme].gameListTopBottomBg,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
            },
            android: {
              elevation: 6,
            },
            default: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
            },
          }),
        }}
      />

      {/* 游戏列表区 */}
      <LinearGradient
        colors={[Colors[theme].gameListAreaGradientStart, Colors[theme].gameListAreaGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          marginTop: -10,
          marginHorizontal: 12,
          paddingTop: 10,
          paddingBottom: 10,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: Colors[theme].gameListBorderIntervalBg,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
            },
            android: {
              elevation: 6,
            },
            default: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
            },
          }),
        }}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          className="hide-scrollbar"
          ref={flatListRef}
          style={{
            paddingLeft: currentIndex === 0 ? 7 : 0,
            paddingRight: 5,
          }}
          data={gameItem.rows === 1 ? gameItem.gameList : gameItem.gameList2}
          keyExtractor={(item, index) => {
            return ((item.gameZone || "unknown") + index + item.id).toString();
          }}
          renderItem={renderItem}
          initialNumToRender={5}
          windowSize={5}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={({ index }) => {
            // 首次测量未完成时避免跳动，稍后重试
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 });
            }, 50);
          }}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    width: cardwidth,
    justifyContent: "space-between",
  },
  coverTouchable: {
    width: "100%",
    aspectRatio: GAME_CARD_COVER_ASPECT_RATIO,
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
