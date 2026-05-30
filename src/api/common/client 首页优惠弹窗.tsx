import axios from "axios";
import patch from "../PatchVersion";
import { Platform, DeviceEventEmitter } from "react-native";
import { Loading } from "@/utils/Util";
import { router, Href } from "expo-router";
import { store as expoRouterStore } from "expo-router/build/global-state/router-store";
import { getStoreJson, setStorage, getSessionCookie, getStorage } from "@/utils/storage";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/lang/language";
import getMessageByCode from "./errorCode";

const isWeb = Platform.OS === "web";

// 未登录不自动跳转 index 的api集合
const canNoLoginApi = [
  "/app-api/activity/community/turntable/open",
  "/app-api/activity/community/redPacketRain/open"
];

// 获取客户端类型（android apk 传4，ios app 传 5，pwa 传6，h5传 3）
const clientType = isWeb ? 3 : Platform.OS === "android" ? 4 : Platform.OS === "ios" ? 5 : 6;

// 网站维护次数，只执行一次
var goMaintenTime = 0;

const MAINTENANCE_HREF = "/common/maintenance";

function getCurrentRoutePath(): string {
  try {
    const p = expoRouterStore.routeInfoSnapshot()?.pathname;
    if (p) return p;
  } catch {
    // store 未就绪时走下方兜底
  }
  if (isWeb && typeof window !== "undefined") {
    const { pathname = "", hash = "" } = window.location;
    const hashPath = hash.replace(/^#/, "").split("?")[0];
    if (hashPath.startsWith("/")) return hashPath;
    return (pathname || "").split("?")[0];
  }
  return "";
}

function isOnMaintenanceRoute(): boolean {
  const path = getCurrentRoutePath();
  return (
    path === MAINTENANCE_HREF || path.startsWith(`${MAINTENANCE_HREF}/`)
  );
}

function navigateToMaintenanceIfNeeded() {
  if (isOnMaintenanceRoute()) return;
  router.push(MAINTENANCE_HREF as Href);
}

/** 被挤下线 / 登录失效后回首页：防抖，避免多请求同时触发多次 replace 导致 Android 偶发白屏 */
const KICKOFF_REPLACE_HOME_DEBOUNCE_MS = 1200;
let kickoffReplaceHomeUntil = 0;

export function replaceHomeAfterAuthLoss() {
  if (isWeb && typeof window !== "undefined") {
    const p = (window.location.pathname || "").split("?")[0];
    if (p === "/home" || p.endsWith("/home")) {
      return;
    }
  }
  const now = Date.now();
  if (now < kickoffReplaceHomeUntil) return;
  kickoffReplaceHomeUntil = now + KICKOFF_REPLACE_HOME_DEBOUNCE_MS;
  try {
    router.replace("/home" as Href);
  } catch {
    kickoffReplaceHomeUntil = 0;
  }
}

export const setBaseUrl = (line: string) => {
  client.defaults.baseURL = line; // 更新 baseURL
};

const baseUrl = patch.DOMAIN_URL;
export let configsession: string = "";
export const setConfigSession = (str: string) => {
  if (!str.startsWith("Bearer ") && str != "") {
    str = "Bearer " + str;
  }
  configsession = str;
};
export let language = DEFAULT_LANGUAGE;
export let setApiLanguage = (lang: string) => {
  language = lang;
};
export let allParams = {};
export let setAllParams = (params: any) => {
  allParams = params;
};

export const client = axios.create({
  withCredentials: true, // 是否携带cookie信息
  baseURL: baseUrl,
  headers: {
    "Client-Type": clientType,
  }, //设置post请求头
});

// 初始化全局 language：优先使用本地缓存的语言 code（ngss-rn-language）
getStorage("ngss-rn-language")
  .then((code) => {
    if (!code) return;
    if (SUPPORTED_LANGUAGES.includes(code)) language = code;
  })
  .catch(() => {
    language = DEFAULT_LANGUAGE;
  });

// 初始化时优先从 Web Cookie 读取（用于 Safari 与 PWA 共享登录态）
if (isWeb) {
  const cookieSession: any = getSessionCookie();
  if (cookieSession?.accessToken) {
    configsession = "Bearer " + cookieSession.accessToken;
  }
}

getStoreJson("session").then((res: any) => {
  if (res && res?.accessToken && res?.accessToken !== "") {
    configsession = "Bearer " + res?.accessToken;
  }
});

//请求拦截器
client.interceptors.request.use(
  (config: any) => {
    config.customData = {};
    const method = config.method?.toUpperCase();
    if (method === "GET") {
      config.headers["Cache-Control"] = "no-cache";
      config.headers["Pragma"] = "no-cache";
    }
    if (!isWeb) {
      const domain = patch.DOMAIN_URL;
      config.headers["Referer"] = domain;
      config.headers["event-extra"] = JSON.stringify(allParams);
    }

    if (
      config.url?.includes("/app-api/system/dict-data/type") ||
      config.url?.includes("/app-api/tenant/config-info/getByKeys") ||
      config.url?.includes("/app-api/tenant/config-info/getTenantInfo")
    ) {
      config.headers["grant-type"] = 0; // 总控 专用0
    } else {
      config.headers["grant-type"] = 2;
    }
    if (configsession) {
      config.headers["Authorization"] = configsession;
    }
    config.headers["Accept-Language"] = language;
    // 处理 FormData
    if (config.data instanceof URLSearchParams) {
      const hideToast = config.data.get("hideToast");
      const toastDuration = config.data.get("toastDuration");

      if (toastDuration) {
        // 弹窗持续时间
        config.customData.toastDuration = toastDuration;
      }
      if (hideToast) {
        config.customData.hideToast = hideToast;
      }
    } else if (config.data instanceof FormData) {
      // For file uploads, set proper content type
      config.headers["Content-Type"] = "multipart/form-data";
    }
    if (config.url?.includes('/users/auth/register')) {
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
client.interceptors.response.use(
  (response) => {
    Loading.hide();

    if (response.config.url?.includes('/check-bonus?bonusType=0')) {
      response.data = {
        "code": 0,
        "data": {
          "depositAmount": "111.00",
          "bonusMultipleStatus": "0",
          "multipleType": 0,
          "multiple": 2.00,
          "multipleDepositModuleId": null,
          "id": "2032447953252225026",
          "maxDepositAmount": null
        },
        "msg": ""
      }
      // console.log(11, "/check-bonus?bonusType=0", response.data);
    }
    if (response.config.url?.includes('/check-bonus?bonusType=1')) {
      response.data = {
        "code": 0,
        "data": {
          "depositAmount": "111.00",
          "bonusMultipleStatus": "0",
          "multipleType": 0,
          "multiple": 2.00,
          "multipleDepositModuleId": null,
          "id": "2032447953252225026",
          "maxDepositAmount": null
        },
        "msg": ""
      }
      // console.log(33, "/check-bonus?bonusType=1", response.data);
    }
    if (response.config.url?.includes('/finance/manual/offer/claim')) {
      response.data = { "code": 0, "data": true, "msg": "" }
      // console.log(22, "offer/claim", response.data);
    }

    let { data = {}, config } = response;
    let dataParams: any = {};
    if (config.data) {
      const params = new URLSearchParams(config.data);
      dataParams = Object.fromEntries(params.entries());
    }

    const code = data.repCode || data.code;
    const msg = getMessageByCode(code) || data.msg || data.repMsg;

    const isBizSuccess =
      code === undefined ||
      code === null ||
      code === 0 ||
      code === "0" ||
      code === "0000";

    if (code === 401) {
      DeviceEventEmitter.emit("isUserLogout", false);
    }

    // 跳转维护页面
    // 注意：用户信息接口（users/info/userInfo）在运维页会轮询，用于判断是否恢复；
    // 该接口若触发跳转会造成循环，因此这里排除。
    if ([1002015001, 902].includes(code)) {
      if (!config.url?.includes("/information/banner/list")) {
        navigateToMaintenanceIfNeeded();
      }
    }

    if (
      typeof data?.msg == "string" &&
      data?.msg?.includes("maintenance_exception")
    ) {
      const detail = data.msg
        .split(",系统追踪码:")[0]
        .replace("maintenance_exception:", "");
      setStorage("maintenanceDetail", detail);
    } else {
      // 如果用户信息接口请求成功，重置网站维护次数
      if (config.url?.includes("accInfo.do")) {
        goMaintenTime = 0;
      }

      // 未登录自动跳首页的接口过滤

      if (config.url) {
        // 可以在这里处理成功响应
        if (data.success === false && data.msg) {
          if (data.isLogin === false) {
            // 充值、提现、充值记录、首页 不提示，为了做纸飞机快捷进入项目
            //之所以样处理是因为相同状态有多个接口满足条件这里只需要弹被挤出的状态如果要彻底解决需要后台提供不同的返回状态来做区分  --！
            if (data.msg?.length > 25) {
              DeviceEventEmitter.emit("showNotLoginErrMsg", { msg: data.msg });
            }
            if (!canNoLoginApi.includes(config.url)) {
              replaceHomeAfterAuthLoss();
            }
          }
        }
      }
    }

    return response;
  },
  (error) => {
    Loading.hide();
    let message = error?.message;
    let status = error?.response?.status;

    if (message) {
      DeviceEventEmitter.emit("showErrMsg", { msg: message, status: status });
      return { data: { success: false, msg: message } };
    } else {
      // 在这里处理错误响应
      return Promise.reject(error);
    }
  }
);
