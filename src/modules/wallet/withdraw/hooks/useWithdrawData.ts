import {
  createWithdraw,
  getMemberBanks,
  getMemberBankType,
  getMemberCrypts,
  getMemberCryptsLegacy,
  getMemberPixs,
  getMemberWallets,
  getWithdrawConfig,
  getWithdrawRecord,
  getWithdraws,
} from "@/api";
import { useToast } from "@/components/common/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { stationConfig } from "@/store/tenant/tenantSlice";
import { RootState } from "@/store/store";
import { BankCard, PixCard, ThirdWallet, UsdtCard, WithdrawBankItem, WithdrawConfig, WithdrawTab } from "../../shared/types";
import {
  FALLBACK_WITHDRAW_RAW,
  WITHDRAW_TYPE,
  withdrawTypeMap,
} from "../../shared/constants";
import {
  assembleWithdrawTabs,
  buildWithdrawTabQuery,
  calculateServiceFee,
  filterAndSortWithdrawRows,
  isThirdInterConnectWithdrawType,
  isThirdWalletTabId,
  parseOrderLimitMoneyConfig,
} from "../../shared/utils";
import {
  clearWithdrawType,
  getWithdrawTabId,
  getWithdrawType,
  syncWithdrawTabId,
  syncWithdrawThirdPayCodeFromTab,
  syncWithdrawType,
} from "../../shared/withdrawThirdPayCodeStorage";

const getDefaultBankKey = (type: string) => `DEFAULT_BANK_${type}`;

interface Options {
  initData: boolean;
}

export function useWithdrawData({ initData = true }: Options) {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const toast = useToast();
  const globalConfig: any = useSelector((state: RootState) => state?.user?.cfg_site_base);
  const siteConfig = useSelector(stationConfig);
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const isLogin = !!userInfo?.isLogin;
  const userRankId = userInfo?.rankId ?? userInfo?.member?.rankId;

  const [withdrawConfig, setWithdrawConfig] = useState<WithdrawConfig | null>(null);
  const [rawWithdrawRows, setRawWithdrawRows] = useState<any[]>([]);
  const [bankTypes, setBankTypes] = useState<Array<{ text: string; value: string; id: string }>>(
    [],
  );
  const [selectedWithdrawType, selectWithdrawType] = useState<WithdrawTab | null>(null);
  const [bankCards, setBankCards] = useState<WithdrawBankItem[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [baseIndex, setBaseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [channelsLoaded, setChannelsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPwdSet, setIsPwdSet] = useState(true);
  const [selectedBankCard, setSelectedBankCard] = useState<WithdrawBankItem | null>(null);
  const [pendingOrdersCount, setPendingCount] = useState(0);
  const initializedRef = useRef(false);
  const tabRestoredRef = useRef(false);
  const tabRestoreInFlightRef = useRef(false);
  const withdrawTypesLengthRef = useRef(0);
  const withdrawTypesKeyRef = useRef("");
  const selectedTabIdRef = useRef<string | undefined>(undefined);

  // ── 缓存默认银行卡 ──────────────────────────────
  const getDefaultBankFromCache = useCallback(async (type: string) => {
    try {
      const json = await AsyncStorage.getItem(getDefaultBankKey(type));
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }, []);

  const saveDefaultBankToCache = useCallback(async (type: string, bank: WithdrawBankItem) => {
    try {
      await AsyncStorage.setItem(getDefaultBankKey(type), JSON.stringify(bank));
    } catch {}
  }, []);

  // ── 原始数据 → 排序 → 组装 Tab ─────────────────
  const sortedWithdrawRaw = useMemo(
    () => filterAndSortWithdrawRows(rawWithdrawRows),
    [rawWithdrawRows],
  );

  const withdrawTypes = useMemo(
    () => assembleWithdrawTabs(sortedWithdrawRaw, isLogin, userRankId),
    [sortedWithdrawRaw, isLogin, userRankId],
  );
  const withdrawTypesRef = useRef(withdrawTypes);
  withdrawTypesRef.current = withdrawTypes;

  // ── 数据加载 ─────────────────────────────────────
  const loadWithdrawTypes = useCallback(async () => {
    try {
      const res = await getWithdraws(undefined);
      if (res.data.data && Array.isArray(res.data.data)) {
        setRawWithdrawRows(res.data.data);
      } else {
        setRawWithdrawRows([]);
      }
    } catch {
      setRawWithdrawRows(FALLBACK_WITHDRAW_RAW);
    } finally {
      setChannelsLoaded(true);
    }
  }, []);

  const loadBankTypes = useCallback(async () => {
    const res = await getMemberBankType(undefined);
    if (res.data.data) {
      setBankTypes(
        res.data.data.map((item: any) => ({
          text: item.label,
          value: item.value,
          id: String(item.id),
        })),
      );
    }
  }, []);

  const loadBankCards = useCallback(async (tunnelCodeOverride?: string) => {
    if (!selectedWithdrawType) return;
    const type = withdrawTypeMap[selectedWithdrawType.id as keyof typeof withdrawTypeMap];
    if (type === undefined) return;
    const tunnelCode = tunnelCodeOverride ?? withdrawConfig?.tunnelCode ?? selectedWithdrawType.tunnelCode ?? "";
    try {
      const defaultBank = await getDefaultBankFromCache(selectedWithdrawType.id);
      const makeList = (data: any[], card: typeof defaultBank) =>
        data.map((c, i) => ({
          ...c,
          selected: defaultBank ? c.id === defaultBank?.id : i === 0,
        }));

      switch (selectedWithdrawType.id) {
        case WITHDRAW_TYPE.BANK: {
          const { data } = await getMemberBanks({ type, tunnelCode });
          if (Array.isArray(data.data)) setBankCards(makeList(data.data as BankCard[], defaultBank));
          break;
        }
        case WITHDRAW_TYPE.CRYPTO: {
          const cryptoParam = siteConfig?.isTestSite ? tunnelCode : "2";
          const { data } = siteConfig?.isTestSite
            ? await getMemberCrypts({ typeCode: cryptoParam })
            : await getMemberCryptsLegacy({ type: cryptoParam });
          if (Array.isArray(data.data)) setBankCards(makeList(data.data as UsdtCard[], defaultBank));
          break;
        }
        case WITHDRAW_TYPE.ONLINE: {
          const { data } = await getMemberPixs({ type });
          if (Array.isArray(data.data)) setBankCards(makeList(data.data as PixCard[], defaultBank));
          break;
        }
        case WITHDRAW_TYPE.THIRD:
        case "type-5":
        case "type-6": {
          const { data } = await getMemberWallets({ type, typeCode: tunnelCode });
          if (Array.isArray(data.data)) setBankCards(makeList(data.data as ThirdWallet[], defaultBank));
          break;
        }
        default:
          break;
      }
    } catch {}
  }, [selectedWithdrawType, withdrawConfig?.tunnelCode, getDefaultBankFromCache, siteConfig?.isTestSite]);

  const loadBankCardsRef = useRef(loadBankCards);
  loadBankCardsRef.current = loadBankCards;

  const loadPendingCount = useCallback(async () => {
    await getWithdrawRecord({ orderStatus: 1 }).then((res) => {
      if (res?.data?.data && Number(res.data.data.total) > 0) {
        setPendingCount(Number(res.data.data.total));
      }
    });
  }, []);

  // ── 初始化 ───────────────────────────────────────
  useEffect(() => {
    if (!initializedRef.current && initData) {
      initializedRef.current = true;
      setIsLoading(true);
      Promise.all([loadWithdrawTypes(), loadBankTypes(), loadPendingCount()])
        .catch(() => setError(t("wallet.withdraw.initWithdrawFailed")))
        .finally(() => setIsLoading(false));
    }
  }, [initData, loadWithdrawTypes, loadBankTypes, loadPendingCount, t]);

  const syncSelectedTab = useCallback((index: number, tabs: WithdrawTab[]) => {
    const tab = tabs[index];
    if (!tab) return;
    const tabKey = tab.tabId ?? tab.id;
    if (selectedTabIdRef.current === tabKey) return;
    selectedTabIdRef.current = tabKey;
    selectWithdrawType(tab);
  }, []);

  // Tab 列表变化时收敛下标 + 同步当前 tab，并尝试恢复上次选中（避免重复 select 引发配置/列表请求循环）
  useEffect(() => {
    if (!withdrawTypes.length) {
      withdrawTypesLengthRef.current = 0;
      return;
    }

    const applyIndex = (index: number) => {
      const tabs = withdrawTypesRef.current;
      if (!tabs.length) return;
      const next = Math.min(Math.max(index, 0), tabs.length - 1);
      setBaseIndex((prev) => (prev === next ? prev : next));
      syncSelectedTab(next, tabs);
    };

    if (!tabRestoredRef.current) {
      if (tabRestoreInFlightRef.current) return;
      tabRestoreInFlightRef.current = true;
      withdrawTypesLengthRef.current = withdrawTypes.length;
      withdrawTypesKeyRef.current = withdrawTypes
        .map((tab) => tab.tabId ?? tab.id)
        .join("|");

      void (async () => {
        let targetIndex = 0;
        const tabs = withdrawTypesRef.current;
        const storedTabId = await getWithdrawTabId();
        if (storedTabId) {
          const matchedIndex = tabs.findIndex((tab) => tab.tabId === storedTabId);
          if (matchedIndex >= 0) targetIndex = matchedIndex;
        } else {
          const storedType = await getWithdrawType();
          if (storedType) {
            const typeMap: Record<string, string> = {
              "1": WITHDRAW_TYPE.BANK,
              "2": WITHDRAW_TYPE.CRYPTO,
              "3": WITHDRAW_TYPE.ONLINE,
              "4": WITHDRAW_TYPE.THIRD,
              "5": "type-5",
              "6": "type-6",
            };
            const tabCategoryId = typeMap[storedType];
            const matchedIndex = tabs.findIndex((tab) => tab.id === tabCategoryId);
            if (matchedIndex >= 0) targetIndex = matchedIndex;
            await clearWithdrawType();
          }
        }
        tabRestoredRef.current = true;
        tabRestoreInFlightRef.current = false;
        applyIndex(targetIndex);
      })();
      return;
    }

    const tabsKey = withdrawTypes.map((tab) => tab.tabId ?? tab.id).join("|");
    const prevLen = withdrawTypesLengthRef.current;
    const prevKey = withdrawTypesKeyRef.current;
    withdrawTypesLengthRef.current = withdrawTypes.length;
    withdrawTypesKeyRef.current = tabsKey;

    if (prevLen !== withdrawTypes.length || prevKey !== tabsKey) {
      setBaseIndex((prev) => {
        const next = Math.min(prev, withdrawTypes.length - 1);
        syncSelectedTab(next, withdrawTypes);
        return next;
      });
    }
  }, [withdrawTypes, syncSelectedTab]);

  // 切换 tab → 同步缓存 + 加载配置 + 银行卡列表
  useEffect(() => {
    if (!selectedWithdrawType?.tabId) return;
    const tabId = selectedWithdrawType.tabId;
    syncWithdrawThirdPayCodeFromTab(selectedWithdrawType);
    void syncWithdrawTabId(tabId);

    let cancelled = false;
    const cfgQuery: Record<string, string> = { configId: tabId };
    getWithdrawConfig(cfgQuery).then(({ data }) => {
      if (cancelled || !data.data) return;
      const limitConfig = parseOrderLimitMoneyConfig(
        data.data.orderLimitMoneyConfig,
        userRankId,
      );
      setWithdrawConfig({
        ...data.data,
        handleFee: data.data.handleFee || 0,
        minDrawMoney: limitConfig.minMoney || data.data.minDrawMoney || 0,
        maxDrawMoney: limitConfig.maxMoney || data.data.maxDrawMoney || 0,
        cryptRate: data.data.cryptRate || 0,
        curBetNum: data.data.curBetNum || 0,
        drawNeedBetNum: data.data.drawNeedBetNum || 0,
        drawInterval: data.data.drawInterval || 0,
      });
      void loadBankCardsRef.current(data.data.tunnelCode);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedWithdrawType?.tabId, selectedWithdrawType?.id, userRankId]);

  // ── 手续费（响应式）────────────────────────────────
  const serviceCharge = useMemo(() => {
    return calculateServiceFee({
      withdrawAmount,
      configData: withdrawConfig?.configData,
    });
  }, [withdrawConfig, withdrawAmount]);

  // ── 层级限额 ─────────────────────────────────────
  const withdrawLimit = useMemo(() => {
    const tabLimit = withdrawTypes[baseIndex]?.rankWithdrawLimit;
    return tabLimit ?? {
      minDrawMoney: Number(withdrawConfig?.minDrawMoney) || 0,
      maxDrawMoney: Number(withdrawConfig?.maxDrawMoney) || 0,
    };
  }, [withdrawTypes, baseIndex, withdrawConfig]);

  // ── 表单校验（有无选中卡 + 金额） ─────────────────
  const isWithdrawFormValid = useMemo(() => {
    const hasCard = bankCards.some((c) => !!(c as any).selected);
    const tab = withdrawTypes[baseIndex];
    const numType = tab?.id != null ? withdrawTypeMap[tab.id] : undefined;
    if (!hasCard && !isThirdInterConnectWithdrawType(numType)) return false;
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return false;
    return true;
  }, [bankCards, withdrawAmount, withdrawTypes, baseIndex]);

  // ── 提现次数 + 待处理订单双重校验（bug fix） ────────
  const isWithdrawValid = useMemo(() => {
    let hasQuota = true;
    if (
      withdrawConfig?.drawTimes !== undefined &&
      withdrawConfig?.freeDrawTimes !== undefined
    ) {
      hasQuota =
        Number(withdrawConfig.drawTimes) >= Number(withdrawConfig.freeDrawTimes);
    } else {
      hasQuota = false;
    }
    const noPending =
      withdrawConfig?.applyWhenUnhandleExist !== 1 || pendingOrdersCount === 0;
    return hasQuota && noPending;
  }, [withdrawConfig, pendingOrdersCount]);

  // ── 互通钱包类型判断 ──────────────────────────────
  const isThirdInterConnectWallet = useMemo(() => {
    const tab = withdrawTypes[baseIndex];
    const num = tab?.id != null ? withdrawTypeMap[tab.id] : undefined;
    return isThirdInterConnectWithdrawType(num);
  }, [withdrawTypes, baseIndex]);

  // ── 处理银行卡选中（修复原地 mutation 不更新 UI 的 bug） ──
  const handleBankCardSelect = useCallback(
    async (card: WithdrawBankItem) => {
      setSelectedBankCard(card);
      const currentType = withdrawTypes[baseIndex]?.id || WITHDRAW_TYPE.BANK;
      await saveDefaultBankToCache(currentType, card);
      setBankCards((prev) =>
        prev.map((c) => ({ ...c, selected: c.id === card.id })),
      );
    },
    [baseIndex, withdrawTypes, saveDefaultBankToCache],
  );

  const handleWithdrawAmountChange = useCallback((val: string) => {
    if (val === "" || /^\d*\.?\d*$/.test(val)) setWithdrawAmount(val);
  }, []);

  const handleWithdrawPasswordChange = useCallback((val: string) => {
    if (val === "" || /^\d*$/.test(val)) setWithdrawPassword(val);
  }, []);

  // ── 提现提交（bug fix：用 selectedBankCard 而非 bankCards[0]） ──
  const submitWithdraw = useCallback(
    async (passwordOverride?: string) => {
      if (!isWithdrawFormValid) {
        setError(t("wallet.withdraw.fillWithdrawInfo"));
        return;
      }
      const type = String(
        withdrawTypeMap[selectedWithdrawType?.id as keyof typeof withdrawTypeMap] ?? "",
      );
      if (!type) return;

      setIsLoading(true);
      setError(null);
      try {
        const activeCard = (selectedBankCard ?? bankCards.find((c) => !!(c as any).selected)) as any;
        const params: any = {
          amount: Number(withdrawAmount),
          password: passwordOverride ?? withdrawPassword,
          bankId: activeCard?.id ?? "",
          type: Number(type),
          configId: withdrawConfig?.id,
          pageNo: 1,
          pageSize: 10,
        };
        const result = await createWithdraw(params).then(({ data }) => data);
        return result;
      } catch {
        setError(t("wallet.withdraw.withdrawFailed"));
        throw new Error(t("wallet.withdraw.withdrawFailed"));
      } finally {
        setIsLoading(false);
      }
    },
    [
      isWithdrawFormValid,
      withdrawAmount,
      withdrawPassword,
      selectedWithdrawType,
      selectedBankCard,
      bankCards,
      withdrawConfig,
      t,
    ],
  );

  const persistWithdrawTabContext = useCallback(async () => {
    const tab = withdrawTypes[baseIndex];
    if (!tab) return;
    const type = withdrawTypeMap[tab.id as keyof typeof withdrawTypeMap];
    if (type != null) {
      await syncWithdrawType(String(type));
    }
    if (tab.tabId) {
      await syncWithdrawTabId(tab.tabId);
    }
  }, [withdrawTypes, baseIndex]);

  // ── 导航到添加账户页 ──────────────────────────────
  const toAddPage = useCallback(() => {
    const tab = withdrawTypes[baseIndex];
    const query = buildWithdrawTabQuery({ tab, withdrawConfig });
    if (!query) return;
    void persistWithdrawTabContext();
    const { numericType: type, tunnelCode, tabId } = query;
    switch (tab?.id) {
      case WITHDRAW_TYPE.BANK:
        navigation.push("wallet/addBank", { type, tunnelCode, tabId });
        break;
      case WITHDRAW_TYPE.CRYPTO:
        navigation.push("wallet/addUsdt", { type, tunnelCode, tabId });
        break;
      case WITHDRAW_TYPE.THIRD:
      case "type-5":
      case "type-6":
        navigation.push("wallet/addThird", { type, tunnelCode, tabId });
        break;
      case WITHDRAW_TYPE.ONLINE:
        navigation.push("wallet/addOnline", { type, tunnelCode, tabId });
        break;
      default:
        break;
    }
  }, [withdrawTypes, baseIndex, withdrawConfig, navigation, persistWithdrawTabContext]);

  const toAddressPage = useCallback(() => {
    const tab = withdrawTypes[baseIndex];
    const query = buildWithdrawTabQuery({ tab, withdrawConfig });
    if (!query) return;
    const selectedCard = bankCards.find((c) => !!(c as { selected?: boolean }).selected) as
      | { typeCode?: string }
      | undefined;
    void persistWithdrawTabContext();
    navigation.push("wallet/bankAddress", {
      type: query.semanticType,
      tunnelCode: query.tunnelCode,
      tabId: query.tabId,
      ...(isThirdWalletTabId(tab?.id) && selectedCard?.typeCode
        ? { typeCode: selectedCard.typeCode }
        : {}),
    });
  }, [
    withdrawTypes,
    baseIndex,
    bankCards,
    withdrawConfig,
    navigation,
    persistWithdrawTabContext,
  ]);

  // ── 登录态变化时同步密码设置状态 ─────────────────
  useEffect(() => {
    if (userInfo?.isLogin) {
      setIsPwdSet(!!userInfo?.member?.receiptPwd);
    } else {
      setIsPwdSet(true);
    }
  }, [userInfo]);

  const setBaseIndexWithSelection = useCallback(
    (index: number) => {
      const next = Math.min(Math.max(index, 0), withdrawTypes.length - 1);
      setBaseIndex(next);
      syncSelectedTab(next, withdrawTypes);
    },
    [withdrawTypes, syncSelectedTab],
  );

  return {
    globalConfig,
    withdrawConfig,
    bankCards,
    bankTypes,
    selectedBankCard,
    withdrawAmount,
    withdrawPassword,
    withdrawTypes,
    baseIndex,
    isLoading,
    channelsLoaded,
    error,
    isWithdrawFormValid,
    isWithdrawValid,
    serviceCharge,
    withdrawLimit,
    isPwdSet,
    selectedWithdrawType,
    isThirdInterConnectWallet,
    pendingOrdersCount,

    setBaseIndex: setBaseIndexWithSelection,
    setBankCards,
    setIsPwdSet,
    selectWithdrawType,
    handleBankCardSelect,
    handleWithdrawAmountChange,
    handleWithdrawPasswordChange,
    submitWithdraw,
    loadBankCards,
    toAddPage,
    toAddressPage,
    getDefaultBankFromCache,
    saveDefaultBankToCache,
  };
}
