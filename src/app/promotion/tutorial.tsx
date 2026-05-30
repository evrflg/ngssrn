/**
 * 旧版推广教程（代理类型图解 + 长文说明）。
 * 新版页面：`newPromotionTutorial.tsx`（对齐 vue NewPromotionTutorial.vue）。
 */
import {
  Text,
  View,
  Platform,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { FC, ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { I18nText } from "@/components/I18nText";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { HideScreenHeader } from "@/components/common/Header";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { getScrollBottomSpacer } from "@/config/layout/scrollBottomSpacer";
import { selectBottomNavigationType } from "@/store/user/selfConfig";
import { useBottomNavigation } from "@/hooks/useBottomNavigation";
import AgentType1Chart from "@/components/promotion/AgentType1Chart";
import AgentType23Chart from "@/components/promotion/AgentType23Chart";
import WebView from "react-native-webview";
import TopLeftBadge from "@/components/promotion/TopLeftBadge";

const getResponsivePadding = (width: number) =>
  Math.max(12, Math.min(24, width * 0.05));
const getResponsiveGap = (width: number) =>
  Math.max(8, Math.min(16, width * 0.04));
const getResponsiveMinHeight = (height: number) =>
  Math.max(120, Math.min(200, height * 0.2));

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 16 },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -18,
    marginTop: -18,
    zIndex: 10,
  },
  orderItem: { marginBottom: 4 },
});

interface Data {
  agentTypeConfig: undefined | string;
  description?: string;
}
interface OrderListItemProps {
  strongTextKey?: string;
  descriptionKey?: string;
  className?: string;
  style?: ViewStyle;
}

export default function Tutorial() {
  const {
    theme,
    themeColors: { primary },
  } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const padding = getResponsivePadding(screenWidth);
  const gap = getResponsiveGap(screenWidth);
  const minDescHeight = getResponsiveMinHeight(screenHeight);

  const isLoading = false;
  const data = {
    agentTypeConfig: "",
    description: "",
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
      className={`w-full flex-1 bg-${theme}-background`}
    >
      <HideScreenHeader title="promotion.tutorial" />
      <ScrollView
        className={`flex-1 bg-${theme}-background`}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ActivityIndicator
          color={primary}
          size="large"
          style={styles.loader}
          className={!isLoading ? "opacity-0" : ""}
        />
        <View
          style={{ padding, gap }}
          className={`${isLoading ? "opacity-0" : ""}`}
        >
          {getAgentTypeChart(data.agentTypeConfig)}
          <View
            style={{ minHeight: minDescHeight, padding }}
            className={`rounded-lg border border-${theme}-primary bg-${theme}-btnText`}
          >
            <TopLeftBadge />
            {isLoading ? null : data.description ? (
              <DescriptionRenderer html={data.description} />
            ) : (
              <>
                <I18nText
                  i18nKey="promotion.tutorials.forExample"
                  className={`text-xs leading-4 text-justify text-${theme}-textGray`}
                />
                <OrderListItem
                  strongTextKey="promotion.tutorials.B1Commission"
                  descriptionKey="promotion.tutorials.B1CommissionDesc"
                />
                <OrderListItem
                  strongTextKey="promotion.tutorials.B2Commission"
                  descriptionKey="promotion.tutorials.B2CommissionDesc"
                />
                <OrderListItem
                  strongTextKey="promotion.tutorials.B3Commission"
                  descriptionKey="promotion.tutorials.B3CommissionDesc"
                />
                <OrderListItem strongTextKey="promotion.tutorials.ACommissionIntro" />
                <OrderListItem
                  strongTextKey="promotion.tutorials.ADirectCommission"
                  descriptionKey="promotion.tutorials.ADirectCommissionDesc"
                  style={{ marginLeft: padding }}
                />
                <OrderListItem
                  strongTextKey="promotion.tutorials.AOtherCommission"
                  descriptionKey="promotion.tutorials.AOtherCommissionDesc"
                  style={{ marginLeft: padding }}
                />
                <OrderListItem
                  strongTextKey="promotion.tutorials.ATotalCommission"
                  descriptionKey="promotion.tutorials.ATotalCommissionDesc"
                  style={{ marginLeft: padding }}
                />
                <OrderListItem strongTextKey="promotion.tutorials.summary" />
                <OrderListItem
                  strongTextKey="promotion.tutorials.directTeam"
                  descriptionKey="promotion.tutorials.directTeamDesc"
                  style={{ marginLeft: padding }}
                />
                <OrderListItem
                  strongTextKey="promotion.tutorials.otherTeam"
                  descriptionKey="promotion.tutorials.otherTeamDesc"
                  style={{ marginLeft: padding }}
                />
                <OrderListItem
                  strongTextKey="promotion.tutorials.ADescription"
                  descriptionKey="promotion.tutorials.ADescriptionDesc"
                  style={{ marginLeft: padding }}
                />
                <OrderListItem
                  strongTextKey="promotion.tutorials.B1Description"
                  descriptionKey="promotion.tutorials.B1DescriptionDesc"
                  style={{ marginLeft: padding }}
                />
                <OrderListItem
                  strongTextKey="promotion.tutorials.B2Description"
                  descriptionKey="promotion.tutorials.B2DescriptionDesc"
                  style={{ marginLeft: padding }}
                />
                <OrderListItem
                  strongTextKey="promotion.tutorials.B3Description"
                  descriptionKey="promotion.tutorials.B3DescriptionDesc"
                  style={{ marginLeft: padding }}
                />
                <OrderListItem
                  strongTextKey="promotion.tutorials.ruleSummary"
                  descriptionKey="promotion.tutorials.ruleSummaryDesc"
                  style={{ marginLeft: padding }}
                />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const OrderListItem: FC<OrderListItemProps> = ({
  strongTextKey,
  descriptionKey,
  className = "",
  style,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[styles.orderItem, style]}
      className={"inline leading-4 " + className}
    >
      {strongTextKey && (
        <Text className={`text-xs font-extrabold text-${theme}-textGray`}>
          {t(strongTextKey)}
        </Text>
      )}
      {descriptionKey && (
        <Text className={`text-xs text-${theme}-textGray`}>
          {t(descriptionKey)}
        </Text>
      )}
    </View>
  );
};

/* 后台返回的 content 数组的第一个元素对象的 content 属性有以下情况:
  模式 1: undefined 或者 agentType=1
  模式 2: agentType=2
  模式 3: agentType=3
  4: 后台配置图片和文本
*/
function getAgentTypeChart(entry: Data["agentTypeConfig"]): ReactNode {
  if (!entry || entry.includes("agentType=1")) {
    return <AgentType1Chart />;
  } else if (entry.includes("agentType=2")) {
    return <AgentType23Chart type="2" />;
  } else if (entry.includes("agentType=3")) {
    return <AgentType23Chart type="3" />;
  }
  return <WebView source={{ html: entry }} />;
}

const DescriptionRenderer = ({ html }: { html: string }) => {
  if (Platform.OS === "web") {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }
  return <WebView source={{ html }} style={{ flex: 1 }} />;
};
