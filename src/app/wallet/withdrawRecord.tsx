import { HideScreenHeader } from "@/components/common/Header";
import {
  DropdownStatus,
  StatusOptions,
} from "@/components/wallet/DropdownStatus";
import { RecordList } from "@/components/wallet/RecordList";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateRangePicker from "@/components/common/DateRangePicker";

// const filterStatusActions = ref<Action[]>([
//   { id: 0, name: t('status.allText') },
//   { id: 1, name: t('wallet.withdrawStatus.pending') }, // 待出款
//   { id: 2, name: t('wallet.withdrawStatus.processing') }, // 出款中
//   { id: 3, name: t('wallet.withdrawStatus.success') }, // 出款成功
//   { id: 4, name: t('wallet.withdrawStatus.failed') }, // 出款失败
//   { id: 5, name: t('status.rejected') }, // 已拒绝
//   { id: 6, name: t('status.cancelled') }, // 已取消
//   { id: 7, name: t('status.expired') }, // 已过期
// ])

export default function rechargeRecord() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const listRef = useRef<any>(null);
  const statusOption: StatusOptions[] = [
    {
      value: "",
      title: t("status.allText"),
    },
    {
      value: 1,
      title: t("wallet.withdrawStatus.pending"), //待出款
    },
    {
      value: 2,
      title: t("wallet.withdrawStatus.processing"), //出款中
    },
    {
      value: 3,
      title: t("wallet.withdrawStatus.success"), //出款成功
    },
    {
      value: 4,
      title: t("wallet.withdrawStatus.failed"), //出款失败
    },
    {
      value: 5,
      title: t("status.rejected"), //已拒绝
    },
    {
      value: 6,
      title: t("status.cancelled"), //已取消
    },
    {
      value: 7,
      title: t("status.expired"), //已过期
    },
  ];

  return (
    <SafeAreaView className={`flex-1 bg-${theme}-background`}>
      <HideScreenHeader title={t("pageName.withdrawRecord")} />
      <View className={`p-3 flex-1`}>
        <View className="flex-row gap-2">
          <DropdownStatus
            className="flex-1"
            options={statusOption}
            success={(option: StatusOptions) => {
              listRef.current?.setSearchParams((prev: any) => ({
                ...prev,
                orderStatus: option.value,
              }));
            }}
            style={{ borderRadius: 8 }}
          />
          <View className="flex-1">
            <DateRangePicker
              onConfirm={(dateRange) => {
                listRef.current?.setSearchParams((prev: any) => ({
                  ...prev,
                  startTime: dateRange?.[0],
                  endTime: dateRange?.[1],
                }));
              }}
              style={{ flex: 1 }}
              showLabel
            />
          </View>
        </View>
        <RecordList options={statusOption} type="withdraw" ref={listRef} />
      </View>
    </SafeAreaView>
  );
}
