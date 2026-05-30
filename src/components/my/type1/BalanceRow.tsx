import DollarCircle from "@/components/icons/my/DollarCircle";
import { Colors } from "@/constants/Colors";
import { reedType, reedUrl } from "@/constants/reedData";
import { getSplitLineColor } from "@/hooks/cardThemeFactory";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { stationConfig } from "@/store/tenant/tenantSlice";
import { rf } from "@/utils/scaleFont";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import BonusWalletExplainModal from "../BonusWalletExplainModal";
import { BalanceText } from "../myPage/ng/common/money/Balance";
import { BonusText } from "../myPage/ng/common/money/Bonus";
import { NgText } from "../myPage/ng/common/money/Ng";

/**
 * 我的 type1：主余额、彩金、虚拟币；彩金旁问号打开说明弹窗。
 */
export default function BalanceRow() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const splitLineColor = getSplitLineColor(theme);
  const siteConfig = useSelector(stationConfig);
  const [bonusExplainOpen, setBonusExplainOpen] = useState(false);

  /** 跳转 reed 内虚拟币钱包页 */
  const goXnWallet = () => {
    router.navigate({
      pathname: reedUrl,
      params: { toType: reedType.coinWallet },
    });
  };

  return (
    <>
      <View
        style={[
          styles.balanceInfo,
          {
            borderColor: splitLineColor,
          },
        ]}
      >
        <View
          style={[
            styles.balanceCell,
            {
              borderRightWidth: StyleSheet.hairlineWidth,
              borderColor: splitLineColor,
            },
          ]}
        >
          <Text style={[styles.balanceLabel, { fontSize: rf(10) }]}>{t("wallet.balance")}</Text>
          <View style={styles.valueSlot}>
            <View style={styles.balanceValueWithIcon}>
              <DollarCircle />
              <BalanceText
                className={`text-center text-${theme}-darkColor`}
                style={[styles.balanceValue, styles.balanceValueAfterIcon, { fontSize: rf(12) }]}
              />
            </View>
          </View>
        </View>
        <View
          style={[
            styles.balanceCell,
            {
              borderRightWidth: StyleSheet.hairlineWidth,
              borderColor: splitLineColor,
            },
          ]}
        >
          <Text style={[styles.balanceLabel, { fontSize: rf(10) }]}>{t("my.caiBalance")}</Text>
          <View style={styles.valueSlot}>
            <View style={styles.bonusValueRow}>
              <BonusText
                className={`text-${theme}-darkColor`}
                style={[styles.balanceValue, { textAlign: "center", fontSize: rf(12) }]}
              />
              <TouchableOpacity
                onPress={() => setBonusExplainOpen(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ marginLeft: 4 }}
              >
                <FontAwesome name="question-circle-o" size={15} color={Colors[theme].textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {siteConfig?.isTestSite && (
          <View style={styles.balanceCell}>
            <TouchableOpacity onPress={goXnWallet} style={styles.balanceCellTouchable}>
              <Text style={[styles.balanceLabel, { fontSize: rf(10) }]}>
                {t("wallet.virtualBalance")}
              </Text>
              <View style={styles.valueSlot}>
                <NgText
                  className={`text-${theme}-darkColor`}
                  style={[styles.balanceValue, { fontSize: rf(12) }]}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <BonusWalletExplainModal
        visible={bonusExplainOpen}
        onClose={() => setBonusExplainOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  balanceInfo: {
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: StyleSheet.hairlineWidth * 0.5,
    paddingVertical: 8,
  },
  balanceCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  valueSlot: {
    minHeight: 26,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceValueWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceValueAfterIcon: {
    marginLeft: 6,
  },
  bonusValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  balanceCellTouchable: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  balanceLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 6,
    marginTop: 0,
    textAlign: "center",
    width: "100%",
  },
  balanceValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
