import { I18nText } from "@/components/I18nText";
import { RechargeIcon } from "@/components/icons/wallet";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { rf } from "@/utils/scaleFont";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

const INSTRUCTION_KEYS = [
  "wallet.rechargeInstructions1",
  "wallet.rechargeInstructions2",
  "wallet.rechargeInstructions3",
  "wallet.rechargeInstructions4",
] as const;

interface RechargeExplainProps {
  remark?: string;
  showBackendRemarkOnly?: boolean;
}

export const RechargeExplain = React.memo(
  ({ remark, showBackendRemarkOnly = false }: RechargeExplainProps) => {
    const { theme } = useTheme();
    const primaryColor = useThemeColor({}, "primary");

    const items = useMemo(() => {
      if (showBackendRemarkOnly && remark) {
        return [{ type: "remark" as const, text: remark }];
      }
      const list: { type: "remark" | "instruction"; text?: string; i18nKey?: string }[] = [];
      if (remark) list.push({ type: "remark", text: remark });
      INSTRUCTION_KEYS.forEach((key) => list.push({ type: "instruction", i18nKey: key }));
      return list;
    }, [remark, showBackendRemarkOnly]);

    if (items.length === 0) return null;

    const BulletDot = () => (
      <View
        className="mr-2 mt-1.5"
        style={{
          width: 5,
          height: 5,
          backgroundColor: primaryColor,
          transform: [{ rotate: "45deg" }],
        }}
      />
    );

    return (
      <View className="mt-2.5 mb-4">
        <View className="flex-row items-center mb-2">
          <RechargeIcon width={20} height={18} fill={primaryColor} />
          <I18nText
            i18nKey="wallet.rechargeInstructions"
            className={`ml-2.5 text-${theme}-text font-bold`}
            style={{ fontSize: rf(13) }}
          />
        </View>
        <View
          className={`bg-${theme}-btnText rounded-[10px] px-2.5 py-2.5`}
          style={{
            marginTop: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View className="px-2.5">
            {items.map((item, index) => (
              <View key={index} className="flex-row items-start my-2">
                <BulletDot />
                {item.type === "remark" ? (
                  <Text
                    className={`text-${theme}-text flex-1`}
                    style={{
                      fontSize: rf(12),
                      textAlign: "left",
                      writingDirection: "ltr",
                    }}
                  >
                    {item.text}
                  </Text>
                ) : (
                  <I18nText
                    i18nKey={item.i18nKey!}
                    className={`text-${theme}-text flex-1`}
                    type="subtitle"
                    style={{ fontSize: rf(12), textAlign: "left", writingDirection: "ltr" }}
                  />
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  },
);
