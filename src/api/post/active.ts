import { post, get, put } from "./use-client";
import { getClientType } from "@/utils/utils";

export const getActivityCenterList = () => get('/api/app-api/activity/activity/get-list')//获取活动中心列表 无参

export const getActDetail = (params: any) => get('/api/app-api/activity/activity/get-activity', params);//获取活动中心中的活动详情
export const joinAct = (params: any) => put('/api/app-api/activity/activity/reward-claim', params)//参加活动中心中的活动(点领取或一键领取)
export const joinMysteryBonus = (params: any) => post('/api/app-api/activity/joinMysteryBonus', params)// 参加神秘彩金活动

export const getVips = (params: any) => get('/api/app-api/users/degree/get-vips', params)//VIP里面的等级升级列表接口
export const getUserDegree = () => get('/api/app-api/users/degree/get-degree-info') // 用户等级信息

export const getEffectiveGameType = () => get('/api/app-api/game/record/effectiveGameType')//获取返水类型

export const getGameType = (params: any) => get('/api/app-api/system/dict-data/type', params)//获取游戏类型
export const getActiveData = () => get('/api/app-api/activity/rebate/get-active')//获取玩家满足的返水策略
export const getWaitPickTasks = () => get('/api/app-api/activity/reward/get-unclaimed-rewards', { clientType: getClientType() })//待办列表
export const pickActs = () => put('/api/app-api/activity/reward/claim-all', { clientType: getClientType() })//一键领取待办奖金(put)
export const pickAct = (params: any) => put('/api/app-api/activity/reward/claim', { ...params, clientType: getClientType() })//领取待办奖金(put)

export const getPickTaskPage = (params: any) => get('/api/app-api/activity/reward/get-reward-records', params) //领取记录

export const getBettingAmountRecordType = (params: any) => get('/api/app-api/system/dict-data/type', params) //获取打码量记录类型 type=betnum_change_type
export const getBettingAmountRecordData = (params: any) => get('/api/app-api/finance/ope/betnum/history/page', params) //获取打码量记录数据

export const getTaskPageList = (params: any) => get(`/api/app-api/activity/task/page-list`, params) // 获取任务分页列表
export const getBatchDictData = (types: string) => get('/api/app-api/system/dict-data/types', { type: types }) //批量字典查询
export const getUserTypeDictData = (type: string) => get('/api/app-api/system/dict-data/types', { type }) //字典查询

//红包雨和转盘状态
export const TurntableAndRedPacketRainStatus = () => get('/api/app-api/activity/community/status')
// 打开转盘
export const openTurntable = () => put('/api/app-api/activity/community/turntable/open')
// 打开红包雨
export const openRedPacket = () => put('/api/app-api/activity/community/redPacketRain/open')

// 获取活动中心中的活动状态
export const getReminderCount = () => get('/api/app-api/activity/get-reminder-count')
