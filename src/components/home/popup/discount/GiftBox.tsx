import { Image } from "expo-image";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

const waitAniUrlIos = require("@/assets/images/discount/box-wait-ios.png");
const openAniUrlIos = require("@/assets/images/discount/box-open-ios.png");
const waitAniUrlAndroid = require("@/assets/images/discount/box-wait-android.webp");
const openAniUrlAndroid = require("@/assets/images/discount/box-open-android.webp");

const waitAniUrl = Platform.OS === "ios" ? waitAniUrlIos : waitAniUrlAndroid;
const openAniUrl = Platform.OS === "ios" ? openAniUrlIos : openAniUrlAndroid;

interface GiftBoxProps {
  state: "wait" | "open";
}

export const GiftBox: React.FC<GiftBoxProps> = ({ state }) => {
  const isOpen = state === "open";
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.imageLayer} pointerEvents="none" collapsable={false}>
        {/* 需要用 expo-image 的图片组件，不然支持会有问题 */}
        <Image
          source={isOpen ? openAniUrl : waitAniUrl}
          style={[styles.boxImage, { transform: [{ scale: isOpen ? 1.5 : 1.6 }] }]}
          contentFit="contain"
        />
      </View>
    </View>
  );
};

const WAIT_WIDTH = 230;
const WAIT_HEIGHT = 230;
const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: WAIT_WIDTH,
    height: WAIT_HEIGHT,
  },
  imageLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  boxImage: {
    width: WAIT_WIDTH,
    height: WAIT_HEIGHT,
    resizeMode: "contain",
  },
});
