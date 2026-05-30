import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
  useWindowDimensions,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";
import { useCommon } from "@/hooks/CommonProvider";

type Props = {
  intro?: string;
  ruleDesc?: string;
  startTime?: string | number;
  endTime?: string | number;
};

function toDate(v: string | number | undefined): Date | null {
  if (v === undefined || v === null || (v as any) === "") return null;
  const d = typeof v === "number" ? new Date(v) : new Date(Number(v) || v);
  return isNaN(d.getTime()) ? null : d;
}

export default function MemberDayInfo({ intro = "", ruleDesc = "", startTime, endTime }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { language } = useCommon();

  const { width: deviceWidth } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(deviceWidth, 480), [deviceWidth]);
  const htmlContentWidth = Math.max(contentWidth - 72, 0);
  const [activeTab, setActiveTab] = useState<"intro" | "rules">("intro");
  const [activeTabWidth, setActiveTabWidth] = useState(0);

  const parsedRules = useMemo(
    () =>
      ruleDesc
        ? ruleDesc
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    [ruleDesc],
  );

  const activityTimeLabel = useMemo(() => {
    const fmt = (v: string | number | undefined) => {
      if (v === undefined || v === null || (v as any) === "") return "";
      const d = toDate(v);
      if (!d) return "";
      if (d.getFullYear() >= 2100) return "";
      const safeLocale = (() => {
        const loc = String(language ?? "").trim();
        if (!loc) return undefined;
        try {
          const supported = Intl.DateTimeFormat.supportedLocalesOf([loc]);
          return supported.length ? supported[0] : undefined;
        } catch {
          return undefined;
        }
      })();
      try {
        return new Intl.DateTimeFormat(safeLocale, {
          month: "short",
          day: "numeric",
        }).format(d);
      } catch {
        return new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
        }).format(d);
      }
    };
    const start = fmt(startTime);
    const end = fmt(endTime);
    if (!start && !end) return "";
    if (start && end) return `${start} — ${end}`;
    return start || end;
  }, [startTime, endTime, language]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) setActiveTabWidth(Math.round(width / 2));
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].cardBg1 }]}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={["rgba(236, 205, 141, 0)", "rgba(219, 166, 98, 0.1)"]}
        style={{
          borderRadius: 10,
        }}
      >
        <View className="flex-row" onLayout={onLayout}>
          <Pressable
            className="flex-1 items-center justify-center"
            onPress={() => setActiveTab("intro")}
            style={[styles.tabItem, { borderTopLeftRadius: 10 }]}
          >
            {activeTab === "intro" && (
              <Image
                source={require("@/assets/images/active/memberday/intro_tab.png")}
                resizeMode="stretch"
                style={[
                  styles.activeTabBgImg,
                  {
                    width: activeTabWidth,
                  },
                ]}
              />
            )}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.tabText,
                activeTab === "intro"
                  ? {
                      fontWeight: 700,
                      color: Colors[theme].text,
                      maxWidth: activeTabWidth - 46,
                    }
                  : {
                      color: Colors[theme].textGray,
                      maxWidth: activeTabWidth - 26,
                    },
              ]}
            >
              {t("active.specialBonus.intro")}
            </Text>
          </Pressable>
          <Pressable
            className="flex-1 items-center justify-center"
            onPress={() => setActiveTab("rules")}
            style={[styles.tabItem, { borderTopRightRadius: 10 }]}
          >
            {activeTab === "rules" && (
              <Image
                source={require("@/assets/images/active/memberday/rules_tab.png")}
                resizeMode="stretch"
                style={[
                  styles.activeTabBgImg,
                  {
                    width: activeTabWidth,
                  },
                ]}
              />
            )}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.tabText,
                activeTab === "rules"
                  ? {
                      fontWeight: 700,
                      color: Colors[theme].text,
                      maxWidth: activeTabWidth - 46,
                    }
                  : {
                      color: Colors[theme].textGray,
                      maxWidth: activeTabWidth - 26,
                    },
              ]}
            >
              {t("active.memberDay.ruleDesc")}
            </Text>
          </Pressable>
        </View>
        <View className="gap-3" style={styles.content}>
          {activeTab === "intro" ? (
            <>
              {intro ? (
                <RenderHtml
                  contentWidth={htmlContentWidth}
                  source={{ html: intro }}
                  baseStyle={{
                    fontSize: 14,
                    color: Colors[theme].darkColor,
                  }}
                  tagsStyles={{
                    img: {
                      maxWidth: htmlContentWidth,
                    },
                  }}
                  renderersProps={{
                    img: {
                      enableExperimentalPercentWidth: true,
                    },
                  }}
                />
              ) : (
                <Text style={styles.placeholder}>—</Text>
              )}
              {!!activityTimeLabel && (
                <View className="gap-2">
                  <Text style={[styles.contentText, { color: "#dba662" }]}>
                    {t("active.memberDay.activityTimeLabel")}
                  </Text>
                  <Text style={[styles.contentText, { color: Colors[theme].darkColor }]}>
                    {activityTimeLabel}
                  </Text>
                </View>
              )}
            </>
          ) : parsedRules.length ? (
            parsedRules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>{index + 1}.</Text>
                <Text style={[styles.ruleText, { color: Colors[theme].text }]}>{rule}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.placeholder}>—</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#ECCD8D",
  },
  tabItem: {
    padding: 8,
    height: 36,
  },
  activeTabBgImg: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 36,
  },
  tabText: {
    fontSize: 15,
    color: "#888",
    flexShrink: 1,
  },
  tabTextActive: {
    fontWeight: 700,
  },
  content: {
    padding: 20,
  },
  contentText: {
    fontSize: 14,
    writingDirection: "ltr",
    textAlign: "left",
  },
  placeholder: {
    fontSize: 14,
    color: "#888",
  },
  ruleItem: {
    flexDirection: "row",
    gap: 8,
  },
  ruleNumber: {
    color: "#dba662",
    fontWeight: "bold",
    fontSize: 14,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    textAlign: "left",
    writingDirection: "ltr",
  },
});
