import { View } from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
export function Skeleton({ width, height }: { width: number; height: number }) {
  const { theme } = useTheme(); //获取主题
  return (
    <View
      style={{
        width,
        height,
        backgroundColor: Colors[theme]?.blockBg1,
        overflow: "hidden",
        borderRadius: 6,
      }}
    ></View>
  );
}
