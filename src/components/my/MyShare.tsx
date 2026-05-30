/**我的分享 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  DeviceEventEmitter,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import DepositInformation from "./DepositInformation"; //存款信息
import { BonusInformation } from "./BonusInformation"; //奖金信息
import { getInviteOverview } from "@/api";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/common/toast";
import { rf } from "@/utils/scaleFont";

interface Data {
  // proxyId: string
  // newInfo: {
  //   todayRebatePrompActBonus: number
  //   otherSubRegCount: number
  //   teamRegCount: number
  //   totalBetBateMoney: number
  //   totalBetOrderNum: number
  //   totalWinLost: number
  //   directSubRegCount: number
  //   directSubBetBackMoney: number
  //   otherBetBackMoney: number
  //   rebatePrompActBonus: number
  //   lastBonus: number
  //   totalBetMoney: number
  // }
  todayDepositBackBonus: number;
  todayDepositNum: number;
  todayInviteRebate: number;
  todayInvitePerson: number;
  prompInfo: {
    linkUrl: string;
    code?: string;
  };
}

export const MyShare = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();
  const toast = useToast();

  const tabList = [
    {
      name: t("agent.invitationOverview"),
      bgImage: require("../../assets/images/agente/tab-bg0.png"),
    },
    {
      name: t("agent.depositInformation"),
      bgImage: require("../../assets/images/agente/tab-bg1.png"),
    },
    {
      name: t("agent.bonusInformation"),
      bgImage: require("../../assets/images/agente/tab-bg2.png"),
    },
  ];

  const [data, setData] = useState<Data>({
    todayDepositBackBonus: 0,
    todayDepositNum: 0,
    todayInviteRebate: 0,
    prompInfo: {
      linkUrl: "",
      code: "",
    },
    todayInvitePerson: 0,
  });

  // 复制文本到剪贴板
  const copyToClipboard = async (text: any) => {
    await Clipboard.setStringAsync(text);
    toast.success(t("common.copySuccess"));
  };

  const handleTabPress = (index: number) => {
    setActiveTab(index);
  };

  useEffect(() => {
    getInviteOverview().then(({ data }) => {
      if (data.data) {
        setData({
          prompInfo: {
            linkUrl: data.data.promLink || "",
            code: data.data.code || "",
          },
          todayDepositBackBonus: data.data.todayFirstDepositBonus || 0,
          todayInvitePerson: data.data.todayInvitePersons || 0,
          todayInviteRebate: data.data.todayProxyRebateMoney || 0,
          todayDepositNum: data.data.todayTotalDepositPersons || 0,
        });
      } else {
        DeviceEventEmitter.emit("showErrMsg", {
          msg: data.msg || "Failed to get invite overview",
        });
      }
    });
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <View>
            {/* 数据统计 */}
            <View
              style={[
                styles.statsContainer,
                { backgroundColor: Colors[theme].cardBg1 },
              ]}
            >
              {/* <View
                style={[
                  styles.statsRow,
                  {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: "#E5E5E5",
                  },
                ]}
              >
                <Text
                  className={`text-${theme}-text`}
                  style={[styles.statsLabel]}
                >
                  {t("agent.todayFirstDepositBonus")}：
                  <Text
                    className={`text-${theme}-primary text-[13px] font-black`}
                  >
                    {(data?.todayDepositBackBonus || 0).toFixed(2)}
                  </Text>
                </Text>
                <Text
                  className={`text-${theme}-text`}
                  style={[styles.statsLabel]}
                >
                  {t("dateRangePicker.today")}
                </Text>
              </View> */}
              <View style={styles.statsInfo}>
                <View
                  style={[
                    styles.statsItem,
                    {
                      borderRightWidth: StyleSheet.hairlineWidth,
                      borderRightColor: "#E5E5E5",
                    },
                  ]}
                >
                  {/** todayInviteRebate */}
                  <Text
                    style={[
                      styles.statsValue,
                      { color: Colors[theme].text, fontSize: rf(16) },
                    ]}
                  >
                    {data?.todayInvitePerson}
                  </Text>
                  <Text
                    style={[
                      styles.statsDesc,
                      { color: Colors[theme].text, fontSize: rf(12) },
                    ]}
                  >
                    {t("promotion.todayInvitePersonNum")}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statsItem,
                    {
                      borderRightWidth: StyleSheet.hairlineWidth,
                      borderRightColor: "#E5E5E5",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statsValue,
                      { color: Colors[theme].primary },
                      { fontSize: rf(16) },
                    ]}
                  >
                    {data?.todayInviteRebate}
                  </Text>
                  <Text
                    style={[
                      styles.statsDesc,
                      { color: Colors[theme].text, fontSize: rf(12) },
                    ]}
                  >
                    {t("agent.todayRebate")}
                  </Text>
                </View>
                <View style={styles.statsItem}>
                  <Text
                    style={[
                      styles.statsValue,
                      { color: Colors[theme].text, fontSize: rf(16) },
                    ]}
                  >
                    {data?.todayDepositNum}
                  </Text>
                  <Text
                    style={[
                      styles.statsDesc,
                      { color: Colors[theme].text, fontSize: rf(12) },
                    ]}
                  >
                    {t("agent.todayTotalTechargeUsers")}
                  </Text>
                </View>
              </View>
            </View>

            {/* 邀请链接 */}
            <View
              style={[
                styles.linkContainer,
                { backgroundColor: Colors[theme].cardBg1 },
              ]}
            >
              <View style={styles.linkRowMain}>
                <View style={styles.linkLabelWrap}>
                  <Text
                    className={`text-${theme}-textGray`}
                    style={[styles.linkLabel, { fontSize: rf(12) }]}
                  >
                    {t("agent.invitationLink")}：
                  </Text>
                </View>
                <Text
                  className={`text-${theme}-text`}
                  style={[styles.linkText, styles.linkTextFlex, { fontSize: rf(12) }]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {data.prompInfo?.linkUrl}
                </Text>
                <Pressable
                  style={[styles.copyButton, styles.copyButtonShrink]}
                  onPress={() => copyToClipboard(data?.prompInfo?.linkUrl)}
                >
                  <Ionicons
                    name="copy"
                    size={16}
                    color={Colors[theme].gray}
                    style={styles.copyIcon}
                  />
                </Pressable>
              </View>
            </View>

            {/* 邀请码 */}
            <View
              style={[
                styles.codeContainer,
                { backgroundColor: Colors[theme].cardBg1 },
              ]}
            >
              <View style={styles.linkRow}>
                <View style={styles.linkLabelWrap}>
                  <Text
                    className={`text-${theme}-textGray`}
                    style={[styles.linkLabel, { fontSize: rf(12) }]}
                  >
                    {t("agent.invitationCode")}：
                  </Text>
                </View>
                <Text
                  className={`text-${theme}-text`}
                  style={[styles.linkText, styles.linkTextFlex, { fontSize: rf(12) }]}
                >
                  {data?.prompInfo?.code}
                </Text>
                <Pressable
                  style={[styles.copyButton, styles.copyButtonShrink]}
                  onPress={() => copyToClipboard(data?.prompInfo?.code)}
                >
                  <Ionicons
                    name="copy"
                    size={16}
                    color={Colors[theme].gray}
                    style={styles.copyIcon}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        );
      case 1:
        return <DepositInformation />;
      case 2:
        return <BonusInformation />;
      default:
        return null;
    }
  };
  const styles = StyleSheet.create({
    container: {
      backgroundColor: Colors[theme].background,
      padding: 10,
    },
    tabContainer: {
      flexDirection: "row",
      paddingVertical: 10,
    },
    tabItem: {
      height: 50,
      position: "relative",
      borderRadius: 10,
      paddingHorizontal: 5,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    tabBgImage: {
      position: "absolute",
      width: 50,
      height: 50,
      right: -5,
      top: 10,
    },
    tabText: {
      fontSize: 12,
      color: Colors[theme].textGrayLight,
      zIndex: 1,
      position: "absolute",
      top: 10,
      left: 10,
      width: 60,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    activeTabText: {
      color: Colors[theme].btnText,
      fontWeight: 500,
    },
    content: {
      flex: 1,
    },
    statsContainer: {
      backgroundColor: "#fff",
      padding: 15,
      marginBottom: 10,
      borderRadius: 5,
    },
    statsInfo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 15,
      width: "100%",
    },
    statsItem: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      paddingVertical: 5,
    },
    statsValue: {
      fontSize: 16,
      color: "#333333",
      fontWeight: "bold",
      marginBottom: 5,
    },
    statsDesc: {
      fontSize: 12,
      color: "#666666",
      //alignItems: 'center',
      //justifyContent: 'center',
      textAlign: "center",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 10,
    },
    statsLabel: {
      fontSize: 12,
      color: "#333333",
    },
    linkContainer: {
      backgroundColor: "#fff",
      padding: 15,
      borderRadius: 8,
    },
    codeContainer: {
      backgroundColor: "#fff",
      padding: 15,
      marginTop: 10,
      borderRadius: 8,
    },
    linkRowMain: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    linkLabelWrap: {
      flexShrink: 0,
      marginRight: 8,
      maxWidth: "42%",
    },
    linkTextFlex: {
      flex: 1,
      minWidth: 0,
    },
    copyButtonShrink: {
      flexShrink: 0,
    },
    labelContainer: {
      flexDirection: "row",
    },
    linkLabel: {
      fontSize: 12,
      color: "#666",
      marginBottom: 4,
      textAlign: "left",
      writingDirection: "ltr",
    },
    linkText: {
      fontSize: 12,
    },
    copyButton: {
      padding: 8,
    },
    copyIcon: {
      transform: "scaleX(-1)",
    },
  });

  return (
    <View style={styles.container} className="flex-1">
      {/* 顶部标签栏 */}
      <View className="gap-2" style={styles.tabContainer}>
        {tabList.map((tab, index) => {
          const isActive = activeTab === index;
          return (
            <TouchableOpacity
              key={index}
              className="flex-1 overflow-hidden"
              onPress={() => handleTabPress(index)}
            >
              <LinearGradient
                colors={[
                  isActive ? Colors[theme].primary : Colors[theme].cardBg1,
                  isActive ? Colors[theme].gradient : "transparent",
                ]}
                style={[
                  styles.tabItem,
                  { boxShadow: `0px 3px 3px ${Colors[theme].shadowColor}` },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text
                  className="whitespace-nowrap"
                  style={[
                    styles.tabText,
                    activeTab === index && styles.activeTabText,
                    { fontSize: rf(12) },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {tab.name}
                </Text>
                <Image
                  source={tab.bgImage}
                  style={styles.tabBgImage}
                  resizeMode="cover"
                />
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>

      {renderContent()}
    </View>
  );
};

export default MyShare;
