import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { AntDesign } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { isIOS } from "@/utils/deviceDetect";
import { useDownloadGuideContext } from "./Context";
import { DownloadGuideAppInfo } from "./AppInfo";
import { DownloadGuideIOSHelper } from "./IOSHelper";
import { DownloadGuideCustomerServiceButton } from "./CustomerServiceButton";
import { DownloadGuideInstallButton } from "./InstallButton";
import { GOLD_GRADIENT_COLORS } from "./shared";
import { styles } from "./styles";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { PopupModal } from "../common/PopupModal";
import { CheckIcon } from "@/components/common/BaseCheckbox";

interface DownloadGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DownloadGuideModal = ({
  visible,
  onClose,
}: DownloadGuideModalProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isIOSDevice = isIOS();
  const { guideInstallConfig, isDontPopupAgain, onToggleDontPopup } =
    useDownloadGuideContext();
  const { maxWidth } = useMaxWidth();

  // 是否可以关闭弹窗
  const canClosePopup = guideInstallConfig?.popupIntervalTimeType !== 0;
  const showAndroidHelperText =
    !isIOSDevice && guideInstallConfig?.android?.installType !== 0;

  if (!visible) return null;

  return (
    <BlurView
      intensity={30}
      className="w-full justify-end"
      style={StyleSheet.absoluteFill}
    >
      <PopupModal
        id="app-download-guide-popup"
        isVisible={visible}
        onClose={onClose}
        onBackdropPress={canClosePopup ? onClose : () => {}}
        style={[styles.popup, { width: maxWidth, marginHorizontal: "auto" }]}
      >
        <View style={styles.contentGradientWrapper}>
          {/* 渐变外框 */}
          <LinearGradient
            pointerEvents="none"
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            colors={GOLD_GRADIENT_COLORS}
            style={styles.contentGoldGradient}
          />
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={["transparent", Colors[theme].lightPrimary]}
            style={[styles.content, { backgroundColor: Colors[theme].cardBg1 }]}
          >
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
                    <AntDesign name="close" size={16} color={"white"} />
                  </Pressable>
                )}
              </View>
            </View>

            <View className="gap-3 px-4 pt-8">
              {/* 应用信息 */}
              <DownloadGuideAppInfo />

              {/* iOS 保存桌面 */}
              <DownloadGuideIOSHelper />

              {/* 安装/下载按钮 */}
              <DownloadGuideInstallButton />

              {/* Android 帮助文案 */}
              {showAndroidHelperText && (
                <View
                  className="rounded p-3"
                  style={{
                    backgroundColor: Colors[theme].downloadGuideBgColor,
                  }}
                >
                  <Text
                    className={`text-${theme}-darkColor text-center`}
                    style={styles.hint}
                  >
                    {t("popup.appDownload.androidHelperText")}
                  </Text>
                </View>
              )}

              <CheckIcon
                isChecked={isDontPopupAgain}
                onToggleChecked={onToggleDontPopup}
                i18nKey="popup.dontPopup"
              />
            </View>

            <DownloadGuideCustomerServiceButton />
          </LinearGradient>
        </View>
      </PopupModal>
    </BlurView>
  );
};
