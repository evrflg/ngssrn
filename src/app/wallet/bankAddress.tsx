import { HideScreenHeader } from "@/components/common/Header";
import { I18nText } from "@/components/I18nText";
import { SelectedPayTypeIcon } from "@/components/icons/wallet";
import { ModalRefs } from "@/components/common/BaseModal";
import { useToast } from "@/components/common/toast";
import { WithdrawPwdModal } from "@/components/wallet/WithdrawPwdModal";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { WithdrawBankItem } from "@/api/types/wallet";
import {
  syncWithdrawTabId,
  syncWithdrawType,
} from "@/modules/wallet/shared/withdrawThirdPayCodeStorage";
import {
  WITHDRAW_TYPE,
  withdrawTypeMap,
} from "@/modules/wallet/shared/constants";
import {
  buildWithdrawTabQuery,
  getWithdrawalMethodDisplay,
  getWithdrawCardIcon,
  isThirdWalletTabId,
} from "@/modules/wallet/shared/utils";
import { useWithdrawData } from "@/modules/wallet/withdraw/hooks/useWithdrawData";
import { WithdrawalMethodBlock } from "@/modules/wallet/withdraw/components/WithdrawalMethodBlock";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export default function addBank() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const withdrawPwdModalRef = useRef<ModalRefs>(null);
  const { theme } = useTheme();
  const params = useLocalSearchParams<{
    type?: string;
    tunnelCode?: string;
    typeCode?: string;
    tabId?: string;
  }>();
  const { t } = useTranslation();
  const toast = useToast();
  const isFirstSelection = useRef(true);
  const {
    bankCards,
    selectedWithdrawType,
    withdrawConfig,
    loadBankCards,
    handleBankCardSelect,
    withdrawTypes,
    baseIndex,
    setBaseIndex,
  } = useWithdrawData({ initData: true });

  const loadBankCardsRef = useRef(loadBankCards);
  loadBankCardsRef.current = loadBankCards;

  useEffect(() => {
    if (!params.type || withdrawTypes.length === 0) return;
    const matchedIndex = withdrawTypes.findIndex(
      (tab) => tab.id === params.type,
    );
    if (matchedIndex < 0) return;
    if (withdrawTypes[matchedIndex]?.id !== selectedWithdrawType?.id) {
      setBaseIndex(matchedIndex);
    }
  }, [params.type, withdrawTypes, selectedWithdrawType?.id, setBaseIndex]);

  const persistWithdrawTabContext = useCallback(async () => {
    const tab =
      withdrawTypes.find((item) => item.id === params.type) ??
      withdrawTypes[baseIndex] ??
      selectedWithdrawType;
    if (!tab) return;
    const type = withdrawTypeMap[tab.id as keyof typeof withdrawTypeMap];
    if (type != null) {
      await syncWithdrawType(String(type));
    }
    const tabId =
      params.tabId ??
      tab.tabId ??
      (withdrawConfig?.id != null ? String(withdrawConfig.id) : undefined);
    if (tabId) {
      await syncWithdrawTabId(tabId);
    }
  }, [withdrawTypes, baseIndex, selectedWithdrawType, params.type, params.tabId, withdrawConfig?.id]);

  const toAddPage = () => {
    void persistWithdrawTabContext();
    const tab =
      withdrawTypes.find((item) => item.id === params.type) ??
      withdrawTypes[baseIndex] ??
      selectedWithdrawType;
    const query = buildWithdrawTabQuery({
      tab,
      withdrawConfig,
      tunnelCodeOverride: isThirdWalletTabId(params.type)
        ? params.typeCode ?? params.tunnelCode
        : params.tunnelCode,
      tabIdOverride: params.tabId,
    });
    if (!query) return;
    const { numericType: type, tunnelCode, tabId } = query;
    switch (params?.type) {
      case WITHDRAW_TYPE.BANK:
        navigation.push("wallet/addBank", { type, tunnelCode, tabId });
        break;
      case WITHDRAW_TYPE.CRYPTO:
        navigation.push("wallet/addUsdt", { type, tunnelCode, tabId });
        break;
      case WITHDRAW_TYPE.THIRD:
      case "type-5":
      case "type-6":
        navigation.push("wallet/addThird", {
          type,
          tunnelCode:
            params?.typeCode ?? tunnelCode ?? withdrawConfig?.tunnelCode ?? params?.tunnelCode,
          tabId,
        });
        break;
      case WITHDRAW_TYPE.ONLINE:
        navigation.push("wallet/addOnline", { type, tunnelCode, tabId });
        break;
      default:
        break;
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case WITHDRAW_TYPE.BANK:
        return t("wallet.bankAddress.bankAddressTitle");
      case WITHDRAW_TYPE.CRYPTO:
        return t("wallet.bankAddress.addressListTitle", { type: "USDT" });
      case WITHDRAW_TYPE.ONLINE:
        return t("wallet.bankAddress.addressListTitle", { type: "PIX" });
      case WITHDRAW_TYPE.THIRD:
      case "type-5":
      case "type-6":
        return t("wallet.bankAddress.thirdWallet");
      default:
        return "";
    }
  };

  const chooseBank = (item: WithdrawBankItem) => {
    handleBankCardSelect(item);
    if (!isFirstSelection.current) {
      toast.success(t("common.operationSuccess"));
    }
    isFirstSelection.current = false;
    navigation.goBack();
  };

  useFocusEffect(
    useCallback(() => {
      if (!selectedWithdrawType || selectedWithdrawType.id !== params.type)
        return;
      const tunnelCode = isThirdWalletTabId(params.type)
        ? params.typeCode ?? params.tunnelCode ?? withdrawConfig?.tunnelCode
        : params.tunnelCode ?? withdrawConfig?.tunnelCode;
      void loadBankCardsRef.current(tunnelCode);
    }, [
      selectedWithdrawType,
      params.type,
      params.typeCode,
      params.tunnelCode,
      withdrawConfig?.tunnelCode,
    ]),
  );

  return (
    <SafeAreaView className="flex-1">
      <HideScreenHeader title={getTitle(params?.type || "")} />
      <View className={`px-3 bg-${theme}-background flex-1 pb-3`}>
        <ScrollView
          className="hide-scrollbar flex-1"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {bankCards.map((item: WithdrawBankItem) => {
            const { title, text, realName } = getWithdrawalMethodDisplay(
              item as Record<string, unknown>,
              params.type ?? selectedWithdrawType?.id,
            );
            return (
              <WithdrawalMethodBlock
                key={String(item.id)}
                title={title}
                text={text}
                realName={realName}
                icon={getWithdrawCardIcon(
                  params.type ?? selectedWithdrawType?.id,
                  withdrawConfig?.iconUrl,
                )}
                onPress={() => chooseBank(item)}
                right={
                  <SelectedPayTypeIcon
                    fill={(item as { selected?: boolean }).selected
                      ? Colors[theme].primary
                      : Colors[theme].gray}
                  />
                }
              />
            );
          })}
        </ScrollView>

        <TouchableOpacity
          className={`bg-${theme}-btnText rounded-lg p-3.5 items-center mt-2.5`}
          onPress={() => {
            withdrawPwdModalRef?.current?.toggleModal();
          }}
        >
          <Image
            style={{ width: 35, height: 35 }}
            source={require("@/assets/images/wallet/addto.png")}
          />
          <I18nText
            i18nKey={
              params.type == WITHDRAW_TYPE.BANK
                ? "wallet.withdraw.addBankCard"
                : "wallet.withdraw.addAddress"
            }
            className={`text-${theme}-text text-[#bababa] mt-4`}
            type="subtitle"
          />
        </TouchableOpacity>
        <WithdrawPwdModal ref={withdrawPwdModalRef} handleSuccess={toAddPage} />
      </View>
    </SafeAreaView>
  );
}
