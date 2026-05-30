import { I18nText } from "@/components/I18nText";
import MyCenterDeposit1 from "@/components/icons/my/MyCenterDeposit1";
import MyCenterWithdraw1 from "@/components/icons/my/MyCenterWithdraw1";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { myTheme } from "../myConfg";
import ButtonOverlay from "./ButtonOverlay";
import { router } from "expo-router";

/**
 * 我的 type1：充值、提现入口
 */
export default function DepositWithdraw() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { theme } = useTheme();

  const cardItems = [
    {
      icon: MyCenterDeposit1,
      label: "pageName.recharge",
      onPress: () => router.navigate("/wallet/recharge"),
    },
    {
      icon: MyCenterWithdraw1,
      label: "pageName.withdraw",
      onPress: () => router.navigate("/wallet/withdraw"),
    },
  ];

  return (
    <View style={styles.cardBox}>
      <View style={styles.rechargeWithdrawRow}>
        {cardItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            className="flex-1"
            style={styles.actionButton}
            onPress={item.onPress}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[
                myTheme[theme].type1.depositWithdrawGradient.s,
                myTheme[theme].type1.depositWithdrawGradient.e,
              ]}
              style={[styles.buttonContent, { borderLeftColor: Colors[theme].primary }]}
            >
              <I18nText
                i18nKey={item.label}
                style={[styles.actionText, { color: Colors[theme].darkColor, fontSize: rf(14) }]}
                numberOfLines={1}
              />
              <View style={styles.depositWithdrawIconWrap}>
                <item.icon
                  themeColor={Colors[theme].primary}
                  secondaryColor={Colors[theme].themeColor1}
                  width={47}
                  height={40}
                />
              </View>
            </LinearGradient>
            <ButtonOverlay uniqueId="deposit" color={Colors[theme].primary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardBox: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 12,
  },
  rechargeWithdrawRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "flex-start",
    borderRadius: 9,
    position: "relative",
    overflow: "hidden",
    minHeight: 60,
  },
  buttonContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
    justifyContent: "space-between",
    borderRadius: 9,
    overflow: "hidden",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderLeftWidth: 3,
  },
  depositWithdrawIconWrap: {
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "flex-end",
    marginLeft: 8,
  },
  actionText: {
    fontWeight: "600",
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
});
