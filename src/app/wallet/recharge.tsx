// import { createThirdMember, loginThirdMember, queryThirdMember } from "@/api";
// import BaseTab from "@/components/common/BaseTab";
// import { HideScreenHeader } from "@/components/common/Header";
// import { useToast } from "@/components/common/toast";
// import { PublicitiesList } from "@/components/home/popup/publicitiesList/PublicitiesList";
// import { I18nText } from "@/components/I18nText";
// import {
//   BankSelectIcon,
//   BankTypeIcon,
//   MoneySelectorCheckedIcon,
//   RechargeIcon,
// } from "@/components/icons/wallet";
// import { BaseButton } from "@/components/ui/BaseButton";
// import { BaseInput } from "@/components/ui/BaseInput";
// import { BanlanceInfo } from "@/components/wallet/BalanceInfo";
// import { DepositPasswordPopup } from "@/components/wallet/DepositPasswordPopup";
// import { RechargeTabContent } from "@/components/wallet/RechargeTabContent";
// import { Colors } from "@/constants/Colors";
// import { useTheme } from "@/hooks/theme/ThemeProvider";
// import { useThemeColor } from "@/hooks/useThemeColor";
// import { useRecharge } from "@/hooks/wallet/useRecharge";
// import { fetchDepositBonus } from "@/services/wallet/rechargeService";
// import { Tenant, tenantStore } from "@/store/tenant/tenantSlice";
// import { PublicityType } from "@/types/publicity";
// import { showErrorAlert } from "@/utils/alertUtils";
// import { rf } from "@/utils/scaleFont";
// import { formatMoney, openWindowWithURLFromServer } from "@/utils/utils";
// import { Ionicons } from "@expo/vector-icons";
// import { useIsFocused } from "@react-navigation/native";
// import * as Clipboard from "expo-clipboard";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   ActivityIndicator,
//   Animated,
//   Image,
//   ImageBackground,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useSelector } from "react-redux";
// import Svg, {
//   Defs,
//   LinearGradient as SvgLinearGradient,
//   Stop,
//   Text as SvgText,
// } from "react-native-svg";
// import DownloadGuide from "@/components/home/popup/downloadGuide/DownloadGuide";
// import { Platform } from "react-native";

// const isWeb = Platform.OS === "web";
// const DEPOSIT_BTN_AMOUNT_GRAD_TOP = "#FFD076";
// const DEPOSIT_BTN_AMOUNT_GRAD_BOTTOM = "#DCA21B";
// const DEPOSIT_BTN_AMOUNT_STROKE = "#BF9126";

// function DepositBonusAmountText({ amount }: { amount: string }) {
//   const fontSize = rf(24);
//   const svgH = Math.ceil(fontSize * 1.2);
//   const approxW = Math.ceil(Math.max(amount.length * fontSize * 0.58 + 8, fontSize * 2));
//   const gradId = React.useId().replace(/[^a-zA-Z0-9]/g, "_");
//   const textY = fontSize * 0.92;

//   return (
//     <View style={{ marginLeft: 2 }}>
//       <Svg width={approxW} height={svgH}>
//         <Defs>
//           <SvgLinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
//             <Stop offset="0" stopColor={DEPOSIT_BTN_AMOUNT_GRAD_TOP} />
//             <Stop offset="1" stopColor={DEPOSIT_BTN_AMOUNT_GRAD_BOTTOM} />
//           </SvgLinearGradient>
//         </Defs>
//         <SvgText
//           fill={`url(#${gradId})`}
//           stroke={DEPOSIT_BTN_AMOUNT_STROKE}
//           strokeWidth={1}
//           fontSize={fontSize}
//           fontWeight="700"
//           x={1}
//           y={textY}
//         >
//           {amount}
//         </SvgText>
//       </Svg>
//     </View>
//   );
// }

// interface InterConnectWallet {
//   walletAddress: string;
//   balance: number;
// }

// export default function Recharge() {
//   // const navigation = useNavigation<NativeStackNavigationProp<any>>();
//   const { theme } = useTheme();
//   const { t } = useTranslation();
//   const router = useRouter();
//   const isFocused = useIsFocused();
//   const primaryColor = useThemeColor({}, "primary");
//   const toast = useToast();
//   const tenantInfo: Tenant = useSelector(tenantStore);

//   // 使用封装的充值Hook
//   const {
//     rechargeTypes,
//     baseIndex,
//     isLoading,
//     amount,
//     currentPayIndex,
//     joinDepositGift,
//     remark,
//     error,
//     setAmount,
//     setRemark,
//     setBaseIndex,
//     setJoinDepositGift,
//     setCurrentPayIndex,
//     clearQueryParams,
//     submitRecharge,
//     handleSetAmount,
//   } = useRecharge();
//   const currentRecharge = rechargeTypes[baseIndex];
//   const currentPay = useMemo(
//     () => currentRecharge?.payList[currentPayIndex],
//     [currentPayIndex, currentRecharge],
//   );
//   const selectedTunnel = useMemo(() => currentPay?.tunnels?.[0] ?? null, [currentPay]);
//   const isInterConnectWallet = useMemo(() => selectedTunnel?.ossWallet === 1, [selectedTunnel]);
//   const needInputPassword = useMemo(() => selectedTunnel?.verifyTradePwd === 0, [selectedTunnel]);

//   const [interConnectWallet, setInterConnectWallet] = useState<InterConnectWallet>({
//     walletAddress: "",
//     balance: 0,
//   }); // 互通钱包
//   const [isLoadingWallet, setLoadingWallet] = useState(false);
//   const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
//   const refreshSpin = React.useRef(new Animated.Value(0)).current;
//   const isRefreshSpinningRef = React.useRef(false);
//   const [tradePwd, setTradePwd] = useState("");
//   const [fetchedIds] = useState<Record<string, string>>({});
//   const passwordModalRef = React.useRef<any>(null);
//   const passwordSet = React.useRef(new Map<string, number>());

//   // 处理充值提交
//   const handleRechargeSubmit = async () => {
//     if (!selectedTunnel && !currentPay) return;
//     // 如果是互通钱包且需要先输入交易密码
//     if (isInterConnectWallet && needInputPassword) {
//       const id = selectedTunnel?.id as string;
//       const setInputPassword = passwordSet.current.get(id);

//       // 如果是互通钱包且密码未设置，显示密码弹窗
//       if (!setInputPassword) {
//         passwordModalRef.current?.toggleModal();
//         return;
//       }
//     }

//     // 否则直接提交
//     try {
//       await submitRecharge(tradePwd, selectedTunnel || currentPay).then(() => {
//         fetchWalletInfo();
//         resetRechargeState();
//       });
//     } catch (err) {
//       console.error("充值提交失败:", err);
//     }
//   };

//   // 密码弹窗确认回调
//   const onPasswordResolved = async (password: string) => {
//     setTradePwd(password);
//     try {
//       const result = await submitRecharge(password, selectedTunnel);
//       resetRechargeState();

//       // 如果是互通钱包，检查响应
//       if (isInterConnectWallet && result) {
//         const data = result.data || result;
//         const payUrl = data?.payUrl || data?.data?.payUrl;

//         // 如果 payUrl 为 null 或空，表示成功，记录密码已设置
//         if (payUrl === null || payUrl === "") {
//           const id = selectedTunnel?.id as string;
//           passwordSet.current.set(id, 1);

//           // 刷新钱包信息
//           setTimeout(() => {
//             fetchWalletInfo();
//           }, 800);
//         }
//       }
//     } catch (err) {
//       console.error("充值提交失败:", err);
//     }
//   };

//   // 重置充值状态
//   const resetRechargeState = () => {
//     setAmount("");
//     setRemark("");
//   };

//   // 密码弹窗取消回调
//   const onPasswordRejected = () => {
//     // 用户取消输入密码，不做任何操作
//   };

//   const usdtValue = useMemo(() => {
//     if (currentPay && currentPay.depositRate && amount) {
//       return (Number(amount) * Number(currentPay.depositRate)).toFixed(2).toString();
//     }
//     return "0";
//   }, [currentPay, amount]);

//   const [giftMoney, setGiftMoney] = useState<number>(0);

//   useEffect(() => {
//     const tunnelId = selectedTunnel?.id;
//     if (!tunnelId || !amount || amount === "0") {
//       setGiftMoney(0);
//       return;
//     }
//     fetchDepositBonus({ tunnelId, depositMoney: amount })
//       .then((res) => {
//         if (res?.code === 0 && res?.data) {
//           setGiftMoney((res.data.depositBonus ?? 0) + (res.data.recomBonus ?? 0));
//         } else {
//           setGiftMoney(0);
//         }
//       })
//       .catch(() => setGiftMoney(0));
//   }, [currentPay, amount, currentRecharge]);

//   const showBonusBtn =
//     currentRecharge?.id === "online" && joinDepositGift && giftMoney > 0 && !isLoading;

//   const depositButtonBackground = useMemo(() => {
//     if (theme === "greenBlack") {
//       return require("@/assets/images/finance/green_button.png");
//     }
//     if (theme === "blueWhite") {
//       return require("@/assets/images/finance/blue_button.png");
//     }
//     return require("@/assets/images/finance/orange_button.png");
//   }, [theme]);

//   const depositGiftStarlightBg = useMemo(() => {
//     if (theme === "greenBlack") {
//       return require("@/assets/images/finance/starlight1_green_and_cyan.webp");
//     }
//     if (theme === "blueWhite") {
//       return require("@/assets/images/finance/starlight1_blue.webp");
//     }
//     return require("@/assets/images/finance/starlight1_orange.webp");
//   }, [theme]);

//   const depositBtnDisabledDim = isLoading || !amount ? { opacity: 0.5 } : undefined;

//   const depositDisplayLabelColor = useMemo(() => {
//     if (theme === "greenBlack") {
//       return Colors[theme].btnText;
//     }
//     return "#fff";
//   }, [theme]);
//   const depositLoadingColor = theme === "greenBlack" ? Colors[theme].btnText : "#fff";
//   const getPayMethodBadge = useCallback((tab: any) => {
//     const tunnelBadge = tab?.tunnels?.find((tunnel: any) => tunnel?.tunnelBadge)?.tunnelBadge;
//     return tunnelBadge || tab?.payBadge || "";
//   }, []);

//   const renderTabsContent = useCallback(
//     (tab: any, index: number) => {
//       return (
//         <RechargeTabContent
//           tab={tab}
//           index={index}
//           currentIndex={baseIndex}
//           theme={theme}
//           // depositBonusInfo={depositBonusInfo}
//         />
//       );
//     },
//     [baseIndex, theme, t],
//   );

//   const copyToClipboard = async (text: string) => {
//     await Clipboard?.setStringAsync(text);
//     toast.success(t("common.copySuccess"));
//   };

//   const createInterConWalAcc = async (tunnelId: string) => {
//     setIsRefreshingBalance(true);
//     await createThirdMember({ tunnelId: selectedTunnel?.id })
//       .then(({ data: resposne }) => {
//         if (resposne.data) {
//           setInterConnectWallet({
//             walletAddress: resposne.data.walletAddress,
//             balance: resposne.data.balanceAmount,
//           });
//         }
//       })
//       .finally(() => {
//         setIsRefreshingBalance(false);
//       });
//   };

//   const searchInterConWalAcc = async (tunnelId: string) => {
//     setIsRefreshingBalance(true);
//     // 如果创建失败，调查询接口s
//     await queryThirdMember({
//       tunnelId: selectedTunnel?.id,
//     })
//       .then(({ data: resposne }) => {
//         if (resposne.data) {
//           setInterConnectWallet({
//             walletAddress: resposne.data.walletAddress,
//             balance: resposne.data.balanceAmount,
//           });
//         }
//       })
//       .finally(() => {
//         setIsRefreshingBalance(false);
//       });
//   };

//   const fetchWalletInfo = async () => {
//     if (isInterConnectWallet && currentRecharge?.id === "online" && selectedTunnel?.id) {
//       try {
//         setLoadingWallet(true);
//         if (fetchedIds[selectedTunnel.id]) {
//           await searchInterConWalAcc(selectedTunnel.id);
//         } else {
//           await createInterConWalAcc(selectedTunnel.id);
//         }
//       } catch {
//       } finally {
//         setLoadingWallet(false);
//       }
//     }
//   };

//   const onRefresh = () => {
//     if (selectedTunnel?.id && currentRecharge?.id == "online") {
//       searchInterConWalAcc(selectedTunnel.id);
//     }
//   };

//   const refreshSpinRotate = useMemo(
//     () =>
//       refreshSpin.interpolate({
//         inputRange: [0, 1],
//         outputRange: ["0deg", "360deg"],
//       }),
//     [refreshSpin],
//   );

//   const handleRefreshBalancePress = () => {
//     if (isRefreshSpinningRef.current) return;
//     isRefreshSpinningRef.current = true;
//     refreshSpin.setValue(0);
//     Animated.timing(refreshSpin, {
//       toValue: 1,
//       duration: 1000,
//       useNativeDriver: true,
//     }).start(() => {
//       isRefreshSpinningRef.current = false;
//     });
//     onRefresh();
//   };

//   // const fetchGiftMoney = async (id: string) => {
//   //   const { data: res } = await getDepositGiftMoney({ id });
//   //   const data = res.data;
//   //   if (data) {
//   //     setDepositGiftConfig({
//   //       ...data,
//   //       moneyConfig: JSON.parse(data.moneyConfig ?? ""),
//   //     });
//   //   } else {
//   //     setDepositGiftConfig(null);
//   //   }
//   // };

//   const toInterConnectWallet = () => {
//     setLoadingWallet(true);
//     // walletAddress: interConnectWallet.walletAddress,
//     const params = {
//       tunnelId: selectedTunnel?.id,
//     };
//     openWindowWithURLFromServer({
//       params,
//       request: loginThirdMember,
//       urlKey: "payUrl",
//       onFail: () => {
//         showErrorAlert(t("common.operationFailed"));
//       },
//       onFinally: () => {
//         setLoadingWallet(false);
//       },
//     });
//   };

//   const recomMoneys = useMemo(() => {
//     if (currentPay?.tunnels) {
//       return JSON.parse(currentPay?.tunnels[0]?.recomMoneys || "[]");
//     }
//     return [];
//   }, [currentPay]);

//   const RechargeContent = useMemo(() => {
//     let minMaxNum = { min: 0, max: 0 };
//     if (currentRecharge?.id === "online") {
//       minMaxNum = {
//         min: currentPay?.tunnels[0]?.minLimitMoney,
//         max: currentPay?.tunnels[0]?.maxLimitMoney,
//       };
//     }
//     if (currentRecharge?.id === "bank") {
//       minMaxNum = { min: currentPay?.minMoney, max: currentPay?.maxMoney };
//     }
//     if (currentRecharge?.id === "usdt") {
//       minMaxNum = { min: currentPay?.minNum, max: currentPay?.maxNum };
//     }

//     return (
//       currentRecharge && (
//         <>
//           <View className="flex-row flex-wrap gap-x-[2%] mb-2">
//             {recomMoneys.map((option: any) => (
//               <TouchableOpacity
//                 key={option.money}
//                 className={`w-[32%] px-2 py-4 mb-2 rounded-lg border bg-${theme}-blockBg2
//                 ${
//                   amount == option.money
//                     ? `border-${theme}-primary bg-${theme}-btnText`
//                     : `border-${theme}-blockBg2 bg-${theme}-blockBg2`
//                 }`}
//                 onPress={() => setAmount(String(option.money))}
//               >
//                 <Text
//                   className={`text-center ${
//                     amount == option.money ? `text-${theme}-primary` : `text-${theme}-gray`
//                   }`}
//                 >
//                   $ {option.money}
//                 </Text>
//                 {/* <I18nText
//                   i18nKey="wallet.recharge.bonus1"
//                   values={{ money: option.giftValue }}
//                   type="tiptitle"
//                   className={`text-center text-${theme}-gray mt-1`}
//                   style={{ fontSize: rf(12) }}
//                 /> */}
//                 <View
//                   className={`-right-px -top-px absolute px-1.5 bg-${theme}-primary`}
//                   style={{ borderTopRightRadius: 8, borderBottomLeftRadius: 8 }}
//                 >
//                   <I18nText
//                     i18nKey={
//                       Number(option.type) === 0
//                         ? "wallet.recharge.giftPercent"
//                         : "wallet.recharge.giftPlus"
//                     }
//                     values={{ value: option.giftValue }}
//                     type="tiptitle"
//                     className={`text-center text-[#fff]`}
//                     style={{ fontSize: rf(10) }}
//                   />
//                 </View>

//                 {amount == option.money && (
//                   <View pointerEvents="none" className="absolute -right-px -bottom-px">
//                     <MoneySelectorCheckedIcon fill={Colors[theme].primary} width={30} height={22} />
//                   </View>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>
//           {currentRecharge?.id === "usdt" && (
//             <BaseInput
//               leftIcon={
//                 <Image
//                   style={{ width: 20, height: 20 }}
//                   source={require("@/assets/images/wallet/usdt-logo.png")}
//                 />
//               }
//               onChangeText={handleSetAmount}
//               value={amount}
//               // placeholder="(USDT数量为平台币)/(USDT 汇率)"
//               borderStyle="rounded"
//               dark
//             />
//           )}
//           {currentRecharge?.id == "online" && isInterConnectWallet && (
//             <View className="flex-1 gap-2 mb-2">
//               <View
//                 className="flex-row"
//                 style={[styles.walletInfoItem, { backgroundColor: Colors[theme].inputBg }]}
//               >
//                 <I18nText
//                   i18nKey="wallet.addOnline.walletAddress"
//                   style={{ fontSize: rf(12) }}
//                   className={`text-${theme}-darkColor`}
//                 />
//                 <I18nText
//                   i18nKey={`${interConnectWallet?.walletAddress ?? "-"}`}
//                   style={{ fontSize: rf(12) }}
//                   className={`text-${theme}-darkColor`}
//                 />
//               </View>
//               <View
//                 className="flex-row"
//                 style={[styles.walletInfoItem, { backgroundColor: Colors[theme].inputBg }]}
//               >
//                 <I18nText
//                   i18nKey="wallet.recharge.WBalance"
//                   style={{ fontSize: rf(12) }}
//                   className={`text-${theme}-darkColor`}
//                 />
//                 <I18nText
//                   i18nKey={`${formatMoney(interConnectWallet?.balance)}`}
//                   style={{ fontSize: rf(12) }}
//                   className={`text-${theme}-darkColor`}
//                 />
//                 <Pressable
//                   disabled={isRefreshingBalance}
//                   style={{ marginLeft: "auto" }}
//                   onPress={handleRefreshBalancePress}
//                 >
//                   <Animated.View
//                     style={{ transform: [{ rotate: refreshSpinRotate }] }}
//                   >
//                     <Ionicons name="refresh" size={20} color={Colors[theme].textPrimary} />
//                   </Animated.View>
//                 </Pressable>
//               </View>
//               <View className="flex-row" style={{ gap: 10 }}>
//                 <View
//                   className="items-center justify-center"
//                   style={[
//                     styles.walletInfoItem,
//                     {
//                       backgroundColor: Colors[theme].inputBg,
//                       paddingVertical: 0,
//                       justifyContent: "center",
//                     },
//                   ]}
//                 >
//                   <I18nText
//                     i18nKey="wallet.recharge.WBalance"
//                     style={{ fontSize: rf(12) }}
//                     className={`text-${theme}-darkColor`}
//                   />
//                 </View>
//                 <BaseButton
//                   size="sm"
//                   className="flex-1 items-center justify-center"
//                   i18nKey="wallet.recharge.toInterConnectWallet"
//                   onPress={toInterConnectWallet}
//                   isLoading={isLoadingWallet}
//                   disabled={!interConnectWallet?.walletAddress || isLoadingWallet}
//                   style={styles.linkBtn}
//                   textStyle={{ fontSize: rf(12) }}
//                 />
//               </View>
//             </View>
//           )}
//           {/* 充值金额 */}
//           <BaseInput
//             value={currentRecharge?.id === "usdt" ? usdtValue : amount}
//             leftText={tenantInfo?.currency}
//             onChangeText={handleSetAmount}
//             keyboardType="numeric"
//             placeholder={t("wallet.withdraw.moneyPlaceholder", {
//               min: minMaxNum.min,
//               max: minMaxNum.max,
//             })}
//             borderStyle="rounded"
//             dark
//             clearable={currentRecharge?.id !== "usdt"}
//             readOnly={currentRecharge?.id === "usdt"}
//             onClear={clearQueryParams}
//             inputTypographyClass=""
//             inputStyle={{ fontSize: rf(14) }}
//             leftTextSizeClass=""
//             leftTextStyle={{ fontSize: rf(12) }}
//           />
//           {currentRecharge?.id !== "online" && (
//             <BaseInput
//               leftText={t("common.remarkText")}
//               value={remark}
//               onChangeText={(value) => {
//                 setRemark(value);
//               }}
//               placeholder={t("wallet.placeholder.add1", {
//                 name: t("common.remarkText"),
//               })}
//               borderStyle="rounded"
//               dark
//               inputTypographyClass=""
//               inputStyle={{ fontSize: rf(14) }}
//               leftTextSizeClass=""
//               leftTextStyle={{ fontSize: rf(12) }}
//             />
//           )}
//           {currentRecharge?.id == "online" && giftMoney !== 0 && (
//             <View style={styles.depositGiftRowOuter}>
//               <ImageBackground
//                 source={depositGiftStarlightBg}
//                 style={styles.depositGiftBadge}
//                 imageStyle={styles.depositGiftBadgeImage}
//                 resizeMode="stretch"
//               >
//                 <View style={styles.depositGiftLeft}>
//                   <Image
//                     source={require("@/assets/images/finance/wallet.webp")}
//                     style={styles.depositGiftIcon}
//                     resizeMode="contain"
//                   />
//                   <Text style={[styles.depositGiftCurrency, { fontSize: rf(13) }]}>
//                     {tenantInfo?.currency}
//                   </Text>
//                   <Text style={[styles.depositGiftAmountVal, { fontSize: rf(13) }]}>
//                     {formatMoney(giftMoney)}
//                   </Text>
//                 </View>
//               </ImageBackground>
//               <TouchableOpacity
//                 style={styles.depositGiftOptOut}
//                 activeOpacity={0.85}
//                 onPress={() => setJoinDepositGift(!joinDepositGift)}
//               >
//                 <View
//                   style={[styles.depositGiftCheckbox, { borderColor: Colors[theme].darkColor }]}
//                 >
//                   {!joinDepositGift && <Ionicons name="checkmark" size={14} color="#4CAF50" />}
//                 </View>
//                 <I18nText
//                   i18nKey="wallet.recharge.skipPromotion"
//                   style={{
//                     fontSize: rf(12),
//                     color: Colors[theme].darkColor,
//                     flexShrink: 1,
//                   }}
//                   type="tiptitle"
//                 />
//               </TouchableOpacity>
//             </View>
//           )}
//         </>
//       )
//     );
//   }, [
//     amount,
//     remark,
//     theme,
//     usdtValue,
//     rechargeTypes,
//     baseIndex,
//     setAmount,
//     setRemark,
//     handleSetAmount,
//     clearQueryParams,
//     t,
//     currentRecharge,
//     currentPay,
//     rf,
//     giftMoney,
//     joinDepositGift,
//     setJoinDepositGift,
//     tenantInfo,
//     formatMoney,
//     depositGiftStarlightBg,
//   ]);

//   const CardInfo = useMemo(() => {
//     const isCrypto = currentRecharge?.id === "usdt";
//     return (
//       <View className={`px-3 py-4 mb-4 bg-${theme}-btnText rounded-lg`}>
//         {currentPay && (
//           <>
//             <LinearGradient
//               style={{
//                 borderRadius: 10,
//                 padding: 12,
//               }}
//               colors={[Colors[theme].gradientStart, Colors[theme].gradientEnd]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 0, y: 0 }}
//             >
//               <I18nText
//                 className={`text-center text-${theme}-btnText`}
//                 i18nKey={currentPay._name}
//               />
//               <View className="flex-col justify-center flex-1 mt-1 gap-2">
//                 {!isCrypto && (
//                   <View className="flex-row gap-2 flex-1">
//                     <I18nText
//                       className={`w-10 text-${theme}-btnText text-xs`}
//                       i18nKey="wallet.recharge.receiveName"
//                     />
//                     <I18nText
//                       className={`w-4/5 text-${theme}-btnText text-xs`}
//                       i18nKey={currentPay.holderName}
//                     />
//                     <TouchableOpacity onPress={() => copyToClipboard(currentPay.holderName)}>
//                       <Ionicons name="copy-outline" size={16} color={Colors[theme].btnText} />
//                     </TouchableOpacity>
//                   </View>
//                 )}
//                 {!isCrypto && (
//                   <View className="flex-row gap-2 flex-1">
//                     <I18nText
//                       className={`w-10 text-${theme}-btnText text-xs`}
//                       i18nKey="wallet.recharge.bankCard"
//                     />
//                     <I18nText
//                       className={`w-4/5 text-${theme}-btnText text-xs`}
//                       i18nKey={currentPay.bankCard}
//                     />
//                     <TouchableOpacity onPress={() => copyToClipboard(currentPay.bankCard)}>
//                       <Ionicons name="copy-outline" size={16} color={Colors[theme].btnText} />
//                     </TouchableOpacity>
//                   </View>
//                 )}
//                 <View className={`flex-row gap-2 ${isCrypto ? "" : "flex-1"}`}>
//                   <I18nText
//                     className={`text-${theme}-btnText text-xs`}
//                     i18nKey="wallet.recharge.address"
//                   />
//                   <I18nText
//                     className={`flex-1 text-${theme}-btnText text-xs break-all`}
//                     i18nKey={isCrypto ? currentPay.coinAddress : currentPay.bankAddress}
//                   />
//                   <TouchableOpacity
//                     onPress={() =>
//                       copyToClipboard(isCrypto ? currentPay.coinAddress : currentPay.bankAddress)
//                     }
//                   >
//                     <Ionicons name="copy-outline" size={16} color={Colors[theme].btnText} />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </LinearGradient>
//             <View className="flex-1">
//               {currentPay.coinCode === "USDT" && (
//                 <>
//                   <View className="flex-row items-start mt-4">
//                     <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45`} />
//                     <I18nText
//                       i18nKey="wallet.recharge.rate"
//                       className={`text-${theme}-text mr-2 text-xs`}
//                       type="subtitle"
//                     />
//                     <I18nText
//                       i18nKey={currentPay.depositRate}
//                       className={`text-${theme}-primary text-xs`}
//                       type="subtitle"
//                     />
//                   </View>
//                   {currentPay.remark && (
//                     <View className="flex-row items-start mt-2">
//                       <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45`} />
//                       <I18nText
//                         i18nKey="wallet.recharge.transferInstructions"
//                         className={`text-${theme}-text mr-2 text-xs`}
//                         type="subtitle"
//                       />
//                       <I18nText
//                         i18nKey={currentPay.remark}
//                         className={`text-${theme}-primary text-xs`}
//                         type="subtitle"
//                       />
//                     </View>
//                   )}
//                 </>
//               )}
//             </View>
//           </>
//         )}
//       </View>
//     );
//   }, [currentPay, currentRecharge]);

//   // const rechargeDescription = [
//   //   t("wallet.recharge.rechargeDescription1"),
//   //   t("wallet.recharge.rechargeDescription2"),
//   //   t("wallet.recharge.rechargeDescription3"),
//   //   t("wallet.recharge.rechargeDescription4"),
//   // ];

//   const rechargeDescription = useMemo(() => {
//     let remarkText = "";
//     if (currentRecharge?.id === "online") {
//       remarkText = currentPay?.tunnels?.[0]?.remark || "";
//     }
//     if (currentRecharge?.id === "bank") {
//       remarkText = currentPay?.remark || "";
//     }
//     if (currentRecharge?.id === "usdt") {
//       remarkText = currentPay?.remark || "";
//     }
//     // 充值说明数组
//     const baseDescription = [
//       t("wallet.recharge.rechargeDescription1"),
//       t("wallet.recharge.rechargeDescription2"),
//       t("wallet.recharge.rechargeDescription3"),
//       t("wallet.recharge.rechargeDescription4"),
//     ];
//     // 如果remarkText不为空，则添加到充值说明数组中
//     if (remarkText) {
//       return [remarkText, ...baseDescription];
//     }
//     return baseDescription;
//   }, [currentRecharge, currentPay, t]);

//   useEffect(() => {
//     if (isInterConnectWallet) {
//       fetchWalletInfo();
//     }
//   }, [isInterConnectWallet]);

//   useEffect(() => {
//     if (error && toast) toast.error(error);
//   }, [error, toast]);

//   return (
//     <SafeAreaView style={{ backgroundColor: Colors[theme].background }} className="flex-1">
//       <HideScreenHeader
//         title={t("pageName.recharge")}
//         rightEvent={{
//           rightText: t("pageName.rechargeRecord"),
//           onRightPress: () => router.push("/wallet/rechargeRecord"),
//         }}
//       />
//       <View className={`flex-1 px-3 mb-3 bg-${theme}-background`}>
//         {/* 余额头部 */}
//         <BanlanceInfo />

//         {/* 充值方式选择 */}
//         <BaseTab
//           tabClassName="py-2.5"
//           selectedIndex={baseIndex}
//           setIndex={setBaseIndex}
//           tabs={rechargeTypes.filter(
//             (item: any) => item.depositType !== 3 && item.displayRank !== 2,
//           )}
//           scrollStyle={{ marginTop: 0 }}
//           renderItem={renderTabsContent}
//           showNumber={3}
//         />

//         <ScrollView
//           className="hide-scrollbar"
//           contentContainerStyle={{ paddingBottom: 32 }}
//           showsVerticalScrollIndicator={false}
//           showsHorizontalScrollIndicator={false}
//         >
//           {currentRecharge?.payList.length > 0 && (
//             <View className={`mb-4`}>
//               <View className="flex-row items-center">
//                 <BankTypeIcon fill={primaryColor} />
//                 <I18nText
//                   i18nKey={
//                     currentRecharge.id == "online"
//                       ? "wallet.recharge.selectType"
//                       : "wallet.recharge.selectPaymentMethod"
//                   }
//                   className={`ml-2 text-${theme}-text font-medium`}
//                 />
//               </View>
//               <View
//                 className={`rounded-lg bg-${theme}-btnText mt-2.5 px-2.5 pb-2.5 pt-4`}
//                 style={{ overflow: "visible" }}
//               >
//                 <BaseTab
//                   tabs={currentRecharge?.payList}
//                   selectedIndex={currentPayIndex}
//                   setIndex={setCurrentPayIndex}
//                   // onChange={handlePayTypeSelect}
//                   renderItem={(tab: any, index: number) => {
//                     const isActive = index === currentPayIndex;
//                     const badgeText = getPayMethodBadge(tab);
//                     const body = (
//                       <View style={styles.payMethodInner}>
//                         <View style={styles.payMethodMainRow}>
//                           <I18nText
//                             i18nKey={tab._name}
//                             numberOfLines={1}
//                             ellipsizeMode="tail"
//                             style={[
//                               styles.payMethodName,
//                               {
//                                 color: isActive ? Colors[theme].btnText : Colors[theme].textGray,
//                               },
//                             ]}
//                           />
//                           {tab._icon && (
//                             <Image
//                               source={{ uri: tab._icon }}
//                               style={styles.payMethodIcon}
//                               resizeMode="contain"
//                             />
//                           )}
//                         </View>
//                       </View>
//                     );

//                     const card = isActive ? (
//                       <LinearGradient
//                         colors={[Colors[theme].gradientStart, Colors[theme].gradientEnd]}
//                         start={{ x: 0, y: 0.5 }}
//                         end={{ x: 1, y: 0.5 }}
//                         style={styles.payMethodCard}
//                       >
//                         {body}
//                       </LinearGradient>
//                     ) : (
//                       <LinearGradient
//                         colors={[
//                           Colors[theme].myCenter2BtnStart,
//                           Colors[theme].myCenter2BtnEnd,
//                         ]}
//                         start={{ x: 0, y: 0.5 }}
//                         end={{ x: 1, y: 0.5 }}
//                         style={styles.payMethodCard}
//                       >
//                         {body}
//                       </LinearGradient>
//                     );

//                     return (
//                       <View style={styles.payMethodCell}>
//                         {card}
//                         {!!badgeText && (
//                           <View style={styles.payMethodBadge} pointerEvents="none">
//                             <Text
//                               numberOfLines={1}
//                               ellipsizeMode="tail"
//                               style={styles.payMethodBadgeText}
//                             >
//                               {badgeText}
//                             </Text>
//                           </View>
//                         )}
//                       </View>
//                     );
//                   }}
//                   scrollStyle={{ marginTop: 0 }}
//                   showNumber={3}
//                   wrap
//                 />
//               </View>
//             </View>
//           )}
//           {currentRecharge?.id !== "online" && CardInfo}
//           <View className="flex-row items-center mb-2">
//             <BankSelectIcon fill={primaryColor} />
//             <I18nText
//               i18nKey="wallet.recharge.rechargeAmount"
//               className={`ml-2 text-${theme}-text font-medium`}
//             />
//           </View>
//           <View className={`bg-${theme}-btnText rounded-lg py-4 px-1.5 mb-4`}>
//             {RechargeContent}
//           </View>
//           <View className="px-2 mb-4">
//             <View style={styles.depositSubmitWrap}>
//               {showBonusBtn ? (
//                 <View style={styles.bonusBadge} pointerEvents="none">
//                   <View style={styles.bonusBadgeBg}>
//                     <Image
//                       source={require("@/assets/images/finance/starlight2.png")}
//                       style={styles.bonusBadgeBgImage}
//                       resizeMode="stretch"
//                     />
//                     <Text style={styles.bonusBadgeText} numberOfLines={1}>
//                       +{formatMoney(giftMoney)}
//                     </Text>
//                   </View>
//                 </View>
//               ) : null}
//               <View style={[styles.depositSubmitOuter, depositBtnDisabledDim]}>
//                 <TouchableOpacity
//                   activeOpacity={0.88}
//                   disabled={isLoading || !amount}
//                   onPress={handleRechargeSubmit}
//                   style={styles.depositSubmitTouchable}
//                 >
//                   <ImageBackground
//                     source={depositButtonBackground}
//                     style={styles.depositSubmitGradient}
//                     imageStyle={styles.depositSubmitImageBg}
//                     resizeMode="stretch"
//                   >
//                     <View style={styles.depositSubmitContent}>
//                       {isLoading ? (
//                         <ActivityIndicator color={depositLoadingColor} size="small" />
//                       ) : showBonusBtn ? (
//                         <View style={styles.depositSubmitRow}>
//                           <Text
//                             style={[
//                               styles.depositSubmitLabel,
//                               {
//                                 color: depositDisplayLabelColor,
//                                 fontSize: rf(15),
//                               },
//                             ]}
//                           >
//                             {t("pageName.recharge")}
//                           </Text>
//                           <DepositBonusAmountText amount={String(amount)} />
//                         </View>
//                       ) : (
//                         <Text
//                           style={[
//                             styles.depositSubmitLabel,
//                             {
//                               color: depositDisplayLabelColor,
//                               fontSize: rf(16),
//                             },
//                           ]}
//                         >
//                           {t("pageName.recharge")}
//                         </Text>
//                       )}
//                     </View>
//                   </ImageBackground>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//           <View className="mb-4">
//             <View className="flex-row items-center mb-2">
//               <RechargeIcon width={20} height={18} fill={primaryColor} />
//               <I18nText
//                 i18nKey="wallet.recharge.rechargeDescription"
//                 className={`ml-2 text-${theme}-text font-medium`}
//                 style={{
//                   fontSize: rf(14),
//                 }}
//               />
//             </View>

//             <View className={`bg-${theme}-btnText rounded-lg p-4 pt-5`}>
//               {rechargeDescription.map((item, index) => (
//                 <View key={index} className="flex-row items-start mb-2">
//                   <Text className={`w-1 h-1 bg-${theme}-primary mt-1.5 mr-2 rotate-45 `} />
//                   <I18nText
//                     i18nKey={item}
//                     className={`text-${theme}-text`}
//                     type="subtitle"
//                     style={{
//                       fontSize: rf(12),
//                       flex: 1,
//                       textAlign: "left",
//                       writingDirection: "ltr",
//                     }}
//                   />
//                 </View>
//               ))}
//             </View>
//           </View>
//           <View style={{ height: 60 }} />
//         </ScrollView>
//       </View>
//       <View>
//         <DepositPasswordPopup
//           ref={passwordModalRef}
//           onResolve={onPasswordResolved}
//           onReject={onPasswordRejected}
//         />
//       </View>
//       {isFocused && isWeb && (
//         // 加一个 view 包裹，防止 android 弹窗展示不全
//         <View>
//           <PublicitiesList standalone publicityTypesOverride={[PublicityType.DEPOSIT_TUTORIAL]} />
//           <DownloadGuide />
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   walletInfoItem: {
//     minHeight: 32,
//     gap: 10,
//     alignItems: "center",
//     justifyContent: "space-between",
//     borderRadius: 15,
//     paddingVertical: 6,
//     paddingHorizontal: 15,
//   },
//   linkBtn: {
//     borderRadius: 15,
//     height: 32,
//   },
//   depositSubmitWrap: {
//     position: "relative",
//     marginTop: 4,
//     alignSelf: "center",
//     width: 250,
//   },
//   depositSubmitOuter: {
//     borderRadius: 9999,
//     width: 250,
//   },
//   depositSubmitTouchable: {
//     borderRadius: 9999,
//     overflow: "hidden",
//     width: "100%",
//   },
//   depositSubmitGradient: {
//     width: "100%",
//     height: 60,
//     borderRadius: 9999,
//     overflow: "hidden",
//   },
//   depositSubmitContent: {
//     flex: 1,
//     width: "100%",
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   depositSubmitImageBg: {
//     borderRadius: 9999,
//   },
//   depositSubmitRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   depositSubmitLabel: {
//     fontWeight: "700",
//   },
//   bonusBadge: {
//     position: "absolute",
//     zIndex: 2,
//     top: -2,
//     left: "50%",
//     marginLeft: 60,
//   },
//   bonusBadgeBg: {
//     position: "relative",
//     alignSelf: "flex-start",
//     minWidth: 44,
//     paddingVertical: 1,
//     paddingHorizontal: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//     borderRadius: 10,
//   },
//   bonusBadgeBgImage: {
//     position: "absolute",
//     left: 0,
//     top: 0,
//     right: 0,
//     bottom: 0,
//     width: "100%",
//     height: "100%",
//   },
//   bonusBadgeText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//     lineHeight: 13.2,
//     letterSpacing: 0.3,
//   },
//   depositGiftRowOuter: {
//     width: "100%",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 4,
//     paddingLeft: 4,
//     paddingRight: 16,
//   },
//   depositGiftBadge: {
//     alignSelf: "flex-start",
//     borderRadius: 8,
//     overflow: "hidden",
//     width: 200,
//     paddingVertical: 8,
//   },
//   depositGiftBadgeImage: {
//     borderRadius: 10,
//   },
//   depositGiftLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingVertical: 6,
//     paddingLeft: 12,
//     paddingRight: 14,
//   },
//   depositGiftIcon: {
//     width: 20,
//     height: 20,
//   },
//   depositGiftCurrency: {
//     color: "#FFE866",
//   },
//   depositGiftAmountVal: {
//     color: "#FFE866",
//     fontWeight: "600",
//   },
//   depositGiftOptOut: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "flex-end",
//     minWidth: 0,
//     paddingRight: 4,
//     marginLeft: 12,
//     alignSelf: "stretch",
//   },
//   depositGiftCheckbox: {
//     width: 16,
//     height: 16,
//     borderWidth: 1,
//     borderRadius: 2,
//     marginRight: 8,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   payMethodCell: {
//     width: "100%",
//     position: "relative",
//     overflow: "visible",
//   },
//   payMethodCard: {
//     height: 40,
//     borderRadius: 6,
//     justifyContent: "center",
//     width: "100%",
//   },
//   payMethodInner: {
//     position: "relative",
//     paddingHorizontal: 6,
//     justifyContent: "center",
//     height: "100%",
//     width: "100%",
//   },
//   payMethodMainRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     minWidth: 0,
//     width: "100%",
//   },
//   payMethodName: {
//     flexShrink: 1,
//     minWidth: 0,
//     maxWidth: 70,
//     marginRight: 2,
//     fontSize: rf(12),
//     lineHeight: rf(14),
//     fontWeight: "500",
//   },
//   payMethodIcon: {
//     width: 22,
//     height: 22,
//   },
//   payMethodBadge: {
//     position: "absolute",
//     top: -5,
//     right: -5,
//     zIndex: 2,
//     elevation: 4,
//     maxWidth: "85%",
//     height: 14,
//     paddingHorizontal: 6,
//     borderRadius: 4,
//     backgroundColor: "#ff3333",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   payMethodBadgeText: {
//     color: "#fff",
//     fontSize: rf(9),
//     lineHeight: rf(10),
//     fontWeight: "600",
//   },
// });

export { default } from "@/modules/wallet/recharge";
