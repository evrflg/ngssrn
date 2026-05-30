import { createThirdMember, loginThirdMember, queryThirdMember } from "@/api";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { openWindowWithURLFromServer } from "@/utils/utils";
import { showErrorAlert } from "@/utils/alertUtils";
import { InterConnectWallet } from "../../shared/types";

/**
 * 充值侧互通钱包：create / query / login 三个动作。
 * tunnelId 变化时自动拉取钱包信息。
 */
export function useInterConnectDeposit(tunnelId: string | undefined, enabled: boolean) {
  const { t } = useTranslation();
  const [wallet, setWallet] = useState<InterConnectWallet>({ address: "", balance: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const fetchedRef = useRef<Record<string, boolean>>({});

  const applyWalletData = (data: any) => {
    if (data?.walletAddress) {
      setWallet({
        address: data.walletAddress,
        balance: Number(data.balanceAmount ?? 0),
      });
    }
  };

  const fetchWalletInfo = useCallback(async () => {
    if (!tunnelId || !enabled) return;
    setIsRefreshing(true);
    try {
      if (fetchedRef.current[tunnelId]) {
        const { data } = await queryThirdMember({ tunnelId });
        applyWalletData(data?.data);
      } else {
        const { data } = await createThirdMember({ tunnelId });
        applyWalletData(data?.data);
        if (data?.data?.walletAddress) {
          fetchedRef.current[tunnelId] = true;
        }
      }
    } catch {
      // create 失败后尝试 query
      try {
        const { data } = await queryThirdMember({ tunnelId });
        applyWalletData(data?.data);
      } catch {}
    } finally {
      setIsRefreshing(false);
    }
  }, [tunnelId, enabled]);

  const refresh = useCallback(async () => {
    if (!tunnelId) return;
    setIsRefreshing(true);
    try {
      const { data } = await queryThirdMember({ tunnelId });
      applyWalletData(data?.data);
    } finally {
      setIsRefreshing(false);
    }
  }, [tunnelId]);

  const goToWallet = useCallback(() => {
    if (!tunnelId) return;
    setIsNavigating(true);
    openWindowWithURLFromServer({
      params: { tunnelId },
      request: loginThirdMember,
      urlKey: "payUrl",
      onFail: () => showErrorAlert(t("common.operationFailed")),
      onFinally: () => setIsNavigating(false),
    });
  }, [tunnelId, t]);

  // tunnelId 变化时自动加载
  useEffect(() => {
    if (enabled && tunnelId) {
      fetchWalletInfo();
    } else {
      setWallet({ address: "", balance: 0 });
    }
  }, [tunnelId, enabled]);

  return { wallet, isRefreshing, isNavigating, refresh, goToWallet, fetchWalletInfo };
}
