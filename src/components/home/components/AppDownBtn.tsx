import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useEffect, useRef, useState } from "react";
import { requestShowDownloadGuideNow } from "../popup/downloadGuide/hook/requestDownloadGuideOnHome";
import {
  Animated,
  DeviceEventEmitter,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FLOAT_HEIGHT = 40;
const FLOAT_WIDTH = 40;

const SCROLL_HIDE_OFFSET = 56;

const HOST_BOTTOM_WEB = 120;

const AppDownBtn = () => {
  const primaryColor = useThemeColor({}, "primary");
  const cardBg1 = useThemeColor({}, "cardBg1");
  const insets = useSafeAreaInsets();
  const webSafeBottom = Platform.OS === "web" ? insets.bottom : 0;
  const translateX = useRef(new Animated.Value(0)).current;
  const [scrollHiding, setScrollHiding] = useState(false);

  const handleAppDownloadPress = () => {
    requestShowDownloadGuideNow();
  };

  const setScrollHidden = (hidden: boolean) => {
    setScrollHiding(hidden);
    translateX.stopAnimation();
    Animated.timing(translateX, {
      toValue: hidden ? -SCROLL_HIDE_OFFSET : 0,
      duration: hidden ? 160 : 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const subActive = DeviceEventEmitter.addListener(
      "home-scroll-active",
      (payload: { active?: boolean }) => {
        const active = Boolean(payload?.active);
        setScrollHidden(active);
      },
    );
    return () => subActive.remove();
  }, [translateX]);

  return (
    <Animated.View
      style={[
        styles.host,
        { bottom: HOST_BOTTOM_WEB + webSafeBottom, transform: [{ translateX }] },
      ]}
      pointerEvents={
        scrollHiding
          ? "none"
          : Platform.OS === "web"
            ? "auto"
            : "box-none"
      }
    >
      <Pressable onPress={handleAppDownloadPress} hitSlop={8}>
        <View
          style={[
            styles.container,
            { backgroundColor: cardBg1, borderColor: primaryColor },
          ]}
        >
          <View style={styles.content}>
            <MaterialIcons name="download" size={18} color={primaryColor} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default AppDownBtn;

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 2,
    zIndex: 999,
    elevation: 999,
  },
  container: {
    width: FLOAT_WIDTH,
    height: FLOAT_HEIGHT,
    borderRadius: FLOAT_HEIGHT / 2,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    flexDirection: "row",
    paddingLeft: 8,
    paddingRight: 6,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
});
