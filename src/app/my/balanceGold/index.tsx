/*彩金任务 */
import { getBonusUnlockList, bonusUnlockClaim } from "@/api/post/my";
import { getUserTypeDictData } from "@/api/post/active";
import { HideScreenHeader } from "@/components/common/Header";
import NoData from "@/components/common/NoData";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { RootState } from "@/store/store";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "@rneui/themed";
import CommonDialog from "@/components/common/Dialog";
import { rf } from "@/utils/scaleFont";

interface DictItem {
  id: string | number;
  label: string;
  value: string;
  dictType: string;
}

interface OptionalInfo {
  rechargeDays?: number;
  dailyWagering?: number;
  rechargeAmount?: number;
  bgCompositionType?: number;
  unlockDays?: number;
}

interface BonusTaskItem {
  id: number | null;
  bonusUnlockId: string;
  unlockType: number;
  amount?: number;
  optional?: OptionalInfo;
  claimedTime?: string | null;
  endTime?: string | null;
  progressValue?: number | null;
  progressCurrentValue?: number | null;
  claimLoading?: boolean;
  coverImageURL?: string;
  introduction?: string;
  ruleDesc?: string;
}

const BalanceGold = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [bonusUnlockList, setBonusUnlockList] = useState<BonusTaskItem[]>([]);
  const [progressValues, setProgressValues] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [unlockTypeDict, setUnlockTypeDict] = useState<DictItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [currentRuleDesc, setCurrentRuleDesc] = useState<string>(""); // 弹窗规则内容

  useEffect(() => {
    getTypes();
    getBonusUnlockListFun(true);
  }, []);

  const getInProgressGradient = () => {
    switch (theme) {
      case "orangeWhite":
        return {
          colors: ["#FFC487", "#FFECD8"] as [string, string],
          start: { x: 0, y: 1 },
          end: { x: 0, y: 0 },
        };
      case "greenBlack":
        return {
          colors: ["#88CE5E", "#4A6639"] as [string, string],
          start: { x: 0, y: 0 },
          end: { x: 0, y: 1 },
        };
      case "blueWhite":
        return {
          colors: ["#9ed0ff", "#e3f2ff"] as [string, string],
          start: { x: 0, y: 0 },
          end: { x: 0, y: 1 },
        };
      default:
        return {
          colors: ["#88CE5E", "#4A6639"] as [string, string],
          start: { x: 0, y: 0 },
          end: { x: 0, y: 1 },
        };
    }
  };

  // 获取字典类型
  const getTypes = async () => {
    try {
      const res = await getUserTypeDictData("bonus_unlock_type");
      const dictData = (res.data?.data?.bonus_unlock_type ||
        res.data?.data ||
        []) as DictItem[];
      if (Array.isArray(dictData)) {
        setUnlockTypeDict(dictData);
      } else {
        setUnlockTypeDict([]);
      }
    } catch (err) {
      console.error(err);
      setUnlockTypeDict([]);
    }
  };

  // 获取任务类型标签
  const getUnlockLabel = (type: number) => {
    if (!Array.isArray(unlockTypeDict) || unlockTypeDict.length === 0) {
      return "--";
    }
    const target = unlockTypeDict.find((item) => Number(item.value) === type);
    return target ? target.label : "--";
  };

  // 显示规则弹窗
  const showRule = (ruleDesc: string = "") => {
    setCurrentRuleDesc(ruleDesc);
    setVisible(true);
  };

  // 日期格式化
  const dateChange = (timestamp: string | number | undefined) => {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp));
    const pad = (n: number) => n.toString().padStart(2, "0");
    const Y = date.getFullYear();
    const M = pad(date.getMonth() + 1);
    const D = pad(date.getDate());
    const h = pad(date.getHours());
    const m = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
  };

  // 格式化金额显示
  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return "0";
    return amount.toFixed(2);
  };

  // 获取列表
  const getBonusUnlockListFun = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const res = await getBonusUnlockList({});
      if (res.data.code === 0) {
        const listData = res.data.data ?? [];
        const processedData = listData.map(
          (item: any): BonusTaskItem => ({
            ...item,
            bonusUnlockId: String(item.bonusUnlockId),
            claimLoading: false,
          }),
        );
        setBonusUnlockList(processedData);
        // 设置进度条动画
        setTimeout(() => {
          setProgressValues(
            processedData.map((item: BonusTaskItem) => item.progressValue ?? 0),
          );
        }, 50);
      }
    } catch (err) {
      console.error("Failed to fetch records:", err);
    } finally {
      // 重置所有任务的 claimLoading
      setBonusUnlockList((prevList) =>
        prevList.map((item) => ({ ...item, claimLoading: false })),
      );
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // 领取任务
  const claim = async (item: BonusTaskItem) => {
    if (!item?.bonusUnlockId) return;
    if (item.claimLoading) return;

    setBonusUnlockList((prevList: BonusTaskItem[]) =>
      prevList.map((task: BonusTaskItem) =>
        task.bonusUnlockId === item.bonusUnlockId
          ? { ...task, claimLoading: true }
          : task,
      ),
    );

    try {
      // 使用 bonusUnlockId 作为 id 参数
      const res = await bonusUnlockClaim(item.bonusUnlockId);
      if (res.data.code === 0) {
        await getBonusUnlockListFun(false);
        return;
      }
      // 某些场景后端状态已变更但返回非 0，主动刷新一次避免卡片停留在 loading
      await getBonusUnlockListFun(false);
    } catch (err) {
      console.error("Claim failed:", err);
    } finally {
      setBonusUnlockList((prevList: BonusTaskItem[]) =>
        prevList.map((task: BonusTaskItem) =>
          task.bonusUnlockId === item.bonusUnlockId
            ? { ...task, claimLoading: false }
            : task,
        ),
      );
    }
  };

  const toTaskRecord = () => {
    navigation.push("my/balanceGold/record");
  };

  return (
    <SafeAreaView className={`flex-1 bg-${theme}-background`}>
      <HideScreenHeader
        title={t("pageName.bonusTask")}
        rightEvent={{
          rightText: t("pageName.taskRecord"),
          onRightPress: toTaskRecord,
        }}
      />

      {/* 内容 */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: Platform.OS === "android" ? 96 : 72,
        }}
      >
        {/* 头部 */}
        <ImageBackground
          source={require("@/assets/images/myCenter/wenli.png")}
          resizeMode="cover"
          className={`bg-${theme}-primary items-center pt-5 pb-10`}
          style={{
            backgroundColor: Colors[theme].primary,
          }}
        >
          <Image
            source={require("@/assets/images/myCenter/smallbonusTask.webp")}
            className="w-6 h-6 mb-4"
          />
          <Text
            style={{
              color: Colors[theme].btnText,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            {formatAmount(userInfo?.bonus)}
          </Text>
          <Text
            style={{
              color: Colors[theme].btnText,
              fontSize: rf(12),
              marginTop: 4,
            }}
          >
            {t("wallet.bonusBalance")}
          </Text>
        </ImageBackground>

        {/* 列表内容 */}
        <View className="px-3 -mt-5">
          {bonusUnlockList.map((item, i) => (
            <View key={item.bonusUnlockId || i} className="mb-3">
              {/* 宣传图 */}
              {item.coverImageURL && (
                <View className="relative rounded-lg overflow-hidden mb-2">
                  <Image
                    source={{ uri: item.coverImageURL }}
                    className="w-full"
                    style={{ width: "100%", aspectRatio: 351 / 158 }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => showRule(item.ruleDesc)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 24,
                      height: 24,

                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 10,
                    }}
                  >
                    <Icon
                      name="questioncircleo"
                      type="antdesign"
                      color={theme === "blackGreen" ? "#292c2b" : "#fff"}
                      size={14}
                    />
                  </TouchableOpacity>

                  {item.introduction && (
                    <View
                      className="absolute top-3"
                      style={{
                        width: "52%",
                        left:
                          item.optional?.bgCompositionType === 2 ? "47%" : "2%",
                      }}
                    >
                      <Text
                        className="text-white text-sm font-bold"
                        style={{
                          textAlign:
                            item.optional?.bgCompositionType === 2
                              ? "right"
                              : "left",
                          paddingHorizontal: 20,
                          paddingTop: 20,
                          paddingBottom: 3,
                        }}
                      >
                        {item.introduction}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              <View
                className={`bg-${theme}-cardBg1 rounded-lg p-2.5 shadow-md`}
                style={{
                  marginTop: item.coverImageURL ? -25 : 0,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* 顶部 */}
                <View className="flex-row items-center justify-between pb-2 border-b border-gray-200">
                  <Text
                    className={`text-${theme}-text font-medium`}
                    style={{ fontSize: rf(12) }}
                  >
                    {getUnlockLabel(item.unlockType)}
                  </Text>
                  {item.id ? (
                    <LinearGradient
                      colors={getInProgressGradient().colors}
                      start={getInProgressGradient().start}
                      end={getInProgressGradient().end}
                      style={styles.inProgressContainer}
                    >
                      <Svg width={10} height={25} style={styles.triangleSvg}>
                        <Path
                          d="M 0 0 L 10 12.5 L 0 25 Z"
                          fill={Colors[theme].cardBg1}
                        />
                      </Svg>
                      <View style={styles.inProgress}>
                        <Text
                          style={[
                            styles.inProgressText,
                            { color: Colors[theme].text },
                            { fontSize: rf(12) },
                          ]}
                        >
                          {t("status.inProgress")}
                        </Text>
                      </View>
                    </LinearGradient>
                  ) : (
                    <TouchableOpacity
                      className={`bg-${theme}-primary px-5 py-1.5 rounded-full`}
                      onPress={() => claim(item)}
                      disabled={item.claimLoading}
                    >
                      {item.claimLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text
                          className={`text-white`}
                          style={{ fontSize: rf(12) }}
                        >
                          {t("status.claim.claim")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {/* 进度条 */}
                {item.progressValue !== null &&
                  item.progressValue !== undefined && (
                    <View className="mt-2">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className={`text-${theme}-textGray text-xs`}>
                          {t("bonusTask.taskProgress")}
                        </Text>
                        <View className="flex-row items-center">
                          <Text
                            className={`text-${theme}-primary text-xs ${(item.progressCurrentValue ?? 0) > 0 ? "font-semibold" : ""}`}
                          >
                            {item.progressCurrentValue ?? 0}
                          </Text>
                          <Text
                            className={`text-${theme}-textGray text-xs ml-1`}
                          >
                            /{" "}
                            <Text className={`text-${theme}-text`}>
                              {item.optional?.rechargeAmount ?? 0}
                            </Text>
                          </Text>
                        </View>
                      </View>
                      <View
                        className={`h-2.5 bg-gray-200 rounded-full relative overflow-hidden`}
                      >
                        <View
                          className={`absolute h-full bg-${theme}-primary rounded-full`}
                          style={{
                            width: `${progressValues[i] ?? 0}%`,
                          }}
                        />
                      </View>
                    </View>
                  )}

                {/* 解锁金额 */}
                <View className="flex-row items-center justify-between mt-2">
                  <Text
                    className={`text-${theme}-textGray`}
                    style={{ fontSize: rf(12) }}
                  >
                    {t("bonusTask.unlockAmount")}
                  </Text>
                  <View className="flex-row items-center">
                    <Image
                      source={require("@/assets/images/myCenter/smallbonusTask.webp")}
                      className="w-4 h-4 "
                      style={{ width: 24, height: 24 }}
                    />
                    <Text
                      className={`text-${theme}-primary font-medium`}
                      style={{ fontSize: rf(12) }}
                    >
                      {formatAmount(item.amount)}
                    </Text>
                  </View>
                </View>

                {/* 过期时间 */}
                {item.endTime && (
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className={`text-${theme}-textGray text-xs`}>
                      {t("bonusTask.expiratioTime")}
                    </Text>
                    <Text className={`text-${theme}-textGray text-xs`}>
                      {dateChange(item.endTime)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* 无数据 */}
          {!loading && bonusUnlockList.length === 0 && (
            <View className="mt-12">
              <NoData />
            </View>
          )}
        </View>
      </ScrollView>

      {/* 规则说明弹窗 */}
      <CommonDialog
        visible={visible}
        setVisible={setVisible}
        title={t("active.center.activeRules")}
        titleHasBackground
      >
        <ScrollView className="py-2" style={{ maxHeight: 400 }}>
          <Text
            className={`text-${theme}-text`}
            style={{
              fontSize: 12,
              lineHeight: 22,
            }}
          >
            {currentRuleDesc || t("common.noData")}
          </Text>
        </ScrollView>
      </CommonDialog>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inProgressContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    marginRight: -10,
    height: 25,
    paddingLeft: 20,
    paddingRight: 15,
    overflow: "hidden",
  },
  triangleSvg: {
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 1,
  },
  inProgress: {
    height: 25,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 0,
  },
  inProgressText: {
    fontSize: 12,
    fontWeight: "400",
  },
});

export default BalanceGold;
