/**团队总览 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  DeviceEventEmitter,
} from "react-native";
import TeamInfomation from "./TeamInfomation"; //游戏信息
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { getTeamGameOverview, getUserTeamOverviewInfo } from "@/api";
import { useTranslation } from "react-i18next";
import { TeamGameOverviewItem, UserTeamOverviewInfo } from "@/types/my";
import { TimeRange } from "@/types";
import DateRangePicker from "@/components/common/DateRangePicker";
import { useToast } from "@/components/common/toast";
import { rf } from "@/utils/scaleFont";

const TeamOverview = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const [dateRange, setDateRange] = useState<TimeRange>();
  const [gameData, setGameData] = useState<TeamGameOverviewItem | null>(null);
  const [infoData, setInfoData] = useState<UserTeamOverviewInfo | null>(null);

  const tabList = [
    { name: t("agent.teamInformation") },
    { name: t("agent.gameInformation") },
  ];

  useEffect(() => {
    if (activeTab === 0) getUserTeamOverviewInfoData();
    else getTeamGameOverviewData();
  }, [dateRange, activeTab]);

  const getUserTeamOverviewInfoData = () => {
    if (!dateRange?.length) return;
    const params = { statsDate: dateRange };
    toast.loading(true);
    getUserTeamOverviewInfo(params)
      .then(({ data }) => {
        if (data.data) {
          setInfoData(data.data);
        } else {
          DeviceEventEmitter.emit("showErrMsg", {
            msg: data.msg || "Failed to get overview for user team",
          });
        }
      })
      .finally(() => {
        toast.loading(false);
      });
  };

  const getTeamGameOverviewData = () => {
    if (!dateRange?.length) return;
    const params = { statsDate: dateRange };
    toast.loading(true);
    getTeamGameOverview(params)
      .then(({ data }) => {
        if (data.data) {
          setGameData(data.data);
        } else {
          DeviceEventEmitter.emit("showErrMsg", {
            msg: data.msg || "Failed to get overview for team game",
          });
        }
      })
      .finally(() => {
        toast.loading(false);
      });
  };

  const handleTabPress = (index: number) => {
    setActiveTab(index);
  };

  const handleDateRangeConfirm = (range: TimeRange) => {
    setDateRange(range);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <View style={styles.teamContainer}>
            <View className="flex-row justify-between items-center">
              <View style={{ flex: 1 }}>
                <DateRangePicker onConfirm={handleDateRangeConfirm} showLabel />
              </View>
            </View>

            <View style={styles.box}>
              <View className="flex-row gap-[10px]">
                <View
                  className="flex-1"
                  style={[
                    styles.boxContent,
                    { backgroundColor: Colors[theme].cardBg1 },
                  ]}
                >
                  <Text style={styles.textTitle}>{t("wallet.balance")}</Text>
                  <Text style={styles.orangeText}>
                    {infoData?.balance || 0}
                  </Text>
                </View>
                <View
                  className="flex-1"
                  style={[
                    styles.boxContent,
                    { backgroundColor: Colors[theme].cardBg1 },
                  ]}
                >
                  <Text style={styles.textTitle}>
                    {t("agent.teamWithdrawal")}
                  </Text>
                  <Text style={styles.greenText}>
                    {Math.floor(infoData?.withdrawalAmount || 0)}
                  </Text>
                </View>
                <View
                  className="flex-1"
                  style={[
                    styles.boxContent,
                    { backgroundColor: Colors[theme].cardBg1 },
                  ]}
                >
                  <Text style={styles.textTitle}>{t("agent.teamDeposit")}</Text>
                  <Text style={styles.orangeText}>
                    {Math.floor(infoData?.depositAmount || 0)}
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-[10px]">
                <View
                  className="flex-1"
                  style={[
                    styles.boxContent,
                    { backgroundColor: Colors[theme].cardBg1 },
                  ]}
                >
                  <Text style={styles.textTitle}>
                    {t("agent.firstDepositCount")}
                  </Text>
                  <Text style={[styles.num, { color: Colors[theme].text }]}>
                    {infoData?.firstDepositCount || "0"}
                  </Text>
                </View>
                <View
                  className="flex-1"
                  style={[
                    styles.boxContent,
                    { backgroundColor: Colors[theme].cardBg1 },
                  ]}
                >
                  <Text style={styles.textTitle}>
                    {t("agent.proxyRebateAmount")}
                  </Text>
                  <Text style={styles.redText}>
                    {Math.floor(infoData?.rebateAmount || 0)}
                  </Text>
                </View>
                <View
                  className="flex-1"
                  style={[
                    styles.boxContent,
                    { backgroundColor: Colors[theme].cardBg1 },
                  ]}
                >
                  <Text style={styles.textTitle}>
                    {t("agent.newlyAddedPersonnel")}
                  </Text>
                  <Text style={[styles.num, { color: Colors[theme].text }]}>
                    {infoData?.newMemberCount || "0"}
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-[10px]">
                <View
                  className="flex-1"
                  style={[
                    styles.boxContent,
                    { backgroundColor: Colors[theme].cardBg1 },
                  ]}
                >
                  <Text style={styles.textTitle}>
                    {t("agent.threeNotLoginNum")}
                  </Text>
                  <Text style={[styles.num, { color: Colors[theme].text }]}>
                    {infoData?.threeDayNotLoginMemberCount || "0"}
                  </Text>
                </View>
                <View
                  className="flex-1"
                  style={[
                    styles.boxContent,
                    { backgroundColor: Colors[theme].cardBg1 },
                  ]}
                >
                  <Text style={styles.textTitle}>
                    {t("agent.currentNumber")}
                  </Text>
                  <Text style={[styles.num, { color: Colors[theme].text }]}>
                    {infoData?.onlineMemberCount || "0"}
                  </Text>
                </View>
                <View
                  className="flex-1"
                  style={[
                    styles.boxContent,
                    { backgroundColor: Colors[theme].cardBg1 },
                  ]}
                >
                  <Text style={styles.textTitle}>{t("agent.betNum")}</Text>
                  <Text style={styles.blueText}>
                    {infoData?.betMemberCount || "0"}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.longDiv,
                  { backgroundColor: Colors[theme].cardBg1 },
                ]}
              >
                <Text style={styles.head}>{t("agent.totalNumber")}</Text>
                <View style={styles.content}>
                  <View style={styles.foot}>
                    <Text style={styles.footText}>{t("agent.proxy")}:</Text>
                    <Text
                      style={[styles.footNum, { color: Colors[theme].text }]}
                    >
                      {infoData?.teamProxyCount || "0"}
                    </Text>
                  </View>
                  <View style={styles.foot}>
                    <Text style={styles.footText}>{t("agent.member")}:</Text>
                    <Text
                      style={[styles.footNum, { color: Colors[theme].text }]}
                    >
                      {infoData?.teamMemberCount || "0"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      case 1:
        return (
          <TeamInfomation data={gameData} onDateRangeChange={setDateRange} />
        );

      default:
        return null;
    }
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      //backgroundColor: '#ebecf3',
      //padding: 10,
    },
    tabContainer: {
      flexDirection: "row",
      marginHorizontal: 10,
      paddingVertical: 10,
    },
    tabItem: {
      position: "relative",
      overflow: "hidden",
      backgroundColor: Colors[theme].cardBg1,
      borderRadius: 5,
      paddingHorizontal: 5,
      paddingVertical: 5,
      flexDirection: "row",
      alignItems: "center",
      marginRight: 15,
    },
    activeTabItem: {
      backgroundColor: Colors[theme].primary,
    },
    tabText: {
      fontSize: rf(12),
      paddingHorizontal: 20,
      paddingVertical: 10,
      color: Colors[theme].text,
      textAlign: "center",
    },
    activeTabText: {
      color: "#fff",
    },
    teamContainer: {
      //paddingVertical: 15,
      paddingHorizontal: 10,
    },
    box: {
      gap: 10,
      paddingTop: 10,
    },
    boxContent: {
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: 5,
      flexDirection: "column",
      justifyContent: "space-around",
      paddingHorizontal: 10,
      paddingVertical: 15,
      fontWeight: "bold",
      minHeight: 100,
    },
    textTitle: {
      fontSize: rf(12),
      color: "#acafc2",
      textAlign: "center",
    },
    num: {
      color: "#202c2b",
      fontSize: rf(18),
    },
    orangeText: {
      color: Colors[theme].primary,
      fontSize: rf(18),
    },
    greenText: {
      color: "#49ce0b",
      fontSize: rf(18),
    },
    redText: {
      color: "#ff7172",
      fontSize: rf(18),
    },
    blueText: {
      color: "#5ca6ff",
      fontSize: rf(18),
    },
    longDiv: {
      backgroundColor: "#fff",
      padding: 0,
      height: "auto",
      borderRadius: 5,
    },
    head: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      color: "#acafc2",
    },
    foot: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      flexDirection: "row",
      flex: 1,
      textAlign: "left",
      alignItems: "center",
    },
    footText: {
      marginRight: 10,
      color: "#acafc2",
      fontSize: rf(12),
    },
    footNum: {
      fontSize: rf(18),
    },
    content: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
    },
  });

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      {/* 顶部标签栏 */}
      <View style={styles.tabContainer}>
        {tabList.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabItem,
              activeTab === index && styles.activeTabItem,
            ]}
            onPress={() => handleTabPress(index)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === index && styles.activeTabText,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}
    </View>
  );
};

export default TeamOverview;
