import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import WebView from "react-native-webview";

export type SseBridgeEvent = { type: string; data: string };

type Props = {
  url: string;
  onEvent: (e: SseBridgeEvent) => void;
};

/**
 * 与 SSE 接口同源：inline HTML 若用 baseUrl=https://localhost，页面源是 localhost，
 * 请求 ngss 域名会变成跨域，EventSource 常被 CORS 挡掉 → onerror、readyState=2。
 */
function sseDocumentBaseUrl(sseAbsoluteUrl: string): string {
  try {
    return new URL(sseAbsoluteUrl).origin;
  } catch {
    return "https://localhost";
  }
}

function buildSseHtml(absoluteUrl: string): string {
  const u = JSON.stringify(absoluteUrl);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head><body><script>
(function () {
  var u = ${u};
  var pending = [];
  function flushPending() {
    var bridge = window.ReactNativeWebView;
    if (!bridge || typeof bridge.postMessage !== "function") return;
    while (pending.length) {
      try {
        bridge.postMessage(pending.shift());
      } catch (x) {}
    }
  }
  function post(t, d) {
    var payload = JSON.stringify({ type: t, data: d == null ? "" : String(d) });
    var bridge = window.ReactNativeWebView;
    if (bridge && typeof bridge.postMessage === "function") {
      try {
        bridge.postMessage(payload);
        flushPending();
      } catch (x) {
        pending.push(payload);
      }
    } else {
      pending.push(payload);
    }
  }
  // Android 上偶发：脚本执行时 bridge 尚未注入，onopen 若立刻触发会丢 post；轮询一小段时间把队列刷给 RN
  var flushTries = 0;
  var flushIv = setInterval(function () {
    flushTries++;
    flushPending();
    if (flushTries > 200) clearInterval(flushIv);
  }, 25);
  var es;
  function connect() {
    try {
      es = new EventSource(u);
      es.onopen = function () { post("open", ""); };
      es.onmessage = function (e) { post("message", e.data); };
      es.addEventListener("activity", function (e) { post("activity", e.data); });
      es.addEventListener("game", function (e) { post("game", e.data); });
      es.onerror = function () {
        post(
          "error",
          JSON.stringify({
            source: "EventSource.onerror",
            readyState: es.readyState,
            url: u,
          }),
        );
        try {
          es.close();
        } catch (x) {}
      };
    } catch (err) {
      post(
        "error",
        JSON.stringify({
          source: "EventSource.constructor",
          message: err && err.message ? String(err.message) : String(err),
          url: u,
        }),
      );
    }
  }
  // 延后到下一个 macrotask，给原生注入 ReactNativeWebView 的时间
  setTimeout(connect, 0);
})();
</script></body></html>`;
}

/**
 * 隐藏 WebView：内嵌 H5 使用浏览器 EventSource，经 postMessage 把事件交给 RN。
 */
export function SseWebViewBridge({ url, onEvent }: Props) {
  const html = useMemo(() => buildSseHtml(url), [url]);
  const baseUrl = useMemo(() => sseDocumentBaseUrl(url), [url]);

  return (
    <View style={styles.wrap} pointerEvents="none" collapsable={false}>
      <WebView
        source={{ html, baseUrl }}
        style={styles.webview}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled={false}
        cacheEnabled={false}
        onError={(e) => {
          const ne = e.nativeEvent;
          onEvent({
            type: "error",
            data: JSON.stringify({
              source: "WebView.onError",
              description: ne.description,
              code: ne.code,
              domain: ne.domain,
              ssePageUrl: url,
            }),
          });
        }}
        onHttpError={(e) => {
          const ne = e.nativeEvent;
          onEvent({
            type: "error",
            data: JSON.stringify({
              source: "WebView.onHttpError",
              statusCode: ne.statusCode,
              url: ne.url,
              ssePageUrl: url,
            }),
          });
        }}
        onMessage={(ev) => {
          try {
            const p = JSON.parse(ev.nativeEvent.data) as SseBridgeEvent;
            if (p && typeof p.type === "string") {
              onEvent({ type: p.type, data: p.data ?? "" });
            }
          } catch {
            /* ignore */
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 1,
    height: 1,
    opacity: 0,
    overflow: "hidden",
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: -1,
  },
  webview: { width: 1, height: 1, backgroundColor: "transparent" },
});
