import { createMemberPix } from "@/api/post/wallet";
import BaseModal, { ModalRefs } from "@/components/common/BaseModal";
import { HideScreenHeader } from "@/components/common/Header";
import { useToast } from "@/components/common/toast";
import { I18nText } from "@/components/I18nText";
import { BankNumberAgainIcon, BankNumberIcon, NetIcon, PixIcon, RealNameIcon, SelectedPayTypeIcon } from "@/components/icons/wallet";
import { BaseButton } from "@/components/ui/BaseButton";
import { BaseCell } from "@/components/ui/BaseCell";
import { ControlledInput } from "@/components/ui/BaseInput";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { fetchBankListInfo } from "@/services/wallet/withdrawService";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as z from "zod";

export default function addOnline() {
  const { theme } = useTheme();
  const primaryColor = useThemeColor({}, "primary");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const toast = useToast();
  const toggleModalRef = useRef<ModalRefs>(null);
  const [options, setOptions] = useState<Array<any>>([]);
  const [selectedOption, selectOption] = useState<any>(null);
  const bankType = useMemo(() => params?.type ?? 3, [params]);
  const tunnelCode = useMemo(() => {
    const raw = params?.tunnelCode;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params?.tunnelCode]);

  const toggle = () => {
    if (selectedOption == null) {
      toast.warn(t("common.noConfig"));
      return;
    }
    toggleModalRef.current?.toggleModal();
  };

  const submitSchema = z
    .object({
      userName: z
        .string({
          required_error: t('wallet.placeholder.add', { name: t('memberInfo.realName') }),
        }).min(1, t('wallet.placeholder.add', { name: t('memberInfo.realName') })),
      pixName: z.string().optional(),
      cardNo: z
        .string({
          required_error: t("wallet.placeholder.add", {
            name: t("wallet.addOnline.walletAddress"),
          }),
        })
        .min(
          1,
          t("wallet.placeholder.add", { name: t("wallet.addOnline.walletAddress") })
        ),
      _cardNo: z
        .string({
          required_error: t("wallet.placeholder.add", {
            name: t("wallet.addOnline.walletAddress"),
          }),
        })
        .min(
          1,
          t("wallet.placeholder.add", { name: t("wallet.addOnline.walletAddress") })
        ),
    })
    .refine(
      (data) => {
        return data.cardNo === data._cardNo;
      },
      {
        message: t("wallet.addOnline.secondVerification", {
          name: t("wallet.addOnline.walletAddress"),
        }),
        path: ["_cardNo"],
      }
    );

  type FormType = z.infer<typeof submitSchema>;
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(submitSchema),
  });

  const createWallet = async (data: any) => {
    if (!selectedOption) return;
    setLoading(true);
    const result = await createMemberPix({
      realName: data.userName,
      typeCode: selectedOption.id,
      pix: data.pixName || data.cardNo,
      cpf: data.cardNo,
    });
    setLoading(false);
    if (result?.data?.data) {
      toast.success(t('common.success'))
      router.back();
    } else {
      toast.error(t(result?.data.code));
    }
  };

  useEffect(() => {
    fetchBankListInfo({ type: bankType, ...(tunnelCode ? { tunnelCode } : {}) }).then(
      ({ bankSelectOptions }) => {
        if (bankSelectOptions && Array.isArray(bankSelectOptions)) {
          setOptions(bankSelectOptions);
          if (bankSelectOptions.length > 0) selectOption(bankSelectOptions[0]);
        }
      },
    );
  }, [bankType, tunnelCode]);

  return (
    <SafeAreaView className="flex-1">
      <HideScreenHeader title={t("wallet.addOnline.addOnlineWallet")} />
      <View className={`px-3 bg-${theme}-background flex-1`}>
        <View
          className={`bg-${theme}-btnText px-5 py-2.5 rounded-full mt-4 mb-1`}
        >
          <I18nText
            i18nKey="wallet.addOnline.addOnlineWalletTip"
            className={`text-${theme}-warn`}
            type="subtitle"
          />
        </View>
        <View className="mt-7">
          <View className="flex-row items-center">
            <NetIcon className="mr-1.5" />
            <I18nText
              i18nKey="wallet.addOnline.walletName"
              className={`text-${theme}-text font-medium`}
            />
          </View>
          <BaseCell
            className="mt-2"
            i18nKey={selectedOption?.name || t("wallet.addOnline.selectWalletName")}
            dark
            onPress={toggle}
          />
        </View>
        <ControlledInput
          control={control}
          name="userName"
          containerClassName='mt-7'
          className='mt-2'
          inputLabel={t('wallet.addOnline.accountName')}
          inputLabelIcon={<RealNameIcon fill={primaryColor} />}
          dark
          borderStyle='darkRounded'
          placeholder={t('wallet.placeholder.add1', { name: t('memberInfo.realName') })}
        />
        {selectedOption?.name === 'PHONE' && (
          <ControlledInput
            control={control}
            name="pixName"
            containerClassName="mt-7"
            className="mt-2"
            inputLabel="PIX"
            inputLabelIcon={<PixIcon fill={primaryColor} />}
            dark
            borderStyle="darkRounded"
            placeholder={t("wallet.addOnline.inputCPFPlaceholder")}
          />
        )}
        <ControlledInput
          control={control}
          name="cardNo"
          containerClassName="mt-7"
          className="mt-2"
          inputLabel="CPF"
          inputLabelIcon={<BankNumberIcon fill={primaryColor} />}
          dark
          borderStyle="darkRounded"
          placeholder={t("wallet.addOnline.inputCPFPlaceholder")}
        />
        <ControlledInput
          control={control}
          name="_cardNo"
          containerClassName="mt-7"
          className="mt-2"
          inputLabel={`${t("common.confirm")}CPF`}
          inputLabelIcon={<BankNumberAgainIcon fill={primaryColor} />}
          dark
          borderStyle="darkRounded"
          placeholder={t("wallet.placeholder.add", {
            name: t("wallet.addOnline.walletAddress"),
          })}
        />
        <BaseButton
          isLoading={loading}
          className="mt-12"
          i18nKey="common.saveText"
          roundedFull
          gradient
          onPress={handleSubmit(createWallet)}
        />
      </View>
      <BaseModal
        ref={toggleModalRef}
        style={{ bottom: 0, margin: 0, top: 0, justifyContent: "flex-end" }}
        coverScreen={false}
        backdropColor="#111111"
        backdropOpacity={0.3}
        children={
          <View
            className={`bg-${theme}-background w-full rounded-tl-lg rounded-tr-lg`}
          >
            <ScrollView
              className={`hide-scrollbar bg-${theme}-btnText`}
              style={{ maxHeight: 400, paddingVertical: 24 }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {options.map((item) => (
                <BaseCell
                  key={item.id}
                  i18nKey={item.name}
                  dark
                  showArrow={false}
                  rightIcon={
                    selectedOption?.id === item.id ? (
                      <SelectedPayTypeIcon fill={primaryColor} />
                    ) : null
                  }
                  onPress={() => {
                    toggle();
                    selectOption(item)
                  }}
                />
              ))}
            </ScrollView>
          </View>
        }
      />
    </SafeAreaView>
  );
}
