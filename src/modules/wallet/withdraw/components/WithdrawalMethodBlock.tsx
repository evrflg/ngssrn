import { I18nText } from "@/components/I18nText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { stationConfig } from "@/store/tenant/tenantSlice";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, ImageSourcePropType, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

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
    const siteConfig = useSelector(stationConfig);
    const isTestSite = Boolean(siteConfig?.isTestSite);

    const iconColor = useMemo(() => Colors[theme].lightText, [theme]);

    if (isTestSite) {
      return (
        <Pressable
          className={`bg-${theme}-btnText rounded-lg mt-2.5 overflow-hidden`}
          onPress={onPress}
        >
          <View style={{ paddingHorizontal: 10, paddingVertical: 16 }}>
            <View className="flex-row items-center justify-between mb-2.5">
              <View className="flex-row items-center gap-2">
                <Ionicons name="person-outline" size={16} color={iconColor} />
                <Text className={`text-${theme}-lightText text-sm`}>
                  {t("wallet.accountName")}
                </Text>
              </View>
              <Text className={`text-${theme}-text text-sm`}>{realName}</Text>
            </View>
            <View className="flex-row items-center justify-between mb-2.5">
              <View className="flex-row items-center gap-2">
                <Ionicons name="business-outline" size={16} color={iconColor} />
                <Text className={`text-${theme}-lightText text-sm`}>{t("wallet.bankName")}</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Image style={{ width: 20, height: 20 }} resizeMode="contain" source={icon} />
                <Text className={`text-${theme}-text text-sm`}>{title}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-2.5">
              <View className="flex-row items-center gap-2">
                <Ionicons name="card-outline" size={16} color={iconColor} />
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
            <View className="flex-row items-center justify-end gap-2">
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
    }

    return (
      <Pressable
        className={`bg-${theme}-btnText rounded-lg mt-2.5 overflow-hidden`}
        onPress={onPress}
      >
        <View className="flex-row gap-2" style={{ paddingHorizontal: 10, paddingVertical: 16 }}>
          <View className="flex-1">
            <View className="flex-row gap-1 items-center">
              <Image style={{ width: 24, height: 24 }} resizeMode="contain" source={icon} />
              <I18nText
                i18nKey={`${realName}/${title}`}
                className={`text-${theme}-text`}
              />
            </View>
            <I18nText
              i18nKey={text}
              className={`text-${theme}-text mt-2.5 font-normal`}
              type="title"
            />
          </View>
          <View className="justify-center">
            {right ?? <Ionicons name="chevron-forward" size={18} color={iconColor} />}
          </View>
        </View>
      </Pressable>
    );
  },
);
