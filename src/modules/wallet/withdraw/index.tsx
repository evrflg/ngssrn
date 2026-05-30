import { HideScreenHeader } from "@/components/common/Header";
import { ConfiremModal } from "@/components/common/modal/ConfirmModal";
import DownloadGuide from "@/components/home/popup/downloadGuide/DownloadGuide";
import { TelegramAlert } from "@/components/wallet/TelegramAlert";
import { BanlanceInfo } from "@/components/wallet/BalanceInfo";
import { WithdrawPwdModal } from "@/components/wallet/WithdrawPwdModal";
import { WithdrawTabContent } from "@/components/wallet/WithdrawTabContent";
import { ModalRefs } from "@/components/common/BaseModal";
import BaseTab from "@/components/common/BaseTab";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { queryThirdMember } from "@/api";
import { accInfoAsync } from "@/store/user/userSlice";
import { AppDispatch } from "@/store/store";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { BaseButton } from "@/components/ui/BaseButton";
import { useToast } from "@/components/common/toast";
import { isNumericString } from "@/utils/utils";
import { isThirdInterConnectWithdrawType } from "../shared/utils";
import { withdrawTypeMap } from "../shared/constants";
import { useWithdrawData } from "./hooks/useWithdrawData";
import { useWithdrawAuth } from "./hooks/useWithdrawAuth";
import { useInterConnectWithdraw } from "./hooks/useInterConnectWithdraw";
import { AmountForm } from "./components/AmountForm";
import { CardArea } from "./components/CardArea";
import { WithdrawDescriptions } from "./components/WithdrawDescriptions";
import { WithdrawUnavailablePanel } from "./components/WithdrawUnavailablePanel";

const isWeb = Platform.OS === "web";

export default function Withdraw() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const primaryColor = useThemeColor({}, "primary");
  const toast = useToast();
  const withdrawPwdModalRef = useRef<ModalRefs>(null);
  const [pwdModal, setPwdModal] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const pendingGoSettingRef = useRef(false);
  const isReturningFromOtherPage = useRef(false);

  const {
    globalConfig,
    withdrawConfig,
    bankCards,
    withdrawAmount,
    withdrawPassword,
    withdrawTypes,
    baseIndex,
    isLoading,
    isWithdrawFormValid,
    isWithdrawValid,
    serviceCharge,
    withdrawLimit,
    isPwdSet,
    selectedWithdrawType,
    isThirdInterConnectWallet,
    pendingOrdersCount,
    setBaseIndex,
    handleWithdrawAmountChange,
    handleWithdrawPasswordChange,
    submitWithdraw,
    toAddPage,
    toAddressPage,
    loadBankCards,
    setIsPwdSet,
  } = useWithdrawData({ initData: true });

  const loadBankCardsRef = useRef(loadBankCards);
  loadBankCardsRef.current = loadBankCards;

  const { userInfo, session } = useWithdrawAuth({
    isPwdSet,
    onShowPwdModal: () => setPwdModal(true),
    onClosePwdModal: () => setPwdModal(false),
    onCloseWithdrawPwdModal: () => withdrawPwdModalRef.current?.closeModal?.(),
  });

  const currentBankCard = useMemo(
    () => bankCards.find((c) => !!(c as any).selected),
    [bankCards],
  );

  const currentWithdrawTab = withdrawTypes[baseIndex];
  const apiWithdrawType =
    currentWithdrawTab?.id != null
      ? withdrawTypeMap[currentWithdrawTab.id as keyof typeof withdrawTypeMap]
      : undefined;

  const { wallet: interConnectWallet, isNavigating: isLoadingInterGo, refresh: refreshInterConnectWallet, goToWallet: toInterConnectWallet } =
    useInterConnectWithdraw(
      isThirdInterConnectWithdrawType(apiWithdrawType) ? apiWithdrawType : undefined,
      baseIndex,
    );

  const recomMoneys = useMemo(
    () =>
      String(withdrawConfig?.recomMoneys || "")
        .split(",")
        .filter((v) => !!v && isNumericString(v)),
    [withdrawConfig],
  );

  const withdrawRate = String((withdrawConfig as any)?.cryptRate || "1");

  const usdtValue = useMemo(() => {
    if (withdrawAmount && withdrawRate) {
      return (Number(withdrawAmount) / Number(withdrawRate)).toFixed(2).toString();
    }
    return "0";
  }, [withdrawAmount, withdrawRate]);

  // 切 tab 时重置金额
  useEffect(() => {
    handleWithdrawAmountChange("0");
  }, [baseIndex]);

  // 从地址页返回时刷新卡列表
  useFocusEffect(
    useCallback(() => {
      if (!userInfo?.isLogin || !session?.accessToken) return;
      void loadBankCardsRef.current();
    }, [userInfo?.isLogin, session?.accessToken]),
  );

  useFocusEffect(
    useCallback(() => {
      if (isReturningFromOtherPage.current && withdrawTypes.length > 0) {
        isReturningFromOtherPage.current = false;
      }
    }, [withdrawTypes]),
  );

  const handleToAddressPage = useCallback(() => {
    isReturningFromOtherPage.current = true;
    toAddressPage();
  }, [toAddressPage]);

  const handleWithdrawSubmit = useCallback(
    async (passwordOverride?: string) => {
      if (!isPwdSet) {
        setPwdModal(true);
        setIsSubmit(false);
        return;
      }

      const amount = Number(withdrawAmount || 0);
      if (amount < withdrawLimit.minDrawMoney || amount > withdrawLimit.maxDrawMoney) {
        toast.warn(
          t("wallet.withdraw.withdrawOverRangeWithRange", {
            min: withdrawLimit.minDrawMoney,
            max: withdrawLimit.maxDrawMoney,
          }),
        );
        setIsSubmit(false);
        return;
      }

      const balance = userInfo?.money || 0;
      if (amount > balance) {
        toast.warn(t("wallet.withdraw.noMoney"));
        setIsSubmit(false);
        return;
      }

      try {
        const result = await submitWithdraw(passwordOverride);
        if (result?.code === 0 && result?.data === true) {
          dispatch(accInfoAsync());
          toast.success(t("wallet.withdraw.withdrawSuccess"));
          handleWithdrawAmountChange("");
          if (isThirdInterConnectWithdrawType(apiWithdrawType) && apiWithdrawType != null) {
            queryThirdMember({ withdrawType: apiWithdrawType });
          }
        } else if (result) {
          toast.error(t(result?.code).replace(/\{0\}/g, String(withdrawConfig?.drawNeedBetNum ?? 0)));
        }
      } catch {
        toast.error(t("wallet.withdraw.withdrawError"));
      } finally {
        setIsSubmit(false);
      }
    },
    [
      submitWithdraw,
      dispatch,
      toast,
      t,
      isPwdSet,
      handleWithdrawAmountChange,
      withdrawAmount,
      withdrawLimit,
      userInfo?.money,
      apiWithdrawType,
    ],
  );

  const renderTabsContent = useCallback(
    (tab: any, index: number) => (
      <WithdrawTabContent tab={tab} index={index} currentIndex={baseIndex} theme={theme} />
    ),
    [baseIndex, theme],
  );

  const onPasswordConfirm = (password: string) => {
    if (!isSubmit) {
      toAddPage();
    } else {
      handleWithdrawPasswordChange(password);
      handleWithdrawSubmit(password);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={[
        { backgroundColor: Colors[theme].background },
        isWeb ? ({ flex: 1, minHeight: 0, height: "100%" } as const) : null,
      ]}
    >
      <HideScreenHeader
        title={t("pageName.withdraw")}
        rightEvent={{
          rightText: t("pageName.withdrawRecord"),
          onRightPress: () => router.push("/wallet/withdrawRecord"),
        }}
      />
      <TelegramAlert />
      <View style={{ flex: 1, minHeight: 0 }}>
        <ScrollView
          className="hide-scrollbar"
          style={isWeb ? StyleSheet.absoluteFillObject : { flex: 1, minHeight: 0 }}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 72 }}
          showsVerticalScrollIndicator={isWeb}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          bounces
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <View className={`px-3 mb-3 bg-${theme}-background gap-3`}>
            <BanlanceInfo />

            {withdrawTypes.length === 0 ? (
              isLoading ? (
                <View className="items-center justify-center py-16">
                  <ActivityIndicator size="large" color={primaryColor} />
                </View>
              ) : (
                <WithdrawUnavailablePanel
                  minDrawMoney={withdrawLimit.minDrawMoney}
                  maxDrawMoney={withdrawLimit.maxDrawMoney}
                  handleFee={serviceCharge}
                  curBetNum={withdrawConfig?.curBetNum}
                  drawNeedBetNum={withdrawConfig?.drawNeedBetNum}
                  freeDrawTimes={withdrawConfig?.freeDrawTimes}
                  drawTimes={withdrawConfig?.drawTimes}
                />
              )
            ) : (
              <>
                <BaseTab
                  selectedIndex={baseIndex}
                  setIndex={setBaseIndex}
                  tabs={withdrawTypes}
                  scrollStyle={{ marginTop: 0 }}
                  renderItem={renderTabsContent}
                  showNumber={3}
                  wrap
                />

                {/* 绑卡区域 */}
                <CardArea
                  currentBankCard={currentBankCard}
                  selectedWithdrawType={selectedWithdrawType}
                  isThirdInterConnectWallet={isThirdInterConnectWallet}
                  interConnectWallet={interConnectWallet}
                  isNavigating={isLoadingInterGo}
                  isPwdSet={isPwdSet}
                  onGoToAddressPage={handleToAddressPage}
                  onGoToAddPage={toAddPage}
                  onShowWithdrawPwdModal={() => {
                    setIsSubmit(false);
                    withdrawPwdModalRef.current?.toggleModal();
                  }}
                  onShowPwdModal={() => setPwdModal(true)}
                  withdrawTypes={withdrawTypes}
                  baseIndex={baseIndex}
                  onRefreshWallet={refreshInterConnectWallet}
                  onGoToWallet={toInterConnectWallet}
                />

                {/* 金额表单 + 提现按钮 + 提现说明（同一白卡，与原始页面一致） */}
                <View className={`mb-4 bg-${theme}-btnText rounded-lg p-4`}>
                  <AmountForm
                    withdrawTypes={withdrawTypes}
                    baseIndex={baseIndex}
                    withdrawAmount={withdrawAmount}
                    withdrawConfig={withdrawConfig}
                    serviceCharge={serviceCharge}
                    withdrawLimit={withdrawLimit}
                    withdrawRate={withdrawRate}
                    usdtValue={usdtValue}
                    globalConfig={globalConfig}
                    recomMoneys={recomMoneys}
                    onAmountChange={handleWithdrawAmountChange}
                    onAllIn={() => handleWithdrawAmountChange(String(userInfo?.money || ""))}
                  />

                  <View className="mt-4">
                    <BaseButton
                      i18nKey="wallet.withdraw.submitWithdraw"
                      onPress={() => {
                        setIsSubmit(true);
                        withdrawPwdModalRef.current?.toggleModal();
                      }}
                      gradient
                      roundedFull
                      disabled={!isWithdrawFormValid || !isWithdrawValid || isLoading}
                    />
                  </View>

                  <WithdrawDescriptions
                    withdrawConfig={withdrawConfig}
                    withdrawLimit={withdrawLimit}
                    globalConfig={globalConfig}
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>

      <View>
        <WithdrawPwdModal
          ref={withdrawPwdModalRef}
          handleSuccess={onPasswordConfirm}
          handleReject={() => setIsSubmit(false)}
        />
      </View>

      <View>
        <ConfiremModal
          isVisible={[pwdModal, setPwdModal]}
          hideIconGradient
          iconOverlapTop={48}
          icon={
            <Image
              source={require("@/assets/images/wallet/withdrawPwdWarning.png")}
              style={{ width: 64, height: 120 }}
              resizeMode="contain"
            />
          }
          title={t("wallet.withdraw.withdrawPasswordNotSet")}
          onConfirm={() => {
            pendingGoSettingRef.current = true;
            setPwdModal(false);
          }}
          onModalHide={() => {
            if (!pendingGoSettingRef.current) return;
            pendingGoSettingRef.current = false;
            router.push({
              pathname: "/my/settingCenter",
              params: { type: "withdrawPassword" },
            });
          }}
          onCancel={() => {
            pendingGoSettingRef.current = false;
            router.replace("/wallet");
          }}
        />
      </View>

      {isWeb && <DownloadGuide />}
    </SafeAreaView>
  );
}
