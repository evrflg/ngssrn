import {
  getBankListInfo
} from "@/api";

// 提现类型常量
export enum WITHDRAW_TYPE {
  BANK = "bank", // 银行卡
  USDT = "USDT", // USDT
  SELF = "SELF",
  CRYPTO = "cryptocurrency",
  THIRD = "type-4",
  ONLINE = "onlinePayment",
}

export const fetchBankListInfo = async (params: any) => {
  return await getBankListInfo(params)
    .then(({ data }) => {
      if (data.data) {
        const bankSelectOptions = data.data.map((bank: any) => ({
          name: bank.bankName || "",
          id: bank.bankCode || "",
          text: bank.bankName || "", // Keep for compatibility
          value: bank.bankCode || "",
          payCode: bank.payCode,
          tunnelTypeCode: bank.tunnelTypeCode,
        }));
        return { bankSelectOptions };
      } else {
        throw data.msg;
      }
    })
    .catch((error) => {
      console.error("获取银行列表失败:", error);
      return { bankSelectOptions: [] };
    });
};
