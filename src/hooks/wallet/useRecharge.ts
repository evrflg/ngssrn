import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  fetchDepositMethods,
  submitOnlineDeposit,
  submitCryptDeposit,
  submitBankDeposit,
  DEPOSIT_TYPE,
} from "@/services/wallet/rechargeService";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/common/toast";
import { useLocalSearchParams } from "expo-router";

export const useRecharge = () => {
  // Redux状态
  const userInfo = useSelector((state: RootState) => state?.user?.userInfo);
  const toast = useToast();
  // 本地状态
  const [rechargeTypes, setRechargeTypes] = useState<any[]>([]); // 充值类型
  const [currentPayIndex, setCurrentPayIndex] = useState<any>(0);
  const [joinDepositGift, setJoinDepositGift] = useState<boolean>(true);
  const [baseIndex, setBaseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const { offerId } = useLocalSearchParams();

  useEffect(() => {
    setAmount("");
    setCurrentPayIndex(0);
    setRemark("");
  }, [baseIndex]);

  useEffect(() => {
    setAmount("");
  }, [currentPayIndex]);

  const handleSetAmount = (amount: string) => {
    if (amount === "" || /^\d*\.?\d*$/.test(amount)) {
      setAmount(amount);
    }
  };

  const checkUserPermission = (degreeIds: string, groupIds: string) => {
    const degreeId = userInfo?.member?.degreeId;
    const groupId = userInfo?.member?.groupId;

    if (!degreeIds && !groupIds) return true;

    const degreeIdStr = degreeId ? String(degreeId) : "";
    const groupIdStr = groupId ? String(groupId) : "";

    if (degreeIds && groupIds) {
      return degreeIds.includes(degreeIdStr) && groupIds.includes(groupIdStr);
    }

    if (degreeIds && !groupIds) {
      return degreeIds.includes(degreeIdStr);
    }

    if (!degreeIds && groupIds) {
      return groupIds.includes(groupIdStr);
    }

    return false;
  };

  // 加载充值方式
  const loadDepositMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dynamicMethods = await fetchDepositMethods();
      const rechargeTypeData: any = [
        {
          id: "online",
          type: DEPOSIT_TYPE.ONLINE,
          name: "wallet.onlineRecharge",
          i18n: "wallet.recordList.onlineRecharge",
          icon: require("@/assets/images/wallet/onlineRecharge.png"),
          // badge: '100%',
          payList:
            (dynamicMethods.online || [])
              .filter((item: any) => item.tunnels)
              .map((pay: any) => ({
                ...pay,
                _name: pay.payName,
                _icon: pay.payIcon,
              })) ?? [],
        },
        {
          id: "bank",
          type: DEPOSIT_TYPE.BANk,
          name: "wallet.transferRecharge",
          i18n: "wallet.recordList.transferRecharge",
          icon: require("@/assets/images/wallet/zhuanzhang.png"),
          payList: (dynamicMethods.bank || []).map((pay: any) => ({
            ...pay,
            _name: pay.bankName,
            _code: pay.bankCode,
          })),
        },
        {
          id: "usdt",
          type: DEPOSIT_TYPE.USDT,
          name: "USDT",
          i18n: "USDT",
          icon: require("@/assets/images/wallet/usdt.png"),
          payList: (dynamicMethods.crypt || []).map((pay: any) => ({
            ...pay,
            _name: pay.coinName,
            _code: pay.coinCode,
          })),
        },
      ];
      const filterPermission = rechargeTypeData.map((item: any) => {
        return {
          ...item,
          payList: item.payList.filter((pay: any) =>
            checkUserPermission(pay.degreeIds, pay.groupIds),
          ),
        };
      });
      const rechargeTypeDataTab = filterPermission.filter(
        (item: any) => item.payList.length > 0,
      );
      setRechargeTypes(rechargeTypeDataTab);
    } catch (err) {
      console.error("加载充值方式失败:", err);
      setError(t("errMsg.browser.elseErr"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 组件加载时获取充值方式
  useEffect(() => {
    loadDepositMethods();
  }, [loadDepositMethods]);

  // 清除自定义金额
  const clearQueryParams = useCallback(() => {
    setAmount("");
  }, []);

  const submitRecharge = async (tradePwd?: string, selectedTunnel?: any) => {
    const amountValue = parseFloat(amount ?? "0");
    const minValue = selectedTunnel?.minLimitMoney ?? selectedTunnel?.minMoney ?? 0;
    const maxValue = selectedTunnel?.maxLimitMoney ?? selectedTunnel?.maxMoney ?? 999999;
    if (amountValue < minValue || amountValue > maxValue) {
      const msg = t("wallet.recharge.depositOverRangeWithRange", {
        min: minValue,
        max: maxValue,
      });
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let result;
      const currentType = rechargeTypes[baseIndex];
      const currentPay = currentType?.payList[currentPayIndex];
      if (!currentType) return;

      if (currentType?.id === "online") {
        const params: any = {
          tunnelId: currentPay?.tunnels[0]?.id,
          amount: amount ?? 0,
          joinGift: joinDepositGift,
          offerId,
          tradePwd,
        };

        const onlineResult = await submitOnlineDeposit(params);
        result = onlineResult;
        if (onlineResult?.data?.payUrl) {
          Linking.openURL(onlineResult.data.payUrl);
        }
      }

      if (currentType?.id === "bank") {
        const params = {
          offerId,
          bankAddress: currentPay?.bankAddress,
          bankCard: currentPay?.bankCard,
          bankCode: currentPay?.bankCode,
          bankName: currentPay?.bankName,
          depositMoney: amount ?? 0,
          holderName: currentPay?.holderName,
          remark: remark,
        };
        result = await submitBankDeposit(params);
      }

      if (currentType?.id === "usdt") {
        const params = {
          offerId,
          coinAddress: currentPay?.coinAddress,
          coinCode: currentPay?.coinCode,
          coinName: currentPay?.coinName,
          depositNum: Number(amount),
          remark: remark,
        };

        result = await submitCryptDeposit(params);
      }

      const { msg, data, code } = result || {};

      if (data) {
        toast.success(msg || t("common.operationSuccess"));
      } else {
        toast.error(t(String(code)));
      }

      return result;
    } catch (err) {
      console.error("充值提交失败:", err);
      setError(t("errMsg.browser.elseErr"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // 状态
    rechargeTypes,
    baseIndex,
    isLoading,
    error,
    amount,
    remark,
    currentPayIndex,
    joinDepositGift,

    // 状态更新方法
    setAmount,
    setRemark,
    setCurrentPayIndex,
    setBaseIndex,
    setJoinDepositGift,

    // 业务逻辑方法
    handleSetAmount,
    clearQueryParams,
    submitRecharge,
    loadDepositMethods,
  };
};
