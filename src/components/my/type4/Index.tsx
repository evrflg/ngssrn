/** 个人中心 type4 */
import { IndexHeader } from "@/components/home/IndexHeader";
import { getScrollBottomSpacer } from "@/config/layout/scrollBottomSpacer";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { selectBottomNavigationType } from "@/store/user/selfConfig";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import Menu from "./Menu";
import ShortcutGrid from "./ShortcutGrid";
import TopSection from "./TopSection";
import VipProgress from "./VipProgress";

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
      <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        {/* 顶部渐变头图 + 用户信息 + 余额行 */}
        <TopSection />
        <View style={styles.contentBox}>
          {/* 充值、提现 */}
          <ShortcutGrid />
          {/* VIP 等级轮播 */}
          <VipProgress />
        </View>
      </View>
      <Menu />
      <View style={{ height: getScrollBottomSpacer(bottomNavType) as any }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
  },
  contentBox: {
    paddingHorizontal: 12,
    marginTop: -86,
    zIndex: 1,
  },
});

export default Index;
