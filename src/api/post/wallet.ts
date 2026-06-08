import { BonusType } from "../types/wallet";
import { get, post } from "./use-client";

const prefix = "/api/app-api";

export const bankDeposit = (params: any) => post(`${prefix}/finance/deposit/bank`, params); // 提交转账充值
export const onlineDeposit = (params: any) => post(`${prefix}/finance/deposit/online`, params); // 提交在线充值
export const cryptDeposit = (params: any) => post(`${prefix}/finance/deposit/crypt`, params); // 提交虚拟币充值

export const getWithdraws = (params: any) =>
  get(`${prefix}/finance/withdraw/ope/get-withdraws`, params); // 获取提款信息
export const queryWithdrawMember = () => get(`${prefix}/finance/withdraw/ope/query-member`); // 会员提现次数，用于首次提现引导
export const withdraw = (params: any) => post(`${prefix}/finance/withdraw/ope/withdraw`, params); // 提交提款
export const getMemberPixs = (params: any) => get(`${prefix}/users/bank/get-member-pixs`, params); // 获取银行卡信息
export const getMemberWallets = (params: any) =>
  get(`${prefix}/users/bank/get-member-wallets-by-tunnel`, params); // 获取钱包信息
export const getMemberBankType = (params: any) =>
  get(`${prefix}/system/dict-data/type?type=member_bank_type`, params); // 获取银行卡类型

export const getFinanceMoney = () => get(`${prefix}/finance/ope/money`); // 获取金额
export const reclaimGameBalances = () => post(`${prefix}/game/reclaimGameBalances`); // 回收游戏余额
export const getDepositPays = () => get(`${prefix}/finance/deposit/get-pays`); // 获取充值方式
export const getDepositBonus = (params: any) =>
  get(`${prefix}/finance/deposit/calc-deposit-bonus`, params); // 获取充值赠送金额
export const getBonusStatus = (params: any) =>
  get(`${prefix}/finance/deposit/get-deposit-Bonus-status`, params); // 检查是否有配置赠送金额

// NGSS
export const getDepositRecord = (params: any) =>
  get("/api/app-api/finance/deposit/get-deposit-record", params); //获取提款记录
export const getWithdrawRecord = (params: any) =>
  get("/api/app-api/finance/withdraw/ope/page", params); //获取提款记录
export const getWithdrawConfig = (params: any) =>
  post("/api/app-api/finance/withdraw/ope/get-withdraw-config", undefined, false, params);
export const getMemberBanks = (params: any) =>
  get("/api/app-api/users/bank/get-member-banks-by-tunnel", params); // 获取会员银行信息
export const getMemberCrypts = (params: any) =>
  get("/api/app-api/users/bank/get-member-crypts-by-tunnel", params); // 获得会员虚拟币银行列表（测试站：按 tunnel typeCode）
export const getMemberCryptsLegacy = (params: any) =>
  get("/api/app-api/users/bank/get-member-crypts", params); // 获得会员虚拟币银行列表（正式站：按 type）
export const createWithdraw = (params: any) =>
  post(`${prefix}/finance/withdraw/ope/create`, undefined, false, params); // 创建提款(提款資料輸入)
export const vertifyReceiptPwd = (params: any, axiosConfig?: any) =>
  get(`${prefix}/users/member/vertify-receipt-pwd`, params, axiosConfig); //验证提款密码是否正确
export const getBankListInfo = (params: any) =>
  get(`${prefix}/users/bank/get-bank-list-info-by-tunnel`, params); //获得会员银行信息列表
export const createMemberCrypt = (params: any) =>
  post(`${prefix}/users/bank/create-member-crypt`, params, true); //创建会员USDT
export const createMemberBanks = (params: any) =>
  post(`${prefix}/users/bank/create-member-banks`, params, true); //创建会员银行卡
export const createMemberThird = (params: any) =>
  post(`${prefix}/users/bank/create-member-wallet`, params, true); //创建会员三方钱包
export const createMemberPix = (params: any) =>
  post(`${prefix}/users/bank/create-member-pix`, params, true); //创建会员PIX
export const getWalletListInfo = (params: any) =>
  get(`${prefix}/users/bank/get-wallet-list-info-by-tunnel`, params); // 获得会员三方钱包信息列表
export const getOnlineInfo = () => get(`${prefix}/finance/deposit/get-online-pays`); //获取在线充值通道
// 检查会员是否有优惠可领, bonusType: 0 - 普通奖励， 1 - 加倍奖励
export const checkBonus = (type: BonusType) =>
  post(`${prefix}/finance/manual/offer/check-bonus?bonusType=${type}`);
// 检查会员是否有优惠可领 offerType 奖励类型 0--初始优惠 1--加倍优惠
export const getBonus = (offerId: string, offerType: number) =>
  post(`${prefix}/finance/manual/offer/claim?offerId=${offerId}&offerType=${offerType}`);

export const createThirdMember = (params: any) =>
  post(`${prefix}/finance/deposit/create-third-member`, params); //创建支付三会员
export const queryThirdMember = (params: any) =>
  post(`${prefix}/finance/deposit/query-third-member`, params); //查询支付三方会员
export const loginThirdMember = (params: any) =>
  post(`${prefix}/finance/deposit/login-third-member`, params); //登入支付三方会员
export const getDepositGiftMoney = (params: any) =>
  get(`${prefix}/finance/deposit/get-third-giveaway`, params); //获取在线充值赠送金额
