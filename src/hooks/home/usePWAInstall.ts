import { mergeParamStrings } from "@/utils/url";
import { isChrome, isDesktop, isIOS, isSafari } from "@/utils/deviceDetect";
import { getIsPWA } from "@/utils/utils";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

type InstallOutcome = "accepted" | "dismissed" | "error";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let swRegistered = false;

/**
 * 注册 Service Worker（只执行一次）
 */
export async function registerServiceWorker() {
  if (swRegistered) return;
  swRegistered = true;

  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    console.warn("浏览器不支持 Service Worker");
    return;
  }

  try {
    const version = process.env.NODE_ENV === 'development' ? '' : '/rn-h5';
    const registration = await navigator.serviceWorker.register(version + "/sw.js?20260311", {
      scope: version + "/",
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error("❌ Service Worker 注册失败:", error);
  }
}

/**
 * PWA 安装管理 Hook（Web 端）
 */
export function usePWAInstall() {
  // PWA 安装提示事件
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  // 是否支持 PWA 安装
  const [pwaInstallable, setPwaInstallable] = useState(false);
  // localStorage 中的安装状态（自动同步）
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  const isWeb = Platform.OS === "web";

  /**
   * 检测 PWA 是否已安装（在独立模式下运行）
   * 并同步到 localStorage
   */
  const syncInstalledState = () => {
    if (!isWeb || typeof window === "undefined") return;
    const runtimeInstalled = getIsPWA();
    const storedInstalled =
      window.localStorage?.getItem("isInstalled") === "true";
    const installed = runtimeInstalled || storedInstalled;
    setIsPwaInstalled(installed);
    window.localStorage?.setItem("isInstalled", String(installed));
  };
  useEffect(() => {
    if (!isWeb || typeof window === "undefined") return;
    syncInstalledState();

    /**
     * 监听 beforeinstallprompt 事件
     * 当浏览器检测到可以安装 PWA 时触发
     */
    const handleBeforeInstallPrompt = (e: Event) => {
      // 只有满足 PWA 可安装条件时，Chrome/Edge 才会触发此事件（iOS 不会触发）
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPwaInstallable(true);
      setIsPwaInstalled(false);
      window.localStorage?.setItem("isInstalled", "false");
    };

    /**
     * 监听 PWA 安装成功事件
     */
    const handleAppInstalled = () => {
      setPwaInstallable(false);
      setDeferredPrompt(null);
      setIsPwaInstalled(true);
      window.localStorage?.setItem("isInstalled", "true");
    };
    //handleBeforeInstallPrompt(new Event("beforeinstallprompt"));
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isWeb]);

  /**
   * 触发 PWA 安装提示
   * @returns Promise<'accepted' | 'dismissed' | 'error'>
   */
  const promptPWAInstall = async (): Promise<InstallOutcome> => {
    if (!pwaInstallable || !deferredPrompt) {
      setIsPwaInstalled(false);
      if (typeof window !== "undefined") {
        window.localStorage?.setItem("isInstalled", "false");
      }
      console.warn("PWA 安装提示不可用");
      return "error";
    }

    try {
      await deferredPrompt?.prompt();
      const { outcome } = await deferredPrompt?.userChoice;

      setDeferredPrompt(null);
      setPwaInstallable(false);
      return outcome;
    } catch (error) {
      setIsPwaInstalled(false);
      if (typeof window !== "undefined") {
        window.localStorage?.setItem("isInstalled", "false");
      }
      console.error("PWA 安装失败:", error);
      return "error";
    }
  };

  /**
   * 尝试通过协议打开已安装的应用
   * @param protocolUrl 协议 URL
   * @param timeout 超时时间（毫秒）
   * @returns Promise<boolean> - true 表示应用成功打开，false 表示打开失败
   */
  const tryOpenInstalledApp = (
    protocolUrl: string = "web+app://",
    timeout: number = 1000
  ): Promise<boolean> => {
    if (
      !isWeb ||
      typeof window === "undefined" ||
      !isChrome() ||
      isIOS()
    ) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      let appOpened = false;
      const handleBlur = () => {
        appOpened = true;
      };

      window.addEventListener("blur", handleBlur);

      const params = decodeURIComponent(window.location.search || "");
      const openParams = mergeParamStrings(params, "fromPwa=true");

      if (isDesktop()) {
        window.location.href = protocolUrl + openParams;
      } else if (!isSafari()) {
        const currentOrigin = window.location.origin;
        const startUrl = `${currentOrigin}/rn-h5/?${openParams}`;
        if (isPwaInstalled) window.open(startUrl);
      }

      setTimeout(() => {
        window.removeEventListener("blur", handleBlur);
        resolve(appOpened);
      }, timeout);
    });
  };

  return {
    pwaInstallable,
    deferredPrompt,
    isPwaInstalled,
    promptPWAInstall,
    tryOpenInstalledApp,
    syncInstalledState,
  };
}
