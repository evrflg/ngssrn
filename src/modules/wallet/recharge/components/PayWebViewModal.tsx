import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef } from "react";
import { Alert, Linking, Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView, { type WebViewNavigation } from "react-native-webview";

const isWeb = Platform.OS === "web";

/** WebView 能自己处理的 scheme；其他的一律交给系统 Linking 唤起对应 App */
const IN_APP_SCHEMES = ["http:", "https:", "about:", "data:", "blob:", "file:"];

/**
 * 自定义 scheme（如 gcash://）唤起失败时的"下载地址"兜底表。
 * 因为系统不知道 gcash:// 属于哪个 App，必须我们自己在这里告诉它。
 * key 统一用小写 scheme（不含 ://）。
 */
const SCHEME_STORE_FALLBACK: Record<string, { ios: string; android: string; name: string }> = {
  gcash: {
    name: "GCash",
    ios: "https://apps.apple.com/ph/app/gcash/id520020791",
    android: "https://play.google.com/store/apps/details?id=com.globe.gcash.android",
  },
  paymaya: {
    name: "Maya",
    ios: "https://apps.apple.com/ph/app/maya-all-in-one-money-app/id991673943",
    android: "https://play.google.com/store/apps/details?id=com.paymaya",
  },
};

function getStoreFallback(url: string): { storeUrl: string; name: string } | null {
  const match = url.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):/);
  const scheme = match?.[1]?.toLowerCase();
  if (!scheme) return null;
  const entry = SCHEME_STORE_FALLBACK[scheme];
  if (!entry) return null;
  return {
    name: entry.name,
    storeUrl: Platform.OS === "ios" ? entry.ios : entry.android,
  };
}

/** 把 intent:// 形式的链接解析成 Android 可直接 Linking 的 url（拿 S.browser_fallback_url 或转成 scheme://） */
function resolveIntentUrl(intentUrl: string): string | null {
  if (!intentUrl.startsWith("intent://")) return null;
  const fallbackMatch = intentUrl.match(/S\.browser_fallback_url=([^;]+)/);
  if (fallbackMatch?.[1]) {
    try {
      return decodeURIComponent(fallbackMatch[1]);
    } catch {
      return fallbackMatch[1];
    }
  }
  const schemeMatch = intentUrl.match(/scheme=([^;]+)/);
  if (schemeMatch?.[1]) {
    const rest = intentUrl.replace(/^intent:\/\//, "").split("#Intent;")[0];
    return `${schemeMatch[1]}://${rest}`;
  }
  return null;
}

type TFunction = (key: string, options?: Record<string, string>) => string;

function openExternalWithI18n(url: string, t: TFunction): Promise<boolean> {
  const finalUrl = url.startsWith("intent://") ? resolveIntentUrl(url) ?? url : url;
  return (async () => {
    try {
      /**
       * 不使用 canOpenURL，因为 iOS 要求先在 Info.plist 的 LSApplicationQueriesSchemes 里
       * 声明 scheme 才会返回 true，未声明会导致即使装了 App 也"无法打开"。
       * 直接 openURL，未安装时会抛错，再进兜底提示。
       */
      await Linking.openURL(finalUrl);
      return true;
    } catch {
      const fallback = getStoreFallback(finalUrl);
      const appName = fallback?.name;
      Alert.alert(
        appName
          ? t("wallet.recharge.payWebViewAppNotDetectedTitle", { appName })
          : t("wallet.recharge.payWebViewCannotOpenTitle"),
        appName
          ? t("wallet.recharge.payWebViewGenericAppMissingMessage")
          : t("wallet.recharge.payWebViewGenericAppMissingMessage"),
      );
      return false;
    }
  })();
}

interface PayWebViewModalProps {
  url: string;
  onClose: () => void;
}

export function PayWebViewModal({ url, onClose }: PayWebViewModalProps) {
  const { theme } = useTheme();
  const primaryColor = useThemeColor({}, "primary");
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);
  const { t } = useTranslation();

  const openExternal = useCallback((targetUrl: string) => openExternalWithI18n(targetUrl, t), [t]);

  /**
   * 拦截导航：对 gcash://、intent://、tel:、mailto: 等自定义 scheme，
   * 走系统 Linking 唤起对应 App，避免 WebView 直接吞掉导致"点了没反应"。
   */
  const handleShouldStartLoad = (request: WebViewNavigation): boolean => {
    const target = request.url || "";
    const lower = target.toLowerCase();
    const isInApp = IN_APP_SCHEMES.some((s) => lower.startsWith(s));
    if (isInApp) return true;
    void openExternal(target);
    return false;
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>

        {/* 顶部栏 */}
        <View style={[styles.header, { paddingTop: insets.top, backgroundColor: Colors[theme].cardBg1 }]}>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={primaryColor} />
          </Pressable>
        </View>

        {/* 三方支付页面 */}
        <View style={styles.content}>
          {isWeb ? (
            <iframe
              src={url}
              allow="payment"
              style={{ flex: 1, width: "100%", height: "100%", border: "none" }}
            />
          ) : (
            <WebView
              ref={webviewRef}
              source={{ uri: url }}
              style={styles.webview}
              javaScriptEnabled
              domStorageEnabled
              sharedCookiesEnabled
              thirdPartyCookiesEnabled
              /** Android 需为 true 才会触发 onOpenWindow，覆盖 window.open('_blank') 的场景 */
              setSupportMultipleWindows={true}
              originWhitelist={["*"]}
              onShouldStartLoadWithRequest={handleShouldStartLoad}
              onOpenWindow={(e) => {
                const target = e.nativeEvent.targetUrl;
                if (!target) return;
                const lower = target.toLowerCase();
                const isInApp = IN_APP_SCHEMES.some((s) => lower.startsWith(s));
                if (isInApp) {
                  webviewRef.current?.stopLoading();
                  webviewRef.current?.injectJavaScript(
                    `window.location.href = ${JSON.stringify(target)}; true;`,
                  );
                } else {
                  void openExternal(target);
                }
              }}
            />
          )}
        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
