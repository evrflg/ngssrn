import { HideScreenHeader } from "@/components/common/Header";
import { I18nText } from "@/components/I18nText";
import { SelectedPayTypeIcon } from "@/components/icons/wallet";
import { ModalRefs } from "@/components/common/BaseModal";
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
import { useWithdrawData } from "@/modules/wallet/withdraw/hooks/useWithdrawData";
import { WithdrawalMethodBlock } from "@/modules/wallet/withdraw/components/WithdrawalMethodBlock";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

function getCardIcon(type?: string): ImageSourcePropType {
  switch (type) {
    case WITHDRAW_TYPE.CRYPTO:
      return require("@/assets/images/wallet/usdt-logo.png");
    default:
      return require("@/assets/images/wallet/pix.png");
  }
}

export default function addBank() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const withdrawPwdModalRef = useRef<ModalRefs>(null);
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ type?: string; tunnelCode?: string }>();
  const { t } = useTranslation();
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
    if (tab.tabId) {
      await syncWithdrawTabId(tab.tabId);
    }
  }, [withdrawTypes, baseIndex, selectedWithdrawType, params.type]);

  const toAddPage = () => {
    void persistWithdrawTabContext();
    const type = withdrawTypeMap[params?.type as keyof typeof withdrawTypeMap];
    switch (params?.type) {
      case WITHDRAW_TYPE.BANK:
        navigation.push("wallet/addBank", {
          type,
          tunnelCode: withdrawConfig?.tunnelCode || params?.tunnelCode,
        });
        break;
      case WITHDRAW_TYPE.CRYPTO:
        navigation.push("wallet/addUsdt", { type });
        break;
      case WITHDRAW_TYPE.THIRD:
      case "type-5":
      case "type-6":
        navigation.push("wallet/addThird", {
          type,
          tunnelCode: withdrawConfig?.tunnelCode || params?.tunnelCode,
        });
        break;
      case WITHDRAW_TYPE.ONLINE:
        navigation.push("wallet/addOnline", { type });
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
    navigation.goBack();
  };

  useFocusEffect(
    useCallback(() => {
      if (!selectedWithdrawType || selectedWithdrawType.id !== params.type)
        return;
      void loadBankCardsRef.current(
        params.tunnelCode ?? withdrawConfig?.tunnelCode,
      );
    }, [
      selectedWithdrawType,
      params.type,
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
          {bankCards.map((item: any) => {
            const userName =
              selectedWithdrawType?.id === WITHDRAW_TYPE.BANK
                ? item.realName
                : item.username;
            let address = "";
            switch (selectedWithdrawType?.id) {
              case WITHDRAW_TYPE.BANK:
                address = item.cardNo;
                break;
              case WITHDRAW_TYPE.ONLINE:
                address = item.pix;
                break;
              default:
                address = item.cardNo || item.address;
                break;
            }
            return (
              <WithdrawalMethodBlock
                key={String(item.id)}
                title={item.bankName || item.bankCode || item.typeCode || ""}
                text={address}
                realName={userName || ""}
                icon={getCardIcon(params.type)}
                onPress={() => chooseBank(item)}
                right={
                  <SelectedPayTypeIcon
                    fill={item.selected ? Colors[theme].primary : Colors[theme].gray}
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
