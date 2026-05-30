import { ScrollView, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { HideScreenHeader } from "@/components/common/Header";
import { I18nText } from '@/components/I18nText';
import { ControlledInput } from '@/components/ui/BaseInput';
import { BaseButton } from '@/components/ui/BaseButton';
import { BaseCell } from '@/components/ui/BaseCell';
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { NetIcon, UsdtIcon, UsdtAgainIcon, SelectedPayTypeIcon } from "@/components/icons/wallet"
import { useThemeColor } from "@/hooks/useThemeColor";
import BaseModal, { ModalRefs } from '@/components/common/BaseModal';
import { createMemberCrypt } from '@/api/post/wallet'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router'
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { showErrorAlert } from '@/utils/alertUtils';
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchBankListInfo } from '@/services/wallet/withdrawService';

interface UsdtOption {
  name: string;
  id: string;
  text: string;
  value: string;
}

export default function addBank() {
  const params = useLocalSearchParams()
  const { theme } = useTheme();
  const toggleModalRef = useRef<ModalRefs>(null);
  const primaryColor = useThemeColor({}, 'primary');
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false)
  const [queryParams, setQueryParams] = useState<UsdtOption | null>(null)
  const [options, setOptions] = useState<Array<UsdtOption>>([]);

  const toggle = () => {
    toggleModalRef.current?.toggleModal()
  };

  const submitSchema = z.object({
    cardNo: z
      .string({
        required_error: t('wallet.placeholder.add', { name: t('wallet.addUsdt.usdtAddress') }),
      }).min(1, t('wallet.placeholder.add', { name: t('wallet.addUsdt.usdtAddress') })),
    _cardNo: z
      .string({
        required_error: t('wallet.placeholder.add', { name: t('wallet.addUsdt.usdtAddress') }),
      }).min(1, t('wallet.placeholder.add', { name: t('wallet.addUsdt.usdtAddress') })),
  }).refine(data => {
    return data.cardNo === data._cardNo
  }, {
    message: t('wallet.addOnline.secondVerification', { name: t('wallet.addUsdt.usdtAddress') }),
    path: ['repassword']
  })

  type FormType = z.infer<typeof submitSchema>;
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(submitSchema),
  });

  const submitAddBank = async (data: any) => {
    if (!queryParams?.id) return;
    setLoading(true)
    const result = await createMemberCrypt({ address: data.cardNo, typeCode: queryParams.id })
    setLoading(false)
    if (result?.data?.data) {
      setQueryParams(null);
      router.back()
    } else {
      showErrorAlert(result?.data?.msg)
    }
  }

  const loadBankList = useCallback(async () => {
    await fetchBankListInfo({ type: params?.type ?? 2 })
      .then(({ bankSelectOptions }) => {
        if (Array.isArray(bankSelectOptions)) {
          setOptions(bankSelectOptions);
          if (bankSelectOptions.length > 0) {
            setQueryParams(bankSelectOptions[0])
          };
        }
      })
  }, [params]);

  useEffect(() => {
    loadBankList()
  }, [])

  return (
    <SafeAreaView className='flex-1'>
      <HideScreenHeader title={t('wallet.addUsdt.addUsdtWallet')} />
      <View className={`px-3 bg-${theme}-background flex-1`}>
        <View className={`bg-${theme}-btnText px-5 py-2.5 rounded-full mt-4 mb-1`}>
          <I18nText i18nKey='wallet.addUsdt.addTip' className={`text-${theme}-warn`} type='subtitle' />
        </View>
        <View className='mt-7'>
          <View className='flex-row items-center'>
            <NetIcon className='mr-1.5' fill={primaryColor} />
            <I18nText i18nKey='wallet.addUsdt.chooseMainNet' className={`text-${theme}-text font-medium`} />
          </View>
          <BaseCell className='mt-2' i18nKey={queryParams?.name || t('wallet.addUsdt.chooseMainNet')} dark onPress={toggle} />
        </View>
        <ControlledInput
          control={control}
          name="cardNo"
          containerClassName='mt-7'
          className='mt-2'
          inputLabel={t('wallet.addOnline.walletAddress')}
          inputLabelIcon={<UsdtIcon fill={primaryColor} />}
          dark
          borderStyle='darkRounded'
          placeholder={t('wallet.placeholder.add', { name: t('wallet.addUsdt.usdtAddress') })}
        />
        <ControlledInput
          control={control}
          name="_cardNo"
          containerClassName='mt-7'
          className='mt-2'
          inputLabel={t('wallet.addUsdt.secondaryUsdt')}
          inputLabelIcon={<UsdtAgainIcon fill={primaryColor} />}
          dark
          borderStyle='darkRounded'
          placeholder={t('wallet.placeholder.add', { name: t('wallet.addUsdt.usdtAddress') })}
        />
        <BaseButton isLoading={loading} className='mt-12' i18nKey='common.saveText' roundedFull gradient onPress={handleSubmit(submitAddBank)} />
      </View>
      <BaseModal
        ref={toggleModalRef}
        style={{ bottom: 0, margin: 0, top: 0, justifyContent: 'flex-end' }}
        coverScreen={false}
        backdropColor="#111111"
        backdropOpacity={0.3}
        children={
          <View className={`bg-${theme}-background w-full rounded-tl-lg rounded-tr-lg`}>
            <View className='flex-row items-center justify-center py-4'>
              <I18nText i18nKey='wallet.addUsdt.chooseMainNet' className={`text-${theme}-text`} type='title' />
            </View>
            <ScrollView
              className={`hide-scrollbar bg-${theme}-btnText`}
              style={{ maxHeight: 400, paddingVertical: 24 }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {
                options.map((item, index) => (
                  <BaseCell
                    key={item.id}
                    i18nKey={item.name}
                    dark
                    showArrow={false}
                    rightIcon={queryParams?.name === item.name ? <SelectedPayTypeIcon fill={primaryColor} /> : null}
                    onPress={() => {
                      toggle()
                      setQueryParams(item)
                    }}
                  />
                ))
              }
            </ScrollView>
          </View>
        }
      />
    </SafeAreaView>
  )
}