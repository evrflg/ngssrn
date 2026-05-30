import { ScrollView, View } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { HideScreenHeader } from "@/components/common/Header";
import { I18nText } from "@/components/I18nText";
import { ControlledInput } from "@/components/ui/BaseInput";
import { BaseButton } from "@/components/ui/BaseButton";
import { BaseCell } from "@/components/ui/BaseCell";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { NetIcon, UsdtIcon, UsdtAgainIcon, SelectedPayTypeIcon } from "@/components/icons/wallet";
import { useThemeColor } from "@/hooks/useThemeColor";
import { createMemberThird, getWalletListInfo } from "@/api/post/wallet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { router, useLocalSearchParams } from "expo-router";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "@/components/common/toast";
import BaseModal, { ModalRefs } from "@/components/common/BaseModal";


export default function addThird() {
  const { theme } = useTheme();
  const primaryColor = useThemeColor({}, "primary");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const toast = useToast();
  const toggleModalRef = useRef<ModalRefs>(null);
  const [options, setOptions] = useState<Array<any>>([]);
  const [selectedOption, selectOption] = useState<any>(null);

  const bankType = useMemo(() => {
    const raw = params?.type;
    const v = Array.isArray(raw) ? raw[0] : raw;
    if (v == null || v === "") return 4;
    const n = Number(v);
    return Number.isFinite(n) ? n : 4;
  }, [params?.type]);
  const tunnelCode = useMemo(() => {
    const raw = params?.tunnelCode;
    if (raw == null || raw === "") return undefined;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params?.tunnelCode]);


  const toggle = () => {
    toggleModalRef.current?.toggleModal();
  };

  const submitSchema = z
    .object({
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
    const result = await createMemberThird({
      address: data.cardNo,
      typeCode: selectedOption.code,
      tunnalCode: selectedOption.tunnalCode,
      payCode: selectedOption.payCode,
      });
    setLoading(false);
    if (result?.data?.data) {
      toast.success(t("common.operationSuccess"));
      router.back();
    } else {
      toast.error(result?.data.msg);
    }
  };


  useEffect(() => {
    getWalletListInfo({ tunnelCode }).then(({ data }) => {
      if (data.data && Array.isArray(data.data)) {
        setOptions(data.data);
        if (data.data.length > 0) selectOption(data.data[0]);
      } else {
        toast.error(data.msg);
      }
    });
  }, [tunnelCode]);


  return (
    <SafeAreaView className="flex-1">
      <HideScreenHeader title={t("wallet.addThird.addWallet")} />
      <View className={`px-3 bg-${theme}-background flex-1`}>
        <View
          className={`bg-${theme}-btnText px-5 py-2.5 rounded-full mt-4 mb-1`}
        >
          <I18nText
            i18nKey="wallet.addThird.addWalletTip"
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
            i18nKey={selectedOption?.payName || t("wallet.addOnline.selectWalletName")}
            dark
            onPress={toggle}
          />
        </View>
        <ControlledInput
          control={control}
          name="cardNo"
          containerClassName="mt-7"
          className="mt-2"
          inputLabel={t("wallet.addOnline.walletAddress")}
          inputLabelIcon={<UsdtIcon fill={primaryColor} />}
          dark
          borderStyle="darkRounded"
          placeholder={t("wallet.placeholder.add", {
            name: t("wallet.addOnline.walletAddress"),
          })}
        />
        <ControlledInput
          control={control}
          name="_cardNo"
          containerClassName="mt-7"
          className="mt-2"
          inputLabel={t("wallet.addUsdt.secondaryUsdt")}
          inputLabelIcon={<UsdtAgainIcon fill={primaryColor} />}
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
                  key={item.code}
                  i18nKey={item.payName}
                  dark
                  showArrow={false}
                  rightIcon={
                    selectedOption?.code === item.code ? (
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
