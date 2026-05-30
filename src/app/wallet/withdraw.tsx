// import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
// import {
//   Text,
//   View,
//   Image,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Platform,
//   ActivityIndicator,
//   Pressable,
// } from "react-native";
// import { createThirdMember, loginThirdMember, queryThirdMember } from "@/api";
// import { InterConnectWalletBlock } from "@/components/wallet/InterConnectWalletBlock";
// import { isNumericString, openWindowWithURLFromServer } from "@/utils/utils";
// import { showErrorAlert } from "@/utils/alertUtils";
// import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
// import { useTheme } from "@/hooks/theme/ThemeProvider";
// import { I18nText } from "@/components/I18nText";
// import { BaseButton } from "@/components/ui/BaseButton";
// import { useTranslation } from "react-i18next";
// import { useThemeColor } from "@/hooks/useThemeColor";
// import { BaseCell } from "@/components/ui/BaseCell";
// import { BaseInput } from "@/components/ui/BaseInput";
// import BaseTab from "@/components/common/BaseTab";
// import { HideScreenHeader } from "@/components/common/Header";
// import { BanlanceInfo } from "@/components/wallet/BalanceInfo";
// import {
//   isThirdInterConnectWithdrawType,
//   useWithdraw,
//   withdrawTypeMap,
// } from "@/hooks/wallet/useWithdraw";
// import { WithdrawTabContent } from "@/components/wallet/WithdrawTabContent";
// import { WITHDRAW_TYPE } from "@/services/wallet/withdrawService";
// import { Colors } from "@/constants/Colors";
// import { WithdrawPwdModal } from "@/components/wallet/WithdrawPwdModal";
// import { ModalRefs } from "@/components/common/BaseModal";
// import { ConfiremModal } from "@/components/common/modal/ConfirmModal";
// import { useToast } from "@/components/common/toast";
// import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
// import { RootState } from "@/store/store";
// import { AppDispatch } from "@/store/store";
// import { useDispatch, useSelector } from "react-redux";
// import { accInfoAsync } from "@/store/user/userSlice";
// import { replaceHomeAfterAuthLoss } from "@/api/common/client";
// import DownloadGuide from "@/components/home/popup/downloadGuide/DownloadGuide";
// import NoData from "@/components/common/NoData";
// import { MoneySelectorCheckedIcon } from "@/components/icons/wallet";

// export default function Withdraw() {
//   const insets = useSafeAreaInsets();
//   const isWeb = Platform.OS === "web";
//   const router = useRouter();
//   const dispatch: AppDispatch = useDispatch();
//   const { theme } = useTheme();
//   const { t } = useTranslation();
//   const themeColor = useThemeColor({}, "primary");
//   const primaryColor = themeColor;
//   const withdrawPwdModalRef = useRef<ModalRefs>(null);
//   const [pwdModal, setPwdModal] = useState(false);
//   const [isSubmit, setIsSubmit] = useState(false);
//   const pendingGoSettingRef = useRef(false);
//   const consumedSkipParamRef = useRef(false);
//   const toast = useToast();
//   // 添加一个ref来跟踪是否是从其他页面返回
//   const isReturningFromOtherPage = useRef(false);
//   /** 本页曾处于已登录（用于区分「从未登录」与「被挤下线」） */
//   const withdrawWasAuthedRef = useRef(false);
//   const userInfo = useSelector((state: RootState) => state?.user?.userInfo);
//   const session = useSelector((state: RootState) => state?.user?.session);
//   const { skipPwdModal } = useLocalSearchParams<{ skipPwdModal?: string }>();

//   // 使用提现Hook
//   const {
//     globalConfig,
//     withdrawConfig,
//     bankCards,
//     withdrawAmount,
//     withdrawPassword,
//     withdrawTypes,
//     baseIndex,
//     isLoading,
//     isWithdrawFormValid,
//     serviceCharge,
//     withdrawRate,
//     isPwdSet,
//     selectedWithdrawType,
//     setBaseIndex,
//     handleWithdrawAmountChange,
//     handleWithdrawPasswordChange,
//     submitWithdraw,
//     toAddPage,
//     toAddressPage,
//     checkWithdrawPassword,
//     loadBankCards,
//     isThirdInterConnectWallet,
//     pendingOrdersCount
//   } = useWithdraw({ initData: true });

//   /** loadBankCards 随选中 tab 变引用；若放进 useFocusEffect 的 deps，切 tab 会误触发「重新 focus」逻辑 */
//   const loadBankCardsRef = useRef(loadBankCards);
//   loadBankCardsRef.current = loadBankCards;

//   const currentBankCard = useMemo(() => bankCards.find((cc) => cc.selected), [bankCards]);

//   const recomMoneys = useMemo(
//     () =>
//       String(withdrawConfig?.recomMoneys || "")
//         .split(",")
//         .filter((val) => !!val && isNumericString(val)),
//     [withdrawConfig],
//   );

//   const isWithdrawValid = useMemo(() => {
//     let isValid = true;
//     if(withdrawConfig?.drawTimes !== undefined && withdrawConfig?.freeDrawTimes !== undefined) {
//       isValid = Number(withdrawConfig.drawTimes) >= Number(withdrawConfig.freeDrawTimes)
//     } else {
//       isValid = false
//     }
//     // applyWhenUnhandleExist: 0 = 允許（有未處理訂單仍可提現），1 = 阻擋
//     if (withdrawConfig?.applyWhenUnhandleExist === 1 && pendingOrdersCount > 0) {
//       isValid = false;
//     }
//     return isValid;
//   }, [withdrawConfig, pendingOrdersCount])

//   const currentWithdrawTab = withdrawTypes[baseIndex];
//   const apiWithdrawType =
//     currentWithdrawTab?.id != null
//       ? withdrawTypeMap[currentWithdrawTab.id as keyof typeof withdrawTypeMap]
//       : undefined;
//   const thirdInterConnectWithdrawType = isThirdInterConnectWithdrawType(apiWithdrawType)
//     ? apiWithdrawType
//     : undefined;

//   const [interConnectWallet, setInterConnectWallet] = useState({
//     address: "",
//     balance: 0,
//   });
//   const [isLoadingInterGo, setIsLoadingInterGo] = useState(false);
//   const fetchedInterConnectTypesRef = useRef<Set<number>>(new Set());

//   useEffect(() => {
//     if (!isThirdInterConnectWallet) {
//       setInterConnectWallet({ address: "", balance: 0 });
//     }
//   }, [isThirdInterConnectWallet]);

//   useEffect(() => {
//     if (!isThirdInterConnectWallet || thirdInterConnectWithdrawType == null) return;
//     let cancelled = false;
//     (async () => {
//       const wt = thirdInterConnectWithdrawType;
//       try {
//         if (fetchedInterConnectTypesRef.current.has(wt)) {
//           const { data: qRes } = await queryThirdMember({ withdrawType: wt });
//           if (cancelled) return;
//           const qd = qRes?.data;
//           if (qd?.walletAddress) {
//             setInterConnectWallet({
//               address: qd.walletAddress,
//               balance: Number(qd.balanceAmount ?? 0),
//             });
//           }
//         } else {
//           const { data: cRes } = await createThirdMember({ withdrawType: wt });
//           if (cancelled) return;
//           const cd = cRes?.data;
//           if (cd?.walletAddress) {
//             fetchedInterConnectTypesRef.current.add(wt);
//             setInterConnectWallet({
//               address: cd.walletAddress,
//               balance: Number(cd.balanceAmount ?? 0),
//             });
//           }
//         }
//       } catch {
//         try {
//           const { data: q2 } = await queryThirdMember({ withdrawType: wt });
//           if (!cancelled && q2?.data?.walletAddress) {
//             setInterConnectWallet({
//               address: q2.data.walletAddress,
//               balance: Number(q2.data.balanceAmount ?? 0),
//             });
//           }
//         } catch {}
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [isThirdInterConnectWallet, thirdInterConnectWithdrawType, baseIndex]);

//   const refreshInterConnectWallet = useCallback(async () => {
//     if (thirdInterConnectWithdrawType == null) return;
//     const { data: r } = await queryThirdMember({
//       withdrawType: thirdInterConnectWithdrawType,
//     });
//     const d = r?.data;
//     if (d?.walletAddress) {
//       setInterConnectWallet({
//         address: d.walletAddress,
//         balance: Number(d.balanceAmount ?? 0),
//       });
//     }
//   }, [thirdInterConnectWithdrawType]);

//   const toInterConnectWallet = useCallback(() => {
//     if (thirdInterConnectWithdrawType == null) return;
//     setIsLoadingInterGo(true);
//     openWindowWithURLFromServer({
//       params: { withdrawType: thirdInterConnectWithdrawType },
//       request: loginThirdMember,
//       urlKey: "payUrl",
//       onFail: () => showErrorAlert(t("common.operationFailed")),
//       onFinally: () => setIsLoadingInterGo(false),
//     });
//   }, [thirdInterConnectWithdrawType, t]);

//   useEffect(() => {
//     if (skipPwdModal !== "1") {
//       consumedSkipParamRef.current = false;
//     }
//   }, [skipPwdModal]);

//   /** 层级限额在 useWithdraw 拉通道时已写入 tab.rankWithdrawLimit；无则退回接口 min/max */
//   const withdrawLimit = useMemo(() => {
//     const tabLimit = withdrawTypes[baseIndex]?.rankWithdrawLimit;
//     if (tabLimit) {
//       return {
//         minDrawMoney: tabLimit.minDrawMoney,
//         maxDrawMoney: tabLimit.maxDrawMoney,
//       };
//     }
//     return {
//       minDrawMoney: Number(withdrawConfig?.minDrawMoney) || 0,
//       maxDrawMoney: Number(withdrawConfig?.maxDrawMoney) || 0,
//     };
//   }, [withdrawTypes, baseIndex, withdrawConfig?.minDrawMoney, withdrawConfig?.maxDrawMoney]);

//   // 没银行卡先绑定银行卡（仅已登录：挤下线后避免再拉 accInfo、再弹未设密码窗）
//   useFocusEffect(
//     useCallback(() => {
//       if (!userInfo?.isLogin || !session?.accessToken) return;
//       dispatch(accInfoAsync());
//       if (skipPwdModal === "1" && !consumedSkipParamRef.current) {
//         consumedSkipParamRef.current = true;
//         setPwdModal(false);
//         return;
//       }
//       if (!isPwdSet) setPwdModal(true);
//     }, [dispatch, isPwdSet, skipPwdModal, userInfo?.isLogin, session?.accessToken]),
//   );

//   useEffect(() => {
//     const authed = !!(userInfo?.isLogin && session?.accessToken);
//     if (authed) {
//       withdrawWasAuthedRef.current = true;
//       return;
//     }
//     setPwdModal(false);
//     withdrawPwdModalRef.current?.closeModal?.();
//     if (withdrawWasAuthedRef.current) {
//       withdrawWasAuthedRef.current = false;
//       replaceHomeAfterAuthLoss();
//     }
//   }, [userInfo?.isLogin, session?.accessToken]);

//   // 修改toAddressPage函数，添加标记
//   const handleToAddressPage = useCallback(() => {
//     isReturningFromOtherPage.current = true;
//     toAddressPage();
//   }, [toAddressPage]);

//   useFocusEffect(
//     useCallback(() => {
//       // 只有当从其他页面返回且提现类型已加载时，才重新加载银行卡数据
//       if (isReturningFromOtherPage.current && withdrawTypes.length > 0) {
//         isReturningFromOtherPage.current = false; // 重置标记
//       }
//     }, [withdrawTypes]),
//   );

//   useFocusEffect(
//     useCallback(() => {
//       if (!userInfo?.isLogin || !session?.accessToken) return;
//       void loadBankCardsRef.current();
//     }, [userInfo?.isLogin, session?.accessToken]),
//   );

//   // 处理提现提交
//   const handleWithdrawSubmit = useCallback(
//     async (passwordOverride?: string) => {
//       // 再次检查密码是否设置
//       if (!isPwdSet) {
//         setPwdModal(true);
//         setIsSubmit(false);
//         return;
//       }

//       const minDrawMoney = withdrawLimit.minDrawMoney;
//       const maxDrawMoney = withdrawLimit.maxDrawMoney;
//       const amount = Number(withdrawAmount || 0);
//       if (amount < minDrawMoney || amount > maxDrawMoney) {
//         toast.warn(
//           t("wallet.withdraw.withdrawOverRangeWithRange", {
//             min: minDrawMoney,
//             max: maxDrawMoney,
//           }),
//         );
//         setIsSubmit(false);
//         return;
//       }

//       const balance = userInfo?.money || 0;
//       if (amount > balance) {
//         toast.warn(t("wallet.withdraw.noMoney"));
//         setIsSubmit(false);
//         return;
//       }
//       try {
//         const result = await submitWithdraw(passwordOverride);

//         if (result?.code === 0 && result?.data === true) {
//           dispatch(accInfoAsync());
//           toast.success(t("wallet.withdraw.withdrawSuccess"));
//           handleWithdrawAmountChange("");
//           if (isThirdInterConnectWithdrawType(apiWithdrawType) && apiWithdrawType != null) {
//             queryThirdMember({ withdrawType: apiWithdrawType }).then(({ data: r }) => {
//               const d = r?.data;
//               if (d?.walletAddress) {
//                 setInterConnectWallet({
//                   address: d.walletAddress,
//                   balance: Number(d.balanceAmount ?? 0),
//                 });
//               }
//             });
//           }
//         } else {
//           toast.error(t(result?.code).replace(/\{0\}/g, String(withdrawConfig?.drawNeedBetNum ?? 0)));
//         }
//       } catch {
//         toast.error(t("wallet.withdraw.withdrawError"));
//       } finally {
//         setIsSubmit(false);
//       }
//     },
//     [
//       checkWithdrawPassword,
//       submitWithdraw,
//       dispatch,
//       t,
//       router,
//       isPwdSet,
//       handleWithdrawAmountChange,
//       withdrawAmount,
//       withdrawLimit,
//       userInfo?.money,
//       apiWithdrawType,
//     ],
//   );

//   const renderTabsContent = useCallback(
//     (tab: any, index: number) => (
//       <WithdrawTabContent tab={tab} index={index} currentIndex={baseIndex} theme={theme} />
//     ),
//     [baseIndex, theme],
//   );

//   const usdtValue = useMemo(() => {
//     if (withdrawAmount && withdrawRate && withdrawAmount) {
//       return (Number(withdrawAmount) / Number(withdrawRate)).toFixed(2).toString();
//     }
//     return "0";
//   }, [withdrawAmount, withdrawRate]);

//   useEffect(() => {
//     handleWithdrawAmountChange("0");
//   }, [baseIndex, handleWithdrawAmountChange]);

//   const renderSelectedBankCardContent = () => {
//     if (!!currentBankCard) {
//       const { realName, username, cardNo, pix, address, bankName, bankCode, typeCode } =
//         currentBankCard as any;
//       const userName = selectedWithdrawType?.id === WITHDRAW_TYPE.BANK ? realName : username;
//       let walletAddress = "";
//       switch (selectedWithdrawType?.id) {
//         case WITHDRAW_TYPE.BANK:
//           walletAddress = cardNo;
//           break;
//         case WITHDRAW_TYPE.ONLINE:
//           walletAddress = pix;
//           break;
//         default:
//           walletAddress = cardNo || address;
//           break;
//       }
//       return (
//         <View className={`bg-${theme}-btnText rounded-lg`}>
//           <BaseCell
//             className="px-1"
//             key={currentBankCard.id}
//             leftIcon={
//               <Image
//                 style={{ width: 24, height: 24 }}
//                 resizeMode="contain"
//                 source={
//                   selectedWithdrawType?.id === WITHDRAW_TYPE.CRYPTO
//                     ? require("@/assets/images/wallet/usdt-logo.png")
//                     : require("@/assets/images/wallet/pix.png")
//                 }
//               />
//             }
//             i18nKey={`${userName}/${bankName || bankCode || typeCode}`}
//             extraText={walletAddress}
//             dark
//             onPress={handleToAddressPage}
//           />
//         </View>
//       );
//     }

//     return (
//       <TouchableOpacity
//         className={`bg-${theme}-btnText rounded-lg p-3.5 items-center`}
//         onPress={() => {
//           if (isPwdSet) {
//             withdrawPwdModalRef?.current?.toggleModal();
//           } else {
//             setPwdModal(true);
//           }
//         }}
//       >
//         <Image
//           style={{ width: 35, height: 35 }}
//           source={require("@/assets/images/wallet/addto.png")}
//         />
//         <I18nText
//           i18nKey={
//             withdrawTypes[baseIndex]?.id == WITHDRAW_TYPE.BANK
//               ? "wallet.withdraw.addBankCard"
//               : "wallet.withdraw.addAddress"
//           }
//           className={`text-${theme}-text text-[#bababa] mt-4`}
//           type="subtitle"
//         />
//       </TouchableOpacity>
//     );
//   };

//   // 渲染银行卡提现内容
//   const BankWithdrawContent = useMemo(() => {
//     return (
//       <>
//         <View className="mb-4">
//           {isThirdInterConnectWallet ? (
//             <InterConnectWalletBlock
//               info={{
//                 address: interConnectWallet.address,
//                 balance: interConnectWallet.balance,
//               }}
//               onRefresh={refreshInterConnectWallet}
//               onGoWallet={toInterConnectWallet}
//               isGoLoading={isLoadingInterGo}
//             />
//           ) : (
//             renderSelectedBankCardContent()
//           )}
//         </View>

//         {/* 提现金额 */}
//         <View className={`mb-4 bg-${theme}-btnText rounded-lg p-4`}>
//           <View className="flex-row flex-wrap gap-x-[2%] mb-2">
//             {recomMoneys.map((option) => (
//               <Pressable
//                 key={`recommend-money-${option}`}
//                 className={`w-[32%] p-2 mb-2 rounded-lg border bg-${theme}-blockBg2 ${
//                   withdrawAmount === option
//                     ? `border-${theme}-primary bg-${theme}-btnText`
//                     : `border-${theme}-blockBg2 bg-${theme}-blockBg2`
//                 }`}
//                 onPress={() => handleWithdrawAmountChange(option)}
//               >
//                 <Text
//                   className={`text-center ${
//                     withdrawAmount == option ? `text-${theme}-primary` : `text-${theme}-gray`
//                   }`}
//                 >
//                   {option}
//                 </Text>
//                 {withdrawAmount == option && (
//                   <View pointerEvents="none" className="absolute -right-px -bottom-px">
//                     <MoneySelectorCheckedIcon fill={Colors[theme].primary} width={30} height={22} />
//                   </View>
//                 )}
//               </Pressable>
//             ))}
//           </View>
//           {withdrawTypes[baseIndex]?.id === WITHDRAW_TYPE.CRYPTO && (
//             <View className="flex-row gap-2 mb-[10px]">
//               <Image
//                 style={{ width: 20, height: 20 }}
//                 source={require("@/assets/images/wallet/usdt-logo.png")}
//               />
//               <I18nText
//                 i18nKey="wallet.withdraw.selectUSDTAmount"
//                 className={`text-${theme}-text`}
//               />
//             </View>
//           )}
//           <BaseInput
//             value={withdrawAmount}
//             onChangeText={handleWithdrawAmountChange}
//             keyboardType="numeric"
//             placeholder={
//               withdrawLimit.minDrawMoney || withdrawLimit.maxDrawMoney
//                 ? t("wallet.withdraw.moneyPlaceholder", {
//                     min: withdrawLimit.minDrawMoney,
//                     max: withdrawLimit.maxDrawMoney,
//                   })
//                 : t("wallet.withdraw.enterWithdrawAmount")
//             }
//             inputClassName="pl-2"
//             dark
//           />
//           {/* USDT汇率转换显示 */}
//           {withdrawTypes[baseIndex]?.id === WITHDRAW_TYPE.CRYPTO && (
//             <BaseInput
//               leftIcon={
//                 <Image
//                   style={{ width: 20, height: 20 }}
//                   source={require("@/assets/images/wallet/usdt-logo.png")}
//                 />
//               }
//               value={usdtValue}
//               readOnly
//               dark
//             />
//           )}

//           {!!withdrawConfig && (
//             <>
//               <View className="flex-row justify-between mt-3">
//                 <View className="flex-row items-center">
//                   <I18nText
//                     i18nKey="wallet.withdraw.accountBalance"
//                     type="tiptitle"
//                     className={`text-${theme}-text`}
//                   />
//                   <I18nText
//                     i18nKey={`${globalConfig?.money_unit || ""}${(userInfo?.money || 0).toFixed(2)}`}
//                     type="tiptitle"
//                     className={`text-${theme}-primary ml-1.5`}
//                   />
//                 </View>
//                 <BaseButton
//                   className="rounded"
//                   style={{
//                     borderWidth: 1,
//                     borderColor: Colors[theme].primary,
//                     paddingHorizontal: 12,
//                     paddingVertical: 4,
//                     minHeight: 28,
//                   }}
//                   textClassName="text-xs"
//                   i18nKey="status.allText"
//                   size="custom"
//                   variant="outline"
//                   onPress={() => handleWithdrawAmountChange(String(userInfo?.money || ""))}
//                 />
//               </View>
//               {withdrawTypes[baseIndex]?.id === WITHDRAW_TYPE.CRYPTO && (
//                 <View className="flex-row items-center mt-3">
//                   <I18nText
//                     i18nKey="wallet.withdraw.usdtRate"
//                     type="tiptitle"
//                     className={`text-${theme}-text`}
//                   />
//                   <I18nText
//                     i18nKey={withdrawRate}
//                     type="tiptitle"
//                     className={`text-${theme}-primary ml-1.5`}
//                   />
//                 </View>
//               )}
//               <View className="flex-row justify-between mt-3">
//                 <I18nText
//                   i18nKey="wallet.withdraw.withdrawFee"
//                   type="tiptitle"
//                   className={`text-${theme}-text`}
//                 />
//                 <I18nText
//                   i18nKey={`${globalConfig?.money_unit || ""}${serviceCharge}`}
//                   type="tiptitle"
//                   className={`text-${theme}-primary`}
//                 />
//               </View>
//               <View className="flex-row justify-between mt-3">
//                 <I18nText
//                   i18nKey="wallet.withdraw.currentBet"
//                   type="tiptitle"
//                   className={`text-${theme}-text`}
//                 />
//                 <I18nText
//                   i18nKey={`${globalConfig?.money_unit || ""}${withdrawConfig?.curBetNum}`}
//                   type="tiptitle"
//                   className={`text-${theme}-primary`}
//                 />
//               </View>
//               <View className="flex-row justify-between mt-3">
//                 <I18nText
//                   i18nKey="wallet.withdraw.withdrawRequiredBet"
//                   type="tiptitle"
//                   className={`text-${theme}-text`}
//                 />
//                 <I18nText
//                   i18nKey={`${globalConfig?.money_unit || ""}${withdrawConfig?.drawNeedBetNum}`}
//                   type="tiptitle"
//                   className={`text-${theme}-primary`}
//                 />
//               </View>
//             </>
//           )}

//           {/* 提现按钮 */}
//           <View className="mt-4">
//             <BaseButton
//               i18nKey="wallet.withdraw.submitWithdraw"
//               onPress={() => {
//                 setIsSubmit(true);
//                 withdrawPwdModalRef?.current?.toggleModal();
//               }}
//               gradient
//               roundedFull
//               disabled={!isWithdrawFormValid || !isWithdrawValid || isLoading}
//             />
//           </View>

//           {/* 提现说明 */}
//           <View className="mb-4">
//             <View className={`bg-${theme}-btnText rounded-lg pt-5 gap-2`}>
//               <View className="flex-row items-center" style={{ direction: "ltr" }}>
//                 <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45`} />
//                 <I18nText
//                   i18nKey="wallet.withdraw.withdrawDescription1"
//                   values={{
//                     money: `${globalConfig?.money_unit || ""}${withdrawConfig?.drawNeedBetNum - withdrawConfig?.curBetNum || "0"}`,
//                   }}
//                   className={`text-${theme}-text flex-1`}
//                   style={{ textAlign: "left", writingDirection: "ltr" }}
//                   type="subtitle"
//                   transComponents={{
//                     span: <Text style={{ color: Colors[theme].primary }} />,
//                   }}
//                 />
//               </View>
//               <View className="flex-row items-center">
//                 <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45`} />
//                 <I18nText
//                   i18nKey="wallet.withdraw.withdrawDescription2"
//                   values={{ time: `00:00-23:59` }}
//                   className={`text-${theme}-text flex-1`}
//                   style={{ textAlign: "left", writingDirection: "ltr" }}
//                   type="subtitle"
//                   transComponents={{
//                     span: <Text style={{ color: Colors[theme].primary }} />,
//                   }}
//                 />
//               </View>
//               <View className="flex-row items-center">
//                 <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45`} />
//                 <I18nText
//                   i18nKey="wallet.withdraw.times"
//                   values={{
//                     remainTimes:
//                       Number(withdrawConfig?.freeDrawTimes) > 0
//                         ? Number(withdrawConfig?.freeDrawTimes)
//                         : 0,
//                     totalTimes:
//                       Number(withdrawConfig?.drawTimes) > 0 ? Number(withdrawConfig?.drawTimes) : 0,
//                   }}
//                   className={`text-${theme}-text flex-1`}
//                   style={{ textAlign: "left", writingDirection: "ltr" }}
//                   type="subtitle"
//                   transComponents={{
//                     span: <Text style={{ color: Colors[theme].primary }} />,
//                   }}
//                 />
//               </View>
//               <View className="flex-row items-center">
//                 <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45`} />
//                 <I18nText
//                   i18nKey="wallet.withdraw.withdrawDescription4"
//                   values={{
//                     rangeMoney: `${globalConfig?.money_unit || ""}${withdrawLimit.minDrawMoney ?? "0"}-${globalConfig?.money_unit || ""}${withdrawLimit.maxDrawMoney ?? "999999"}`,
//                   }}
//                   className={`text-${theme}-text flex-1`}
//                   style={{ textAlign: "left", writingDirection: "ltr" }}
//                   type="subtitle"
//                   transComponents={{
//                     span: <Text style={{ color: Colors[theme].primary }} />,
//                   }}
//                 />
//               </View>
//               <View className="flex-row items-center">
//                 <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45`} />
//                 <I18nText
//                   i18nKey={t("wallet.withdraw.currentBet")}
//                   className={`text-${theme}-text`}
//                   type="subtitle"
//                 />
//                 <I18nText
//                   i18nKey={` ${Number(withdrawConfig?.curBetNum ?? 0)}`}
//                   type="tiptitle"
//                   className={`text-${theme}-primary`}
//                 />
//               </View>
//               <View className="flex-row items-center">
//                 <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45`} />
//                 <I18nText
//                   i18nKey={t("wallet.withdraw.withdrawDescription5")}
//                   className={`text-${theme}-text flex-1`}
//                   type="subtitle"
//                   style={{
//                     textAlign: "left",
//                     writingDirection: "ltr",
//                   }}
//                 />
//               </View>
//               <View className="flex-row items-center">
//                 <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45`} />
//                 <I18nText
//                   i18nKey={t("wallet.withdraw.withdrawDescription6")}
//                   className={`text-${theme}-text flex-1`}
//                   style={{ textAlign: "left", writingDirection: "ltr" }}
//                   type="subtitle"
//                 />
//               </View>
//               { withdrawConfig?.withdrawTips && (
//               <View className="flex-row items-center">
//                 <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45`} />
//                 <I18nText
//                   i18nKey={withdrawConfig?.withdrawTips}
//                   className={`text-${theme}-text flex-1`}
//                   style={{ textAlign: "left", writingDirection: "ltr" }}
//                   type="subtitle"
//                 />
//               </View>
//               )}
//             </View>
//           </View>
//         </View>
//       </>
//     );
//   }, [
//     globalConfig,
//     bankCards,
//     withdrawAmount,
//     withdrawPassword,
//     withdrawConfig,
//     theme,
//     primaryColor,
//     selectedWithdrawType,
//     handleWithdrawAmountChange,
//     handleWithdrawPasswordChange,
//     t,
//     serviceCharge,
//     isWithdrawFormValid,
//     isLoading,
//     withdrawTypes,
//     baseIndex,
//     withdrawLimit,
//     currentBankCard,
//     handleToAddressPage,
//     handleWithdrawSubmit,
//     isThirdInterConnectWallet,
//     interConnectWallet,
//     refreshInterConnectWallet,
//     toInterConnectWallet,
//     isLoadingInterGo,
//   ]);

//   // 如果正在加载配置，显示加载状态
//   // if (isLoading && !withdrawConfig) {
//   //   return (
//   //     <SkeletonPageView
//   //       type="payment"
//   //       config={{
//   //         showBalance: true,
//   //         showActions: true,
//   //         transactionCount: 4,
//   //         colorMode: 'light'
//   //       }}
//   //     />
//   //   );
//   // }

//   const onPasswordConfirm = (password: string) => {
//     if (!isSubmit) toAddPage();
//     else {
//       handleWithdrawPasswordChange(password);
//       handleWithdrawSubmit(password);
//     }
//   };
//   return (
//     <SafeAreaView
//       className="flex-1"
//       style={[
//         { backgroundColor: Colors[theme].background },
//         isWeb ? ({ flex: 1, minHeight: 0, height: "100%" } as const) : null,
//       ]}
//     >
//       <HideScreenHeader
//         title={t("pageName.withdraw")}
//         rightEvent={{
//           rightText: t("pageName.withdrawRecord"),
//           onRightPress: () => router.push("/wallet/withdrawRecord"),
//         }}
//       />
//       <View style={{ flex: 1, minHeight: 0 }}>
//         <ScrollView
//           className="hide-scrollbar"
//           style={isWeb ? StyleSheet.absoluteFillObject : { flex: 1, minHeight: 0 }}
//           contentContainerStyle={{
//             paddingBottom: Math.max(insets.bottom, 16) + 72,
//           }}
//           showsVerticalScrollIndicator={isWeb}
//           showsHorizontalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//           nestedScrollEnabled
//           bounces
//         >
//           <View className={`px-3 mb-3 bg-${theme}-background gap-3`}>
//             <BanlanceInfo />
//             {withdrawTypes.length === 0 ? (
//               isLoading ? (
//                 <View className="items-center justify-center py-16">
//                   <ActivityIndicator size="large" color={primaryColor} />
//                 </View>
//               ) : (
//                 <NoData style={{ marginTop: 48, marginBottom: 24 }} />
//               )
//             ) : (
//               <>
//                 <BaseTab
//                   selectedIndex={baseIndex}
//                   setIndex={setBaseIndex}
//                   tabs={withdrawTypes}
//                   scrollStyle={{ marginTop: 0 }}
//                   renderItem={renderTabsContent}
//                   showNumber={3}
//                   wrap
//                 />
//                 {BankWithdrawContent}
//               </>
//             )}
//           </View>
//         </ScrollView>
//       </View>
//       <View>
//         <WithdrawPwdModal
//           ref={withdrawPwdModalRef}
//           handleSuccess={onPasswordConfirm}
//           handleReject={() => setIsSubmit(false)}
//         />
//       </View>
//       <View>
//         <ConfiremModal
//           isVisible={[pwdModal, setPwdModal]}
//           hideIconGradient
//           iconOverlapTop={48}
//           icon={
//             <Image
//               source={require("@/assets/images/wallet/withdrawPwdWarning.png")}
//               style={{ width: 64, height: 120 }}
//               resizeMode="contain"
//             />
//           }
//           title={t("wallet.withdraw.withdrawPasswordNotSet")}
//           onConfirm={() => {
//             pendingGoSettingRef.current = true;
//             setPwdModal(false);
//           }}
//           onModalHide={() => {
//             if (!pendingGoSettingRef.current) return;
//             pendingGoSettingRef.current = false;
//             router.push({
//               pathname: "/my/settingCenter",
//               params: { type: "withdrawPassword" },
//             });
//           }}
//           onCancel={() => {
//             pendingGoSettingRef.current = false;
//             router.replace("/wallet");
//           }}
//         />
//       </View>

//       {isWeb && <DownloadGuide />}
//     </SafeAreaView>
//   );
// }

export { default } from "@/modules/wallet/withdraw";
