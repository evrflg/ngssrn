import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { StyleSheet, View } from "react-native";

export default function () {
  const { theme } = useTheme();
  return (
    <View
      className="absolute rounded-tl-lg"
      style={[
        styles.topLeftBadge,
        {
          borderColor: Colors[theme].secondary,
        },
      ]}
    >
      <View className="relative">
        <View
          style={[styles.dot1, { backgroundColor: Colors[theme].secondary }]}
        />
        <View
          style={[
            styles.dot1,
            styles.dot2,
            { backgroundColor: Colors[theme].secondary },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topLeftBadge: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    width: 25,
    height: 25,
  },
  dot1: {
    position: "absolute",
    top: 10,
    left: 1,
    width: 5,
    height: 5,
    borderRadius: 5,
  },
  dot2: {
    top: 15,
    left: 10,
  },
});
