import { InterConnectWalletBlock } from "@/components/wallet/InterConnectWalletBlock";
import { I18nText } from "@/components/I18nText";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React, { useMemo } from "react";
import { Image, ImageSourcePropType, TouchableOpacity, View } from "react-native";
import { WITHDRAW_TYPE } from "../../shared/constants";
import { InterConnectWallet, WithdrawBankItem, WithdrawTab } from "../../shared/types";
import { WithdrawalMethodBlock } from "./WithdrawalMethodBlock";

interface CardAreaProps {
  /** 当前已选中的银行卡（由 bankCards.find(selected) 计算） */
  currentBankCard: WithdrawBankItem | undefined;
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

function getCardIcon(withdrawTypeId?: string): ImageSourcePropType {
  switch (withdrawTypeId) {
    case WITHDRAW_TYPE.CRYPTO:
      return require("@/assets/images/wallet/usdt-logo.png");
    default:
      return require("@/assets/images/wallet/pix.png");
  }
}

export const CardArea = React.memo(
  ({
    currentBankCard,
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
      () => getCardIcon(selectedWithdrawType?.id),
      [selectedWithdrawType?.id],
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
      const card = currentBankCard as any;
      const userName =
        selectedWithdrawType?.id === WITHDRAW_TYPE.BANK ? card.realName : card.username;
      let walletAddress = "";
      switch (selectedWithdrawType?.id) {
        case WITHDRAW_TYPE.BANK:
          walletAddress = card.cardNo;
          break;
        case WITHDRAW_TYPE.ONLINE:
          walletAddress = card.pix;
          break;
        default:
          walletAddress = card.cardNo || card.address;
          break;
      }

      return (
        <View className="mb-4">
          <WithdrawalMethodBlock
            title={card.bankName || card.bankCode || card.typeCode || ""}
            text={walletAddress}
            realName={userName || ""}
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
