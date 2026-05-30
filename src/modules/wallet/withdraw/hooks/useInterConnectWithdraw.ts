import { createThirdMember, loginThirdMember, queryThirdMember } from "@/api";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { openWindowWithURLFromServer } from "@/utils/utils";
import { showErrorAlert } from "@/utils/alertUtils";
import { InterConnectWallet } from "../../shared/types";
import { isThirdInterConnectWithdrawType } from "../../shared/utils";

/**
 * 提现侧互通钱包：create / query / login。
 * withdrawType 为 5 或 6 时激活；切换 tab 后自动重置。
 */
export function useInterConnectWithdraw(
  withdrawType: number | undefined,
  baseIndex: number,
) {
  const { t } = useTranslation();
  const [wallet, setWallet] = useState<InterConnectWallet>({ address: "", balance: 0 });
  const [isNavigating, setIsNavigating] = useState(false);
  const fetchedTypesRef = useRef<Set<number>>(new Set());

  const enabled = isThirdInterConnectWithdrawType(withdrawType);

  const applyWalletData = (data: any) => {
    if (data?.walletAddress) {
      setWallet({
        address: data.walletAddress,
        balance: Number(data.balanceAmount ?? 0),
      });
    }
  };

  useEffect(() => {
    if (!enabled) {
      setWallet({ address: "", balance: 0 });
      return;
    }
    if (withdrawType == null) return;
    let cancelled = false;

    (async () => {
      const wt = withdrawType;
      try {
        if (fetchedTypesRef.current.has(wt)) {
          const { data } = await queryThirdMember({ withdrawType: wt });
          if (!cancelled) applyWalletData(data?.data);
        } else {
          const { data } = await createThirdMember({ withdrawType: wt });
          if (!cancelled && data?.data?.walletAddress) {
            fetchedTypesRef.current.add(wt);
            applyWalletData(data.data);
          }
        }
      } catch {
        try {
          const { data } = await queryThirdMember({ withdrawType: wt });
          if (!cancelled) applyWalletData(data?.data);
        } catch {}
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, withdrawType, baseIndex]);

  const refresh = useCallback(async () => {
    if (withdrawType == null || !enabled) return;
    const { data } = await queryThirdMember({ withdrawType });
    applyWalletData(data?.data);
  }, [withdrawType, enabled]);

  const goToWallet = useCallback(() => {
    if (withdrawType == null || !enabled) return;
    setIsNavigating(true);
    openWindowWithURLFromServer({
      params: { withdrawType },
      request: loginThirdMember,
      urlKey: "payUrl",
      onFail: () => showErrorAlert(t("common.operationFailed")),
      onFinally: () => setIsNavigating(false),
    });
  }, [withdrawType, enabled, t]);

  return { wallet, isNavigating, refresh, goToWallet, enabled };
}
