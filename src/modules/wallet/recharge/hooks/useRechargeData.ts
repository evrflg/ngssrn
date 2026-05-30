import { getDepositPays } from "@/api";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useToast } from "@/components/common/toast";
import { bankDeposit, cryptDeposit, onlineDeposit } from "@/api/post/wallet";
import { DEPOSIT_TYPE } from "../../shared/constants";
import { checkUserPermission } from "../../shared/utils";
import { RechargeType } from "../../shared/types";

async function fetchDepositMethods() {
  const res = await getDepositPays();
  return res?.data?.data || [];
}

async function submitOnlineDeposit(params: {
  tunnelId: string;
  amount: number;
  joinGift: boolean;
  offerId?: string;
  tradePwd?: string;
}) {
  const result = await onlineDeposit(params);
  return result?.data;
}

async function submitBankDeposit(params: any) {
  const result = await bankDeposit(params);
  return result?.data;
}

async function submitCryptDeposit(params: any) {
  const result = await cryptDeposit(params);
  return result?.data;
}

export function useRechargeData() {
  const { t } = useTranslation();
  const toast = useToast();
  const userInfo = useSelector((state: RootState) => state?.user?.userInfo);
  const { offerId } = useLocalSearchParams<{ offerId?: string }>();

  const [rechargeTypes, setRechargeTypes] = useState<RechargeType[]>([]);
  const [baseIndex, setBaseIndex] = useState(0);
  const [currentPayIndex, setCurrentPayIndex] = useState(0);
  const [joinDepositGift, setJoinDepositGift] = useState(true);
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 切换大 Tab 时重置子状态
  useEffect(() => {
    setAmount("");
    setCurrentPayIndex(0);
    setRemark("");
  }, [baseIndex]);

  // 切换子 Tab 时重置金额
  useEffect(() => {
    setAmount("");
  }, [currentPayIndex]);

  const handleSetAmount = useCallback((val: string) => {
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setAmount(val);
    }
  }, []);

  const clearAmount = useCallback(() => setAmount(""), []);

  const canAccessChannel = useCallback(
    (degreeIds: string, groupIds: string) => {
      return checkUserPermission(
        degreeIds,
        groupIds,
        userInfo?.member?.degreeId,
        userInfo?.member?.groupId,
      );
    },
    [userInfo],
  );

  const loadDepositMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dynamicMethods = await fetchDepositMethods();
      const raw: RechargeType[] = [
        {
          id: "online",
          type: DEPOSIT_TYPE.ONLINE,
          name: "wallet.onlineRecharge",
          i18n: "wallet.recordList.onlineRecharge",
          icon: require("@/assets/images/wallet/onlineRecharge.png"),
          payList: (dynamicMethods.online || [])
            .filter((item: any) => item.tunnels)
            .map((pay: any) => ({ ...pay, _name: pay.payName, _icon: pay.payIcon })),
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

      // 权限过滤
      const withPermission = raw.map((item) => ({
        ...item,
        payList: item.payList.filter((pay: any) =>
          canAccessChannel(pay.degreeIds, pay.groupIds),
        ),
      }));

      setRechargeTypes(withPermission.filter((item) => item.payList.length > 0));
    } catch {
      setError(t("errMsg.browser.elseErr"));
    } finally {
      setIsLoading(false);
    }
  }, [canAccessChannel, t]);

  useEffect(() => {
    loadDepositMethods();
  }, [loadDepositMethods]);

  const currentRecharge = rechargeTypes[baseIndex];
  const currentPay = useMemo(
    () => currentRecharge?.payList[currentPayIndex],
    [currentRecharge, currentPayIndex],
  );
  const selectedTunnel = useMemo(() => (currentPay as any)?.tunnels?.[0] ?? null, [currentPay]);

  const submitRecharge = useCallback(
    async (tradePwd?: string, tunnelOverride?: any) => {
      const tunnel = tunnelOverride ?? selectedTunnel;
      const amountValue = parseFloat(amount ?? "0");
      const minValue = tunnel?.minLimitMoney ?? (currentPay as any)?.minMoney ?? 0;
      const maxValue = tunnel?.maxLimitMoney ?? (currentPay as any)?.maxMoney ?? 999999;

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
        let result: any;

        if (currentRecharge?.id === "online") {
          const onlineResult = await submitOnlineDeposit({
            tunnelId: (currentPay as any)?.tunnels[0]?.id,
            amount: Number(amount ?? 0),
            joinGift: joinDepositGift,
            offerId: offerId as string | undefined,
            tradePwd,
          });
          result = onlineResult;
        } else if (currentRecharge?.id === "bank") {
          result = await submitBankDeposit({
            offerId,
            bankAddress: (currentPay as any)?.bankAddress,
            bankCard: (currentPay as any)?.bankCard,
            bankCode: (currentPay as any)?.bankCode,
            bankName: (currentPay as any)?.bankName,
            depositMoney: amount ?? 0,
            holderName: (currentPay as any)?.holderName,
            remark,
          });
        } else if (currentRecharge?.id === "usdt") {
          result = await submitCryptDeposit({
            offerId,
            coinAddress: (currentPay as any)?.coinAddress,
            coinCode: (currentPay as any)?.coinCode,
            coinName: (currentPay as any)?.coinName,
            depositNum: Number(amount),
            remark,
          });
        }

        const { msg, data, code } = result || {};
        if (data) {
          toast.success(msg || t("common.operationSuccess"));
        } else {
          toast.error(t(String(code)));
        }

        return result;
      } catch {
        setError(t("errMsg.browser.elseErr"));
        throw new Error(t("errMsg.browser.elseErr"));
      } finally {
        setIsLoading(false);
      }
    },
    [amount, remark, currentRecharge, currentPay, selectedTunnel, joinDepositGift, offerId, t, toast],
  );

  return {
    rechargeTypes,
    baseIndex,
    setBaseIndex,
    currentPayIndex,
    setCurrentPayIndex,
    joinDepositGift,
    setJoinDepositGift,
    amount,
    setAmount,
    remark,
    setRemark,
    isLoading,
    error,
    currentRecharge,
    currentPay,
    selectedTunnel,
    handleSetAmount,
    clearAmount,
    submitRecharge,
    loadDepositMethods,
  };
}
