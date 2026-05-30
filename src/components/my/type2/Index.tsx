/** 个人中心 type2 */
import { IndexHeader } from "@/components/home/IndexHeader";
import { getScrollBottomSpacer } from "@/config/layout/scrollBottomSpacer";
import { Colors } from "@/constants/Colors";
import { getType2ThemeTokens } from "@/hooks/cardThemeFactory";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { selectBottomNavigationType } from "@/store/user/selfConfig";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import BalanceRow from "./BalanceRow";
import DepositWithdraw from "./DepositWithdraw";
import Menu from "./Menu";
import ProfileCard from "./ProfileCard";

const Index = () => {
  const { theme } = useTheme();
  const bottomNavType = useSelector(selectBottomNavigationType);
  const borderCol = getType2ThemeTokens(theme).border;

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
        {/* 用户名、VIP */}
        <ProfileCard />
        {/* 余额区域与底部快捷图标 */}
        <View
          style={[
            styles.content,
            { backgroundColor: Colors[theme].cardBg1, borderLeftColor: borderCol },
          ]}
        >
          <BalanceRow />
          <DepositWithdraw />
        </View>
      </View>
      <Menu />
      <View style={{ height: getScrollBottomSpacer(bottomNavType) as any }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapContent: {
    gap: 10,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  content: {
    borderLeftWidth: 1,
    borderRadius: 8,
    padding: 15,
    flexShrink: 0,
  },
});

export default Index;
