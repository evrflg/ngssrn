//*设置中心 */
import { SimpleHeader } from "@/components/common/Header";
import BindInfo from "@/components/my/BindInfo";
import UserProfile from "@/components/my/UserProfile";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const settingCenter = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className={`bg-${theme}-background`}
    >
      <SimpleHeader title={t("pageName.setTitle")} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        className="hide-scrollbar"
      >
        <View style={styles.content}>
          <UserProfile />
          <BindInfo />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default settingCenter;
