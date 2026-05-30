import {
  createWithdraw,
  getMemberBanks,
  getMemberBankType,
  getMemberCrypts,
  getMemberPixs,
  getMemberWallets,
  getWithdrawConfig,
  getWithdrawRecord,
  getWithdraws,
} from "@/api";
import { BankCard, PixCard, ThirdWallet, UsdtCard, WithdrawBankItem } from "@/api/types/wallet";
import { useToast } from "@/components/common/toast";
import { WITHDRAW_TYPE } from "@/services/wallet/withdrawService";
import { RootState } from "@/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

// 提现方式类型定义
type WithdrawType = "bank" | "usdt";

// USDT钱包接口
interface UsdtWallet {
  address: string;
  chainType: string;
  isDefault?: boolean;
}

// Default images for different types
const defaultImages = {
  1: require("@/assets/images/wallet/bank-card.png"), // bank
  2: require("@/assets/images/wallet/usdt.png"), // cryptocurrency
  3: require("@/assets/images/wallet/onlineRecharge.png"), // onlinePayment
  4: require("@/assets/images/wallet/onlineRecharge.png"), // type-4
};

// Type ID to tab ID mapping
const typeToTabId = {
  1: "bank",
  2: "cryptocurrency",
  3: "onlinePayment",
  4: "type-4",
  5: "type-5",
  6: "type-6",
};

export const withdrawTypeMap = {
  bank: 1,
  cryptocurrency: 2,
  onlinePayment: 3,
  "type-4": 4,
  "type-5": 5,
  "type-6": 6,
};

const selfCode = /^SELF/; // 需特殊处理的银行卡大类bankCode

export function isThirdInterConnectWithdrawType(n: unknown): n is number {
  const num = typeof n === "string" && n.trim() !== "" ? Number(n) : n;
  return num === 5 || num === 6;
}

// 根据提现类型生成缓存键
const getDefaultBankKey = (type: string) => `DEFAULT_BANK_${type}`;

// 排序
function filterAndSortWithdrawRows(withdraws: any[]) {
  const enabled = withdraws.filter(
    (w) => w != null && (w.status === undefined || w.status === null || Number(w.status) === 0),
  );
  return [...enabled].sort((a, b) => {
    const sa = a.sortNo != null ? Number(a.sortNo) : 0;
    const sb = b.sortNo != null ? Number(b.sortNo) : 0;
    return sa - sb;
  });
}

function parseOrderLimitMoneyConfigList(orderLimitMoneyConfig: unknown): any[] {
  if (orderLimitMoneyConfig == null || orderLimitMoneyConfig === "") return [];
  try {
    const parsed =
      typeof orderLimitMoneyConfig === "string"
        ? JSON.parse(orderLimitMoneyConfig)
        : orderLimitMoneyConfig;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapWithdrawRowToTab(withdraw: any) {
  const rawType = withdraw.type;
  const numType =
    typeof rawType === "string" && String(rawType).trim() !== "" ? Number(rawType) : rawType;
  const semanticId = typeToTabId[numType as keyof typeof typeToTabId] || `type-${rawType}`;
  return {
    id: semanticId,
    tabId: withdraw.id != null ? String(withdraw.id) : undefined,
    name: withdraw.name || `Type ${rawType}`,
    icon: withdraw.iconUrl
      ? { uri: withdraw.iconUrl }
      : defaultImages[numType as keyof typeof defaultImages] || defaultImages[1],
    isHot: withdraw.badge === "hot" || numType === 2,
    badge: withdraw.badge,
    payBadge: withdraw.payBadge,
    payCode: withdraw.payCode,
    tunnelCode: withdraw.tunnelCode,
    tunnels: withdraw.tunnels,
  };
}

/** 接口数据 + 登录态 + rankId 齐备后组装：有层级配置的只保留当前层级，并挂上 rankWithdrawLimit */
function assembleWithdrawTabs(
  sortedRows: any[],
  isLogin: boolean,
  rankId: string | number | undefined,
) {
  const out: any[] = [];
  for (const withdraw of sortedRows) {
    const tierList = parseOrderLimitMoneyConfigList(withdraw.orderLimitMoneyConfig);
    const baseTab = mapWithdrawRowToTab(withdraw);
    if (tierList.length === 0) {
      out.push(baseTab);
      continue;
    }
    if (!isLogin || rankId == null || rankId === "") continue;
    const matched = tierList.find((item: any) => String(item?.rankId ?? "") === String(rankId));
    if (!matched) continue;
    out.push({
      ...baseTab,
      rankWithdrawLimit: {
        minDrawMoney: Number(matched.minMoney) || 0,
        maxDrawMoney: Number(matched.maxMoney) || 0,
      },
    });
  }
  return out;
}

const FALLBACK_WITHDRAW_RAW = [
  { type: 1, status: 0, sortNo: 0, name: "Bank" },
  { type: 2, status: 0, sortNo: 1, name: "USDT", badge: "hot" },
  { type: 3, status: 0, sortNo: 2, name: "PIX" },
  { type: 4, status: 0, sortNo: 3, name: "thirdPayment" },
];

interface Options {
  initData: boolean;
}

export const useWithdraw = ({ initData = true }: Options) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const toast = useToast();
  const globalConfig: any = useSelector((state: RootState) => state?.user?.cfg_site_base);
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const isLogin = !!userInfo?.isLogin;
  const userRankId = userInfo?.rankId ?? userInfo?.member?.rankId;
  // 本地状态：仅缓存 get-withdraws 原始数据；tab 由 raw + 层级在 useMemo 中组装
  const [withdrawConfig, setWithdrawConfig] = useState<any>(null);
  const [rawWithdrawRows, setRawWithdrawRows] = useState<any[]>([]);
  const [bankTypes, setBankTypes] = useState<Array<{ text: string; value: string; id: string }>>(
    [],
  );
  const [selectedWithdrawType, selectWithdrawType] = useState<any>(null);
  const [withdrawType, setWithdrawType] = useState<WithdrawType>("bank");
  const [bankData, setBankData] = useState({
    dynamicCategory: [],
    bankSelectOptions: [],
  });
  const [bankCards, setBankCards] = useState<WithdrawBankItem[]>([]);
  // const [selectedBankCard, setSelectedBankCard] = useState<WithdrawBankItem | null>(null);
  const [usdtWallets, setUsdtWallets] = useState<UsdtWallet[]>([]);
  const [selectedUsdtWallet, setSelectedUsdtWallet] = useState<UsdtWallet | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawPassword, setWithdrawPassword] = useState<string>("");
  const [baseIndex, setBaseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceCharge, setServiceCharge] = useState("0"); // 手续费
  const [error, setError] = useState<string | null>(null);
  const [usdtInfo, setUsdtInfo] = useState<any>(null); // USDT信息
  const [withdrawRate, setWithdrawRate] = useState<string>("1"); // USDT提现汇率
  const [isWithdraw, setIsWithdraw] = useState<boolean>(false);
  const [isRecharge, setIsRecharge] = useState<boolean>(false);
  const [iWithdrawMsg, setWithdrawMsg] = useState<string>("");
  const [isPwdSet, setIsPwdSet] = useState<boolean>(true);
  const [selectedBankCard, setSelectedBankCard] = useState<WithdrawBankItem | null>(null);
  const [pendingOrdersCount, setPendingCount] = useState(0);

  // 添加初始化标记，防止重复加载
  const initializedRef = useRef(false);

  // 从缓存中获取默认银行卡的函数
  const getDefaultBankFromCache = useCallback(async (type: string) => {
    try {
      const key = getDefaultBankKey(type);
      const jsonValue = await AsyncStorage.getItem(key);
      const defaultBankCard = jsonValue != null ? JSON.parse(jsonValue) : null;
      return defaultBankCard;
    } catch (e) {
      console.error("Failed to get default bank from cache:", e);
      return null;
    }
  }, []);

  // 存储默认银行卡到缓存的函数
  const saveDefaultBankToCache = useCallback(async (type: string, bank: WithdrawBankItem) => {
    try {
      const key = getDefaultBankKey(type);
      const jsonValue = JSON.stringify(bank);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error("Failed to save default bank to cache:", e);
    }
  }, []);

  // 排序
  const sortedWithdrawRaw = useMemo(
    () => filterAndSortWithdrawRows(rawWithdrawRows),
    [rawWithdrawRows],
  );

  // 组装提现类型
  const withdrawTypes = useMemo(
    () => assembleWithdrawTabs(sortedWithdrawRaw, isLogin, userRankId),
    [sortedWithdrawRaw, isLogin, userRankId],
  );

  const loadWithdrawTypes = useCallback(async () => {
    try {
      const res = await getWithdraws(undefined);
      if (res.data.data && Array.isArray(res.data.data)) {
        setRawWithdrawRows(res.data.data);
      } else {
        setRawWithdrawRows([]);
      }
    } catch (error) {
      console.error("Failed to fetch withdraw configurations:", error);
      setRawWithdrawRows(FALLBACK_WITHDRAW_RAW);
    }
  }, []);

  const loadBankTypes = useCallback(async () => {
    const res = await getMemberBankType(undefined);
    if (res.data.data) {
      setBankTypes(
        res.data.data.map((item: any) => ({
          text: item.label,
          value: item.value,
          id: String(item.id), // Convert id to string
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
      switch (selectedWithdrawType.id) {
        case WITHDRAW_TYPE.BANK:
          await getMemberBanks({ type, tunnelCode }).then(({ data }) => {
            if (data.data && Array.isArray(data.data)) {
              setBankCards(
                data.data.map((card: BankCard, index: number) => {
                  let selected = card.id === defaultBank?.id;
                  if (!defaultBank && index === 0) selected = true;
                  return {
                    ...card,
                    selected,
                  };
                }),
              );
            }
          });
          break;
        case WITHDRAW_TYPE.CRYPTO:
          await getMemberCrypts({ type }).then(({ data }) => {
            if (data.data && Array.isArray(data.data)) {
              setBankCards(
                data.data.map((card: UsdtCard, index: number) => {
                  let selected = card.id === defaultBank?.id;
                  if (!defaultBank && index === 0) selected = true;
                  return {
                    ...card,
                    selected,
                  };
                }),
              );
            }
          });
          break;
        case WITHDRAW_TYPE.ONLINE:
          await getMemberPixs({ type }).then(({ data }) => {
            if (data.data && Array.isArray(data.data)) {
              setBankCards(
                data.data.map((card: PixCard, index: number) => {
                  let selected = card.id === defaultBank?.id;
                  if (!defaultBank && index === 0) selected = true;
                  return {
                    ...card,
                    selected,
                  };
                }),
              );
            }
          });
          break;
        case WITHDRAW_TYPE.THIRD:
        case "type-5":
        case "type-6": {
          await getMemberWallets({ type, typeCode: tunnelCode }).then(({ data }) => {
            if (data.data && Array.isArray(data.data)) {
              setBankCards(
                data.data.map((card: ThirdWallet, index: number) => {
                  let selected = card.id === defaultBank?.id;
                  if (!defaultBank && index === 0) selected = true;
                  return {
                    ...card,
                    selected,
                  };
                }),
              );
            }
          });
          break;
        }
        default:
          break;
      }
    } catch (e) {
      console.error("loadBankCards failed:", e);
    }
  }, [selectedWithdrawType, withdrawConfig?.tunnelCode]);

  const loadPendingCount = async () => {
    await getWithdrawRecord({ orderStatus: 1 }).then((res) => {
      if (res?.data?.data && Number(res.data.data.total) > 0) {
        setPendingCount(Number(res.data.data.total))
      }
    })
  }

  // 提现通道仅依赖接口 get-withdraws，不等待 cfg_site_base；否则站点基础配置未就绪时通道永远不加载
  useEffect(() => {
    if (!initializedRef.current && initData) {
      const initialize = async () => {
        initializedRef.current = true;
        setIsLoading(true);

        try {
          await loadWithdrawTypes();
          await loadBankTypes();
          await loadPendingCount();
        } catch (error) {
          console.error("初始化提现功能失败:", error);
          setError(t("wallet.withdraw.initWithdrawFailed"));
        } finally {
          setIsLoading(false);
        }
      };

      initialize();
    }
  }, [initData, loadWithdrawTypes, loadBankTypes, t]);

  // withdrawTypes 由 raw+层级计算得到；列表变化时收敛下标并同步当前 tab
  useEffect(() => {
    if (!withdrawTypes.length) return;
    setBaseIndex((prev) => {
      const next = Math.min(prev, withdrawTypes.length - 1);
      const sel = withdrawTypes[next];
      if (sel) selectWithdrawType(sel);
      return next;
    });
  }, [withdrawTypes]);

  useEffect(() => {
    if (!selectedWithdrawType) return;
    if (selectedWithdrawType.tabId !== undefined) {
      const cfgQuery: Record<string, string> = { configId: selectedWithdrawType.tabId };
      getWithdrawConfig(cfgQuery).then(({ data }) => {
        if (data.data) {
          setWithdrawConfig({
            ...data.data,
            handleFee: data.data.handleFee || 0,
            minDrawMoney: data.data.minDrawMoney || 0,
            maxDrawMoney: data.data.maxDrawMoney || 0,
            cryptRate: data.data.cryptRate || 0,
            curBetNum: data.data.curBetNum || 0,
            drawNeedBetNum: data.data.drawNeedBetNum || 0,
            drawInterval: data.data.drawInterval || 0,
          });
          loadBankCards(data.data.tunnelCode);
        }
      });
    }
  }, [selectedWithdrawType, loadBankCards]);

  // 检查提现密码是否设置
  const checkWithdrawPassword = useCallback(() => {
    if (withdrawConfig && !withdrawConfig.bankInfo?.receiptPwd) {
      // 未设置提现密码
      return {
        isSet: false,
      };
    }
    return {
      isSet: true,
    };
  }, [withdrawConfig]);

  const toAddPage = () => {
    const currentWithdrawCategory = withdrawTypes[baseIndex];
    const type = withdrawTypeMap[currentWithdrawCategory?.id as keyof typeof withdrawTypeMap];
    switch (currentWithdrawCategory?.id) {
      case WITHDRAW_TYPE.BANK:
        navigation.push("wallet/addBank", { type, tunnelCode: withdrawConfig?.tunnelCode });
        break;
      case WITHDRAW_TYPE.CRYPTO:
        navigation.push("wallet/addUsdt", { type });
        break;
      case WITHDRAW_TYPE.THIRD:
      case "type-5":
      case "type-6":
        navigation.push("wallet/addThird", {
          type,
          tunnelCode: withdrawConfig?.tunnelCode,
        });
        break;
      case WITHDRAW_TYPE.ONLINE:
        navigation.push("wallet/addOnline", { type });
        break;
      default:
        break;
    }
  };

  const toAddressPage = () => {
    const currentWithdrawCategory = withdrawTypes[baseIndex];
    navigation.push("wallet/bankAddress", {
      type: currentWithdrawCategory?.id,
      tunnelCode: withdrawConfig?.tunnelCode,
    });
  };

  useEffect(() => {
    if (withdrawConfig?.configData) {
      let handlingFree = "0";
      let { strategy, curWnum } = withdrawConfig?.configData;

      if (curWnum < strategy?.drawNum) {
        // 免提次数还有则不计算手续费
        handlingFree = "0";
      } else if (withdrawAmount) {
        if (strategy?.feeType == 2) {
          // 根据比例计算手续费
          let money = ((Number(withdrawAmount) * Number(strategy?.feeValue)) / 100).toFixed(2);
          if (strategy?.upperLimit && money > strategy?.upperLimit) {
            money = strategy?.upperLimit;
          } else if (strategy?.lowerLimit && money < strategy?.lowerLimit) {
            money = strategy?.lowerLimit;
          }
          handlingFree = money;
        } else {
          // 固定手续费模式则取值
          handlingFree = strategy?.feeValue || "0";
        }
      } else {
        handlingFree = "0";
      }
      setServiceCharge(handlingFree);
    }
  }, [withdrawConfig, withdrawAmount]);

  // 处理银行卡选择
  const handleBankCardSelect = useCallback(
    async (card: WithdrawBankItem) => {
      setSelectedBankCard(card);
      // 获取当前提现类型
      const currentWithdrawCategory = withdrawTypes[baseIndex];
      const currentType = currentWithdrawCategory?.id || WITHDRAW_TYPE.BANK;

      // 保存所选银行卡为默认卡
      saveDefaultBankToCache(currentType, card);

      // 更新银行卡列表，将选中的银行卡放到最前面
      setBankCards((items: WithdrawBankItem[]) => {
        items.forEach((item) => {
          if (card.id === item.id) card.selected = true;
        });
        return items;
      });
    },
    [baseIndex, withdrawTypes, saveDefaultBankToCache],
  );

  // 处理USDT钱包选择
  const handleUsdtWalletSelect = useCallback((wallet: UsdtWallet) => {
    setSelectedUsdtWallet(wallet);
  }, []);

  // 处理提现金额输入
  const handleWithdrawAmountChange = useCallback((amount: string) => {
    // 确保输入的是有效的数字
    if (amount === "" || /^\d*\.?\d*$/.test(amount)) {
      setWithdrawAmount(amount);
    }
  }, []);

  // 处理提现密码输入
  const handleWithdrawPasswordChange = useCallback((password: string) => {
    if (password === "" || /^\d*\.?\d*$/.test(password)) {
      setWithdrawPassword(password);
    }
  }, []);

  const isThirdInterConnectWallet = useMemo(() => {
    const tab = withdrawTypes[baseIndex];
    const num =
      tab?.id != null ? withdrawTypeMap[tab.id as keyof typeof withdrawTypeMap] : undefined;
    return isThirdInterConnectWithdrawType(num);
  }, [withdrawTypes, baseIndex]);

  // 检查提现表单是否有效
  const isWithdrawFormValid = useMemo(() => {
    const hasSelectedBankCard = bankCards.some((card) => !!card?.selected);
    if (!hasSelectedBankCard && !isThirdInterConnectWallet) {
      return false;
    }

    // 检查金额
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      return false;
    }

    return true;
  }, [bankCards, withdrawAmount, withdrawPassword, isThirdInterConnectWallet]);

  // 提交提现请求
  const submitWithdraw = useCallback(
    async (passwordOverride?: string) => {
      if (!isWithdrawFormValid) {
        setError(t("wallet.withdraw.fillWithdrawInfo"));
        return;
      }
      let type = "";
      if (withdrawTypeMap[selectedWithdrawType.id as keyof typeof withdrawTypeMap]) {
        type = String(withdrawTypeMap[selectedWithdrawType.id as keyof typeof withdrawTypeMap]);
      }
      if (!type) return;

      setIsLoading(true);
      setError(null);
      try {
        let params: any = {
          amount: Number(withdrawAmount),
          password: passwordOverride ?? withdrawPassword,
          bankId: "",
          type: Number(type),
          configId: withdrawConfig?.id,
          pageNo: 1,
          pageSize: 10,
        };

        if (withdrawType === "bank") {
          params.bankId = bankCards[0]?.id;
        } else if (withdrawType === "usdt") {
          params.address = selectedUsdtWallet?.address;
          params.bankId = bankCards[0]?.id;
        }
        const result = await createWithdraw(params).then(({ data }) => data);
        return result;
      } catch (err) {
        console.error("提现请求失败:", err);
        setError(t("wallet.withdraw.withdrawFailed"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [
      isWithdrawFormValid,
      withdrawAmount,
      withdrawPassword,
      withdrawType,
      bankCards,
      selectedUsdtWallet,
      withdrawConfig,
    ],
  );

  useEffect(() => {
    if (userInfo?.isLogin) {
      const receiptPwd = userInfo?.member?.receiptPwd;
      setIsPwdSet(!!receiptPwd);
    } else {
      // 挤下线/登出后 userInfo 变空，若不重置 isPwdSet，提现页仍会走「未设密码」弹窗，与全局跳首页并发易白屏
      setIsPwdSet(true);
    }
  }, [userInfo]);

  const setBaseIndexWithSelection = useCallback(
    (index: number) => {
      setBaseIndex(index);
      selectWithdrawType(withdrawTypes[index]);
    },
    [withdrawTypes],
  );

  return {
    // 状态
    globalConfig,
    withdrawConfig,
    withdrawType,
    bankCards,
    selectedBankCard,
    usdtWallets,
    selectedUsdtWallet,
    withdrawAmount,
    withdrawPassword,
    withdrawTypes,
    baseIndex,
    isLoading,
    error,
    isWithdrawFormValid,
    serviceCharge,
    bankData,
    usdtInfo,
    withdrawRate,
    isWithdraw,
    isRecharge,
    iWithdrawMsg,
    isPwdSet,
    selectedWithdrawType,
    isThirdInterConnectWallet,
    pendingOrdersCount,

    // 状态更新方法
    setWithdrawType,
    setBaseIndex: setBaseIndexWithSelection,
    setBankCards,

    // 业务逻辑方法
    handleBankCardSelect,
    handleUsdtWalletSelect,
    handleWithdrawAmountChange,
    handleWithdrawPasswordChange,
    submitWithdraw,
    loadBankCards,
    toAddPage,
    toAddressPage,
    checkWithdrawPassword,
    getDefaultBankFromCache,
    saveDefaultBankToCache,
    setIsPwdSet,
    selectWithdrawType,
  };
};
