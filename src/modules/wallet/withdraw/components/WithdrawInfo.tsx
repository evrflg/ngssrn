import { I18nText } from "@/components/I18nText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { formatMoney } from "@/utils/utils";
import React from "react";
import { Text, View } from "react-native";

export interface WithdrawInfoProps {
  curBetNum?: number | string;
  drawNeedBetNum?: number | string;
  drawTimes?: number | string;
  freeDrawTimes?: number | string;
  chargeFee?: number;
  minDrawMoney?: number | string;
  maxDrawMoney?: number | string;
}

export const WithdrawInfo = React.memo(
  ({
    curBetNum = 0,
    drawNeedBetNum = 0,
    drawTimes = 0,
    freeDrawTimes = 0,
    minDrawMoney = 0,
    maxDrawMoney = 0,
  }: WithdrawInfoProps) => {
    const { theme } = useTheme();
    const primaryStyle = {
      color: Colors[theme].primary,
      writingDirection: "ltr",
    };
    const remainingBet = formatMoney(
      Math.max(Number(drawNeedBetNum) - Number(curBetNum), 0) || 0,
    );

    const BulletRow = ({ children }: { children: React.ReactNode }) => (
      <View
        className="flex-row items-start px-3"
        style={{ paddingVertical: 4 }}
      >
        <Text
          style={[primaryStyle, { fontSize: 8, marginTop: 6, marginRight: 8 }]}
        >
          ◆
        </Text>
        <View className="flex-1">{children}</View>
      </View>
    );

    return (
      <View className="py-1">
        <BulletRow>
          <I18nText
            i18nKey="wallet.canWithdrawAfterBettedNTimes"
            values={{ amount: remainingBet }}
            className={`text-${theme}-lightText`}
            type="subtitle"
            transComponents={{ span: <Text style={primaryStyle} /> }}
            style={{ writingDirection: "ltr" }}
          />
        </BulletRow>
        <BulletRow>
          <View className="flex-row flex-wrap items-center">
            <I18nText
              i18nKey="wallet.withdrawalTime"
              className={`text-${theme}-lightText`}
              type="subtitle"
              style={{ writingDirection: "ltr" }}
            />
            <Text style={[primaryStyle, { fontSize: 12 }]}>00:00-23:59</Text>
          </View>
        </BulletRow>
        <BulletRow>
          <I18nText
            i18nKey="wallet.feeDescription"
            values={{ total: String(drawTimes), remain: String(freeDrawTimes) }}
            className={`text-${theme}-lightText`}
            type="subtitle"
            transComponents={{
              span1: <Text style={primaryStyle} />,
              span2: <Text style={primaryStyle} />,
            }}
            style={{ writingDirection: "ltr" }}
          />
        </BulletRow>
        <BulletRow>
          <View className="flex-row flex-wrap items-center">
            <I18nText
              i18nKey="wallet.withdrawalAmountRange"
              className={`text-${theme}-lightText`}
              type="subtitle"
              style={{ writingDirection: "ltr" }}
            />
            <Text style={[primaryStyle, { fontSize: 12 }]}>
              {minDrawMoney ?? 0}-{maxDrawMoney ?? 0}
            </Text>
          </View>
        </BulletRow>
        <BulletRow>
          <I18nText
            i18nKey="wallet.confirmAccountInfoWarning"
            className={`text-${theme}-lightText`}
            type="subtitle"
            style={{ writingDirection: "ltr" }}
          />
        </BulletRow>
        <BulletRow>
          <I18nText
            i18nKey="wallet.ifIncorrectContactCustomerService"
            className={`text-${theme}-lightText`}
            type="subtitle"
            style={{ writingDirection: "ltr" }}
          />
        </BulletRow>
      </View>
    );
  },
);
