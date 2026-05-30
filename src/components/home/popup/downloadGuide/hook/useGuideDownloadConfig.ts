import { useDispatch, useSelector } from "react-redux";
import {
  fetchChannelPageConfig,
  getAppDownloadUrl,
  getDownloadConfigServer,
  queryWithdrawMember,
} from "@/api";
import { ensureProtocol, getCachedParams, getClientType } from "@/utils/utils";
import { setCurrentGuideInstallConfig } from "@/store/user/selfConfig";
import { useEffect, useMemo, useState } from "react";
import { RootState } from "@/store/store";
import { usePathname } from "expo-router";
import { getStoreJson } from "@/utils/storage";
import { type AppDownloadPopupLastTimeStored, GuideInstallScene } from "../shared";
import { isIOS } from "@/utils/deviceDetect";
import { assembleChannelData } from "../shared";

// Route names for different pages
export const ROUTE_NAMES = {
  HOME: "/home",
  DEPOSIT: "/wallet/recharge",
  WITHDRAW: "/wallet/withdraw",
} as const;

export const useGuideDownloadConfig = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const isIOSDevice = isIOS();

  const { currentGuideInstallConfig } = useSelector((state: RootState) => state?.selfConfig || {});

  const [goLandingPage, setGoLandinPage] = useState(false);
  const [appDomainConfig, setDomainConfig] = useState<any>(null);
  const [isDontPopupAgain, setDontPopupAgain] = useState(false);
  const [lastPopupTime, setLastPopupTime] = useState(new Date(2025, 0, 1));
  const [canOpenPopup, setCanOpenPopup] = useState(false);
  /** 仅提现页：query-member 返回 withdrawTimes===0 时为 true；其它页面不依赖此值 */
  const [withdrawMemberFirstTime, setWithdrawMemberFirstTime] = useState<boolean | null>(null);

  const sceneType = useMemo(() => {
    switch (pathname) {
      case ROUTE_NAMES.HOME:
        return GuideInstallScene.VISIT_HOMEPAGE;
      case ROUTE_NAMES.DEPOSIT:
        return GuideInstallScene.USER_RECHARGE;
      case ROUTE_NAMES.WITHDRAW:
        return GuideInstallScene.FIRST_WITHDRAWAL;
      default:
        return null;
    }
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!pathname) {
        setCanOpenPopup(false);
        return;
      }
      // 在非 H5 模式下（PWA/App），跳过下载弹窗，让 PopupManagement 继续下一个弹窗
      const clientType = getClientType();
      if (
        pathname.includes("fromPageh5=true") ||
        pathname.includes("fromPwa=true") ||
        pathname.includes("fromLanging=true") ||
        clientType !== 3
      ) {
        setCanOpenPopup(false);
        return;
      }

      // 先获取域名管理配置（决定 goLandingPage 与 domain）
      try {
        await getDomain();
      } catch {
        // 域名管理接口失败时，不阻塞后续弹窗链路，但禁用下载弹窗避免死循环
        if (!cancelled) setCanOpenPopup(false);
        return;
      }
      if (!cancelled) setCanOpenPopup(true);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const withdrawGuideGateOk = useMemo(() => {
    if (sceneType !== GuideInstallScene.FIRST_WITHDRAWAL) return true;
    return withdrawMemberFirstTime === true;
  }, [sceneType, withdrawMemberFirstTime]);

  const canShowAppDownloadFloatButton = useMemo(
    () =>
      currentGuideInstallConfig?.showDownloadButton === 0 &&
      !!sceneType &&
      canOpenPopup &&
      withdrawGuideGateOk,
    [currentGuideInstallConfig, sceneType, canOpenPopup, withdrawGuideGateOk],
  );

  // 获取渠道ID
  const channelId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const hash = window.location.hash;
      if (hash.includes("?")) {
        const hashParams = new URLSearchParams(hash.split("?")[1]);
        const chValue = hashParams.get("ch");
        if (chValue?.trim()) return chValue.trim();
      }
      const urlParams = new URLSearchParams(window.location.search);
      const chValue = urlParams.get("ch");
      if (chValue?.trim()) return chValue.trim();
      return null;
    } catch {
      return null;
    }
  }, []);

  // 获取渠道配置，用于渠道引导弹窗
  const getChannelPageConfig = async (
    cid: string,
    type: GuideInstallScene,
    appDomainConfig: any,
  ) => {
    try {
      const res: any = await fetchChannelPageConfig(cid);
      const channelConfig = res.data.data;
      // 组装渠道数据与默认引导弹窗结构一致
      const config = assembleChannelData(channelConfig, appDomainConfig, type, isIOSDevice);
      dispatch(setCurrentGuideInstallConfig(config));
    } catch {
      dispatch(setCurrentGuideInstallConfig(null));
    }
  };

  // 获取引导弹窗配置
  const getConfig = async (type: GuideInstallScene) => {
    await getDownloadConfigServer().then(({ data }) => {
      const currentData = data.data?.config?.[type]?.[0] ?? null;
      if (currentData) {
        currentData["android"]["guideId"] = currentData.appId;
        currentData["ios"]["guideId"] = currentData.appId;
      }
      dispatch(setCurrentGuideInstallConfig(currentData));
    });
  };

  // 获取 域名管理 下载按钮开关 开关
  const getDomain = async () => {
    await getAppDownloadUrl({ type: isIOSDevice ? 1 : 0 }).then(({ data }) => {
      const config = data.data;
      setGoLandinPage(config?.status === 0);
      setDomainConfig({ ...config, domain: ensureProtocol(config?.domain) });
    });
  };

  const loadLastPopupTime = async (scene: GuideInstallScene) => {
    const raw = (await getStoreJson(
      "appDownloadPopupLastTime",
    )) as AppDownloadPopupLastTimeStored | null;
    const popupTime = raw?.[scene];
    if (popupTime) {
      setDontPopupAgain(popupTime.dontPopup);
      if (popupTime.dateTime) setLastPopupTime(new Date(popupTime.dateTime));
    }
  };

  /**
   * 构建落地页 URL
   */
  const buildLandingPageUrl = async (appInfo: any): Promise<string | null> => {
    // 判断是否是PWA安装(如果安装按钮是安装，说明当前是PWA安装/ios安装)
    // const isPwa = primaryText === t("popup.appDownload.install");
    const templateId = appInfo?.appStore?.appId;
    const guideId = appInfo?.guideId;

    // 基础参数，templateId: 模板id，appId: 应用id
    const baseParams = new URLSearchParams({
      ...(guideId ? { guideId } : { templateId: templateId || "" }),
    });
    // 获取缓存的参数
    const cachedParams = await getCachedParams();

    // 构建基础 URL
    let basePath = "";
    if (isIOSDevice) {
      basePath = `/share/down/ios1`;
    } else {
      // 安卓需要判断模板样式跳去对应的落地页
      const templateStyle = appInfo?.appStore?.templateStyle;
      // 获取不到模版样式，不进行跳转
      if (!templateStyle) {
        return null;
      }
      basePath = `/share/down/android${templateStyle}`;
    }

    // 拼接完整 URL
    const params = [baseParams.toString(), cachedParams, "fromPageh5=true"]
      .filter(Boolean)
      .join("&");

    return `${appDomainConfig?.domain || ""}${basePath}?${params}`;
  };

  useEffect(() => {
    if (sceneType) {
      if (channelId && appDomainConfig) getChannelPageConfig(channelId, sceneType, appDomainConfig);
      else getConfig(sceneType);
    }
  }, [channelId, appDomainConfig, sceneType]);

  // 获取会员提现次数，用于首次提现引导
  useEffect(() => {
    if (sceneType !== GuideInstallScene.FIRST_WITHDRAWAL) {
      setWithdrawMemberFirstTime(null);
      return;
    }
    let cancelled = false;
    setWithdrawMemberFirstTime(null);
    queryWithdrawMember()
      .then((res) => {
        if (cancelled) return;
        const times = res?.data?.data?.withdrawTimes;
        setWithdrawMemberFirstTime(Number(times) === 0);
      })
      .catch(() => {
        if (!cancelled) setWithdrawMemberFirstTime(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sceneType]);

  useEffect(() => {
    if (sceneType) loadLastPopupTime(sceneType);
  }, [sceneType]);

  return {
    guideInstallConfig: currentGuideInstallConfig,
    appDomainConfig,
    sceneType,
    isDontPopupAgain,
    goLandingPage,
    canShowAppDownloadFloatButton,
    lastPopupTime,
    channelId,
    getChannelPageConfig,
    getConfig,
    getDomain,
    setDontPopupAgain,
    buildLandingPageUrl,
    setLastPopupTime,
  };
};
