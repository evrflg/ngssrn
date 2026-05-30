import { Colors } from "@/constants/Colors";
import { StyleSheet, TextStyle } from "react-native";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { CheckBox } from "@rneui/base";
import { I18nText } from "@/components/I18nText";
import { StyleProp } from "react-native";

interface CheckIconProps {
  isChecked: boolean;
  onToggleChecked: () => void;
  i18nKey: string;
  textStyle?: StyleProp<TextStyle>
}

export function CheckIcon({ isChecked, onToggleChecked, i18nKey, textStyle }: CheckIconProps) {
  const { theme } = useTheme();
  return (
    <CheckBox
      checked={isChecked}
      onPress={onToggleChecked}
      iconType="material-community"
      checkedIcon="checkbox-outline"
      uncheckedIcon="checkbox-blank-outline"
      checkedColor={Colors[theme].primary}
      uncheckedColor={Colors[theme].primary}
      className="!m-0 !bg-transparent !p-0"
      containerStyle={styles.checkBoxContainer}
      wrapperStyle={styles.checkBoxWrapper}
      textStyle={[styles.checkBoxText, { color: Colors[theme].text }]}
      title={
        <I18nText
          i18nKey={i18nKey}
          className="ml-1 text-xs flex-1"
          style={[{ color: Colors[theme].text }, textStyle]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  checkBoxContainer: {
    margin: 0,
  },
  checkBoxWrapper: {
    margin: 0,
    padding: 0,
  },
  checkBoxText: {
    fontSize: 16,
    fontWeight: "normal",
    marginLeft: 8,
  },
});
