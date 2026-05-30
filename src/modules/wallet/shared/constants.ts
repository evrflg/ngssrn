// ─────────────────────────────────────────────
// 充值常量
// ─────────────────────────────────────────────

export enum DEPOSIT_TYPE {
  ONLINE = 1,
  BANk = 3,
  USDT = 4,
}

export enum DISPLAY_RANK {
  TOP = 1,
  SUB = 2,
}

// ─────────────────────────────────────────────
// 提现常量
// ─────────────────────────────────────────────

export enum WITHDRAW_TYPE {
  BANK = "bank",
  USDT = "USDT",
  SELF = "SELF",
  CRYPTO = "cryptocurrency",
  THIRD = "type-4",
  ONLINE = "onlinePayment",
}

/** 语义 id → API type 数字 */
export const withdrawTypeMap: Record<string, number> = {
  bank: 1,
  cryptocurrency: 2,
  onlinePayment: 3,
  "type-4": 4,
  "type-5": 5,
  "type-6": 6,
};

/** API type 数字 → 语义 id */
export const typeToTabId: Record<number, string> = {
  1: "bank",
  2: "cryptocurrency",
  3: "onlinePayment",
  4: "type-4",
  5: "type-5",
  6: "type-6",
};

/** type → 默认图标（require 懒加载） */
export const getDefaultWithdrawIcon = (numType: number) => {
  switch (numType) {
    case 1:
      return require("@/assets/images/wallet/bank-card.png");
    case 2:
      return require("@/assets/images/wallet/usdt.png");
    case 3:
    case 4:
      return require("@/assets/images/wallet/onlineRecharge.png");
    default:
      return require("@/assets/images/wallet/bank-card.png");
  }
};

/** 接口异常时的兜底提现通道 */
export const FALLBACK_WITHDRAW_RAW = [
  { type: 1, status: 0, sortNo: 0, name: "Bank" },
  { type: 2, status: 0, sortNo: 1, name: "USDT", badge: "hot" },
  { type: 3, status: 0, sortNo: 2, name: "PIX" },
  { type: 4, status: 0, sortNo: 3, name: "thirdPayment" },
];

/** bankCode 前缀：需要特殊处理的大类 */
export const SELF_BANK_CODE_RE = /^SELF/;
