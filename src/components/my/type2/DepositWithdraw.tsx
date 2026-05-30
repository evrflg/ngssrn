import { Colors } from "@/constants/Colors";
import { getType2ThemeTokens } from "@/hooks/cardThemeFactory";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DepositIcon from "./icons/DepositIcon";
import WithdrawIcon from "./icons/WithdrawIcon";

/** 我的 type2：充值、提现入口 */
export default function DepositWithdraw() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const type2Theme = getType2ThemeTokens(theme);
  const borderCol = type2Theme.border;

  const handleClick = (type: "deposit" | "withdraw") => {
    if (type === "deposit") {
      router.push("/wallet/recharge");
    } else {
      router.push("/wallet/withdraw");
    }
  };

  return (
    <View style={styles.btns}>
      <TouchableOpacity
        style={[
          styles.btn,
          {
            borderColor: borderCol,
            backgroundColor: type2Theme.depositWithdrawBg,
          },
        ]}
        onPress={() => handleClick("deposit")}
        activeOpacity={0.85}
      >
        <DepositIcon width={30} height={30} />
        <Text style={[styles.btnText, { color: Colors[theme].text }]}>
          {t("pageName.recharge")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.btn,
          {
            borderColor: borderCol,
            backgroundColor: type2Theme.depositWithdrawBg,
          },
        ]}
        onPress={() => handleClick("withdraw")}
        activeOpacity={0.85}
      >
        <WithdrawIcon width={30} height={30} />
        <Text style={[styles.btnText, { color: Colors[theme].text }]}>
          {t("pageName.withdraw")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  btns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    marginLeft: 15,
    fontSize: 14,
  },
});
