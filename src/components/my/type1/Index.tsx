import { IndexHeader } from "@/components/home/IndexHeader";
import { getScrollBottomSpacer } from "@/config/layout/scrollBottomSpacer";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { selectBottomNavigationType } from "@/store/user/selfConfig";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import BalanceRow from "./BalanceRow";
import DepositWithdraw from "./DepositWithdraw";
import Menu from "./Menu";
import ProfileCard from "./ProfileCard";
import ShortcutIcons from "./ShortcutIcons";

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
      <View style={[styles.cardRoot, { backgroundColor: Colors[theme].background }]}>
        {/* 用户名、VIP */}
        <ProfileCard />
        {/* 充值、提现 */}
        <DepositWithdraw />
        {/* 余额区域与底部快捷图标 */}
        <View style={[styles.cardActions, { backgroundColor: Colors[theme].cardBg1 }]}>
          <BalanceRow />
          <ShortcutIcons />
        </View>
      </View>
      <Menu />
      <View style={{ height: getScrollBottomSpacer(bottomNavType) as any }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardRoot: {
    marginTop: 12,
  },
  cardActions: {
    marginHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
});

export default Index;
