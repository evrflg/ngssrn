

export interface BankItem {
  bankCode: string;
  bankName: string;
  cardNo: string;
  createTime: number;
  id: number;
  remarks: string;
  stationId: number;
  status: number;
  tutorialLink: string;
  uSDT: boolean;
  userId: number;
  username: string;
  realName?: string;
  selected?: boolean
}

export interface AddBankParams {
  bankCode: string;
  bankExtraInfo?: string;
  bankName: string;
  cardNo: string;
  userName?: string;
  lastRealName?: string;
  lastCardNo?: string;
  addr?: string; // 非PIX则是地址
  pixType?: string; // PIX
  payCode?: string;
  tunnelTypeCode?: string;
}

export interface BankCard {
  id: number
  memberId: number
  username?: string
  cardNo: string
  realName?: string
  bankCode?: string
  bankAddress?: string
  bankName?: string
  remarks?: string
  bankType?: number
  status?: number
  createTime?: string
  selected?: boolean
}

export interface UsdtCard {
  id: number
  address?: string
  username?: string
  remarks?: string
  typeCode?: string
  status?: number
  createTime?: string
  selected?: boolean
  realName?: string;
}
export interface PixCard {
  id: number
  username?: string
  realName?: string
  remarks?: string
  status?: number
  ifsc?: string
  typeCode?: string
  pix?: string
  cpf?: string
  createTime?: string
  selected?: boolean
}
export interface ThirdWallet {
  id: number;
  realName?: string;
  username?: string
  memberId?: number
  remarks?: string
  typeCode?: string
  address?: string
  status?: number
  createTime?: string
  selected?: boolean
}

export type WithdrawBankItem = BankItem | BankCard | PixCard | ThirdWallet | UsdtCard
export enum BonusType {
  Normal = 0,
  Multiplier = 1
}

export interface Bonus {
  id: string
  depositAmount: string // 所领奖金
  maxDepositAmount: string // 最高充值金额
  multiple: number // 加倍倍数
  multipleDepositModuleId?: number // 加倍模板（有则表示后台配置奖金模板）
}
