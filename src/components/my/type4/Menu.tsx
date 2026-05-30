import BaseCard from "@/components/ui/list/BaseCard";
import { Colors } from "@/constants/Colors";
import { BaseRoute } from "@/constants/baseRoute";
import { useCommon } from "@/hooks/CommonProvider";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { LANGUAGE_NAME_MAP } from "@/lang/language";
import { RootState } from "@/store/store";
import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import LogOutPopup from "../myPage/ng/common/LogOut";
import ThemePopup from "../myPage/ng/common/ThemePopup";
import { MyMenuCardItem, useMyMenu } from "../myPage/ng/common/hook/useMyMenu";
import {
  AboutUsIcon,
  BonusTask,
  CellAgent,
  CustomerIcon,
  FeekBackIcon,
  LanguageIcon,
  MessageIcon,
  PointIcon,
  ReportIcon,
  SettingIcon,
  ThemeIcon,
  WalletIcon,
} from "./icons";

export default function Menu() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { language } = useCommon();
  const languageDisplayName = LANGUAGE_NAME_MAP.get(language) || language;
  const {
    unreadMessageCount,
    personalCenterThemeText,
    themePopupRef,
    toShowLanguageModel,
    openThemeSheet,
    handlePress,
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

  const userInfo = useSelector((state: RootState) => state?.user?.userInfo) as
    | { engage?: number | null }
    | undefined;
  const engageMenuValue = `${userInfo?.engage ?? ""}`;

  // 定义三个卡片的菜单数据
  const card1Items: MyMenuCardItem[] = [
    {
      id: BaseRoute.wallet.id,
      icon: <WalletIcon width={25} height={25} fill={Colors[theme].primary} />,
      label: t("pageName.wallet"),
      route: BaseRoute.wallet.route,
    },
    {
      id: BaseRoute.pointsReward.id,
      icon: <PointIcon width={25} height={25} fill={"#FFB700"} />,
      label: t("pageName.pointsReward"),
      route: BaseRoute.pointsReward.route,
      value: engageMenuValue,
    },
    {
      id: BaseRoute.bonusTask.id,
      icon: <BonusTask width={25} height={25} fill={"#FFD66D"} />,
      label: t("pageName.bonusTask"),
      route: BaseRoute.bonusTask.route,
    },
    {
      id: BaseRoute.agent.id,
      icon: <CellAgent width={25} height={25} fill={"#A355E8"} />,
      label: t("agent.proxyManagement"),
      route: BaseRoute.agent.route,
    },
    {
      id: BaseRoute.report.id,
      icon: <ReportIcon width={25} height={25} fill={Colors.blueWhite.primary} />,
      label: t("pageName.report"),
      route: BaseRoute.report.route,
    },
  ];

  const card2Items: MyMenuCardItem[] = [
    {
      id: "language",
      icon: <LanguageIcon width={25} height={25} fill={Colors[theme].primary} />,
      label: t("my.chooseLang"),
      value: languageDisplayName,
      event: toShowLanguageModel,
    },
    {
      id: "theme",
      icon: <ThemeIcon width={25} height={25} fill={Colors[theme].primary} />,
      label: t("my.theme.themeText"),
      value: personalCenterThemeText,
      event: openThemeSheet,
    },
    {
      id: BaseRoute.setting.id,
      icon: <SettingIcon width={25} height={25} fill={Colors[theme].primary} />,
      label: t("pageName.setTitle"),
      route: BaseRoute.setting.route,
    },
  ];

  const card3Items: MyMenuCardItem[] = [
    {
      id: BaseRoute.feedback.id,
      icon: <FeekBackIcon width={25} height={25} fill={Colors[theme].primary} />,
      label: t("pageName.feedback"),
      route: BaseRoute.feedback.route,
    },
    {
      id: BaseRoute.customer.id,
      icon: <CustomerIcon width={25} height={25} fill={Colors[theme].primary} />,
      label: t("common.customerService"),
      route: BaseRoute.customer.route,
    },
    {
      id: BaseRoute.message.id,
      icon: <MessageIcon width={25} height={25} fill={Colors[theme].primary} />,
      label: t("pageName.messageCenter"),
      route: BaseRoute.message.route,
      value: unreadMessageCount > 0 ? `${t("my.unread", { count: unreadMessageCount })}` : "",
    },
    {
      id: BaseRoute.about.id,
      icon: <AboutUsIcon width={25} height={25} fill={Colors[theme].primary} />,
      label: t("pageName.about"),
      route: BaseRoute.about.route,
    },
  ];

  const menuList = [card1Items, card2Items, card3Items];

  return (
    <View>
      <View style={styles.container}>
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
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
});
