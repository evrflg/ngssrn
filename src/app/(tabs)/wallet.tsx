import { I18nText } from "@/components/I18nText";
import { BaseButton } from "@/components/ui/BaseButton";
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BonusWalletExplainModal from "@/components/my/BonusWalletExplainModal";
import {
  getBannerServer,
  getFinanceMoney,
  nbcBalance,
  reclaimGameBalances,
} from "@/api";
import { reedType, reedUrl } from "@/constants/reedData";
import { walletTheme } from "@/components/active/components/activeConfg";
import { CarouselBlock } from "@/components/home/CarouselBlock";
import { IndexHeader } from "@/components/home/IndexHeader";
import { BaseCell } from "@/components/ui/BaseCell";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { stationConfig } from "@/store/tenant/tenantSlice";
import { rf } from "@/utils/scaleFont";
import { retainNum } from "@/utils/Util";
import { formatMoney } from "@/utils/utils";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { accInfoAsync } from "@/store/user/userSlice";
import { TelegramAlert } from "@/components/wallet/TelegramAlert";
import { useTranslation } from "react-i18next";

export default function Wallet() {
  const { t } = useTranslation();
  const [bonusExplainOpen, setBonusExplainOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moneyInfo, setMoneyInfo] = useState({
    mainRate: 0,
    giftRate: 0,
    money: 0,
    giftMoney: 0,
    totalMoney: 0,
    cryptCoin: 0,
  });
  const { theme } = useTheme();
  const [hasWalletBanner, setHasWalletBanner] = useState(true);

  // 站点配置
  const siteConfig = useSelector(stationConfig);
  const dispatch = useDispatch();
  useEffect(() => {
    getBannerServer().then((res: any) => {
      if (res?.data?.data?.length > 0) {
        const walletBanners = res.data.data.filter(
          (item: any) => item.status === 0 && item.type === 1,
        );
        setHasWalletBanner(walletBanners.length > 0);
      }
    });
  }, []);

  useEffect(() => {
    fetchFinanceMoney();
    fetchCryptoMoney();
  }, []);

  const fetchFinanceMoney = async () => {
    const result = await getFinanceMoney();
    if (result.data.data) {
      const { bonusBalance, cashBalance } = result.data.data;
      const totalMoney = bonusBalance + cashBalance;
      setMoneyInfo((prev) => ({
        ...prev,
        mainRate: cashBalance == 0 ? 0 : retainNum(cashBalance / totalMoney, 4),
        giftRate:
          bonusBalance == 0 ? 0 : retainNum(bonusBalance / totalMoney, 4),
        money: retainNum(cashBalance),
        giftMoney: retainNum(bonusBalance),
        totalMoney: totalMoney > 0 ? totalMoney.toFixed(2) : "0.00",
      }));
      dispatch(accInfoAsync() as any); // 刷新用户信息
    }
  };

  const fetchCryptoMoney = async () => {
    await nbcBalance().then(({ data }) => {
      if (data.data) {
        setMoneyInfo((prev) => ({
          ...prev,
          cryptCoin: retainNum(data.data.nbc),
        }));
      }
    });
  };

  // 跳转至虚拟币钱包
  const goXnWallet = async () => {
    router.navigate({
      pathname: reedUrl,
      params: { toType: reedType.coinWallet },
    });
  };

  return (
    <SafeAreaView
      edges={
        Platform.OS === "web"
          ? { top: "additive", bottom: "off" }
          : ["top", "bottom"]
      }
      className="flex-1"
      style={{ backgroundColor: Colors[theme].background }}
    >
      <IndexHeader />
      <TelegramAlert />
      {hasWalletBanner && <CarouselBlock bannerType={1} />}
      {/* 主钱包余额 */}
      <ImageBackground
        className={`mx-4 rounded-xl gap-3 justify-between`}
        resizeMode="cover"
        source={walletTheme[theme].menuBg}
        style={[
          {
            minHeight: 130,
            marginTop: rf(10),
            padding: rf(16),
            paddingTop: rf(20),
          },
        ]}
        imageStyle={{ borderRadius: 10, width: "auto", height: "auto" }}
      >
        <View className="flex-row items-center">
          <View className="flex-1 gap-2 px-2 h-full">
            <I18nText
              i18nKey="wallet.balance"
              className={`text-[#888] text-center`}
              style={styles.balanceLabel}
            />
            <I18nText
              i18nKey={formatMoney(moneyInfo.money)}
              className={`text-${theme}-primary text-center font-extrabold`}
              style={styles.balanceValue}
            />
          </View>
          <LinearGradient
            colors={[
              "transparent",
              walletTheme[theme].menuBorderColor,
              "transparent",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ width: 1, height: 32 }}
          />
          <View className="flex-1 gap-2 px-2 h-full">
            <I18nText
              i18nKey="wallet.bonusBalance"
              className={`text-[#888] text-center`}
              style={styles.balanceLabel}
            />
            <View className="flex-row items-center justify-center">
              <I18nText
                i18nKey={formatMoney(moneyInfo.giftMoney)}
                className={`text-${theme}-text text-center font-extrabold`}
                style={styles.balanceValue}
              />
              <TouchableOpacity
                onPress={() => setBonusExplainOpen(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ marginLeft: 4 }}
              >
                <FontAwesome
                  name="question-circle-o"
                  size={Math.round(rf(15))}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>
          {siteConfig?.isTestSite && (
            <>
              <LinearGradient
                colors={[
                  "transparent",
                  walletTheme[theme].menuBorderColor,
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ width: 1, height: 32 }}
              />
              <Pressable
                className="flex-1 gap-2 px-2 h-full"
                onPress={goXnWallet}
              >
                <I18nText
                  i18nKey="wallet.virtualBalance"
                  className={`text-[#888] text-center`}
                  style={styles.balanceLabel}
                />
                <I18nText
                  i18nKey={formatMoney(moneyInfo.cryptCoin)}
                  className={`text-${theme}-text text-center font-extrabold`}
                  style={styles.balanceValue}
                />
              </Pressable>
            </>
          )}
        </View>
        <View className="w-full">
          <BaseButton
            className="w-full"
            i18nKey="wallet.oneClickRecovery"
            isLoading={loading}
            size="sm"
            gradient
            gradientColors={[Colors[theme].primary, Colors[theme].gradient]}
            gradientStart={{ x: 0, y: 0 }}
            gradientEnd={{ x: 1, y: 0 }}
            textStyle={{ fontSize: rf(13) }}
            onPress={() => {
              setLoading(true);
              reclaimGameBalances().then((res: any) => {
                if (res.data.data) {
                  fetchFinanceMoney();
                }
                setLoading(false);
              });
            }}
            roundedFull
            style={{
              width: "100%",
              minHeight: 30,
              height: 30,
              paddingHorizontal: 32,
            }}
          />
        </View>
      </ImageBackground>
      {/* 操作按钮区域 */}
      <View className={`bg-${theme}-btnText mx-4 rounded-lg mt-3`}>
        <BaseCell
          className={`bg-${theme}-btnText`}
          leftIcon={
            <Image
              source={require("@/assets/images/wallet/chongzhi.png")}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          }
          i18nKey="pageName.recharge"
          onPress={() => router.push("/wallet/recharge")}
          titleTextStyle={styles.cellTitle}
          dark
          size="sm"
          style={{ paddingVertical: rf(8), height: rf(44) }}
        />
        <BaseCell
          className={`bg-${theme}-btnText`}
          leftIcon={
            <Image
              source={require("@/assets/images/wallet/tixian.png")}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          }
          i18nKey="pageName.withdraw"
          onPress={() => router.push("/wallet/withdraw")}
          titleTextStyle={styles.cellTitle}
          dark
          size="sm"
          style={{ height: 44, paddingVertical: 8 }}
        />
      </View>

      <View className={`bg-${theme}-btnText mx-4 rounded-lg mt-3`}>
        <BaseCell
          className={`bg-${theme}-btnText`}
          leftIcon={
            <Image
              source={require("@/assets/images/wallet/chongzhiRcord.png")}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          }
          i18nKey="pageName.rechargeRecord"
          onPress={() => router.push("/wallet/rechargeRecord")}
          titleTextStyle={styles.cellTitle}
          dark
          size="sm"
          style={{ height: 44, paddingVertical: 8 }}
        />
        <BaseCell
          className={`bg-${theme}-btnText`}
          leftIcon={
            <Image
              source={require("@/assets/images/wallet/tixianRcrod.png")}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          }
          i18nKey="pageName.withdrawRecord"
          onPress={() => router.push("/wallet/withdrawRecord")}
          titleTextStyle={styles.cellTitle}
          dark
          size="sm"
          style={{ height: 44, paddingVertical: 8 }}
        />
      </View>
      <BonusWalletExplainModal
        visible={bonusExplainOpen}
        onClose={() => setBonusExplainOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  balanceValue: {
    fontSize: rf(14),
  },
  balanceLabel: {
    fontSize: rf(12),
  },
  cellTitle: {
    fontSize: rf(12),
  },
});
