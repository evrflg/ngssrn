import { NativeModules, Platform } from "react-native";
const appConfig = require("../../appConfig/config");

// 给本地开发 iframe 用
const webDomainUseApp = appConfig.DOMAIN_URL_IOS || appConfig.DOMAIN_URL_ANDROID;

const getDomain = () => {
  try {
    return NativeModules?.DomainModule?.domain_url;
  } catch (error) {
    console.error("[getDomain] 获取域名失败:", error);
  }
};

const webDomain = __DEV__ ? "http://localhost:3000/dev" : "";
const DOMAIN_URL = Platform.OS === "web" ? webDomain : getDomain();

const SSE_PATH = "/api/app-api/sse/connect/";
const sseOrigin = String(DOMAIN_URL ?? "").replace(/\/$/, "");
const SSE_URL = Platform.OS === "web" && __DEV__ ? `/dev${SSE_PATH}` : `${sseOrigin}${SSE_PATH}`;

export default {
  // JS_VERSION: JS_VERSION,
  // APP_CODE: APP_CODE,
  // MINI_VERSION: 1,//wap小版本
  DOMAIN_URL: DOMAIN_URL,
  SSE_URL,
  OUT_BASE_URL_1: "https://api.appdns11.com", //获取多条线路、取得外网ip的 base_url
  OUT_BASE_URL_2: "https://api.appdns12.com", //获取多条线路、取得外网ip的 base_url
  webDomainUseApp,
};
