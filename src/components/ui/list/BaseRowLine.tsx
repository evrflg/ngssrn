import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";

interface BaseRowLineItem {
  icon: React.ReactNode;
  label: string;
  value?: string;
}

export interface BaseRowLineProps {
  item: BaseRowLineItem;
  handlePress: (item: BaseRowLineItem) => void;
}

export default function BaseRowLine({ item, handlePress }: BaseRowLineProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity style={styles.menuItem} onPress={() => handlePress(item)} activeOpacity={0.7}>
      <View style={styles.iconWrapper}>{item.icon}</View>
      <Text style={[styles.label, { color: Colors[theme].text, fontSize: rf(12) }]}>
        {item.label}
      </Text>
      {item.value ? (
        <Text style={[styles.text, { color: Colors[theme].textSecondary, fontSize: rf(12) }]}>
          {item.value}
        </Text>
      ) : null}
      <Ionicons name="chevron-forward" size={16} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  iconWrapper: {
    width: 25,
    height: 25,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    flex: 1,
    fontSize: 12,
    color: "#333",
    writingDirection: "ltr",
  },
  text: {
    fontSize: 12,
    color: "#999",
    marginRight: 8,
  },
});
