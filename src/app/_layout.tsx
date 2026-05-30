import BottomNavigation from "@/components/BottomNavigation";
import { ToastProvider } from "@/components/common/toast";
import PaperTheme from "@/constants/paper";
import { AuthProvider } from "@/hooks/AuthProvider";
import { CommonProvider } from "@/hooks/CommonProvider";
import { ThemeProvider, useTheme } from "@/hooks/theme/ThemeProvider";
import { RootState, store } from "@/store/store";
// import "@/wdyr";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  AppState,
  DeviceEventEmitter,
  InteractionManager,
  Platform,
  View,
  StatusBar as RNStatusBar,
} from "react-native";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { Provider, useSelector } from "react-redux";
import {
  updateAppleTouchIcon,
  updateFavicon,
  updateIOSAppTitle,
} from "@/utils/webInfo";
import { SiteStatisticSync } from "@/components/common/siteStatistic/SiteStatisticSync";
import { resolveSafeAreaExtensionBg } from "@/utils/resolveSafeAreaExtensionBg";
import i18next, { i18nReady } from "../lang/i18n";
import "./globals.css";

// import adjustService, { ADJUST_EVENTS } from "@/services/adjust";

const isWeb = Platform.OS === "web";

/** iOS 上的浏览器（Safari、Chrome、Firefox 等），不是 RN 原生 iOS App */
function isIOSWebBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iP(hone|ad|od)/i.test(ua)) return true;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    return true;
  return false;
}
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// iOS 首次启动时最容易出现“启动页抖动/缩放感”，把退出动画关掉并尽早设置（不要等到首屏 effect）
if (Platform.OS === "ios") {
  SplashScreen.setOptions({ duration: 0, fade: false });
}

import { registerServiceWorker } from "@/hooks/home/usePWAInstall";
import { IOSPWAVisualViewportStabilizer } from "@/hooks/useIOSPWAVisualViewportStabilizer";
import * as Sentry from "sentry-expo";
import {
  ActivityPushPopup,
  ActivityPushPopupHandle,
} from "@/components/home/components/popup/ActivityPushPopup";
import { useSSE } from "@/components/common/sse/useSSE";
import { MAX_WIDTH, useMaxWidth } from "@/hooks/useMaxWidth";
import { NotificationPopup } from "@/components/common/NotificationPopup";
import { TestSiteDevFloatingPanel } from "@/components/common/dev/TestSiteDevFloatingPanel";
import { BigWinningDialog } from "@/components/home/popup/bigWinning/BigWinningDialog";
import MysteriousMine from "@/components/mysteriousMineBg/MysteriousMine";
import RefreshButton from "@/components/home/components/RefreshButton";

// 未配置 DSN 时不要调用 init，否则会一直打 “No DSN provided” 警告
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? "";
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    enableInExpoDevelopment: true,
    debug: __DEV__,
  });
}

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// 创建 AppContent 组件
function AppContent() {
  const activityPushPopupRef = React.useRef<ActivityPushPopupHandle>(null);

  // 监听游戏状态——游戏展示时禁用弹窗（对应 Vue 端 PlayFrame 逻辑）
  const isShowGameModel = useSelector(
    (state: RootState) => state?.game?.isShowGameModel,
  );
  const canShowCServiceAndActivityPopup = !isShowGameModel;

  const { handleActivityPushClose, sseWebView } = useSSE(
    canShowCServiceAndActivityPopup,
    activityPushPopupRef,
  );

  // 非首屏弹窗延迟挂载：等首帧交互完成后再渲染，减少启动卡顿
  const [deferredReady, setDeferredReady] = useState(false);
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setDeferredReady(true);
    });
    return () => handle.cancel();
  }, []);

  return (
    <>
      {sseWebView}
      <Stack
        screenOptions={{
          gestureEnabled: true,
          headerShown: false,
          contentStyle: undefined,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <ActivityPushPopup
        ref={activityPushPopupRef}
        onClose={handleActivityPushClose}
      />
      {deferredReady && (
        <>
          <MysteriousMine canMove={false} />
          <BigWinningDialog />
          <NotificationPopup />
        </>
      )}
    </>
  );
}

export default function RootLayout() {
  // const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [i18nGate, setI18nGate] = useState(() => i18next.isInitialized);

  useEffect(() => {
    // 已在模块初始化时针对 iOS 设置；这里保留空 effect 防止未来误删时缺少 hook 入口
  }, []);

  useEffect(() => {
    if (i18next.isInitialized) {
      setI18nGate(true);
      return;
    }
    void i18nReady
      .then(() => setI18nGate(true))
      .catch((err) => {
        console.error("i18n init failed:", err);
        setI18nGate(true);
      });
  }, []);

  useEffect(() => {
    // 全局入口统一处理 Web SW 注册
    if (Platform.OS === "web") {
      registerServiceWorker();
    }
  }, []);

  const { width, maxWidth } = useMaxWidth();
  useEffect(() => {
    // 启动屏在 CommonProvider 内：等首屏关键数据就绪后再 hide，避免露出「半加载」过程
    if (isWeb && width > MAX_WIDTH) {
      document
        .getElementsByTagName("html")[0]
        ?.setAttribute("style", `width:${maxWidth}px;margin:0 auto;`);
    }
    if (!loaded || !isWeb) return;
    if (isWeb) {
      return forceViewportAndDisableZoom();
    }
    return;
  }, [loaded, width, maxWidth]);

  if (!loaded || !i18nGate) {
    return null;
  }

  return (
    <Providers>
      <ThemedAppShell />
    </Providers>
  );
}

/** 强制设置 viewport 并禁用缩放（纯工具函数，非 Hook，已从组件内部提取到模块级别） */
function forceViewportAndDisableZoom() {
  if (typeof document === "undefined") return;

  // 1) viewport：iOS 浏览器加 interactive-widget=overlays-content，键盘尽量叠在页面上方、少改布局视口（减少滚动条乱跳）
  const iosBrowser = isIOSWebBrowser();
  const content = iosBrowser
    ? "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=overlays-content"
    : "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
  let meta = document.querySelector(
    'meta[name="viewport"]',
  ) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "viewport";
    document.head.appendChild(meta);
  }
  meta.content = content;

  // 2) 阻止 Ctrl+滚轮、双指缩放、iOS gesture
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey) e.preventDefault();
  };
  const onTouchStart = (e: TouchEvent) => {
    if (e.touches && e.touches.length > 1) e.preventDefault();
  };
  // iOS Safari：gesturestart 可以阻止捏合放大
  const onGestureStart = (e: Event) => {
    e.preventDefault();
  };

  document.addEventListener("wheel", onWheel, { passive: false });
  document.addEventListener("touchstart", onTouchStart, { passive: false });
  // gesturestart 在某些浏览器上存在（主要 iOS）
  document.addEventListener("gesturestart", onGestureStart as EventListener);

  return () => {
    document.removeEventListener("wheel", onWheel);
    document.removeEventListener("touchstart", onTouchStart);
    document.removeEventListener(
      "gesturestart",
      onGestureStart as EventListener,
    );
  };
}

/** 全局 Provider 树（提取到模块级别，避免 RootLayout 重渲染时整棵树被卸载/重建） */
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics ?? undefined}>
        <ThemeProvider>
          <IOSPWAVisualViewportStabilizer />
          <WebSiteInfoSync />
          <SiteStatisticSync />
          {isWeb && <WebThemeColorSync />}
          <PaperThemeProvider>
            <AuthProvider>
              <CommonProvider>
                <ToastProvider>
                  <View style={{ flex: 1 }} pointerEvents="box-none">
                    {children}
                    <TestSiteDevFloatingPanel />
                  </View>
                </ToastProvider>
              </CommonProvider>
            </AuthProvider>
          </PaperThemeProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

function ThemedAppShell() {
  const { theme } = useTheme();
  const isShowGameModel = useSelector(
    (state: RootState) => state?.game?.isShowGameModel,
  );
  const isLogin = useSelector(
    (state: RootState) => Boolean(state?.user?.userInfo?.isLogin),
  );
  const shellBackgroundColor = resolveSafeAreaExtensionBg(theme);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next !== "active") return;
      // 后台久了回来：部分组件会因为“滚动中/拖动中”残留状态导致 Pressable 失效，这里统一做一次软复位。
      DeviceEventEmitter.emit("app-active");
      DeviceEventEmitter.emit("home-scroll-active", { active: false });
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (Platform.OS === "ios") {
      // 设置状态栏颜色与主题相反颜色，处理不清晰问题
      if (theme === 'greenBlack') {
        RNStatusBar.setBarStyle("light-content", true);
      } else {
        RNStatusBar.setBarStyle("dark-content", true);
      }
    }
  }, [theme]);

  return (
    <View style={{ flex: 1, backgroundColor: shellBackgroundColor }}>
      <View style={{ flex: 1 }}>
        <AppContent />
      </View>
      <StatusBar style="auto" />
      <BottomNavigation />
      {isLogin && !isShowGameModel ? <RefreshButton /> : null}
    </View>
  );
}

function PaperThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <PaperProvider theme={PaperTheme[theme as keyof typeof PaperTheme]}>
      {children}
    </PaperProvider>
  );
}

// 同步主题颜色到 Web 端
function WebThemeColorSync() {
  const { theme } = useTheme();
  const themeBackground = resolveSafeAreaExtensionBg(theme);
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;

    const metas = document.querySelectorAll(
      'meta[name="theme-color"]',
    ) as NodeListOf<HTMLMetaElement>;

    if (metas.length === 0) {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = themeBackground;
      document.head.appendChild(meta);
    } else {
      metas.forEach((meta) => {
        meta.content = themeBackground;
      });
    }

    document.documentElement.style.backgroundColor = themeBackground;
    document.body.style.backgroundColor = themeBackground;
  }, [themeBackground]);

  return null;
}

// 同步网站信息到 Web 端
function WebSiteInfoSync() {
  const siteConfig = useSelector(
    (state: RootState) => state?.user?.cfg_site_base,
  );

  useEffect(() => {
    if (Platform.OS !== "web" || !siteConfig) return;

    if (siteConfig?.phoneLogoFileUrl) {
      updateAppleTouchIcon(siteConfig.phoneLogoFileUrl);
      updateFavicon(siteConfig.phoneLogoFileUrl);
    }

    if (siteConfig?.siteName) {
      const title = siteConfig.siteName;
      document.title = title;
      updateIOSAppTitle(title);
    }
  }, [siteConfig]);

  return null;
}
