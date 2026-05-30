import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { rf } from "@/utils/scaleFont";

export interface CategoryItem {
  label: string;
  value: string;
  icon: string;
  tag?: string;
}

interface MemberDayCategoryNavbarProps {
  value: string;
  categories: CategoryItem[];
  onValueChange: (value: string) => void;
}

export default function MemberDayCategoryNavbar({
  value,
  categories,
  onValueChange,
}: MemberDayCategoryNavbarProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      className="hide-scrollbar"
      contentContainerStyle={styles.scrollContent}
      style={[styles.container]}
    >
      {categories.map((category) => {
        const isActive = value === category.value;
        return (
          <Pressable
            className="flex-1"
            key={category.value}
            onPress={() => onValueChange(category.value)}
            style={styles.pressable}
          >
            <LinearGradient
              start={{ x: 0.2, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={
                isActive ? ["#eccd8d", "#dba662"] : ["#eed8a9", "#eed8a9"]
              }
              style={styles.categoryItem}
            >
              <Text
                style={[
                  styles.categoryLabel,
                  isActive && { color: Colors[theme].darkColor },
                ]}
              >
                {category.label}
              </Text>
            </LinearGradient>
            {category.tag ? (
              <View style={styles.categoryTag} pointerEvents="none">
                <Text style={styles.categoryTagText}>{category.tag}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginBottom: 0
  },
  scrollContent: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flex: 1,
    backgroundColor: "#c49c5e",
    overflow: "visible",
  },
  pressable: {
    overflow: "visible",
  },
  categoryItem: {
    minWidth: 70,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    borderLeftColor: "#dba662",
    borderLeftWidth: 1,
    justifyContent: "center",
    flex: 1
  },
  categoryTag: {
    position: "absolute",
    top: -10,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#f8cc64",
  },
  categoryTagText: {
    fontSize: rf(10),
    fontWeight: "bold",
    color: "#292c2b",
  },
  categoryItemActive: {
    backgroundColor: "#f8cc64",
    shadowColor: "#f8cc64",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryLabel: {
    fontSize: rf(12),
    color: "#8b6d45",
    textAlign: "center",
    fontWeight: 500,
  },
});
