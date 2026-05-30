import { Colors } from "@/constants/Colors";
import { reedType, reedUrl } from "@/constants/reedData";
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

/** 我的 type4：余额 / 彩金 / 测站虚拟币 */
export default function BalanceRow() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [bonusExplainOpen, setBonusExplainOpen] = useState(false);
  const siteConfig = useSelector(stationConfig);

  const goXnWallet = () => {
    router.navigate({ pathname: reedUrl, params: { toType: reedType.coinWallet } });
  };

  return (
    <>
      <View style={styles.moneyBox}>
        <View style={styles.flexDiv}>
          <Text
            className={`text-${theme}-vipColor`}
            style={[styles.moneyLabel, { fontSize: rf(12), marginTop: 0 }]}
          >
            {t("wallet.balance")}
          </Text>
          <BalanceText
            className={`text-${theme}-primary`}
            style={[styles.moneyValue, { fontSize: rf(14) }]}
          />
        </View>
        <View
          style={[
            styles.flexDiv,
            styles.moneyBoxCenter,
            { borderColor: Colors[theme].dividerColor },
          ]}
        >
          <Text
            className={`text-${theme}-vipColor`}
            style={[styles.moneyLabel, { fontSize: rf(12), marginTop: 0 }]}
          >
            {t("my.caiBalance")}
          </Text>
          <View style={styles.bonusRow}>
            <BonusText
              className={`text-${theme}-darkColor`}
              style={[styles.moneyValue, { fontSize: rf(14) }]}
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
        {siteConfig?.isTestSite && (
          <TouchableOpacity style={styles.flexDiv} onPress={goXnWallet}>
            <Text
              className={`text-${theme}-vipColor`}
              style={[styles.moneyLabel, { fontSize: rf(12), marginTop: 0 }]}
            >
              {t("wallet.virtualBalance")}
            </Text>
            <NgText
              className={`text-${theme}-darkColor`}
              style={[styles.moneyValue, { fontSize: rf(14) }]}
            />
          </TouchableOpacity>
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
  moneyBox: {
    position: "relative",
    zIndex: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 89,
    borderRadius: 8,
  },
  moneyBoxCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  bonusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  flexDiv: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 4,
  },
  moneyValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  moneyLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});
