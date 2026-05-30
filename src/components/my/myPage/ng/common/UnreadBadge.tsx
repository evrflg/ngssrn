import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export type UnreadBadgeLayout = "default" | "myCenterType2" | "myCenterType3";

type UnreadBadgeProps = {
  count: number;
};

/**
 * 个人中心宫格菜单图标右上角小角标（type2 / type3 等）
 * 父级需 `position: 'relative'`（如 iconWrapper）
 */
export function UnreadBadge({ count }: UnreadBadgeProps) {
  const myCenterVersion: number = useSelector(
    (state: RootState) => state?.selfConfig?.myCenter ?? 1,
  );
  if (count <= 0) return null;
  const layout = myCenterVersion === 3 ? "myCenterType3" : "myCenterType2";

  const display =
    layout === "myCenterType2" || layout === "myCenterType3"
      ? count > 99
        ? "99"
        : String(count)
      : count > 99
        ? "99+"
        : count;
  if (layout === "myCenterType3") {
    return (
      <LinearGradient
        colors={["#ff6754", "#ce1c06"]}
        start={{ x: 0.35, y: 0.3 }}
        end={{ x: 1, y: 1 }}
        style={styles.badgeType3}
      >
        <Text style={styles.badgeTextType3}>{display}</Text>
      </LinearGradient>
    );
  }
  return (
    <View style={layout === "myCenterType2" ? styles.badgeType2 : styles.badge}>
      <Text style={layout === "myCenterType2" ? styles.badgeTextType2 : styles.badgeText}>
        {display}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff7172",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  badgeType2: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 999,
    backgroundColor: "#ce1c06",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeTextType2: {
    color: "#fff",
    fontSize: 10.5,
    textAlign: "center",
    includeFontPadding: false,
    fontWeight: "600",
  },
  /** Web profile/type3 footer：角標掛在圓形圖示區外側 */
  badgeType3: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeTextType3: {
    color: "#fff",
    fontSize: 10.5,
    textAlign: "center",
    includeFontPadding: false,
    fontWeight: "600",
  },
});
