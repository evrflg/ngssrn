import { useToast } from "@/components/common/toast";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { AppDispatch, RootState } from "@/store/store";
import { screen } from "@/utils/screen";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { GameTypeIcon } from "../type2/GameTypeIcon";
import { GameTypeIcon3 } from "./GameTypeIcon";
import { formatGameCardNameForWideScreen } from "../utils/formatGameName";
import { addFavoriteGames, goToThreeGame } from "../utils/util";
import { LinearGradient } from "expo-linear-gradient";
import { MAX_WIDTH } from "@/hooks/useMaxWidth";
import { BLOCK3_CARD_W as cardwidth } from "./layout";

/** type4 区块标题：有网络 icon 则显示，失败回退 GameTypeIcon（与 GameTab4 一致） */
const BlockHeaderGameTypeIcon = memo(function BlockHeaderGameTypeIcon({
  gameZone,
  currentId,
  iconUri,
}: {
  gameZone: any;
  currentId: any;
  iconUri?: string | null;
}) {
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [iconUri]);

  if (!iconUri || loadFailed) {
    return <GameTypeIcon type={gameZone} currentId={currentId} />;
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

/** type3/type5 区块标题：有网络 icon 则显示，失败回退 GameTypeIcon3（与 GameTab5 一致） */
const BlockHeaderGameTypeIcon3 = memo(function BlockHeaderGameTypeIcon3({
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

const GameCard3Item = memo(function GameCard3Item({
  item,
  photoHeight,
  showGameName,
  theme,
  isTestSite,
  starRightOffset,
  shouldLoad,
  onPress,
  onFavorite,
}: {
  item: any;
  photoHeight: number;
  showGameName: boolean;
  theme: string;
  isTestSite: boolean;
  starRightOffset: number;
  shouldLoad: boolean;
  onPress: () => void;
  onFavorite: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const cardNameText = formatGameCardNameForWideScreen(item?.name, Dimensions.get("window").width);
  const markLoaded = useCallback(() => setLoaded(true), []);

  return (
    <View style={{ width: cardwidth }}>
      <View style={{ width: cardwidth, height: photoHeight, borderRadius: 8, overflow: "hidden" }}>
        <TouchableOpacity
          style={{ width: cardwidth, height: photoHeight }}
          activeOpacity={0.85}
          onPress={onPress}
        >
          {shouldLoad && (
            <ExpoImage
              source={{ uri: item?.icon }}
              contentFit="cover"
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
        {!loaded && (
          <View
            style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors[theme]?.blockBg1, borderRadius: 8 }]}
            pointerEvents="none"
          />
        )}
        {item?.isRecommendation && (
          <View className="absolute top-0 left-0 pl-[2px]">
            <Image source={require("@/assets/images/home/game/hot1.gif")} style={{ width: 30, height: 30 }} resizeMode="contain" />
          </View>
        )}
        <View
          className="absolute w-[32px] h-[32px] top-0 right-0"
          style={starRightOffset ? { right: starRightOffset } : undefined}
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
        <Text
          style={[styles.font, { color: loaded ? Colors[theme].text : "transparent" }]}
          numberOfLines={1}
        >
          {item?.name}
        </Text>
      )}
    </View>
  );
});

/**
 * GameArea3 分区结构变化时调用——历史用于同步模块级 layOutObj，
 * 现 GameBlock3 已将测量委托给 GameArea3.handleAreaLayout，这里保留空实现以避免破坏调用方。
 * 后续可在 GameArea3 一并清理调用点后删除此 export。
 */
export function seedGameBlock3LayoutHeights(_provisional: Record<string, number>) {
  // intentionally no-op
}

export const GameBlock3 = ({ data, shouldLoad }: { data: any; shouldLoad?: boolean }) => {
  // FlatList ref 只存实例；宽度缓存单独存，避免互相覆盖导致 scrollToIndex 跳动
  const flatListRef = useRef<any>(null);
  const itemWidthMapRef = useRef<Record<number, number>>({});
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const cfg_global_switch: any = useSelector((state: RootState) => state?.user?.cfg_global_switch);
  const indexGame: any = useSelector((state: RootState) => state?.selfConfig?.indexGame);
  const currentTabId: any = useSelector((state: RootState) => state?.game?.currentTabId);
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const toast = useToast();
  const { gameItem, refreshData, gameZoneDict } = data;
  const [currentIndex, setCurrentIndex]: any = useState(0);
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const [tabLabel, setTabLabel] = useState("");
  const siteConfig = useSelector(stationConfig);
  const isPcWeb = Platform.OS === "web" && screen.get("window").width >= MAX_WIDTH;
  const pcH = isPcWeb ? 30 : 0;

  // GameBlock3 不再测量自身高度：
  // 历史曾在 root onLayout 里 +10 后写入 gameAreaHeight，与 GameArea3 wrapper.onLayout
  // 写入的 wrapper.height 互相覆盖，导致 GameTab 的 gameZoneOffsetMap 累计偏移 ~6 px/zone，
  // 点击未测量的远处 zone 时定位偏高。改为统一由 GameArea3 的 wrapper 测量作为单一来源。

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
      const maxIndex = Math.max(0, getGameListLength() - 4);
      if (maxIndex <= 0) return;
      const newIndex = Math.min(currentIndex + 1, maxIndex);
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true, viewPosition: 0 });
    }
  }, [currentIndex, getGameListLength]);

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
  const photoH = 116 + pcH;
  const canLoad = shouldLoad !== false;

  const renderItem = useCallback(({ item: rowItem, index }: { item: any; index: number }) => {
    return (
      <View
        style={{ width: cardwidth, marginHorizontal: 4 }}
        onLayout={({ nativeEvent }) => {
          const width = nativeEvent.layout.width + 8;
          itemWidthMapRef.current[index] = width;
        }}
      >
        {gameItem.rows === 1 ? (
          <GameCard3Item
            item={rowItem}
            photoHeight={photoH}
            showGameName={showGameName}
            theme={theme}
            isTestSite={Boolean(siteConfig?.isTestSite)}
            starRightOffset={isPcWeb ? 10 : 0}
            shouldLoad={canLoad}
            onPress={() => { userInfo?.isLogin ? goToGame(rowItem) : toLogin(); }}
            onFavorite={() => { addFavoriteGames(rowItem, refreshData); }}
          />
        ) : (
          rowItem?.map((it: any, i: number) => (
            <View key={i} style={{ marginTop: 14 }}>
              <GameCard3Item
                item={it}
                photoHeight={photoH}
                showGameName={showGameName}
                theme={theme}
                isTestSite={Boolean(siteConfig?.isTestSite)}
                starRightOffset={isPcWeb ? 10 : 0}
                shouldLoad={canLoad}
                onPress={() => { userInfo?.isLogin ? goToGame(it) : toLogin(); }}
                onFavorite={() => { addFavoriteGames(it, refreshData); }}
              />
            </View>
          ))
        )}
      </View>
    );
  }, [gameItem, photoH, showGameName, theme, siteConfig?.isTestSite, isPcWeb, canLoad, userInfo?.isLogin, goToGame, toLogin, refreshData]);

  return (
    <View key={gameItem.gameZone} className="mt-1">
      <View className="px-3 justify-between items-center flex-row" style={{ height: 30 }}>
        <View className="flex-row items-center">
          {(indexGame === 3 || indexGame === 5) && (
            <BlockHeaderGameTypeIcon3 gameZone={gameItem?.gameZone} iconUri={gameItem?.icon} />
          )}
          {indexGame === 4 && (
            <BlockHeaderGameTypeIcon
              gameZone={gameItem?.gameZone}
              currentId={currentTabId}
              iconUri={gameItem?.icon}
            />
          )}
          <Text
            className="font-medium"
            style={{
              color: Colors[theme].text,
              fontSize: 13,
              marginLeft: indexGame === 1 ? 0 : 5,
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
              backgroundColor:
                currentIndex === 0 ? Colors[theme].blockBg1 : Colors[theme].buttonBg3,
            }}
          >
            <TouchableOpacity
              onPress={() => { if (currentIndex > 0) toScroll("left"); }}
              className="flex-1 justify-center items-center"
            >
              <AntDesign
                name="left"
                size={12}
                color={currentIndex === 0 ? Colors[theme].lightText : Colors[theme].text}
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
              onPress={() => { if (currentIndex < getMaxIndex()) toScroll("right"); }}
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
                toSeeMore(String(gameType ?? ""), String(gameZoneId ?? ""), tabLabel);
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
      <View className="pb-2.5">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          className="hide-scrollbar"
          ref={flatListRef}
          style={{ paddingLeft: currentIndex === 0 ? 7 : 0, paddingRight: 5 }}
          data={gameItem.rows === 1 ? gameItem.gameList : gameItem.gameList2}
          keyExtractor={(item, index) => {
            return ((item.gameZone || "unknown") + index + item.id).toString();
          }}
          renderItem={renderItem}
          initialNumToRender={5}
          windowSize={5}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={({ index }) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 });
            }, 50);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    width: cardwidth,
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
