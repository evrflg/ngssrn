import { post, get } from "./use-client";
//公共
export const getConfigServer = (key: string) =>
  get("/api/app-api/tenant/config-info/getByKeys?keys=" + key); //获取配置项;
export const getAccInfoServer = (axiosConfig?: { silentErrorToast?: boolean }) =>
  get("/api/app-api/users/info/userInfo", undefined, axiosConfig);
export const getLanguageServer = (params: any) => get("/api/app-api/users/config/getTenantInfo", params);
export const getRefreshTokenServer = (params: any) =>
  post("/api/app-api/users/auth/refresh-token", params, true); //刷新token
export const getAppDownServer = (params: any) => get("/api/app-api/ops/app-down/get", params); //获取App信息

//首页
export const getBannerServer = () => get("/api/app-api/information/banner/list"); //轮播图
export const getWinsDataServer = (params: any) =>
  post("/api/app-api/game/bigWinnerRecently", params); //滚动栏
export const getAppDefault = () => get("/api/app-api/ops/app-config/get/default"); //app下载
export const getAppDownloadUrl = (params: any) =>
  get("/api/app-api/ops/front-domain/domain/get-download-page-domain", params); //app下载
export const getDownloadConfigServer = () => get("/api/app-api/ops/guide-install-config/valid"); //app下载
export const fetchChannelPageConfig = (cid: string) =>
  get("/api/app-api/ops/front-domain/channel/page/config", { cid }); //获取渠道页面配置

//首页游戏
export const getGameZoneDictServer = (params: any) =>
  get("/api/app-api/system/dict-data/type", params); //游戏列表
export const getGameListServer = (params: any) => get("/api/app-api/game/list", params); //游戏列表
export const getSecondaryGamesServer = (params: any) =>
  get("/api/app-api/game/gameZoneGames", params); //当前二级菜单游戏
export const getPartnerListServer = (params: any) => get("/api/app-api/game/partnerList", params); //合作商列表
export const getGameListByPartnersServer = (params: { partnerIds: string; size?: number }) =>
  get("/api/app-api/game/gameListByPartners", params); //按厂商批量获取游戏
export const jumpGames = (params: any) => post("/api/app-api/game/loginUrl", params); //获取三方跳转地址
export const getAutoExchangeServer = (params: any) => post("/api/app-api/game/quit", params); //额度自动转出
export const getMissionGameList = async (params: any) => get("/api/app-api/game/gameList", params); //游戏列表查询（所有游戏查询tab页）

export const getGameGroupsServer = (axiosConfig?: { silentErrorToast?: boolean }) =>
  get("/api/app-api/game/groups", undefined, axiosConfig);

//登录注册
export const getCode = (params: any) => post("/api/app-api/users/auth/captcha/get", params); //行为验证
export const reqCheck = (params: any) => post("/api/app-api/users/auth/captcha/check", params); //行为验证校验

export const toLoginServer = (params: any) => post("/api/app-api/users/auth/login", params); //登录
export const registerAll = (params: any, config?: any) =>
  post("/api/app-api/users/auth/register", params, false, null, config); //注册
export const logoutServer = (params: any) => post("/api/app-api/users/auth/logout", params); //退出登录
export const forgetPwd = (params: any) => post("/api/app-api/users/info/forget-pwd", params, true); // 忘记密码重置
export const guestRegister = (params: any) =>
  post("/api/app-api/users/auth/siwan-register", params); //试玩注册
export const getPublicizeListServer = () => get("/api/app-api/information/publicity/list"); //宣传
export const getAppPackageListServer = () => get("/api/app-api/ops/app-package/list");

export const appLogSubmitServer = (params: any) => post("/api/app-api/infra/app-log/submit"); //App日志上传

// 检查是否已绑定tg
export const checkTgBind = () => get("/api/app-api/information/tgbot/check-tg-bind");
// 获取绑定tg链接
export const bindTelegram = () => post("/api/app-api/information/tgbot/bind-link");

// 应用下载推送
export const appDownPush = (params: any) => post("/api/app-api/ops/app-down/push", params);
