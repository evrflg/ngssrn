import MemberDayContent from "@/components/active/memberDay";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { StyleSheet, View } from "react-native";

const MemberDay = ({ id: idProp }: { id?: string }) => {
  const { theme } = useTheme();

  return (
    <View
      className={`flex-1 bg-${theme}-background`}
      style={[styles.content, { backgroundColor: Colors[theme].background }]}
    >
      <MemberDayContent />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {},
});

export default MemberDay;
