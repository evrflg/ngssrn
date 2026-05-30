/** 个人中心 type3 */
import { IndexHeader } from "@/components/home/IndexHeader";
import { getScrollBottomSpacer } from "@/config/layout/scrollBottomSpacer";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { selectBottomNavigationType } from "@/store/user/selfConfig";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import BalanceRow from "./BalanceRow";
import Menu from "./Menu";
import Profile from "./Profile";
import ShortcutGrid from "./ShortcutGrid";
import { Type3Chrome } from "./type3Chrome";
import { rf } from "@/utils/scaleFont";

const Index = () => {
  const { theme } = useTheme();
  const bottomNavType = useSelector(selectBottomNavigationType);

  return (
    <ScrollView
      horizontal={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      pagingEnabled={false}
      stickyHeaderIndices={[0]}
      className={`hide-scrollbar bg-${theme}-background`}
    >
      <IndexHeader forceCompactTopOffset />
      <View style={styles.wrapContent}>
        <Type3Chrome variant="header" contentStyle={styles.headerChrome}>
          {/* 资料与 VIP */}
          <Profile />
          <BalanceRow />
        </Type3Chrome>
        <ShortcutGrid />
      </View>
      <Menu />
      <View style={{ height: getScrollBottomSpacer(bottomNavType) as any }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapContent: {
    gap: rf(10),
    marginTop: rf(12),
    paddingHorizontal: 12,
  },
  headerChrome: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 16,
    gap: rf(10),
  },
});

export default Index;
