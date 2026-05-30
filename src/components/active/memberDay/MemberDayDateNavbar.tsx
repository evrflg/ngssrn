import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import { rf } from "@/utils/scaleFont";

export interface DateItem {
  label: string;
  value: string;
  badge?: string;
}

interface MemberDayDateNavbarProps {
  value: string;
  dates: DateItem[];
  onValueChange: (value: string) => void;
}

export default function MemberDayDateNavbar({
  value,
  dates,
  onValueChange,
}: MemberDayDateNavbarProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      className="hide-scrollbar"
      contentContainerStyle={styles.scrollContent}
    >
      {dates.map((date) => {
        const isActive = value === date.value;
        return (
          <Pressable key={date.value} onPress={() => onValueChange(date.value)}>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[
                isActive ? "#DBA662" : "rgba(219, 166, 98, 0.25)",
                isActive ? "#ECCD8D" : "rgba(236, 205, 141, 0.25)",
              ]}
              style={[styles.dateItem, isActive && styles.dateItemActive]}
            >
              <Text
                style={[
                  styles.dateLabel,
                  isActive && styles.dateLabelActive,
                  {
                    color: isActive
                      ? Colors[theme].btnText
                      : Colors[theme].darkColor,
                  },
                ]}
              >
                {date.label}
              </Text>
            </LinearGradient>
            {date.badge && (
              <View style={styles.badge}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className={`text-${theme}-darkColor`}
                  style={styles.badgeText}
                >
                  {date.badge}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: "row",
    padding: 12,
    justifyContent: 'space-between',
    flex: 1,
    gap: 8
  },
  dateItem: {
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dateItemActive: {
    backgroundColor: "#f8cc64",
    shadowColor: "#f8cc64",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    borderBottomLeftRadius: 0,
  },
  dateLabel: {
    fontSize: rf(10),
    textAlign: 'center',
    minWidth: 60
  },
  dateLabelActive: {
    fontWeight: "bold",
  },
  badge: {
    position: "absolute",
    bottom: -10,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "rgba(219, 166, 98, 0.50)",
    borderRadius: 10,
    borderTopLeftRadius: 0,
  },
  badgeText: {
    fontSize: rf(8),
    flexShrink: 1,
  },
});
