import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useEffect, useMemo, useRef, useState } from "react";
import Svg, { Path } from "react-native-svg";
import {
  Animated,
  DeviceEventEmitter,
  Dimensions,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { usePathname } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import ScreenshotPopup, { ScreenshotPopupHandle } from "./popup/ScreenshotPopup";
const COLLAPSED_WIDTH = 0;
/** 已登录：刷新 + 截图 两格 */
const EXPANDED_WIDTH_WITH_SHOT = 76;
/** 未登录：仅刷新；≈ 单圈 + 左右 padding + 右侧箭头位（比双圈少一截） */
const EXPANDED_WIDTH_REFRESH_ONLY = 72;
const FLOAT_HEIGHT = 52;
/** 收起后仅露把手：略宽一点，避免看起来像没出来 */
const PEEK_HANDLE_WIDTH = 34;

function clampBarTop(y: number) {
  const h = Dimensions.get("window").height;
  const maxY = Math.max(0, h - FLOAT_HEIGHT);
  return Math.max(0, Math.min(y, maxY));
}

function initialBarTop() {
  const h = Dimensions.get("window").height;
  return clampBarTop(h * 0.45 - FLOAT_HEIGHT / 2);
}

const NOT_SHOW_ACTION_PATHS = ["/login", "/register", "/face"];

function normalizePathname(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

const RefreshButton = () => {
  const primaryColor = useThemeColor({}, "primary");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showPeekHandle, setShowPeekHandle] = useState(true);
  const [posY, setPosY] = useState(initialBarTop);
  const progress:any = useRef(new Animated.Value(1)).current; // 0: 展开, 1: 收起
  const peekProgress = useRef(new Animated.Value(1)).current; // 0: 无把手, 1: 显示把手
  const showPeekHandleRef = useRef(showPeekHandle);
  const collapsingAnimRef = useRef(false);
  const restoreCollapsedRef = useRef(isCollapsed);
  const restorePeekRef = useRef(showPeekHandle);
  const posYRef = useRef(posY);
  const dragStartPosYRef = useRef(0);
  const hasMovedRef = useRef(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  const screenshotPopupRef = useRef<ScreenshotPopupHandle>(null);
  const screenshotPressInFlightRef = useRef(false);
  const isLogin = useSelector(
    (s: RootState) => Boolean(s?.user?.userInfo?.isLogin),
  );
  const expandedBaseWidth = isLogin
    ? EXPANDED_WIDTH_WITH_SHOT
    : EXPANDED_WIDTH_REFRESH_ONLY;

  const showBar = useMemo(
    () =>
      !NOT_SHOW_ACTION_PATHS.includes(normalizePathname(pathname ?? "")),
    [pathname],
  );

  useEffect(() => {
    posYRef.current = posY;
  }, [posY]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("app-active", () => {
      // 防止后台回来时残留的“拖动中”状态导致点击被 hasMovedRef 拦截
      hasMovedRef.current = false;
      collapsingAnimRef.current = false;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      const maxY = Math.max(0, window.height - FLOAT_HEIGHT);
      setPosY((prev) => Math.max(0, Math.min(prev, maxY)));
    });
    return () => sub.remove();
  }, []);

  const animatePeekHandle = (toValue: 0 | 1, onEnd?: () => void) => {
    // 防止滚动开始/结束频繁切换导致 timing 被打断，最终停在 0（把手永远不出来）
    peekProgress.stopAnimation();
    Animated.timing(peekProgress, {
      toValue,
      duration: 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width-related animation
    }).start(({ finished }) => {
      if (finished && onEnd) {
        onEnd();
      }
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gs) =>
          Math.abs(gs.dy) > 5 && Math.abs(gs.dy) > Math.abs(gs.dx) * 0.65,
        onPanResponderGrant: () => {
          hasMovedRef.current = false;
          dragStartPosYRef.current = posYRef.current;
        },
        onPanResponderMove: (_, gs) => {
          if (Math.abs(gs.dy) > 3) {
            hasMovedRef.current = true;
          }
          setPosY(clampBarTop(dragStartPosYRef.current + gs.dy));
        },
        onPanResponderRelease: () => {},
        onPanResponderTerminate: () => {},
      }),
    [],
  );

  const handleArrowPress = () => {
    if (hasMovedRef.current) {
      return;
    }
    if (collapsingAnimRef.current) {
      return;
    }
    setIsCollapsed((prev) => {
      const next = !prev;
      // 手动点击收起时，保留一小段可见把手用于再次点击展开
      setShowPeekHandle(next);
      animatePeekHandle(next ? 1 : 0);
      return next;
    });
  };


  useEffect(() => {
    showPeekHandleRef.current = showPeekHandle;
  }, [showPeekHandle]);

  // 与 EntryBar 同源：统一使用 home-scroll-active 做滚动联动（滚动时收起，结束后恢复滚动前状态）
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      "home-scroll-active",
      (payload: { active?: boolean }) => {
        const active = Boolean(payload?.active);
        if (active) {
          restoreCollapsedRef.current = isCollapsed;
          restorePeekRef.current = showPeekHandleRef.current;
          setIsCollapsed(true);
          setShowPeekHandle(true);
          animatePeekHandle(0);
          return;
        }

        // active = false
        const restoreCollapsed = restoreCollapsedRef.current;
        const restorePeek = restorePeekRef.current;
        setIsCollapsed(restoreCollapsed);
        setShowPeekHandle(restorePeek);
        if (restorePeek) {
          // 让把手回到可见，避免停在 0 看起来“没出来”
          peekProgress.stopAnimation(() => {
            peekProgress.setValue(0);
            requestAnimationFrame(() => animatePeekHandle(1));
          });
        }
      },
    );
    return () => sub.remove();
  }, [isCollapsed, animatePeekHandle, peekProgress]);

  useEffect(() => {
    // 连续快速点击时，先停止上一次 width 动画，避免卡在中间态
    progress.stopAnimation();
    collapsingAnimRef.current = true;
    Animated.timing(progress, {
      toValue: isCollapsed ? 1 : 0,
      duration: isCollapsed ? 160 : 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width animation
    }).start(() => {
      collapsingAnimRef.current = false;
    });
  }, [isCollapsed, progress]);

  const baseAnimatedWidth = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [expandedBaseWidth, COLLAPSED_WIDTH],
      }),
    [progress, expandedBaseWidth],
  );
  const peekAnimatedWidth = peekProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, PEEK_HANDLE_WIDTH],
  });
  const animatedWidth = Animated.add(baseAnimatedWidth, peekAnimatedWidth);
  const contentOpacity = progress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [1, 0.2, 0],
  });
  const containerPaddingLeft = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0],
  });
  const containerPaddingRight = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });
  const labelOffsetX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });
  const arrowOpacity = progress.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 0.2, 0],
  });
  const arrowScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  if (!showBar) {
    return null;
  }


  const handlePress = () => {
    // 仅展开条时允许截图（收起/仅露把手时点击不生效）
    if (isCollapsed) return;
    // 防止用户连续点多次导致并发截图
    if (screenshotPressInFlightRef.current) return;
    if (screenshotPopupRef.current?.isCapturing) return;

    screenshotPressInFlightRef.current = true;
    const run = async () => {
      // ref 可能在极端渲染时序下为空，用事件兜底
      if (screenshotPopupRef.current?.captureScreenshot) {
        await screenshotPopupRef.current.captureScreenshot();
        return;
      }
      DeviceEventEmitter.emit("global-capture-screenshot");
    };
    void run().finally(() => {
      screenshotPressInFlightRef.current = false;
    });
  };

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: posY }]}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.container,
          {
            width: animatedWidth,
            paddingLeft: containerPaddingLeft,
            paddingRight: containerPaddingRight,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,
              transform: [{ translateX: labelOffsetX }],
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: isLogin ? "space-between" : "flex-start",
            }}
          >
            {isLogin ? (
              <Pressable
                disabled={isCollapsed}
                onPress={() => {
                  handlePress();
                }}
              >
                <View
                  style={[
                    styles.refreshCircle,
                    {
                      backgroundColor: Colors[theme].btnText,
                      borderWidth: 1,
                      borderColor: primaryColor,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="screenshot"
                    size={24}
                    color={primaryColor}
                  />
                </View>
              </Pressable>
            ) : null}
          </View>
          
        </Animated.View>
        <Animated.View
          style={[
            styles.dot,
            showPeekHandle
              ? null
              : { opacity: arrowOpacity, transform: [{ scale: arrowScale }] },
          ]}
        >
          <Pressable
            onPressIn={() => {
              hasMovedRef.current = false;
            }}
            onPress={handleArrowPress}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <View
              style={[
                styles.arrowIconWrap,
                { transform: [{ rotate: showPeekHandle ? "0deg" : "180deg" }] ,
                marginLeft: showPeekHandle ? -18 : 0},
              ]}
            >
              <Svg width={17} height={17} viewBox="0 0 29 30" fill="none">
                <Path fill="#fff" d="M25 15.254 4 30l8-14.746L4 0z" />
              </Svg>
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>
      {isLogin ? <ScreenshotPopup ref={screenshotPopupRef} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 0,
    zIndex: 1000,
    elevation: 1000,
    ...(Platform.OS === "web"
      ? ({
          pointerEvents: "auto",
          userSelect: "none",
          touchAction: "none",
        } as any)
      : null),
  },
  container: {
    height: FLOAT_HEIGHT,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderColor: "#D4AF37",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    flexShrink: 1,
    paddingHorizontal:5,
  },
  refreshCircle: {
    width: 36,
    height: 36,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  subTitle: {
    color: "#E5E7EB",
    fontSize: 10,
    marginTop: 2,
  },
  dot: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowIconWrap: {
    width: 17,
    height: 17,
    color: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 3,
  },
});

export default RefreshButton;
