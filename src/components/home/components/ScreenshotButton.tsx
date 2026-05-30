import ScreenshotIcon from "@/components/icons/home/ScreenshotIcon";
import ScreenshotPopup, {
  ScreenshotPopupHandle,
} from "@/components/home/components/popup/ScreenshotPopup";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { RootState } from "@/store/store";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  DeviceEventEmitter,
  Easing,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isWeb = Platform.OS === "web";

interface ScreenshotButtonProps {
  /** 在打开截图弹窗前调用（可选，例如埋点） */
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

/** 略大于按钮宽 + left，保证完全移出左侧可视区 */
const SCROLL_HIDE_OFFSET = 56;

const WRAPPER_BOTTOM_WEB = 174;

export default function ScreenshotButton({
  onPress,
  style,
}: ScreenshotButtonProps) {
  const { theme } = useTheme();
  const userInfo = useSelector((state: RootState) => state?.user?.userInfo);
  const insets = useSafeAreaInsets();
  const webSafeBottom = insets.bottom;
  const translateX = useRef(new Animated.Value(0)).current;
  const [scrollHiding, setScrollHiding] = useState(false);
  const screenshotPopupRef = useRef<ScreenshotPopupHandle>(null);

  useEffect(() => {
    if ( !userInfo?.isLogin) return;
    const sub = DeviceEventEmitter.addListener(
      "home-scroll-active",
      (payload: { active?: boolean }) => {
        const active = Boolean(payload?.active);
        setScrollHiding(active);
        Animated.timing(translateX, {
          toValue: active ? -SCROLL_HIDE_OFFSET : 0,
          duration: active ? 160 : 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      },
    );
    return () => sub.remove();
  }, [translateX, userInfo?.isLogin]);

  const handlePress = (event: GestureResponderEvent) => {
    onPress?.(event);
    void screenshotPopupRef.current?.captureScreenshot();
  };

  if (!userInfo?.isLogin) {
    return null;
  }

  return (
    <>
      <ScreenshotPopup ref={screenshotPopupRef} />
      <Animated.View
        style={[
          styles.wrapper,
          { bottom: WRAPPER_BOTTOM_WEB + webSafeBottom, transform: [{ translateX }] },
          scrollHiding && styles.wrapperHiddenPointer,
        ]}
      >
        <Pressable
          onPress={handlePress}
          style={[
            styles.button,
            style,
            { backgroundColor: Colors[theme].btnText },
          ]}
        >
          <ScreenshotIcon width={40} height={40} fill={Colors[theme].primary} />
        </Pressable>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 2,
    zIndex: 99,
  },
  /** 滑出时避免误触 */
  wrapperHiddenPointer: {
    pointerEvents: "none",
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
