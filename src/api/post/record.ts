import { get } from "./use-client";

// ---下注记录 (新接口)
// 获取有效游戏类型
export const betRecordGetEffectiveGameType = (params: any) => get('/api/app-api/game/record/effectiveGameType', params)
// 获取游戏平台列表
export const betRecordGetPartnerList = (params: any) => get('/api/app-api/game/partnerList', params)
// 获取游戏记录分页数据
export const betRecordGetGameRecord = (params: any) => get('/api/app-api/game/record/page', params)

// --- 交易记录
// 交易记录筛选条件
export const serveGetMoneyChangeTypes = (params: any) => get('/api/app-api/system/dict-data/type', params)
// 交易记录
export const serveAccountChangeRecord = (params: any) => get('/api/app-api/finance/ope/change/history/page', params)

// 个人报表
export const serveGetPersonReport = (params: any) => get('/api/app-api/report/get-member-stats', params)
// 团队报表
export const serveGetTeamReport = (params: any) => get('/api/app-api/report/get-team-stats', params)

//打码量type
export const BetHisType = (params: any) => get('/api/app-api/system/dict-data/type', params)
