import { BaseButton } from "@/components/ui/BaseButton";
import { BaseInput } from "@/components/ui/BaseInput";
import { I18nText } from "@/components/I18nText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React from "react";
import { Image, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useTranslation } from "react-i18next";
import { WITHDRAW_TYPE } from "../../shared/constants";
import { WithdrawConfig, WithdrawTab } from "../../shared/types";
import { RecomMoneyGrid } from "../../shared/components/RecomMoneyGrid";

interface AmountFormProps {
  withdrawTypes: WithdrawTab[];
  baseIndex: number;
  withdrawAmount: string;
  withdrawConfig: WithdrawConfig | null;
  serviceCharge: string;
  withdrawLimit: { minDrawMoney: number; maxDrawMoney: number };
  withdrawRate: string;
  usdtValue: string;
  globalConfig: any;
  recomMoneys: string[];
  onAmountChange: (val: string) => void;
  onAllIn: () => void;
}

export const AmountForm = React.memo(
  ({
    withdrawTypes,
    baseIndex,
    withdrawAmount,
    withdrawConfig,
    serviceCharge,
    withdrawLimit,
    withdrawRate,
    usdtValue,
    globalConfig,
    recomMoneys,
    onAmountChange,
    onAllIn,
  }: AmountFormProps) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const userInfo = useSelector((state: RootState) => state?.user?.userInfo);
    const isCrypto = withdrawTypes[baseIndex]?.id === WITHDRAW_TYPE.CRYPTO;

    const recomOptions = recomMoneys.map((m) => ({ money: m }));

    return (
      <>
        <RecomMoneyGrid
          options={recomOptions}
          selectedValue={withdrawAmount}
          onSelect={onAmountChange}
        />

        {isCrypto && (
          <View className="flex-row gap-2 mb-[10px]">
            <Image
              style={{ width: 20, height: 20 }}
              source={require("@/assets/images/wallet/usdt-logo.png")}
            />
            <I18nText
              i18nKey="wallet.withdraw.selectUSDTAmount"
              className={`text-${theme}-text`}
            />
          </View>
        )}

        <BaseInput
          value={withdrawAmount}
          onChangeText={onAmountChange}
          keyboardType="numeric"
          placeholder={
            withdrawLimit.minDrawMoney || withdrawLimit.maxDrawMoney
              ? t("wallet.withdraw.moneyPlaceholder", {
                  min: withdrawLimit.minDrawMoney,
                  max: withdrawLimit.maxDrawMoney,
                })
              : t("wallet.withdraw.enterWithdrawAmount")
          }
          inputClassName="pl-2"
          dark
        />

        {isCrypto && (
          <BaseInput
            leftIcon={
              <Image
                style={{ width: 20, height: 20 }}
                source={require("@/assets/images/wallet/usdt-logo.png")}
              />
            }
            value={usdtValue}
            readOnly
            dark
          />
        )}

        {!!withdrawConfig && (
          <>
            <View className="flex-row justify-between mt-3">
              <View className="flex-row items-center">
                <I18nText
                  i18nKey="wallet.withdraw.accountBalance"
                  type="tiptitle"
                  className={`text-${theme}-text`}
                />
                <I18nText
                  i18nKey={`${globalConfig?.money_unit || ""}${(userInfo?.money || 0).toFixed(2)}`}
                  type="tiptitle"
                  className={`text-${theme}-primary ml-1.5`}
                />
              </View>
              <BaseButton
                className="rounded"
                style={{
                  borderWidth: 1,
                  borderColor: Colors[theme].primary,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  minHeight: 28,
                }}
                textClassName="text-xs"
                i18nKey="status.allText"
                size="custom"
                variant="outline"
                onPress={onAllIn}
              />
            </View>

            {isCrypto && (
              <View className="flex-row items-center mt-3">
                <I18nText
                  i18nKey="wallet.withdraw.usdtRate"
                  type="tiptitle"
                  className={`text-${theme}-text`}
                />
                <I18nText
                  i18nKey={withdrawRate}
                  type="tiptitle"
                  className={`text-${theme}-primary ml-1.5`}
                />
              </View>
            )}

            <View className="flex-row justify-between mt-3">
              <I18nText
                i18nKey="wallet.withdraw.withdrawFee"
                type="tiptitle"
                className={`text-${theme}-text`}
              />
              <I18nText
                i18nKey={`${globalConfig?.money_unit || ""}${serviceCharge}`}
                type="tiptitle"
                className={`text-${theme}-primary`}
              />
            </View>

            <View className="flex-row justify-between mt-3">
              <I18nText
                i18nKey="wallet.withdraw.currentBet"
                type="tiptitle"
                className={`text-${theme}-text`}
              />
              <I18nText
                i18nKey={`${globalConfig?.money_unit || ""}${withdrawConfig?.curBetNum}`}
                type="tiptitle"
                className={`text-${theme}-primary`}
              />
            </View>

            <View className="flex-row justify-between mt-3">
              <I18nText
                i18nKey="wallet.withdraw.withdrawRequiredBet"
                type="tiptitle"
                className={`text-${theme}-text`}
              />
              <I18nText
                i18nKey={`${globalConfig?.money_unit || ""}${withdrawConfig?.drawNeedBetNum}`}
                type="tiptitle"
                className={`text-${theme}-primary`}
              />
            </View>
          </>
        )}
      </>
    );
  },
);
