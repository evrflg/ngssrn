// ─────────────────────────────────────────────
// 银行卡 / 收款账户
// ─────────────────────────────────────────────

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
  selected?: boolean;
}

export interface AddBankParams {
  bankCode: string;
  bankExtraInfo?: string;
  bankName: string;
  cardNo: string;
  userName?: string;
  lastRealName?: string;
  lastCardNo?: string;
  addr?: string;
  pixType?: string;
}

export interface BankCard {
  id: number;
  memberId: number;
  username?: string;
  cardNo: string;
  realName?: string;
  bankCode?: string;
  bankAddress?: string;
  bankName?: string;
  remarks?: string;
  bankType?: number;
  status?: number;
  createTime?: string;
  selected?: boolean;
}

export interface UsdtCard {
  id: number;
  address?: string;
  username?: string;
  remarks?: string;
  typeCode?: string;
  status?: number;
  createTime?: string;
  selected?: boolean;
  realName?: string;
}

export interface PixCard {
  id: number;
  username?: string;
  realName?: string;
  remarks?: string;
  status?: number;
  ifsc?: string;
  typeCode?: string;
  pix?: string;
  cpf?: string;
  createTime?: string;
  selected?: boolean;
}

export interface ThirdWallet {
  id: number;
  realName?: string;
  username?: string;
  memberId?: number;
  remarks?: string;
  typeCode?: string;
  address?: string;
  status?: number;
  createTime?: string;
  selected?: boolean;
}

export type WithdrawBankItem = BankItem | BankCard | PixCard | ThirdWallet | UsdtCard;

// ─────────────────────────────────────────────
// 奖励
// ─────────────────────────────────────────────

export enum BonusType {
  Normal = 0,
  Multiplier = 1,
}

export interface Bonus {
  id: string;
  depositAmount: string;
  maxDepositAmount: string;
  multiple: number;
  multipleDepositModuleId?: number;
}

// ─────────────────────────────────────────────
// 充值
// ─────────────────────────────────────────────

export interface RechargePayItem {
  /** 在线支付通道 */
  tunnels?: Array<{
    id: string;
    recomMoneys?: string;
    minLimitMoney?: number;
    maxLimitMoney?: number;
    ossWallet?: number; // 1 = 互通钱包
    verifyTradePwd?: number; // 0 = 需要密码
    tunnelBadge?: string;
    remark?: string;
  }>;
  /** 银行转账 */
  bankCard?: string;
  bankAddress?: string;
  bankName?: string;
  holderName?: string;
  minMoney?: number;
  maxMoney?: number;
  remark?: string;
  /** USDT */
  coinAddress?: string;
  coinCode?: string;
  coinName?: string;
  depositRate?: string;
  minNum?: number;
  maxNum?: number;
  /** 通用 */
  _name?: string;
  _icon?: string;
  _code?: string;
  payBadge?: string;
  degreeIds?: string;
  groupIds?: string;
}

export interface RechargeType {
  id: "online" | "bank" | "usdt";
  type: number;
  name: string;
  i18n: string;
  icon: any;
  payList: RechargePayItem[];
}

// ─────────────────────────────────────────────
// 提现
// ─────────────────────────────────────────────

export interface WithdrawTab {
  id: string;
  tabId?: string;
  name: string;
  icon?: any;
  isHot?: boolean;
  badge?: string;
  payBadge?: string;
  payCode?: string;
  tunnelCode?: string;
  tunnels?: Array<{ tunnelBadge?: string }>;
  rankWithdrawLimit?: {
    minDrawMoney: number;
    maxDrawMoney: number;
  };
}

export interface WithdrawConfig {
  id?: string | number;
  iconUrl?: string;
  handleFee?: number;
  minDrawMoney?: number;
  maxDrawMoney?: number;
  cryptRate?: number;
  curBetNum?: number;
  drawNeedBetNum?: number;
  drawInterval?: number;
  drawTimes?: number;
  freeDrawTimes?: number;
  recomMoneys?: string;
  withdrawTips?: string;
  applyWhenUnhandleExist?: number; // 0=允许有待处理订单提现, 1=阻止
  tunnelCode?: string;
  bankInfo?: {
    receiptPwd?: string;
  };
  configData?: {
    strategy?: {
      feeType?: number;
      feeValue?: string | number;
      upperLimit?: string | number;
      lowerLimit?: string | number;
      drawNum?: number;
    };
    curWnum?: number;
  };
}

export interface InterConnectWallet {
  address: string;
  balance: number;
}

// ─────────────────────────────────────────────
// 服务费计算入参
// ─────────────────────────────────────────────

export interface ServiceFeeParams {
  withdrawAmount: string;
  configData?: WithdrawConfig["configData"];
}
