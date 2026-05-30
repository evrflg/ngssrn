import NoData from "@/components/common/NoData";
import { I18nText } from "@/components/I18nText";
import { BaseButton } from "@/components/ui/BaseButton";
import { Colors } from "@/constants/Colors";
import { getWithdrawRecord } from "@/api";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { stationConfig } from "@/store/tenant/tenantSlice";
import { RootState } from "@/store/store";
import { formatMoney } from "@/utils/utils";
import { useRouter } from "expo-router";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { WithdrawInfo } from "./WithdrawInfo";
import {
  WithdrawRecordCard,
  type WithdrawRecordItem,
} from "./WithdrawRecordCard";

interface WithdrawUnavailablePanelProps {
  minDrawMoney?: number | string;
  maxDrawMoney?: number | string;
  handleFee?: number | string;
  curBetNum?: number | string;
  drawNeedBetNum?: number | string;
  freeDrawTimes?: number | string;
  drawTimes?: number | string;
}

export const WithdrawUnavailablePanel = React.memo(
  ({
    minDrawMoney = 0,
    maxDrawMoney = 0,
    handleFee = 0,
    curBetNum = 0,
    drawNeedBetNum = 0,
    freeDrawTimes = 0,
    drawTimes = 0,
  }: WithdrawUnavailablePanelProps) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const router = useRouter();
    const primaryColor = useThemeColor({}, "primary");
    const globalConfig = useSelector(
      (state: RootState) => state?.user?.cfg_site_base,
    );
    const siteConfig = useSelector(stationConfig);
    const userInfo = useSelector((state: RootState) => state?.user?.userInfo);

    const [recentRecords, setRecentRecords] = useState<WithdrawRecordItem[]>(
      [],
    );

    const customServiceLink =
      siteConfig?.customServiceLink?.trim?.() ||
      globalConfig?.customServiceLink?.trim?.() ||
      "";
    const hasCustomServiceLink = Boolean(customServiceLink);

    const minMoney = useMemo(() => Number(minDrawMoney) || 0, [minDrawMoney]);
    const maxMoney = useMemo(() => Number(maxDrawMoney) || 0, [maxDrawMoney]);
    const fee = useMemo(() => handleFee ?? 0, [handleFee]);
    const betNum = useMemo(() => curBetNum ?? 0, [curBetNum]);
    const needBetNum = useMemo(() => drawNeedBetNum ?? 0, [drawNeedBetNum]);
    const totalDrawTimes = useMemo(() => drawTimes ?? 0, [drawTimes]);
    const remainDrawTimes = useMemo(() => freeDrawTimes ?? 0, [freeDrawTimes]);

    const openCustomerService = async () => {
      if (!customServiceLink) return;
      try {
        const supported = await Linking.canOpenURL(customServiceLink);
        if (supported) await Linking.openURL(customServiceLink);
      } catch {
        // ignore
      }
    };

    const goWithdrawRecords = () => {
      router.push("/wallet/withdrawRecord");
    };

    useEffect(() => {
      const startTime = dayjs().format("YYYY-MM-DD 00:00:00");
      const endTime = dayjs().format("YYYY-MM-DD 23:59:59");
      getWithdrawRecord({
        pageNo: 1,
        pageSize: 3,
        createTime: [startTime, endTime],
      })
        .then((res) => {
          const list = res?.data?.data?.list;
          if (Array.isArray(list)) {
            setRecentRecords(
              list.map((record: any) => ({
                id: record.id,
                orderNo: record.orderNo,
                orderMoney: record.orderMoney,
                withdrawMoney: record.withdrawMoney,
                handleFeeMoney: record.handleFeeMoney,
                withdrawType: record.withdrawType,
                handleTime: record.handleTime,
                createTime: record.createTime,
                orderStatus: record.orderStatus,
                remark: record.remark,
              })),
            );
          } else {
            setRecentRecords([]);
          }
        })
        .catch(() => setRecentRecords([]));
    }, []);

    const cashBalance = userInfo?.money ?? 0;

    const FormRow = ({
      labelKey,
      value,
      right,
    }: {
      labelKey: string;
      value?: string | number;
      right?: React.ReactNode;
    }) => (
      <View className="flex-row items-center justify-between min-h-[40px] gap-2">
        <I18nText
          i18nKey={labelKey}
          type="tiptitle"
          className={`text-${theme}-lightText flex-1`}
          style={{ writingDirection: "ltr" }}
        />
        {right ?? (
          <Text
            style={{
              color: Colors[theme].primary,
              fontWeight: "500",
              fontSize: 13,
              writingDirection: "ltr",
            }}
          >
            {String(value ?? 0)}
          </Text>
        )}
      </View>
    );

    return (
      <View style={{ paddingBottom: 16 }}>
        <View
          className={`bg-${theme}-btnText rounded-lg px-4 mb-3 items-center`}
          style={{ paddingTop: 24, paddingBottom: 20 }}
        >
          <I18nText
            i18nKey="wallet.cannotWithdraw"
            className={`text-${theme}-text text-base font-medium mb-3 text-center`}
            style={{ lineHeight: 24, writingDirection: "ltr" }}
          />
          {hasCustomServiceLink ? (
            <Pressable onPress={openCustomerService}>
              <Text
                style={{
                  color: primaryColor,
                  fontSize: 14,
                  fontWeight: "500",
                  textDecorationLine: "underline",
                  textDecorationStyle: "solid",
                  writingDirection: "ltr",
                }}
              >
                {t("common.contactCS")}
              </Text>
            </Pressable>
          ) : (
            <I18nText
              i18nKey="wallet.pleaseContactCustomerService"
              className={`text-${theme}-lightText text-sm text-center`}
              style={{
                lineHeight: 21,
                fontWeight: "500",
                writingDirection: "ltr",
              }}
            />
          )}
        </View>

        <View className={`bg-${theme}-btnText rounded-lg p-3 mb-3`}>
          <View
            className="rounded-lg py-2.5 px-3 mb-3 items-center"
            style={{ backgroundColor: Colors[theme].inputBg }}
          >
            <I18nText
              i18nKey="wallet.withdrawSingleLimitRange"
              values={{ min: minMoney, max: maxMoney }}
              className={`text-${theme}-text text-xs text-center`}
              style={{ lineHeight: 18, writingDirection: "ltr" }}
            />
          </View>

          <FormRow
            labelKey="wallet.accountBalance"
            right={
              <View className="flex-row items-center gap-2">
                <Text
                  style={{
                    color: Colors[theme].primary,
                    fontWeight: "500",
                    fontSize: 13,
                    writingDirection: "ltr",
                  }}
                >
                  {formatMoney(cashBalance) || "0"}
                </Text>
                <BaseButton
                  className="rounded-full"
                  style={{
                    borderWidth: 1,
                    borderColor: Colors[theme].primary,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    minHeight: 26,
                    minWidth: 52,
                    opacity: 0.85,
                  }}
                  textClassName="text-xs"
                  i18nKey="wallet.all"
                  size="custom"
                  variant="outline"
                  disabled
                />
              </View>
            }
          />

          <FormRow labelKey="wallet.chargeFee" value={fee} />
          <FormRow labelKey="wallet.currentCodingVolume" value={betNum} />
          <FormRow
            labelKey="wallet.codingRequiredForWithdrawal"
            value={formatMoney(Number(needBetNum)) || "0"}
          />

          <View className="mt-2">
            <BaseButton
              i18nKey="wallet.withdrawAction"
              gradient
              roundedFull
              disabled
            />
          </View>
        </View>

        <View className="mb-3">
          <I18nText
            i18nKey="wallet.withdrawInstructions"
            className={`text-${theme}-primary text-sm font-bold mb-2.5`}
            style={{ writingDirection: "ltr" }}
          />
          <View
            className={`bg-${theme}-btnText rounded-lg`}
            style={{ paddingVertical: 4, paddingBottom: 8 }}
          >
            <WithdrawInfo
              curBetNum={betNum}
              drawNeedBetNum={needBetNum}
              freeDrawTimes={remainDrawTimes}
              drawTimes={totalDrawTimes}
              chargeFee={Number(fee)}
              minDrawMoney={minMoney}
              maxDrawMoney={maxMoney}
            />
          </View>
        </View>

        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-2.5">
            <I18nText
              i18nKey="wallet.withdrawRecord"
              className={`text-${theme}-text text-sm font-bold`}
              style={{ writingDirection: "ltr" }}
            />
            <Pressable onPress={goWithdrawRecords}>
              <Text
                className={`text-${theme}-lightText text-xs`}
                style={{ writingDirection: "ltr" }}
              >
                {t("common.more")} &gt;
              </Text>
            </Pressable>
          </View>
          <View
            className={`bg-${theme}-btnText rounded-lg`}
            style={{ paddingVertical: 4, paddingBottom: 8 }}
          >
            {recentRecords.length > 0 ? (
              recentRecords.map((record, index) => (
                <WithdrawRecordCard
                  key={record.id}
                  record={record}
                  style={{
                    marginBottom: index < recentRecords.length - 1 ? 8 : 0,
                  }}
                />
              ))
            ) : (
              <NoData style={{ minHeight: 140, paddingVertical: 16 }} />
            )}
          </View>
        </View>
      </View>
    );
  },
);
