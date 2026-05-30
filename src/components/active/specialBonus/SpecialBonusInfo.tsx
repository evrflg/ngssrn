import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  LayoutChangeEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import RenderHtml from "react-native-render-html";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import {
  IntroTabShape,
  RulesTabShape,
} from "@/components/active/memberDay/MemberDayTabShapes";

type Props = {
  introHtml?: string;
  ruleHtml?: string;
};

export default function SpecialBonusInfo({ introHtml, ruleHtml }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const { maxWidth } = useMaxWidth();
  const [activeTab, setActiveTab] = useState<"intro" | "rules">("intro");
  const [activeTabWidth, setActiveTabWidth] = useState(0);

  const contentWidth = useMemo(
    () => Math.min(windowWidth, maxWidth),
    [windowWidth, maxWidth],
  );
  const htmlContentWidth = Math.max(contentWidth - 56, 0);
  const pal = Colors[theme];
  const onLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) setActiveTabWidth(Math.round(width / 2));
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: pal.cardBg1,
          borderColor: pal.primary,
        },
      ]}
    >
      <LinearGradient
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        colors={[pal.myCenter2BtnStart, pal.myCenter2BtnEnd]}
        style={styles.cardGradient}
      >
        <View style={styles.tabRow} onLayout={onLayout}>
          <Pressable
            style={styles.tabBtn}
            onPress={() => setActiveTab("intro")}
          >
            {activeTab === "intro" && (
              <View
                style={[
                  styles.activeTabBgImg,
                  {
                    width: activeTabWidth,
                  },
                ]}
                pointerEvents="none"
              >
                <IntroTabShape
                  width={activeTabWidth}
                  height={36}
                  gradientStartColor={pal.tgBindGradientStart}
                  gradientEndColor={pal.tgBindGradientEnd}
                />
              </View>
            )}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.tabLabel,
                {
                  color:
                    activeTab === "intro"
                      ? Colors[theme].btnText
                      : Colors[theme].textGray,
                  maxWidth:
                    activeTab === "intro"
                      ? activeTabWidth - 46
                      : activeTabWidth - 26,
                },
              ]}
            >
              {t("active.specialBonus.intro")}
            </Text>
          </Pressable>
          <Pressable
            style={styles.tabBtn}
            onPress={() => setActiveTab("rules")}
          >
            {activeTab === "rules" && (
              <View
                style={[
                  styles.activeTabBgImg,
                  {
                    width: activeTabWidth,
                  },
                ]}
                pointerEvents="none"
              >
                <RulesTabShape
                  width={activeTabWidth}
                  height={36}
                  gradientStartColor={pal.tgBindGradientEnd}
                  gradientEndColor={pal.tgBindGradientStart}
                />
              </View>
            )}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.tabLabel,
                {
                  color:
                    activeTab === "rules"
                      ? Colors[theme].btnText
                      : Colors[theme].textGray,
                  maxWidth:
                    activeTab === "rules"
                      ? activeTabWidth - 46
                      : activeTabWidth - 26,
                },
              ]}
            >
              {t("active.specialBonus.rules")}
            </Text>
          </Pressable>
        </View>
        <View style={styles.tabBody}>
          {activeTab === "intro" ? (
            introHtml ? (
              <RenderHtml
                contentWidth={htmlContentWidth}
                source={{ html: introHtml }}
                baseStyle={{
                  fontSize: rf(13),
                  color: Colors[theme].text,
                  lineHeight: rf(22),
                  textAlign: "left",
                }}
                tagsStyles={{
                  img: { maxWidth: htmlContentWidth },
                }}
                renderersProps={{
                  img: { enableExperimentalPercentWidth: true },
                }}
              />
            ) : (
              <Text style={styles.placeholder}>—</Text>
            )
          ) : ruleHtml ? (
            <RenderHtml
              contentWidth={htmlContentWidth}
              source={{ html: ruleHtml }}
              baseStyle={{
                fontSize: rf(13),
                color: Colors[theme].text,
                lineHeight: rf(22),
                textAlign: "left",
              }}
              tagsStyles={{
                img: { maxWidth: htmlContentWidth },
              }}
              renderersProps={{
                img: { enableExperimentalPercentWidth: true },
              }}
            />
          ) : (
            <Text style={styles.placeholder}>—</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: "hidden",
  },
  cardGradient: {
    borderRadius: 12,
  },
  tabRow: {
    flexDirection: "row",
    height: 36,
  },
  tabBtn: {
    flex: 1,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  activeTabBgImg: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 36,
  },
  tabLabel: {
    fontSize: rf(14),
    fontWeight: "600",
    flexShrink: 1,
  },
  tabBody: {
    padding: 12,
    minHeight: 40,
  },
  placeholder: {
    color: "#888",
  },
});
