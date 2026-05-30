import { getBatchDictData, getUserTypeDictData } from "@/api"
import i18n from "@/lang/i18n"
import { TASK_DICT_MAP, TASKS_TO_GO } from "@/types/mission"

export interface RewardRule {
  id?: string
  taskId?: string
  rewardType?: number
  maxStepValue?: string | number // 累计金额 or 累计人数 (requirement threshold)
  rewardAmount?: number | null // 奖金 (can be null)
  minRewardAmount?: number // 最小奖金
  maxRewardAmount?: number // 最大奖金
  engagementValue?: number // 活跃度 (engagement/activity value)
  createTime?: number
}

export interface MissionProgress {
  category: MissionCategory
  current: number
  total: number
}

export type MissionCategory = "all" | "newUserBenefits" | "dailyMissions" | "weeklyMissions";

export interface MissionDetails {
  supportedRechargeMethods?: string[]
  requiredRechargeAmount?: number
  supportedGames?: string[]
  description?: string
  additionalInfo?: string[]
}

export interface Mission {
  id: string
  type: MissionType
  title: string
  description: string
  status: MissionStatus
  rewardAmount: string // Keep as string to preserve all values (e.g., "5.00/7.00/1.00/3.00")
  image?: string
  bannerColor: string
  category: MissionCategory
  progress?: {
    current: number
    total: number
  }
  details?: MissionDetails
  supportedGames?: string[]
  supportedRechargeMethods?: string[]
  requiredAmount?: number
  isExpandable?: boolean
  isExpanded?: boolean
  platformJson?: string | any[] | Record<string, any> // Can be JSON string, array, or object with platform information
  chargeType?: string | any[] | Record<string, any> // Recharge method codes (similar to platformJson)
  taskTarget?: number // Task target type from API - task_general_target dict (1-累计充值 2-累计有效投注 3-单笔充值 4-单笔有效投注 5-单局盈利 6-单局亏损 7-累计盈利 8-累计亏损)
  taskType?: number // Task type: 0-新人福利任务 1-每日任务 2-每周任务
  newArrivalTaskType?: number // For taskType=0 newbie tasks: 1-下载APP 2-注册账号 3-首次绑卡 4-首次充值 etc.
  rewardRules?: RewardRule[] // 奖励列表 from API
}

export type MissionType =
  | 'accountRegistration'
  | 'firstTimeBankCard'
  | 'firstTimeWithdrawal'
  | 'firstTimeAppInstall'
  | 'cumulativeRecharge'
  | 'singleRecharge'
  | 'cumulativeWager'
  | 'singleGameProfit'
  | 'singleGameLoss'
  | 'cumulativeProfit'
  | 'cumulativeLoss'
  | 'inviteFriends'
  | 'dailyLogin'
  | 'weeklyRecharge'
  | 'addFriends'

export type MissionStatus = 'inProgress' | 'completed' | 'locked'

export interface TaskRecord {
  id: string
  taskType: number // 1-新人福利任务 2-每日任务 3-周任务 4-连续登录任务 5-月任务
  newArrivalTaskType?: number // For taskType=1: 1-首次下载APP 2-注册账号 3-首次绑卡 4-设置密码 5-设置生日 7-首次提现
  taskTarget?: number // task_general_target dict (1-累计充值 2-累计有效投注 3-单笔充值 4-单笔有效投注 5-单局盈利 6-单局亏损 7-累计盈利 8-累计亏损) or task_newbie_target dict (4-首次充值)
  rewardAmount: string // API returns string like "50.00/100.00" or "20.00"
  ruleDesc?: string // Task description/rule
  executeStatus: number // 0-进行中 1-已完成 2-已锁定
  status?: number // Display status value (0-开启, 1-关闭) from common_status dictionary
  rewardType?: number
  claimSupported?: string
  degreeIds?: string
  createTime?: string
  updateTime?: string
  sort?: number
  platformJson?: string | any[] | Record<string, any> // Can be JSON string, array, or object with platform information
  chargeType?: string | any[] | Record<string, any> // Recharge method codes (similar to platformJson)
  rewardRules?: RewardRule[] // 奖励列表 from API
  // Additional fields that might be needed
  taskName?: string
  taskDescription?: string
  progress?: {
    current: number
    total: number
  }
  bannerColor?: string
  image?: string
  details?: TaskDetails
  supportedGames?: string[]
  supportedRechargeMethods?: string[]
  requiredAmount?: number
  isExpandable?: boolean
}

export interface TaskDetails {
  supportedRechargeMethods?: string[]
  requiredRechargeAmount?: number
  supportedGames?: string[]
  description?: string
  additionalInfo?: string[]
}

export const getDictType = (taskType: number): string => {
  const dictTypeMap: Record<number, string> = {
    0: 'task_newbie_target',
    1: 'task_general_target',
    2: 'task_general_target'
  }
  return dictTypeMap[taskType] || 'task_general_target'
}


// Dictionary cache
const dictCache: Record<string, any[]> = {}
// Dictionary loading promises to prevent duplicate requests
const dictLoadingPromises: Record<string, Promise<any[]> | undefined> = {}
// Batch dictionary cache
const batchDictCache: Record<string, any> = {}

// Track cache language to avoid returning stale localized labels after language switch
let dictCacheLanguage: string | null = null

const ensureDictCacheLanguage = () => {
  const currentLanguage = String(i18n.language || "")
  if (dictCacheLanguage === null) {
    dictCacheLanguage = currentLanguage
    return
  }
  if (dictCacheLanguage !== currentLanguage) {
    Object.keys(dictCache).forEach((k) => delete dictCache[k])
    Object.keys(batchDictCache).forEach((k) => delete batchDictCache[k])
    Object.keys(dictLoadingPromises).forEach((k) => delete dictLoadingPromises[k])
    dictCacheLanguage = currentLanguage
  }
}

// Fetch and cache dictionary data with request deduplication
export const fetchDictData = async (dictType: string) => {
  ensureDictCacheLanguage()
  // Return cached data if available
  if (Object.prototype.hasOwnProperty.call(dictCache, dictType)) {
    return dictCache[dictType]
  }

  // If a request is already in progress, wait for it
  if (dictLoadingPromises[dictType]) {
    return dictLoadingPromises[dictType]
  }

  // Create new request promise
  dictLoadingPromises[dictType] = (async () => {
    try {
      const response = await getUserTypeDictData(dictType)
      const payload = response.data?.data
      const dictData = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.[dictType])
          ? payload[dictType]
          : []
      dictCache[dictType] = dictData
      return dictData
    } catch (error) {
      console.error('[fetchDictData] Error fetching dictionary:', dictType, error)
      return []
    } finally {
      // Clean up the loading promise
      delete dictLoadingPromises[dictType]
    }
  })()

  return dictLoadingPromises[dictType]
}

// Fetch multiple dictionaries in one batch request
export const fetchBatchDictData = async (dictTypes: string[]): Promise<Record<string, any[]>> => {
  ensureDictCacheLanguage()
  const typesKey = dictTypes.sort().join(',')

  // Return cached data if available
  if (batchDictCache[typesKey]) {
    return batchDictCache[typesKey]
  }

  try {
    const response = await getBatchDictData(dictTypes.join(','))
    const batchData = response.data?.data || {}

    // Cache individual dictionaries and batch result
    Object.entries(batchData).forEach(([type, data]) => {
      dictCache[type] = data as any[]
    })

    batchDictCache[typesKey] = batchData
    return batchData
  } catch {
    return {}
  }
}

// Transform API response to Mission format
export const transformTaskToMission = async (task: TaskRecord): Promise<Mission> => {
  const missionTypeMap: Record<number, string> = {
    1: 'newUserBenefits',
    2: 'dailyMissions',
    3: 'weeklyMissions',
    4: 'consecutiveLogin',
    5: 'monthlyMissions'
  }

  const statusMap: Record<number, string> = {
    0: 'inProgress',
    1: 'completed',
    2: 'locked'
  }

  const bannerColors = ['green', 'orange', 'red', 'blue']
  const colorIndex = parseInt(task.id) % bannerColors.length

  // Keep reward amount as string to preserve all values (e.g., "5.00/7.00/1.00/3.00")
  // The MissionCard component will extract the maximum value for display
  const parseRewardAmount = (rewardStr: string): string => {
    return rewardStr || '0'
  }

  // Generate task name based on type if not provided
  const getTaskName = (type: number, ruleDesc?: string): string => {
    const taskNames: Record<number, string> = {
      1: '新人福利任务',
      2: '每日任务',
      3: '周任务',
      4: '连续登录任务',
      5: '月任务'
    }
    return taskNames[type] || ruleDesc || '任务'
  }

  // Fetch task name from dictionary if taskTarget exists (for title)
  let dictTaskName: string | null = null
  if (task.taskTarget !== undefined && task.taskTarget !== null) {
    dictTaskName = await getTaskNameFromDict(task.taskType, task.taskTarget)
  }

  // Fetch task type name from task_type dictionary (for banner)
  const dictTaskTypeName = await getTaskTypeNameFromDict(task.taskType)

  // Fetch common status from common_status dictionary (for display below banner)
  let dictCommonStatus: string | null = null
  if (task.status !== undefined && task.status !== null) {
    dictCommonStatus = await getCommonStatusFromDict(task.status)
  }

  const transformed = {
    id: task.id,
    type: getTaskName(task.taskType, task.ruleDesc).toLowerCase().replace(/\s+/g, '') as any,
    title: dictTaskName || task.taskName || getTaskName(task.taskType, task.ruleDesc),
    description: task.taskDescription || task.ruleDesc || '',
    status: statusMap[task.executeStatus] as any,
    rewardAmount: parseRewardAmount(task.rewardAmount),
    bannerColor: task.bannerColor || bannerColors[colorIndex],
    category: missionTypeMap[task.taskType] as MissionCategory,
    progress: task.progress,
    details: task.details,
    supportedGames: task.supportedGames,
    supportedRechargeMethods: task.supportedRechargeMethods,
    requiredAmount: task.requiredAmount,
    isExpandable: task.isExpandable !== false,
    image: task.image,
    platformJson: task.platformJson, // Platform information for supported games
    chargeType: task.chargeType, // Recharge method codes
    taskTarget: task.taskTarget, // Task target type (1-累计充值 2-累计有效投注 etc.)
    rewardRules: task.rewardRules, // 奖励列表 from API
    // Preserve raw API fields for banner title
    taskType: task.taskType,
    newArrivalTaskType: task.newArrivalTaskType,
    dictTaskTypeName: dictTaskTypeName, // Store task type name for banner title (from task_type dictionary)
    dictCommonStatus: dictCommonStatus // Store common status for display (from common_status dictionary)
  } as any

  return transformed
}

// Get task name from dictionary by matching taskTarget value
export const getTaskNameFromDict = async (taskType: number, taskTarget: number): Promise<string | null> => {
  const dictType = getDictType(taskType)
  const dictData = await fetchDictData(dictType)

  // Find entry where value matches taskTarget
  const entry = dictData.find((item: any) => parseInt(item.value) === taskTarget)

  if (entry) {
    return entry.label
  }

  return null
}

// Get task type name from task_type dictionary (for banner titles)
export const getTaskTypeNameFromDict = async (taskType: number): Promise<string | null> => {
  const dictData = await fetchDictData('task_type')

  // Find entry where value matches taskType
  const entry = dictData.find((item: any) => parseInt(item.value) === taskType)

  if (entry) {
    return entry.label
  }

  return null
}

// Get common status name from common_status dictionary (for mission card display)
export const getCommonStatusFromDict = async (commonStatus: number): Promise<string | null> => {
  const dictData = await fetchDictData('common_status')

  // Find entry where value matches commonStatus
  const entry = dictData.find((item: any) => parseInt(item.value) === commonStatus)

  if (entry) {
    return entry.label
  }

  return null
}

// Check if should show recharge methods section (only for recharge tasks with chargeType)
export const shouldShowRechargeMethods = (mission: Mission): boolean => {
  const taskType = mission.taskType
  const taskTarget = mission.taskTarget
  const newArrivalTaskType = mission.newArrivalTaskType
  const chargeType = mission.chargeType

  // Check if this is a recharge task
  let isRechargeTask = false

  // For newbie tasks (taskType === 0), check newArrivalTaskType
  if (taskType === 0) {
    // task_newbie_target dictionary: 4-首次充值
    isRechargeTask = newArrivalTaskType === 4
  } else if (taskTarget !== undefined && taskTarget !== null) {
    // For general tasks (taskType !== 0), check taskTarget
    // task_general_target dictionary: 0-累计充值, 1-单笔充值
    const rechargeTaskTargets = [0, 1]
    isRechargeTask = rechargeTaskTargets.includes(taskTarget)
  }

  if (!isRechargeTask) {
    return false
  }

  // Must have chargeType
  if (!chargeType) {
    return false
  }

  try {
    if (Array.isArray(chargeType)) {
      return chargeType.length > 0
    } else if (typeof chargeType === 'object' && chargeType !== null) {
      return Object.keys(chargeType).length > 0
    } else if (typeof chargeType === 'string') {
      const trimmed = chargeType.trim()
      if (trimmed === '' || trimmed === '{}' || trimmed === '[]') {
        return false
      }
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed.length > 0
        } else if (typeof parsed === 'object' && parsed !== null) {
          return Object.keys(parsed).length > 0
        }
      } catch {
        return trimmed.length > 0
      }
    }
  } catch (error) {
    console.error('[MissionCard] Error checking chargeType:', error)
  }

  return false
}

// Check if should show recharge button (based on taskTarget or newArrivalTaskType)
export const shouldShowRechargeButton = (mission: Mission): boolean => {
  const taskType = mission.taskType
  const taskTarget = mission.taskTarget
  const newArrivalTaskType = mission.newArrivalTaskType

  // For newbie tasks (taskType === 0), check newArrivalTaskType
  if (taskType === 0) {
    // task_newbie_target dictionary: 4-首次充值
    return newArrivalTaskType === 4
  }

  // For general tasks (taskType !== 0), check taskTarget
  if (taskTarget !== undefined && taskTarget !== null) {
    // task_general_target dictionary: 0-累计充值, 1-单笔充值
    const rechargeTaskTargets = [0, 1]
    return rechargeTaskTargets.includes(taskTarget)
  }

  return false
}

// Check if should show support game button (based on taskTarget AND platformJson)
export const shouldShowSupportGameButton = (mission: Mission): boolean => {
  const taskType = mission.taskType
  const taskTarget = mission.taskTarget
  const platformJson = mission.platformJson

  // Only for general tasks (taskType !== 0), not for newbie tasks
  if (taskType === 0 || taskTarget === undefined || taskTarget === null) {
    return false
  }

  // From task_general_target dictionary:
  // 2-累计有效投注 3-单笔有效投注 4-单局盈利 5-单局亏损 6-累计盈利 7-累计亏损
  const gameRelatedTaskTargets = [2, 3, 4, 5, 6, 7]

  // Must be game-related task
  if (!gameRelatedTaskTargets.includes(taskTarget)) {
    return false
  }

  // Must have valid platformJson
  if (!platformJson) {
    return false
  }

  try {
    if (Array.isArray(platformJson)) {
      return platformJson.length > 0
    } else if (typeof platformJson === 'object' && platformJson !== null) {
      return Object.keys(platformJson).length > 0
    } else if (typeof platformJson === 'string') {
      const trimmed = platformJson.trim()
      if (trimmed === '' || trimmed === '{}' || trimmed === '[]') {
        return false
      }
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed.length > 0
        } else if (typeof parsed === 'object' && parsed !== null) {
          return Object.keys(parsed).length > 0
        }
      } catch {
        return trimmed.length > 0
      }
    }
  } catch (error) {
    console.error('[MissionCard] Error checking platformJson for game support:', error)
  }

  return false
}

// Check if should show go and complete button (based on taskTarget or newArrivalTaskType)
export const shouldShowGoAndCompleteButton = (mission: Mission): boolean => {
  const taskType = mission.taskType
  if (taskType === undefined || taskType === null) {
    return false
  }
  const taskTarget = mission.taskTarget
  if (taskTarget === undefined || taskTarget === null) {
    return false
  }
  const taskDict = TASK_DICT_MAP[taskType][taskTarget]
  return TASKS_TO_GO.has(taskDict)
}
