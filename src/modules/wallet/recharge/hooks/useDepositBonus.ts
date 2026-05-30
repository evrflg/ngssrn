import { getBonusStatus, getDepositBonus } from "@/api/post/wallet";
import { useEffect, useState } from "react";

/**
 * 根据通道配置决定是否展示赠送金额，
 * 根据 tunnelId + 金额实时计算充值赠送金额。
 * tunnelId 或 amount 为空时，giftMoney = 0。
 */
export function useDepositBonus(tunnelId: string | undefined, amount: string) {
  const [giftMoney, setGiftMoney] = useState(0);
  const [isShowGiftMoney, setIsShowGiftMoney] = useState(false);

  useEffect(() => {
    if (!tunnelId) {
      setIsShowGiftMoney(false);
      setGiftMoney(0);
      return;
    }

    let cancelled = false;
    getBonusStatus({ tunnelId })
      .then((res: any) => {
        if (cancelled) return;
        const data = res?.data?.data ?? res?.data;
        const shouldShow = Boolean(data?.hasDepositBonus || data?.hasChannelRecommendation);
        setIsShowGiftMoney(shouldShow);
        if (!shouldShow) setGiftMoney(0);
      })
      .catch(() => {
        if (cancelled) return;
        setIsShowGiftMoney(true);
      });

    return () => {
      cancelled = true;
    };
  }, [tunnelId]);

  useEffect(() => {
    if (!isShowGiftMoney || !tunnelId || !amount || amount === "0") {
      setGiftMoney(0);
      return;
    }

    let cancelled = false;
    getDepositBonus({ tunnelId, depositMoney: amount })
      .then((res: any) => {
        if (cancelled) return;
        const data = res?.data?.data ?? res?.data;
        if (res?.data?.code === 0 && data) {
          setGiftMoney((data.depositBonus ?? 0) + (data.recomBonus ?? 0));
        } else {
          setGiftMoney(0);
        }
      })
      .catch(() => {
        if (!cancelled) setGiftMoney(0);
      });

    return () => {
      cancelled = true;
    };
  }, [isShowGiftMoney, tunnelId, amount]);

  return { giftMoney, isShowGiftMoney };
}
