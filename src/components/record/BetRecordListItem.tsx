import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { yearMonthDayHourMinSecond } from "../../assets/js/date";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";

// 游戏类型ID	游戏类型名称	图标
// 8	彩票	official_tab_icon
// 1	真人	real_tab_icon
// 6	棋牌	qipai_tab_icon
// 4	体育	sport_tab_icon
// 3	捕鱼	fishing_tab_icon
// 7	电竞	dianjing_tab_icon
// 2	电子	dianzi_tab_icon

export interface BetRecordItem {
  betTime: string;
  partnerName: string;
  validBet: number;
  betAmount: number;
  winLossAmount: number;
  gameName: string | null;
  playName: string | null;
  betNo: string | null; // 投注单号
  qiHao: string | null; // 期号
  feeMoney?: number | string | null;
}

export const BetRecordListItem: React.FC<{
  item: BetRecordItem;
  currentTabType: number;
  index: number;
  onItemPress?: (index: number, item: BetRecordItem) => void;
}> = ({ item, currentTabType: _currentTabType, index, onItemPress }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const getTimeText = (item: BetRecordItem) => {
    return yearMonthDayHourMinSecond(item.betTime);
  };

  const handlePress = () => {
    if (onItemPress) {
      onItemPress(index, item);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.itemContent, { backgroundColor: Colors[theme].btnText }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <View style={styles.leftContent}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: Colors[theme].text }]}>
              {item.partnerName}
            </Text>
            <Text
              style={[styles.headerDate, { color: Colors[theme].lightText }]}
            >
              {getTimeText(item)}
            </Text>
          </View>

          {item.gameName && (
            <View style={styles.listRow}>
              <Text
                style={styles.gameNameLabel}
                className={`text-${theme}-text`}
              >
                {item.gameName}
              </Text>
            </View>
          )}

          <View style={styles.listRow}>
            <View style={styles.listRowItem}>
              <Text
                style={styles.itemLabel}
                className={`text-${theme}-lightText`}
              >{`${t("betRecord.betAmount")}：`}</Text>
              <Text style={styles.itemLabel} className={`text-${theme}-text`}>
                {item.validBet}
              </Text>
            </View>
            <View style={styles.listRowItem}>
              <Text
                style={styles.itemLabel}
                className={`text-${theme}-lightText`}
              >{`${t("betRecord.winLossAmount")}：`}</Text>
              <Text
                style={[
                  styles.itemLabel,
                  { color: item.winLossAmount > 0 ? "#4caf50" : "#FF4500" },
                ]}
              >
                {item.winLossAmount}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rightIcon}>
          <Ionicons name="chevron-forward" size={16} color="#999" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContent: {
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 12,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flex: 1,
    gap: 8,
  },
  rightIcon: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerDate: {
    fontSize: 14,
    marginTop: 4,
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listRowItem: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  itemLabel: {
    fontSize: 14,
    textAlign: "left",
    writingDirection: "ltr",
  },
  gameNameLabel: {
    fontSize: 18,
    fontWeight: "300",
  },
});
