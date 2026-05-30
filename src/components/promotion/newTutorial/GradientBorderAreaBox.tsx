import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function GradientBorderAreaBox({
  borderColor,
  fillColors,
  fillStart,
  fillEnd,
  fillLocations,
  fillBaseColor,
  borderRadius = 10,
  paddingV = 12,
  paddingH = 10,
  edgeThickness = 1,
  style,
  children,
}: {
  borderColor: string;
  fillColors: string[];
  fillStart?: { x: number; y: number };
  fillEnd?: { x: number; y: number };
  fillLocations?: number[];
  fillBaseColor?: string;
  borderRadius?: number;
  paddingV?: number;
  paddingH?: number;
  edgeThickness?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const t = "transparent";
  const fs = fillStart ?? { x: 0.5, y: 0 };
  const fe = fillEnd ?? { x: 0.5, y: 1 };
  const edge = edgeThickness;

  return (
    <View
      style={[
        styles.wrap,
        {
          borderRadius,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
        },
        style,
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { borderRadius, overflow: "hidden" },
        ]}
        pointerEvents="none"
      >
        {fillBaseColor ? (
          <View
            style={[StyleSheet.absoluteFillObject, { backgroundColor: fillBaseColor }]}
          />
        ) : null}
        <LinearGradient
          colors={fillColors as [string, string, ...string[]]}
          locations={
            fillLocations as [number, number, ...number[]] | undefined
          }
          start={fs}
          end={fe}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <LinearGradient
        colors={[t, borderColor, t]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[
          styles.edgeH,
          {
            top: 0,
            height: edge,
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
          },
        ]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[t, borderColor, t]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[
          styles.edgeH,
          {
            bottom: 0,
            height: edge,
            borderBottomLeftRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
          },
        ]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[t, borderColor, t]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.edgeV,
          {
            left: 0,
            width: edge,
            borderTopLeftRadius: borderRadius,
            borderBottomLeftRadius: borderRadius,
          },
        ]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[t, borderColor, t]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.edgeV,
          {
            right: 0,
            width: edge,
            borderTopRightRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
          },
        ]}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    overflow: "visible",
    width: "100%",
    alignSelf: "stretch",
    // maxWidth: 340,
  },
  edgeH: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1,
  },
  edgeV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  content: {
    position: "relative",
    zIndex: 2,
  },
});
