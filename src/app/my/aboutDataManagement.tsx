import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { HideScreenHeader } from "@/components/common/Header";
import { AutoHeightWebView } from "@/components/common/AutoHeightWebView";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
function contentLooksLikeHtml(raw: string): boolean {
  return /<[a-z][\s\S]*?>/i.test(raw.trim());
}

interface SiteDataVO {
  type: number;
  title: string;
  status: number;
  content?: string;
}

const AboutDataManagement = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { type } = route.params as { type: number };

  // 从 Redux store 获取数据
  const siteDataList = useSelector((state: RootState) => state?.user?.siteDataList || []);

  // 从 store 中查找对应的数据
  const item = siteDataList.find((item: SiteDataVO) => item.type === type);
  const title = item?.title || "";
  const rawContent = item?.content;
  const fallbackText = t("common.noData");
  const content = rawContent?.trim() ? rawContent : fallbackText;
  const useHtml =
    typeof rawContent === "string" &&
    rawContent.trim().length > 0 &&
    contentLooksLikeHtml(rawContent);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors[theme].background,
      }}
    >
      <HideScreenHeader title={title || t("pageName.about")} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.contentCard}>
          {useHtml ? (
            <AutoHeightWebView
              source={rawContent as string}
              autoHeight
              setInnerHTML
              webViewStyle={{ backgroundColor: "transparent" }}
            />
          ) : (
            <Text style={[styles.contentText, { color: Colors[theme].text }]}>{content}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  contentCard: {
    borderRadius: 8,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
  },
});

export default AboutDataManagement;
