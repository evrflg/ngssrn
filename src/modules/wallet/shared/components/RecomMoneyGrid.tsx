import { MoneySelectorCheckedIcon } from "@/components/icons/wallet";
import { I18nText } from "@/components/I18nText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import React from "react";
import { Pressable, Text, View } from "react-native";

export interface RecomMoneyOption {
  money: string | number;
  /** 礼品类型：0=百分比赠送, 1=固定额赠送；充值时有值，提现时为 undefined */
  type?: number;
  /** 礼品值；充值时有值 */
  giftValue?: string | number;
}

interface RecomMoneyGridProps {
  options: RecomMoneyOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export const RecomMoneyGrid = React.memo(
  ({ options, selectedValue, onSelect }: RecomMoneyGridProps) => {
    const { theme } = useTheme();

    if (options.length === 0) return null;

    return (
      <View className="flex-row flex-wrap gap-x-[2%] mb-2">
        {options.map((option) => {
          {/* 提现金额不配置就不显示 */ }
          if (!option.money) {
            return null;
          }
          const money = String(option.money);
          const isSelected = selectedValue === money;
          const showGift = option.type !== undefined && option.giftValue !== undefined;

          return (
            <Pressable
              key={money}
              className={`w-[32%] px-2 py-4 mb-2 rounded-lg ${isSelected
                ? `border border-${theme}-primary bg-${theme}-btnText`
                : `bg-${theme}-blockBg2`
                }`}
              onPress={() => onSelect(money)}
            >
              <Text
                className={`text-center ${isSelected ? `text-${theme}-primary` : `text-${theme}-textGray`
                  }`}
              >$ {money}
              </Text>

              {showGift && (
                <View
                  className={`-right-px -top-px absolute px-1.5 bg-${theme}-primary`}
                  style={{ borderTopRightRadius: 8, borderBottomLeftRadius: 8 }}
                >
                  <I18nText
                    i18nKey={
                      Number(option.type) === 0
                        ? "wallet.recharge.giftPercent"
                        : "wallet.recharge.giftPlus"
                    }
                    values={{ value: option.giftValue }}
                    type="tiptitle"
                    className="text-center text-[#fff]"
                    style={{ fontSize: rf(10) }}
                  />
                </View>
              )}

              {isSelected && (
                <View pointerEvents="none" className="absolute -right-px -bottom-px">
                  <MoneySelectorCheckedIcon fill={Colors[theme].primary} width={24} height={17} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    );
  },
);
