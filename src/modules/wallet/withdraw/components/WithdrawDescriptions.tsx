import { I18nText } from "@/components/I18nText";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React from "react";
import { Text, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { WithdrawConfig } from "../../shared/types";

interface WithdrawDescriptionsProps {
  withdrawConfig: WithdrawConfig | null;
  withdrawLimit: { minDrawMoney: number; maxDrawMoney: number };
  globalConfig: any;
}

export const WithdrawDescriptions = React.memo(
  ({ withdrawConfig, withdrawLimit, globalConfig }: WithdrawDescriptionsProps) => {
    const { theme } = useTheme();
    const unit = globalConfig?.money_unit || "";
    const primaryStyle = { color: Colors[theme].primary };

    const BulletDot = () => (
      <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45`} />
    );

    const rowStyle = { textAlign: "left" as const, writingDirection: "ltr" as const };

    return (
      <View className={`bg-${theme}-btnText rounded-lg pt-5 gap-2`}>

        {/* Description 1：还需打码量 */}
        <View className="flex-row items-center">
          <BulletDot />
          <I18nText
            i18nKey="wallet.withdraw.withdrawDescription1"
            values={{
              money: `${unit}${Math.max((withdrawConfig?.drawNeedBetNum ?? 0) - (withdrawConfig?.curBetNum ?? 0), 0)}`,
            }}
            className={`text-${theme}-text flex-1`}
            style={rowStyle}
            type="subtitle"
            transComponents={{ span: <Text style={primaryStyle} /> }}
          />
        </View>

        {/* Description 2：提现时间 */}
        <View className="flex-row items-center">
          <BulletDot />
          <I18nText
            i18nKey="wallet.withdraw.withdrawDescription2"
            values={{ time: "00:00-23:59" }}
            className={`text-${theme}-text flex-1`}
            style={rowStyle}
            type="subtitle"
            transComponents={{ span: <Text style={primaryStyle} /> }}
          />
        </View>

        {/* 提现次数：剩余/总次数 */}
        <View className="flex-row items-center">
          <BulletDot />
          <I18nText
            i18nKey="wallet.withdraw.times"
            values={{
              remainTimes: Math.max(Number(withdrawConfig?.freeDrawTimes ?? 0), 0),
              totalTimes: Math.max(Number(withdrawConfig?.drawTimes ?? 0), 0),
            }}
            className={`text-${theme}-text flex-1`}
            style={rowStyle}
            type="subtitle"
            transComponents={{ span: <Text style={primaryStyle} /> }}
          />
        </View>

        {/* Description 4：提现范围 */}
        <View className="flex-row items-center">
          <BulletDot />
          <I18nText
            i18nKey="wallet.withdraw.withdrawDescription4"
            values={{
              rangeMoney: `${unit}${withdrawLimit.minDrawMoney ?? "0"}-${unit}${withdrawLimit.maxDrawMoney ?? "999999"}`,
            }}
            className={`text-${theme}-text flex-1`}
            style={rowStyle}
            type="subtitle"
            transComponents={{ span: <Text style={primaryStyle} /> }}
          />
        </View>

        {/* 当前打码量：标签 + 数值并排（与原始一致） */}
        <View className="flex-row items-center">
          <BulletDot />
          <I18nText
            i18nKey="wallet.withdraw.currentBet"
            className={`text-${theme}-text`}
            type="subtitle"
          />
          <I18nText
            i18nKey={` ${Number(withdrawConfig?.curBetNum ?? 0)}`}
            type="tiptitle"
            className={`text-${theme}-primary`}
          />
        </View>

        {/* Description 5 */}
        <View className="flex-row items-center">
          <BulletDot />
          <I18nText
            i18nKey="wallet.withdraw.withdrawDescription5"
            className={`text-${theme}-text flex-1`}
            style={rowStyle}
            type="subtitle"
          />
        </View>

        {/* Description 6 */}
        <View className="flex-row items-center">
          <BulletDot />
          <I18nText
            i18nKey="wallet.withdraw.withdrawDescription6"
            className={`text-${theme}-text flex-1`}
            style={rowStyle}
            type="subtitle"
          />
        </View>

        {/* 自定义提现提示（如有） */}
        {withdrawConfig?.withdrawTips ? (
          <View className="flex-row items-center">
            <BulletDot />
            <I18nText
              i18nKey={withdrawConfig.withdrawTips}
              className={`text-${theme}-text flex-1`}
              style={rowStyle}
              type="subtitle"
            />
          </View>
        ) : null}
      </View>
    );
  },
);
