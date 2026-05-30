import SpecialBonusContent from "@/components/active/specialBonus/SpecialBonusContent";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { StyleSheet, View } from "react-native";

type Props = {
  id?: string;
};

const SpecialBonus = ({ id: idProp }: Props) => {
  const { theme } = useTheme();

  return (
    <View
      className={`flex-1 bg-${theme}-background`}
      style={[styles.content, { backgroundColor: Colors[theme].background }]}
    >
      <SpecialBonusContent idProp={idProp} />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {},
});

export default SpecialBonus;
