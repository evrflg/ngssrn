/**
 * 设备检测工具函数（RN Web 安全）
 * 注意：所有 API 都需在浏览器环境下调用。
 */

import { Platform } from "react-native";

const isWeb = Platform.OS === "web";
const hasNavigator = () => typeof navigator !== "undefined";
const hasWindow = () => typeof window !== "undefined";

const getUserAgent = () =>
  hasNavigator() ? navigator.userAgent?.toLowerCase() : "";
const getVendor = () => (hasNavigator() ? navigator.vendor?.toLowerCase() || "" : "");
const getPlatform = () =>
  hasNavigator() ? navigator.platform.toLowerCase() : "";

// ==================== 设备类型检测 ====================

export const isAndroid = (): boolean => /android/i.test(getUserAgent());

// iPadOS 13+ 的 UA 伪装成 Mac，需要通过 maxTouchPoints 辅助判断
export const isIOS = (): boolean =>
  /iphone|ipad|ipod/i.test(getUserAgent()) ||
  (hasNavigator() &&
    navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1);

export const isMobile = (): boolean => isAndroid() || isIOS();

export const isMac = (): boolean =>
  hasNavigator() && navigator.platform.indexOf("Mac") !== -1;

export const isPc = (): boolean => !isMobile();

// 检测是否为 Android APK（根据 userAgent 中包含 "Android-APP"）
export const isAndroidApp = (): boolean =>
  getUserAgent().includes("android-app");

// 检测是否为 iOS App（根据 userAgent 中包含 "iOS-APP"）
export const isIOSApp = (): boolean => getUserAgent().includes("ios-app");

// 是否为半原生 APP
export const isHybridApp = (): boolean => isAndroidApp() || isIOSApp();

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

export function getIsPWA(): boolean {
  if (isIosStandalonePwa()) return true
  if (document.referrer.includes('fromPwa=true')) return true
  if(window && (window as any).isFromPwa) return true
  return isStandaloneLikeDisplayMode()
}

// 与历史代码兼容：在模块加载时求值一次

// 是否为桌面设备（包括开启 PC 模拟器的情况）
export const isDesktop = (): boolean => {
  const platform = getPlatform();
  const pcKeywords = [
    "win32",
    "win64",
    "macintel",
    "linux x86_64",
    "linux i686",
  ];
  return pcKeywords.some((key) => platform.includes(key));
};

// ==================== 浏览器类型检测 ====================

/** 是否为 Chrome 浏览器（排除 Edge、Opera、Brave 等基于 Chromium 的浏览器） */
export const isChrome = (): boolean => {
  const userAgent = getUserAgent();
  const vendor = getVendor();
  return (
    userAgent.includes("chrome") &&
    vendor.includes("google") &&
    !userAgent.includes("edg") &&
    !userAgent.includes("opr") &&
    !userAgent.includes("brave")
  );
};

/** 是否为 Safari 浏览器（真正的 Safari，不是 Chrome 伪装的） */
export const isSafari = (): boolean => {
  const userAgent = getUserAgent();
  const vendor = getVendor();
  return (
    userAgent.includes("safari") &&
    !userAgent.includes("chrome") &&
    !userAgent.includes("android") &&
    userAgent.includes("version/") &&
    (vendor.includes("apple") || vendor === "")
  );
};

/** 是否为 Android WebView（安卓套盒） */
export const isAndroidWebView = (): boolean =>
  /(wv)|android.*version\/[\d\.]+/.test(
    hasNavigator() ? navigator.userAgent : ""
  );
