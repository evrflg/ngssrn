import { I18nText } from "@/components/I18nText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import { formatMoney } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { tenantStore, Tenant } from "@/store/tenant/tenantSlice";

interface DepositGiftRowProps {
  giftMoney: number;
  joinDepositGift: boolean;
  onToggle: () => void;
}

export const DepositGiftRow = React.memo(
  ({ giftMoney, joinDepositGift, onToggle }: DepositGiftRowProps) => {
    const { theme } = useTheme();
    const tenantInfo: Tenant = useSelector(tenantStore);

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
      <View style={styles.outer}>
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
            <Text style={[styles.amount, { fontSize: rf(13) }]}>{formatMoney(giftMoney)}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    paddingLeft: 4,
    paddingRight: 16,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    overflow: "hidden",
    width: 200,
    paddingVertical: 8,
  },
  badgeImage: { borderRadius: 10 },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 14,
  },
  icon: { width: 20, height: 20 },
  currency: { color: "#FFE866" },
  amount: { color: "#FFE866", fontWeight: "600" },
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
