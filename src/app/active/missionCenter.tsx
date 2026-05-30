// 任务中心
import { missionTheme } from "@/components/active/components/activeConfg";
import {
  Mission,
  MissionCategory,
  shouldShowGoAndCompleteButton,
  shouldShowRechargeButton,
  shouldShowRechargeMethods,
  shouldShowSupportGameButton,
} from "@/components/active/mission/service";
import { SimpleHeader } from "@/components/common/Header";
import NoData from "@/components/common/NoData";
import { myTheme } from "@/components/my/myConfg";
import { Colors } from "@/constants/Colors";
import { useMissions } from "@/hooks/active/useMissions";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { TASK_DICT_MAP } from "@/types/mission";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import type { RootState } from "@/store/store";
import { AppDispatch } from "@/store/store";
import { fetchFinanceOverview } from "@/store/user/userSlice";

/**
 * 目前接口对应的规则
 *
 * type=1 新人福利任务:
 *  newArrivalTaskType=1,title="首次下载安装并登陆APP";
 *  newArrivalTaskType=2,title="注册账号";
 *  newArrivalTaskType=3,title="首次绑定银行卡";
 *  newArrivalTaskType=4,title="设置取款密码";
 *  newArrivalTaskType=5,title="设置生日";
 *  newArrivalTaskType=7,title="首次提现";
 *  newArrivalTaskType=8,title="首次绑定手机号";
 *
 * type=2 日任务:
 *  taskTargetType=1，title=累计充值;
 *  taskTargetType=2，title=累计有效投注;
 *
 * type=3 周任务:
 *  taskTargetType=1，title=累计充值;
 *  taskTargetType=2，title=累计有效投注;
 *
 * type=4 连续登录任务:
 * taskTargetType=1，连续登录的累计充值;
 * taskTargetType=2，连续登录的累计有效投注;
 *
 * type=5 月任务:
 *  taskTargetType=1，title=累计充值;
 *  taskTargetType=2，title=累计有效投注;
 * @returns
 */
const headerBackgroundColors = [
  ["#00B09B", "#96C93D"],
  ["#F48D16", "#FFD900"],
  ["#FF4B2B", "#FF416C"],
  ["#4781FF", "#47B5FF"],
];
const missionBgImages = [
  require("@/assets/images/active/missionCenter/tu-1.png"),
  require("@/assets/images/active/missionCenter/tu-2.png"),
  require("@/assets/images/active/missionCenter/tu-3.png"),
  require("@/assets/images/active/missionCenter/tu-4.png"),
  require("@/assets/images/active/missionCenter/tu-5.png"),
  require("@/assets/images/active/missionCenter/tu-6.png"),
  require("@/assets/images/active/missionCenter/tu-7.png"),
];

interface FinanceOverview {
  todayDepositMoney?: number;
  todayValidBetNum?: number;
  todayWinNum?: number;
  todayProfit?: number;
  weekDepositMoney?: number;
  weekValidBetNum?: number;
  weekWinNum?: number;
  weekProfit?: number;
}

const CUMULATIVE_TASKS = {
  DEPOSIT: 0,
  NET_AMOUNT: 2,
  PROFIT: 6,
  LOSS: 7,
} as const;
const cumulativeTaskTargets = Object.values(CUMULATIVE_TASKS) as number[];
const isCumulativeTask = (taskTarget?: number): taskTarget is number =>
  typeof taskTarget === "number" && cumulativeTaskTargets.includes(taskTarget);
type TabLayout = {
  x: number;
  width: number;
};

const isCompleteDailyCumulative = (
  taskTarget: number,
  rewardRules: Array<{ maxStepValue?: number | string }>,
  financeOverview: FinanceOverview,
) => {
  switch (taskTarget) {
    case CUMULATIVE_TASKS.DEPOSIT:
      return rewardRules.every(
        (rule) => Number(financeOverview.todayDepositMoney ?? 0) >= Number(rule.maxStepValue ?? 0),
      );
    case CUMULATIVE_TASKS.NET_AMOUNT:
      return rewardRules.every(
        (rule) => Number(financeOverview.todayValidBetNum ?? 0) >= Number(rule.maxStepValue ?? 0),
      );
    case CUMULATIVE_TASKS.PROFIT:
      return rewardRules.every(
        (rule) => Number(financeOverview.todayWinNum ?? 0) >= Number(rule.maxStepValue ?? 0),
      );
    case CUMULATIVE_TASKS.LOSS:
      return rewardRules.every(
        (rule) => Number(financeOverview.todayProfit ?? 0) >= Number(rule.maxStepValue ?? 0),
      );
    default:
      return false;
  }
};

const isCompleteWeeklyCumulative = (
  taskTarget: number,
  rewardRules: Array<{ maxStepValue?: number | string }>,
  financeOverview: FinanceOverview,
) => {
  switch (taskTarget) {
    case CUMULATIVE_TASKS.DEPOSIT:
      return rewardRules.every(
        (rule) => Number(financeOverview.weekDepositMoney ?? 0) >= Number(rule.maxStepValue ?? 0),
      );
    case CUMULATIVE_TASKS.NET_AMOUNT:
      return rewardRules.every(
        (rule) => Number(financeOverview.weekValidBetNum ?? 0) >= Number(rule.maxStepValue ?? 0),
      );
    case CUMULATIVE_TASKS.PROFIT:
      return rewardRules.every(
        (rule) => Number(financeOverview.weekWinNum ?? 0) >= Number(rule.maxStepValue ?? 0),
      );
    case CUMULATIVE_TASKS.LOSS:
      return rewardRules.every(
        (rule) => Number(financeOverview.weekProfit ?? 0) >= Number(rule.maxStepValue ?? 0),
      );
    default:
      return false;
  }
};

const getDisplayMissionStatus = (mission: Mission, financeOverview?: FinanceOverview) => {
  const missionStatus = mission.status;
  const taskType = mission.taskType;
  const taskTarget = mission.taskTarget;
  const rewardRules = mission.rewardRules;
  if (typeof taskTarget !== "number" || typeof taskType !== "number" || !rewardRules) {
    return missionStatus;
  }
  if (taskType === 0 || !isCumulativeTask(taskTarget)) {
    return missionStatus;
  }
  if (!financeOverview) {
    return missionStatus;
  }
  const isCompleted =
    taskType === 1
      ? isCompleteDailyCumulative(taskTarget, rewardRules, financeOverview)
      : isCompleteWeeklyCumulative(taskTarget, rewardRules, financeOverview);
  return isCompleted ? "completed" : missionStatus;
};

const getCompletedMissionCount = (
  missionList: Mission[],
  period: "daily" | "weekly",
  financeOverview?: FinanceOverview,
) => {
  return missionList.reduce((count, mission) => {
    const { status, taskTarget, rewardRules } = mission;

    if (
      typeof taskTarget === "number" &&
      isCumulativeTask(taskTarget) &&
      rewardRules &&
      financeOverview
    ) {
      const completed =
        period === "daily"
          ? isCompleteDailyCumulative(taskTarget, rewardRules, financeOverview)
          : isCompleteWeeklyCumulative(taskTarget, rewardRules, financeOverview);
      return completed ? count + 1 : count;
    }

    return status === "completed" ? count + 1 : count;
  }, 0);
};

const missionCenter = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const financeOverview = useSelector(
    (state: RootState) =>
      (state?.user?.financeOverview ??
        state?.user?.userInfo?.financeOverView ??
        state?.user?.userInfo?.financeOverview) as FinanceOverview | undefined,
  );
  const {
    tabs,
    showProgress,
    missions,
    category,
    isExpanded,
    selectedMission,
    progressData,
    selectMission,
    setIsExpanded,
    setCategory,
    fetchMore,
    setPageNo,
    rechargeMethods,
    refresh,
  } = useMissions();
  const tabScrollRef = useRef<ScrollView | null>(null);
  const tabLayoutsRef = useRef<Record<string, TabLayout>>({});
  const tabScrollXRef = useRef(0);
  const tabViewportWidthRef = useRef(0);
  const tabContentWidthRef = useRef(0);

  const progressCurrent =
    category === "dailyMissions"
      ? getCompletedMissionCount(missions, "daily", financeOverview)
      : category === "weeklyMissions"
        ? getCompletedMissionCount(missions, "weekly", financeOverview)
        : (progressData?.current ?? 0);

  /** 离开本页后再进入时刷新列表（避免与 useMissions 首屏请求重复） */
  const shouldRefreshOnNextFocus = useRef(false);
  useFocusEffect(
    useCallback(() => {
      // Align with Vue MissionCenter: refresh finance overview when entering screen.
      dispatch(fetchFinanceOverview(true));
      if (shouldRefreshOnNextFocus.current) {
        shouldRefreshOnNextFocus.current = false;
        refresh();
      }
      return () => {
        shouldRefreshOnNextFocus.current = true;
      };
    }, [dispatch, refresh]),
  );

  const handleClickMissionCard = (mission: Mission) => {
    const taskType = mission.taskType;
    if (taskType === undefined || taskType === null) {
      return;
    }
    const taskTarget = mission.taskTarget;
    if (taskTarget === undefined || taskTarget === null) {
      return;
    }
    const taskDict = TASK_DICT_MAP[taskType][taskTarget];
    switch (taskDict) {
      case "DOWNLOAD_APP":
        router.navigate("/(tabs)/home?task_target=download_app");
        break;
      case "BIND_PHONE":
        navigation.push("my/settingCenter", { task_target: "phone" });
        break;
      case "BIND_EMAIL":
        navigation.push("my/settingCenter", { task_target: "email" });
        break;
      case "SET_NAME":
        navigation.push("my/settingCenter", { task_target: "realName" });
        break;
      case "SET_BIRTHDAY":
        navigation.push("my/settingCenter", { task_target: "birthday" });
        break;
      case "FIST_BIND_BANK_CARD":
      case "FIRST_WITHDRAW":
        navigation.push("wallet/withdraw");
        break;
      case "FIRST_DEPOSIT":
        navigation.push("wallet/recharge");
        break;
      case "INVITE_FRIENDS":
        navigation.push("my/proxyManagement");
        break;
      default:
        break;
    }
  };

  const scrollTabIntoNeighborVisibility = (tabKey: string) => {
    const tabIndex = tabs.findIndex((tab) => tab.key === tabKey);
    if (tabIndex < 0) return;

    const scrollX = tabScrollXRef.current;
    const viewportWidth = tabViewportWidthRef.current;
    const contentWidth = tabContentWidthRef.current;
    if (viewportWidth <= 0 || contentWidth <= viewportWidth) return;

    const visibleLeft = scrollX;
    const visibleRight = scrollX + viewportWidth;
    const leftTab = tabs[tabIndex - 1];
    const rightTab = tabs[tabIndex + 1];
    let nextScrollX: number | null = null;

    if (leftTab) {
      const layout = tabLayoutsRef.current[leftTab.key];
      if (layout && layout.x < visibleLeft) {
        nextScrollX = layout.x;
      }
    }

    if (nextScrollX == null && rightTab) {
      const layout = tabLayoutsRef.current[rightTab.key];
      const rightEdge = layout ? layout.x + layout.width : 0;
      if (layout && rightEdge > visibleRight) {
        nextScrollX = rightEdge - viewportWidth;
      }
    }

    if (nextScrollX == null) return;

    const clampedScrollX = Math.max(0, Math.min(nextScrollX, contentWidth - viewportWidth));
    if (Math.abs(clampedScrollX - scrollX) < 1) return;

    tabScrollRef.current?.scrollTo({
      x: clampedScrollX,
      animated: true,
    });
  };

  const viewMission = useCallback(
    (mission: Mission) => {
      if (selectedMission?.id === mission.id) selectMission(null);
      else {
        selectMission(mission);
      }
    },
    [selectedMission],
  );

  const handleSupportGame = (mission: Mission) => {
    // Pass platformJson to GameList page
    const platformData = mission.platformJson;
    let platformJsonString = "[]";
    try {
      if (Array.isArray(platformData)) {
        platformJsonString = JSON.stringify(platformData);
      } else if (typeof platformData === "object" && platformData !== null) {
        platformJsonString = JSON.stringify(Object.values(platformData));
      } else if (typeof platformData === "string") {
        // Already a string, but ensure it's valid JSON
        JSON.parse(platformData); // Test if valid
        platformJsonString = platformData;
      }
    } catch (error) {
      console.error("[MissionCard] Error processing platformJson:", error);
    }

    navigation.push("mission/gamesList", {
      platformJson: platformJsonString,
    });
  };

  const renderMissionItem = ({ item, index }: { item: Mission; index: number }) => {
    const colors = headerBackgroundColors[index % headerBackgroundColors.length];
    let title = item.title || "";
    if (category === "all") {
      if (item.taskType === 1) title += ` (${t("mission.dailyMissions")})`;
      else if (item.taskType === 2) title += ` (${t("mission.weeklyMissions")})`;
    }
    title = title.trim();
    const bgImage = missionBgImages[index % missionBgImages.length];

    let rewardAmount = item.rewardAmount || 0;
    if (typeof rewardAmount === "string" && rewardAmount.includes("/")) {
      const rewards = rewardAmount
        .split("/")
        .map((r) => {
          const parsed = parseFloat(r.trim());
          return isNaN(parsed) ? 0 : parsed;
        })
        .filter((r) => r > 0);

      if (rewards.length === 0) {
        rewardAmount = 0;
      } else {
        const maxReward = Math.max(...rewards);
        rewardAmount = maxReward.toFixed(2);
      }
    } else {
      const parsed = typeof rewardAmount === "number" ? rewardAmount : parseFloat(rewardAmount);
      rewardAmount = isNaN(parsed) ? 0 : parsed.toFixed(2);
    }
    let statusColor = "";
    const displayStatus = getDisplayMissionStatus(item, financeOverview);
    switch (displayStatus) {
      case "inProgress":
        statusColor = "#ED5340";
        break;
      case "completed":
        statusColor = theme === "blueWhite" ? "#4781FF" : "#75EB92";
        break;
      case "locked":
        statusColor = "#666666";
        break;
      default:
        statusColor = "#ED5340";
        break;
    }

    const showRechargeMethods = shouldShowRechargeMethods(item);
    const showRechargeButton = shouldShowRechargeButton(item);
    const showSupportGameButton = shouldShowSupportGameButton(item);
    const showGoAndCompleteButton = shouldShowGoAndCompleteButton(item);
    const goAndCompleteDisabled = displayStatus === "completed" || displayStatus === "locked";
    const goAndCompleteLabel =
      displayStatus === "completed"
        ? t("status.completed")
        : displayStatus === "locked"
          ? t("status.locked")
          : t("mission.goAndComplete");

    return (
      <View style={[styles.missionCard]}>
        {isExpanded && (
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[colors[0], colors[1]]}
            style={{
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              marginBottom: -10,
            }}
          >
            <ImageBackground
              source={require("@/assets/images/active/missionCenter/bg.png")}
              style={{
                height: 125,
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
              }}
              resizeMode="cover"
            >
              <Text className="flex-1" style={styles.missionBannerTitle}>
                {item.title || ""}
              </Text>
              <View className="flex-1">
                <Image
                  source={bgImage}
                  style={{ height: 125, width: "auto" }}
                  resizeMode="contain"
                />
              </View>
            </ImageBackground>
          </LinearGradient>
        )}
        <View
          className={`bg-${theme}-cardBg1 ${selectedMission?.id === item.id && "rounded-b-none"}`}
          style={styles.missionInfo}
        >
          <Text
            className={`text-${theme}-darkColor pt-2`}
            style={[styles.missionTitle, { textAlign: "left" }]}
          >
            {title}
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center flex-row gap-2" style={{ flex: 1 }}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {displayStatus === "inProgress"
                  ? t("status.inProgress")
                  : displayStatus === "completed"
                    ? t("status.completed")
                    : displayStatus === "locked"
                      ? t("status.locked")
                      : String(displayStatus)}
              </Text>

              <Text
                style={[
                  styles.rewardText,
                  {
                    color: theme === "blueWhite" ? Colors[theme].primary : "#75EB92",
                    textAlign: "left",
                    writingDirection: "ltr",
                  },
                ]}
              >
                <Text className="text-[#888]">{t("home.activeBlock.highestReward")}</Text>{" "}
                {rewardAmount}
              </Text>
            </View>
            <View className="items-center gap-2" style={{ maxWidth: "40%" }}>
              <Pressable
                className={`flex-row gap-2 items-center bg-${theme}-lightPrimary`}
                style={styles.viewButton}
                onPress={() => viewMission(item)}
              >
                <Text className={`text-${theme}-darkColor`} style={styles.viewButtonText}>
                  {t("mission.missionDetails")}
                </Text>
                <Ionicons
                  name={
                    selectedMission?.id === item.id ? "chevron-up-circle" : "chevron-down-circle"
                  }
                  size={14}
                  color={Colors[theme].darkColor}
                />
              </Pressable>
            </View>
          </View>
        </View>
        {selectedMission?.id === item.id && (
          <View className={`bg-${theme}-inputBg`} style={styles.missionDetails}>
            {!!item.description && (
              <Text className="whitespace-pre-wrap" style={styles.description}>
                {item.description}
              </Text>
            )}
            {!!item.rewardRules && item.rewardRules.length > 0 && item.taskType !== 0 && (
              <View style={styles.rewardRuleSection}>
                <LinearGradient
                  colors={[
                    missionTheme[theme].cardActiveHead.s,
                    missionTheme[theme].cardActiveHead.e,
                  ]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={styles.contentHead}
                >
                  <Text className={`flex-1 text-center text-${theme}-darkColor`}>
                    {t("mission.accumulatedAmount")}
                  </Text>
                  <Text className={`flex-1 text-center text-${theme}-darkColor`}>
                    {t("agent.bonus")}
                  </Text>
                  <Text className={`flex-1 text-center text-${theme}-darkColor`}>
                    {t("pageName.pointsReward")}
                  </Text>
                </LinearGradient>
                {item.rewardRules.map((rule: any, idx) => {
                  const isLast = idx === (item.rewardRules?.length || 1) - 1;
                  let rewardValue = "0";
                  if (rule.rewardType === 0) {
                    rewardValue = rule.rewardAmount ?? 0;
                  } else if (rule.rewardType === 1) {
                    rewardValue = `${rule.minRewardAmount ?? 0}~${rule.maxRewardAmount ?? 0}`;
                  }
                  return (
                    <View
                      key={rule.id}
                      className={`flex-row items-center justify-around p-2 bg-${theme}-cardBg1`}
                      style={[
                        isLast && {
                          borderBottomLeftRadius: 8,
                          borderBottomRightRadius: 8,
                        },
                        idx % 2
                          ? {
                              backgroundColor: "rgba(117, 235, 146, 0.1)",
                            }
                          : undefined,
                      ]}
                    >
                      <Text className={`flex-1 text-center text-${theme}-darkColor`}>
                        ≥{rule.maxStepValue}
                      </Text>
                      <Text className={`flex-1 text-center`} style={{ color: "#FFD900" }}>
                        {rewardValue}
                      </Text>
                      <Text className={`flex-1 text-center`} style={{ color: "#FFD900" }}>
                        {rule.engagementValue || 0}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
            {showRechargeMethods && (
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <FontAwesome6 name="diamond" size={6} color={Colors[theme].primary} />
                  <Text style={{ color: "#ADB7BA", fontSize: 12 }}>
                    {t("mission.supportedRechargeMethods")}
                  </Text>
                </View>
                <View className="flex-row" style={styles.rechargeMethodsList}>
                  {rechargeMethods.map((method, idx) => (
                    <Text
                      key={`recharge-method-${idx}`}
                      style={[
                        styles.rechargeMethodTag,
                        {
                          borderColor: Colors[theme].activeColor,
                          backgroundColor: Colors[theme].activeColor,
                          color: "#ADB7BA",
                        },
                      ]}
                    >
                      {method}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            {showRechargeButton && (
              <Pressable
                style={{ borderRadius: 20 }}
                onPress={() => navigation.push("wallet/recharge")}
              >
                <LinearGradient
                  colors={[myTheme[theme].upgradeBtnBg.s, myTheme[theme].upgradeBtnBg.e]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.supportButton}
                >
                  <Text className={`text-${theme}-btnText`} style={styles.supportButtonText}>
                    {t("pageName.recharge")}
                  </Text>
                  {/* <FontAwesome name="angle-right" /> */}
                </LinearGradient>
              </Pressable>
            )}
            {showSupportGameButton && (
              <Pressable style={{ borderRadius: 20 }} onPress={() => handleSupportGame(item)}>
                <LinearGradient
                  colors={[myTheme[theme].upgradeBtnBg.s, myTheme[theme].upgradeBtnBg.e]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.supportButton}
                >
                  <Text className={`text-${theme}-btnText`} style={styles.supportButtonText}>
                    {t("mission.supportGame")}
                  </Text>
                  {/* <FontAwesome name="angle-right" /> */}
                </LinearGradient>
              </Pressable>
            )}
            {showGoAndCompleteButton && (
              <Pressable
                disabled={goAndCompleteDisabled}
                style={{
                  borderRadius: 20,
                  opacity: goAndCompleteDisabled ? 0.55 : 1,
                }}
                onPress={() => handleClickMissionCard(item)}
              >
                <LinearGradient
                  colors={[myTheme[theme].upgradeBtnBg.s, myTheme[theme].upgradeBtnBg.e]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.supportButton}
                >
                  <Text className={`text-${theme}-btnText`} style={styles.supportButtonText}>
                    {goAndCompleteLabel}
                  </Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <SimpleHeader title={t("pageName.missionCenter")} />
      <View className={`flex-row bg-${theme}-cardBg1`} style={styles.tabContainer}>
        <ScrollView
          className="flex-1"
          ref={tabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onLayout={(event) => {
            tabViewportWidthRef.current = event.nativeEvent.layout.width;
          }}
          onContentSizeChange={(width) => {
            tabContentWidthRef.current = width;
          }}
          onScroll={(event) => {
            tabScrollXRef.current = event.nativeEvent.contentOffset.x;
          }}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                tabLayoutsRef.current[tab.key] = { x, width };
              }}
              style={[
                styles.tabItem,
                category === tab.key
                  ? { borderBottomColor: Colors[theme].primary }
                  : { borderBottomColor: Colors[theme].cardBg1 },
              ]}
              onPress={() => {
                setCategory(tab.key as MissionCategory);
                setPageNo(1);
                router.setParams({
                  tab: tab.key === "all" ? undefined : tab.key,
                });
                requestAnimationFrame(() => {
                  scrollTabIntoNeighborVisibility(tab.key);
                });
              }}
            >
              <Text
                className={category === tab.key ? `text-${theme}-primary` : "text-[#adb7ba]"}
                style={styles.tabItemLabel}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          className="items-center justify-center p-1"
        >
          <Image
            style={{ width: 20, height: 20 }}
            source={
              isExpanded
                ? require("@/assets/images/active/missionCenter/codicon_fold.png")
                : require("@/assets/images/active/missionCenter/material-symbols-light_expand-all.png")
            }
          />
        </Pressable>
      </View>
      <View className="flex-1 p-4 mb-1">
        {showProgress && (
          <View className="gap-1 mb-4">
            <Text
              className={`text-center text-${theme}-darkColor`}
              style={styles.progressText}
            >
              {t("mission.currentProgress", {
                current: progressCurrent,
                total: progressData?.total ?? 0,
              })}
            </Text>
            <View className={`bg-${theme}-secondaryBg`} style={{ borderRadius: 4 }}>
              <LinearGradient
                style={{
                  borderRadius: 4,
                  width: `${Math.floor(
                    ((progressCurrent || 0) / (progressData?.total || 1)) * 100,
                  )}%`,
                  height: 6,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={[Colors[theme].primary, Colors[theme].gradient]}
              />
            </View>
          </View>
        )}
        {missions.length > 0 ? (
          <>
            <FlatList
              data={missions}
              renderItem={renderMissionItem}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={fetchMore}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              className="hide-scrollbar"
              ListFooterComponent={
                <View className="justify-center items-center mb-20">
                  <Text className="fontSize={12}" style={{ color: Colors[theme].text }}>
                    {t("common.noMore")}
                  </Text>
                </View>
              }
            />
          </>
        ) : (
          <NoData />
        )}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  tabContainer: {
    gap: 8,
    paddingHorizontal: 5,
  },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
  },
  tabItemLabel: {
    fontSize: 14,
    flexShrink: 0,
    fontStyle: "normal",
    fontWeight: 500,
    cursor: "pointer",
  },
  progressText: {
    fontSize: 10,
    fontWeight: 400,
  },
  missionCard: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
  },
  missionBannerTitle: {
    padding: 15,
    color: "#fff",
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 5,
  },
  missionImage: {
    width: "100%",
    height: 140,
  },
  missionContent: {
    width: "100%",
    height: 59,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  missionInfo: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    gap: 5,
  },
  missionTitle: {
    fontSize: 12,
    fontWeight: 600,
  },
  rewardText: {
    fontSize: 11,
    flex: 1,
    flexShrink: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "400",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 5,
    backgroundColor: `rgba(255, 126, 117, 0.10)`,
  },
  viewButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 15,
    backdropFilter: "blur(2px)",
    cursor: "pointer",
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: "400",
  },
  missionDetails: {
    padding: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    gap: 10,
  },
  description: {
    fontSize: 12,
    color: "#adb7ba",
    marginVertical: 10,
    lineHeight: 16,
    wordWrap: "break-word",
  },
  rewardRuleSection: {
    marginVertical: 10,
  },
  contentHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  contentBody: {
    backgroundColor: "rgba(117, 235, 146, 0.1)",
  },
  supportButton: {
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  supportButtonText: {
    fontSize: 13,
    fontWeight: 600,
    fontStyle: "normal",
    fontFamily: "PingFang SC",
  },
  rechargeMethodsList: {
    flexWrap: "wrap",
    gap: 10,
  },
  rechargeMethodTag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
  },
});
export default missionCenter;
