import { I18nText } from "@/components/I18nText";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTypeContentContext } from "./TypeContentContext";
import { useFooter } from "../hook/useFooter";
import { Publicity, PublicityType } from "@/types/publicity";
import { CheckIcon } from "@/components/common/BaseCheckbox";

interface FooterProps {
  theme: keyof typeof Colors;
  activePublicity: Publicity | null;
  style?: StyleProp<ViewStyle>;
}

export function Footer({ theme, activePublicity, style }: FooterProps) {
  const { publicityType, onRequestClose } = useTypeContentContext();
  const { gotoView, isDontPopupTodayChecked, onCheckPublicity, canShowDontPopupToday } = useFooter({
    activePublicity,
  });

  // 立即查看
  const handleViewPublicity = () => {
    // 跳转逻辑
    gotoView();
    // 关闭弹窗
    onRequestClose();
  };

  // 充值页不显示立即查看按钮
  const showViewButton = publicityType !== PublicityType.DEPOSIT_TUTORIAL;

  return (
    <View className="flex-row justify-between items-center w-full" style={style}>
      <View className="flex-1">
        {canShowDontPopupToday && (
          <CheckIcon
            isChecked={isDontPopupTodayChecked}
            onToggleChecked={onCheckPublicity}
            i18nKey="popup.dontPopToday"
          />
        )}
      </View>
      {showViewButton && (
        <Pressable onPress={handleViewPublicity}>
          <LinearGradient
            className="rounded-[6px] p-[6px]"
            colors={[Colors[theme].primary, Colors[theme].gradient]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.viewBtn}
          >
            <I18nText i18nKey="popup.viewNow" style={{ color: Colors[theme].btnText }} />
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewBtn: {
    padding: 6,
    borderRadius: 6,
  },
});
