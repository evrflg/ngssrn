import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { setStorage, getStorage, setStoreJson, removeStorage } from "@/utils/storage";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  accInfoAsync,
  changeSessionState,
  changeUserInfo,
  configAsync,
  switchesAsync,
} from "@/store/user/userSlice";
import { fetchTenantInfo } from "@/store/tenant/tenantSlice";
import { fetPersonalization } from "@/store/user/selfConfig";
import { useTranslation } from "react-i18next";
import { DeviceEventEmitter, InteractionManager, Platform } from "react-native";
import { getAppDownServer, getLanguageServer, reclaimGameBalances } from "@/api";
import * as SplashScreen from "expo-splash-screen";
import {
  allParams,
  setAllParams,
  setApiLanguage,
  setConfigSession,
  pushLoginAfterAuthLoss,
} from "@/api/common/client";
import {
  activityListAsync,
  clearReminderCount,
  clearTurntableRedPacketStatus,
  getReminderCountAsync,
} from "@/store/active/activeSlice";
import {
  DEFAULT_LANGUAGE,
  STORAGE_LANGUAGE_KEY,
  SUPPORTED_LANGUAGES,
  TENANT_LANGUAGE_MAP,
} from "@/lang/language";
import patch from "@/api/PatchVersion";
import { screen } from "@/utils/screen";
import { changeIsShowGameModel } from "@/store/game/gameSlice";

interface CommonProviderContextProps {
  language: string;
  changeLanguage: any;
  /** 与启动后网络就绪时调用的 `fetchData` 一致，用于侧栏等手动刷新 */
  refetchData: () => Promise<void>;
}

const CommonContext = createContext<CommonProviderContextProps | undefined>(undefined);

const isWeb = Platform.OS === "web";

const collectWebEntryParams = (): Record<string, string> => {
  if (!isWeb || typeof window === "undefined") return {};

  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const hash = window.location.hash || "";
  const hashQuery = hash.includes("?") ? hash.split("?")[1] : "";
  if (hashQuery) {
    const hashParams = new URLSearchParams(hashQuery);
    hashParams.forEach((value, key) => {
      params[key] = value;
    });
  }

  return params;
};

export function CommonProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("");

  const dispatch: AppDispatch = useDispatch();
  const session: any = useSelector((state: RootState) => state?.user?.session);
  const userInfo: { isLogin?: boolean } | undefined = useSelector(
    (state: RootState) => state?.user?.userInfo,
    // 仅关心登录态变化，避免 userInfo 其他字段更新导致整个 Provider 重渲染
    (prev, next) => prev?.isLogin === next?.isLogin,
  );
  const prevIsLoginRef = React.useRef(Boolean(userInfo?.isLogin));
  const { i18n, t } = useTranslation();
  const splashHiddenRef = React.useRef(false);
  const loadedErrorCodesRef = React.useRef<Set<string>>(new Set());
  const loadingErrorCodesRef = React.useRef<Partial<Record<string, Promise<boolean>>>>({});

  const hideSplashOnce = React.useCallback(() => {
    if (splashHiddenRef.current) return;
    splashHiddenRef.current = true;
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  const reLoginAfterAuthLoss = React.useCallback(() => {
    pushLoginAfterAuthLoss();
    DeviceEventEmitter.emit("showWarnMsg", { msg: t("login.pleaseReLogin") });
  }, [t]);

  /** 避免网络一直失败时永远卡在启动屏 */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      hideSplashOnce();
    }, 12000);
    return () => clearTimeout(timeoutId);
  }, [hideSplashOnce]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener("isUserLogout", () => {
      dispatch(changeUserInfo({}));
      dispatch(changeSessionState({}));
      dispatch(clearTurntableRedPacketStatus());
      dispatch(clearReminderCount());
      setConfigSession("");
      setStoreJson("session", null);
      reLoginAfterAuthLoss();
      setTimeout(() => {
        dispatch(changeIsShowGameModel(false))
      }, 500);
    });

    return () => subscription.remove(); // 组件卸载时清除
  }, []);

  useEffect(() => {
    void removeStorage("stopPassExtraEvent");
    if(isWeb){
      void fetchData();
    }else{
      return checkNetworkStatus();
    }
  }, []);

  //没3秒检查一次网络状态成功后执行fetchData
  const checkNetworkStatus = () => {
    let interval: NodeJS.Timeout | null = null;
    const tick = () => {
      void getLanguageServer({ silentErrorToast: true }).then(async (res) => {
        console.log("网络状态", res?.status);
        if (res?.status !== 200) return;

        if (interval) {
          clearInterval(interval);
          interval = null;
        }

        try {
          await fetchData();
          await new Promise<void>((resolve) => {
            InteractionManager.runAfterInteractions(() => resolve());
          });
        } catch (e) {
          console.error("fetchData / 首屏准备失败:", e);
        } finally {
          hideSplashOnce();
        }
      });
    };

    // 先立即执行一次，不要等 3 秒
    tick();
    interval = setInterval(tick, 3000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  };

  useEffect(() => {
    if (session?.accessToken) {
      dispatch(accInfoAsync());
    }
  }, [session?.accessToken, dispatch]);

  // 登录态从否→是时重拉活动列表，底部会员日角标等依赖 activityList（与 Vue 登录后刷新一致）
  useEffect(() => {
    const isLogin = Boolean(userInfo?.isLogin);
    if (isLogin && !prevIsLoginRef.current) {
      //回收游戏余额
      void reclaimGameBalances().then((res: any) => {
        if (res.data.data) {
          dispatch(accInfoAsync() as any); // 刷新用户信息
        }
      });
      //重拉活动列表
      dispatch(activityListAsync());
      dispatch(getReminderCountAsync());
    }
    prevIsLoginRef.current = isLogin;
  }, [userInfo?.isLogin, dispatch]);

  useEffect(() => {
    if (!language) return;
    if (i18n.language === language) return;
    let cancelled = false;
    void (async () => {
      try {
        await i18n.changeLanguage(language);
        if (cancelled) return;
        void setStorage(STORAGE_LANGUAGE_KEY, language);
        setApiLanguage(language);
        dispatch(activityListAsync());
      } catch (e) {
        console.error("i18n changeLanguage failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [language, i18n, dispatch]);

  // 语言就绪后加载/合并远端 errMsg（切换语言时同步，与 ngss-vue errCode 插件一致）
  useEffect(() => {
    if (!language) return;
    void asyncAddErrorCodes(language);
  }, [language]);

  const fetchData = async () => {
    if (isWeb) {
      const entryParams = collectWebEntryParams();
      if (Object.keys(entryParams).length > 0) {
        const cachedParams = await getStorage("allParams");
        let parsedCachedParams: Record<string, string> = {};
        if (cachedParams) {
          try {
            parsedCachedParams = JSON.parse(cachedParams);
          } catch {
            parsedCachedParams = {};
          }
        }
        const mergedParams = { ...parsedCachedParams, ...entryParams };
        setAllParams(mergedParams);
        void setStoreJson("allParams", mergedParams);
      }
    }

    // 关键接口：影响首屏渲染，立即发起
    let randomCode: string | undefined;
    if (isWeb) {
      const params = new URLSearchParams(window.location.search);
      randomCode = params.get("randomCode") as string | undefined;
    }
    dispatch(fetPersonalization(randomCode));

    // 获取站点信息
    try {
      const { payload: tenantInfo } = await dispatch(fetchTenantInfo());

      await setLanguageAndErrorCodes(tenantInfo);
    } catch (error) {
      console.error("fetchTenantInfo error", error);
    }

    // 非关键接口：延后到 UI 交互完成后再发起，避免启动卡顿
    InteractionManager.runAfterInteractions(() => {
      dispatch(configAsync());
      dispatch(activityListAsync());
      dispatch(switchesAsync());
      if(userInfo?.isLogin){
        dispatch(getReminderCountAsync());
      }
      if (!isWeb) {
        getAppDownParams();
      }
    });
  };

  //获取app下载参数
  const getAppDownParams = () => {
    getAppDownServer({
      device: `${screen.get("screen").width}x${screen.get("screen").height}`,
    }).then((res: any) => {
      if (res?.data?.data) {
        const appDownData = res?.data?.data;
        setAllParams({
          ...(allParams as Record<string, unknown>),
          ...(appDownData as Record<string, unknown>),
        });
      }
    });
  };

  // 加载错误码资源
  const setLanguageAndErrorCodes = async (tenantInfo: any) => {
    let finalLanguage = DEFAULT_LANGUAGE;

    // 获取缓存语言
    const storedLanguage = await getStorage(STORAGE_LANGUAGE_KEY);

    if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)) {
      finalLanguage = storedLanguage;
    } else {
      finalLanguage = TENANT_LANGUAGE_MAP.get(tenantInfo?.language) || DEFAULT_LANGUAGE;
    }

    // 设置当前语言
    setLanguage(finalLanguage);
    // 加载错误码资源
    void asyncAddErrorCodes(finalLanguage);
  };

  // 切换语言
  const changeLanguage = (currentLan: string, rest: string | undefined) => {
    if (currentLan && currentLan !== language) {
      setLanguage(currentLan); // 切换语言
    }
  };

  // 加载错误码资源
  const asyncAddErrorCodes = async (lang: string) => {
    if (!lang) return false;
    if (loadedErrorCodesRef.current.has(lang)) return true;
    if (loadingErrorCodesRef.current[lang]) {
      return loadingErrorCodesRef.current[lang];
    }

    const task = (async () => {
      try {
        const response = await fetch(`${patch.DOMAIN_URL}/share/errCode/${lang}.js?v=20260419`);
        const text = await response.text();
        let newErrorCodes = {};
        try {
          newErrorCodes = new Function(text + "; return errCode;")() || {};
        } catch (syntaxError) {
          console.error(`❌ ${lang} 错误码文件语法错误:`, syntaxError);
          return false;
        }
        i18n.addResources(lang, "translation", newErrorCodes);
        loadedErrorCodesRef.current.add(lang);
        return true;
      } catch {
        return false;
      } finally {
        delete loadingErrorCodesRef.current[lang];
      }
    })();

    loadingErrorCodesRef.current[lang] = task;
    return task;
  };

  const fetchDataRef = React.useRef<() => Promise<void>>(async () => {
    // 占位，挂载后立即指向下方 fetchData
  });
  fetchDataRef.current = fetchData;
  const refetchData = React.useCallback(() => {
    return fetchDataRef.current();
  }, []);

  const contextValue = useMemo(
    () => ({ language, changeLanguage, refetchData }),
    [language, changeLanguage, refetchData],
  );

  return <CommonContext.Provider value={contextValue}>{children}</CommonContext.Provider>;
}

export const useCommon = (): CommonProviderContextProps => {
  const context = useContext(CommonContext);
  if (context === undefined) {
    throw new Error("useCommon must be used within a CommonProvider");
  }
  return context;
};
