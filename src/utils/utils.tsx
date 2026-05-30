import { showMessage, hideMessage } from "react-native-flash-message";
import type { MessageOptions } from "react-native-flash-message";
import { Icon, IconProps } from "@rneui/themed";
import { ActivityIndicator, Platform, View, Linking, AppState, AppStateStatus } from "react-native";
import { t } from "i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isWeb = Platform.OS === "web";
let flashMessageInstance: any = null;

export const registerFlashMessage = (instance: any) => {
  flashMessageInstance = instance;
};

const getIcons = (props: IconProps) => {
  return <Icon color={"#fff"} size={18} style={{ marginRight: 6 }} {...props} />;
};

export const showErrorMessage = (message = t("common.operationFailed"), duration = 2000) => {
  const _props: MessageOptions = {
    message: message,
    type: "danger",
    titleStyle: { maxWidth: 200 },
    duration: duration,
    icon: () => getIcons({ name: "cancel" }),
  };

  if (flashMessageInstance) {
    flashMessageInstance.showMessage(_props);
  } else {
    showMessage(_props);
  }
};

export const showSuccessMessage = (message = t("common.operationSuccess"), duration = 2000) => {
  const _props: MessageOptions = {
    message: message,
    type: "success",
    titleStyle: { maxWidth: 245 },
    duration: duration,
    icon: () => getIcons({ name: "check-circle" }),
  };

  if (flashMessageInstance) {
    flashMessageInstance.showMessage(_props);
  } else {
    showMessage(_props);
  }
};

export const showWarningMessage = (message = t("common.operationWarning"), duration = 2000) => {
  const _props: MessageOptions = {
    message: message,
    type: "warning",
    titleStyle: { maxWidth: 245 },
    duration: duration,
    icon: () => getIcons({ name: "info" }),
  };
  if (flashMessageInstance) {
    flashMessageInstance.showMessage(_props);
  } else {
    showMessage(_props);
  }
};

export const showLoading = (message = t("common.loading")) => {
  const _props: MessageOptions = {
    message: message,
    renderBeforeContent() {
      return (
        <View className="mb-2">
          <ActivityIndicator size="large" color="white" />
        </View>
      );
    },
    autoHide: false,
  };

  if (flashMessageInstance) {
    flashMessageInstance.showMessage(_props);
  } else {
    showMessage(_props);
  }
};

export const showMsg = (message = t("common.message"), duration = 2000) => {
  const _props: MessageOptions = {
    message: message,
    duration: duration,
  };
  if (flashMessageInstance) {
    flashMessageInstance.showMessage(_props);
  } else {
    showMessage(_props);
  }
};

export const hideMsg = () => {
  if (flashMessageInstance) {
    flashMessageInstance.hideMessage();
  } else {
    hideMessage();
  }
};

export const parseHtml = (inputContent: string) => {
  const outputContent = inputContent
    .replace(/<span style="([^"]*)">/g, (match, styles) => {
      // 添加新的样式
      const newStyles = `${styles}; display: 'flex'; flex-direction: 'row'; flex-wrap: 'nowrap';`;
      return `<span style="${newStyles}">`;
    })
    .replaceAll("text-wrap: wrap", "text-wrap: nowrap")
    .replaceAll("<br/>", "")
    .replaceAll("<br>", "")
    .replaceAll("<br />", "")
    .replaceAll("\n", "")
    .replaceAll("<span", "<p")
    .replaceAll("</span>", "</p>");

  return `<View style="display: flex; flex-direction: row; flex-wrap: nowrap;">${outputContent}</View>`;
};
export const formatNumber = (value: number): string => {
  return String(value).padStart(2, "0");
};

/**
 * @description: 金额格式化
 * @param {number | string} value 金额
 * @return {string} 添加千位分隔符,最多保留两位小数
 */
export function formatMoney(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) return "0.00";
  const minimumFractionDigits = 2;
  const maximumFractionDigits = 2;
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const formatter = new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits,
    maximumFractionDigits,
  });
  return formatter.format(num);
}
const GAME_MAP: Record<number, string> = {
  1: "games.live",
  2: "games.egame",
  3: "games.chess",
  4: "games.fishing",
  5: "games.esport",
  6: "games.sport",
  7: "games.lottery",
};
export const getGameNameByType = (type: keyof typeof GAME_MAP) => t(GAME_MAP[type]) ?? "";

/**
 * 从 AsyncStorage 获取缓存的 URL 参数
 * @param key AsyncStorage 的键名，默认为 'allParams'
 * @returns URL 参数字符串
 * @example
 * getCachedParams() // 'a=1&b=2'
 * getCachedParams('myParams') // 'x=1&y=2'
 */
export const getCachedParams = async (key: string = "allParams"): Promise<string> => {
  try {
    const allParams = await AsyncStorage.getItem(key);
    if (!allParams) return "";

    const params = JSON.parse(allParams);
    return objectToQueryString(params);
  } catch (error) {
    console.error("解析参数失败:", error);
    return "";
  }
};

// Convert object → query string
const objectToQueryString = (obj: Record<string, any>): string => {
  return Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join("&");
};

/**
 * 确保 URL 包含协议前缀
 * @param url 输入的 URL
 * @returns 带协议前缀的 URL，如果输入为空则返回 null
 */
export const ensureProtocol = (url: string | null | undefined): string | null => {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

/**
 * 设备和客户端类型检测工具
 */
const userAgent = navigator.userAgent ? navigator.userAgent.toLowerCase() : "";

/**
 * 检测是否为 Android APK（根据 userAgent 中包含 "Android-APP"）
 * @returns 是否为 Android APK
 */
export const isAndroidApp = (): boolean => {
  return userAgent.includes("android-app");
};

/**
 * 检测是否为 iOS App（预留，等待 iOS App 实现）
 * @returns 是否为 iOS App
 */
export const isIOSApp = (): boolean => {
  // 可以根据 iOS App 的 userAgent 特征进行检测
  // return /iOS-APP/i.test(userAgent) || /YourIOSAppIdentifier/i.test(userAgent);
  return false;
};

function isIosStandalonePwa(): boolean {
  return (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function isStandaloneLikeDisplayMode(): boolean {
  const queries = [
    '(display-mode: standalone)',
    '(display-mode: minimal-ui)',
    '(display-mode: fullscreen)',
    '(display-mode: window-controls-overlay)',
  ]
  try {
    return queries.some((mq) => window.matchMedia(mq).matches)
  } catch {
    return false
  }
}
/**
 * 检测是否为 PWA（渐进式 Web 应用）
 * 检测是否在独立模式运行（已安装）
 * @returns 是否为 PWA
 */
export function getIsPWA(): boolean {
  if (Platform.OS != "web") return false;
  if (isIosStandalonePwa()) return true
  if (document.referrer.includes('fromPwa=true')) return true
  if((window as any).isFromPwa) return true
  return isStandaloneLikeDisplayMode()
} 

/**
 * 获取客户端类型
 * @returns 客户端类型：3=H5, 4=Android APK, 5=iOS App, 6=PWA
 * @example
 * getClientType() // 3 (H5)
 * getClientType() // 4 (Android APK)
 * getClientType() // 6 (PWA)
 */
export const getClientType = (): 3 | 4 | 5 | 6 => {
  // android apk 传4，ios app 传 5，pwa 传6，h5传 3

  // 检测 Android APK：userAgent 包含 "Android-APP"
  if (isAndroidApp()) {
    return 4; // Android APK
  }

  // 检测 iOS App（预留，等待 iOS App 实现）
  if (isIOSApp()) {
    return 5; // iOS App
  }

  // 判断 PWA（独立模式加载）
  if (getIsPWA()) {
    return 6; // PWA
  }

  return 3; // 默认 H5
};

/**
 * 从响应数据中查找第一个有效的 URL
 * @param data 响应数据对象
 * @param options 配置选项，包含 key 用于指定要查找的键名
 * @returns 找到的 URL 字符串，如果未找到则返回 null
 */
function findFirstValidUrl(data: any, options: { key: string }): string | null {
  // 如果直接是字符串且是有效 URL
  if (typeof data === "string" && /^https?:\/\//i.test(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  // 尝试从指定键获取
  if (options.key && data[options.key]) {
    const url = data[options.key];
    if (typeof url === "string" && /^https?:\/\//i.test(url)) {
      return url;
    }
  }

  // 递归查找所有可能的 URL 字段
  const urlKeys = ["url", "link", "href", "redirectUrl", "payUrl", "data"];
  for (const key of urlKeys) {
    if (data[key] && typeof data[key] === "string") {
      const url = data[key];
      if (/^https?:\/\//i.test(url)) {
        return url;
      }
    }
  }

  // 如果 data 有 data 属性，递归查找
  if (data.data && typeof data.data === "object") {
    return findFirstValidUrl(data.data, options);
  }

  return null;
}

/**
 * 打开窗口选项接口
 */
export interface OpenFromServerOptions<P, R> {
  /** API 请求函数 */
  request: (params: P) => Promise<{ data: R }>;
  /** 请求参数 */
  params: P;
  /** URL 在响应数据中的键名 */
  urlKey: string;
  /** 成功回调 */
  onSuccess?: (data: R) => void;
  /** 失败回调 */
  onFail?: (error: any) => void;
  /** 最终回调（无论成功或失败） */
  onFinally?: () => void;
  /** 是否等待窗口关闭（在 React Native 中，这表示等待应用返回前台） */
  waitForWindowClose?: boolean;
}

/**
 * 从服务器获取 URL 并打开（React Native 版本）
 *
 * 此函数适配了 React Native 环境，使用 Linking.openURL 打开外部链接。
 * 在 Web 平台上，会使用 window.open 打开新窗口。
 *
 * @param options 配置选项
 *
 * @example
 * ```tsx
 * await openWindowWithURLFromServer({
 *   request: (params) => getPaymentUrl(params),
 *   params: { orderId: '123' },
 *   urlKey: 'payUrl',
 *   onFail: (error) => console.error('Failed:', error),
 *   waitForWindowClose: true, // 等待用户从支付页面返回
 * });
 * ```
 */
export async function openWindowWithURLFromServer<P, R>({
  request,
  params,
  urlKey,
  onSuccess,
  onFail,
  onFinally,
  waitForWindowClose = false,
}: OpenFromServerOptions<P, R>) {
  const isWeb = Platform.OS === "web";

  try {
    const { data } = await request(params);
    const url = findFirstValidUrl(data, { key: urlKey });

    if (!url) {
      throw new Error(`接口返回的链接无效，键名: ${urlKey}`);
    }

    // Web 平台使用 window.open，原生平台使用 Linking.openURL
    if (isWeb) {
      const openedWin = window.open(url, "_blank");
      if (!openedWin) {
        // 当前浏览器拦截打开新窗口，替换当前网址
        // 这种情况下无法跟踪窗口关闭，立即调用成功回调
        window.location.href = url;
        onSuccess?.(data);
        onFinally?.();
        return;
      }

      // 如果需要等待窗口关闭，则轮询检查窗口状态
      if (waitForWindowClose && openedWin) {
        // UX 最佳实践：立即调用 onFinally 结束按钮加载状态，因为服务器请求已完成
        onFinally?.();

        let pollCount = 0;
        const MAX_POLLS = 9000; // 安全限制：最多轮询15分钟 (100ms * 9000)

        const checkWindowClosed = () => {
          pollCount++;
          if (openedWin && openedWin.closed) {
            onSuccess?.(data);
          } else if (openedWin && pollCount < MAX_POLLS) {
            // 继续轮询，每 100ms 检查一次
            setTimeout(checkWindowClosed, 100);
          }
        };
        checkWindowClosed();
      } else {
        // 立即调用成功回调（原有行为）
        onSuccess?.(data);
        onFinally?.();
      }
    } else {
      // React Native 平台
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
          throw new Error(`无法打开链接: ${url}`);
        }

        await Linking.openURL(url);

        // 如果需要等待窗口关闭（即等待应用返回前台）
        if (waitForWindowClose) {
          // UX 最佳实践：立即调用 onFinally 结束按钮加载状态，因为服务器请求已完成
          onFinally?.();

          // 使用 AppState 监听应用状态变化
          // 当应用从后台返回前台时，认为用户已关闭外部浏览器/应用
          let appStateSubscription: { remove: () => void } | null = null;
          let hasReturned = false;
          let previousAppState = AppState.currentState;
          const MAX_WAIT_TIME = 15 * 60 * 1000; // 最多等待15分钟

          appStateSubscription = AppState.addEventListener(
            "change",
            (nextAppState: AppStateStatus) => {
              // 当应用从 background/inactive 变为 active 时，认为用户已返回
              // 需要确保之前的状态不是 active（避免在应用启动时误触发）
              if (nextAppState === "active" && previousAppState !== "active" && !hasReturned) {
                hasReturned = true;
                // 延迟一小段时间确保应用完全激活
                setTimeout(() => {
                  onSuccess?.(data);
                  appStateSubscription?.remove();
                }, 300);
              }
              previousAppState = nextAppState;
            },
          );

          // 安全超时：如果超过最大等待时间仍未返回，自动调用成功回调
          setTimeout(() => {
            if (!hasReturned) {
              hasReturned = true;
              onSuccess?.(data);
              appStateSubscription?.remove();
            }
          }, MAX_WAIT_TIME);
        } else {
          // 立即调用成功回调
          onSuccess?.(data);
          onFinally?.();
        }
      } catch (linkError) {
        throw new Error(`打开链接失败: ${linkError}`);
      }
    }
  } catch (e) {
    onFail?.(e);
    onFinally?.();
  }
}

/**
 * 将图片 URI 转为 Blob。对 `data:` 在内存中解码，避免 `fetch(data:...;base64,...)` 在 Network 里出现超长「伪请求」、并减轻部分环境下的异常。
 */
export const fetchImageFromUri = async (uri: string): Promise<Blob> => {
  const trimmed = (uri || "").trim();
  if (/^data:/i.test(trimmed)) {
    const comma = trimmed.indexOf(",");
    if (comma === -1) throw new Error("invalid data uri");
    const meta = trimmed.slice(0, comma);
    const payload = trimmed.slice(comma + 1);
    const mimeMatch = meta.match(/^data:([^;,]+)/i);
    const mime = mimeMatch?.[1]?.trim() || "application/octet-stream";
    if (/;base64/i.test(meta)) {
      const cleaned = payload.replace(/\s/g, "");
      const binary = atob(cleaned);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    }
    try {
      const decoded = decodeURIComponent(payload.replace(/\+/g, " "));
      return new Blob([decoded], { type: mime });
    } catch {
      return new Blob([payload], { type: mime });
    }
  }
  const response = await fetch(trimmed);
  if (!response.ok) {
    throw new Error(`fetch image failed: ${response.status}`);
  }
  return response.blob();
};

export const isNumericString = (value: string):boolean => {
  return /^-?\d+(\.\d+)?$/.test(value);
}