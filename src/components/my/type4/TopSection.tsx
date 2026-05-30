import { getType4ThemeTokens } from "@/hooks/cardThemeFactory";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import BalanceRow from "./BalanceRow";
import Profile from "./Profile";
import { GradientBg } from "@/components/ui/gradient/GradientBg";

/** 我的 type4：顶部渐变头图 + 资料 + 余额行 */
export default function TopSection() {
  const { theme } = useTheme();
  const type4Theme = getType4ThemeTokens(theme);

  return (
    <View style={styles.header}>
      <GradientBg lineColors={type4Theme.headerGradient} style={StyleSheet.absoluteFillObject}>
        <Image
          source={require("./icons/headerBG.png")}
          style={styles.headerBG}
          resizeMode="cover"
        />
        <Profile />
        <BalanceRow />
      </GradientBg>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 274,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    position: "relative",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    overflow: "hidden",
  },
  headerBG: {
    height: "80%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
  },
});
