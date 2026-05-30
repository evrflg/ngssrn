import { HideScreenHeader } from "@/components/common/Header";
import { DropdownStatus, StatusOptions } from "@/components/wallet/DropdownStatus";
import { RecordList } from "@/components/wallet/RecordList";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateRangePicker from "@/components/common/DateRangePicker";

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
      title: t("status.unprocessed"),
    },
    {
      value: 2,
      title: t("status.processing"),
    },
    {
      value: 3,
      title: t("status.successText"),
    },
    {
      value: 4,
      title: t("status.failedText"),
    },
    {
      value: 5,
      title: t("status.expired"),
    },
  ];

  return (
    <SafeAreaView className={`flex-1 bg-${theme}-background`}>
      <HideScreenHeader title={t("pageName.rechargeRecord")} />
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
          />
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
        <RecordList options={statusOption} type="recharge" ref={listRef} />
      </View>
    </SafeAreaView>
  );
}
