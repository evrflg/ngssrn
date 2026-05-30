import {
  StyleSheet,
  Image,
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setActiveTitle } from "@/store/active/activeSlice";
import { AppDispatch } from "@/store/store";
import { LinearGradient } from "expo-linear-gradient";
import { IndexHeader } from "../home/IndexHeader";
import AutoImage from "@/components/common/AutoImage";
import { useToast } from "@/components/common/toast";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { activeTheme } from "@/components/active/components/activeConfg";
import NoData from "@/components/common/NoData";
import { Colors } from "@/constants/Colors";
import { RootState } from "@/store/store";
import { selectBottomNavigationType } from "@/store/user/selfConfig";
import { useTranslation } from "react-i18next";
import ActivityCenterScrollableNavbar from "./components/ActivityCenterScrollableNavbar";
import { getScrollBottomSpacer } from "@/config/layout/scrollBottomSpacer";
import { MAX_WIDTH, useMaxWidth } from "@/hooks/useMaxWidth";
import { activeIntroduction } from "@/components/active/activeConfg";
import { changeIsShowTestUserPopup } from "@/store/user/userSlice";

type CardListViewProps = {
  image: any;
  text: string;
  id: number;
  type: number;
  introduction: string;
  mysteryBonusData?: any;
  memberDayRules?: any;
  // 样式参数（从父组件传入避免在组件内重复读取）
  cardBg1: string;
  maxWidth: number;
  isWideScreen: boolean;
  theme: string;
  onPress: (item: {
    id: number;
    type: number;
    text: string;
    mysteryBonusData?: any;
    memberDayRules?: any;
  }) => void;
};

type ActiveBannerViewProps = {
  theme: string;
  isWideScreen: boolean;
};

// 移到组件外部，避免每次 Index 重渲染时 React 视其为新类型导致 unmount/remount
const ActiveBannerView = ({ theme, isWideScreen }: ActiveBannerViewProps) => {
  const { t } = useTranslation();
  return (
    <>
      <LinearGradient
        style={styles.midContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={[activeTheme[theme].banner.s, activeTheme[theme].banner.e]}
      >
        <View style={styles.textArea}>
          <Text
            style={[
              styles.bannerTitle,
              { color: Colors[theme].primary, fontSize: isWideScreen ? 22 : 18 },
            ]}
            numberOfLines={0}
          >
            {t("pageName.activity")}
          </Text>
          <Text
            style={[
              styles.bannerContent,
              { color: Colors[theme].text, fontSize: isWideScreen ? 16 : 12 },
            ]}
            numberOfLines={0}
          >
            {t("active.cyhuodong")}
          </Text>
        </View>
      </LinearGradient>
    </>
  );
};

const CardListView = ({
  image,
  text,
  id,
  type,
  introduction,
  mysteryBonusData,
  memberDayRules,
  cardBg1,
  maxWidth,
  isWideScreen,
  theme,
  onPress,
}: CardListViewProps) => {
  return (
    <Pressable
      style={[styles.cardContainer, { backgroundColor: cardBg1 }]}
      onPress={() => onPress({ id, type, text, mysteryBonusData, memberDayRules })}
    >
      <View style={[styles.cardImageContainer, { height: maxWidth * (182 / 406) }]}>
        <AutoImage
          uri={image}
          imageStyle={styles.cardBackground}
          errorImgUri="none"
          resizeMode="cover"
          defaultIsSvg={true}
        />
        <Text
          className="mx-3.5"
          style={{
            position: "absolute",
            top: isWideScreen ? 20 : 16,
            left: isWideScreen ? 12 : 8,
            fontSize: isWideScreen ? 18 : 13,
            lineHeight: isWideScreen ? 28 : 22,
            fontWeight: 600,
            color: "#ffffff",
            textShadowColor: "rgba(0, 0, 0, 0.5)",
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}
          numberOfLines={6}
          ellipsizeMode="tail"
        >
          {activeIntroduction(introduction)}
        </Text>
        <View
          style={[
            styles.cardTitleOverlay,
            {
              backgroundColor: image
                ? Colors[theme].activeCardTitleTextColor
                : Colors[theme].blockBg2,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-[13] font-medium"
            style={{ color: Colors[theme].text, fontSize: isWideScreen ? 20 : 14 }}
          >
            {text}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export const Index = () => {
  const cardBg1 = useThemeColor({}, "cardBg1");
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const { width: windowWidth } = useWindowDimensions();
  const { maxWidth } = useMaxWidth();
  const isWideScreen = windowWidth > MAX_WIDTH;
  const dispatch: AppDispatch = useDispatch();
  const activityList = useSelector((state: RootState) => state?.active?.activityList);
  const bottomNavType = useSelector(selectBottomNavigationType);
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const cardList = useMemo(() => (Array.isArray(activityList) ? activityList : []), [activityList]);
  const isLoading = activityList === null;

  const userIsLoginRef = useRef(userInfo?.isLogin);
  userIsLoginRef.current = userInfo?.isLogin;

  const handleCardPress = useCallback(
    ({
      id,
      type,
      text,
      mysteryBonusData,
      memberDayRules,
    }: {
      id: number;
      type: number;
      text: string;
      mysteryBonusData?: any;
      memberDayRules?: any;
    }) => {
      if (!userIsLoginRef.current) {
        router.push({ pathname: "/login" });
        return;
      } else {
        if (userInfo?.isTestUser) {
          dispatch(changeIsShowTestUserPopup(true));
          return;
        }
      }

      dispatch(setActiveTitle({ title: text }));
      // if (mysteryBonusData != null || type === 11) {
      //   router.push({ pathname: "/active/specialBonus", params: { id: id.toString() } });
      //   return;
      // }
      // if (memberDayRules != null || type === 10) {
      //   router.push({ pathname: "/active/memberDay", params: { id: id.toString() } });
      //   return;
      // }
      router.push({
        pathname: "/active/activeCenter",
        params: { id: id.toString(), type: type.toString() },
      });
    },
    [dispatch, userInfo],
  );

  const handleToRelief = () => {
    if (!cardList || cardList.length === 0) return;

    const item = cardList.find((item: { type: number }) => item.type === 4);
    if (!item) {
      toast.warn(t("common.noConfig"));
      return;
    }
    if (!userIsLoginRef.current) {
      router.push({ pathname: "/login" });
      return;
    }
    const { id, type } = item;
    dispatch(setActiveTitle({ title: t("pageName.rescueFunds") }));
    router.push({
      pathname: "/active/activeCenter",
      params: { id: id.toString(), type: type.toString() },
    });
  };

  return (
    <ScrollView
      horizontal={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      pagingEnabled={false}
      contentContainerStyle={{ flexGrow: 1 }}
      decelerationRate={"normal"}
      stickyHeaderIndices={[0]}
      style={{ flex: 1 }}
    >
      <IndexHeader forceCompactTopOffset />
      <View className="flex-1 w-full">
        <Pressable
          style={[
            styles.activeBanner,
            { backgroundColor: Colors[theme].btnText, height: maxWidth * (138 / 393) },
          ]}
          onPress={() => {}}
        >
          <ActiveBannerView theme={theme} isWideScreen={isWideScreen} />
          <Image
            style={styles.bannerImage}
            source={activeTheme[theme].image}
            resizeMode="contain"
          />
        </Pressable>
        <ActivityCenterScrollableNavbar handleToRelief={handleToRelief} data={cardList} />
        {!isLoading ? (
          cardList?.length === 0 ? (
            <>
              <Text> </Text>
              <View className="mx-auto my-6">
                <NoData />
              </View>
              <Text> </Text>
            </>
          ) : (
            <>
              <View className="flex-warp mb-8" style={styles.bottomContainer}>
                {cardList?.map((item: any, index: number) => {
                  return (
                    <CardListView
                      key={index}
                      image={item.coverImageURL}
                      text={item.activityName}
                      type={item.activityType}
                      introduction={item.introduction}
                      id={item.id}
                      mysteryBonusData={item.mysteryBonusData}
                      memberDayRules={item.memberDayRules}
                      cardBg1={cardBg1}
                      maxWidth={maxWidth}
                      isWideScreen={isWideScreen}
                      theme={theme}
                      onPress={handleCardPress}
                    />
                  );
                })}
              </View>
            </>
          )
        ) : (
          <Text className="self-center text-sm mt-8" style={{ color: Colors[theme].lightText }}>
            {t("common.loading")}
          </Text>
        )}
      </View>
      <View style={{ height: getScrollBottomSpacer(bottomNavType) as any }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  activeBanner: {
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 12,
    flexDirection: "row",
    position: "relative",
    overflow: "hidden",
  },
  midContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "60%",
    height: "100%",
    paddingStart: 16,
    paddingTop: 16,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    zIndex: 2,
  },
  bannerImage: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: "60%",
    height: "100%",
    // resizeMode: "stretch",
    zIndex: 1,
  },
  textArea: {
    flex: 1,
    width: "72%",
    justifyContent: "flex-start",
  },
  bannerTitle: {
    fontWeight: 600,
    textAlign: "left",
  },
  bannerContent: {
    marginTop: 8,
    fontWeight: 400,
    textAlign: "left",
    lineHeight: 16,
  },
  menuIcon: {
    width: 33,
    height: 33,
    margin: 5,
  },
  bigMenuIcon: {
    width: 55,
    height: 50,
    marginBottom: 12,
    // resizeMode: "contain",
    position: "absolute",
    left: 8,
    bottom: 8,
  },
  bigContainer: {
    marginHorizontal: 4,
    width: "48%",
    marginBottom: 16,
    height: 60,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
  },
  bigGradient: {
    flexDirection: "row",
    width: "100%",
    height: "100%",
    paddingLeft: 55,
    paddingRight: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bottomContainer: {
    width: "100%",
  },
  cardContainer: {
    marginBottom: 10,
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardBackground: {
    width: "100%",
    height: "100%",
  },
  cardImageContainer: {
    position: "relative",
    width: "100%",
  },
  cardTitleOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "flex-start",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
});
