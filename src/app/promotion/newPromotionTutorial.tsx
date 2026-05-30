import { ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { HideScreenHeader } from "@/components/common/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { NewPromotionTutorialContent } from "@/components/promotion/newTutorial/NewPromotionTutorialContent";

export default function NewPromotionTutorialScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={styles.safe} className={`flex-1 bg-${theme}-background`}>
      <HideScreenHeader title="promotion.promotionTutorial" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        className={`bg-${theme}-background`}
      >
        <NewPromotionTutorialContent />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 24 },
});
