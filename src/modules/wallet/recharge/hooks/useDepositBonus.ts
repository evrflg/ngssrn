import { getDepositBonus } from "@/api/post/wallet";
import { debounce } from "@/utils/debounce";
import { processErrorMessage } from "@/utils/message-parser";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const depositBonusCache = new Map<string, number>();

/**
 * 根据 tunnelId + 金额实时计算充值赠送金额。
 * tunnelId 或 amount 为空、或用户选择不参与优惠时，giftMoney = 0。
 */
export function useDepositBonus(
  tunnelId: string | undefined,
  amount: string,
  skipDepositGift: boolean,
) {
  const { t, i18n } = useTranslation();
  const [giftMoney, setGiftMoney] = useState(0);
  const [walletType, setWalletType] = useState(0);
  const [isCalculatingBonus, setIsCalculatingBonus] = useState(false);
  const [exhaustedRemaining, setExhaustedRemaining] = useState("");
  const calcDepositBonusSeq = useRef(0);
  const tunnelIdRef = useRef(tunnelId);
  const amountRef = useRef(amount);
  const skipDepositGiftRef = useRef(skipDepositGift);

  tunnelIdRef.current = tunnelId;
  amountRef.current = amount;
  skipDepositGiftRef.current = skipDepositGift;

  const runCalcDepositBonus = useCallback(async () => {
    setExhaustedRemaining((prev) => prev && "");
    const currentTunnelId = tunnelIdRef.current;
    const amt = Number(amountRef.current);

    if (skipDepositGiftRef.current || !currentTunnelId || !amt || amt <= 0) {
      setGiftMoney(0);
      setWalletType(0);
      setIsCalculatingBonus(false);
      return;
    }

    const seq = ++calcDepositBonusSeq.current;
    const cacheKey = `${currentTunnelId}_${amt}`;

    try {
      const res: any = await getDepositBonus({
        tunnelId: currentTunnelId,
        depositMoney: amountRef.current,
      });
      if (seq !== calcDepositBonusSeq.current) return;

      const code = res?.data?.code ?? res?.code;
      const data = res?.data?.data ?? res?.data;
      if (code === 0) {
        const newBonus = (data?.depositBonus ?? 0) + (data?.recomBonus ?? 0);
        const stillInSameState =
          amt === Number(amountRef.current) && currentTunnelId === tunnelIdRef.current;
        depositBonusCache.set(cacheKey, newBonus);

        if (stillInSameState) {
          setGiftMoney((prev) => (prev !== newBonus ? newBonus : prev));
          setWalletType(data?.walletType ?? 0);
        }
      } else {
        const msg = (res?.data?.msg ?? res?.msg) as string;
        const key = `errMsg.${code}`;
        const messageInfo = processErrorMessage(msg);
        const message = i18n.exists(key)
          ? t(key, messageInfo.values || [])
          : msg;
        setExhaustedRemaining(message);
      }
    } catch {
      if (
        seq !== calcDepositBonusSeq.current ||
        amt !== Number(amountRef.current) ||
        currentTunnelId !== tunnelIdRef.current
      ) {
        return;
      }
      if (!depositBonusCache.has(cacheKey)) {
        setGiftMoney(0);
      }
    } finally {
      if (seq === calcDepositBonusSeq.current) {
        setIsCalculatingBonus(false);
      }
    }
  }, [i18n, t]);

  const debouncedCalcDepositBonus = useMemo(
    () =>
      debounce(() => {
        void runCalcDepositBonus();
      }, 400, false),
    [runCalcDepositBonus],
  );

  useEffect(() => {
    const amt = Number(amount);

    if (skipDepositGift || !tunnelId || !amt || amt <= 0) {
      setGiftMoney(0);
      setWalletType(0);
      setIsCalculatingBonus(false);
      setExhaustedRemaining("");
    } else {
      const cacheKey = `${tunnelId}_${amt}`;
      if (depositBonusCache.has(cacheKey)) {
        setGiftMoney(depositBonusCache.get(cacheKey) as number);
        setIsCalculatingBonus(false);
      } else {
        setGiftMoney(0);
        setIsCalculatingBonus(true);
      }
    }

    debouncedCalcDepositBonus();
  }, [amount, tunnelId, skipDepositGift, debouncedCalcDepositBonus]);

  useEffect(() => {
    return () => {
      debouncedCalcDepositBonus.cancel();
    };
  }, [debouncedCalcDepositBonus]);

  return { giftMoney, walletType, isCalculatingBonus, exhaustedRemaining };
}
