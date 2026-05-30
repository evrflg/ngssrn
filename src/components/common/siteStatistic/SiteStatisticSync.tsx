import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import patch from "@/api/PatchVersion";
import { RootState } from "@/store/store";
import {
  buildSiteStatisticWebViewHtml,
  executeSiteStatisticCodeWeb,
  removeSiteStatisticCodeWeb,
  SITE_STATISTIC_RN_MESSAGE_TYPE,
} from "@/components/common/siteStatistic/jsRender";

/**
 * 默认「常态」WebView 物理区域：屏幕右下角 240×240。
 * - 客服 widget 几乎都是 cross-origin iframe（LiveChat/Tawk/Intercom 等），无法通过 JS 跨域 dispatch click。
 * - 唯一可靠的做法是让真 native 触摸进 WebView，所以默认让 WebView 只覆盖按钮所在的小矩形。
 * - 240 是给 widget 留够 init 空间（小于这个尺寸某些 widget 会判定环境异常拒绝渲染）+ 不过分挡住底栏的平衡值。
 * - 若你的客服按钮不在右下角 / 不显示，调整 COMPACT_HOST_SIZE 或 styles.host 里的 right/bottom 即可。
 */
const COMPACT_HOST_SIZE = 140;

/** 与 loadHTMLString 同源，相对路径 script src 需要合法 origin */
function statisticWebViewBaseUrl(): string {
  const u = String(patch.DOMAIN_URL ?? "").trim().replace(/\/+$/, "");
  return u && /^https?:\/\//i.test(u) ? u : "https://localhost";
}

/**
 * - Web：与 App.vue 相同，向 document.body 注入 script。
 * - iOS/Android：无 document，用 WebView 加载注入了 site statistic code 的 HTML。
 *
 * iOS WKWebView 是 opaque UIView，原生 hitTest 只看自己 frame，不看 DOM。
 * 客服 widget 几乎都是 cross-origin iframe，没法用 JS 跨域 dispatch click。
 * 因此唯一可靠的做法是让**真 native 触摸**进 WebView —— 物理上把 WebView 缩成 trigger 按钮所在的小矩形：
 *   1. 默认 host = 屏幕右下角 200×200（COMPACT_HOST_SIZE），`pointerEvents:'box-none'` 让子 WebView 接住该区域触摸。
 *      → 主界面除右下 200×200 外全可点；用户点右下角真触摸进 WebView，widget trigger 直接接到。
 *   2. widget 弹开大对话框（rect 短边 ≥ viewport 短边 ×80%）时，触摸桥发 `visible:true`，host 切 `absoluteFill`
 *      → viewport 撑大、widget 内部 resize 重新 layout、对话框完整可用（包括文本输入）。
 *   3. 对话框关闭 → 大面板消失 → 切回默认 200×200。
 *
 * 注意：不注入 `html,body{pointer-events:none}` 那段 CSS —— 它会让触摸桥 `getComputedStyle`
 * 全部读到 `pointer-events:none`（继承），导致大面板被误过滤，对话框永远切不回去。
 */
export function SiteStatisticSync() {
  const insets = useSafeAreaInsets();
  const siteStatisticCode = useSelector(
    (s: RootState) => s.user?.cfg_site_base?.siteStatisticCode
  );

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const raw = String(siteStatisticCode ?? "").trim();
    if (!raw) {
      removeSiteStatisticCodeWeb();
      return;
    }

    const id = requestAnimationFrame(() => {
      executeSiteStatisticCodeWeb(raw);
    });
    return () => {
      cancelAnimationFrame(id);
      removeSiteStatisticCodeWeb();
    };
  }, [siteStatisticCode]);

  const nativeHtml = useMemo(() => {
    if (Platform.OS === "web") return null;
    return buildSiteStatisticWebViewHtml(String(siteStatisticCode ?? ""));
  }, [siteStatisticCode]);

  /** observer 报告 body 是否有可见浮层；默认 false → host 用 `none`，主界面完全可点 */
  const [hasVisibleOverlay, setHasVisibleOverlay] = useState(false);
  /** code 换了重新加载 WebView，先把状态打回 false，避免上一份脚本残留的 flag 误开放触摸 */
  const lastHtmlRef = useRef<string | null>(null);
  useEffect(() => {
    if (lastHtmlRef.current !== nativeHtml) {
      lastHtmlRef.current = nativeHtml;
      setHasVisibleOverlay(false);
    }
  }, [nativeHtml]);

  const handleMessage = useCallback((e: WebViewMessageEvent) => {
    const raw = e?.nativeEvent?.data;
    if (typeof raw !== "string" || !raw) return;
    let payload: { type?: unknown; visible?: unknown } | null = null;
    try {
      payload = JSON.parse(raw);
    } catch {
      return;
    }
    if (!payload || payload.type !== SITE_STATISTIC_RN_MESSAGE_TYPE) return;
    const visible = Boolean(payload.visible);
    if (__DEV__) {
      // 让你能在 Metro 日志里直接看到「大对话框 → host 是否切到 absoluteFill」的状态机
      // eslint-disable-next-line no-console
      console.log("[SiteStat] bridge visible=", visible);
    }
    setHasVisibleOverlay(visible);
  }, []);

  const webViewRef = useRef<WebView | null>(null);

  if (Platform.OS === "web" || !nativeHtml) {
    return null;
  }

  /**
   * 两态切换：
   *   - 常态：host 只占屏幕右下角 200×200（compact）→ 主界面 200×200 之外可点；widget trigger 在这块小区域内可被真触摸点中。
   *   - 大面板态：host 切 absoluteFill → viewport 撑大，对话框正常 layout / 输入。
   *
   * RN 0.76 / Fabric 必须把 pointerEvents 写到 style（prop 已 deprecated），同时设 prop 做向后兼容。
   */
  const overlayStyle = hasVisibleOverlay
    ? {
        ...StyleSheet.absoluteFillObject,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        pointerEvents: "box-none" as const,
      }
    : {
        position: "absolute" as const,
        right: 0,
        bottom: insets.bottom+60,
        width: COMPACT_HOST_SIZE + insets.right,
        height: COMPACT_HOST_SIZE,
        paddingRight: insets.right,
        pointerEvents: "box-none" as const,
      };

  return (
    <View
      style={[styles.host, overlayStyle]}
      pointerEvents="box-none"
      collapsable={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <WebView
        ref={webViewRef}
        key={nativeHtml}
        source={{ html: nativeHtml, baseUrl: statisticWebViewBaseUrl() }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        cacheEnabled={false}
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        onMessage={handleMessage}
        // 在 HTTPS 页面里仍允许加载 HTTP 资源（混合内容），默认策略可能拦截；'always' 放宽限制，减少「加载不出来」的情况。
        {...(Platform.OS === "android"
          ? { mixedContentMode: "always" as const }
          : {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    zIndex: 50,
    elevation: 50,
    backgroundColor: "transparent",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
