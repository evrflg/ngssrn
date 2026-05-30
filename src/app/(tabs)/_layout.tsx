import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { SelectLanguagePopup } from "@/components/common/lang/SelectLanguagePopup";
import TestUserPopup from "@/components/home/components/popup/TestUserPopup";

export default function TabLayout() {
  const { theme } = useTheme(); //主题
  const cardBg1 = useThemeColor({}, "cardBg1");
  const { t } = useTranslation();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[theme].primary,
          headerShown: false,
          tabBarStyle: {
            display: "none",
            height: 62,
            borderTopWidth: 0,
            elevation: 1,
            shadowOpacity: 0.2,
            backgroundColor: cardBg1,
          },
        }}
      >
        <Tabs.Screen redirect name="index" />
        <Tabs.Screen
          name="home"
          options={{
            title: t("pageName.homepage"),
          }}
        />
        <Tabs.Screen name="active" options={{ headerShown: false }} />
        <Tabs.Screen name="wallet" options={{ headerShown: false }} />
        <Tabs.Screen name="promotion" options={{ headerShown: false }} />
        <Tabs.Screen name="my" options={{ headerShown: false }} />
      </Tabs>
      <SelectLanguagePopup />
      <TestUserPopup />
    </>
  );
}
