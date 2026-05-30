import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { AntDesign } from "@expo/vector-icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";
import { useDownloadGuideContext } from "./Context";
import { styles } from "./styles";

interface DownloadGuidePopupHeaderProps {
  onClose: () => void;
}

export const DownloadGuidePopupHeader = ({
  onClose,
}: DownloadGuidePopupHeaderProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { guideInstallConfig } = useDownloadGuideContext();

  const canClosePopup = guideInstallConfig?.popupIntervalTimeType !== 0;

  const popupTitle = useMemo(() => {
    const cfg = guideInstallConfig;
    if (!cfg) return "";

    if (cfg.popupContentType === 1 && cfg.installGiftAmount > 0) {
      return t("popup.appDownload.defaultTitle", {
        amount: cfg.installGiftAmount,
      });
    }

    return "";
  }, [guideInstallConfig, t]);

  return (
    <View className="pt-4 px-4">
      <View className="items-center">
        <Image
          source={require("@/assets/images/home/appdownload/guide-popup.png")}
          style={styles.bannerImage}
        />
      </View>
      <View className="flex-row justify-end mb-4">
        {canClosePopup && (
          <Pressable
            onPress={onClose}
            style={[
              styles.closeBtn,
              { backgroundColor: Colors[theme].closeBtnBgColor },
            ]}
          >
            <AntDesign name="close" size={16} color="white" />
          </Pressable>
        )}
      </View>
      {!!popupTitle && (
        <Text
          className={`text-${theme}-darkColor text-center`}
          style={styles.popupTitle}
        >
          {popupTitle}
        </Text>
      )}
    </View>
  );
};
