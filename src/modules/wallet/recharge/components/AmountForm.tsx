import { BaseButton } from "@/components/ui/BaseButton";
import { BaseInput } from "@/components/ui/BaseInput";
import { I18nText } from "@/components/I18nText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import { formatMoney } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { tenantStore, Tenant } from "@/store/tenant/tenantSlice";
import { useTranslation } from "react-i18next";
import { RechargeType, InterConnectWallet } from "../../shared/types";
import { RecomMoneyGrid } from "../../shared/components/RecomMoneyGrid";

interface AmountFormProps {
  currentRecharge: RechargeType | undefined;
  currentPay: any;
  amount: string;
  remark: string;
  usdtValue: string;
  onAmountChange: (val: string) => void;
  onRemarkChange: (val: string) => void;
  onClearAmount: () => void;
  /** 互通钱包（仅在线支付+ossWallet=1 时有效） */
  isInterConnectWallet: boolean;
  interConnectWallet: InterConnectWallet;
  isRefreshingBalance: boolean;
  isNavigatingToWallet: boolean;
  onRefreshWallet: () => void;
  onGoToWallet: () => void;
}

export const AmountForm = React.memo(
  ({
    currentRecharge,
    currentPay,
    amount,
    remark,
    usdtValue,
    onAmountChange,
    onRemarkChange,
    onClearAmount,
    isInterConnectWallet,
    interConnectWallet,
    isRefreshingBalance,
    isNavigatingToWallet,
    onRefreshWallet,
    onGoToWallet,
  }: AmountFormProps) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const tenantInfo: Tenant = useSelector(tenantStore);

    const refreshSpin = useRef(new Animated.Value(0)).current;
    const isRefreshSpinningRef = useRef(false);

    const refreshSpinRotate = useMemo(
      () => refreshSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }),
      [refreshSpin],
    );

    const handleRefreshPress = () => {
      if (isRefreshSpinningRef.current) return;
      isRefreshSpinningRef.current = true;
      refreshSpin.setValue(0);
      Animated.timing(refreshSpin, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        isRefreshSpinningRef.current = false;
      });
      onRefreshWallet();
    };

    if (!currentRecharge) return null;

    const recomMoneys = (() => {
      try {
        return JSON.parse((currentPay as any)?.tunnels?.[0]?.recomMoneys || "[]");
      } catch {
        return [];
      }
    })();

    let minMaxNum = { min: 0, max: 0 };
    if (currentRecharge.id === "online") {
      minMaxNum = {
        min: (currentPay as any)?.tunnels?.[0]?.minLimitMoney,
        max: (currentPay as any)?.tunnels?.[0]?.maxLimitMoney,
      };
    } else if (currentRecharge.id === "bank") {
      minMaxNum = { min: (currentPay as any)?.minMoney, max: (currentPay as any)?.maxMoney };
    } else if (currentRecharge.id === "usdt") {
      minMaxNum = { min: (currentPay as any)?.minNum, max: (currentPay as any)?.maxNum };
    }

    return (
      <>
        <RecomMoneyGrid
          options={recomMoneys}
          selectedValue={amount}
          onSelect={onAmountChange}
        />

        {/* USDT 专用输入 */}
        {currentRecharge.id === "usdt" && (
          <BaseInput
            leftIcon={
              <Image
                style={{ width: 20, height: 20 }}
                source={require("@/assets/images/wallet/usdt-logo.png")}
              />
            }
            onChangeText={onAmountChange}
            value={amount}
            borderStyle="rounded"
            dark
          />
        )}

        {/* 互通钱包信息块 */}
        {currentRecharge.id === "online" && isInterConnectWallet && (
          <View className="flex-1 gap-2 mb-2">
            <View
              className="flex-row"
              style={[styles.walletInfoItem, { justifyContent: "flex-start", backgroundColor: Colors[theme].inputBg }]}
            >
              <I18nText
                i18nKey="wallet.addOnline.walletAddress"
                style={{ fontSize: rf(12) }}
                className={`text-${theme}-darkColor`}
              />
              <I18nText
                i18nKey={interConnectWallet.address || "-"}
                style={{ fontSize: rf(12) }}
                className={`text-${theme}-darkColor`}
              />
            </View>
            <View
              className="flex-row"
              style={[styles.walletInfoItem, { backgroundColor: Colors[theme].inputBg }]}
            >
              <I18nText
                i18nKey="wallet.recharge.WBalance"
                style={{ fontSize: rf(12) }}
                className={`text-${theme}-darkColor`}
              />
              <I18nText
                i18nKey={`${formatMoney(interConnectWallet.balance)}`}
                style={{ fontSize: rf(12) }}
                className={`text-${theme}-darkColor`}
              />
              <Pressable
                disabled={isRefreshingBalance}
                style={{ marginLeft: "auto" }}
                onPress={handleRefreshPress}
              >
                <Animated.View style={{ transform: [{ rotate: refreshSpinRotate }] }}>
                  <Ionicons name="refresh" size={20} color={Colors[theme].textPrimary} />
                </Animated.View>
              </Pressable>
            </View>
            {/* 跳转互通钱包按钮 */}
            <View className="flex-row" style={{ gap: 10 }}>
              <View
                className="items-center justify-center"
                style={[styles.walletInfoItem, { backgroundColor: Colors[theme].inputBg, paddingVertical: 0, justifyContent: "center" }]}
              >
                <I18nText
                  i18nKey="wallet.linkBuyCoin"
                  style={{ fontSize: rf(12) }}
                  className={`text-${theme}-darkColor`}
                />
              </View>
              <BaseButton
                size="sm"
                className="flex-1 items-center justify-center"
                i18nKey="wallet.recharge.toInterConnectWallet"
                onPress={onGoToWallet}
                isLoading={isNavigatingToWallet}
                disabled={!interConnectWallet.address || isNavigatingToWallet}
                style={styles.linkBtn}
                textStyle={{ fontSize: rf(12) }}
              />
            </View>
          </View>
        )}

        {/* 充值金额输入 */}
        <BaseInput
          value={currentRecharge.id === "usdt" ? usdtValue : amount}
          leftText={tenantInfo?.currency}
          onChangeText={onAmountChange}
          keyboardType="numeric"
          placeholder={t("wallet.withdraw.moneyPlaceholder", {
            min: minMaxNum.min,
            max: minMaxNum.max,
          })}
          borderStyle="rounded"
          dark
          clearable={currentRecharge.id !== "usdt"}
          readOnly={currentRecharge.id === "usdt"}
          onClear={onClearAmount}
          inputTypographyClass=""
          inputStyle={{ fontSize: rf(14) }}
          leftTextSizeClass=""
          leftTextStyle={{ fontSize: rf(12) }}
        />

        {/* 备注（非在线支付显示） */}
        {currentRecharge.id !== "online" && (
          <BaseInput
            leftText={t("common.remarkText")}
            value={remark}
            onChangeText={onRemarkChange}
            placeholder={t("wallet.placeholder.add1", { name: t("common.remarkText") })}
            borderStyle="rounded"
            dark
            inputTypographyClass=""
            inputStyle={{ fontSize: rf(14) }}
            leftTextSizeClass=""
            leftTextStyle={{ fontSize: rf(12) }}
          />
        )}
      </>
    );
  },
);

const styles = StyleSheet.create({
  walletInfoItem: {
    minHeight: 32,
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  linkBtn: {
    borderRadius: 15,
    height: 32,
  },
});
