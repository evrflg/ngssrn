import { Index } from "@/components/active/Index";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const isWeb = Platform.OS === "web";

export default function Active() {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      edges={isWeb ? { top: 'additive', bottom: 'off' } : ["top", "bottom"]}
      style={{ backgroundColor: Colors[theme].background }}
      className="flex-1"
    >
      <Index />
    </SafeAreaView>
  );
}
