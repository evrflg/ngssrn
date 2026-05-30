import { Colors } from "@/constants/Colors";
import { Octicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePagination } from "../../hook/usePagination";

interface PaginationProps {
  activePublicityId?: string;
  onPaginate: (index: number) => void;
  theme: keyof typeof Colors;
}

export function Pagination({
  activePublicityId,
  onPaginate,
  theme,
}: PaginationProps) {
  const { currentIndex, publicitiesLength } = usePagination({ activePublicityId });

  if (publicitiesLength <= 1) return null;

  return (
    <View className="my-3 flex-row justify-center items-center gap-2">
      <Pressable
        disabled={currentIndex === 0}
        onPress={() => onPaginate(currentIndex - 1)}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          colors={
            currentIndex === 0
              ? ["#a7a7a7", "#a7a7a7"]
              : [Colors[theme].primary, Colors[theme].themeColor1]
          }
          style={styles.navigationButton}
        >
          <Octicons name="chevron-left" size={14} color={"white"} />
        </LinearGradient>
      </Pressable>
      <Text style={{ color: Colors[theme].darkColor }}>
        {`${currentIndex + 1} / ${publicitiesLength}`}
      </Text>
      <Pressable
        disabled={currentIndex === publicitiesLength - 1}
        onPress={() => onPaginate(currentIndex + 1)}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          colors={
            currentIndex === publicitiesLength - 1
              ? ["#a7a7a7", "#a7a7a7"]
              : [Colors[theme].primary, Colors[theme].themeColor1]
          }
          style={styles.navigationButton}
        >
          <Octicons name="chevron-right" size={14} color={"white"} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationButton: {
    borderRadius: 99,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
