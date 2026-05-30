import { Colors } from "@/constants/Colors";
import { BaseRoute } from "@/constants/baseRoute";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UnreadBadge } from "../myPage/ng/common/UnreadBadge";
import LogOutPopup from "../myPage/ng/common/LogOut";
import ThemePopup from "../myPage/ng/common/ThemePopup";
import { useMyMenu } from "../myPage/ng/common/hook/useMyMenu";
import { Type3Chrome } from "./type3Chrome";

export default function Menu() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { themePopupRef, toShowLanguageModel, openThemeSheet, handlePress, unreadMessageCount } =
    useMyMenu();

  const lastPressAtRef = useRef(0);
  const guardedHandlePress = useCallback(
    (item: any) => {
      const now = Date.now();
      if (now - lastPressAtRef.current < 1000) return;
      lastPressAtRef.current = now;
      handlePress(item);
    },
    [handlePress],
  );

  const menuList = [
    {
      id: BaseRoute.vip.id,
      icon: require("./icons/vip.png"),
      label: "VIP",
      route: BaseRoute.vip.route,
    },
    {
      id: BaseRoute.agent.id,
      icon: require("./icons/agent.png"),
      label: t("agent.proxyManagement"),
      route: BaseRoute.agent.route,
    },
    {
      id: BaseRoute.report.id,
      icon: require("./icons/report.png"),
      label: t("pageName.report"),
      route: BaseRoute.report.route,
    },
    {
      id: "language",
      icon: require("./icons/language.png"),
      label: t("my.chooseLang"),
      event: toShowLanguageModel,
    },
    {
      id: "theme",
      icon: require("./icons/theme.png"),
      label: t("my.theme.themeText"),
      event: openThemeSheet,
    },
    {
      id: BaseRoute.wallet.id,
      icon: require("./icons/wallet.png"),
      label: t("pageName.wallet"),
      route: BaseRoute.wallet.route,
    },
    {
      id: BaseRoute.about.id,
      icon: require("./icons/aboutUs.png"),
      label: t("pageName.about"),
      route: BaseRoute.about.route,
    },
    {
      id: BaseRoute.feedback.id,
      icon: require("./icons/feedback.png"),
      label: t("pageName.feedback"),
      route: BaseRoute.feedback.route,
    },
    {
      id: BaseRoute.message.id,
      icon: require("./icons/message.png"),
      label: t("pageName.messageCenter"),
      route: BaseRoute.message.route,
    },
    {
      id: BaseRoute.customer.id,
      icon: require("./icons/customer.png"),
      label: t("common.customerService"),
      route: BaseRoute.customer.route,
    },
    {
      id: BaseRoute.pointsReward.id,
      icon: require("./icons/point.png"),
      label: t("pageName.pointsReward"),
      route: BaseRoute.pointsReward.route,
    },
    {
      id: BaseRoute.setting.id,
      icon: require("./icons/setting.png"),
      label: t("pageName.setTitle"),
      route: BaseRoute.setting.route,
    },
    {
      id: BaseRoute.bonusTask.id,
      icon: require("./icons/bonusTask.png"),
      label: t("pageName.bonusTask"),
      route: BaseRoute.bonusTask.route,
    },
  ];

  return (
    <View>
      <Type3Chrome
        variant="footer"
        containerStyle={styles.footerChromeContainer}
        contentStyle={styles.footerChromeContent}
      >
        {menuList.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.detail}
            onPress={() => guardedHandlePress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWithBadge}>
              <View
                style={[styles.footerIconCell, { backgroundColor: Colors[theme].type3SmallIconBg }]}
              >
                <Image source={item.icon} style={styles.footerIconImg} />
              </View>
              {item.id === BaseRoute.message.id ? <UnreadBadge count={unreadMessageCount} /> : null}
            </View>
            <Text style={[styles.label, { color: "#888", fontSize: rf(11) }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </Type3Chrome>

      <ThemePopup ref={themePopupRef} />
      <LogOutPopup />
    </View>
  );
}

const styles = StyleSheet.create({
  footerChromeContainer: {
    marginHorizontal: 12,
    marginTop: rf(12),
    marginBottom: rf(8),
  },
  footerChromeContent: {
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detail: {
    width: "25%",
    paddingVertical: 10,
    flexDirection: "column",
    alignItems: "center",
  },
  iconWithBadge: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  footerIconCell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    padding: 11,
  },
  footerIconImg: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
  label: {
    marginTop: 6,
    lineHeight: 13.2,
    textAlign: "center",
    paddingHorizontal: 4,
  },
});
