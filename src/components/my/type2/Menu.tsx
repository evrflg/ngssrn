import { Colors } from "@/constants/Colors";
import { BaseRoute } from "@/constants/baseRoute";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UnreadBadge } from "../myPage/ng/common/UnreadBadge";
import { getType2ThemeTokens } from "@/hooks/cardThemeFactory";
import LogOutPopup from "../myPage/ng/common/LogOut";
import ThemePopup from "../myPage/ng/common/ThemePopup";
import { useMyMenu } from "../myPage/ng/common/hook/useMyMenu";

// 导入所有图标组件
import {
  AboutIcon,
  AgentIcon,
  BetIcon,
  BonusTask,
  CustomerIcon,
  FeedBackIcon,
  LanguageIcon,
  MessageIcon,
  PointIcon,
  ReportIcon,
  SettingIcon,
  ThemeIcon,
  TradeIcon,
  VipIcon,
  WalletIcon,
} from "./icons";

export default function Menu() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { themePopupRef, handlePress, toShowLanguageModel, openThemeSheet, unreadMessageCount } =
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

  // 定义菜单数据数组
  const menuList = [
    // 第一行
    {
      id: BaseRoute.vip.id,
      icon: VipIcon,
      label: "VIP",
      route: BaseRoute.vip.route,
      width: 30,
      height: 30,
    },
    {
      id: BaseRoute.bet.id,
      icon: BetIcon,
      label: t("my.bet"),
      route: BaseRoute.bet.route,
      width: 30,
      height: 30,
    },
    {
      id: BaseRoute.report.id,
      icon: ReportIcon,
      label: t("pageName.report"),
      route: BaseRoute.report.route,
      width: 30,
      height: 30,
    },
    {
      id: BaseRoute.wallet.id,
      icon: WalletIcon,
      label: t("pageName.wallet"),
      route: BaseRoute.wallet.route,
      width: 32,
      height: 26,
    },

    // 第二行
    {
      id: BaseRoute.message.id,
      icon: MessageIcon,
      label: t("pageName.messageCenter"),
      route: BaseRoute.message.route,
      width: 30,
      height: 28,
    },
    {
      id: BaseRoute.setting.id,
      icon: SettingIcon,
      label: t("pageName.setTitle"),
      route: BaseRoute.setting.route,
      width: 31,
      height: 29,
    },
    {
      id: BaseRoute.agent.id,
      icon: AgentIcon,
      label: t("agent.proxyManagement"),
      route: BaseRoute.agent.route,
      width: 28,
      height: 26,
    },
    {
      id: "theme",
      icon: ThemeIcon,
      label: t("my.theme.themeText"),
      width: 31,
      height: 30,
      event: openThemeSheet,
    },

    // 第三行
    {
      id: BaseRoute.about.id,
      icon: AboutIcon,
      label: t("pageName.about"),
      route: BaseRoute.about.route,
      width: 30,
      height: 28,
    },
    {
      id: BaseRoute.feedback.id,
      icon: FeedBackIcon,
      label: t("pageName.feedback"),
      route: BaseRoute.feedback.route,
      width: 28,
      height: 30,
    },
    {
      id: BaseRoute.customer.id,
      icon: CustomerIcon,
      label: t("common.customerService"),
      route: BaseRoute.customer.route,
      width: 33,
      height: 30,
    },
    {
      id: "language",
      icon: LanguageIcon,
      label: t("my.chooseLang"),
      width: 32,
      height: 31,
      event: toShowLanguageModel,
    },

    // 第四行
    {
      id: BaseRoute.trade.id,
      icon: TradeIcon,
      label: t("pageName.trade"),
      route: BaseRoute.trade.route,
      width: 30,
      height: 29,
    },
    {
      id: BaseRoute.pointsReward.id,
      icon: PointIcon,
      label: t("pageName.pointsReward"),
      route: BaseRoute.pointsReward.route,
      width: 30,
      height: 30,
    },
    {
      id: BaseRoute.bonusTask.id,
      icon: BonusTask,
      label: t("pageName.bonusTask"),
      route: BaseRoute.bonusTask.route,
      width: 30,
      height: 30,
    },
  ];

  const menuLabelColor = getType2ThemeTokens(theme).menuLabel;

  return (
    <View style={styles.menuOuter}>
      <View style={[styles.footer, { backgroundColor: Colors[theme].cardBg1 }]}>
        {menuList.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.detail}
            onPress={() => guardedHandlePress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              {/* 角標需相對「圖示可視區」定位；勿用整欄 100% 寬當參考，否則會偏到隔壁欄 */}
              <View style={styles.iconAnchor}>
                {item.icon ? <item.icon width={item.width} height={item.height} /> : null}
                {item.id === BaseRoute.message.id ? (
                  <UnreadBadge count={unreadMessageCount} />
                ) : null}
              </View>
            </View>
            <Text style={[styles.label, { color: menuLabelColor, fontSize: rf(11) }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 主题切换modal */}
      <ThemePopup ref={themePopupRef} />

      {/* 退出modal */}
      <LogOutPopup />
    </View>
  );
}

const styles = StyleSheet.create({
  menuOuter: {
    marginTop: 10,
  },
  footer: {
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 15,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detail: {
    width: "25%", // 每行 4 个
    paddingVertical: 10,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  iconWrapper: {
    paddingVertical: 6,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  iconAnchor: {
    position: "relative",
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  logoutIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
