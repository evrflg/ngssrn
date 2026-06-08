import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  buildHomeHrefWithEntryQuery,
  getCapturedEntryQuerySuffix,
  isWebRootEntryPath,
} from "@/utils/navigation/entryQuery";
import { Tabs, usePathname, useRootNavigationState, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { SelectLanguagePopup } from "@/components/common/lang/SelectLanguagePopup";
import TestUserPopup from "@/components/home/components/popup/TestUserPopup";

const isWeb = Platform.OS === "web";

export default function TabLayout() {
  const { theme } = useTheme(); //主题
  const cardBg1 = useThemeColor({}, "cardBg1");
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const navState = useRootNavigationState();
  const didPreserveEntryQueryRef = useRef(false);

  useEffect(() => {
    if (!isWeb || didPreserveEntryQueryRef.current || !navState?.key) return;
    const querySuffix = getCapturedEntryQuerySuffix();
    if (!querySuffix || typeof window === "undefined") return;

    const onRootEntry =
      isWebRootEntryPath(window.location.pathname) ||
      pathname === "/" ||
      pathname === "/(tabs)" ||
      pathname.endsWith("/index");

    const onHomeWithoutQuery =
      (pathname === "/home" || pathname.endsWith("/home")) &&
      !window.location.search;

    if (!onRootEntry && !onHomeWithoutQuery) return;

    didPreserveEntryQueryRef.current = true;
    router.replace(buildHomeHrefWithEntryQuery() as never);
  }, [pathname, router, navState]);

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
