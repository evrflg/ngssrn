import { InterConnectWalletBlock } from "@/components/wallet/InterConnectWalletBlock";
import { I18nText } from "@/components/I18nText";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React, { useMemo } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { WITHDRAW_TYPE } from "../../shared/constants";
import {
  getWithdrawalMethodDisplay,
  getWithdrawCardIcon,
} from "../../shared/utils";
import { InterConnectWallet, WithdrawBankItem, WithdrawConfig, WithdrawTab } from "../../shared/types";
import { WithdrawalMethodBlock } from "./WithdrawalMethodBlock";

interface CardAreaProps {
  /** 当前已选中的银行卡（由 bankCards.find(selected) 计算） */
  currentBankCard: WithdrawBankItem | undefined;
  withdrawConfig: WithdrawConfig | null;
  selectedWithdrawType: WithdrawTab | null;
  isThirdInterConnectWallet: boolean;
  interConnectWallet: InterConnectWallet;
  isNavigating: boolean;
  isPwdSet: boolean;
  onGoToAddressPage: () => void;
  onGoToAddPage: () => void;
  onShowWithdrawPwdModal: () => void;
  onShowPwdModal: () => void;
  withdrawTypes: WithdrawTab[];
  baseIndex: number;
  onRefreshWallet: () => void;
  onGoToWallet: () => void;
}

export const CardArea = React.memo(
  ({
    currentBankCard,
    withdrawConfig,
    selectedWithdrawType,
    isThirdInterConnectWallet,
    interConnectWallet,
    isNavigating,
    isPwdSet,
    onGoToAddressPage,
    onGoToAddPage,
    onShowWithdrawPwdModal,
    onShowPwdModal,
    withdrawTypes,
    baseIndex,
    onRefreshWallet,
    onGoToWallet,
  }: CardAreaProps) => {
    const { theme } = useTheme();

    const cardIcon = useMemo(
      () => getWithdrawCardIcon(selectedWithdrawType?.id, withdrawConfig?.iconUrl),
      [selectedWithdrawType?.id, withdrawConfig?.iconUrl],
    );

    if (isThirdInterConnectWallet) {
      return (
        <View className="mb-4">
          <InterConnectWalletBlock
            info={{ address: interConnectWallet.address, balance: interConnectWallet.balance }}
            onRefresh={onRefreshWallet}
            onGoWallet={onGoToWallet}
            isGoLoading={isNavigating}
          />
        </View>
      );
    }

    if (currentBankCard) {
      const card = currentBankCard as Record<string, unknown>;
      const { title, text, realName } = getWithdrawalMethodDisplay(
        card,
        selectedWithdrawType?.id,
      );

      return (
        <View className="mb-4">
          <WithdrawalMethodBlock
            title={title}
            text={text}
            realName={realName}
            icon={cardIcon}
            onPress={onGoToAddressPage}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        className={`mb-4 bg-${theme}-btnText rounded-lg p-3.5 items-center`}
        onPress={() => {
          if (isPwdSet) {
            onShowWithdrawPwdModal();
          } else {
            onShowPwdModal();
          }
        }}
      >
        <Image
          style={{ width: 35, height: 35 }}
          source={require("@/assets/images/wallet/addto.png")}
        />
        <I18nText
          i18nKey={
            withdrawTypes[baseIndex]?.id === WITHDRAW_TYPE.BANK
              ? "wallet.withdraw.addBankCard"
              : "wallet.addThird.addWallet"
          }
          className={`text-${theme}-text text-[#bababa] mt-4`}
          type="subtitle"
        />
      </TouchableOpacity>
    );
  },
);
