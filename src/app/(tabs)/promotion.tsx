import {
  Text,
  View,
  Linking,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useToast } from "@/components/common/toast";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useState, useCallback } from "react";
import { HideScreenHeader } from "@/components/common/Header";
import DirectionParentIcon from "@/components/icons/promotion/DirectionParent";
import TeamExpressionIcon from "@/components/icons/promotion/TeamExpression";
import InvitationCodeIcon from "@/components/icons/promotion/InvitationCode";
import InvitationLinkIcon from "@/components/icons/promotion/InvitationLink";
import MyCommissionIcon from "@/components/icons/promotion/MyCommission";
import MyIncomeIcon from "@/components/icons/promotion/MyIncome";
import AllDataIcon from "@/components/icons/promotion/AllData";
import DirectChildBettingIcon from "@/components/icons/promotion/DirectChildBetting";
import DirectChildInfoIcon from "@/components/icons/promotion/DirectChildInfo";
import DirectChildFinanceIcon from "@/components/icons/promotion/DirectChildFinance";
import DirectChildDataIcon from "@/components/icons/promotion/DirectChildData";
import DirectChildIcon from "@/components/icons/promotion/DirectChild";
import PromotionTutorialIcon from "@/components/icons/promotion/PromotionTutorial";
import CustomerServiceIcon from "@/components/icons/promotion/CustomerService";
import InvitationInfoIcon from "@/components/icons/promotion/InvitationInfo";
import TotalCommission from "@/components/promotion/TotalCommission";
import ListItem from "@/components/promotion/ListItem";
import { getPromotionInfo } from "@/api/post/promotion";
import Clipboard from "@react-native-clipboard/clipboard";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { I18nText } from "@/components/I18nText";
import { useFocusEffect } from "expo-router";
import { getScrollBottomSpacer } from "@/config/layout/scrollBottomSpacer";
import { selectBottomNavigationType } from "@/store/user/selfConfig";
import { getInviteOverview } from "@/api";
import { rf } from "@/utils/scaleFont";

interface OverViewInfo {
  proxyUid: string | null;
  totalCommisionMoney: number;
  directBetNum: number;
  directTotalBetOrders: string;
  directWinLost: number;
  directPerformanceBetnum: number;
  totalRegisters: string;
  directRegisters: string;
  otherRegisters: string;
  totalPerformanceBetnum: number;
  todayFirstDepositBonus: number;
  todayInvitePersons: string;
  todayProxyRebateMoney: number;
  todayTotalDepositPersons: string;
  promoCode: string;
}

export default function Information() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [data, setData] = useState<OverViewInfo>();
  const [inviteLink, setInviteLink] = useState("");
  const toast = useToast();
  const { t } = useTranslation();
  const {
    theme,
    themeColors: { primary },
  } = useTheme();
  const cfg_site_base = useSelector((state: RootState) => state.user.cfg_site_base);
  const bottomNavType = useSelector(selectBottomNavigationType);
  const contactCustomerService = useCallback(async () => {
    try {
      const supported = await Linking.canOpenURL(cfg_site_base.customServiceLink);
      supported && Linking.openURL(cfg_site_base.customServiceLink);
    } catch (error: unknown) {
      toast.error(String(error));
    }
  }, [cfg_site_base]);

  useFocusEffect(
    useCallback(() => {
      setIsPageLoading(true);
      (async () => {
        try {
          const [
            {
              data: { data },
            },
            {
              data: { data: inviteData },
            },
          ] = await Promise.all([getPromotionInfo(), getInviteOverview()]);
          setData(data);
          setInviteLink(inviteData?.promLink);
        } finally {
          setIsPageLoading(false);
        }
      })();
    }, []),
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView
        edges={Platform.OS === "web" ? { top: "additive", bottom: "off" } : ["top", "bottom"]}
        className="flex-1"
        style={{ backgroundColor: Colors[theme].background }}
      >
        <HideScreenHeader title={t("home.promoteInfo")} />
        <ScrollView
          className="p-3"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <ImageBackground
            source={require("@/assets/images/promotion/card-bg.png")}
            className={`bg-${theme}-primary w-full rounded-[10px] mb-2 pt-5 flex-col items-center justify-end overflow-hidden
              shadow shadow-black/10 shadow-offset-[1px/1px] shadow-radius-[2px]`}
          >
            <Text className={`text-${theme}-btnText font-semibold`} style={{ fontSize: rf(22) }}>
              {formatNumber(data?.totalCommisionMoney)}
            </Text>
            <TotalCommission />
            <I18nText
              i18nKey="promotion.idSj"
              values={{ id: data?.proxyUid || t("promotion.noany") }}
              className={`text-${theme}-btnText my-2`}
              style={{ fontSize: rf(12) }}
            />
            <View
              className={`bg-${theme}-btnText w-full flex-row rounded-tl-[10px] rounded-tr-[10px]`}
              style={{ paddingTop: rf(9), paddingBottom: rf(4) }}
            >
              {isPageLoading && (
                <ActivityIndicator
                  className="absolute top-2/4 left-2/4 z-1 -translate-x-[18px] -translate-y-[18px]"
                  size="large"
                />
              )}
              <View className="w-1/2 border-r border-[#dfdede]">
                <View className="flex-row justify-center items-center mb-3">
                  <DirectionParentIcon color={primary} />
                  <I18nText
                    i18nKey="promotion.directBetting"
                    type="title"
                    className={`ml-1.5 text-${theme}-text`}
                    style={{ fontSize: rf(12) }}
                  />
                </View>
                <Text className={`text-center text-${theme}-text`} style={{ fontSize: rf(12) }}>
                  {formatNumber(data?.directBetNum)}
                </Text>
                <I18nText
                  i18nKey="promotion.totalbetRebate"
                  type="tiptitle"
                  className={`text-center text-${theme}-text`}
                  style={{ marginBottom: rf(8), fontSize: rf(11) }}
                />
                <Text className="ml-1 text-center text-[#49ce9b]" style={{ fontSize: rf(12) }}>
                  {formatNumber(data?.directTotalBetOrders)}
                </Text>
                <I18nText
                  i18nKey="promotion.totalBettingOrders"
                  type="tiptitle"
                  className={`text-center text-${theme}-text`}
                  style={{ marginBottom: rf(8), fontSize: rf(11) }}
                />
                <Text
                  className={`ml-1 text-center text-${theme}-primary`}
                  style={{ fontSize: rf(12) }}
                >
                  {formatNumber(data?.directWinLost)}
                </Text>
                <I18nText
                  i18nKey="promotion.totalBettingProfitLoss"
                  type="tiptitle"
                  className={`text-center text-${theme}-text`}
                  style={{ marginBottom: rf(8), fontSize: rf(11) }}
                />
                <Text className={`text-center text-${theme}-text`} style={{ fontSize: rf(12) }}>
                  {formatNumber(data?.directPerformanceBetnum)}
                </Text>
                <I18nText
                  i18nKey="promotion.totalPerformanceMoney"
                  type="tiptitle"
                  className={`text-center text-${theme}-text`}
                  style={{ marginBottom: rf(8), fontSize: rf(11) }}
                />
              </View>
              <View className="w-1/2">
                <View className="flex-row justify-center items-center mb-3">
                  <TeamExpressionIcon color={primary} />
                  <I18nText
                    i18nKey="promotion.teamPerformance"
                    type="title"
                    className={`ml-1.5 text-${theme}-text`}
                    style={{ fontSize: rf(12) }}
                  />
                </View>
                <Text className={`text-center text-${theme}-text`} style={{ fontSize: rf(12) }}>
                  {formatRoundedInteger(data?.totalRegisters)}
                </Text>
                <I18nText
                  i18nKey="promotion.numberRegistrations"
                  type="tiptitle"
                  className={`text-center text-${theme}-text`}
                  style={{ marginBottom: rf(8), fontSize: rf(11) }}
                />
                <Text className="ml-1 text-center text-[#49ce9b]" style={{ fontSize: rf(12) }}>
                  {formatRoundedInteger(data?.directRegisters)}
                </Text>
                <I18nText
                  i18nKey="promotion.numberdirectRegistered"
                  type="tiptitle"
                  className={`text-center text-${theme}-text`}
                  style={{ marginBottom: rf(8), fontSize: rf(11) }}
                />
                <Text
                  className={`ml-1 text-center text-${theme}-primary`}
                  style={{ fontSize: rf(12) }}
                >
                  {formatRoundedInteger(data?.otherRegisters)}
                </Text>
                <I18nText
                  i18nKey="promotion.numberotherRegistrants"
                  type="tiptitle"
                  className={`text-center text-${theme}-text`}
                  style={{ marginBottom: rf(8), fontSize: rf(11) }}
                />
                <Text className={`text-center text-${theme}-text`} style={{ fontSize: rf(12) }}>
                  {formatNumber(data?.totalPerformanceBetnum)}
                </Text>
                <I18nText
                  i18nKey="promotion.totalPerformanceMoney"
                  type="tiptitle"
                  className={`text-center text-${theme}-text`}
                  style={{ marginBottom: rf(8), fontSize: rf(11) }}
                />
              </View>
            </View>
          </ImageBackground>
          <ListItem
            IconComponent={InvitationLinkIcon}
            title={t("agent.invitationLink")}
            iconName="copy-outline"
            clickHandler={() => {
              if (inviteLink && typeof inviteLink === "string") {
                Clipboard.setString(inviteLink);
                toast.success(t("common.copySuccess"));
              }
            }}
          >
            <Text className={`text-right text-${theme}-text mx-2`} numberOfLines={1}>
              {inviteLink}
            </Text>
          </ListItem>
          <ListItem
            IconComponent={InvitationCodeIcon}
            title={t("agent.invitationCode")}
            iconName="copy-outline"
            clickHandler={() => {
              if (data?.promoCode && typeof data?.promoCode === "string") {
                Clipboard.setString(data?.promoCode);
                toast.success(t("common.copySuccess"));
              }
            }}
          >
            <Text className={`text-right text-${theme}-text mr-2`}>{data?.promoCode}</Text>
          </ListItem>
          <ListItem
            IconComponent={MyCommissionIcon}
            title={t("promotion.myCommission")}
            url="promotion/my-commission"
          />
          <ListItem
            IconComponent={MyIncomeIcon}
            title={t("promotion.myIncome")}
            url="promotion/my-income"
          />
          <ListItem
            IconComponent={AllDataIcon}
            title={t("pageName.transactionRecord")}
            url="promotion/all-data"
          />
          <ListItem
            IconComponent={DirectChildBettingIcon}
            title={t("promotion.directBetting")}
            url="promotion/direct-child-betting"
          />
          <ListItem
            IconComponent={DirectChildInfoIcon}
            title={t("promotion.directBetInformation")}
            url="promotion/direct-child-information"
          />
          <ListItem
            IconComponent={DirectChildFinanceIcon}
            title={t("promotion.directFinancing")}
            url="promotion/direct-child-finance"
          />
          <ListItem
            IconComponent={DirectChildDataIcon}
            title={t("promotion.directData")}
            url="promotion/direct-child-data"
          />
          <ListItem
            IconComponent={DirectChildIcon}
            title={t("promotion.directSubordinate")}
            url="promotion/direct-child"
          />
          <ListItem
            IconComponent={PromotionTutorialIcon}
            title={t("promotion.tutorial")}
            url="promotion/newPromotionTutorial"
          />
          <ListItem
            IconComponent={CustomerServiceIcon}
            title={t("common.onlineSupport")}
            clickHandler={contactCustomerService}
          />
          <View
            className={`rounded-[10px] p-[10px] mb-6 bg-${theme}-btnText
            shadow shadow-black/10 shadow-offset-[1px/1px] shadow-radius-[2px] elevation-[4]`}
          >
            <View className="flex-row items-center">
              <InvitationInfoIcon color={primary} />
              <I18nText
                i18nKey="promotion.promotionInfo"
                className={`ml-2 font-bold text-${theme}-secondary`}
                style={{ fontSize: rf(12) }}
              />
            </View>
            <View className="flex-row pt-[10px] items-stretch">
              <View className="flex-1 justify-center items-center">
                <Text
                  className={`font-semibold mb-1 text-${theme}-secondary`}
                  style={{ fontSize: rf(12) }}
                >
                  {data?.todayInvitePersons || 0}
                </Text>
                <I18nText
                  i18nKey="promotion.todayInvitePerson"
                  type="tiptitle"
                  className={`text-${theme}-text`}
                  style={{ fontSize: rf(11) }}
                />
              </View>
              <View style={{ width: 1, marginVertical: 4, backgroundColor: "#dfdede" }} />
              <View className="flex-1 justify-center items-center">
                <Text
                  className={`font-semibold mb-1 text-${theme}-secondary`}
                  style={{ fontSize: rf(12) }}
                >
                  {formatNumber(data?.todayProxyRebateMoney)}
                </Text>
                <I18nText
                  i18nKey="agent.todayRebate"
                  type="tiptitle"
                  className={`text-${theme}-text`}
                  style={{ fontSize: rf(11) }}
                />
              </View>
              <View style={{ width: 1, marginVertical: 4, backgroundColor: "#dfdede" }} />
              <View className="flex-1 justify-center items-center">
                <Text
                  className={`font-semibold mb-1 text-${theme}-secondary`}
                  style={{ fontSize: rf(12) }}
                >
                  {data?.todayTotalDepositPersons || 0}
                </Text>
                <I18nText
                  i18nKey="agent.firstDepositCount"
                  type="tiptitle"
                  className={`text-${theme}-text`}
                  style={{ fontSize: rf(11) }}
                />
              </View>
            </View>
          </View>
          <View style={{ height: getScrollBottomSpacer(bottomNavType) as any }} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function formatNumber(num: number | string | undefined = 0) {
  const rounded = Math.round(+num * 100) / 100;
  return rounded.toLocaleString("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatRoundedInteger(num: number | string | undefined = 0) {
  const rounded = Math.round(+num);
  return rounded.toLocaleString("en-US", {
    style: "decimal",
    maximumFractionDigits: 0,
  });
}
