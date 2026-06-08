//活动中心
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  FlatList,
  Platform,
  useWindowDimensions,
} from "react-native";
import { rf } from "@/utils/scaleFont";
import { getActDetail, joinAct } from "@/api";
import { LinearGradient } from "expo-linear-gradient";
import { AppDispatch, RootState } from "@/store/store";
import { AutoHeightWebView } from "@/components/common/AutoHeightWebView";
import { SimpleHeader } from "@/components/common/Header";
import ActTime from "@/components/icons/active/ActTime";
import ActiveTime from "@/components/icons/active/ActiveTime";
import { missionTheme } from "@/components/active/components/activeConfg";
import RulesIcon from "@/components/icons/active/vip/RulesIcon";
import NeiRong from "@/components/icons/active/NeiRong";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useToast } from "@/components/common/toast";
import Promotion from "@/components/active/activeCenter/Promotion";
import CustomActivity from "@/components/active/activeCenter/CustomActivity";
import { setActiveTitle } from "@/store/active/activeSlice";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { activeTheme } from "@/components/active/components/activeConfg";
import { processTitle } from "@/utils/titleUtils";
import { Colors } from "@/constants/Colors";
import { screen } from "@/utils/screen";
import dayjs from "dayjs";
import Baoxiang5 from "@/components/icons/active/Baoxiang5";
import MemberDay from "@/app/active/memberDay";
import SpecialBonus from "@/app/active/specialBonus";
import {
  ActiveCenterRescueFundsTable,
  ActiveCenterStandardTable,
} from "@/components/active/activeCenter/ActiveCenterRuleTables";
import { ActiveCenterMiningCover } from "@/components/active/activeCenter/ActiveCenterMiningCover";
import {
  buildMiningTimeList,
  formatCountdown,
  getClaimState,
  getCurrentAward,
  getCurrentClaimTimes,
  getMineTimeStatus,
  getScheduleCountdownState,
  type MiningSchedule,
} from "@/utils/activityScheduleCountdown";
import { MAX_WIDTH } from "@/hooks/useMaxWidth";
import { ActiveCenterBottomStrip } from "@/components/active/activeCenter/ActiveCenterBottomStrip";

/**
 * @description
 * 活动逻辑:
 * 1、后台提供的活动类型有 0｜ 1 | 2 | 6 ｜ 8 | 9
 * 2、页面不一样：0自定义 1宝箱 2打码 6救援金 8注册活动 9连续中奖
 * 3、如果isStandard，就显示表格；如果isCustom就显示提交框;否则显示推广
 * "applyPreferential"是否申请优惠
 * @param underfined
 * @returns {underfined}
 */

type RowTitleType = 0 | 1 | 2 | 6 | 8 | 9;
export type RouteParams = {
  id: number;
  type: RowTitleType;
  actDepositType?: number;
}; //控制路由参数的类型
type RowTitleItem = { name: string; bonus: string };
type TitleMap = Record<RowTitleType, RowTitleItem>;
const BOTTOM_STRIP_CARD_GAP = 8;
const ACTIVITY_CARD_IMG_H = 78;
const formatSecond = "YYYY-MM-DD HH:mm:ss";

const ACTIVITY_CENTER_FLAT_LIST_EMPTY: readonly string[] = [];

const index = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const toast = useToast();
  const dispatch: AppDispatch = useDispatch();
  const title = useSelector((state: RootState) => state.active?.actTitle);
  const userInfo: any = useSelector(
    (state: RootState) => state?.user?.userInfo,
  );
  const activityList = useSelector(
    (state: RootState) => state?.active?.activityList,
  );
  const [actDetail, setActDetail] = useState<any>({});
  const [isLoading, setLoading] = useState<boolean>(true);
  const [nowTs, setNowTs] = useState(Date.now());
  const cardList = useMemo(
    () => (Array.isArray(activityList) ? activityList : []),
    [activityList],
  );

  const isShowTime = useMemo(() => {
    const endTime = actDetail?.endTime;
    if (!endTime) return false;
    const endDate = new Date(endTime);
    if (Number.isNaN(endDate.getTime())) return true;
    return endDate.getFullYear() !== 9999;
  }, [actDetail?.endTime]);

  const ruleDescLines = useMemo(() => {
    if (!actDetail?.ruleDesc) return [];
    return String(actDetail.ruleDesc)
      .split("\n")
      .filter((line) => line.trim() !== "");
  }, [actDetail?.ruleDesc]);

  const searchParams = useLocalSearchParams<{
    id: string;
    type: string;
    actDepositType?: string;
  }>();

  const { width: windowWidth } = useWindowDimensions();
  const isWideScreen = windowWidth > MAX_WIDTH;
  const activityCoverSlotW = Math.max(
    200,
    Math.floor(Math.min(windowWidth, MAX_WIDTH) - 16),
  );

  const bottomStripViewportW = useMemo(
    () => Math.max(200, Math.floor(Math.min(windowWidth, MAX_WIDTH) - 16)),
    [windowWidth],
  );
  const bottomCardW = useMemo(
    () =>
      Math.max(
        120,
        Math.floor((bottomStripViewportW - BOTTOM_STRIP_CARD_GAP) / 2),
      ),
    [bottomStripViewportW],
  );
  const bottomCardStride = bottomCardW + BOTTOM_STRIP_CARD_GAP;
  const bottomCardImgH = useMemo(
    () => Math.round(bottomCardW / 2.22),
    [bottomCardW],
  );

  const activityType = useMemo(
    () => searchParams?.type ?? actDetail?.activityType,
    [actDetail, searchParams],
  );

  const isSpecialBonusActivity =
    actDetail?.mysteryBonusData != null || Number(activityType) === 11;
  const isMemberDayActivity =
    actDetail?.memberDayRules != null || Number(activityType) === 10;

  const isStandard = (i: any): boolean =>
    i == 2 || (i == 3 && Number(searchParams?.actDepositType) !== 16) || i == 4;
  const isRegister = (i: any): boolean => i == 8;
  const isCustom = (i: any): boolean => i == 0;

  //ngss只用了0,1，2，6，8（0自定义、1宝箱、2打码、6救援金、8注册）
  const titleMap: TitleMap = {
    0: { name: "0", bonus: "0" },
    1: { name: "1", bonus: "1" },
    2: { name: t("active.center.yxdama"), bonus: t("agent.bonus") },
    6: {
      name: t("active.center.kuisun"),
      bonus: t("active.center.fanxian"),
    },
    8: { name: "8", bonus: "8" },
    9: { name: t("active.center.winningTime"), bonus: t("agent.bonus") },
  };

  useEffect(() => {
    fetchActDetail();
  }, [searchParams.id]);

  // 底部横条滚动/箭头逻辑已内聚到 ActiveCenterBottomStrip

  //获取当前活动详情
  const fetchActDetail = async () => {
    if (!searchParams?.id) return;
    toast.loading(true);
    setLoading(true);
    try {
      const res = await getActDetail({ id: searchParams?.id });
      const content = res.data?.data ?? {};
      const bonusConfigs =
        typeof content.bonusConfigs === "string"
          ? JSON.parse(content.bonusConfigs)
          : content.bonusConfigs || [];
      if (res.data?.code !== 0) {
        toast.loading(false);
        if (isCustom(Number(activityType))) {
          setActDetail({ ...content, bonusConfigs, success: false });
        } else {
          router.replace("/active");
        }
      } else {
        setActDetail({ ...content, bonusConfigs, success: true });
        toast.loading(false);
      }
    } catch (e) {
      console.error("error getActDetail:", e);
    } finally {
      setLoading(false);
    }
  };
  // 活动类型为6的时候显示table表格部分 救援金
  const renderRescueFundsTable = () => {
    return (
      <ActiveCenterRescueFundsTable
        themeKey={theme}
        t={t}
        colors={{
          background: Colors[theme].background,
          text: Colors[theme].text,
        }}
        missionTheme={missionTheme}
        ruleVOList={actDetail?.ruleVOList}
        containerStyle={{ marginTop: 16 }}
      />
    );
  };

  //标准类型的活动布局
  //type非5显示≥,type4显示%
  const renderStandardActivity = () => {
    return (
      <ActiveCenterStandardTable
        themeKey={theme}
        colors={{
          background: Colors[theme].background,
          text: Colors[theme].text,
        }}
        missionTheme={missionTheme}
        headerLeftText={titleMap[Number(activityType) as RowTitleType].name}
        headerRightText={titleMap[Number(activityType) as RowTitleType].bonus}
        activityType={Number(activityType)}
        ruleVOList={actDetail?.ruleVOList}
        containerStyle={{ marginTop: 16 }}
      />
    );
  };

  // 神秘矿山类型活动布局
  const renderMiningActivity = () => {
    return (
      <ActiveCenterMiningCover
        uri={actDetail?.coverImageURL}
        imageStyle={styles.miningCoverImage}
        viewStyle={styles.miningCoverImage}
      />
    );
  };

  const miningSchedules = useMemo<MiningSchedule[]>(() => {
    const list = actDetail?.mysteryMineSchedules;
    return Array.isArray(list) ? list : [];
  }, [actDetail]);
  const miningTimeList = useMemo(
    () => buildMiningTimeList(miningSchedules, nowTs),
    [miningSchedules, nowTs],
  );
  const mineClaimState = useMemo(
    () => getClaimState(miningTimeList),
    [miningTimeList],
  );
  const mineCountdownState = useMemo(
    () =>
      getScheduleCountdownState(
        miningSchedules.map((item) => ({
          dispatchHour: Number(item.dispatchHour),
          durationMinutes: Number(item.durationMinutes),
        })),
        new Date(nowTs),
      ),
    [miningSchedules, nowTs],
  );
  // const mineCountdownText = useMemo(
  //   () =>
  //     mineCountdownState ? formatCountdown(mineCountdownState.remainingMs) : "00:00:00",
  //   [mineCountdownState]
  // );
  const maxAwardDisplay = useMemo(
    () => String(getCurrentAward(miningTimeList) ?? 0),
    [miningTimeList],
  );
  const mineClaimTimes = useMemo(
    () => String(getCurrentClaimTimes(miningTimeList) ?? 0),
    [miningTimeList],
  );
  const mineClaimButtonText = useMemo(() => {
    if (mineClaimState === 1) return t("active.mysteriousMine.mineBtnMining");
    if (mineClaimState === 2) {
      return t("active.mysteriousMine.mineBtnMined", { defaultValue: "Mined" });
    }
    return t("active.mysteriousMine.notStartedYet1");
    // return t("active.mysteriousMine.mineBtnClosedOpeningSoon", {
    //   time: mineCountdownText,
    // });
  }, [mineClaimState, t]);
  const mineActionBtnBgColor = useMemo(
    () =>
      mineClaimState === 1
        ? Colors[theme].primary
        : missionTheme[theme].content.b,
    [mineClaimState, theme],
  );

  const handleMineClaim = async () => {
    if (!userInfo?.isLogin) {
      router.push("/login");
      return;
    }

    if (mineClaimState !== 1 || !actDetail?.id) return;
    toast.loading(true);
    try {
      const res = await joinAct({
        activityId: String(actDetail.id),
        treasureId: "",
      });
      if (res?.data?.code === 0) {
        const rewardData = res?.data?.data;
        const successMessage =
          typeof rewardData === "number" && Number.isFinite(rewardData)
            ? t("status.claim.claimSuccessWithAmount", { amount: rewardData })
            : t("status.claim.claimSuccess");
        toast.success(successMessage);
        await fetchActDetail();
      } else {
        toast.error(t(res?.data?.code));
      }
    } catch (error) {
      // 网络/请求异常交由接口基类统一错误提示
      console.error("handleMineClaim error:", error);
    } finally {
      toast.loading(false);
    }
  };

  const handleBottomStripCardSelect = useCallback(
    ({
      id,
      text,
      type,
      actDepositType,
    }: {
      id: number;
      text: string;
      type: number;
      actDepositType?: number;
    }) => {
      if (id === Number(searchParams.id)) return;
      dispatch(setActiveTitle({ title: text }));
      router.setParams({
        id: id.toString(),
        type: type.toString(),
        actDepositType: actDepositType?.toString(),
      });
    },
    [searchParams.id, dispatch, router],
  );

  return (
    <SafeAreaView
      style={{ backgroundColor: Colors[theme].background }}
      className="flex-1"
    >
      <SimpleHeader
        title={processTitle(title?.trim() || actDetail?.activityName || "")}
      />

      <FlatList
        data={ACTIVITY_CENTER_FLAT_LIST_EMPTY}
        keyExtractor={() => "activity-center-scroll"}
        renderItem={() => null}
        showsVerticalScrollIndicator={false}
        className={`${!isSpecialBonusActivity && !isMemberDayActivity && "mx-2"} mb-4 hide-scrollbar`}
        style={{ flex: 1 }}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        maxToRenderPerBatch={8}
        windowSize={9}
        initialNumToRender={1}
        updateCellsBatchingPeriod={32}
        decelerationRate="normal"
        ListHeaderComponent={
          <>
            {isSpecialBonusActivity ? (
              <SpecialBonus id={String(searchParams?.id ?? "")} />
            ) : isMemberDayActivity ? (
              <MemberDay id={String(searchParams?.id ?? "")} />
            ) : (
              <>
                {isStandard(Number(activityType)) && renderStandardActivity()}
                {Number(activityType) === 6 && renderRescueFundsTable()}
                {Number(activityType) === 9 && (
                  <ActiveCenterStandardTable
                    themeKey={theme}
                    colors={{
                      background: Colors[theme].background,
                      text: Colors[theme].text,
                    }}
                    missionTheme={missionTheme}
                    headerLeftText={titleMap[9].name}
                    headerRightText={titleMap[9].bonus}
                    activityType={9}
                    ruleVOList={actDetail?.ruleVOList}
                    containerStyle={{ marginTop: 16 }}
                    showRequirementPrefix={false}
                  />
                )}
                {Number(activityType) === 12 && renderMiningActivity()}
                {/* 推广类型 显示推广宝箱和领取规则，不显示时间 */}
                {Number(activityType) == 1 ? (
                  <>
                    <Promotion detail={actDetail} />
                    <View>
                      <View className="justify-start flex-row flex-wrap items-center mb-2">
                        <Baoxiang5 fill={Colors[theme].primary} />
                        <Text
                          className="ml-2"
                          style={[
                            styles.bonusTitle,
                            { color: Colors[theme].text, fontSize: rf(14) },
                          ]}
                        >
                          {t("active.center.lqgz")}
                        </Text>
                      </View>
                      <View
                        className="w-full p-4 rounded-lg justify-center items-center"
                        style={{
                          backgroundColor: missionTheme[theme].content.a,
                        }}
                      >
                        {!isLoading && (
                          <Text
                            className="text-left self-start"
                            style={{
                              color: Colors[theme].lightText,
                              fontSize: rf(12),
                            }}
                          >
                            {t("active.center.bxljjl")}
                          </Text>
                        )}
                      </View>
                    </View>
                  </>
                ) : (
                  //注册类型显示渐变头部，不显示时间
                  isRegister(Number(activityType)) && (
                    <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      colors={[
                        activeTheme[theme].banner.s,
                        activeTheme[theme].banner.e,
                      ]}
                      style={{
                        width: "100%",
                        paddingVertical: 16,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        className="text-center font-bold mb-2"
                        style={{ fontSize: rf(32), color: Colors[theme].text }}
                      >
                        {actDetail?.ruleVOList?.[0]?.rewardValue}
                      </Text>
                      <Text
                        className="text-center"
                        style={{ color: Colors[theme].text, fontSize: rf(15) }}
                      >
                        {t("agent.bonus")}
                      </Text>
                    </LinearGradient>
                  )
                )}
                {/* 活动时间 */}
                {isShowTime && (
                  <View className="mt-4">
                    <View className="justify-start flex-row flex-wrap items-center mb-2">
                      <ActTime fill={Colors[theme].primary} />
                      <Text
                        className="ml-2"
                        style={[
                          styles.bonusTitle,
                          { color: Colors[theme].text, fontSize: rf(14) },
                        ]}
                      >
                        {t("active.center.time")}
                      </Text>
                    </View>
                    <View
                      className="p-4 rounded-lg items-center justify-center"
                      style={{ backgroundColor: missionTheme[theme].content.a }}
                    >
                      <Text
                        className="text-left self-start"
                        style={{
                          color: Colors[theme].lightText,
                          fontSize: rf(12),
                        }}
                      >
                        {actDetail?.success
                          ? `${dayjs(actDetail?.startTime).format(formatSecond)} - ${dayjs(actDetail?.endTime).format(formatSecond)}`
                          : " ---- "}
                      </Text>
                    </View>
                  </View>
                )}
                {/* 活动详情 */}
                {!isLoading && actDetail?.introductionDetail && (
                  <View className="my-4">
                    <View className="justify-start flex-row flex-wrap items-center mb-3">
                      <NeiRong fill={Colors[theme].primary} />
                      <Text
                        className="ml-2"
                        style={[
                          styles.bonusTitle,
                          { color: Colors[theme].text, fontSize: rf(14) },
                        ]}
                      >
                        {t("active.center.content")}
                      </Text>
                    </View>
                    <View
                      className="w-full px-4 py-4 rounded-lg justify-center items-center"
                      style={{ backgroundColor: missionTheme[theme].content.a }}
                    >
                      <AutoHeightWebView
                        width={screen.get("screen").width - 40}
                        htmlStyle={{
                          paddingRight: 4,
                          paddingLeft: 4,
                          fontSize: rf(12),
                          textAlign: "left",
                          alignSelf: "flex-start",
                          color: Colors[theme].lightText,
                          backgroundColor: missionTheme[theme].content.a,
                        }}
                        source={actDetail.introductionDetail}
                        autoHeight
                        setInnerHTML
                      />
                    </View>
                  </View>
                )}

                {/* 活动规则 */}
                {!isLoading && ruleDescLines.length > 0 && (
                  <View className="mt-4">
                    <View className="justify-start flex-row flex-wrap items-center mb-3">
                      <RulesIcon fill={Colors[theme].primary} />
                      <Text
                        className="ml-2"
                        style={[
                          styles.bonusTitle,
                          { color: Colors[theme].text, fontSize: rf(14) },
                        ]}
                      >
                        {t("active.center.activeRules")}
                      </Text>
                    </View>
                    <View
                      className="w-full p-4 rounded-lg justify-center items-center"
                      style={{ backgroundColor: missionTheme[theme].content.a }}
                    >
                      {ruleDescLines.map((line, index) => (
                        <Text
                          key={index}
                          className="text-left self-start w-full"
                          style={{
                            color: Colors[theme].lightText,
                            fontSize: rf(12),
                          }}
                        >
                          {line}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                {!isLoading && Number(activityType) === 12 && (
                  <View className="mt-4">
                    <Pressable
                      disabled={mineClaimState !== 1}
                      onPress={handleMineClaim}
                      style={[styles.mineActionBtn, { overflow: "hidden" }]}
                    >
                      <LinearGradient
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        colors={[Colors[theme].gradient, Colors[theme].primary]}
                        style={[
                          StyleSheet.absoluteFillObject,
                          {
                            borderRadius: 24,
                            opacity: mineClaimState !== 1 ? 0.5 : 1,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.mineActionBtnText,
                          { fontSize: rf(14) },
                          { color: Colors[theme].btnText },
                        ]}
                      >
                        {mineClaimButtonText}
                      </Text>
                    </Pressable>
                    <View
                      className="w-full rounded-lg p-4 mt-3"
                      style={{ backgroundColor: missionTheme[theme].content.a }}
                    >
                      <Text
                        style={[
                          styles.mineLabel,
                          { color: Colors[theme].lightText, fontSize: rf(14) },
                        ]}
                      >
                        {t("active.mysteriousMine.maxAward")}
                      </Text>
                      <Text
                        style={[
                          styles.mineAmount,
                          { color: Colors[theme].primary, fontSize: rf(24) },
                        ]}
                      >
                        {maxAwardDisplay}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.mineClaimTimesText,
                        { color: Colors[theme].lightText, fontSize: rf(12) },
                      ]}
                    >
                      {t("active.mysteriousMine.miningTimes")}
                      <Text
                        style={{
                          color: Colors[theme].primary,
                          fontSize: rf(12),
                        }}
                      >
                        {" "}
                        {mineClaimTimes}
                      </Text>
                    </Text>
                    <View className="justify-start flex-row flex-wrap items-center mb-3 mt-3">
                      <ActiveTime fill={Colors[theme].primary} />
                      <Text
                        className="ml-2"
                        style={[
                          styles.bonusTitle,
                          styles.mineDispatchTitle,
                          { color: Colors[theme].text, fontSize: rf(15) },
                        ]}
                      >
                        {t("active.mysteriousMine.dispatchTime")}
                      </Text>
                    </View>
                    <View
                      className="w-full rounded-lg p-4"
                      style={{ backgroundColor: missionTheme[theme].content.a }}
                    >
                      <View style={styles.mineTimeListWrap}>
                        {miningTimeList.map((item) => {
                          const status = getMineTimeStatus(item);
                          return (
                            <Text
                              key={item.key}
                              style={[
                                styles.mineTimeText,
                                {
                                  fontSize: rf(13),
                                  color: Colors[theme].text,
                                  backgroundColor:
                                    Colors[theme].mineTimeBgColor,
                                },
                                status === "active" && {
                                  color: Colors[theme].primary,
                                },
                                status === "disabled" && {
                                  color: Colors[theme].lightText,
                                },
                              ]}
                            >
                              {item.startTime}-{item.endTime}
                            </Text>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                )}
                {isCustom(Number(activityType)) && (
                  <CustomActivity param={searchParams} data={actDetail} />
                )}
              </>
            )}

            <ActiveCenterBottomStrip
              cardList={cardList}
              bottomCardStride={bottomCardStride}
              bottomCardW={bottomCardW}
              bottomCardImgH={bottomCardImgH}
              viewportW={bottomStripViewportW}
              selectedId={Number(searchParams.id)}
              selectedType={Number(activityType)}
              isWideScreen={isWideScreen}
              primaryColor={Colors[theme].primary}
              arrowColor={Colors[theme].text}
              arrowBgColor={Colors[theme].btnText}
              onSelect={handleBottomStripCardSelect}
              containerStyle={
                Number(activityType) === 6 && { marginBottom: 80 }
              }
            />
            <View className="h-[120px]" />
          </>
        }
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  bonusView: {
    borderRadius: 8,
    width: "100%",
    overflow: "hidden",
  },
  bonusRow: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignContent: "center",
  },
  bonusCell: {
    width: "50%",
    alignItems: "center",
    alignContent: "center",
    textAlign: "center",
    fontSize: 12,
  },
  bonusTitle: {
    alignItems: "center",
    alignContent: "center",
    alignSelf: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  webView: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  miningCoverImage: {
    width: "100%",
    // borderRadius: 8,
  },
  input: {
    paddingStart: 0,
    paddingEnd: 0,
    width: "100%",
    fontSize: 13,
    borderWidth: 0,
    minHeight: 35,
    marginBottom: 8,
  },
  inputStyle: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 16,
  },
  inputContainer: {
    paddingStart: 0,
    paddingEnd: 0,
    width: "100%",
    borderBottomWidth: 0,
  },
  applyButton: {
    alignSelf: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  fixedView: {
    position: "absolute",
    paddingHorizontal: 10,
    paddingVertical: 16,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  fixedButton: {
    flex: 0.45,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  refundStatus: {
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 16,
  },
  mineActionBtn: {
    marginHorizontal: 16,
    borderRadius: 24,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  mineActionBtnText: {
    width: "100%",
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  mineLabel: {
    textAlign: "center",
    fontSize: 14,
  },
  mineAmount: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 6,
  },
  mineClaimTimesText: {
    width: "100%",
    textAlign: "right",
    fontSize: 12,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  mineDispatchTitle: {
    fontSize: 15,
  },
  mineTimeListWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  mineTimeText: {
    width: "48%",
    textAlign: "center",
    fontSize: 13,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mineTimeTextDisabled: {
    color: "#8F8098",
  },
});
export default index;
