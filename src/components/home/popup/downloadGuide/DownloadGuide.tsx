import { usePWAInstall } from "@/hooks/home/usePWAInstall";
import { getStoreJson, setStoreJson } from "@/utils/storage";
import { useEffect, useMemo, useRef, useState } from "react";
import { Linking, Platform } from "react-native";
import { usePWAManifest } from "@/hooks/home/usePWAManifest";
import { updateAppleTouchIcon } from "@/utils/webInfo";
import { isIOS } from "@/utils/deviceDetect";
import { DownloadGuideProvider } from "./Context";
import { DownloadGuideModal } from "./Modal";
import { useGuideDownloadConfig } from "./hook/useGuideDownloadConfig";
import {
  type AppDownloadPopupLastTimeStored,
  DownloadGuideProps,
  getIosInstallButtonDisabled,
} from "./shared";
import { appDownPush } from "@/api";

const isWeb = Platform.OS === "web";

const DownloadGuide = ({
  visible,
  onClose: onExternalClose,
  onQueueStateChange,
  forceShow = false,
}: DownloadGuideProps = {}) => {
  const isIOSDevice = isIOS();

  const {
    guideInstallConfig,
    isDontPopupAgain,
    goLandingPage,
    canShowAppDownloadFloatButton,
    sceneType,
    lastPopupTime,
    setDontPopupAgain,
    buildLandingPageUrl,
    setLastPopupTime,
    channelId,
  } = useGuideDownloadConfig();

  const { pwaInstallable, isPwaInstalled, promptPWAInstall } = usePWAInstall();
  const { updatePWAManifestFromAppInfo } = usePWAManifest();
  const [internalVisible, setInternalVisible] = useState(false);
  const isControlled = typeof visible === "boolean";
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseVisible = isControlled ? !!visible : internalVisible;
  // 「不再弹出」只约束自动弹窗；顶部条/显式点击时 forceShow 为 true，不拦截
  const shouldBlockByDontPopup = isDontPopupAgain && !baseVisible && !forceShow;

  // 最终是否展示弹窗：业务条件 + 显隐状态；forceShow 时与点击引导按钮一样直接弹
  const showDownloadGuidePopup =
    isWeb &&
    !!guideInstallConfig &&
    baseVisible &&
    (!!canShowAppDownloadFloatButton || !!forceShow);

  const appInfo = useMemo(() => {
    // 应用信息
    if (!guideInstallConfig) return {};
    return isIOSDevice ? guideInstallConfig.ios : guideInstallConfig.android;
  }, [guideInstallConfig, isIOSDevice]);

  useEffect(() => {
    // 使用封装好的函数更新 Manifest
    if (!appInfo || Object.keys(appInfo).length === 0) return;

    updatePWAManifestFromAppInfo(appInfo);
    const icon = appInfo?.appStore?.appIcon;
    if (icon) {
      updateAppleTouchIcon(icon);
    }
  }, [appInfo, updatePWAManifestFromAppInfo]);

  // 是否是 Android APK 安装
  const isAndroidApk = useMemo(() => {
    return (
      !isIOSDevice && (appInfo.installType === 1 || (appInfo.installType === 2 && !pwaInstallable))
    );
  }, [isIOSDevice, appInfo, pwaInstallable]);

  // 安装按钮是否禁用（与 InstallButton 规则一致）
  const isInstallButtonDisabled = useMemo(() => {
    if (isIOSDevice) {
      return getIosInstallButtonDisabled(appInfo, goLandingPage, channelId);
    }

    if (isAndroidApk) {
      return !appInfo?.downloadUrl;
    }

    return !pwaInstallable && !isPwaInstalled;
  }, [isIOSDevice, channelId, isAndroidApk, appInfo, goLandingPage, pwaInstallable, isPwaInstalled]);

  // 记录关闭弹窗时间
  const onClose = async () => {
    if (sceneType) {
      const prev = await getStoreJson("appDownloadPopupLastTime");
      const base: AppDownloadPopupLastTimeStored =
        prev && typeof prev === "object" ? { ...(prev as AppDownloadPopupLastTimeStored) } : {};
      base[sceneType] = {
        dateTime: new Date().toISOString(),
        dontPopup: isDontPopupAgain,
      };
      setStoreJson("appDownloadPopupLastTime", base);
    }
    setLastPopupTime(new Date());
    if (!isControlled) {
      setInternalVisible(false);
    }
    onExternalClose?.();
  };

  const onOpenPop = () => {
    if (shouldBlockByDontPopup || !isWeb) return;
    if (isControlled) {
      onQueueStateChange?.(true);
      return;
    }
    setInternalVisible(true);
  };

  useEffect(() => {
    // 显式入队展示：不按间隔/「不再弹出」上报 false 把队列项移除
    if (forceShow && isControlled) {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      return () => {
        if (timer.current) {
          clearTimeout(timer.current);
          timer.current = null;
        }
      };
    }

    if (
      !sceneType ||
      (!canShowAppDownloadFloatButton && !forceShow) ||
      !guideInstallConfig ||
      shouldBlockByDontPopup
    ) {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      onQueueStateChange?.(false);
      return;
    }

    const triggerPopup = () => {
      if (isControlled) {
        onQueueStateChange?.(true);
        return;
      }
      onOpenPop();
    };

    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    // 弹窗时间间隔
    const popupIntervalTime = guideInstallConfig.popupIntervalTimeType ?? 0;
    if (popupIntervalTime <= 0) {
      triggerPopup();
      return;
    }

    const now = Date.now();
    const timeSinceClose = now - lastPopupTime.getTime();
    const intervalMs = popupIntervalTime * 3600 * 1000;
    // 最近一次打开的间隔时间大于等于间隔时间，则可以打开弹窗
    const canOpen = timeSinceClose >= intervalMs;
    // If interval has already passed, show immediately
    if (canOpen) {
      triggerPopup();
      return;
    }

    if (isControlled && !forceShow) {
      onQueueStateChange?.(false);
    }

    // Calculate remaining time until popup should appear
    const remainingTime = intervalMs - timeSinceClose;

    // Schedule popup for the exact time when interval passes
    timer.current = setTimeout(() => {
      triggerPopup();
    }, remainingTime);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [
    sceneType,
    canShowAppDownloadFloatButton,
    guideInstallConfig,
    shouldBlockByDontPopup,
    lastPopupTime,
    isControlled,
    onQueueStateChange,
    forceShow,
  ]);

  /**
   * 跳转安装
   */
  const goInstall = async () => {
    // 如果安装按钮禁用，则显示提示
    if (isInstallButtonDisabled) {
      console.log("安装按钮禁用")
      return;
    }
    const templateStyle = appInfo?.appStore?.templateStyle;
    // 不跳转落地页，直接跳转应用商店或下载链接
    let targetUrl: any = "";
    console.log("goLandingPage:"+goLandingPage+"-----templateStyle:"+templateStyle)
    if (!goLandingPage || !templateStyle) {
      // PWA 安装（Android）
      
      if (pwaInstallable && !isAndroidApk) {
        const result = await promptPWAInstall();
        if (result === "accepted") {
          console.log("安装pwa成功");
        } else if (result === "dismissed") {
          console.log("取消安装pwa");
        }
      } else {
        targetUrl = isIOSDevice ? appInfo?.appstoreUrl : appInfo?.downloadUrl;
        if(targetUrl){
          if(isAndroidApk&&channelId){
            const device = `${screen.width}x${screen.height}`;
            await appDownPush(device)
          }
          window.location.href = targetUrl;
        }
      }
    } else {
      // 跳转落地页
      targetUrl = await buildLandingPageUrl(appInfo);
    }
    if (!targetUrl) return;
    try {
      Linking.canOpenURL(targetUrl).then((supported) => {
        if (supported) {
          Linking.openURL(targetUrl);
        }
      });
      setStoreJson("appDownload_isInstalled", true);
    } catch (error) {
      console.error(error);
    }
  };

  const contextValue = useMemo(
    () => ({
      guideInstallConfig,
      appInfo,
      goLandingPage,
      pwaInstallable,
      isPwaInstalled,
      channelId,
      onInstall: goInstall,
      isDontPopupAgain,
      onToggleDontPopup: () => setDontPopupAgain((prev) => !prev),
    }),
    [guideInstallConfig, appInfo, goLandingPage, pwaInstallable, isPwaInstalled, channelId, goInstall, setDontPopupAgain],
  );

  if (!isWeb || !guideInstallConfig) return null;
  if (!canShowAppDownloadFloatButton && !forceShow) return null;

  return (
    <>
      <DownloadGuideProvider value={contextValue}>
        <DownloadGuideModal visible={showDownloadGuidePopup} onClose={onClose} />
      </DownloadGuideProvider>
    </>
  );
};

export default DownloadGuide;
