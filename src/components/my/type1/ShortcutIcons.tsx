import KickbackBetIcon from "@/components/icons/my/KickbackBetIcon";
import ScoreIcon from "@/components/icons/my/ScoreIcon";
import TradeIcon from "@/components/icons/my/TradeIcon";
import Wallet from "@/components/icons/my/Wallet";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/** 我的 type1：钱包、投注、账变、积分四个快捷入口 */
export default function ShortcutIcons() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const IconItems = [
    {
      icon: Wallet,
      label: t("pageName.wallet"),
      onPress: () => router.navigate("/wallet"),
    },
    {
      icon: KickbackBetIcon,
      label: t("my.bet"),
      onPress: () => router.navigate("/my/betRecord"),
    },
    {
      icon: TradeIcon,
      label: t("pageName.trade"),
      onPress: () => router.navigate("/my/tranctionsRecord"),
    },
    {
      icon: ScoreIcon,
      label: t("pageName.pointsReward"),
      onPress: () => router.navigate("/my/pointBox"),
    },
  ];

  return (
    <View style={styles.iconNav}>
      {IconItems.map((item) => (
        <TouchableOpacity key={item.label} style={styles.iconItem} onPress={item.onPress}>
          <item.icon />
          <Text style={[styles.iconLabel, { color: Colors[theme].text, fontSize: rf(12) }]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  iconNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 4,
  },
  iconItem: {
    alignItems: "center",
    flex: 1,
  },
  iconLabel: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
    textAlign: "center",
  },
});
