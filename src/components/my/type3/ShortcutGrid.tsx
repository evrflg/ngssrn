import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import { Href, router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Type3Chrome } from "./type3Chrome";

/** 我的 type3：充值 / 提现 / 交易 / 投注 */
export default function ShortcutGrid() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const contentList = [
    {
      icon: require("./icons/deposit.png"),
      label: t("pageName.recharge"),
      path: "/wallet/recharge",
    },
    {
      icon: require("./icons/withdraw.png"),
      label: t("pageName.withdraw"),
      path: "/wallet/withdraw",
    },
    {
      icon: require("./icons/jiaoyi.png"),
      label: t("pageName.trade"),
      path: "/my/tranctionsRecord",
    },
    {
      icon: require("./icons/bet.png"),
      label: t("my.bet"),
      path: "/my/betRecord",
    },
  ];

  const goDetail = (path: Href) => {
    router.navigate(path);
  };

  return (
    <View style={styles.content}>
      {contentList.map((item, i) => (
        <Type3Chrome key={i} variant="tile" containerStyle={styles.detailBox}>
          <TouchableOpacity
            style={styles.contentItem}
            onPress={() => goDetail(item.path as Href)}
            activeOpacity={0.7}
          >
            <Text style={[styles.contentLabel, { color: Colors[theme].text, fontSize: rf(14) }]}>
              {item.label}
            </Text>
            <Image source={item.icon} style={styles.iconImg} />
          </TouchableOpacity>
        </Type3Chrome>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: rf(12),
    columnGap: 0,
  },
  detailBox: {
    width: "48%",
    minHeight: 64,
  },
  contentItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    minHeight: 64,
  },
  iconImg: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  contentLabel: {
    fontWeight: "500",
    flexShrink: 1,
  },
});
