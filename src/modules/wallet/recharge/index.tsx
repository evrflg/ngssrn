import BaseTab from "@/components/common/BaseTab";
import { HideScreenHeader } from "@/components/common/Header";
import { PublicitiesList } from "@/components/home/popup/publicitiesList/PublicitiesList";
import DownloadGuide from "@/components/home/popup/downloadGuide/DownloadGuide";
import { BanlanceInfo } from "@/components/wallet/BalanceInfo";
import { DepositPasswordPopup } from "@/components/wallet/DepositPasswordPopup";
import { RechargeTabContent } from "@/components/wallet/RechargeTabContent";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { PublicityType } from "@/types/publicity";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "@/components/common/toast";
import { useRechargeData } from "./hooks/useRechargeData";
import { useDepositBonus } from "./hooks/useDepositBonus";
import { useInterConnectDeposit } from "./hooks/useInterConnectDeposit";
import { AmountForm } from "./components/AmountForm";
import { DepositGiftRow } from "./components/DepositGiftRow";
import { PaymentMethodTabs } from "./components/PaymentMethodTabs";
import { RechargeExplain } from "@/components/wallet/RechargeExplain";
import { SubmitButton } from "./components/SubmitButton";
import { PayWebViewModal } from "./components/PayWebViewModal";
import { BankSelectIcon } from "@/components/icons/wallet";
import { I18nText } from "@/components/I18nText";
import { useThemeColor } from "@/hooks/useThemeColor";

const isWeb = Platform.OS === "web";

export default function Recharge() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isFocused = useIsFocused();
  const primaryColor = useThemeColor({}, "primary");
  const toast = useToast();
  const passwordModalRef = useRef<any>(null);
  const passwordSet = useRef(new Map<string, number>());
  const [payWebViewUrl, setPayWebViewUrl] = useState<string | null>(null);

  const {
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
  } = useRechargeData();

  const isInterConnectWallet = useMemo(
    () => (selectedTunnel as any)?.ossWallet === 1,
    [selectedTunnel],
  );
  const needInputPassword = useMemo(
    () => (selectedTunnel as any)?.verifyTradePwd === 0,
    [selectedTunnel],
  );

  const skipDepositGift = !joinDepositGift;
  const { giftMoney, walletType, isCalculatingBonus, exhaustedRemaining } = useDepositBonus(
    currentRecharge?.id === "online" ? (selectedTunnel as any)?.id : undefined,
    amount,
    skipDepositGift,
  );

  const {
    wallet: interConnectWallet,
    isRefreshing: isRefreshingBalance,
    isNavigating: isLoadingWallet,
    refresh: onRefreshWallet,
    goToWallet,
    fetchWalletInfo,
  } = useInterConnectDeposit(
    isInterConnectWallet ? (selectedTunnel as any)?.id : undefined,
    isInterConnectWallet,
  );

  const usdtValue = useMemo(() => {
    const pay = currentPay as any;
    if (pay?.depositRate && amount) {
      return (Number(amount) * Number(pay.depositRate)).toFixed(2).toString();
    }
    return "0";
  }, [currentPay, amount]);

  const showBonusBtn =
    currentRecharge?.id === "online" && joinDepositGift && giftMoney > 0 && !isLoading;

  const explainRemark = useMemo(() => {
    const pay = currentPay as any;
    if (currentRecharge?.id === "online") {
      return (selectedTunnel as any)?.remark || "";
    }
    if (currentRecharge?.id === "bank" || currentRecharge?.id === "usdt") {
      return pay?.remark || "";
    }
    return "";
  }, [currentRecharge, currentPay, selectedTunnel]);

  const showBackendRemarkOnly = currentRecharge?.id === "online";

  // 提交处理
  const handleRechargeSubmit = async () => {
    if (!selectedTunnel && !currentPay) return;
    // 如果是互通钱包，并且需要输入密码，则弹出密码输入框
    if (isInterConnectWallet) {
      if (!interConnectWallet.balance || interConnectWallet.balance < Number(amount)) {
        toast.error(t("wallet.recharge.coinNotEnough"));
        setTimeout(goToWallet, 1600)
        return;
      } else if (needInputPassword) {
        const id = (selectedTunnel as any)?.id as string;
        if (!passwordSet.current.get(id)) {
          passwordModalRef.current?.toggleModal();
          return;
        }
      }
    }
    try {
      const result = await submitRecharge(undefined, selectedTunnel || currentPay);
      const payUrl = result?.data?.payUrl ?? result?.data?.data?.payUrl;
      if (payUrl) {
        setPayWebViewUrl(payUrl);
      } else {
        fetchWalletInfo();
        setAmount("");
        setRemark("");
      }
    } catch { }
  };

  const onPasswordResolved = async (password: string) => {
    try {
      const result = await submitRecharge(password, selectedTunnel);
      const payUrl = result?.data?.payUrl ?? result?.data?.data?.payUrl;

      if (payUrl) {
        // 普通在线支付：打开内嵌支付页
        setPayWebViewUrl(payUrl);
        setAmount("");
        setRemark("");
      } else if (isInterConnectWallet && result) {
        // 互通钱包：payUrl 为 null/空 表示成功，记录密码已设置
        setAmount("");
        setRemark("");
        const id = (selectedTunnel as any)?.id as string;
        passwordSet.current.set(id, 1);
        setTimeout(() => fetchWalletInfo(), 800);
      }
    } catch { }
  };

  // 大 Tab 渲染
  const renderTabsContent = useCallback(
    (tab: any, index: number) => (
      <RechargeTabContent tab={tab} index={index} currentIndex={baseIndex} theme={theme} />
    ),
    [baseIndex, theme],
  );

  // 错误 toast
  React.useEffect(() => {
    if (error && toast) toast.error(error);
  }, [error, toast]);

  return (
    <SafeAreaView style={{ backgroundColor: Colors[theme].background }} className="flex-1">
      <HideScreenHeader
        title={t("pageName.recharge")}
        rightEvent={{
          rightText: t("pageName.rechargeRecord"),
          onRightPress: () => router.push("/wallet/rechargeRecord"),
        }}
      />
      <View className={`flex-1 px-3 mb-3 bg-${theme}-background`}>
        <BanlanceInfo />

        {/* 充值方式大 Tab */}
        <BaseTab
          tabClassName="py-2.5"
          selectedIndex={baseIndex}
          setIndex={setBaseIndex}
          tabs={rechargeTypes.filter(
            (item: any) => item.depositType !== 3 && item.displayRank !== 2,
          )}
          scrollStyle={{ marginTop: 0 }}
          renderItem={renderTabsContent}
          showNumber={3}
        />

        <ScrollView
          className="hide-scrollbar"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          keyboardShouldPersistTaps="handled"
        >
          {/* 支付方式子 Tab + 收款卡片 */}
          {currentRecharge && (
            <PaymentMethodTabs
              currentRecharge={currentRecharge}
              currentPayIndex={currentPayIndex}
              onSelectPay={setCurrentPayIndex}
              isUsdt={currentRecharge.id === "usdt"}
            />
          )}

          {/* 充值金额区域 */}
          <View className="flex-row items-center mb-2">
            <BankSelectIcon fill={primaryColor} />
            <I18nText
              i18nKey="wallet.recharge.rechargeAmount"
              className={`ml-2 text-${theme}-text font-medium`}
            />
          </View>
          <View className={`bg-${theme}-btnText rounded-lg py-4 px-1.5 mb-4`}>
            <AmountForm
              currentRecharge={currentRecharge}
              currentPay={currentPay}
              amount={amount}
              remark={remark}
              usdtValue={usdtValue}
              onAmountChange={handleSetAmount}
              onRemarkChange={setRemark}
              onClearAmount={clearAmount}
              isInterConnectWallet={isInterConnectWallet}
              interConnectWallet={interConnectWallet}
              isRefreshingBalance={isRefreshingBalance}
              isNavigatingToWallet={isLoadingWallet}
              onRefreshWallet={onRefreshWallet}
              onGoToWallet={goToWallet}
            />
            {currentRecharge?.id === "online" && (
              <DepositGiftRow
                giftMoney={giftMoney}
                walletType={walletType}
                joinDepositGift={joinDepositGift}
                isCalculatingBonus={isCalculatingBonus}
                exhaustedRemaining={exhaustedRemaining}
                onToggle={() => setJoinDepositGift(!joinDepositGift)}
              />
            )}
          </View>

          {/* 提交按钮 */}
          <View className="px-2 mb-4">
            <SubmitButton
              isLoading={isLoading}
              amount={amount}
              giftMoney={giftMoney}
              walletType={walletType}
              joinDepositGift={joinDepositGift}
              showBonus={showBonusBtn}
              onPress={handleRechargeSubmit}
            />
          </View>

          <RechargeExplain remark={explainRemark} showBackendRemarkOnly={showBackendRemarkOnly} />

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>

      <View>
        <DepositPasswordPopup
          ref={passwordModalRef}
          onResolve={onPasswordResolved}
          onReject={() => { }}
        />
      </View>

      {payWebViewUrl && (
        <PayWebViewModal
          url={payWebViewUrl}
          onClose={() => {
            setPayWebViewUrl(null);
            fetchWalletInfo();
          }}
        />
      )}

      {isFocused && isWeb && (
        <View>
          <PublicitiesList standalone publicityTypesOverride={[PublicityType.DEPOSIT_TUTORIAL]} />
          <DownloadGuide />
        </View>
      )}
    </SafeAreaView>
  );
}
