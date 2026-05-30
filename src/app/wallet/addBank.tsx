import { createMemberBanks } from '@/api/post/wallet';
import BaseModal, { ModalRefs } from '@/components/common/BaseModal';
import { HideScreenHeader } from "@/components/common/Header";
import { useToast } from "@/components/common/toast";
import { languageImgMap, languagePhoneNumberMap } from "@/lang/language";
import { I18nText } from '@/components/I18nText';
import { BankNumberAgainIcon, BankNumberIcon, IfscIcon, PaymentChannelIcon, RealNameIcon, SelectedPayTypeIcon, } from "@/components/icons/wallet";
import { BaseButton } from '@/components/ui/BaseButton';
import { BaseCell } from '@/components/ui/BaseCell';
import { ControlledInput } from '@/components/ui/BaseInput';
import { useCommon } from "@/hooks/CommonProvider";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { fetchBankListInfo } from '@/services/wallet/withdrawService';
import { RootState } from '@/store/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from 'react-redux';
import * as z from 'zod';

const pixOptions = [
  { name: 'CPF', code: '1' },
  { name: 'EMAIL', code: '3' },
  { name: 'PHONE', code: '4' },
]

function formatCPF(value: string): string {
  // 只保留数字
  let v = value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);

  if (v.length > 9) {
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  } else if (v.length > 6) {
    return v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (v.length > 3) {
    return v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }

  return v;
}

export default function addBank() {
  const params = useLocalSearchParams()
  const { theme } = useTheme();
  const toggleModalRef = useRef<ModalRefs>(null);
  const togglePixTypeModalRef = useRef<ModalRefs>(null);
  const primaryColor = useThemeColor({}, 'primary');
  const { t } = useTranslation()
  const { language } = useCommon()//语言
  const toast = useToast()
  const [langData, setLangData] = useState({
    url: undefined,
    number: '',
  })
  const [loading, setLoading] = useState(false)
  const [queryParams, setQueryParams] = useState({
    bankCode: '',
    bankExtraInfo: '',
    bankName: '',
    cardNo: '',
    _bankCard: '',
    _bankcard2: '',
    phone: '',
    verifyCode: '',
    userName: '',
    lastRealName: '',
    lastCardNo: '',
    addr: '', // 非PIX则是地址
    pixType: '1', // PIX
  })
  const [bankData, setBankData] = useState({
    bankSelectOptions: []
  });
  const [selectedPayment, selectPayment] = useState<any | null>(null)

  const bankType = useMemo(() => params?.type ?? 1, [params])
  const tunnelCode = useMemo(() => {
    const raw = params?.tunnelCode;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params?.tunnelCode]);

  const toggle = () => {
    toggleModalRef.current?.toggleModal()
  };
  const togglePixTypeModal = () => {
    togglePixTypeModalRef.current?.toggleModal()
  }
  const globalConfig: any = useSelector((state: RootState) => state?.user?.cfg_site_base);

  const isIndiaField = globalConfig?.isIndia ? {
    bankExtraInfo: z.string({ required_error: t('wallet.placeholder.add', { name: 'IFSC' }) })
      .min(1, t('wallet.placeholder.add', { name: 'IFSC' })),
  } : { bankExtraInfo: z.string().optional() }

  const pixMessgae = {
    '1': t('wallet.addBank.cpf'),
    '3': "Email",
    '4': t('wallet.addBank.phone'),
  }

  const isPixField = selectedPayment?.id == 'PIX' ? {
    _bankCard: z.string().optional(),
    _bankcard2: z.string().optional(),
    cardNo: z.string({
      required_error: t('wallet.placeholder.add', { name: pixMessgae[queryParams.pixType as keyof typeof pixMessgae] })
    })
      .min(1, t('wallet.placeholder.add', { name: pixMessgae[queryParams.pixType as keyof typeof pixMessgae] }))
  } : {
    _bankCard: z
      .string({
        required_error: t('wallet.placeholder.add', { name: t('wallet.addBank.bankNo') }),
      }).min(1, t('wallet.placeholder.add', { name: t('wallet.addBank.bankNo') })),
    _bankcard2: z
      .string({
        required_error: t('wallet.placeholder.add', { name: t('wallet.addBank.bankNo') }),
      }).min(1, t('wallet.placeholder.add', { name: t('wallet.addBank.bankNo') })),
    cardNo: z.string().optional()
  }

  const submitSchema = z.object({
    userName: z
      .string({
        required_error: t('wallet.placeholder.add', { name: t('memberInfo.realName') }),
      }).min(1, t('wallet.placeholder.add', { name: t('memberInfo.realName') })),
    // phone: z.string({
    //     required_error: t('wallet.placeholder.add', { name: t('wallet.addBank.phone') }),
    // }).min(1, t('wallet.placeholder.add', { name: t('wallet.addBank.phone') })),
    // verifyCode: z.string({
    //     required_error: t('wallet.placeholder.add', { name: t('wallet.addBank.verifyCode') }),
    // }).min(1, t('wallet.placeholder.add', { name: t('wallet.addBank.verifyCode') })),
    ...isIndiaField,
    // ...isBindCardField,
    ...isPixField,
  }).superRefine((data, ctx) => {
    if (queryParams.bankCode == 'PIX') return
    if (data._bankCard !== data._bankcard2) {
      ctx.addIssue({
        path: ['_bankcard2'],
        code: z.ZodIssueCode.custom,
        message: t('wallet.addOnline.secondVerification', { name: t('wallet.addBank.bankNo') }),
      });
    }
  });

  type FormType = z.infer<typeof submitSchema>;
  const { handleSubmit, control, reset } = useForm<FormType>({
    resolver: zodResolver(submitSchema),
  });

  useEffect(() => {
    loadBankList()
  }, [])

  useEffect(() => {
    setLangData({
      url: languageImgMap[language],
      number: languagePhoneNumberMap[language],
    })
  }, [language])

  const loadBankList = useCallback(async () => {

    const bankListData = await fetchBankListInfo({ type: bankType, tunnelCode });
    if (bankListData?.bankSelectOptions?.length > 0) {
      setBankData(bankListData);
      selectPayment(bankListData.bankSelectOptions[0]);
    }
  }, [bankType, tunnelCode]);

  const submitAddBank = async (data: any) => {
    if (!selectedPayment?.id) return;
    const params = {
      cardNo: data._bankCard,
      realName: data.userName,
      bankCode: selectedPayment.id,
      bankName: selectedPayment.name,
      bankType: bankType,
      payCode: selectedPayment.payCode,
      tunnelTypeCode: tunnelCode,
    }
    setLoading(true);
    const result = await createMemberBanks(params);
    setLoading(false)
    if (result?.data?.data) {
      router.back()
    } else {
      toast.error(t(result?.data?.code))
    }
  }

  const PixFields = useMemo(() => {
    const { name: pixTypeName, code: pixTypeCode } = pixOptions.find(item => item.code == queryParams.pixType) || { name: '', code: '' }
    return (
      <>
        <View className='mt-7'>
          <View className='flex-row items-center'>
            <PaymentChannelIcon className='mr-1.5' fill={primaryColor} />
            <I18nText i18nKey='wallet.addBank.paymentType' className={`text-${theme}-text font-medium`} />
          </View>
          <BaseCell className='mt-2' i18nKey={pixTypeName} dark onPress={togglePixTypeModal} />
        </View>
        <ControlledInput
          control={control}
          value={queryParams.cardNo}
          name="cardNo"
          containerClassName='mt-7'
          className='mt-2'
          inputLabel={pixTypeName}
          inputLabelIcon={<RealNameIcon fill={primaryColor} />}
          leftText={pixTypeCode == '4' ? '+55' : undefined}
          dark
          borderStyle='darkRounded'
          placeholder={t('wallet.placeholder.add1', { name: pixMessgae[queryParams.pixType as keyof typeof pixMessgae] })}
          onChange={(event) => {
            const text = pixTypeCode == '1' ? formatCPF(event?.nativeEvent?.text) : event?.nativeEvent?.text
            setQueryParams(prev => ({ ...prev, cardNo: text }))
          }}
        />
      </>
    )
  }, [queryParams.bankCode, queryParams.pixType, queryParams.cardNo])

  const OtherFields = useMemo(() => {
    return (
      <>
        <ControlledInput
          control={control}
          name="_bankCard"
          containerClassName='mt-7'
          className='mt-2'
          inputLabel={t('wallet.addBank.bankNo')}
          inputLabelIcon={<BankNumberIcon fill={primaryColor} />}
          dark
          borderStyle='darkRounded'
          placeholder={t('wallet.placeholder.add1', { name: t('wallet.addBank.bankNo') })}
        />
        <ControlledInput
          control={control}
          name="_bankcard2"
          containerClassName='mt-7'
          className='mt-2'
          inputLabel={t('wallet.placeholder.againAdd1', { name: t('wallet.addBank.bankNo') })}
          inputLabelIcon={<BankNumberAgainIcon fill={primaryColor} />}
          dark
          borderStyle='darkRounded'
          placeholder={t('wallet.placeholder.add1', { name: t('wallet.addBank.bankNo') })}
        />
        <ControlledInput
          control={control}
          name="bankExtraInfo"
          containerClassName='mt-7'
          className='mt-2'
          inputLabel='IFSC'
          inputLabelIcon={<IfscIcon fill={primaryColor} />}
          dark
          borderStyle='darkRounded'
          placeholder={t('wallet.placeholder.add1', { name: 'IFSC' })}
        />
        {/* {
                globalConfig?.isIndia && 
                <ControlledInput
                    control={control}
                    name="bankExtraInfo" 
                    containerClassName='mt-7' 
                    className='mt-2' 
                    inputLabel='IFSC' 
                    inputLabelIcon={<IfscIcon fill={primaryColor} />} 
                    dark 
                    borderStyle='darkRounded' 
                    placeholder={t('wallet.placeholder.add1', { name: 'IFSC' })}
                />
            } */}
      </>
    )
  }, [queryParams.bankCode, globalConfig?.isIndia, langData])

  return (
    <SafeAreaView className='flex-1'>
      <HideScreenHeader title={t('wallet.addBank.addBankTitle')} />
      <View className={`px-3 bg-${theme}-background flex-1`}>
        <ScrollView
          className='hide-scrollbar flex-1'
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View className={`bg-${theme}-btnText px-5 py-2.5 rounded-full mt-4 mb-1`}>
            <I18nText i18nKey='wallet.addBank.addBankTips' className={`text-${theme}-warn`} type='subtitle' />
          </View>
          <View className='mt-7'>
            <View className='flex-row items-center'>
              <PaymentChannelIcon className='mr-1.5' />
              <I18nText i18nKey='wallet.addBank.paymentChannel' className={`text-${theme}-text font-medium`} />
            </View>
            <BaseCell className='mt-2' i18nKey={selectedPayment?.name || 'wallet.recharge.selectPaymentMethod'} dark onPress={() => {
              if (!bankData?.bankSelectOptions?.length) {
                toast.error(t('common.noConfig'));
                return;
              }
              toggle()
            }} />
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
          {queryParams.bankCode === 'PIX' ? PixFields : OtherFields}
          <I18nText className={`text-${theme}-primary my-2.5`} i18nKey='wallet.addBank.addBankTips' type='tiptitle' />
        </ScrollView>
        <BaseButton isLoading={loading} className='mt-8 mb-4' i18nKey='common.saveText' roundedFull gradient onPress={handleSubmit(submitAddBank)} />
      </View>
      <BaseModal
        ref={toggleModalRef}
        style={{ bottom: 0, margin: 0, top: 0, justifyContent: 'flex-end' }}
        centerOnDesktop={false}
        coverScreen={false}
        backdropColor="#111111"
        backdropOpacity={0.3}
        children={
          <View className={`bg-${theme}-background w-full rounded-tl-lg rounded-tr-lg`}>
            <View className='flex-row items-center justify-center py-4'>
              <I18nText i18nKey='wallet.recharge.selectPaymentMethod' className={`text-${theme}-text`} type='title' />
            </View>
            <ScrollView
              className={`hide-scrollbar bg-${theme}-btnText`}
              style={{ maxHeight: 400, paddingVertical: 24 }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {
                bankData?.bankSelectOptions.map((item: any, index) => (
                  <BaseCell
                    key={index}
                    i18nKey={item.name}
                    dark
                    showArrow={false}
                    rightIcon={selectedPayment?.id === item.id ? (
                      <SelectedPayTypeIcon fill={primaryColor} />
                    ) : <View className={`rounded-full w-5 h-5 bg-${theme}-background`}></View>}
                    onPress={() => {
                      toggle()
                      reset()
                      selectPayment(item)
                    }}
                  />
                ))
              }
            </ScrollView>
          </View>
        }
      />
      <BaseModal
        ref={togglePixTypeModalRef}
        style={{ bottom: 0, margin: 0, top: 0, justifyContent: 'flex-end' }}
        centerOnDesktop={false}
        coverScreen={false}
        backdropColor="#111111"
        backdropOpacity={0.3}
        children={
          <View className={`bg-${theme}-background w-full h-4/6 rounded-tl-lg rounded-tr-lg`}>
            <View className='flex-row items-center justify-center py-4'>
              <I18nText
                i18nKey='wallet.placeholder.select'
                values={{ name: t('wallet.addBank.paymentType') }} className={`text-${theme}-text`} type='title' />
            </View>
            <ScrollView
              className='hide-scrollbar flex-1'
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {
                pixOptions.map((item, index) => (
                  <BaseCell
                    key={index}
                    i18nKey={item.name}
                    dark
                    showArrow={false}
                    rightIcon={queryParams.pixType === item.code ? (
                      <SelectedPayTypeIcon fill={primaryColor} />
                    ) : <View className={`rounded-full w-5 h-5 bg-${theme}-background`}></View>}
                    onPress={() => {
                      togglePixTypeModal()
                      reset()
                      setQueryParams(prev => ({ ...prev, pixType: item.code, cardNo: '' }))
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
