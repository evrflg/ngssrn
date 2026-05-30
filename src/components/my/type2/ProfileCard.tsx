import { getType2ThemeTokens } from "@/hooks/cardThemeFactory";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import UserProfileHeader from "../UserProfileHeader";
import UserProfileVip from "../UserProfileVip";
import { GradientBg } from "@/components/ui/gradient/GradientBg";

/** 我的 type2：渐变头部、资料与 VIP；点击进入设置中心 */
export default function ProfileCard() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { theme } = useTheme();
  const type2Theme = getType2ThemeTokens(theme);
  const borderCol = type2Theme.border;
  const lineColors = type2Theme.linearGradient;

  return (
    <GradientBg lineColors={lineColors} style={[styles.header, { borderLeftColor: borderCol }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.push("my/settingCenter");
        }}
      >
        <UserProfileHeader backgroundColor="transparent" />
      </TouchableOpacity>
      <UserProfileVip showBetIcon />
    </GradientBg>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 1,
    gap: 10,
  },
});
