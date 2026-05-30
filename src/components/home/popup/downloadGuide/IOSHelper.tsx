import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Octicons, Feather } from "@expo/vector-icons";
import { Trans, useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { isIOS } from "@/utils/deviceDetect";
import { useDownloadGuideContext } from "./Context";
import { styles } from "./styles";

export const DownloadGuideIOSHelper = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { guideInstallConfig } = useDownloadGuideContext();
  const isIOSDevice = isIOS();

  const visible = isIOSDevice && guideInstallConfig?.ios?.installType === 0;

  const notes = [
    t("popup.appDownload.iosHelperNote1"),
    t("popup.appDownload.iosHelperNote2"),
  ].filter((note) => note && note.trim());

  // iOS 保存桌面
  if (!visible) return null;

  return (
    <>
      <View
        className="rounded p-3 gap-2"
        style={{
          backgroundColor: Colors[theme].downloadGuideBgColor,
        }}
      >
        <Text className={`text-${theme}-darkColor text-center`} style={styles.helperTitle}>
          {t("popup.appDownload.iosHelperTextStepsTitle")}
        </Text>
        <View className="flex-row items-center">
          <Trans
            parent={Text}
            className={`text-${theme}-darkColor`}
            style={[styles.hint, { fontSize: 12 }]}
            i18nKey="popup.appDownload.iosHelperTextSteps1"
            components={{
              shareIcon: (
                <Feather className="mx-1" name="share" size={13} color={Colors[theme].primary} />
              ),
            }}
          />
        </View>
        <View className="flex-row items-center">
          <Trans
            parent={Text}
            className={`text-${theme}-darkColor`}
            style={[styles.hint, { fontSize: 12 }]}
            i18nKey="popup.appDownload.iosHelperTextSteps2"
            components={{
              shareIcon: (
                <Feather className="mx-1" name="share" size={13} color={Colors[theme].primary} />
              ),
            }}
          />
        </View>
        <Text className={`text-${theme}-darkColor`} style={[styles.hint, { fontSize: 12 }]}>
          {t("popup.appDownload.iosHelperStepOtherBrowser")}
        </Text>
        <Text className={`text-${theme}-darkColor`} style={[styles.hint, { fontSize: 12 }]}>
          {t("popup.appDownload.iosHelperStep2")}
        </Text>
        <Text className={`text-${theme}-darkColor`} style={[styles.hint, { fontSize: 12 }]}>
          {t("popup.appDownload.iosHelperStep3")}
        </Text>
      </View>
      {/* 备注说明 */}
      {notes.length > 0 && (
        <View
          className="rounded p-3 gap-2"
          style={{
            backgroundColor: Colors[theme].downloadGuideBgColor,
          }}
        >
          {notes.map((note, idx) => (
            <View className="flex-row items-center gap-2" key={`ios-helper-note-${idx}`}>
              <Octicons name="dot-fill" size={6} color={Colors[theme].primary} />
              <Text className={`text-${theme}-darkColor`} style={[styles.hint, { fontSize: 12 }]}>
                {note}
              </Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
};
