import { useTheme } from "@/hooks/theme/ThemeProvider";
import { TabView } from "@rneui/themed";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, useWindowDimensions } from "react-native";

import BaseTab from "@/components/common/BaseTab";
import { SimpleHeader } from "@/components/common/Header";
import PersonalReport from "@/components/record/PersonalReport";
import { TeamReport } from "@/components/record/TeamReport";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Report() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [baseIndex, setBaseIndex] = useState(0);
  const [contentWidth, setContentWidth] = useState<number>(windowWidth);
  const tabItems = [
    { name: t("reports.personalReport"), component: <PersonalReport /> },
    { name: t("reports.teamReport"), component: <TeamReport /> },
  ];

  // 顶部 tab 区域
  const scrollTab = (
    <View className={`w-full px-4`}>
      <BaseTab
        selectedIndex={baseIndex}
        setIndex={setBaseIndex}
        indicatorWidthRatio={0.2}
        showNumber={3}
        TextStyle={{ textAlign: "center" }}
        tabs={tabItems.map((item) => ({
          name: item.name,
        }))}
        tabClassName="p-2"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.root} className={`bg-${theme}-background`}>
      <SimpleHeader title={t("pageName.reportsTitle")} />
      {scrollTab}

      <View
        className="flex-1"
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0) setContentWidth(w);
        }}
      >
        <TabView value={baseIndex} onChange={setBaseIndex} animationType="spring">
          {tabItems.map((item, index) => (
            <TabView.Item key={index} style={{ width: contentWidth || windowWidth }}>
              {baseIndex === index && item.component}
            </TabView.Item>
          ))}
        </TabView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
});
