//返水
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import GameTab from "@/components/active/rebate/GameTab";
import { getGameType, getActiveData } from "@/api";
import { SimpleHeader } from "@/components/common/Header";
import ProPopup from "@/components/active/components/propopup/ProPopup";
import { vipTheme } from "@/components/active/components/activeConfg";
import NoData from "@/components/common/NoData";
import { useToast } from "@/components/common/toast";
import i18n from "i18next";

/**
 * 目前接口对应的规则
 *
 * @returns
 */
const rebate = () => {
  const [currentItem, setCurrentItem] = useState<string>("1");
  const [dataList, setDataList] = useState<any[]>([]);
  const [otherRebates, setOtherRebates] = useState<any[]>([]);
  const [dataRule, setDataRule] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [supportDegreeInfo, setSupportDegreeInfo] = useState<any[]>([]);
  const [showRules, setShowRules] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();

  const handleTabClick = async (tabItem: any) => {
    if (tabItem.value === currentItem) return;

    setCurrentItem(tabItem.value);
    if (dataList.length === 0) {
      await fetchTabList();
    } else {
      // 如果数据已存在，直接处理
      processRebateData(tabItem.value, dataList);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    toast.loading(true);
    setLoading(true);
    try {
      const [degreeRes, activeRes] = await Promise.all([
        getGameType({ type: "support_degree_info" }),
        getActiveData(),
      ]);

      if (degreeRes.data.code == 0) {
        setSupportDegreeInfo(degreeRes.data.data || []);
      }

      if (activeRes.data.code == 0 && activeRes.data.data?.ruleVOList) {
        setDataList(activeRes.data.data.ruleVOList);
        setDataRule({
          name: activeRes.data.data.rebateName,
          desc: activeRes.data.data.ruleDesc,
        });
        processRebateData(currentItem, activeRes.data.data.ruleVOList);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      toast.loading(false);
      setLoading(false);
    }
  };

  const fetchTabList = async () => {
    toast.loading(true);
    setLoading(true);
    try {
      const res = await getActiveData();
      if (res.data.code == 0 && res.data.data?.ruleVOList) {
        setDataList(res.data.data?.ruleVOList);
        processRebateData(currentItem, res.data.data?.ruleVOList);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      toast.loading(false);
      setLoading(false);
    }
  };

  const formatRebateText = (text: string) => {
    const isRTL = i18n.dir() === "rtl";
    if (isRTL) {
      return text.replace(/(\d+)%/g, "\u202A$1%\u202C");
    }
    return text;
  };

  const processRebateData = (gameTypeId: string, dataList: any[]) => {
    const map: Record<string, any> = {};

    dataList.forEach((item) => {
      const amount = item.validBetAmount;
      const ruleType = item.ruleType;
      const configData = item.config?.[gameTypeId];

      if (!configData) return;
      configData.forEach((platform: any) => {
        const code = platform.platformCode;
        const name = platform.platformName;
        const rate = platform.rate;
        const memberLevel = item.memberLevel;

        if (!map[code]) {
          map[code] = {
            platformCode: code,
            platformName: name,
            ruleType,
            list: [],
          };
        }

        map[code].list.push({ memberLevel, amount, rate });
      });
    });

    setOtherRebates(Object.values(map));
  };

  const getVipLabel = (memberLevel: string | number) => {
    const levelValue = String(memberLevel ?? "");
    if (levelValue == "0") return t("active.defaultLevel");

    const matchedVip = (supportDegreeInfo || []).find(
      (vip: any) => String(vip?.value) === levelValue,
    );
    return matchedVip?.label || t("active.defaultLevel");
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors[theme].background }}
    >
      <SimpleHeader
        title={t("pageName.rebate")}
        rightOption={
          <Pressable
            className="items-center flex-row mr-1"
            onPress={() => setShowRules(true)}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ fontSize: 14, color: Colors[theme].text }}
            >
              {t("active.vip.rules")}
            </Text>
          </Pressable>
        }
      />

      <ScrollView
        className={`hide-scrollbar flex-1 bg-${theme}-background`}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
      >
        <GameTab onTabClick={handleTabClick} />
        <View className="px-3">
          {loading ? (
            <Text
              className="self-center text-sm mt-8"
              style={{ color: Colors[theme].lightText }}
            >
              {t("common.loading")}
            </Text>
          ) : otherRebates.length > 0 ? (
            otherRebates.map((item: any, index: number) => {
              return (
                <View
                  key={`${item.platformCode}-${index}`}
                  className="w-full my-1"
                >
                  <LinearGradient
                    style={{
                      width: "100%",
                      padding: 8,
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    colors={[
                      Colors[theme].gradientEnd,
                      Colors[theme].primary,
                      Colors[theme].gradientStart,
                    ]}
                  >
                    <Text
                      style={{ fontSize: 14, color: Colors[theme].btnText }}
                    >
                      {item.platformName}
                    </Text>
                  </LinearGradient>

                  {item.list.map((rule: any, ruleIndex: number) => (
                    <View
                      style={{
                        width: "100%",
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 4,
                        backgroundColor: Colors[theme].cardBg1,
                      }}
                      key={`${item.platformCode}-rule-${ruleIndex}`}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: Colors[theme].lightText,
                          textAlign: "right",
                          width: "100%",
                        }}
                      >
                        {formatRebateText(
                          item.ruleType === 0
                            ? `${t("active.rebate.betAmountGet", { amount: rule.amount, rate: rule.rate })}`
                            : `${t("active.rebate.levelGet", { level: getVipLabel(rule.memberLevel), rate: rule.rate })}`,
                        )}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })
          ) : (
            <View className="mx-auto my-16 justify-center items-center">
              <NoData />
            </View>
          )}
        </View>
      </ScrollView>
      {showRules && (
        <ProPopup
          visible
          title={t(dataRule?.name || "active.vip.rules")}
          onClose={() => setShowRules(false)}
        >
          <View
            className="w-full p-4 mb-1 rounded-md"
            style={{ backgroundColor: vipTheme[theme].boxborder }}
          >
            <Text
              className="text-left self-start"
              style={{ fontSize: 12, color: Colors[theme].lightText }}
            >
              {dataRule?.desc || t("common.noConfig")}
            </Text>
          </View>
        </ProPopup>
      )}
    </SafeAreaView>
  );
};

export default rebate;
