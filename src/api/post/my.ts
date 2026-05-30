import { post, get, put, deleteRequest } from "./use-client";

export const updateAccountInfo = (params: any) =>
  post("/api/app-api/users/info/update", null, true, params); //设置安全信息接口

export const updateLoginPwd = (params: any) =>
  post("/api/app-api/users/info/modify-pwd", null, true, params); //登录密码修改

export const initPickPwd = (params: any) =>
  post("/api/app-api/users/info/modify-pwd", null, false, params); //提款密码修改

export const messageList = (params: any) =>
  get("/api/app-api/information/notify-message/my-page", params); //站内信列表
export const getUnreadMessageCount = () =>
  get("/api/app-api/information/notify-message/get-unread-count"); //获取未读站内信数量
export const readMessage = (params: any) =>
  put("/api/app-api/information/notify-message/update-read", params); //站内信已读

export const getSiteInfoList = (params: any) =>
  get("/api/app-api/information/site-data/list", params); //站点资料管理
export const getBonusUnlockList = (params: any) =>
  get("/api/app-api/activity/bonus/unlock/get-list", params); //获取启用的彩金任务列表
export const bonusUnlockClaim = (id: string) =>
  put("/api/app-api/activity/bonus/unlock/claim", { id }); //领取彩金任务
export const getClaimedHistory = (params: any) =>
  get("/api/app-api/activity/bonus/unlock/get-claimed-history", params); //获取已领取彩金任务列表

// 代理管理
export const getTeamGameOverview = (params: any) =>
  get("/api/app-api/report/get-team-game-overview", params); //获取会员团队游戏信息
export const getUserTeamOverviewInfo = (params: any) =>
  get("/api/app-api/report/get-team-member-overview", params); //获取会员团队总览信息
export const getUserPageList = (params: any) =>
  get("/api/app-api/users/member/user-page", params); //获取用户列表
export const getInviteOverview = () =>
  get("/api/app-api/users/invite/overview"); //
export const getUserAwardList = (params: any) =>
  get("/api/app-api/finance/deposit/get-user-award-list", params); //获取会员存奖励记录列表
export const getOverview = () => get("/api/app-api/users/member/overview"); // 获取任务进度总览

// 建议反馈
export const getFeedback = (params: any) =>
  get("/api/app-api/information/feedback/my-page", params); //获取反馈记录列表
export const createFeedback = (params: any) =>
  post("/api/app-api/information/feedback/add", params); //建议反馈提交
export const getFeedbackMessage = (params: any) =>
  get("/api/app-api/information/feedbackmessage/my-page", params); //展示該筆反饋數據所有對話信息
export const replyFeedback = (params: any) =>
  post("/api/app-api/information/feedbackmessage/add", params); //回覆我的建議

//个人化设置
export const getPreviewPersonalization = (params: { randomCode: string }) =>
  get("/api/app-api/ops/personalization/preview/get", params); // 获取预览个性化配置（需要 randomCode 参数）

export const getPersonalization = () =>
  get("/api/app-api/ops/personalization/get"); // 获取个性化配置（不需要参数）

// Upload file and get the URL
export const uploadFile = (file: any) => {
  const formData = new FormData();
  formData.append("file", file);

  return post("/api/app-api/infra/file/uploadV2", formData, true);
};
//获取会员平台币余额
export const nbcBalance = () =>
  get(`/api/app-api/users/info/community/nbc/balance`);

//获取宝箱信息
export const getEngageBox = () => get("/api/app-api/users/engage/box/list");

//领取宝箱
export const pickEngageBox = (params: any) =>
  post("/api/app-api/users/engage/box/pick", params, true);

//活跃度宝箱领取记录
export const getEngageBoxRecord = (params: any) =>
  get("/api/app-api/users/engage/box/pick/record", params);

/** 活跃度变动明细（与 Vue activity/pointRecord 一致） */
export const getEngageRecordDetail = (params: any) =>
  get("/api/app-api/users/engagerecord/detail", params);

// 获得客服列表
export const getCustomerServiceList = () =>
  get("/api/app-api/tenant/customer-service/list");

// 标记所有站内信为已读
export const markAllAsRead = () =>
  put("/api/app-api/information/notify-message/update-all-read");

// 批量删除站内信
export const batchDeleteMessage = (params: any) =>
  deleteRequest("/api/app-api/information/notify-message/delete", params);
