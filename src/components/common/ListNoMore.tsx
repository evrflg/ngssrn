import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface Props {
  text?: string;
  style?: ViewStyle;
}

/** 列表底部「没有更多」，用法与 NoData 类似：由父级决定何时作为 ListFooterComponent 传入 */
const ListNoMore: FC<Props> = ({ text, style }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.footer, style]}>
      <Text style={[styles.text, { color: Colors[theme].lightText }]}>
        {text ?? t("common.noMore")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: rf(12),
  },
});

export default ListNoMore;
