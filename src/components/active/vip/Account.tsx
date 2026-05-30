//vip主界面
import { bg, vipTheme } from "@/components/active/components/activeConfg";
import { Level } from "@/components/active/components/Level";
import { DegreeInfo } from "@/components/active/vip/Carouse";
import { buildVipCarouselItems } from "@/components/active/vip/VipCarouselUtil";
import { useToast } from "@/components/common/toast";
import { I18nText } from "@/components/I18nText";
import { BetRateIcon, GradeIcon, WelfareIcon } from "@/components/icons/active/vip";
import VipProgress from "@/components/my/type4/VipProgress";
import { AVATAR_STORAGE_KEY as AVATAR_LOCAL, avatarImages, AvatarKey } from "@/constants/avatars";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { degreeInfoAsync, vipListAsync } from "@/store/active/activeSlice";
import { AppDispatch, RootState } from "@/store/store";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { rf } from "@/utils/scaleFont";
export type AccountVipModalProps = {
  showRules: boolean;
  showQues: boolean;
  setShowRules: React.Dispatch<React.SetStateAction<boolean>>;
  setShowQues: React.Dispatch<React.SetStateAction<boolean>>;
};

const Account = ({ showRules, showQues, setShowRules, setShowQues }: AccountVipModalProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isScreenFocused = useIsFocused();
  const handleAvatarPress = () => {
    router.push({ pathname: "/avatars", params: { index: avatar } });
  };
  const dispatch: AppDispatch = useDispatch();
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const degreeInfo = useSelector((state: RootState) => state.active.degreeInfo);
  const vipList = useSelector((state: RootState) => state.active.vipList);

  const vipData = useMemo(
    () => buildVipCarouselItems(vipList, degreeInfo as DegreeInfo | null),
    [vipList, degreeInfo],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [avatar, setAvatar] = useState<AvatarKey>("1");
  const { width: screenWidth } = useWindowDimensions();
  const [layoutWidth, setLayoutWidth] = useState(screenWidth || 375);

  const toast = useToast();
  const loadingInFlightRef = useRef(false);
  const loadAvatar = async () => {
    const savedAvatar = await AsyncStorage.getItem(AVATAR_LOCAL);
    if (savedAvatar && savedAvatar in avatarImages) {
      setAvatar(savedAvatar as AvatarKey);
    }
  };
  useEffect(() => {
    if (!isScreenFocused) {
      setShowRules(false);
      setShowQues(false);
    }
  }, [isScreenFocused, setShowRules, setShowQues]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const fetchAll = async () => {
        if (loadingInFlightRef.current) return;
        loadingInFlightRef.current = true;
        toast.loading(true);
        try {
          await Promise.allSettled([
            loadAvatar(),
            !degreeInfo &&
              dispatch(degreeInfoAsync())
                .unwrap()
                .catch(() => {}),
            (!vipList || !Array.isArray(vipList) || vipList.length === 0) &&
              dispatch(vipListAsync())
                .unwrap()
                .catch(() => {}),
          ]);
        } catch (e) {
          console.error("error:", e);
        } finally {
          loadingInFlightRef.current = false;
          if (!cancelled) toast.loading(false);
        }
      };
      fetchAll();
      // 关键：iOS 快速切页/抢登录跳转时，异步可能被挂起或延迟，确保失焦立即关闭 loading
      return () => {
        cancelled = true;
        loadingInFlightRef.current = false;
        toast.loading(false);
      };
    }, [dispatch]),
  );

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setLayoutWidth(width);
    }
  };

  return (
    <View className="w-full flex-1" onLayout={handleLayout}>
      <View className="w-full overflow-hidden mb-1" style={{ height: 255 }}>
        <ImageBackground
          source={bg[theme][2]}
          resizeMode="cover"
          style={{ width: "100%", height: layoutWidth * (2 / 3) }}
        >
          <View style={{ height: 255, justifyContent: "space-between" }}>
            <View className="flex-row justify-start items-end ml-6 mt-[60] mb-4">
              <Pressable onPress={handleAvatarPress}>
                <Image
                  source={avatarImages[avatar]}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    overflow: "hidden",
                  }}
                />
              </Pressable>
              <View className="ml-2 mb-1">
                <Level level={degreeInfo?.curDegreeLevel} />
                <Text
                  className="mt-0.5 ml-2"
                  style={{ fontSize: rf(14), color: Colors[theme].text }}
                >
                  {userInfo?.member?.username ?? userInfo?.username ?? ""}
                </Text>
              </View>
            </View>
            <View
              className="flex-row justify-between items-center gap-3"
              style={{ width: "90%", marginHorizontal: "auto" }}
            >
              <View
                className="flex-1"
                style={[
                  styles.rechargeRow,
                  {
                    backgroundColor: Colors[theme].background,
                    maxWidth: "47%",
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    "#f7a01d",
                    "#fff3ae",
                    "#ffe44d",
                    "#fffec9",
                    "#ffe44d",
                    "#fff3ae",
                    "#f7a01d",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.rechargeRow, { paddingBottom: 2, width: "100%" }]}
                >
                  <LinearGradient
                    style={{
                      flex: 1,
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 10,
                    }}
                    colors={[vipTheme[theme].baseLayerBg.s, vipTheme[theme].baseLayerBg.e]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{ color: Colors[theme].primary, fontSize: rf(14) }}
                    >
                      {degreeInfo?.type == 1
                        ? degreeInfo.curDegreeDepositMoney
                        : degreeInfo?.curDegreeBetNum}
                    </Text>
                    <View
                      className="mt-0.5 justify-center items-center rounded-lg px-3 py-1"
                      style={{ backgroundColor: vipTheme[theme].lineLabelBg }}
                    >
                      <Text style={{ fontSize: rf(11), color: Colors[theme].text }}>
                        {degreeInfo?.type === 1
                          ? t("active.vip.myDeposit")
                          : t("active.vip.myWagering")}
                      </Text>
                    </View>
                  </LinearGradient>
                </LinearGradient>
              </View>
              <View
                className="flex-1"
                style={[
                  styles.rechargeRow,
                  {
                    backgroundColor: Colors[theme].background,
                    maxWidth: "47%",
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    "#f7a01d",
                    "#fff3ae",
                    "#ffe44d",
                    "#fffec9",
                    "#ffe44d",
                    "#fff3ae",
                    "#f7a01d",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.rechargeRow, { paddingBottom: 2, width: "100%" }]}
                >
                  <LinearGradient
                    style={{
                      flex: 1,
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 10,
                    }}
                    colors={[vipTheme[theme].baseLayerBg.s, vipTheme[theme].baseLayerBg.e]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{ color: Colors[theme].primary, fontSize: rf(14) }}
                    >
                      {degreeInfo?.type == 1
                        ? degreeInfo.nextDegreeDepositMoney
                        : degreeInfo?.nextDegreeBetNum}
                    </Text>
                    <View
                      className="mt-0.5 justify-center items-center rounded-lg px-3 py-1"
                      style={{ backgroundColor: vipTheme[theme].lineLabelBg }}
                    >
                      <Text style={{ fontSize: rf(11), color: Colors[theme].text }}>
                        {degreeInfo?.type === 1
                          ? t("active.vip.needsDeposit")
                          : t("active.vip.xuPlaceabet2")}
                      </Text>
                    </View>
                  </LinearGradient>
                </LinearGradient>
              </View>
            </View>
            <View className="justify-center items-center mb-2">
              <View className="flex-row items-center justify-center">
                <View
                  className="h-px w-[70px] mr-1"
                  style={{ backgroundColor: Colors[theme].primary }}
                />
                <Text
                  className="mx-2 text-center"
                  style={{
                    fontSize: rf(11),
                    color: Colors[theme].primary,
                    maxWidth: "100%",
                  }}
                >
                  {t("active.vip.lingqu")}
                </Text>

                <View
                  className="h-px w-[70px] ml-1"
                  style={{ backgroundColor: Colors[theme].primary }}
                />
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
      <VipProgress onIndexChange={setCurrentIndex} />
      {/* 等级福利 */}
      <View className="flex-row justify-between items-center" style={styles.levelInfo}>
        <View className="flex-row items-center gap-2">
          <View className={`bg-${theme}-primary`} style={styles.levelInfoBar} />
          <I18nText
            className={`text-${theme}-textGray`}
            i18nKey={"active.vip.dengjifuli"}
            style={styles.levelInfoTitle}
          />
        </View>
        <Pressable
          className="self-auto"
          onPress={() => {
            setShowRules(true);
          }}
        >
          <I18nText
            className={`text-${theme}-primary`}
            i18nKey="active.vip.rules"
            style={styles.rulesText}
          />
        </Pressable>
      </View>
      <LinearGradient
        colors={["#f7a01d", "#fff3ae", "#ffe44d", "#fffec9", "#ffe44d", "#fff3ae", "#f7a01d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.vipBox]}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={[vipTheme[theme].box.s, vipTheme[theme].box.e]}
          style={{ width: "100%", borderRadius: 10 }}
        >
          <View
            style={[
              styles.boxView,
              {
                backgroundColor: vipTheme[theme].cardBga,
              },
            ]}
          >
            <View
              className="flex-row justify-between items-start mb-4"
              style={{ marginHorizontal: 0, padding: 0 }}
            >
              <ImageBackground
                style={styles.titlebg}
                resizeMode="cover"
                source={vipTheme[theme].title}
              >
                <WelfareIcon width={22} height={22} color={Colors[theme].btnText} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: Colors[theme].btnText,
                    marginLeft: 6,
                  }}
                >
                  {vipData[currentIndex]?.name}
                </Text>
              </ImageBackground>
              <Pressable
                className="self-auto"
                onPress={() => {
                  setShowRules(false);
                  setShowQues(true);
                }}
                style={styles.helpIcon}
              >
                <FontAwesome name="question-circle-o" size={20} color={Colors[theme].textGray} />
              </Pressable>
            </View>
            <View className="justify-around items-center">
              <View className="w-full flex-row justify-between items-center px-5 mb-5">
                <View className="flex-row items-center" style={{ width: "74%" }}>
                  <View style={[styles.bagBox, { backgroundColor: vipTheme[theme].boxborder }]}>
                    <Image
                      style={{ width: 34, height: 34 }}
                      source={require("@/assets/images/active/vip/giftBag.png")}
                      resizeMode="contain"
                    />
                  </View>
                  <View className="justify-around items-start" style={{ flexShrink: 1 }}>
                    <Text style={{ fontSize: 14, color: Colors[theme].text }} numberOfLines={0}>
                      {t("active.vip.sjlibao")}
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: Colors[theme].primary,
                      }}
                      numberOfLines={0}
                    >
                      {t("active.vip.eachAccountOnlyOnce")}
                    </Text>
                  </View>
                </View>
                <View className="justify-center items-center" style={{ width: "26%" }}>
                  <View
                    style={[
                      styles.bagNum,
                      {
                        marginBottom: 10,
                        backgroundColor: vipTheme[theme].boxborder,
                      },
                    ]}
                  >
                    <Image
                      style={styles.bagImg}
                      source={require("@/assets/images/active/vip/qb.png")}
                      resizeMode="contain"
                    />
                    <Text style={{ fontSize: 12, color: Colors[theme].text }}>
                      {vipData[currentIndex]?.upgradeMoney}
                    </Text>
                  </View>
                  <View style={[styles.bagNum, { backgroundColor: vipTheme[theme].boxborder }]}>
                    <BetRateIcon
                      width={14}
                      height={14}
                      color={Colors[theme].primary}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{ fontSize: 12, color: Colors[theme].text }}>
                      {vipData[currentIndex]?.betRate}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="w-full flex-row justify-between items-center px-5 mb-5">
                <View className="flex-row items-center" style={{ width: "74%" }}>
                  <View style={[styles.bagBox, { backgroundColor: vipTheme[theme].boxborder }]}>
                    <Image
                      style={{ width: 34, height: 34 }}
                      source={require("@/assets/images/active/vip/giftCoin.png")}
                      resizeMode="contain"
                    />
                  </View>
                  <View className="justify-around items-start" style={{ flexShrink: 1 }}>
                    <Text style={{ fontSize: 14, color: Colors[theme].text }} numberOfLines={0}>
                      {t("active.vip.kuaji")}
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: Colors[theme].primary,
                      }}
                      numberOfLines={0}
                    >
                      {t("active.vip.eachAccountOnlyOnce")}
                    </Text>
                  </View>
                </View>
                {/* 右侧数值 */}
                <View className="justify-center items-center" style={{ width: "26%" }}>
                  <View
                    style={[
                      styles.bagNum,
                      {
                        marginBottom: 10,
                        backgroundColor: vipTheme[theme].boxborder,
                      },
                    ]}
                  >
                    <Image
                      style={styles.bagImg}
                      source={require("@/assets/images/active/vip/qb.png")}
                      resizeMode="contain"
                    />
                    <Text style={{ fontSize: 12, color: Colors[theme].text }} numberOfLines={0}>
                      {vipData[currentIndex]?.skipMoney}
                    </Text>
                  </View>
                  <View style={[styles.bagNum, { backgroundColor: vipTheme[theme].boxborder }]}>
                    <BetRateIcon
                      width={14}
                      height={14}
                      color={Colors[theme].primary}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{ fontSize: 12, color: Colors[theme].text }} numberOfLines={0}>
                      {vipData[currentIndex]?.betRate}
                    </Text>
                  </View>
                </View>
              </View>
              {/* 日俸禄 */}
              {vipData[currentIndex]?.memberSalaryRspDto?.daySalary &&
                vipData[currentIndex]?.memberSalaryRspDto?.daySalary > 0 && (
                  <View className="w-full flex-row justify-between items-center px-5 mb-5">
                    <View className="flex-row items-center" style={{ width: "74%" }}>
                      <View style={[styles.bagBox, { backgroundColor: vipTheme[theme].boxborder }]}>
                        <Image
                          style={{ width: 34, height: 34 }}
                          source={require("@/assets/images/active/vip/dayFl.webp")}
                          resizeMode="contain"
                        />
                      </View>
                      <View className="justify-around items-start" style={{ flexShrink: 1 }}>
                        <Text style={{ fontSize: 14, color: Colors[theme].text }} numberOfLines={0}>
                          {t("active.vip.rifl")}
                        </Text>
                        <Text
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            color: Colors[theme].primary,
                          }}
                          numberOfLines={0}
                        >
                          {t("active.vip.antj")}
                        </Text>
                      </View>
                    </View>
                    <View className="justify-center items-center" style={{ width: "26%" }}>
                      <View
                        style={[
                          styles.bagNum,
                          {
                            marginBottom: 10,
                            backgroundColor: vipTheme[theme].boxborder,
                          },
                        ]}
                      >
                        <Image
                          style={styles.bagImg}
                          source={require("@/assets/images/active/vip/qb.png")}
                          resizeMode="contain"
                        />
                        <Text style={{ fontSize: 12, color: Colors[theme].text }} numberOfLines={0}>
                          {vipData[currentIndex]?.memberSalaryRspDto?.daySalary}
                        </Text>
                      </View>
                      <View style={[styles.bagNum, { backgroundColor: vipTheme[theme].boxborder }]}>
                        <BetRateIcon
                          width={14}
                          height={14}
                          color={Colors[theme].primary}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={{ fontSize: 12, color: Colors[theme].text }} numberOfLines={0}>
                          {degreeInfo?.type === 1
                            ? vipData[currentIndex]?.memberSalaryRspDto?.dayDeposit
                            : vipData[currentIndex]?.memberSalaryRspDto?.dayBetnum}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              {/* 周俸禄 */}
              {vipData[currentIndex]?.memberSalaryRspDto?.weekSalary &&
                vipData[currentIndex]?.memberSalaryRspDto?.weekSalary > 0 && (
                  <View className="w-full flex-row justify-between items-center px-5 mb-5">
                    <View className="flex-row items-center" style={{ width: "74%" }}>
                      <View style={[styles.bagBox, { backgroundColor: vipTheme[theme].boxborder }]}>
                        <Image
                          style={{ width: 34, height: 34 }}
                          source={require("@/assets/images/active/vip/weekFl.webp")}
                          resizeMode="contain"
                        />
                      </View>
                      <View className="justify-around items-start" style={{ flexShrink: 1 }}>
                        <Text style={{ fontSize: 14, color: Colors[theme].text }} numberOfLines={0}>
                          {t("active.vip.zhoufenglu")}
                        </Text>
                        <Text
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            color: Colors[theme].primary,
                          }}
                          numberOfLines={0}
                        >
                          {t("active.vip.antj")}
                        </Text>
                      </View>
                    </View>
                    <View className="justify-center items-center" style={{ width: "26%" }}>
                      <View
                        style={[
                          styles.bagNum,
                          {
                            marginBottom: 10,
                            backgroundColor: vipTheme[theme].boxborder,
                          },
                        ]}
                      >
                        <Image
                          style={styles.bagImg}
                          source={require("@/assets/images/active/vip/qb.png")}
                          resizeMode="contain"
                        />
                        <Text style={{ fontSize: 12, color: Colors[theme].text }} numberOfLines={0}>
                          {vipData[currentIndex]?.memberSalaryRspDto?.weekSalary}
                        </Text>
                      </View>
                      <View style={[styles.bagNum, { backgroundColor: vipTheme[theme].boxborder }]}>
                        <BetRateIcon
                          width={14}
                          height={14}
                          color={Colors[theme].primary}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={{ fontSize: 12, color: Colors[theme].text }} numberOfLines={0}>
                          {degreeInfo?.type === 1
                            ? vipData[currentIndex]?.memberSalaryRspDto?.weekDeposit
                            : vipData[currentIndex]?.memberSalaryRspDto?.weekBetnum}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              {/* 月俸禄 */}
              {vipData[currentIndex]?.memberSalaryRspDto?.monthSalary &&
                vipData[currentIndex]?.memberSalaryRspDto?.monthSalary > 0 && (
                  <View className="w-full flex-row justify-between items-center px-5 mb-5">
                    <View className="flex-row items-center" style={{ width: "74%" }}>
                      <View style={[styles.bagBox, { backgroundColor: vipTheme[theme].boxborder }]}>
                        <Image
                          style={{ width: 34, height: 34 }}
                          source={require("@/assets/images/active/vip/monthFl.webp")}
                          resizeMode="contain"
                        />
                      </View>
                      <View className="justify-around items-start" style={{ flexShrink: 1 }}>
                        <Text style={{ fontSize: 14, color: Colors[theme].text }} numberOfLines={0}>
                          {t("active.vip.yuefenglu")}
                        </Text>
                        <Text
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            color: Colors[theme].primary,
                          }}
                          numberOfLines={0}
                        >
                          {t("active.vip.antj")}
                        </Text>
                      </View>
                    </View>
                    <View className="justify-center items-center" style={{ width: "26%" }}>
                      <View
                        style={[
                          styles.bagNum,
                          {
                            marginBottom: 10,
                            backgroundColor: vipTheme[theme].boxborder,
                          },
                        ]}
                      >
                        <Image
                          style={styles.bagImg}
                          source={require("@/assets/images/active/vip/qb.png")}
                          resizeMode="contain"
                        />
                        <Text style={{ fontSize: 12, color: Colors[theme].text }} numberOfLines={0}>
                          {vipData[currentIndex]?.memberSalaryRspDto?.monthSalary}
                        </Text>
                      </View>
                      <View style={[styles.bagNum, { backgroundColor: vipTheme[theme].boxborder }]}>
                        <BetRateIcon
                          width={14}
                          height={14}
                          color={Colors[theme].primary}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={{ fontSize: 12, color: Colors[theme].text }} numberOfLines={0}>
                          {degreeInfo?.type === 1
                            ? vipData[currentIndex]?.memberSalaryRspDto?.monthDeposit
                            : vipData[currentIndex]?.memberSalaryRspDto?.monthBetnum}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              {/* 生日礼金 */}
              {vipData[currentIndex]?.memberSalaryRspDto?.birthdayBonus &&
                vipData[currentIndex]?.memberSalaryRspDto?.birthdayBonus > 0 && (
                  <View className="w-full flex-row justify-between items-center px-5 mb-5">
                    <View className="flex-row items-center" style={{ width: "74%" }}>
                      <View style={[styles.bagBox, { backgroundColor: vipTheme[theme].boxborder }]}>
                        <Image
                          style={{ width: 34, height: 34 }}
                          source={require("@/assets/images/active/vip/birthday.webp")}
                          resizeMode="contain"
                        />
                      </View>
                      <View className="justify-around items-start" style={{ flexShrink: 1 }}>
                        <Text style={{ fontSize: 14, color: Colors[theme].text }} numberOfLines={0}>
                          {t("active.vip.birthlj")}
                        </Text>
                        <Text
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            color: Colors[theme].primary,
                          }}
                          numberOfLines={0}
                        >
                          {t("active.vip.onceayear")}
                        </Text>
                      </View>
                    </View>
                    <View className="justify-center items-center" style={{ width: "26%" }}>
                      <View style={[styles.bagNum, { backgroundColor: vipTheme[theme].boxborder }]}>
                        <Image
                          style={styles.bagImg}
                          source={require("@/assets/images/active/vip/qb.png")}
                          resizeMode="contain"
                        />
                        <Text style={{ fontSize: 12, color: Colors[theme].text }} numberOfLines={0}>
                          {vipData[currentIndex]?.memberSalaryRspDto?.birthdayBonus || 0}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
            </View>
          </View>
        </LinearGradient>
      </LinearGradient>
      {/* 我的福利 */}
      <LinearGradient
        colors={["#f7a01d", "#fff3ae", "#ffe44d", "#fffec9", "#ffe44d", "#fff3ae", "#f7a01d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.vipBox, { marginBottom: 70 }]}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={[vipTheme[theme].box.s, vipTheme[theme].box.e]}
          style={{ width: "100%", borderRadius: 10 }}
        >
          <View
            style={[
              styles.boxView,
              {
                backgroundColor: vipTheme[theme].cardBga,
                borderColor: Colors[theme].primary,
              },
            ]}
          >
            <View
              className="flex-row justify-between items-start"
              style={{ marginHorizontal: 0, padding: 0 }}
            >
              <ImageBackground
                style={styles.titlebg}
                resizeMode="cover"
                source={vipTheme[theme].title}
              >
                <GradeIcon width={22} height={22} color={Colors[theme].btnText} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: Colors[theme].btnText,
                    marginLeft: 6,
                  }}
                >
                  {t("active.vip.fuli")}
                </Text>
              </ImageBackground>
            </View>
            <View className="flex-row justify-between items-center my-5 px-3 relative">
              <View
                className="flex-row"
                style={[styles.leftBox, { backgroundColor: vipTheme[theme].boxborder }]}
              >
                <View className="flex-1 justify-center items-center">
                  <Text style={{ fontSize: rf(13), color: Colors[theme].text }} numberOfLines={0}>
                    {t("pageName.rebate")}
                  </Text>
                  <Text
                    style={{
                      fontSize: rf(10),
                      marginTop: 10,
                      textAlign: "center",
                      color: Colors[theme].primary,
                    }}
                    numberOfLines={0}
                  >
                    {t("active.vip.damashouyi")}
                  </Text>
                </View>
                <View className="justify-center items-center">
                  <Image
                    style={styles.bottomImg}
                    source={require("@/assets/images/active/vip/cleanBet.png")}
                    resizeMode="contain"
                  />
                </View>

                <ImageBackground
                  style={styles.bottomBg}
                  resizeMode="contain"
                  source={vipTheme[theme].context}
                >
                  <Pressable
                    className="ml-1"
                    onPress={() => {
                      router.push("/active/rebate");
                    }}
                  >
                    <Text style={[styles.bottomText, { color: Colors[theme].text }]}>
                      {t("active.vip.viewDetails")}
                    </Text>
                  </Pressable>
                </ImageBackground>
              </View>
              {/* <View style={[styles.leftBox, { backgroundColor: vipTheme[theme].boxborder }]}>
              <Text style={{ fontSize: 13, color: Colors[theme].text }} numberOfLines={0}>{t("agent.realBettingMoney")}</Text>
              <Text style={{ fontSize: 10, marginTop: 10, textAlign: 'center', color: Colors[theme].primary }}
                numberOfLines={0}>{t("active.vip.ximashouyi")}</Text>
              <Image
                style={styles.bottomImg}
                source={require('@/assets/images/active/vip/codBet.png')}
                resizeMode="contain" />
              <ImageBackground
                style={styles.bottomBg}
                resizeMode="contain"
                source={vipTheme[theme].context}>
                <Pressable className='ml-1' onPress={() => {
                  router.push({ pathname: '/active/bethis', });
                }}>
                  <Text style={[styles.bottomText, { color: Colors[theme].text }]}>{t("active.vip.viewDetails")}</Text>
                </Pressable>
              </ImageBackground>
            </View> */}
            </View>
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  rechargeRow: {
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    height: rf(66),
    borderRadius: 10,
    overflow: "hidden",
  },
  arrowDown: {
    width: 0,
    height: 0,
    marginTop: 1,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 5,
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },
  vipBox: {
    width: "90%",
    borderRadius: 10,
    marginTop: 16,
    paddingTop: 3,
    alignSelf: "center",
    alignItems: "center",
  },
  boxView: {
    width: "100%",
    borderRadius: 10,
    padding: 0,
  },
  titlebg: {
    width: 169,
    height: 34,
    paddingLeft: 12,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    margin: 0,
  },
  rulesText: {
    fontSize: rf(12),
    textDecorationLine: "underline",
    cursor: "pointer",
  },
  bagBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  bagNum: {
    width: 80,
    height: 20,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  bagImg: {
    width: 14,
    height: 14,
    marginRight: 8,
  },
  leftBox: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingBottom: 20,
  },
  bottomImg: {
    width: 130,
    height: 130,
    marginTop: 6,
  },
  bottomBg: {
    width: 150,
    height: 30,
    right: -5,
    bottom: 0,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomText: {
    fontSize: rf(11),
    fontWeight: "400",
  },
  levelInfo: {
    width: "90%",
    marginTop: 15,
    marginHorizontal: "auto",
  },
  levelInfoBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  levelInfoTitle: {
    paddingTop: 2,
    fontWeight: 600,
    fontSize: rf(14),
    textAlign: "center",
  },
  helpIcon: {
    marginTop: 5,
    marginRight: 15,
    cursor: "pointer",
  },
});

export default Account;
