import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { I18nText } from "@/components/I18nText";
import { BaseButton } from "@/components/ui/BaseButton";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import { formatMoney } from "@/utils/utils";
import { useToast } from "@/components/common/toast";
import { useTranslation } from "react-i18next";

export type InterConnectWalletInfo = {
  address: string;
  balance: number;
};

export type InterConnectWalletBlockProps = {
  info: InterConnectWalletInfo;
  onRefresh: () => void | Promise<void>;
  onGoWallet: () => void;
  isGoLoading?: boolean;
};

export function InterConnectWalletBlock({
  info,
  onRefresh,
  onGoWallet,
  isGoLoading = false,
}: InterConnectWalletBlockProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onPressRefresh = useCallback(async () => {
    if (!info.address || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([Promise.resolve(onRefresh()), new Promise((r) => setTimeout(r, 800))]);
    } finally {
      setIsRefreshing(false);
    }
  }, [info.address, isRefreshing, onRefresh]);

  const copyAddress = useCallback(async () => {
    if (!info.address) return;
    await Clipboard.setStringAsync(info.address);
    toast.success(t("common.copySuccess"));
  }, [info.address, toast, t]);

  const inputBg = Colors[theme].inputBg;
  const labelColor = Colors[theme].text;
  const valueColor = Colors[theme].text;

  return (
    <View style={[styles.root, { backgroundColor: Colors[theme].btnText }]}>
      <View style={styles.row}>
        <View style={[styles.label, { justifyContent: "center" }]}>
          <I18nText
            i18nKey="wallet.addOnline.walletAddress"
            style={{ fontSize: rf(12), color: labelColor }}
            numberOfLines={1}
          />
        </View>
        <View style={[styles.valueBox, { backgroundColor: inputBg }]}>
          <Text
            style={[styles.valueText, { color: valueColor }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {info.address || "-"}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.label, { justifyContent: "center" }]}>
          <I18nText
            i18nKey="wallet.recharge.WBalance"
            style={{ fontSize: rf(12), color: labelColor }}
            numberOfLines={1}
          />
        </View>
        <View style={[styles.valueBox, { backgroundColor: inputBg }]}>
          <Text style={[styles.valueText, { color: valueColor, flex: 1 }]} numberOfLines={1}>
            {formatMoney(info.balance)}
          </Text>
          {!!info.address && (
            <Pressable
              onPress={onPressRefresh}
              disabled={isRefreshing}
              style={styles.iconBtn}
              hitSlop={8}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color={Colors[theme].textPrimary} />
              ) : (
                <Ionicons name="refresh" size={18} color={Colors[theme].textPrimary} />
              )}
            </Pressable>
          )}
        </View>
      </View>

      <View style={[styles.row, styles.lastRow]}>
        <View style={styles.lastLabelWrap}>
          <I18nText i18nKey="wallet.linkBuyCoin" style={{ fontSize: rf(12), color: labelColor }} />
        </View>
        <View style={styles.lastButtonWrap}>
          <BaseButton
            i18nKey="wallet.recharge.toInterConnectWallet"
            gradient
            size="custom"
            isLoading={isGoLoading}
            disabled={!info.address || isGoLoading}
            onPress={onGoWallet}
            className="w-full"
            style={styles.goBtn}
            textStyle={{ fontSize: rf(12) }}
            gradientColors={[Colors[theme].primary, Colors[theme].gradient]}
            gradientStart={{ x: 0, y: 0 }}
            gradientEnd={{ x: 1, y: 0 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 12,
    padding: 12,
    paddingBottom: 14,
  },
  row: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  lastRow: {
    marginBottom: 0,
    alignItems: "stretch",
    minHeight: 40,
  },
  label: {
    width: 80,
    flexShrink: 0,
    fontSize: rf(12),
    marginRight: 4,
  },
  valueBox: {
    flex: 1,
    minWidth: 0,
    minHeight: 32,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: rf(12),
    minWidth: 0,
  },
  iconBtn: {
    marginLeft: 4,
    padding: 2,
  },
  lastLabelWrap: {
    width: 80,
    flexShrink: 0,
    justifyContent: "center",
    paddingRight: 4,
  },
  lastButtonWrap: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  goBtn: {
    borderRadius: 8,
    minHeight: 35,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: "100%",
  },
});
