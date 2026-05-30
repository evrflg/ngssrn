import { HideScreenHeader } from "@/components/common/Header";
import FeedbackForm from "@/components/home/components/feedBack/FeedbackForm";
import FeedbackList from "@/components/home/components/feedBack/FeedbackList";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { rf } from "@/utils/scaleFont";
import { SafeAreaView } from "react-native-safe-area-context";

const FeedbackScreen = () => {
  const [activeTab, setActiveTab] = useState("submit");
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width: layoutWidth } = useWindowDimensions();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors[theme].background,
        overflow: "hidden",
      }}
    >
      <HideScreenHeader title={t("pageName.feedback")} />
      <ScrollView
        className={`flex-1 bg-${theme}-background`}
        style={{ width: "100%", maxWidth: "100%" }}
        contentContainerStyle={{
          width: "100%",
          maxWidth: Math.min(layoutWidth, 560),
          alignSelf: "center",
          flexGrow: 1,
        }}
      >
        <View style={{ width: "100%", minWidth: 0 }}>
          <View className="flex-row px-3 pt-3 gap-3">
            <TouchableOpacity
              className={`flex-1 items-center justify-center h-10 rounded ${activeTab === "submit" ? `bg-${theme}-primary` : `bg-${theme}-cardBg1`
                }`}
              onPress={() => setActiveTab("submit")}
            >
              <Text
                className={`${activeTab === "submit"
                  ? `text-${theme}-btnText`
                  : `text-${theme}-primary`
                  }`}
                style={{ fontSize: rf(14) }}
              >
                {t("userFeedback.submitSuggestion")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 items-center justify-center h-10 rounded ${activeTab === "list" ? `bg-${theme}-primary` : `bg-${theme}-cardBg1`
                }`}
              onPress={() => setActiveTab("list")}
            >
              <Text
                className={`${activeTab === "list"
                  ? `text-${theme}-btnText`
                  : `text-${theme}-primary`
                  }`}
                style={{ fontSize: rf(14) }}
              >
                {t("userFeedback.mySuggestions")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === "submit" ? <FeedbackForm /> : <FeedbackList />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FeedbackScreen;
