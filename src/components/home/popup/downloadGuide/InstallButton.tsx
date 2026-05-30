import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { isIOS } from "@/utils/deviceDetect";
import { useDownloadGuideContext } from "./Context";
import {
  getIosInstallButtonDisabled,
  getIosInstallButtonVisible,
  GOLD_GRADIENT_COLORS,
} from "./shared";
import { styles } from "./styles";

// 安装/下载按钮
export const DownloadGuideInstallButton = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const {
    appInfo,
    goLandingPage,
    pwaInstallable,
    isPwaInstalled,
    channelId,
    onInstall,
  } = useDownloadGuideContext();
  const isIOSDevice = isIOS();

  // 是否是 Android APK 安装
  const isAndroidApk = useMemo(() => {
    return (
      !isIOSDevice &&
      (appInfo?.installType === 1 ||
        (appInfo?.installType === 2 && !pwaInstallable))
    );
  }, [isIOSDevice, appInfo?.installType, pwaInstallable]);

  // 是否显示安装按钮（iOS installType 0：仅点击有反应时显示）
  const visible = useMemo(() => {
    if (isIOSDevice) {
      return getIosInstallButtonVisible(appInfo, goLandingPage);
    }
    return true;
  }, [appInfo, isIOSDevice, goLandingPage]);

  // 安装按钮是否禁用
  const disabled = useMemo(() => {
    if (isIOSDevice) {
      return getIosInstallButtonDisabled(appInfo, goLandingPage, channelId);
    }
    if (isAndroidApk) {
      return !appInfo?.downloadUrl;
    }
    return !pwaInstallable && !isPwaInstalled;
  }, [
    appInfo,
    isIOSDevice,
    goLandingPage,
    isAndroidApk,
    pwaInstallable,
    isPwaInstalled,
    channelId,
  ]);

  const text = useMemo(() => {
    if (isIOSDevice) {
      // 1: 前往商店，0: 安装
      return appInfo?.installType === 1
        ? t("popup.appDownload.goToStore")
        : t("popup.appDownload.install");
    }

    if (isAndroidApk) {
      return t("popup.appDownload.download");
    }
    if (isPwaInstalled) {
      return t("popup.appDownload.open");
    }
    return t("popup.appDownload.install");
  }, [
    appInfo?.installType,
    isIOSDevice,
    isAndroidApk,
    isPwaInstalled,
    t,
  ]);

  if (!visible) return null;

  return (
    <Pressable
      style={{ borderRadius: 20 }}
      onPress={onInstall}
      disabled={disabled}
    >
      <View style={styles.clickBtnWrapper}>
        {/* 渐变外框 */}
        <LinearGradient
          pointerEvents="none"
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          colors={GOLD_GRADIENT_COLORS}
          style={[styles.clickBtn, styles.clickBtnGoldGradient]}
        />
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={[Colors[theme].primary, Colors[theme].gradient]}
          style={styles.clickBtn}
        >
          <Text
            className={`text-center text-${theme}-btnText`}
            style={styles.clickBtnText}
          >
            {text}
          </Text>
        </LinearGradient>
      </View>
    </Pressable>
  );
};
