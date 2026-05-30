import React, { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import WebView from "react-native-webview";
import { screen } from "@/utils/screen";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Colors } from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Props = {
  source: string; // 渲染的内容
  setInnerHTML?: true; // wap端是否直接渲染 html 代码
  width?: number; // 内容元素的宽度
  height?: number; // 内容元素的高度
  autoHeight?: true; // 是否需要自动计算高度
  autoWidth?: boolean; // 是否需要自动计算宽度
  webViewStyle?: {}; // 自定义webView样式
  htmlStyle?: {}; // 自定义html样式
  iframeStyle?: {}; // 自定义iframe样式
  onMessage?: (event: any) => void;
  onHeightSet?: (height: number) => void;
};

const isWeb = Platform.OS === "web";
export const AutoHeightWebView = (props: Props) => {
  const [webViewHeight, setWebViewHeight] = useState<number>(0);
  const [webViewWidth, setWebViewWidth] = useState<number>(0);
  // webView 组件
  const webViewRef = useRef<any>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const _w =
    props.width ??
    (props.autoWidth ? webViewWidth : screen.get("window").width);
  const _h = props.height || (props.autoHeight ? webViewHeight : 100);
  const { theme } = useTheme();

  // 内容切换时先重置尺寸，避免沿用上一条内容的旧高度/宽度
  useEffect(() => {
    if (props.autoHeight) setWebViewHeight(0);
    if (props.autoWidth) setWebViewWidth(0);
  }, [props.source, props.autoHeight, props.autoWidth]);

  const injectedScriptFun = () => {
    const waitForBridge = () => {
      if (window.postMessage.length !== 1) {
        setTimeout(waitForBridge, 1000);
      } else {
        const height = Math.max(
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.body.clientHeight,
          document.body.scrollHeight,
        );
        const width = Math.max(
          document.documentElement.clientWidth,
          document.documentElement.scrollWidth,
          document.body.clientWidth,
          document.body.scrollWidth,
        );
        postMessage(JSON.stringify({ height, width }));
      }
    };
    waitForBridge();
  };

  useEffect(() => {
    // 网页端将当前组件渲染的高度回传给父组件
    if (props.onHeightSet && divRef.current) {
      const setHeight = props.onHeightSet;
      setTimeout(() => {
        const divHeight = divRef.current!.clientHeight;
        setHeight(divHeight);
      }, 800);
    }
  }, [props.source]);

  const styleToString = (style?: object) => {
    if (!style) return "";
    return Object.entries(style)
      .map(([key, value]) => {
        // 将驼峰转为中划线，例如 backgroundColor -> background-color
        const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${kebabKey}:${value}`;
      })
      .join(";");
  };

  const injectedScript = `
    window.postMessage = function(message) {
      ${String(injectedScriptFun)}
    };
  `;
  const styledSource = `
  <style>
    * { box-sizing: border-box; user-select: none;}
    html, body { margin: 0; padding: 0; width: 100%; overflow-x: hidden;  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    "Noto Sans",
    "Noto Sans Devanagari",
    "Noto Color Emoji",
    sans-serif;}
    #__auto_height_root { max-width: 100%; }
    code {
      white-space: pre-wrap !important;
      word-break: break-word !important;
    }
    img { max-width: 100%; height: auto; }
    video, canvas, svg { max-width: 100%; height: auto; }
    p, span { text-wrap: wrap !important; }
    p, span, div, li, td, th, a {
      white-space: normal !important;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
    th, td { border: 1px solid rgba(128,128,128,0.35); padding: 8px; vertical-align: top; }
    th { font-weight: 600; }
    blockquote { margin: 12px 0; padding: 10px 14px; border-left: 4px solid rgba(128,128,128,0.45); }
    pre { margin: 10px 0; padding: 12px; border-radius: 8px; overflow-x: auto; background: rgba(128,128,128,0.12); }
    h1 { font-size: 22px; font-weight: 700; margin: 18px 0 10px; line-height: 1.3; }
    h2 { font-size: 18px; font-weight: 600; margin: 16px 0 8px; line-height: 1.35; }
    ul, ol { padding-left: 22px; margin: 8px 0; }
    li { margin: 4px 0; }
    a { text-decoration: underline; }
    ${props.autoHeight ? `* { color: ${Colors[theme].text} }` : ""}
  </style>
  <script>
    (function () {
      function applyContainScale() {
        var root = document.getElementById("__auto_height_root") || document.body;
        if (!root) return;

        // 先清掉上一次的缩放，拿到真实宽度
        root.style.transform = "";
        root.style.transformOrigin = "0 0";
        root.style.width = "fit-content";

        var containerW = document.documentElement.clientWidth || window.innerWidth || 0;
        var contentW = Math.ceil(root.scrollWidth || root.getBoundingClientRect().width || 0);
        if (!containerW || !contentW) return;

        var scale = contentW > containerW ? (containerW / contentW) : 1;
        root.style.transform = "scale(" + scale + ")";
        root.style.width = (scale < 1 ? (contentW + "px") : "100%");
        document.body.style.overflowX = "hidden";
      }

      window.addEventListener("load", function () {
        applyContainScale();
        requestAnimationFrame(applyContainScale);
        setTimeout(applyContainScale, 60);
      });
      window.addEventListener("resize", function () {
        applyContainScale();
      });
    })();
  </script>
  ${props.source}
`;
  // webView 内容代码组装
  const source = {
    html: `
    <html>
      <head>
        <meta name="viewport"
        content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script>
          ${
            props.autoHeight || props.autoWidth
              ? `
            (function () {
              function bindLinks() {
                var aTags = document.getElementsByTagName("a");
                for (var i = 0; i < aTags.length; i++) {
                  aTags[i].addEventListener("click", function(event) {
                    event.preventDefault();
                    var href = this.getAttribute("href");
                    window.ReactNativeWebView.postMessage(href || "");
                  });
                }
              }

              function measureAndPost() {
                var root = document.getElementById("__auto_height_root");
                var rootHeight = root ? Math.ceil(root.getBoundingClientRect().height) : 0;
                var bodyHeight = Math.ceil(document.body.scrollHeight || 0);
                var docHeight = Math.ceil(document.documentElement.scrollHeight || 0);
                var width = Math.ceil(document.documentElement.clientWidth || document.body.scrollWidth || 0);
                var height = rootHeight || bodyHeight || docHeight || 0;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  height: String(height),
                  width: String(width),
                  rootHeight: String(rootHeight),
                  bodyHeight: String(bodyHeight),
                  docHeight: String(docHeight)
                }));
              }

              function applyContainScale() {
                var root = document.getElementById("__auto_height_root");
                if (!root) return;
                root.style.transform = "";
                root.style.transformOrigin = "0 0";
                root.style.width = "fit-content";

                var containerW = document.documentElement.clientWidth || 0;
                var contentW = Math.ceil(root.scrollWidth || root.getBoundingClientRect().width || 0);
                if (!containerW || !contentW) return;
                var scale = contentW > containerW ? (containerW / contentW) : 1;
                root.style.transform = "scale(" + scale + ")";
                root.style.width = (scale < 1 ? (contentW + "px") : "100%");
                document.body.style.overflowX = "hidden";
              }

              window.addEventListener("load", function () {
                bindLinks();
                applyContainScale();
                measureAndPost();
                requestAnimationFrame(applyContainScale);
                requestAnimationFrame(measureAndPost);
                setTimeout(applyContainScale, 60);
                setTimeout(measureAndPost, 80);
              });
            })();
            `
              : ""
          }
        </script>
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; width: 100%; overflow-x: hidden; }
          #__auto_height_root { max-width: 100%; }
          img {
            max-width: 100%;
            height: auto;
          }
          video, canvas, svg { max-width: 100%; height: auto; }
          p,span {
            text-wrap: wrap !important;
          }
          p, span, div, li, td, th, a {
            white-space: normal !important;
            overflow-wrap: anywhere;
            word-break: break-word;
          }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
          th, td { border: 1px solid rgba(128,128,128,0.35); padding: 8px; vertical-align: top; }
          th { font-weight: 600; }
          blockquote { margin: 12px 0; padding: 10px 14px; border-left: 4px solid rgba(128,128,128,0.45); }
          pre { margin: 10px 0; padding: 12px; border-radius: 8px; overflow-x: auto; background: rgba(128,128,128,0.12); }
          h1 { font-size: 22px; font-weight: 700; margin: 18px 0 10px; line-height: 1.3; }
          h2 { font-size: 18px; font-weight: 600; margin: 16px 0 8px; line-height: 1.35; }
          ul, ol { padding-left: 22px; margin: 8px 0; }
          li { margin: 4px 0; }
          a { text-decoration: underline; }
          ${props.autoHeight && `* {color:${Colors[theme].text}}`}
      code {
      white-space: pre-wrap !important;
      word-break: break-word !important;
    }
        </style>
      </head>
      <body style="margin: 0px;${styleToString(props.htmlStyle)}">
        <div id="__auto_height_root">${props.source}</div>
      </body>
    </html>`,
  };

  // webView 接收 postMessage 处理函数
  const _onMessage = (event: { nativeEvent: { data: any } }) => {
    const rawData = String(event?.nativeEvent?.data ?? "");
    if (/^(https?:\/\/|\/)/.test(rawData)) {
      navigation.push(rawData.replace("/", ""));
      return;
    }

    try {
      // 渲染内容高度
      const data = JSON.parse(rawData);
      const newHeight = Number(data?.height || 0);
      const newWidth = Number(data?.width || 0);
      const rootHeight = Number(data?.rootHeight || 0);
      const stableHeight = rootHeight > 0 ? rootHeight : newHeight;
      props.autoHeight && stableHeight > 0 && setWebViewHeight(stableHeight);
      props.autoWidth && newWidth > 0 && setWebViewWidth(newWidth);
      props.onHeightSet?.(stableHeight); // APP端将当前组件渲染的高度回传给父组件
    } catch {}

    // 执行父亲传入的事件
    if (props.onMessage) props.onMessage(event);
  };

  return isWeb ? (
    props.setInnerHTML ? (
      <div
        ref={divRef}
        dangerouslySetInnerHTML={{ __html: styledSource }}
        style={{ width: "100%", ...props.htmlStyle }}
      />
    ) : (
      <iframe
        srcDoc={source.html}
        style={{
          width: "100%",
          height: _h,
          border: 0,
          display: "block",
          ...(props.iframeStyle || {}),
        }}
      />
    )
  ) : (
    <WebView
      ref={webViewRef}
      injectedJavaScript={props.autoHeight ? injectedScript : ""}
      javaScriptEnabled={true}
      automaticallyAdjustContentInsets={true}
      sharedCookiesEnabled={true}
      thirdPartyCookiesEnabled={true}
      source={source}
      onMessage={_onMessage}
      style={[{ width: _w, height: _h }, props.webViewStyle || {}]}
    />
  );
};
