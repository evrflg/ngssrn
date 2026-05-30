import BaseCard from "@/components/ui/list/BaseCard";
import {
  AboutIcon,
  AgentIcon,
  ChartIcon,
  LanguageIcon,
  Notice,
  SettingIcon,
  ThemeIcon,
  Bal,
  CustomerService,
  FeedbackIcon,
} from "./icons";
import { Colors } from "@/constants/Colors";
import { BaseRoute } from "@/constants/baseRoute";
import { useCommon } from "@/hooks/CommonProvider";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { LANGUAGE_NAME_MAP } from "@/lang/language";
import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import LogOutPopup from "../myPage/ng/common/LogOut";
import ThemePopup from "../myPage/ng/common/ThemePopup";
import { MyMenuCardItem, useMyMenu } from "../myPage/ng/common/hook/useMyMenu";

const Menu = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { language } = useCommon(); //语言
  const languageDisplayName = LANGUAGE_NAME_MAP.get(language) || language;
  const {
    themePopupRef,
    toShowLanguageModel,
    openThemeSheet,
    handlePress,
    unreadMessageCount,
    personalCenterThemeText,
  } = useMyMenu();

  const lastPressAtRef = useRef(0);
  const guardedHandlePress = useCallback(
    (item: MyMenuCardItem) => {
      const now = Date.now();
      if (now - lastPressAtRef.current < 1000) return;
      lastPressAtRef.current = now;
      handlePress(item);
    },
    [handlePress],
  );

  const card1Items: MyMenuCardItem[] = [
    {
      id: BaseRoute.message.id,
      icon: <Notice color={Colors[theme].primary} highlightColor={Colors[theme].themeColor1} />,
      label: t("pageName.messageCenter"),
      route: BaseRoute.message.route,
      value: unreadMessageCount > 0 ? t("my.unread", { count: unreadMessageCount }) : "",
    },
    {
      id: BaseRoute.agent.id,
      icon: <AgentIcon color={Colors[theme].primary} highlightColor={Colors[theme].themeColor1} />,
      label: t("agent.proxyManagement"),
      route: BaseRoute.agent.route,
    },
    {
      id: BaseRoute.report.id,
      icon: <ChartIcon color={Colors[theme].primary} highlightColor={Colors[theme].themeColor1} />,
      label: t("pageName.report"),
      route: BaseRoute.report.route,
    },
    {
      id: "language",
      icon: (
        <LanguageIcon color={Colors[theme].primary} highlightColor={Colors[theme].themeColor1} />
      ),
      label: t("my.chooseLang"),
      value: languageDisplayName,
      event: toShowLanguageModel,
    },
    {
      id: "theme",
      icon: <ThemeIcon color={Colors[theme].primary} highlightColor={Colors[theme].themeColor1} />,
      label: t("my.theme.themeText"),
      value: personalCenterThemeText,
      event: openThemeSheet,
    },
  ];

  const card2Items: MyMenuCardItem[] = [
    {
      id: BaseRoute.setting.id,
      icon: <SettingIcon fill="#ADB7BA" />,
      label: t("pageName.setTitle"),
      route: BaseRoute.setting.route,
    },
    {
      id: BaseRoute.feedback.id,
      icon: <FeedbackIcon fill="#ADB7BA" />,
      label: t("pageName.feedback"),
      route: BaseRoute.feedback.route,
    },
    {
      id: BaseRoute.customer.id,
      icon: <CustomerService fill="#ADB7BA" />,
      label: t("common.customerService"),
      route: BaseRoute.customer.route,
    },
    {
      id: BaseRoute.bonusTask.id,
      icon: <Bal fill="#ADB7BA" />,
      label: t("pageName.bonusTask"),
      route: BaseRoute.bonusTask.route,
    },
    {
      id: BaseRoute.about.id,
      icon: <AboutIcon fill="#ADB7BA" />,
      label: t("pageName.about"),
      route: BaseRoute.about.route,
    },
  ];

  const menuList = [card1Items, card2Items];

  return (
    <View>
      <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        {menuList.map((card, key) => (
          <BaseCard key={key} items={card} onPress={guardedHandlePress} />
        ))}
      </View>

      {/* 主题切换modal */}
      <ThemePopup ref={themePopupRef} />

      {/* 退出modal */}
      <LogOutPopup />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
});

export default Menu;
