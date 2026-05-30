export enum PublicityType {
  HOME,
  DEPOSIT_TUTORIAL,
  LOGIN_REGISTER,
  FIRST_TIME_LOGIN,
  SECOND_TIME_LOGIN,
  THIRD_TIME_LOGIN,
}

export enum PublicityActionType {
  OPEN_LINK,
  DO_ACTIVITY,
  DO_TASK,
  OPEN_DEPOSIT_PAGE,
  OPEN_WITHDRAW_PAGE,
  OPEN_TELEGRAM,
}

export enum PublicityPopupFrequency {
  EVERY_LOGIN,
  DAILY,
  ONLY_ONCE,
  HIGH_FREQUENCY,
}

export interface Publicity {
  id: string
  language: string
  publicityType: PublicityType
  publicityPhoto?: string
  status: boolean
  startTime: number //timestamp in milliseconds
  endTime: number //timestamp in milliseconds
  redirectType: PublicityActionType
  /**
   * The target page or action for the publicity. It's depending on the actionType.
   * If actionType is:
   * - OPEN_LINK, this is a URL.
   * - DO_ACTIVITY, this is the activity ID.
   * - DO_TASK, this is the task ID.
   * - OPEN_DEPOSIT_PAGE, it'll be null
   * - OPEN_WITHDRAW_PAGE, it'll be null
   * - OPEN_TELEGRAM, it'll be null
   */
  targetPage: string | null
  popupFrequency: PublicityPopupFrequency
  sortNo: number
  photo?: string
  createTime: number //timestamp in milliseconds
  content: string
  todayDontDisplay: boolean
  isSeen: boolean
}