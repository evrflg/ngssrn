/** 团队总览-游戏信息*/
import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { TeamGameOverviewItem } from "@/types/my";
import DateRangePicker from "@/components/common/DateRangePicker";
import { TimeRange } from "@/types";

interface TeamInfoProps {
  data: TeamGameOverviewItem | null;
  onDateRangeChange?: (dateRange: TimeRange) => void;
}

type GameType =
  | "sport"
  | "egame"
  | "live"
  | "chess"
  | "esport"
  | "fishing"
  | "lottery";

const TeamInfomation = ({ data, onDateRangeChange }: TeamInfoProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleDateRangeChange = (newDateRange: TimeRange) => {
    onDateRangeChange?.(newDateRange);
  };

  if (!data) return null;

  const renderGameSection = (title: string, gameType: GameType) => {
    const betAmount = data[`${gameType}BetAmount`] || 0;
    const rebateAmount = data[`${gameType}CashbackAmount`] || 0;
    const winAmount = data[`${gameType}WinAmount`] || 0;
    const betNum = data[`${gameType}BetNum`] || 0;

    return (
      <View
        style={[styles.content, { backgroundColor: Colors[theme].cardBg1 }]}
      >
        <View style={styles.head}>
          <Text style={[styles.headText, { color: Colors[theme].text }]}>
            {title}
          </Text>
        </View>
        <View style={styles.foot}>
          <View style={[styles.footItem, { borderTopWidth: 0 }]}>
            <Text
              style={[
                styles.label,
                { textAlign: "left", writingDirection: "ltr" },
              ]}
            >
              {t("reports.betAmount")}：
            </Text>
            <Text
              style={[
                styles.num,
                styles.orangeText,
                {
                  color: Colors[theme].primary,
                  writingDirection: "ltr",
                  textAlign: "left",
                },
              ]}
            >
              {Math.floor(betAmount)}
            </Text>
          </View>
          <View
            style={[
              styles.footItem,
              {
                borderTopWidth: 0,
                borderLeftWidth: 2,
                borderLeftColor: Colors[theme].background,
              },
            ]}
          >
            <Text style={styles.label}>{t("reports.rebate")}：</Text>
            <Text style={[styles.num, { color: Colors[theme].text }]}>
              {Math.floor(rebateAmount)}
            </Text>
          </View>
          <View style={styles.footItem}>
            <Text style={styles.label}>{t("agent.winAmount")}：</Text>
            <Text style={[styles.num, styles.greenText]}>
              {Math.floor(winAmount)}
            </Text>
          </View>
          <View
            style={[
              styles.footItem,
              { borderLeftWidth: 2, borderLeftColor: Colors[theme].background },
            ]}
          >
            <Text style={styles.label}>{t("agent.realBettingMoney")}：</Text>
            <Text style={[styles.num, { color: Colors[theme].text }]}>
              {Math.floor(betNum)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 10,
    },
    content: {
      borderRadius: 5,
      width: "100%",
      marginBottom: 10,
      paddingHorizontal: 10,
    },
    head: {
      justifyContent: "center",
      alignItems: "center",
      padding: 5,
    },
    headText: {
      fontSize: 14,
      color: "#333",
    },
    foot: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    footItem: {
      width: "49.6%",
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      borderTopWidth: 2,
      borderTopColor: Colors[theme].background,
    },
    label: {
      fontSize: 12,
      color: Colors[theme].textGrayLight,
      writingDirection: "ltr",
    },
    num: {
      fontSize: 16,
      color: "#333",
      marginLeft: 8,
    },
    orangeText: {
      color: Colors.orangeWhite.primary,
    },
    greenText: {
      color: "#49ce0b",
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: Platform.OS === "android" ? 120 : 80,
      }}
    >
      <View style={{ marginBottom: 10 }}>
        <View className="flex-row justify-between items-center">
          <View style={{ flex: 1 }}>
            <DateRangePicker onConfirm={handleDateRangeChange} showLabel />
          </View>
        </View>
      </View>
      {renderGameSection(t("games.sport"), "sport")}
      {renderGameSection(t("games.egame"), "egame")}
      {renderGameSection(t("games.live"), "live")}
      {renderGameSection(t("games.chess"), "chess")}
      {renderGameSection(t("games.esport"), "esport")}
      {renderGameSection(t("games.fishing"), "fishing")}
      {renderGameSection(t("games.lottery"), "lottery")}
    </ScrollView>
  );
};

export default TeamInfomation;
