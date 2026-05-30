import { bindTelegram, checkTgBind } from "@/api";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useStationI18n } from "@/hooks/useStationI18n";
import { rf } from "@/utils/scaleFont";
import { EvilIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

const STATION_DESCRIPTION_KEY = "telegram-bind-description";

export const TelegramAlert = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { translation, translationExists } = useStationI18n();
  const [visible, setVisible] = useState(false);
  const hasStationDescription = translationExists(STATION_DESCRIPTION_KEY);

  useEffect(() => {
    let mounted = true;

    checkTgBind()
      .then((response: any) => {
        if (mounted) {
          const bind = !!response?.data?.data?.bind;
          const toggle = !!response?.data?.data?.toggle;
          setVisible(!bind && toggle);
        }
      })
      .catch(() => {
        if (mounted) {
          setVisible(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  const handleBind = useCallback(async () => {
    const resp = await bindTelegram();
    const bindUrl = resp?.data?.data;
    if (bindUrl) {
      const canOpen = await Linking.canOpenURL(bindUrl);
      if (canOpen) {
        await Linking.openURL(bindUrl);
      }
    }
    handleClose();
  }, [handleClose]);

  if (!visible) return null;

  return (
    <View
      className="p-2 w-full flex-row gap-2 items-center"
      style={[styles.bindCard, { backgroundColor: Colors[theme].btnText }]}
    >
      <View className="flex-1">
        {hasStationDescription ? (
          <Text
            style={[styles.stationDescription, { color: Colors[theme].darkColor }]}
          >
            {translation(STATION_DESCRIPTION_KEY)}
          </Text>
        ) : (
          <>
            <View className="flex-row gap-1 items-center mb-1">
              <EvilIcons name="sc-telegram" color="#2AABEE" size={20} />
              <Text style={styles.title}>
                {t("telegramBindCard.title", {
                  defaultValue: t("popup.telegram.bindTelegramTitle"),
                })}
              </Text>
            </View>
            <Text style={[styles.content, { color: Colors[theme].darkColor }]}>
              {t("telegramBindCard.description", {
                defaultValue: t("popup.telegram.bindTelegramDescription"),
              })}
            </Text>
          </>
        )}
      </View>
      <View className="flex-row gap-2 items-center">
        <Pressable onPress={handleClose} style={styles.buttonWrapper}>
          <LinearGradient
            colors={[Colors[theme].primary, Colors[theme].gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, { opacity: 0.4 }]}
          >
            <Text style={styles.buttonText}>
              {t("telegramBindCard.close", {
                defaultValue: t("popup.telegram.close"),
              })}
            </Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={handleBind} style={styles.buttonWrapper}>
          <LinearGradient
            colors={[Colors[theme].primary, Colors[theme].gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {t("telegramBindCard.bind", {
                defaultValue: t("common.binding"),
              })}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bindCard: {
    borderWidth: 1,
    borderColor: "#c1c100",
    borderStyle: "dashed",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  title: {
    fontSize: rf(12),
    fontWeight: 600,
    color: "#2AABEE",
  },
  content: {
    fontSize: rf(10),
    lineHeight: rf(13),
  },
  stationDescription: {
    fontSize: rf(10),
    lineHeight: rf(13),
  },
  buttonWrapper: {
    width: 64,
  },
  button: {
    borderRadius: 6,
    minHeight: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: rf(11),
    fontWeight: 600,
  },
});
