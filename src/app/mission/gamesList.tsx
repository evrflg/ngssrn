import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { HideScreenHeader } from "@/components/common/Header";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/common/toast";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { betRecordGetPartnerList, getMissionGameList } from "@/api";
import { View } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { missionTheme } from "@/components/active/components/activeConfg";
import NoData from "@/components/common/NoData";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { goToThreeGame } from "@/components/home/utils/util";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import ZhanweiIcon3 from "@/components/icons/active/ZhanweiIcon3";
import { beDealtTheme } from "@/components/active/activeConfg";

const PAGE_SIZE = 18;

const MissionGamesList = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch: AppDispatch = useDispatch();

  const toast = useToast();
  const { platformJson } = useLocalSearchParams();
  const background = useThemeColor({}, "background");
  const { theme } = useTheme();
  const userInfo: any = useSelector(
    (state: RootState) => state?.user?.userInfo
  );
  const [, setLoading] = useState(false);
  const [allProviders, setAllProviders] = useState<any>([]);
  const [currentProvider, setCurrentProvider] = useState<any>(undefined);
  const [pageNo, setPageNo] = useState(1);
  const [games, setGames] = useState<any[][]>([]);
  const [hasMore, setHasMore] = useState(true);

  const platformJsonCodes = useMemo(() => {
    try {
      if (!platformJson) return [];
      let platforms = [];
      if (typeof platformJson === "string") {
        platforms = JSON.parse(platformJson);
      } else {
        platforms = Array.isArray(platformJson) ? platformJson : [];
      }

      return platforms
        .map((item: any) => {
          if (typeof item === "object" && item !== null) {
            return String(item.id || item.code || item.value || "");
          }
          return String(item);
        })
        .filter((code: string) => !!code);
    } catch (error) {
      console.error("[GameList] Error parsing platformJson:", error);
      return [];
    }
  }, [platformJson]);

  const filteredProviders = useMemo(() => {
    if (platformJsonCodes.length === 0) return allProviders;
    return allProviders.filter((provider: any) => {
      const providerIdStr = String(provider.id);
      const providerCodeStr = provider.partnerCode
        ? String(provider.partnerCode)
        : null;
      return (
        platformJsonCodes.includes(providerIdStr) ||
        (providerCodeStr && platformJsonCodes.includes(providerCodeStr))
      );
    });
  }, [allProviders, platformJsonCodes]);

  const fetchAllProviders = useCallback(() => {
    setLoading(true);
    betRecordGetPartnerList({})
      .then(({ data: response }) => {
        if (response.data && Array.isArray(response.data)) {
          setAllProviders(response.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [platformJsonCodes]);

  const fetchGameList = () => {
    if (!currentProvider) return;
    setLoading(true);
    getMissionGameList({
      pageNo,
      pageSize: PAGE_SIZE,
      partnerId: currentProvider.id,
    })
      .then(({ data: response }) => {
        if (Array.isArray(response.data?.list)) {
          const newGames: any[][] = [];
          for (let i = 0; i < response.data.list.length; i += 3) {
            const chunk = response.data.list.slice(i, i + 3);
            newGames.push(
              chunk.map((game: any) => ({
                id: String(game.id),
                name: game.name,
                icon: game.icon,
                gameType: game.gameType || 0,
                isRecommendation: game.isRecommendation || false,
                sort: 0,
                isVisible: true,
              }))
            );
          }
          setGames((list) => {
            if (pageNo === 1) return newGames;
            list.push(...newGames);
            return list;
          });
          if (response.data.list.length < PAGE_SIZE) setHasMore(false);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toPlayGame = (gameItem: any) => {
    if (userInfo?.isLogin) {
      // 处理游戏跳转
      goToThreeGame(gameItem?.id, gameItem, dispatch, userInfo, toast, t);
    } else {
      navigation.push("login");
    }
  };

  const renderRow = ({
    item: games,
    index: rowIndex,
  }: {
    item: any[];
    index: number;
  }) => {
    if (games.length < 3) {
      for (let i = games.length; i < 3; i++) {
        games.push({});
      }
    }

    return (
      <View className="flex-row gap-2">
        {games.map((game: any, idx: number) => (
          <View key={game.id || `game-${rowIndex}-${idx}`} className="flex-1">
            {game.id && (
              <Pressable
                className="items-center flex-1"
                onPress={() => toPlayGame(game)}
              >
                {game.isVisible ? (
                  <Image
                    style={styles.gameImage}
                    source={{ uri: game.icon }}
                    resizeMode="contain"
                    onError={() => {
                      setGames((list) => {
                        list[rowIndex][idx].isVisible = false;
                        return list;
                      });
                    }}
                  />
                ) : (
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={["transparent", beDealtTheme[theme].line]}
                    style={{
                      borderRadius: 12,
                      height: 154,
                      justifyContent: "center",
                    }}
                  >
                    <ZhanweiIcon3 color={Colors[theme].primary} />
                  </LinearGradient>
                )}

                <Text
                  className={`text-${theme}-darkColor whitespace-nowrap`}
                  style={styles.gameName}
                >
                  {game.name}
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
    );
  };

  useEffect(() => {
    fetchGameList();
  }, [pageNo, currentProvider]);

  useEffect(() => {
    setCurrentProvider(filteredProviders[0]);
  }, [filteredProviders]);

  useEffect(() => {
    fetchAllProviders();
  }, []);

  return (
    <SafeAreaView style={{ backgroundColor: background }} className="flex-1">
      <HideScreenHeader title={t("active.center.promotion.ljdm")} />
      <View className="flex-1">
        {filteredProviders.length > 0 && (
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.providerTabs}
              contentContainerClassName="gap-3"
            >
              {filteredProviders.map((provider: any) => {
                const isActive = currentProvider?.id === provider.id;
                return (
                  <Pressable
                    key={provider.id}
                    className="items-center justify-center"
                    style={[
                      styles.providerTab,
                      { backgroundColor: Colors[theme].activeColor },
                    ]}
                    onPress={() => {
                      setCurrentProvider(provider);
                      setPageNo(1);
                      setHasMore(true);
                    }}
                  >
                    {isActive ? (
                      <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        colors={[
                          missionTheme[theme].activeProviderBg.s,
                          missionTheme[theme].activeProviderBg.e,
                        ]}
                        style={{ borderRadius: 8 }}
                      >
                        <Image
                          source={{
                            uri: isActive ? provider.selectIcon : provider.icon,
                          }}
                          style={{ height: 30, width: 55 }}
                          resizeMode="contain"
                        />
                        <Text
                          className={`text-${theme}-darkColor text-center`}
                          style={styles.providerName}
                        >
                          {provider.name}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View>
                        <Image
                          source={{
                            uri: isActive ? provider.selectIcon : provider.icon,
                          }}
                          style={{ height: 30, width: 55 }}
                          resizeMode="contain"
                        />
                        <Text
                          className={`text-${theme}-darkColor text-center`}
                          style={styles.providerName}
                        >
                          {provider.name}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
        <View className="px-3 pb-3 flex-1">
          {games.length > 0 ? (
            <FlatList
              contentContainerClassName="gap-2"
              keyExtractor={(_, idx) => `game-row-${idx + 1}`}
              data={games}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              className="hide-scrollbar"
              onEndReached={() => {
                if (hasMore) setPageNo(pageNo + 1);
              }}
              renderItem={renderRow}
            />
          ) : (
            <NoData />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  providerTabs: {
    paddingHorizontal: 16,
    marginVertical: 15,
    gap: 10,
  },
  providerTab: {
    padding: 2,
    cursor: "pointer",
    borderRadius: 8,
  },
  providerName: {
    fontSize: 12,
    marginVertical: 2,
  },
  gameImage: {
    borderRadius: 12,
    height: 154,
    width: "100%",
  },
  gameName: {
    paddingHorizontal: 5,
    paddingTop: 4,
    textAlign: "center",
    justifyContent: "center",
    fontSize: 12,
    textOverflow: "ellipsis",
    overflow: "hidden",
    fontFamily: "ui-monospace",
  },
});
export default MissionGamesList;
