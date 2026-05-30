import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { I18nText } from "@/components/I18nText";
import { CheckIcon } from "@/components/common/BaseCheckbox";
import { EvilIcons } from "@expo/vector-icons";

interface ContentProps {
  isChecked: boolean;
  onToggleChecked: () => void;
  onBind: () => void | Promise<void>;
  hideCheckBox?: boolean;
}

export function Content({
  isChecked,
  onToggleChecked,
  onBind,
  hideCheckBox = false,
}: ContentProps) {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const contentWidth = useMemo(() => Math.min(400, width * 0.9), [width]);
  const HEADER_BLEED = 18;

  return (
    <>
      <View style={[styles.root, { width: contentWidth }]}>
        <View style={[styles.card, { width: contentWidth, marginTop: HEADER_BLEED }]}>
          <LinearGradient
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            colors={[Colors[theme].tgBindGradientStart, Colors[theme].tgBindGradientEnd]}
            style={styles.header}
          >
            <View className="absolute" style={styles.tgIcon}>
              <EvilIcons name="sc-telegram" size={38} color={"white"} />
            </View>
            <I18nText i18nKey="popup.telegram.bindTelegramTitle" style={styles.title} />
            <Text className="wrap-break-word whitespace-normal" style={[styles.subTitle]}>
              <View style={{ width: 46 }} />
              {t("popup.telegram.bindTelegramDescription")}
            </Text>
          </LinearGradient>
          <View className="p-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
              <View className="gap-3">
                <View
                  className="p-3"
                  style={{
                    backgroundColor: Colors[theme].tgBindContentBgColor,
                    borderRadius: 10,
                    gap: 10,
                  }}
                >
                  <Text
                    style={{
                      color: Colors[theme].primary,
                      fontWeight: 600,
                      fontSize: 12,
                      textAlign: "left",
                      writingDirection: "ltr",
                    }}
                  >
                    {t("popup.telegram.bindTelegramStep")}:
                  </Text>
                  <View className="flex-row gap-3 items-center">
                    <Text
                      className="flex text-center items-center justify-center"
                      style={[styles.stepNum, { backgroundColor: Colors[theme].primary }]}
                    >
                      1
                    </Text>
                    <Text style={styles.content}>{t("popup.telegram.bindTelegramStep1")}</Text>
                  </View>
                  <View className="flex-row gap-3 items-center">
                    <Text
                      className="flex text-center items-center justify-center"
                      style={[styles.stepNum, { backgroundColor: Colors[theme].primary }]}
                    >
                      2
                    </Text>
                    <Text style={styles.content}>{t("popup.telegram.bindTelegramStep2")}</Text>
                  </View>
                  <View className="flex-row gap-3 items-center">
                    <Text
                      className="flex text-center items-center justify-center"
                      style={[styles.stepNum, { backgroundColor: Colors[theme].primary }]}
                    >
                      3
                    </Text>
                    <Text style={styles.content}>{t("popup.telegram.bindTelegramStep3")}</Text>
                  </View>
                  <View className="flex-row gap-3 items-center">
                    <Text
                      className="flex text-center items-center justify-center"
                      style={[styles.stepNum, { backgroundColor: Colors[theme].primary }]}
                    >
                      4
                    </Text>
                    <Text style={styles.content}>{t("popup.telegram.bindTelegramStep4")}</Text>
                  </View>
                </View>
              </View>
              <Pressable onPress={onBind} style={styles.bindPressable}>
                <LinearGradient
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  colors={[Colors[theme].tgBindGradientStart, Colors[theme].tgBindGradientEnd]}
                  style={styles.bindButton}
                >
                  <Text style={[styles.bindButtonText, { color: Colors[theme].btnText }]}>
                    {t("common.binding")}
                  </Text>
                </LinearGradient>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </View>
      {!hideCheckBox && (
        <View className="mt-2" style={{ width: contentWidth }}>
          <CheckIcon
            isChecked={isChecked}
            onToggleChecked={onToggleChecked}
            i18nKey="popup.dontPopToday"
            textStyle={{ color: "#fff" }}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    overflow: "visible",
    alignSelf: "center",
  },
  card: {
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  tgIcon: {
    position: "absolute",
    top: 16,
    left: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    paddingLeft: 46,
    textAlign: "left",
    writingDirection: "ltr",
  },
  subTitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.88)",
    marginTop: 4,
    textAlign: "left",
    writingDirection: "ltr",
  },
  stepNum: {
    width: 19,
    height: 19,
    lineHeight: 19,
    borderRadius: 10,
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  content: {
    fontSize: 12,
    color: "#333",
    textAlign: "left",
    writingDirection: "ltr",
  },
  bindPressable: {
    alignSelf: "stretch",
  },
  bindButton: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 30,
  },
  bindButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  bindStepsTitle: {
    top: 0,
    left: 0,
    height: 30,
  },
});
