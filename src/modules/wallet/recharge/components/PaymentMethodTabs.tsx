import BaseTab from "@/components/common/BaseTab";
import { I18nText } from "@/components/I18nText";
import { BankTypeIcon, TransferInfoWalletIcon } from "@/components/icons/wallet";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { rf } from "@/utils/scaleFont";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/common/toast";
import { RechargeType } from "../../shared/types";

interface PaymentMethodTabsProps {
  currentRecharge: RechargeType;
  currentPayIndex: number;
  onSelectPay: (index: number) => void;
  /** 当前充值方式是否为 USDT */
  isUsdt: boolean;
}

function getPayMethodBadge(tab: any): string {
  const tunnelBadge = tab?.tunnels?.find((t: any) => t?.tunnelBadge)?.tunnelBadge;
  return tunnelBadge || tab?.payBadge || "";
}

/** 收款信息卡片（银行转账 / USDT） */
function CardInfo({
  currentPay,
  isUsdt,
}: {
  currentPay: any;
  isUsdt: boolean;
}) {
  const { theme } = useTheme();
  const toast = useToast();
  const { t } = useTranslation();

  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    toast.success(t("common.copySuccess"));
  };

  if (!currentPay) return null;

  return (
    <View className={`px-3 py-4 mb-4 bg-${theme}-btnText rounded-lg`}>
      <LinearGradient
        style={{ borderRadius: 10, padding: 12 }}
        colors={[Colors[theme].gradientStart, Colors[theme].gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0 }}
      >
        <I18nText className={`text-center text-${theme}-btnText`} i18nKey={currentPay._name} />
        <View className="flex-col justify-center flex-1 mt-1 gap-2">
          {!isUsdt && (
            <View className="flex-row gap-2 flex-1">
              <I18nText
                className={`w-10 text-${theme}-btnText text-xs`}
                i18nKey="wallet.recharge.receiveName"
              />
              <I18nText
                className={`w-4/5 text-${theme}-btnText text-xs`}
                i18nKey={currentPay.holderName}
              />
              <Ionicons
                name="copy-outline"
                size={16}
                color={Colors[theme].btnText}
                onPress={() => copy(currentPay.holderName)}
              />
            </View>
          )}
          {!isUsdt && (
            <View className="flex-row gap-2 flex-1">
              <I18nText
                className={`w-10 text-${theme}-btnText text-xs`}
                i18nKey="wallet.recharge.bankCard"
              />
              <I18nText
                className={`w-4/5 text-${theme}-btnText text-xs`}
                i18nKey={currentPay.bankCard}
              />
              <Ionicons
                name="copy-outline"
                size={16}
                color={Colors[theme].btnText}
                onPress={() => copy(currentPay.bankCard)}
              />
            </View>
          )}
          <View className={`flex-row gap-2 ${isUsdt ? "" : "flex-1"}`}>
            <I18nText
              className={`text-${theme}-btnText text-xs`}
              i18nKey="wallet.recharge.address"
            />
            <I18nText
              className={`flex-1 text-${theme}-btnText text-xs break-all`}
              i18nKey={isUsdt ? currentPay.coinAddress : currentPay.bankAddress}
            />
            <Ionicons
              name="copy-outline"
              size={16}
              color={Colors[theme].btnText}
              onPress={() =>
                copy(isUsdt ? currentPay.coinAddress : currentPay.bankAddress)
              }
            />
          </View>
        </View>
      </LinearGradient>

      {currentPay.coinCode === "USDT" && (
        <View className="flex-1">
          <View className="flex-row items-start mt-4">
            <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45`} />
            <I18nText
              i18nKey="wallet.recharge.rate"
              className={`text-${theme}-text mr-2 text-xs`}
              type="subtitle"
            />
            <I18nText
              i18nKey={currentPay.depositRate}
              className={`text-${theme}-primary text-xs`}
              type="subtitle"
            />
          </View>
          {currentPay.remark && (
            <View className="flex-row items-start mt-2">
              <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45`} />
              <I18nText
                i18nKey="wallet.recharge.transferInstructions"
                className={`text-${theme}-text mr-2 text-xs`}
                type="subtitle"
              />
              <I18nText
                i18nKey={currentPay.remark}
                className={`text-${theme}-primary text-xs`}
                type="subtitle"
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export const PaymentMethodTabs = React.memo(
  ({ currentRecharge, currentPayIndex, onSelectPay, isUsdt }: PaymentMethodTabsProps) => {
    const { theme } = useTheme();
    const primaryColor = useThemeColor({}, "primary");

    const renderPayTab = useCallback(
      (tab: any, index: number) => {
        const isActive = index === currentPayIndex;
        const badgeText = getPayMethodBadge(tab);

        const body = (
          <View style={styles.inner}>
            <View className="flex-row w-full gap-1 items-center justify-center" style={styles.mainRow}>
              {tab._icon && (
                <Image source={{ uri: tab._icon }} style={styles.icon} resizeMode="contain" />
              )}
              <I18nText
                i18nKey={tab._name}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.name,
                  { color: isActive ? Colors[theme].btnText : Colors[theme].textGray },
                ]}
              />
              
            </View>
          </View>
        );

        const card = (
          <LinearGradient
            colors={
              isActive
                ? [Colors[theme].tgBindGradientStart, Colors[theme].tgBindGradientEnd]
                : [Colors[theme].paymentTabGradientStart, Colors[theme].paymentTabGradientEnd]
            } 
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.card, {backgroundColor: Colors[theme].btnText}]}
          >
            {body}
          </LinearGradient>
        );

        return (
          <View style={styles.cell}>
            {card}
            {!!badgeText && (
              <View style={styles.badge} pointerEvents="none">
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.badgeText}>
                  {badgeText}
                </Text>
              </View>
            )}
          </View>
        );
      },
      [currentPayIndex, theme],
    );

    if (!currentRecharge || currentRecharge.payList.length === 0) return null;

    const currentPay = currentRecharge.payList[currentPayIndex];

    return (
      <View className="mb-4">
        <View className="flex-row items-center">
          <BankTypeIcon fill={primaryColor} />
          <I18nText
            i18nKey={
              currentRecharge.id === "online"
                ? "wallet.recharge.selectType"
                : "wallet.recharge.selectPaymentMethod"
            }
            className={`ml-2 text-${theme}-text font-medium`}
          />
        </View>
        <View
          className={`rounded-lg bg-${theme}-btnText mt-2.5 px-2.5 pb-2.5 pt-4`}
          style={{ overflow: "visible" }}
        >
          <BaseTab
            tabs={currentRecharge.payList as any[]}
            selectedIndex={currentPayIndex}
            setIndex={onSelectPay}
            renderItem={renderPayTab}
            scrollStyle={{ marginTop: 0 }}
            showNumber={3}
            wrap
          />
        </View>

        {/* 收款信息卡片仅银行转账和 USDT 需要 */}
        {currentRecharge.id !== "online" && (
          <>
            <View className="flex-row items-center mt-3 mb-2">
              <TransferInfoWalletIcon fill={primaryColor} width={25} height={25} />
              <I18nText
                i18nKey="wallet.recharge.transferInfoTitle"
                className={`ml-2 text-${theme}-text font-medium`}
              />
            </View>
            <CardInfo currentPay={currentPay} isUsdt={isUsdt} />
          </>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  cell: { width: "100%", position: "relative", overflow: "visible" },
  card: { height: 40, borderRadius: 6, justifyContent: "center", width: "100%" },
  inner: {
    position: "relative",
    paddingHorizontal: 6,
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  mainRow: {
    minWidth: 0,
  },
  name: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 70,
    marginRight: 2,
    fontSize: rf(12),
    lineHeight: rf(14),
    fontWeight: "500",
  },
  icon: { width: 22, height: 22 },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    zIndex: 2,
    elevation: 4,
    maxWidth: "85%",
    height: 14,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "#ff3333",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: rf(9), lineHeight: rf(10), fontWeight: "600" },
});
