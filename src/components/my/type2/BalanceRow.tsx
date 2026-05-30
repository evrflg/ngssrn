import { Colors } from "@/constants/Colors";
import { reedType, reedUrl } from "@/constants/reedData";
import { getType2ThemeTokens } from "@/hooks/cardThemeFactory";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { stationConfig } from "@/store/tenant/tenantSlice";
import { rf } from "@/utils/scaleFont";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import BonusWalletExplainModal from "../BonusWalletExplainModal";
import { BalanceText } from "../myPage/ng/common/money/Balance";
import { BonusText } from "../myPage/ng/common/money/Bonus";
import { NgText } from "../myPage/ng/common/money/Ng";
import BitcoinIcon from "./icons/BitcoinIcon";
import CoinIcon from "./icons/CoinIcon";
import HeaderTextIcon from "./icons/HeaderTextIcon";
import MoneyIcon from "./icons/MoneyIcon";
import { GradientBg } from "@/components/ui/gradient/GradientBg";

/**
 * 我的 type2：账户余额标题与主余额、彩金、虚拟币展示；彩金旁问号打开说明弹窗。
 */
export default function BalanceRow() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [bonusExplainOpen, setBonusExplainOpen] = useState(false);
  const siteConfig = useSelector(stationConfig);

  const type2Theme = getType2ThemeTokens(theme);
  const borderCol = type2Theme.border;
  const lineColors = type2Theme.linearGradient;
  const vipLabel = type2Theme.moneyCardLabel;
  const amountMuted = Colors[theme].text;
  /** 与 BalanceText（text-*-primary）一致，避免用 moneyIconColor 导致图标偏浅 */
  const balanceAccent = Colors[theme].primary;

  const goXnWallet = () => {
    router.navigate({ pathname: reedUrl, params: { toType: reedType.coinWallet } });
  };

  return (
    <>
      <View style={styles.headText}>
        <HeaderTextIcon fill={Colors[theme].primary} />
        <Text style={[styles.headTextLabel, { color: Colors[theme].text }]}>
          {t("wallet.withdraw.accountBalance")}
        </Text>
      </View>

      <View style={styles.moneyBox}>
        <GradientBg
          lineColors={lineColors}
          style={[styles.moneyRight, { borderRightColor: borderCol }]}
        >
          <MoneyIcon fill={balanceAccent} />
          <View style={styles.moneyInfo}>
            <Text style={[styles.moneyLabel, { color: vipLabel, fontSize: rf(12) }]}>
              {t("wallet.balance")}
            </Text>
            <BalanceText
              className={`text-${theme}-primary`}
              style={[styles.moneyValue, { fontSize: rf(14) }]}
            />
          </View>
        </GradientBg>

        <View style={styles.moneyLeft}>
          <GradientBg
            lineColors={lineColors}
            style={[styles.money2, { borderRightColor: borderCol }]}
          >
            <CoinIcon fill={balanceAccent} />
            <View style={styles.smallMoneyInfo}>
              <Text style={[styles.smallMoneyLabel, { color: vipLabel, fontSize: rf(12) }]}>
                {t("wallet.bonusBalance")}
              </Text>
              <View style={styles.bonusRow}>
                <BonusText
                  style={[styles.smallMoneyValue, { color: amountMuted, fontSize: rf(14) }]}
                />
                <TouchableOpacity
                  onPress={() => setBonusExplainOpen(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ marginLeft: 4 }}
                >
                  <FontAwesome name="question-circle-o" size={15} color={vipLabel} />
                </TouchableOpacity>
              </View>
            </View>
          </GradientBg>
          {siteConfig?.isTestSite && (
            <GradientBg
              lineColors={lineColors}
              style={[styles.money3, { borderRightColor: borderCol }]}
            >
              <BitcoinIcon fill={balanceAccent} />
              <TouchableOpacity onPress={goXnWallet} style={styles.smallMoneyInfo}>
                <Text style={[styles.smallMoneyLabel, { color: vipLabel, fontSize: rf(12) }]}>
                  {t("wallet.virtualBalance")}
                </Text>
                <NgText
                  style={[styles.smallMoneyValue, { color: amountMuted, fontSize: rf(14) }]}
                />
              </TouchableOpacity>
            </GradientBg>
          )}
        </View>
      </View>

      <BonusWalletExplainModal
        visible={bonusExplainOpen}
        onClose={() => setBonusExplainOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headText: {
    flexDirection: "row",
    alignItems: "center",
  },
  headTextLabel: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "500",
  },
  moneyBox: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  moneyRight: {
    height: 133,
    flex: 1,
    borderRadius: 8,
    marginRight: 10,
    paddingTop: 10,
    paddingLeft: 10,
    position: "relative",
    borderRightWidth: 1,
  },
  moneyInfo: {
    position: "absolute",
    right: 30,
    bottom: 10,
    alignItems: "center",
  },
  moneyLabel: {
    marginBottom: 4,
    fontSize: 12,
  },
  moneyValue: {
    fontWeight: "700",
    fontSize: 12,
  },
  moneyLeft: {
    flex: 1,
  },
  money2: {
    borderRadius: 8,
    height: 61,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 5,
    marginBottom: 10,
    borderRightWidth: 1,
  },
  money3: {
    borderRadius: 8,
    height: 61,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 5,
    borderRightWidth: 1,
  },
  bonusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  smallMoneyInfo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  smallMoneyLabel: {
    fontSize: 10,
  },
  smallMoneyValue: {
    fontSize: 12,
    fontWeight: "600",
  },
});
