import Subtract from "@/components/icons/Subtract";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { stationConfig } from "@/store/tenant/tenantSlice";
import { RootState } from "@/store/store";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { styles } from "./styles";

export const DownloadGuideCustomerServiceButton = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const globalConfig = useSelector(
    (state: RootState) => state.user.cfg_site_base,
  );
  const siteConfig = useSelector(stationConfig);

  const customServiceLink = useMemo(
    () =>
      siteConfig?.customServiceLink?.trim?.() ||
      globalConfig?.customServiceLink?.trim?.() ||
      "",
    [siteConfig?.customServiceLink, globalConfig?.customServiceLink],
  );

  if (!customServiceLink) return null;

  const handleOpenSupport = async () => {
    try {
      const supported = await Linking.canOpenURL(customServiceLink);
      if (supported) await Linking.openURL(customServiceLink);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-row justify-end items-center mt-4">
      <View className="absolute" style={{ bottom: 0, right: 0 }}>
        <Subtract color={Colors[theme].primary} />
      </View>
      <Pressable
        className="items-center justify-center"
        style={{ width: 120, height: 34, cursor: "pointer" }}
        onPress={handleOpenSupport}
      >
        <Text
          className={`text-${theme}-darkColor items-center text-center`}
          style={[styles.clickBtnText]}
        >
          {t("common.onlineSupport")}
        </Text>
      </Pressable>
    </View>
  );
};
