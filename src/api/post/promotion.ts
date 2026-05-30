import { get } from "./use-client";
import { type TimeRange, type TimeRangeUidParams } from '@/types'

export const getRebateConfig = () => get('/api/app-api/agent/rebate/config/page')
export const getPromotionInfo = () => get('/api/app-api/finance/direct/data/promo-info-overview')
export const getMyIncomeDataList = (params?: TimeRangeUidParams) =>
  get('/api/app-api/finance/direct/data/income', params)
export const getMyIncomeAggsData = () => get('/api/app-api/finance/direct/data/income-aggs-data')
export const getTotalIncome = getMyIncomeAggsData
export const getMyCommission = (queryTime?: TimeRange) =>
  get('/api/app-api/finance/direct/data/get-my-commission', { queryTime })
export const getAllData = (queryTime?: TimeRange) =>
  get('/api/app-api/finance/direct/data/direct-all-data', { queryTime })
export const getDirectChildBet = (queryTime?: TimeRange) => get('/api/app-api/finance/direct/data/bet', { queryTime });
export const getDirectChildInfo = (queryTime?: TimeRange) => get('/api/app-api/finance/direct/data/direct-members-info', { queryTime });
export const getDirectChildTotalInfo = () => get('/api/app-api/finance/direct/data/direct-members-info-aggs-data');
export const getDirectChildFinance = (queryTime?: TimeRange) => get('/api/app-api/finance/direct/data/finance', { queryTime });
export const getDirectChildData = (queryTime?: TimeRange) => get('/api/app-api/finance/direct/data/info', { queryTime });
export const getDirectMemberData = (queryTime?: TimeRange) => get('/api/app-api/finance/direct/data/direct-members-data', { queryTime });

export const getMyCommissionStats = (params?: TimeRangeUidParams) =>
  get('/api/app-api/finance/direct/data/get-my-commission-stats', params)
