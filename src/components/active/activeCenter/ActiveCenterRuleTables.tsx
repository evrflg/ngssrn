import React from "react";
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { rf } from "@/utils/scaleFont";

type RuleRow = {
  depositMoney?: string;
  requirementValue?: number;
  rewardValue?: number;
  rewardType?: string;
};

export function ActiveCenterRescueFundsTable({
  themeKey,
  t,
  colors,
  missionTheme,
  ruleVOList,
  containerStyle,
}: {
  themeKey: string;
  t: (k: string) => string;
  colors: { background: string; text: string };
  missionTheme: any;
  ruleVOList?: RuleRow[];
  containerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.bonusView, { backgroundColor: colors.background }, containerStyle]}>
      <LinearGradient
        colors={[missionTheme[themeKey].checkBox.s, missionTheme[themeKey].checkBox.e]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.bonusRow]}
      >
        <Text
          style={[
            styles.bonusCell,
            { fontSize: rf(14), fontWeight: "600", color: colors.text },
          ]}
        >
          {t("pageName.rescueFunds")}
        </Text>
        <Text
          style={[
            styles.bonusCell,
            { fontSize: rf(14), fontWeight: "600", color: colors.text },
          ]}
        >
          {t("common.typeText")}
        </Text>
        <Text
          style={[
            styles.bonusCell,
            { fontSize: rf(14), fontWeight: "600", color: colors.text },
          ]}
        >
          {t("agent.bonus")}
        </Text>
      </LinearGradient>

      {ruleVOList?.map((item, index) => (
        <View
          key={index}
          style={[
            styles.bonusRow,
            index % 2 === 0
              ? { backgroundColor: missionTheme[themeKey].content.a }
              : { backgroundColor: missionTheme[themeKey].content.b },
          ]}
        >
          <Text style={[styles.bonusCell, { color: colors.text }]}>
            {`≥${item.requirementValue}`}
          </Text>
          <Text style={[styles.bonusCell, { color: colors.text }]}>
            {item.rewardType === "FIXED_AMOUNT"
              ? t("active.center.fixedValue")
              : t("active.center.proportion")}
          </Text>
          <Text style={[styles.bonusCell, { color: colors.text }]}>
            {item.rewardValue}
            {item.rewardType === "FIXED_AMOUNT" ? "" : "%"}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function ActiveCenterStandardTable({
  themeKey,
  colors,
  missionTheme,
  headerLeftText,
  headerRightText,
  activityType,
  ruleVOList,
  containerStyle,
}: {
  themeKey: string;
  colors: { background: string; text: string };
  missionTheme: any;
  headerLeftText: string;
  headerRightText: string;
  activityType: number;
  ruleVOList?: RuleRow[];
  containerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.bonusView, { backgroundColor: colors.background }, containerStyle]}>
      <LinearGradient
        colors={[missionTheme[themeKey].checkBox.s, missionTheme[themeKey].checkBox.e]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.bonusRow]}
      >
        <Text
          style={[
            styles.bonusCell,
            { fontSize: rf(14), fontWeight: "600", color: colors.text },
          ]}
        >
          {headerLeftText}
        </Text>
        <Text
          style={[
            styles.bonusCell,
            { fontSize: rf(14), fontWeight: "600", color: colors.text },
          ]}
        >
          {headerRightText}
        </Text>
      </LinearGradient>

      {ruleVOList?.map((item, index) => (
        <View
          key={index}
          style={[
            styles.bonusRow,
            index % 2 === 0
              ? { backgroundColor: missionTheme[themeKey].content.a }
              : { backgroundColor: missionTheme[themeKey].content.b },
          ]}
        >
          <Text style={[styles.bonusCell, { color: colors.text, fontSize: rf(12) }]}>
            {Number(activityType) != 5 && "≥"}
            {Number(activityType) == 3 || Number(activityType) == 5
              ? item.depositMoney
              : item.requirementValue}
          </Text>
          <Text style={[styles.bonusCell, { color: colors.text, fontSize: rf(12) }]}>
            {item.rewardValue}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bonusView: {
    borderRadius: 8,
    width: "100%",
    overflow: "hidden",
  },
  bonusRow: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignContent: "center",
  },
  bonusCell: {
    width: "50%",
    alignItems: "center",
    alignContent: "center",
    textAlign: "center",
    fontSize: 12,
  },
});

