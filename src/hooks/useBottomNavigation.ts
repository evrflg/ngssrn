import { useCallback, useMemo, useRef } from "react";
import { useRouter, type RelativePathString } from "expo-router";
import { useSelector } from "react-redux";
import { selectBottomNavigation } from "@/store/user/selfConfig";
import { RootState } from "@/store/store";
import { Tab, type Tabs } from "@/types/navigation";
import { processNavigation } from "@/utils/navigation";
import { usePathname } from "expo-router";
import { guestRegister } from "@/api";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { changeIsShowTestUserPopup, changeSessionState } from "@/store/user/userSlice";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/common/toast";
import { Platform } from "react-native";
import {
  requestDownloadGuideOnNextHome,
  requestShowDownloadGuideNow,
} from "@/components/home/popup/downloadGuide/hook/requestDownloadGuideOnHome";
import { resolveFooterMenuValues } from "@/utils/footer/resolveFooterMenuValues";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isWeb = Platform.OS === "web";
const DEFAULT_BEFORE_LOGIN_TABS = "HOME,ACTIVITY,LOGIN,REGISTER,MY";
const DEFAULT_AFTER_LOGIN_TABS = "HOME,ACTIVITY,WALLET,PROMOTION,MY";

/** 登录、注册页不显示底栏 */
const HIDE_FOOTER_PATHS = new Set(["/login", "/register"]);
/** 与 ngss-vue 页脚一致：这些根路径参与「是否显示底栏」判断（仅全等，不含子路径） */
const ALWAYS_FOOTER_PATHS = new Set(["/", "/home", "/my", "/wallet"]);
/** 与底栏 HOME Tab 的 path（/home）对齐：根路径 `/` 视为同一入口 */
const HOME_PATHS = new Set(["/", "/home"]);

const NAV_BAR_HEIGHT = 54;

const getWebRuntimePath = () => {
  if (!isWeb || typeof window === "undefined") return "";
  const { pathname = "/", hash = "" } = window.location;
  const hashPath = hash.replace(/^#/, "");
  if (hashPath.startsWith("/")) return hashPath;
  if (pathname.startsWith("/#/")) return pathname.slice(2);
  return pathname;
};

export const normalizeBottomNavPath = (path: string) => {
  let cleaned = (path || "").split("?")[0];
  if (isWeb && (cleaned === "/" || !cleaned)) {
    cleaned = getWebRuntimePath().split("?")[0];
  }

  cleaned = cleaned.replace(/^\/rn-h5(?=\/|$)/, "").replace(/^\/\(tabs\)(?=\/|$)/, "");

  if (cleaned.startsWith("/#/")) {
    cleaned = cleaned.slice(2);
  }
  if (!cleaned.startsWith("/")) {
    cleaned = `/${cleaned}`;
  }

  return cleaned || "/";
};

function tabAbsolutePath(tab: Tab): string {
  const pathOnly = tab.path.split("?")[0];
  return normalizeBottomNavPath(`/${pathOnly}`);
}

/**
 * 与 ngss-vue `shouldShowFooter` 对齐：
 * 1）`ALWAYS_FOOTER_PATHS` 根路径全等；2）否则与个性化 Tab 的 path 全等（不做前缀匹配）。
 */
function computeShouldShowFooter(normalizedPath: string, tabs: Tabs): boolean {
  if (HIDE_FOOTER_PATHS.has(normalizedPath)) return false;
  if (ALWAYS_FOOTER_PATHS.has(normalizedPath)) return true;

  const pathForTabMatch = normalizedPath === "/" ? "/home" : normalizedPath;

  for (const tab of tabs) {
    if (pathForTabMatch === tabAbsolutePath(tab)) return true;
  }
  return false;
}

export function useBottomNavigation() {
  const toast = useToast();
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const currentPath = usePathname();
  const rawInsets = useSafeAreaInsets();
  const bottomInset = isWeb ? 0 : rawInsets.bottom;
  const footerHeight = NAV_BAR_HEIGHT + bottomInset;

  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const navigation = useSelector(selectBottomNavigation);
  const normalizedCurrentPath = normalizeBottomNavPath(currentPath || "");

  const tabs: Tabs = useMemo(() => {
    const isLogin = userInfo?.isLogin;
    let tabsCode = navigation
      ? isLogin
        ? navigation.AFTER_LOGIN.values
        : navigation.BEFORE_LOGIN.values
      : isLogin
        ? DEFAULT_AFTER_LOGIN_TABS
        : DEFAULT_BEFORE_LOGIN_TABS;

    const replace = navigation
      ? isLogin
        ? navigation.AFTER_LOGIN.replace
        : navigation.BEFORE_LOGIN.replace
      : undefined;

    tabsCode = resolveFooterMenuValues(tabsCode, replace, !isWeb);

    return processNavigation(tabsCode);
  }, [userInfo, navigation]);

  const isShow = useMemo(
    () => computeShouldShowFooter(normalizedCurrentPath, tabs),
    [normalizedCurrentPath, tabs],
  );

  const isTabActive = useCallback(
    (path: string) => {
      const normalizedTabPath = normalizeBottomNavPath(path.startsWith("/") ? path : `/${path}`);
      if (HOME_PATHS.has(normalizedTabPath)) {
        return HOME_PATHS.has(normalizedCurrentPath);
      }
      // 需要直接判断全部路径，不然像任务页面就会和活动页面同时选中
      return normalizedCurrentPath === normalizedTabPath;
    },
    [normalizedCurrentPath],
  );

  // 判断是否在首页
  const isOnHomePage = normalizedCurrentPath === "/home" || normalizedCurrentPath === "/";

  // 用 ref 持有易变值，使 onNavigate 引用保持稳定，避免每次导航重建回调
  const currentPathRef = useRef(currentPath);
  currentPathRef.current = currentPath;
  const isOnHomePageRef = useRef(isOnHomePage);
  isOnHomePageRef.current = isOnHomePage;
  const userIsLoginRef = useRef(userInfo?.isLogin);
  userIsLoginRef.current = userInfo?.isLogin;
  const isTestUserRef = useRef(userInfo?.isTestUser);
  isTestUserRef.current = userInfo?.isTestUser;
  // 处理app下载点击事件（稳定引用）
  const handleAppDownload = useCallback(() => {
    requestDownloadGuideOnNextHome();
    router.navigate("/home" as RelativePathString);
  }, [router]);

  const onNavigate = useCallback(
    function ({ path, code, requireAuth }: Tab) {
      // 如果是在首页点击app下载，则直接请求展示下载引导
      if (code === "APP_DOWNLOAD" && isOnHomePageRef.current) {
        requestShowDownloadGuideNow();
        return;
      }
      if (currentPathRef.current.endsWith(path)) return;
      // TODO 防抖
      if (code === "FREE_TRIAL") {
        toast.loading(true);
        guestRegister({})
          .then(async (res: any) => {
            if (res?.data?.data) {
              toast.success(t("login.trialRegistrationSuccessful"));
              dispatch(changeSessionState(res.data.data));
              router.navigate("/home" as RelativePathString);
            } else {
              toast.error(t(res?.data?.code));
            }
          })
          .finally(() => {
            toast.loading(false);
          });
      } else if (code === "APP_DOWNLOAD") {
        handleAppDownload();
      } else if (code === "REGISTER") {
        if (router.canDismiss()) router.dismissAll();
        router.push("/register" as RelativePathString);
      } else {

          if (requireAuth) {
            if(!userIsLoginRef.current){
              if (router.canDismiss()) router.dismissAll();
              router.push("/login" as RelativePathString);
            }else{
              if(isTestUserRef.current) {
                dispatch(changeIsShowTestUserPopup(true));
                return;
              }else{
                if (router.canDismiss()) {
                  router.dismissAll();
                }
                router.navigate(path as RelativePathString);
              }
            }
          } else {
            // 切换 tab 前先清空 root stack 中残留的子页面，防止 stack 堆积导致白屏
            if (router.canDismiss()) {
              router.dismissAll();
            }
            router.navigate(path as RelativePathString);
          }
        
      }
    },
    [dispatch, router, toast, t, handleAppDownload],
  );

  return {
    tabs,
    isShow,
    footerHeight,
    currentPath,
    isTabActive,
    onNavigate,
  };
}
