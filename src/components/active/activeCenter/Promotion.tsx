//推广宝箱
import { joinAct as receiveTreasure } from "@/api";
import {
  PlatformType,
  shareToPlatform,
} from "@/components/active/activeCenter/shareToPlatform";
import {
  activeCenterConfig,
  beDealtTheme,
} from "@/components/active/components/activeConfg";
import { useToast } from "@/components/common/toast";
import {
  CopyIcon,
  JinShengIcon,
  TuiGuangIcon,
} from "@/components/icons/active";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { baoxiangInfoAsync } from "@/store/active/activeSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Tenant, tenantStore } from "@/store/tenant/tenantSlice";
import { rf } from "@/utils/scaleFont";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useDispatch, useSelector } from "react-redux";
import { ActivitySuccessPopup } from "./ActivitySuccessPopup";

//函数：每4个一行排列宝箱，多行数组
const groupByRows = (list: any[], rowSize: number = 4): any[][] => {
  return list.reduce((acc: any[][], curr, idx) => {
    const rowIndex = Math.floor(idx / rowSize);
    if (!acc[rowIndex]) acc[rowIndex] = [];
    acc[rowIndex].push(curr);
    return acc;
  }, []);
};

//领取提示多语言处理
const getTreasureClaimTip = (options: {
  rules: any[];
  treasure: any;
  lang: string;
}): string => {
  const rules = Array.isArray(options.rules) ? options.rules : [];
  const treasure = options.treasure;
  const currentLang = String(options.lang || "").trim().toLowerCase();

  // 先按邀请人数锁定同一档位；同一人数可能存在多个奖励配置。
  const sameRules = rules.filter(
    (r: any) => Number(r?.requirementValue) === Number(treasure?.invitePerson),
  );

  // 保持原匹配规则：单条直接用，多条再按奖励金额精确匹配；找不到则不额外兜底。
  const rule =
    sameRules.length === 1
      ? sameRules[0]
      : sameRules.length > 1
        ? sameRules.find((r: any) => Number(r?.rewardValue) === Number(treasure?.amount))
        : sameRules[0];

  // 优先取当前语言的多语言提示；空字符串按无效处理。
  const i18nList = Array.isArray(rule?.claimTipI18n) ? rule.claimTipI18n : [];
  const matched = i18nList.find(
    (item: any) =>
      String(item?.lang || "").trim().toLowerCase() === currentLang,
  );
  const matchedText = String(matched?.text || "").trim();
  if (matchedText) return matchedText;

  // 多语言没有命中时，回退到默认领取提示；仍为空则返回空串。
  const fallback = String(rule?.claimTip || "").trim();
  return fallback || "";
};

const Index = ({ detail }: { detail: any }) => {
  const dispatch: AppDispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const toast = useToast();
  const [boxWidth, setBoxWidth] = useState(66);
  const [boxGroups, setBoxGroups] = useState<any[][]>([]);
  const [successPopup, setSuccessPopup] = useState({
    show: false,
    bonusAmount: "" as number | string,
    claimTip: "",
  });
  const config: any = useSelector(
    (state: RootState) => state?.user?.cfg_site_base,
  );
  const tenantInfo: Tenant = useSelector(tenantStore);

  // 平台URL映射对象
  const platformUrl = {
    youtobe: "youtobeUrl",
    facebook: "facebookUrl",
    instagram: "instgramHomePageUrl",
    whatsapp: "whatsapp",
    telegram: "telegram",
    twitter: "twitter",
  };

  // 宝箱 state：0 不可开；1 待开；2 已开（与 activeCenterConfig promotion 的 box_/hongbao_ 后缀一致）
  const generateBoxStates = (treasures: any[]) =>
    treasures.map((item) => {
      let state: number;
      if (item.hasPick) state = 2;
      else if (item.canOpen) state = 1;
      else state = Number(item.status ?? 0);
      return { ...item, state };
    });
  useFocusEffect(
    useCallback(() => {
      if (detail?.tipMessages && detail.tipMessages.length > 0) {
        toast.warn(t(`${detail.tipMessages[0].msg}`));
      }
      if (detail?.optional?.treasures?.length) {
        const newConfigs = generateBoxStates(detail.optional.treasures);
        setBoxGroups(groupByRows(newConfigs, 4));
      }
    }, [detail]),
  );

  const conditionData = useMemo(() => {
    if (!detail?.optional?.condition) {
      return {
        firstDeposit: null,
        totalDeposit: null,
        totalBet: null,
        depositCount: null,
      };
    }
    const isValidValue = (value: any) => {
      return value !== null && value !== undefined && value !== "";
    };
    return {
      firstDeposit: isValidValue(detail.optional.condition.firstDeposit)
        ? detail.optional.condition.firstDeposit
        : null,
      totalDeposit: isValidValue(detail.optional.condition.totalDeposit)
        ? detail.optional.condition.totalDeposit
        : null,
      totalBet: isValidValue(detail.optional.condition.totalBet)
        ? detail.optional.condition.totalBet
        : null,
      depositCount: isValidValue(detail.optional.condition.depositCount)
        ? detail.optional.condition.depositCount
        : null,
    };
  }, [detail?.optional?.condition]);

  //点击分享
  const sendShareLink = async (platform: PlatformType) => {
    // 平台URL匹配
    const urlKey = platformUrl[platform as keyof typeof platformUrl];
    const shareLink = config?.[urlKey];
    shareToPlatform(platform, detail?.title, shareLink);
  };
  // 开宝箱
  const openBaoXiang = async (status: number, treasure: any) => {
    toast.loading(true);
    const id = treasure?.id;
    try {
      if (status === 1 && detail?.id) {
        const res = await receiveTreasure({
          activityId: detail?.id,
          treasureId: id,
        });
        if (res.data.code === 0) {
          const updatedTreasures = detail.optional?.treasures?.map(
            (item: any) => {
              if (item.id === id)
                return { ...item, hasPick: true, canOpen: false };
              return item;
            },
          );
          // 重新生成宝箱状态
          const newConfigs = generateBoxStates(updatedTreasures || []);
          const groups = groupByRows(newConfigs, 4);
          setBoxGroups(groups);
          dispatch(baoxiangInfoAsync());
          const bonusAmount = treasure?.amount ?? "0.00";
          const claimTip = getTreasureClaimTip({
            rules: detail.ruleVOList || [],
            treasure,
            lang: i18n.language,
          });
          setSuccessPopup({
            show: true,
            bonusAmount,
            claimTip: claimTip,
          });
        } else {
          toast.warn(t("status.claim.claimFailed"));
        }
      } else if (status === 2) {
        toast.warn(t("active.center.promotion.weimazu"));
      } else {
        toast.warn(t("active.center.promotion.weimazu"));
      }
    } finally {
      toast.loading(false);
    }
  };

  //如果是最后一个boxIndex，或者是唯一的boxIndex，则不显示宝箱的箭头
  const renderArrowIcon = (
    boxIndex: number,
    isReverse: boolean,
    totalLength: number,
  ) => {
    if (boxIndex === totalLength - 1 || totalLength === 1) return null;
    return (
      <AntDesign
        key={`arrow-${boxIndex}`}
        name="doubleright"
        size={Math.round(rf(16))}
        color={"rgba(173, 183, 186, 1)"}
        style={{
          marginHorizontal: isReverse ? 1 : 0,
          transform: [{ rotate: isReverse ? "180deg" : "0deg" }],
        }}
      />
    );
  };

  return (
    <View
      className="w-full"
      style={{ backgroundColor: Colors[theme].background }}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setBoxWidth(Math.round((width - 48) / 4));
      }}
    >
      <ActivitySuccessPopup
        show={successPopup.show}
        bonusAmount={successPopup.bonusAmount}
        moneyUnit={tenantInfo?.currency || ""}
        claimTip={successPopup.claimTip}
        onShowChange={(show) =>
          setSuccessPopup((prev) => ({
            ...prev,
            show,
          }))
        }
      />
      <View className="flex-row justify-start items-center my-2">
        <TuiGuangIcon fill={Colors[theme].primary} />
        <Text
          className="ml-2 font-semibold"
          style={{ color: Colors[theme].text, fontSize: rf(14) }}
        >
          {t("home.promoteInfo")}
        </Text>
      </View>
      <View
        style={[
          styles.info,
          { padding: 15, backgroundColor: Colors[theme].cardBg1 },
        ]}
      >
        <View
          style={{
            backgroundColor: "rgba(246, 246, 246, 1)",
            padding: 16,
            borderRadius: 16,
          }}
        >
          {typeof detail?.optional?.promLink === "string" &&
            detail.optional.promLink.trim() !== "" && (
              <QRCode
                value={detail.optional.promLink}
                size={120}
                color="#000000"
                backgroundColor="transparent"
                ecl="H"
              />
            )}
        </View>
        <Text
          className="my-3"
          style={{ color: Colors[theme].text, fontSize: rf(14) }}
        >
          {t("active.center.promotion.tglink")} · {t("active.center.promotion.sys")}
        </Text>
        <View
          style={[
            styles.infoBtn,
            { backgroundColor: Colors[theme].background },
          ]}
        >
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={[
              styles.infoText,
              { color: Colors[theme].text, fontSize: rf(12) },
            ]}
          >
            {detail?.optional?.promLink}
          </Text>
          <Pressable
            style={{ position: "absolute", right: 16 }}
            onPress={async () => {
              await Clipboard.setStringAsync(detail?.optional?.promLink);
              toast.success(t("common.copySuccess"));
            }}
          >
            <CopyIcon fill={Colors[theme].lightText} />
          </Pressable>
        </View>
        <View
          style={[styles.line, { borderBottomColor: beDealtTheme[theme].line }]}
        />
        <ScrollView
          className="w-full"
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {!!config?.facebookUrl && (
            <Pressable
              className="justify-center items-center mx-2"
              onPress={() => sendShareLink("facebook")}
            >
              <Image
                resizeMode={"contain"}
                source={require("@/assets/images/active/activeCenter/Facebook.png")}
                style={styles.shareImage}
              />
              <Text
                className="mt-2"
                style={{ color: Colors[theme].lightText, fontSize: rf(10) }}
              >
                FaceBook
              </Text>
            </Pressable>
          )}
          {!!config?.telegram && (
            <Pressable
              className="justify-center items-center mx-2"
              onPress={() => sendShareLink("telegram")}
            >
              <Image
                resizeMode={"contain"}
                source={require("@/assets/images/active/activeCenter/Telegram.png")}
                style={styles.shareImage}
              />
              <Text
                className="mt-2"
                style={{ color: Colors[theme].lightText, fontSize: rf(10) }}
              >
                Telegram
              </Text>
            </Pressable>
          )}
          {!!config?.whatsapp && (
            <Pressable
              className="justify-center items-center mx-2"
              onPress={() => sendShareLink("whatsapp")}
            >
              <Image
                resizeMode={"contain"}
                source={require("@/assets/images/active/activeCenter/WhatsApp.png")}
                style={styles.shareImage}
              />
              <Text
                className="mt-2"
                style={{ color: Colors[theme].lightText, fontSize: rf(10) }}
              >
                WhatsApp
              </Text>
            </Pressable>
          )}
          {!!config?.instgramHomePageUrl && (
            <Pressable
              className="justify-center items-center mx-2"
              onPress={() => sendShareLink("instagram")}
            >
              <Image
                resizeMode={"contain"}
                source={require("@/assets/images/active/activeCenter/Instagram.png")}
                style={styles.shareImage}
              />
              <Text
                className="mt-2"
                style={{ color: Colors[theme].lightText, fontSize: rf(10) }}
              >
                Instagram
              </Text>
            </Pressable>
          )}
          {!!config?.twitter && (
            <Pressable
              className="justify-center items-center mx-2"
              onPress={() => sendShareLink("twitter")}
            >
              <Image
                resizeMode={"contain"}
                source={require("@/assets/images/active/activeCenter/Twitter.png")}
                style={styles.shareImage}
              />
              <Text
                className="mt-2"
                style={{ color: Colors[theme].lightText, fontSize: rf(10) }}
              >
                Twitter
              </Text>
            </Pressable>
          )}
        </ScrollView>
        <View className="w-full flex-row justify-between items-center mt-8">
          <Text style={{ color: Colors[theme].lightText, fontSize: rf(13) }}>
            {t("active.center.promotion.yxxcrs")}
          </Text>
          <Text style={{ color: Colors[theme].text, fontSize: rf(13) }}>
            {t("active.center.promotion.person", { number: detail?.sufficientCount || 0 })}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-start items-center mb-2">
        <JinShengIcon fill={Colors[theme].primary} />
        <Text
          className="ml-2 font-semibold"
          style={{ color: Colors[theme].text, fontSize: rf(14) }}
        >
          {t("active.center.promotion.jswjrs")}
        </Text>
      </View>
      <View style={[styles.info, { backgroundColor: Colors[theme].cardBg1 }]}>
        <Text
          className="my-3"
          ellipsizeMode="tail"
          numberOfLines={2}
          style={{ color: Colors[theme].lightText, fontSize: rf(11) }}
        >
          {detail?.optional?.conditionMode === 0
            ? t("active.center.promotion.mzrytj")
            : t("active.center.promotion.mzsytj")}
        </Text>
        <View className="w-full flex-row justify-between items-center px-3">
          <Text
            className="items-center"
            style={{ color: Colors[theme].lightText, fontSize: rf(12) }}
          >
            {t("active.center.promotion.zhsc")}
          </Text>
          <Text
            className="items-center"
            style={{ color: Colors[theme].text, fontSize: rf(12) }}
          >
            {conditionData.firstDeposit !== null
              ? `≥ ${conditionData.firstDeposit}`
              : "--"}
          </Text>
        </View>
        <View
          style={[styles.line, { borderBottomColor: beDealtTheme[theme].line }]}
        />
        <View className="w-full flex-row justify-between items-center px-3">
          <Text
            className="items-center"
            style={{ color: Colors[theme].lightText, fontSize: rf(12) }}
          >
            {t("active.center.promotion.ljcz")}
          </Text>
          <Text
            className="items-center"
            style={{ color: Colors[theme].text, fontSize: rf(12) }}
          >
            {conditionData.totalDeposit !== null
              ? `≥ ${conditionData.totalDeposit}`
              : "--"}
          </Text>
        </View>
        <View
          style={[styles.line, { borderBottomColor: beDealtTheme[theme].line }]}
        />
        <View className="w-full flex-row justify-between items-center px-3">
          <Text
            className="items-center"
            style={{ color: Colors[theme].lightText, fontSize: rf(12) }}
          >
            {t("active.center.promotion.ljdm")}
          </Text>
          <Text
            className="items-center"
            style={{ color: Colors[theme].text, fontSize: rf(12) }}
          >
            {conditionData.totalBet !== null
              ? `≥ ${conditionData.totalBet}`
              : "--"}
          </Text>
        </View>
        <View
          style={[styles.line, { borderBottomColor: beDealtTheme[theme].line }]}
        />
        <View className="w-full flex-row justify-between items-center px-3 mb-3">
          <Text
            className="items-center"
            style={{ color: Colors[theme].lightText, fontSize: rf(12) }}
          >
            {t("active.center.promotion.ljczcs")}
          </Text>
          <Text
            className="items-center"
            style={{ color: Colors[theme].text, fontSize: rf(12) }}
          >
            {conditionData.depositCount !== null
              ? `≥ ${conditionData.depositCount}`
              : "--"}
          </Text>
        </View>
      </View>

      {boxGroups.map((row, rowIndex) => {
        const isReverse = rowIndex % 2 !== 0;
        const isLastRow = rowIndex === boxGroups.length - 1;
        let className = "w-full items-center justify-start";
        className += isReverse ? " flex-row-reverse" : " flex-row";
        return (
          <View
            key={`box-${rowIndex}`}
            className={`w-full items-center ${isLastRow ? "mb-4" : ""}`}
          >
            <View className={className}>
              {row.map((val, boxIndex) => {
                const displayMode = detail?.optional?.displayMode;
                const boxState = val.state ?? val.status ?? 0;
                const assetKey =
                  displayMode === 1 ? `box_${boxState}` : `hongbao_${boxState}`;
                return (
                  <React.Fragment key={`${val.id}-${rowIndex}-${boxIndex}`}>
                    {/* 大宝箱 */}
                    <Pressable
                      className="justify-center self-start shrink relative"
                      onPress={() => openBaoXiang(boxState, val)}
                    >
                      <ImageBackground
                        key={`${val.id}-${displayMode}-${boxState}`}
                        source={activeCenterConfig.promotion.state(assetKey)}
                        resizeMode="stretch"
                        style={{
                          width: boxWidth,
                          height: boxWidth,
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          numberOfLines={
                            detail.optional?.displayMode === 2 ? 2 : 1
                          }
                          ellipsizeMode="tail"
                          className="text-center"
                          style={{
                            color: "#fff",
                            marginBottom: 12,
                            fontSize: rf(12),
                          }}
                        >
                          {val.amount}
                          {detail.optional?.displayMode === 2
                            ? `\n${tenantInfo?.currency || ""}`
                            : ` ${tenantInfo?.currency || ""}`}
                        </Text>
                      </ImageBackground>
                      <View className="flex-1 mt-1 justify-center items-center">
                        <Text
                          style={{
                            fontSize: rf(12),
                            color: Colors[theme].lightText,
                          }}
                        >
                          {t("active.center.promotion.person", { number: val.invitePerson })}
                        </Text>
                      </View>
                    </Pressable>
                    {renderArrowIcon(boxIndex, isReverse, row.length)}
                  </React.Fragment>
                );
              })}
            </View>
            {/* 向下箭头 */}
            {!isLastRow && (
              <View
                className={`w-full my-1`}
                style={{
                  alignItems: isReverse ? "flex-start" : "flex-end",
                }}
              >
                <View
                  className="justify-center items-center"
                  style={{ width: boxWidth }}
                >
                  <AntDesign
                    name="doubleright"
                    size={Math.round(rf(16))}
                    color={"rgba(173, 183, 186, 1)"}
                    style={{ transform: [{ rotate: "90deg" }] }}
                  />
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  info: {
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBtn: {
    position: "relative",
    borderRadius: 22,
    padding: 12,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  infoText: {
    width: "92%",
  },
  line: {
    width: "100%",
    borderBottomWidth: 1,
    marginVertical: 16,
  },
  shareImage: {
    width: 37,
    height: 37,
    margin: "auto",
  },
});

export default Index;
