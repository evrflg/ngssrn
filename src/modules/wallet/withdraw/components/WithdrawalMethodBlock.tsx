import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, ImageSourcePropType, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

interface WithdrawalMethodBlockProps {
  title: string;
  text: string;
  realName: string;
  icon: ImageSourcePropType;
  onPress?: () => void;
  right?: React.ReactNode;
}

function maskText(str: string) {
  if (!str) return "******0000";
  if (str.length > 4) return `****${str.slice(-3)}`;
  return str;
}

export const WithdrawalMethodBlock = React.memo(
  ({ title, text, realName, icon, onPress, right }: WithdrawalMethodBlockProps) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const iconColor = useMemo(() => Colors[theme].lightText, [theme]);

    return (
      <Pressable
        className={`bg-${theme}-btnText rounded-lg mt-[15px] overflow-hidden`}
        onPress={onPress}
      >
        <View style={{ paddingHorizontal: 10, paddingVertical: 15 }}>
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center gap-2">
              <Ionicons name="wallet" size={16} color={iconColor} />
              <Text className={`text-${theme}-lightText text-sm`}>{t("wallet.accountName")}</Text>
            </View>
            <Text className={`text-${theme}-text text-sm`}>{realName}</Text>
          </View>
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center gap-2">
              <FontAwesome6 name="building-columns" size={16} color={iconColor} />
              <Text className={`text-${theme}-lightText text-sm`}>{t("wallet.bankName")}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Image style={{ width: 20, height: 20 }} resizeMode="contain" source={icon} />
              <Text className={`text-${theme}-text text-sm`}>{title}</Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center gap-2">
              <Ionicons name="person" size={16} color={iconColor} />
              <Text className={`text-${theme}-lightText text-sm`}>{t("wallet.cardNo")}</Text>
            </View>
            <Text className={`text-${theme}-text text-sm`}>{maskText(text)}</Text>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: "rgba(173, 183, 186, 0.2)",
              marginBottom: 10,
            }}
          />
          <View className="flex-row items-center justify-end gap-2 mt-2.5">
            {right ?? (
              <>
                <Text className={`text-${theme}-lightText text-sm`}>{t("wallet.detail")}</Text>
                <Ionicons name="chevron-forward" size={16} color={iconColor} />
              </>
            )}
          </View>
        </View>
      </Pressable>
    );
  },
);
