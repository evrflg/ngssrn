import { Colors } from "@/constants/Colors";
import { reedType, reedUrl } from "@/constants/reedData";
import { buildMyCenterCardTheme, getType3ThemeTokens } from "@/hooks/cardThemeFactory";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { AppDispatch } from "@/store/store";
import { stationConfig } from "@/store/tenant/tenantSlice";
import { accInfoAsync } from "@/store/user/userSlice";
import { rf } from "@/utils/scaleFont";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import BonusWalletExplainModal from "../BonusWalletExplainModal";
import { BalanceText } from "../myPage/ng/common/money/Balance";
import { BonusText } from "../myPage/ng/common/money/Bonus";
import { NgText } from "../myPage/ng/common/money/Ng";

/** 我的 type3：账户余额标题与主余额、彩金、虚拟币展示；彩金旁问号打开说明弹窗。 */
export default function BalanceRow() {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [bonusExplainOpen, setBonusExplainOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const siteConfig = useSelector(stationConfig);

  const cardTheme = buildMyCenterCardTheme(theme, 3);
  const type3Theme = cardTheme.profileType === 3 ? cardTheme.tokens : getType3ThemeTokens(theme);

  const goXnWallet = () => {
    router.navigate({ pathname: reedUrl, params: { toType: reedType.coinWallet } });
  };

  const onRefreshBalance = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(accInfoAsync() as any),
        new Promise<void>((resolve) => setTimeout(resolve, 800)),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <View style={styles.balanceInfo}>
        <View style={styles.balanceItem}>
          <Text style={[styles.balanceLabel, { color: type3Theme.mutedText, fontSize: rf(10) }]}>
            {t("wallet.balance")}
          </Text>
          <View style={styles.valueSlot}>
            <View style={styles.balanceValueRow}>
              <BalanceText
                className="text-center"
                style={[styles.balanceValue, { color: Colors[theme].primary, fontSize: rf(14) }]}
              />
              <Pressable
                onPress={onRefreshBalance}
                hitSlop={12}
                disabled={refreshing}
                accessibilityRole="button"
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color="#adb7ba" />
                ) : (
                  <Ionicons name="refresh-circle" color="#adb7ba" size={16} />
                )}
              </Pressable>
            </View>
          </View>
        </View>
        <View style={styles.balanceItem}>
          <Text
            style={[
              styles.balanceLabel,
              { color: type3Theme.mutedText, fontSize: rf(10) },
            ]}
          >
            {t("my.caiBalance")}
          </Text>
          <View style={styles.valueSlot}>
            <View style={styles.bonusRow}>
              <BonusText
                style={[styles.balanceValue, { color: Colors[theme].text, fontSize: rf(14) }]}
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
          <View style={styles.balanceItem}>
            <TouchableOpacity onPress={goXnWallet} style={styles.balanceCellTouchable}>
              <Text
                style={[styles.balanceLabel, { color: type3Theme.mutedText, fontSize: rf(10) }]}
              >
                {t("wallet.virtualBalance")}
              </Text>
              <View style={styles.valueSlot}>
                <NgText
                  style={[
                    styles.balanceValue,
                    {
                      color: Colors[theme].text,
                      fontSize: rf(14),
                    },
                  ]}
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
    justifyContent: "space-around",
  },
  balanceItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  valueSlot: {
    minHeight: 24,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bonusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceCellTouchable: {
    alignItems: "center",
    width: "100%",
  },
  balanceLabel: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: "center",
  },
  balanceValue: {
    fontSize: 13,
    fontWeight: "bold",
  },
});
