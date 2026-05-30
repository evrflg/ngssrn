// 待办
import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SimpleHeader } from "@/components/common/Header";
import { beDealtTheme, activeTheme } from "@/components/active/components/activeConfg";
import BeDealtSetting from "@/components/active/beDealt/BeDealtSetting";
import { LinearGradient } from "expo-linear-gradient";
import { getBatchDictData, getWaitPickTasks, pickActs, pickAct } from "@/api";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Colors } from "@/constants/Colors";
import { useToast } from "@/components/common/toast";
import NoData from "@/components/common/NoData";
import dayjs from "dayjs";
import { SafeAreaView } from "react-native-safe-area-context";

const formatDay = "YYYY-MM-DD";
const beDealt = () => {
  const { theme } = useTheme();
  const toast = useToast();
  const { t } = useTranslation();
  const [pickTaskList, setPickTaskList] = useState<any>([]);
  const [totalMoney, setTotalMoney] = useState<number>(0.0);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [taskGeneralTargetDict, setTaskGeneralTargetDict] = useState<any[]>([]);
  const [taskNewbieTargetDict, setTaskNewbieTargetDict] = useState<any[]>([]);
  const [activityTypeDict, setActivityTypeDict] = useState<any[]>([]);
  const [rebateTypeDict, setRebateTypeDict] = useState<any[]>([]);

  useEffect(() => {
    fetchTargetDicts();
    fetchPickTask();
  }, []);

  const fetchTargetDicts = async () => {
    try {
      const res = await getBatchDictData(
        "task_general_target,task_newbie_target,task_type,rebate_type,activity_type",
      );
      if (res?.data?.code === 0) {
        const payload = res?.data?.data || {};
        setTaskGeneralTargetDict(
          Array.isArray(payload.task_general_target) ? payload.task_general_target : [],
        );
        setTaskNewbieTargetDict(
          Array.isArray(payload.task_newbie_target) ? payload.task_newbie_target : [],
        );
        setActivityTypeDict(Array.isArray(payload.activity_type) ? payload.activity_type : []);
        setRebateTypeDict(Array.isArray(payload.rebate_type) ? payload.rebate_type : []);
      }
    } catch {
      // 字典失败不阻塞页面；渲染时会兜底显示 "-"
    }
  };

  const getTaskTargetLabel = (item: any): string => {
    const sourceCatalog = String(item?.sourceCatalog ?? "");
    const sourceTypeNum = Number(item?.sourceType);

    // sourceCatalog=task_type：保留当前 taskTarget 匹配逻辑
    if (sourceCatalog === "task_type") {
      const dict = sourceTypeNum === 0 ? taskNewbieTargetDict : taskGeneralTargetDict;
      const target = String(item?.taskTarget ?? "");
      const matched = Array.isArray(dict)
        ? dict.find((d: any) => String(d?.value) === target)
        : undefined;
      return matched?.label ? String(matched.label) : "-";
    }

    // sourceCatalog=activity_type / rebate_type：按 sourceType 匹配 value 取 label
    if (sourceCatalog === "activity_type") {
      const matched = Array.isArray(activityTypeDict)
        ? activityTypeDict.find((d: any) => String(d?.value) === String(sourceTypeNum))
        : undefined;
      return matched?.label ? String(matched.label) : "-";
    }
    if (sourceCatalog === "rebate_type") {
      const matched = Array.isArray(rebateTypeDict)
        ? rebateTypeDict.find((d: any) => String(d?.value) === String(sourceTypeNum))
        : undefined;
      return matched?.label ? String(matched.label) : "-";
    }

    return "-";
  };

  const fetchPickTask = async () => {
    toast.loading(true);
    try {
      const res = await getWaitPickTasks();
      if (res.data.code == 0) {
        setPickTaskList(res.data.data);
        const total = res.data.data.reduce((sum: number, item: any) => {
          return sum + Number(item.rewardAmount || 0);
        }, 0);
        setTotalMoney(total.toFixed(2));
      }
    } catch (error) {
      toast.error(String(error));
      console.error("error:", error);
    } finally {
      toast.loading(false);
      setLoading(false);
    }
  };

  //传id领取单个，不传领取全部
  const goPickAct = async (id?: number) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;

    // 检查是否在6秒内重复点击
    if (timeDiff < 6000) {
      toast.warn(t("active.bedealt.norepeat"));
      setLastClickTime(currentTime);
      return;
    }
    setLastClickTime(currentTime);

    try {
      const res = id !== undefined && id !== null ? await pickAct({ id: id }) : await pickActs();

      if (res.data.code === 0) {
        toast.success(t("status.claim.claimSuccess"));
      } else {
        toast.error(res.data?.msg);
      }
    } catch (error) {
      toast.error(String(error));
      console.error("error:", error);
    } finally {
      await fetchPickTask();
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors[theme].background }}>
      <SimpleHeader title={t("pageName.beDealt")} />
      <ScrollView
        className={`hide-scrollbar flex-1 bg-${theme}-background`}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View
          className="overflow-hidden"
          style={[styles.topContainer, { backgroundColor: Colors[theme].cardBg1 }]}
        >
          <LinearGradient
            style={{
              flex: 1,
              paddingVertical: 16,
              justifyContent: "space-between",
              alignItems: "center",
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[activeTheme[theme].banner.s, activeTheme[theme].banner.e]}
          >
            <Text
              className="text-center font-bold"
              style={{ fontSize: 24, color: Colors[theme].text }}
            >
              {totalMoney}
            </Text>
            <Text className="fontSize={12} text-center" style={{ color: Colors[theme].text }}>
              {t("agent.bonus")}
            </Text>
            <TouchableOpacity
              style={[
                styles.btnTop,
                { backgroundColor: Colors[theme].primary },
                pickTaskList.length === 0 && { opacity: 0.5 },
              ]}
              onPress={() => {
                if (pickTaskList?.length === 0) {
                  toast.warn(t("active.bedealt.nojiangjin"));
                } else {
                  goPickAct();
                }
              }}
              disabled={pickTaskList.length === 0}
            >
              <LinearGradient
                style={styles.btnTopGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={[beDealtTheme[theme].btn.s, beDealtTheme[theme].btn.e]}
              />
              <View className="w-full h-full justify-center items-center">
                <Text className="fontSize={14}" style={{ color: Colors[theme].cardBg1 }}>
                  {t("active.bedealt.yijian")}
                </Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        {!isLoading &&
          (pickTaskList?.length === 0 ? (
            <View className="mx-auto my-16">
              <NoData />
            </View>
          ) : (
            <>
              {pickTaskList.map((item: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.itemBox,
                    {
                      backgroundColor: Colors[theme].cardBg1,
                      shadowColor: Colors[theme].cardBg1,
                    },
                  ]}
                >
                  <View className="w-full pb-2 flex-row justify-between items-center">
                    <Text className="fontSize={13}" style={{ color: Colors[theme].lightText }}>
                      {t("agent.bonus")}
                    </Text>
                    <Text className="fontSize={13}" style={{ color: Colors[theme].primary }}>
                      {item.rewardAmount || 0}
                    </Text>
                  </View>
                  <View className="w-full pb-2 flex-row justify-between items-center">
                    <Text className="fontSize={13}" style={{ color: Colors[theme].lightText }}>
                      {t("active.bedealt.name")}
                    </Text>
                    <Text className="fontSize={13}" style={{ color: Colors[theme].text }}>
                      {/* {BeDealtSetting.getRewardName(item, t)}{" "} */}
                      {item.rewardName ?? ""}
                    </Text>
                  </View>
                  <View className="w-full pb-2 flex-row justify-between items-center">
                    <Text className="fontSize={13}" style={{ color: Colors[theme].lightText }}>
                      {t("active.bedealt.mubiao")}
                    </Text>
                    <Text className="fontSize={13}" style={{ color: Colors[theme].text }}>
                      {getTaskTargetLabel(item)}
                    </Text>
                  </View>
                  <View className="w-full pb-2 flex-row justify-between items-center">
                    <Text className="fontSize={13}" style={{ color: Colors[theme].lightText }}>
                      {t("active.bedealt.shijian")}
                    </Text>
                    <Text className="fontSize={13}" style={{ color: Colors[theme].text }}>
                      {item.createTime ? dayjs(item.createTime).format(formatDay) : "-"}
                    </Text>
                  </View>
                  <View style={[styles.line, { borderBottomColor: beDealtTheme[theme].line }]} />
                  <View className="w-full pt-1 flex-row justify-between items-center">
                    <Text className="fontSize={13}" style={{ color: Colors[theme].lightText }}>
                      {t("common.statusText")}
                    </Text>

                    <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      colors={[beDealtTheme[theme].btn.s, beDealtTheme[theme].btn.e]}
                      style={styles.btnBottom}
                    >
                      <TouchableOpacity
                        className="w-full justify-center items-center px-4"
                        onPress={() => {
                          goPickAct(item.id);
                        }}
                      >
                        <Text className="fontSize={13}" style={{ color: Colors[theme].cardBg1 }}>
                          {BeDealtSetting.pickStatus(item, t)}
                        </Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                </View>
              ))}
              <View className="my-8 justify-center items-center">
                <Text className="fontSize={12}" style={{ color: Colors[theme].text }}>
                  {t("common.noMore")}
                </Text>
              </View>
            </>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  topContainer: {
    width: "100%",
    height: 140,
  },
  btnTop: {
    width: 313,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  btnTopGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  itemBox: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.10)",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  line: {
    width: "100%",
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  btnBottom: {
    height: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
export default beDealt;
