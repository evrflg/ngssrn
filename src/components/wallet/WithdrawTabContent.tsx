import React from "react";
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { rf } from "@/utils/scaleFont";

type WithdrawTabContentProps = {
  tab: TabShape;
  index: number;
  currentIndex: number;
  theme: string;
  style?: StyleProp<ViewStyle>;
};

type TabShape = {
  name?: string;
  icon?: any;
  badge?: string;
  payBadge?: string;
  tunnels?: Array<{ tunnelBadge?: string }>;
};

function getWithdrawTabBadge(tab: TabShape) {
  const tunnelBadge = tab?.tunnels?.find((t) => t?.tunnelBadge)?.tunnelBadge;
  return tunnelBadge || tab?.badge || tab?.payBadge || "";
}

export const WithdrawTabContent = React.memo(
  ({ tab, index, currentIndex, theme, style = {} }: WithdrawTabContentProps) => {
    const isActive = index === currentIndex;
    const badgeText = getWithdrawTabBadge(tab);
    const showIcon = tab.icon != null;

    const body = (
      <View style={[styles.inner, style]}>
        <View className="flex-row w-full gap-1 items-center justify-center" style={styles.mainRow}>
          {showIcon ? (
            <Image
              source={tab.icon}
              style={styles.icon}
              resizeMode="contain"
            />
          ) : null}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.name,
              {
                color: isActive
                  ? Colors[theme].btnText
                  : Colors[theme].textGray,
              },
            ]}
          >
            {tab.name ?? ""}
          </Text>
        </View>
      </View>
    );

    const card = (
      <LinearGradient
        colors={
          isActive
            ? [Colors[theme].tgBindGradientStart, Colors[theme].tgBindGradientEnd]
            : [Colors[theme].paymentTabGradientStart, Colors[theme].paymentTabGradientEnd]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.card, {backgroundColor: Colors[theme].btnText}]}
      >
        {body}
      </LinearGradient>
    );

    return (
      <View style={styles.cell}>
        {card}
        {!!badgeText && (
          <View style={styles.badge} pointerEvents="none">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.badgeText}
            >
              {badgeText}
            </Text>
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  cell: {
    width: "100%",
    position: "relative",
    overflow: "visible",
  },
  card: {
    height: 40,
    borderRadius: 6,
    justifyContent: "center",
    width: "100%",
  },
  inner: {
    position: "relative",
    paddingHorizontal: 6,
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  mainRow: {
    minWidth: 0,
  },
  name: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 70,
    marginRight: 2,
    fontSize: rf(12),
    lineHeight: rf(14),
    fontWeight: "500",
  },
  icon: {
    width: 22,
    height: 22,
    flexShrink: 0,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    zIndex: 2,
    elevation: 4,
    maxWidth: "85%",
    height: 14,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "#ff3333",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: rf(9),
    lineHeight: rf(10),
    fontWeight: "600",
  },
});
