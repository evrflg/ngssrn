import { I18nText } from "@/components/I18nText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import { formatMoney } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { tenantStore, Tenant } from "@/store/tenant/tenantSlice";

interface DepositGiftRowProps {
  giftMoney: number;
  walletType?: number;
  joinDepositGift: boolean;
  isCalculatingBonus?: boolean;
  exhaustedRemaining?: string;
  onToggle: () => void;
}

export const DepositGiftRow = React.memo(
  ({
    giftMoney,
    walletType = 0,
    joinDepositGift,
    isCalculatingBonus = false,
    exhaustedRemaining = "",
    onToggle,
  }: DepositGiftRowProps) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const tenantInfo: Tenant = useSelector(tenantStore);
    const hideGiftMoney = giftMoney <= 0;
    const [tipVisible, setTipVisible] = useState(false);

    const starlightBg = useMemo(() => {
      if (theme === "greenBlack") {
        return require("@/assets/images/finance/starlight1_green_and_cyan.webp");
      }
      if (theme === "blueWhite") {
        return require("@/assets/images/finance/starlight1_blue.webp");
      }
      return require("@/assets/images/finance/starlight1_orange.webp");
    }, [theme]);

    return (
      <View style={[styles.outer, hideGiftMoney && styles.outerHidden]}>
        <ImageBackground
          source={starlightBg}
          style={styles.badge}
          imageStyle={styles.badgeImage}
          resizeMode="stretch"
        >
          <View style={styles.left}>
            <Image
              source={require("@/assets/images/finance/wallet.webp")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={[styles.currency, { fontSize: rf(13) }]}>{tenantInfo?.currency}</Text>
            <View style={styles.amountWrap}>
              {isCalculatingBonus ? (
                <ActivityIndicator size="small" color="#f0ca72" />
              ) : (
                <>
                  <Text style={[styles.amount, { fontSize: rf(13) }]}>
                    {formatMoney(giftMoney)}
                    {walletType === 1 && (
                      <Text style={styles.bonusPointsLabel}> {t("wallet.recharge.bonusPoints")}</Text>
                    )}
                  </Text>
                  {!!exhaustedRemaining && (
                    <Pressable
                      style={styles.warnWrap}
                      onPress={() => setTipVisible((v) => !v)}
                      hitSlop={8}
                    >
                      <Text style={styles.warnIcon}>!</Text>
                      {tipVisible && (
                        <View style={styles.warnTip}>
                          <Text style={styles.warnTipText}>{exhaustedRemaining}</Text>
                        </View>
                      )}
                    </Pressable>
                  )}
                </>
              )}
            </View>
          </View>
        </ImageBackground>

        <TouchableOpacity style={styles.optOut} activeOpacity={0.85} onPress={onToggle}>
          <View style={[styles.checkbox, { borderColor: Colors[theme].darkColor }]}>
            {!joinDepositGift && <Ionicons name="checkmark" size={14} color="#4CAF50" />}
          </View>
          <I18nText
            i18nKey="wallet.recharge.skipPromotion"
            style={{ fontSize: rf(12), color: Colors[theme].darkColor, flexShrink: 1 }}
            type="tiptitle"
          />
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  outer: {
    width: "100%",
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    paddingLeft: 4,
    paddingRight: 16,
  },
  outerHidden: {
    height: 0,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    overflow: "hidden",
    width: 200,
    height: 40,
    justifyContent: "center",
  },
  badgeImage: { borderRadius: 10 },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingLeft: 12,
    paddingRight: 14,
  },
  icon: { width: 20, height: 20 },
  currency: { color: "#FFE866" },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  amount: { color: "#FFE866", fontWeight: "600" },
  bonusPointsLabel: { fontSize: 10 },
  warnWrap: {
    marginLeft: 4,
    marginTop: -4,
    position: "relative",
  },
  warnIcon: {
    width: 15,
    height: 15,
    borderRadius: 8,
    overflow: "hidden",
    textAlign: "center",
    lineHeight: 13,
    fontSize: 10,
    fontWeight: "800",
    color: "#ff7043",
    backgroundColor: "rgba(255, 112, 67, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 112, 67, 0.35)",
  },
  warnTip: {
    position: "absolute",
    bottom: 22,
    left: -40,
    minWidth: 120,
    maxWidth: 240,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "rgba(30, 16, 12, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(255, 112, 67, 0.25)",
    zIndex: 10,
  },
  warnTipText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#ffb09a",
  },
  optOut: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 0,
    paddingRight: 4,
    marginLeft: 12,
    alignSelf: "stretch",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderRadius: 2,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
