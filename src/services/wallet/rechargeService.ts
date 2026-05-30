import {
  bankDeposit,
  cryptDeposit,
  getDepositPays,
  onlineDeposit,
  getDepositBonus
} from "@/api";


// 充值类型常量
export enum DEPOSIT_TYPE {
  ONLINE = 1, // 在线
  BANk = 3, // 转账
  USDT = 4, // USDT
}

export enum DISPLAY_RANK {
  TOP = 1, // 顶层
  SUB = 2, // 次层
}

// 获取充值方式列表
export const fetchDepositMethods = async () => {
  try {
    const res = await getDepositPays();
    return res?.data.data || [];
  } catch (error) {
    console.error("获取充值方式失败:", error);
    return [];
  }
};

// 获取充值赠送金额
export const fetchDepositBonus = async (params: any) => {
  try {
    const res = await getDepositBonus(params);
    return res?.data;
  } catch (error) {
    console.error("获取充值赠送金额失败:", error);
    throw error;
  }
};

// 在线充值
export const submitOnlineDeposit = async (params: any) => {
  try {
    const payload = {
      tunnelId: params?.tunnelId ?? "",
      amount: Number(params?.amount ?? 0),
      joinGift: Boolean(params?.joinGift),
      offerId: params?.offerId ?? "",
      tradePwd: params?.tradePwd ?? "",
    };
    const result = await onlineDeposit(payload);
    return result?.data;
  } catch (error) {
    console.error("在线充值失败:", error);
    throw error;
  }
};

// 转账充值
export const submitBankDeposit = async (params: any) => {
  try {
    const result = await bankDeposit(params);
    return result?.data;
  } catch (error) {
    console.error("转账充值失败:", error);
    throw error;
  }
};

// 虚拟币充值
export const submitCryptDeposit = async (params: any) => {
  try {
    const result = await cryptDeposit(params);
    return result?.data;
  } catch (error) {
    console.error("虚拟币充值失败:", error);
    throw error;
  }
};

// 预处理充值方式数据
export const processDepositData = (
  rechargeTypeData: any[],
  dynamicTypes: any[],
) => {
  const updatedData = [...rechargeTypeData];

  if (dynamicTypes && dynamicTypes.length > 0) {
    // 添加动态充值方式
    const mappedDynamicTypes = dynamicTypes.map((item: any) => {
      return {
        ...item,
        icon: item.icon || require("@/assets/images/wallet/rupeelink.png"),
        name: item.payAlias || item.payBankName,
      };
    });

    updatedData.push(...mappedDynamicTypes);
  }

  return organizeDepositList(updatedData);
};

function uniqueById(arr: any[]) {
  const map = new Map();
  arr.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

// 组织充值列表数据
export const organizeDepositList = (list: any[]) => {
  const online = list.filter(
    (item: any) =>
      item.depositType == DEPOSIT_TYPE.ONLINE &&
      item.displayRank !== DISPLAY_RANK.TOP,
  );

  const transfer = uniqueById(
    list.filter(
      (item: any) =>
        item.depositType == DEPOSIT_TYPE.BANK &&
        item.displayRank !== DISPLAY_RANK.TOP,
    ),
  );

  return list
    .map((item: any) => {
      if (item.type == DEPOSIT_TYPE.ONLINE) {
        item.payList = online;
      }
      if (item.type == DEPOSIT_TYPE.BANK) {
        item.payList = transfer;
      }
      return item;
    })
    .filter((item) => !item.payList || item?.payList.length !== 0);
};