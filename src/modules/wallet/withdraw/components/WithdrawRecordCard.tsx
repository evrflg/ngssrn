import { I18nText } from "@/components/I18nText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { formatMoney } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { Pressable, StyleProp, Text, View, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/common/toast";
import { getWithdrawTypeI18nKey } from "@/modules/wallet/shared/constants";

export interface WithdrawRecordItem {
  id: number;
  orderNo: string;
  orderMoney?: number;
  withdrawMoney?: number;
  handleFeeMoney?: number;
  withdrawType?: number;
  handleTime?: string;
  createTime?: string;
  orderStatus?: number;
  remark?: string;
}

interface WithdrawRecordCardProps {
  record: WithdrawRecordItem;
  style?: StyleProp<ViewStyle>;
}

const STATUS_CLASS: Record<number, string> = {
  1: "text-[#4781ff]",
  2: "text-[#4781ff]",
  3: "text-[#49ce9b]",
  4: "text-[#ff7172]",
  5: "text-[#ff7172]",
  6: "text-[#888888]",
  7: "text-[#888888]",
};

export const WithdrawRecordCard = React.memo(({ record, style }: WithdrawRecordCardProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();

  const statusLabel = useMemo(() => {
    const keyByStatus: Record<number, string> = {
      1: "wallet.withdrawStatus.pending",
      2: "wallet.withdrawStatus.processing",
      3: "wallet.withdrawStatus.success",
      4: "wallet.withdrawStatus.failed",
      5: "wallet.withdrawStatus.rejected",
      6: "wallet.withdrawStatus.cancelled",
      7: "wallet.withdrawStatus.expired",
    };
    const key = keyByStatus[record.orderStatus ?? 0];
    return key ? t(key) : "";
  }, [record.orderStatus, t]);

  const handleCopy = () => {
    Clipboard.setString(record.orderNo || String(record.id));
    toast.success(t("common.copySuccess"));
  };

  const withdrawTypeKey = getWithdrawTypeI18nKey(record.withdrawType);

  const timeText = dayjs(record.handleTime || record.createTime).format(
    "YYYY-MM-DD HH:mm:ss",
  );

  const amount = record.withdrawMoney ?? record.orderMoney ?? 0;

  const Row = ({
    labelKey,
    children,
  }: {
    labelKey: string;
    children: React.ReactNode;
  }) => (
    <View className="flex-row items-center justify-between" style={{ marginBottom: 5 }}>
      <I18nText i18nKey={labelKey} className={`text-${theme}-lightText text-xs`} />
      {children}
    </View>
  );

  return (
    <View
      className={`bg-${theme}-btnText rounded-lg`}
      style={[
        {
          marginHorizontal: 10,
          marginTop: 10,
          paddingHorizontal: 10,
          paddingBottom: 3,
        },
        style,
      ]}
    >
      <Row labelKey="wallet.withdrawStatusText">
        <Text className={`${STATUS_CLASS[record.orderStatus ?? 0] ?? `text-${theme}-text`} text-xs`}>
          {statusLabel}
        </Text>
      </Row>
      <Row labelKey="wallet.withdrawalAmount">
        <Text className={`text-${theme}-lightText text-xs`}>{formatMoney(amount)}</Text>
      </Row>
      <Row labelKey="wallet.chargeFee">
        <Text className={`text-${theme}-lightText text-xs`}>
          {formatMoney(record.handleFeeMoney || 0)}
        </Text>
      </Row>
      <Row labelKey="common.typeText">
        <Text className={`text-${theme}-lightText text-xs`}>{t(withdrawTypeKey)}</Text>
      </Row>
      <Row labelKey="common.time">
        <Text className={`text-${theme}-lightText text-xs`}>{timeText}</Text>
      </Row>
      <View className="flex-row items-center justify-between" style={{ marginBottom: 5 }}>
        <I18nText i18nKey="common.orderNo" className={`text-${theme}-lightText text-xs`} />
        <View className="flex-row items-center gap-1">
          <Text className={`text-${theme}-lightText text-xs`}>
            {record.orderNo || String(record.id)}
          </Text>
          <Pressable onPress={handleCopy}>
            <Ionicons name="copy-outline" size={14} color={Colors[theme].textSecondary} />
          </Pressable>
        </View>
      </View>
      {!!record.remark && (
        <Row labelKey="wallet.orderRemark">
          <Text className={`text-${theme}-lightText text-xs flex-1 text-right`}>
            {record.remark}
          </Text>
        </Row>
      )}
    </View>
  );
});
