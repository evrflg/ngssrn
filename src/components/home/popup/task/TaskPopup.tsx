import { RootState } from "@/store/store";
import { router, usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { CloseButton } from "../common/CloseButton";
import { PopupModal } from "../common/PopupModal";
import { usePopupEligibility } from "../common/usePopupEligibility";
import { fetchTaskDialogData } from "./taskPopupData";
import {
  dismissTaskPopup,
  isTaskPopupDismissedToday,
  shouldShowTaskPopup,
} from "./taskPopupStorage";
import {
  DialogShowTiming,
  DialogShowType,
  TaskDialogData,
  TaskRewardRule,
  TaskType,
} from "./types";
import { CheckIcon } from "@/components/common/BaseCheckbox";
import { rf } from "@/utils/scaleFont";
import { AppDispatch } from "@/store/store";
import { fetchFinanceOverview } from "@/store/user/userSlice";
import { useCommon } from "@/hooks/CommonProvider";

type OutlinedTextProps = {
  children: React.ReactNode;
  style?: any;
  outlineColor?: string;
  outlineWidth?: number;
};

function OutlinedText({
  children,
  style,
  outlineColor = "#a24a00",
  outlineWidth = 3,
}: OutlinedTextProps) {
  const uid = useId();
  const gradId = useMemo(
    () => `taskPopupOutlinedGrad_${uid.replace(/[^a-zA-Z0-9_]/g, "_")}`,
    [uid],
  );
  const [dims, setDims] = useState<{ width: number; height: number } | null>(
    null,
  );
  const flatStyle = useMemo(() => StyleSheet.flatten(style) ?? {}, [style]);
  const fontSize = Number(flatStyle.fontSize) || 12;
  const textAlign = flatStyle.textAlign as string | undefined;
  const svgFontWeight = useMemo(() => {
    const raw = flatStyle.fontWeight as string | number | undefined;
    if (raw === undefined || raw === null) return undefined;
    const str = String(raw);
    if (/^\d+$/.test(str)) {
      const n = Number(str);
      if (!Number.isFinite(n)) return raw as any;
      return String(Math.max(100, n - 100));
    }
    if (str === "bold") return "800";
    return raw as any;
  }, [flatStyle.fontWeight]);

  const onMeasureLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width, height } = e.nativeEvent.layout;
      if (width > 0 && height > 0) {
        setDims((prev) =>
          prev?.width === width && prev?.height === height
            ? prev
            : { width, height },
        );
      }
    },
    [],
  );

  return (
    <View style={{ position: "relative", alignSelf: "center" }}>
      <Text style={[style, { opacity: 0 }]} onLayout={onMeasureLayout}>
        {children + "   "}
      </Text>
      {dims && dims.width > 0 && dims.height > 0 ? (
        <View style={[StyleSheet.absoluteFillObject, { pointerEvents: "none" }]}>
          <Svg
            width={dims.width}
            height={dims.height}
            style={{ position: "absolute", left: 0, top: 0 }}
          >
            <Defs>
              <SvgLinearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#FFD54D" />
                <Stop offset="43.57%" stopColor="#FFE38B" />
                <Stop offset="100%" stopColor="#F7A01D" />
              </SvgLinearGradient>
            </Defs>
            {/* 先画更粗描边(居中)，再用填充层盖住内侧，实现“仅向外加粗” */}
            <SvgText
              fill="none"
              stroke={outlineColor}
              strokeWidth={outlineWidth * 2}
              strokeLinejoin="round"
              strokeLinecap="round"
              fontSize={fontSize}
              fontWeight={svgFontWeight}
              fontStyle={flatStyle.fontStyle as "normal" | "italic" | undefined}
              fontFamily={flatStyle.fontFamily as string | undefined}
              x={textAlign === "center" ? dims.width / 2 : 0}
              y={fontSize}
              textAnchor={textAlign === "center" ? "middle" : "start"}
            >
              {String(children)}
            </SvgText>
            <SvgText
              fill={`url(#${gradId})`}
              fontSize={fontSize}
              fontWeight={svgFontWeight}
              fontStyle={flatStyle.fontStyle as "normal" | "italic" | undefined}
              fontFamily={flatStyle.fontFamily as string | undefined}
              x={textAlign === "center" ? dims.width / 2 : 0}
              y={fontSize}
              textAnchor={textAlign === "center" ? "middle" : "start"}
            >
              {String(children)}
            </SvgText>
          </Svg>
        </View>
      ) : null}
    </View>
  );
}

interface TaskPopupProps {
  taskType: TaskType;
  visible?: boolean;
  onClose?: () => void;
  onQueueStateChange?: (canShow: boolean) => void;
}

interface TaskPopupInnerProps extends TaskPopupProps {
  timing: DialogShowTiming;
}

type BeforeLoginThemeKey = "ngBlkGreen" | "ngBlue" | "ngOrange" | "ngGreen";
const beforeLoginThemeMap: Record<string, BeforeLoginThemeKey> = {
  greenBlack: "ngBlkGreen",
  blueWhite: "ngBlue",
  orangeWhite: "ngOrange",
};

const beforeLoginMainImageMap: Record<BeforeLoginThemeKey, any> = {
  ngBlkGreen: require("@/assets/images/home/tasks-dialog/before-loggin/main-ngBlkGreen.webp"),
  ngBlue: require("@/assets/images/home/tasks-dialog/before-loggin/main-ngBlue.webp"),
  ngOrange: require("@/assets/images/home/tasks-dialog/before-loggin/main-ngOrange.webp"),
  ngGreen: require("@/assets/images/home/tasks-dialog/before-loggin/main-ngGreen.webp"),
};

const beforeLoginTopImageMap: Record<
  TaskType,
  Record<BeforeLoginThemeKey, any>
> = {
  [TaskType.NEW_MEMBER_BONUS]: {
    ngBlkGreen: require("@/assets/images/home/tasks-dialog/before-loggin/new-member-benefits/top-ngBlkGreen.png"),
    ngBlue: require("@/assets/images/home/tasks-dialog/before-loggin/new-member-benefits/top-ngBlue.png"),
    ngOrange: require("@/assets/images/home/tasks-dialog/before-loggin/new-member-benefits/top-ngOrange.png"),
    ngGreen: require("@/assets/images/home/tasks-dialog/before-loggin/new-member-benefits/top-ngGreen.png"),
  },
  [TaskType.DAILY]: {
    ngBlkGreen: require("@/assets/images/home/tasks-dialog/before-loggin/daily/top-ngBlkGreen.png"),
    ngBlue: require("@/assets/images/home/tasks-dialog/before-loggin/daily/top-ngBlue.png"),
    ngOrange: require("@/assets/images/home/tasks-dialog/before-loggin/daily/top-ngOrange.png"),
    ngGreen: require("@/assets/images/home/tasks-dialog/before-loggin/daily/top-ngGreen.png"),
  },
  [TaskType.WEEKLY]: {
    ngBlkGreen: require("@/assets/images/home/tasks-dialog/before-loggin/weekly/top-ngBlkGreen.png"),
    ngBlue: require("@/assets/images/home/tasks-dialog/before-loggin/weekly/top-ngBlue.png"),
    ngOrange: require("@/assets/images/home/tasks-dialog/before-loggin/weekly/top-ngOrange.png"),
    ngGreen: require("@/assets/images/home/tasks-dialog/before-loggin/weekly/top-ngGreen.png"),
  },
};

const beforeLoginDividerImage = require("@/assets/images/home/tasks-dialog/before-loggin/border.png");
const afterLoginHeaderBgImage = require("@/assets/images/home/tasks-dialog/after-loggin/rectangular-diagram.png");
const afterLoginTopImageMap: Record<TaskType, any> = {
  [TaskType.NEW_MEMBER_BONUS]: require("@/assets/images/home/tasks-dialog/after-loggin/new-member-benefits/top.png"),
  [TaskType.DAILY]: require("@/assets/images/home/tasks-dialog/after-loggin/daily/top.png"),
  [TaskType.WEEKLY]: require("@/assets/images/home/tasks-dialog/after-loggin/weekly/top.png"),
};

/** URL `tab` for `/active/missionCenter` (MissionCategory, excluding "all") */
const taskTypeToMissionCenterTab: Record<
  TaskType,
  "newUserBenefits" | "dailyMissions" | "weeklyMissions"
> = {
  [TaskType.NEW_MEMBER_BONUS]: "newUserBenefits",
  [TaskType.DAILY]: "dailyMissions",
  [TaskType.WEEKLY]: "weeklyMissions",
};
const afterLoginUnderlineImageMap: Record<BeforeLoginThemeKey, any> = {
  ngBlkGreen: require("@/assets/images/home/tasks-dialog/after-loggin/underline-ngBlkGreen.png"),
  ngBlue: require("@/assets/images/home/tasks-dialog/after-loggin/underline-ngBlue.png"),
  ngOrange: require("@/assets/images/home/tasks-dialog/after-loggin/underline-ngOrange.png"),
  ngGreen: require("@/assets/images/home/tasks-dialog/after-loggin/underline-ngGreen.png"),
};

const pad2 = (num: number) => String(num).padStart(2, "0");
/** Cumulative task targets — aligned with `packages/src/utils/task-popup.ts` */
const CUMULATIVE_TASKS = {
  DEPOSIT: 0,
  NET_AMOUNT: 2,
  PROFIT: 6,
  LOSS: 7,
} as const;
type CumulativeTaskValue =
  (typeof CUMULATIVE_TASKS)[keyof typeof CUMULATIVE_TASKS];
const cumulativeTaskValues = Object.values(
  CUMULATIVE_TASKS,
) as readonly CumulativeTaskValue[];
const isCumulativeTask = (type: number): type is CumulativeTaskValue =>
  cumulativeTaskValues.includes(type as CumulativeTaskValue);

interface FinanceOverview {
  todayDepositMoney?: number;
  todayValidBetNum?: number;
  todayWinNum?: number;
  todayProfit?: number;
  weekDepositMoney?: number;
  weekValidBetNum?: number;
  weekWinNum?: number;
  weekProfit?: number;
}

const isCompleteDailyCumulative = (
  taskTarget: number,
  rewardRules: TaskRewardRule[],
  financeOverview: FinanceOverview,
) => {
  switch (taskTarget) {
    case CUMULATIVE_TASKS.DEPOSIT: {
      const { todayDepositMoney = 0 } = financeOverview;
      return rewardRules.some(
        (rule) => todayDepositMoney >= Number(rule.maxStepValue),
      );
    }
    case CUMULATIVE_TASKS.NET_AMOUNT: {
      const { todayValidBetNum = 0 } = financeOverview;
      return rewardRules.some(
        (rule) => todayValidBetNum >= Number(rule.maxStepValue),
      );
    }
    case CUMULATIVE_TASKS.PROFIT: {
      const { todayWinNum = 0 } = financeOverview;
      return rewardRules.some(
        (rule) => todayWinNum >= Number(rule.maxStepValue),
      );
    }
    case CUMULATIVE_TASKS.LOSS: {
      const { todayProfit = 0 } = financeOverview;
      return rewardRules.some(
        (rule) => todayProfit >= Number(rule.maxStepValue),
      );
    }
    default:
      return false;
  }
};

const isCompleteWeeklyCumulative = (
  taskTarget: number,
  rewardRules: TaskRewardRule[],
  financeOverview: FinanceOverview,
) => {
  switch (taskTarget) {
    case CUMULATIVE_TASKS.DEPOSIT: {
      const { weekDepositMoney = 0 } = financeOverview;
      return rewardRules.some(
        (rule) => weekDepositMoney >= Number(rule.maxStepValue),
      );
    }
    case CUMULATIVE_TASKS.NET_AMOUNT: {
      const { weekValidBetNum = 0 } = financeOverview;
      return rewardRules.some(
        (rule) => weekValidBetNum >= Number(rule.maxStepValue),
      );
    }
    case CUMULATIVE_TASKS.PROFIT: {
      const { weekWinNum = 0 } = financeOverview;
      return rewardRules.some(
        (rule) => weekWinNum >= Number(rule.maxStepValue),
      );
    }
    case CUMULATIVE_TASKS.LOSS: {
      const { weekProfit = 0 } = financeOverview;
      return rewardRules.some(
        (rule) => weekProfit >= Number(rule.maxStepValue),
      );
    }
    default:
      return false;
  }
};

/** Mirrors `isCompleted` in packages/src/utils/task-popup.ts (uses popup task type + API `isCompleted`). */
const isTaskCompletedForPopup = (
  popupTaskType: TaskType,
  task: TaskDialogData["tasks"][number],
  financeOverview: FinanceOverview | null,
): boolean => {
  const taskTarget = task.taskTarget;
  if (
    popupTaskType === TaskType.NEW_MEMBER_BONUS ||
    taskTarget === undefined ||
    !isCumulativeTask(taskTarget) ||
    !financeOverview
  ) {
    return task.isCompleted;
  }
  const rewardRules = Array.isArray(task.rewardRules) ? task.rewardRules : [];
  if (popupTaskType === TaskType.DAILY) {
    return isCompleteDailyCumulative(taskTarget, rewardRules, financeOverview);
  }
  return isCompleteWeeklyCumulative(taskTarget, rewardRules, financeOverview);
};

const getRemainingSeconds = (taskType: TaskType) => {
  const now = new Date();
  const end = new Date(now);

  if (taskType === TaskType.WEEKLY) {
    const day = now.getDay();
    const diffToSunday = day === 0 ? 0 : 7 - day;
    end.setDate(now.getDate() + diffToSunday);
  }
  end.setHours(23, 59, 59, 999);

  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
};

const TaskPopupInner = ({
  taskType,
  timing,
  visible,
  onClose,
  onQueueStateChange,
}: TaskPopupInnerProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { language } = useCommon();
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const isLoggedIn = useSelector(
    (state: RootState) => !!state?.user?.userInfo?.isLogin,
  );
  const financeOverview = useSelector((state: RootState) => {
    const raw =
      state?.user?.financeOverview ??
      state?.user?.userInfo?.financeOverView ??
      state?.user?.userInfo?.financeOverview;
    return (raw ?? null) as FinanceOverview | null;
  });
  const isBeforeLogin = timing === DialogShowTiming.BEFORE_LOGIN;
  const beforeLoginTheme = beforeLoginThemeMap[theme] ?? "ngGreen";
  const beforeLoginTopImage =
    beforeLoginTopImageMap[taskType]?.[beforeLoginTheme] ??
    beforeLoginTopImageMap[TaskType.NEW_MEMBER_BONUS][beforeLoginTheme];
  const beforeLoginMainImage = beforeLoginMainImageMap[beforeLoginTheme];
  const afterLoginTopImage =
    afterLoginTopImageMap[taskType] ??
    afterLoginTopImageMap[TaskType.NEW_MEMBER_BONUS];
  const afterLoginUnderlineImage =
    afterLoginUnderlineImageMap[beforeLoginTheme];

  const [todayNotShowAnymore, setTodayNotShowAnymore] = useState(false);
  const [dialogData, setDialogData] = useState<TaskDialogData | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const enabled =
    pathname === "/home" && (isBeforeLogin ? !isLoggedIn : isLoggedIn);

  const contentWidth = useMemo(() => Math.min(400, width * 0.9), [width]);

  const checkEligibility = useCallback(async () => {
    if (!enabled) {
      setDialogData(null);
      return false;
    }

    const data = await fetchTaskDialogData(taskType);
    if (!data || data.dialogShowTiming !== timing) {
      setDialogData(null);
      return false;
    }

    if (
      data.dialogShowType === DialogShowType.HIGH_FREQUENCY &&
      (await isTaskPopupDismissedToday(taskType, timing))
    ) {
      setDialogData(null);
      return false;
    }

    const shouldShow = await shouldShowTaskPopup(
      taskType,
      data.dialogShowType,
      timing,
    );
    if (!shouldShow) {
      setDialogData(null);
      return false;
    }

    // Align with Vue PopupManagement: preload overview for after-login daily/weekly task popup.
    if (
      timing === DialogShowTiming.AFTER_LOGIN &&
      (taskType === TaskType.DAILY || taskType === TaskType.WEEKLY)
    ) {
      await dispatch(fetchFinanceOverview(true));
    }

    if (taskType === TaskType.NEW_MEMBER_BONUS && data) {
      data.title = t('mission.NEW_MEMBER_BONUS-task')
    }
    setDialogData(data);
    return true;
  }, [dispatch, t, enabled, taskType, timing]);

  const { canShow } = usePopupEligibility(
    checkEligibility,
    [checkEligibility],
    {
      enabled,
      onResult: onQueueStateChange,
    },
  );

  useEffect(() => {
    if (enabled && visible) {
      checkEligibility();
    }
  }, [language, checkEligibility, enabled, visible])

  const shouldShowCountdown = taskType !== TaskType.NEW_MEMBER_BONUS;
  const isNewbieBonus = taskType === TaskType.NEW_MEMBER_BONUS;
  useEffect(() => {
    if (!visible || !canShow || !shouldShowCountdown) return;

    setRemainingSeconds(getRemainingSeconds(taskType));
    const timer = setInterval(() => {
      setRemainingSeconds(getRemainingSeconds(taskType));
    }, 1000);

    return () => clearInterval(timer);
  }, [canShow, shouldShowCountdown, taskType, visible]);

  const countdown = useMemo(() => {
    const days = Math.floor(remainingSeconds / 86400);
    const hours = Math.floor((remainingSeconds % 86400) / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    return { days, hours, minutes, seconds };
  }, [remainingSeconds]);
  const finishedCount = useMemo(() => {
    if (!dialogData) return 0;
    if (taskType === TaskType.NEW_MEMBER_BONUS) return dialogData.finishedCount;
    return dialogData.tasks.filter((task) =>
      isTaskCompletedForPopup(taskType, task, financeOverview),
    ).length;
  }, [dialogData, financeOverview, taskType]);

  const handleClose = useCallback(async () => {
    if (dialogData) {
      await dismissTaskPopup(
        taskType,
        dialogData.dialogShowType,
        todayNotShowAnymore,
        timing,
      );
    }
    setTodayNotShowAnymore(false);
    onClose?.();
  }, [dialogData, onClose, taskType, timing, todayNotShowAnymore]);

  const goLogin = useCallback(async () => {
    await handleClose();
    const tab = taskTypeToMissionCenterTab[taskType];
    const path = `/active/missionCenter?tab=${encodeURIComponent(tab)}`;
    router.push(`/login?redirect=${encodeURIComponent(path)}`);
  }, [handleClose, taskType]);

  const goRegister = useCallback(async () => {
    await handleClose();
    const tab = taskTypeToMissionCenterTab[taskType];
    const path = `/active/missionCenter?tab=${encodeURIComponent(tab)}`;
    router.push(`/register?redirect=${encodeURIComponent(path)}`);
  }, [handleClose, taskType]);

  const goMissionCenter = useCallback(async () => {
    await handleClose();
    const tab = taskTypeToMissionCenterTab[taskType];
    router.push(`/active/missionCenter?tab=${encodeURIComponent(tab)}`);
  }, [handleClose, taskType]);

  const isVisible = !!visible && canShow && !!dialogData;
  if (userInfo?.isTestUser || !isVisible || !dialogData) return null;

  return (
    <PopupModal
      id={`task-popup-${timing}-${taskType}`}
      isVisible={isVisible}
      onClose={handleClose}
      style={styles.modal}
    >
      <View style={[styles.container, { width: contentWidth }]}>
        <View
          style={[
            styles.card,
            isBeforeLogin ? styles.beforeLoginCard : styles.afterLoginCard,
          ]}
        >
          {isBeforeLogin ? (
            <>
              <ImageBackground
                source={beforeLoginTopImage}
                style={[
                  styles.beforeLoginTopImage,
                  {
                    width: contentWidth,
                    height: Math.round((contentWidth * 272) / 506),
                    paddingTop: Math.round((contentWidth * 0.4 * 272) / 506),
                  },
                ]}
                resizeMode="stretch"
              >
                <Text
                  style={[
                    styles.beforeLoginTopTitle,
                    { color: Colors[theme].gradientStart, fontSize: rf(18) },
                  ]}
                >
                  {dialogData.title}
                </Text>
              </ImageBackground>

              <View
                style={[
                  styles.beforeLoginCardWrap,
                  { width: Math.round(contentWidth * 0.96) },
                ]}
              >
                <Image
                  source={beforeLoginDividerImage}
                  style={styles.beforeLoginDivider}
                />
                <ImageBackground
                  source={beforeLoginMainImage}
                  style={[
                    styles.beforeLoginCardContent,
                    { width: Math.round(contentWidth * 0.96) },
                  ]}
                  imageStyle={styles.beforeLoginMainBg}
                >
                  <View style={styles.beforeLoginTopPart}>
                    {taskType === TaskType.NEW_MEMBER_BONUS ? (
                      <>
                        <Text
                          style={[
                            styles.rewardHint,
                            styles.beforeLoginRewardHint,
                            { fontSize: rf(13), color: Colors[theme].btnText },
                          ]}
                        >
                          {t("mission.rewardExpiringSoon")}
                        </Text>
                        <Text
                          style={[
                            styles.rewardHint,
                            styles.beforeLoginRewardHint,
                            { fontSize: rf(13) },
                          ]}
                        >
                          {t("mission.loginToClaimReward")}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text
                          style={[
                            styles.beforeLoginCountdownLabel,
                            { color: Colors[theme].btnText, fontSize: rf(13) },
                          ]}
                        >
                          {t("mission.remainingTime", {
                            defaultValue: "Remaining Time",
                          })}
                        </Text>
                        <View style={styles.beforeLoginCountdown}>
                          {taskType === TaskType.WEEKLY && (
                            <>
                              <Text
                                style={[
                                  styles.beforeLoginCountdownDays,
                                  {
                                    color: Colors[theme].background,
                                    fontSize: rf(18),
                                  },
                                ]}
                              >
                                {countdown.days}
                              </Text>
                              <Text
                                style={[
                                  styles.beforeLoginCountdownDayLabel,
                                  {
                                    color: Colors[theme].background,
                                    fontSize: rf(10),
                                  },
                                ]}
                              >
                                {t("common.day")}
                              </Text>
                            </>
                          )}
                          <View
                            style={[
                              styles.countdownBox,
                              { backgroundColor: Colors[theme].background },
                            ]}
                          >
                            <Text
                              style={[
                                styles.countdownDigit,
                                {
                                  color: Colors[theme].primary,
                                  fontSize: rf(10),
                                },
                              ]}
                            >
                              {pad2(countdown.hours)}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.beforeLoginCountdownSep,
                              {
                                color: Colors[theme].background,
                                fontSize: rf(10),
                              },
                            ]}
                          >
                            :
                          </Text>
                          <View
                            style={[
                              styles.countdownBox,
                              { backgroundColor: Colors[theme].background },
                            ]}
                          >
                            <Text
                              style={[
                                styles.countdownDigit,
                                {
                                  color: Colors[theme].primary,
                                  fontSize: rf(10),
                                },
                              ]}
                            >
                              {pad2(countdown.minutes)}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.beforeLoginCountdownSep,
                              {
                                color: Colors[theme].background,
                                fontSize: rf(10),
                              },
                            ]}
                          >
                            :
                          </Text>
                          <View
                            style={[
                              styles.countdownBox,
                              { backgroundColor: Colors[theme].background },
                            ]}
                          >
                            <Text
                              style={[
                                styles.countdownDigit,
                                {
                                  color: Colors[theme].primary,
                                  fontSize: rf(10),
                                },
                              ]}
                            >
                              {pad2(countdown.seconds)}
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>

                  <View style={styles.beforeLoginMainWrap}>
                    <OutlinedText
                      style={[
                        styles.beforeLoginPendingLabel,
                        { fontSize: rf(12), fontWeight: "bold" },
                      ]}
                      outlineColor="#a24a00"
                      outlineWidth={2}
                    >
                      {t("mission.pendingReward")}
                    </OutlinedText>
                    <OutlinedText
                      style={[
                        styles.beforeLoginPendingAmount,
                        { fontSize: rf(24) },
                      ]}
                      outlineColor="#a24a00"
                      outlineWidth={2}
                    >
                      {dialogData.maxReward}
                    </OutlinedText>
                    {taskType !== TaskType.NEW_MEMBER_BONUS && (
                      <>
                        <Text
                          style={[
                            styles.rewardHint,
                            styles.beforeLoginRewardHint,
                            { fontSize: rf(11) },
                          ]}
                        >
                          {t("mission.rewardExpiringSoon")}
                        </Text>
                        <Text
                          style={[
                            styles.rewardHint,
                            styles.beforeLoginRewardHint,
                            { fontSize: rf(11) },
                          ]}
                        >
                          {t("mission.loginToClaimReward")}
                        </Text>
                      </>
                    )}
                  </View>
                </ImageBackground>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={[
                    styles.actionBtn,
                    { backgroundColor: Colors[theme].gradientStart },
                  ]}
                  onPress={goLogin}
                >
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: Colors[theme].btnText },
                    ]}
                  >
                    {t("common.login", { defaultValue: t("pageName.login") })}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.actionBtn,
                    { backgroundColor: Colors[theme].btnText },
                  ]}
                  onPress={goRegister}
                >
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: Colors[theme].darkColor },
                    ]}
                  >
                    {t("common.register", {
                      defaultValue: t("pageName.register"),
                    })}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View
                style={[
                  styles.afterLoginHeaderWrap,
                  isNewbieBonus && styles.afterLoginHeaderNewbie,
                ]}
              >
                <LinearGradient
                  colors={[
                    Colors[theme].tgBindGradientEnd,
                    Colors[theme].tgBindGradientStart,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[
                    styles.afterLoginHeader,
                    isNewbieBonus && styles.afterLoginHeaderNewbie,
                  ]}
                >
                  <Image
                    source={afterLoginHeaderBgImage}
                    style={[
                      styles.afterLoginHeaderBg,
                      {
                        height: isNewbieBonus
                          ? styles.afterLoginHeaderNewbie.height
                          : styles.afterLoginHeader.height,
                        width: Math.round(contentWidth * 0.92),
                      },
                    ]}
                  />
                  <ImageBackground
                    source={afterLoginUnderlineImage}
                    style={styles.afterLoginHeaderImageBackground}
                    imageStyle={[
                      styles.afterLoginHeaderImageBackgroundImage,
                      {
                        width: Math.round(contentWidth / 3),
                        height: Math.round(contentWidth / 20),
                      },
                      isNewbieBonus &&
                      styles.afterLoginHeaderImageBackgroundHidden,
                    ]}
                  >
                    <Text
                      style={[
                        styles.afterLoginTitle,
                        isNewbieBonus && styles.afterLoginTitleNewbie,
                        { color: Colors[theme].btnText, fontSize: rf(18) },
                      ]}
                    >
                      {dialogData.title}
                    </Text>
                  </ImageBackground>
                </LinearGradient>
                <Image
                  source={afterLoginTopImage}
                  style={styles.afterLoginTopImage}
                />
              </View>
              <View
                style={[
                  styles.afterLoginBody,
                  isNewbieBonus && styles.afterLoginBodyNewbie,
                  { backgroundColor: Colors[theme].activeColor },
                ]}
              >
                <LinearGradient
                  colors={["#FFD900", "#F48D16"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[
                    styles.afterLoginRewardBadge,
                    isNewbieBonus && styles.afterLoginRewardBadgeNewbie,
                  ]}
                >
                  <Text style={styles.afterLoginRewardLabel}>
                    {isNewbieBonus
                      ? t("mission.highestReward", {
                        defaultValue: "Highest Reward",
                      })
                      : t("mission.rewardAmount", {
                        defaultValue: t("mission.pendingReward"),
                      })}
                  </Text>
                  <Text style={styles.afterLoginRewardAmount}>
                    {dialogData.maxReward}
                  </Text>
                  <Svg
                    width={6}
                    height={6}
                    viewBox="0 0 6 6"
                    style={styles.afterLoginRewardBadgeCorner}
                  >
                    <Path d="M0 0 L6 0 L6 6 Z" fill="#CD7613" />
                  </Svg>
                </LinearGradient>
                {shouldShowCountdown && (
                  <View style={styles.afterLoginCountdown}>
                    {taskType === TaskType.WEEKLY && (
                      <>
                        <Text
                          style={[
                            styles.afterLoginCountdownDays,
                            { color: Colors[theme].themeColor1 },
                          ]}
                        >
                          {countdown.days}
                        </Text>
                        <Text
                          style={[
                            styles.afterLoginCountdownDayLabel,
                            { color: Colors[theme].darkColor },
                          ]}
                        >
                          {t("common.day")}
                        </Text>
                      </>
                    )}
                    <View
                      style={[
                        styles.countdownBox,
                        { backgroundColor: Colors[theme].background },
                      ]}
                    >
                      <Text
                        style={[
                          styles.countdownDigit,
                          { color: Colors[theme].primary, fontSize: rf(10) },
                        ]}
                      >
                        {pad2(countdown.hours)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.afterLoginCountdownSep,
                        { color: Colors[theme].themeColor1 },
                      ]}
                    >
                      :
                    </Text>
                    <View
                      style={[
                        styles.countdownBox,
                        { backgroundColor: Colors[theme].background },
                      ]}
                    >
                      <Text
                        style={[
                          styles.countdownDigit,
                          { color: Colors[theme].primary, fontSize: rf(10) },
                        ]}
                      >
                        {pad2(countdown.minutes)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.afterLoginCountdownSep,
                        { color: Colors[theme].themeColor1 },
                      ]}
                    >
                      :
                    </Text>
                    <View
                      style={[
                        styles.countdownBox,
                        { backgroundColor: Colors[theme].background },
                      ]}
                    >
                      <Text
                        style={[
                          styles.countdownDigit,
                          { color: Colors[theme].primary, fontSize: rf(12) },
                        ]}
                      >
                        {pad2(countdown.seconds)}
                      </Text>
                    </View>
                  </View>
                )}

                <ScrollView
                  style={[
                    styles.afterLoginTaskList,
                    isNewbieBonus && styles.afterLoginTaskListNewbie,
                  ]}
                  showsVerticalScrollIndicator={false}
                >
                  {dialogData.tasks.map((task) => {
                    const completed = isTaskCompletedForPopup(
                      taskType,
                      task,
                      financeOverview,
                    );
                    return (
                      <View
                        style={[
                          styles.afterLoginTaskItem,
                          { backgroundColor: Colors[theme].taskItemBg },
                          isNewbieBonus && styles.afterLoginTaskItemNewbie,
                          completed && styles.afterLoginTaskItemCompleted,
                        ]}
                        key={task.id}
                      >
                        {completed ? (
                          <Text style={styles.afterLoginTaskCheck}>✓</Text>
                        ) : (
                          <View style={styles.afterLoginTaskDot} />
                        )}
                        <Text
                          style={[
                            styles.afterLoginTaskText,
                            isNewbieBonus && styles.afterLoginTaskTextNewbie,
                            {
                              color: completed
                                ? "#8A8A8A"
                                : Colors[theme].taskItemColor,
                              fontWeight: completed ? "400" : "500",
                            },
                          ]}
                        >
                          {task.name}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
                <Pressable
                  style={[
                    styles.afterLoginAllTasksBtn,
                    isNewbieBonus && styles.afterLoginAllTasksBtnNewbie,
                    {
                      backgroundColor: Colors[theme].gradientStart,
                    },
                  ]}
                  onPress={goMissionCenter}
                >
                  <LinearGradient
                    colors={[
                      "rgba(255, 217, 0, 0.8)",
                      "rgba(244, 141, 22, 0.8)",
                    ]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.afterLoginProgressBadge}
                  >
                    <Text style={styles.afterLoginProgressText}>
                      {t("status.completed")}{" "}
                      <Text
                        style={{
                          color: Colors[theme].similarTextColor,
                          writingDirection: "ltr",
                        }}
                      >
                        {finishedCount}
                      </Text>
                      /{dialogData.totalCount}
                    </Text>
                  </LinearGradient>
                  <Text
                    style={[
                      styles.actionBtnText,
                      isNewbieBonus && styles.afterLoginAllTasksBtnTextNewbie,
                      {
                        color: Colors[theme].btnText,
                      },
                    ]}
                  >
                    {t("mission.allTask", {
                      defaultValue: "All Tasks",
                    })}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        {dialogData.dialogShowType === DialogShowType.HIGH_FREQUENCY && (
          <View className="mt-2" style={{ width: contentWidth }}>
            <CheckIcon
              isChecked={todayNotShowAnymore}
              onToggleChecked={() => setTodayNotShowAnymore((prev) => !prev)}
              i18nKey="popup.dontPopToday"
              textStyle={{ color: "#fff", writingDirection: "ltr" }}
            />
          </View>
        )}
        <CloseButton onClose={handleClose} />
      </View>
    </PopupModal>
  );
};

export const BeforeLoginTaskPopup = memo((props: TaskPopupProps) => (
  <TaskPopupInner {...props} timing={DialogShowTiming.BEFORE_LOGIN} />
));

export const AfterLoginTaskPopup = memo((props: TaskPopupProps) => (
  <TaskPopupInner {...props} timing={DialogShowTiming.AFTER_LOGIN} />
));

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  container: {
    maxWidth: 400,
    alignSelf: "center",
    overflow: "visible",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: "visible",
  },
  beforeLoginCard: {
    backgroundColor: "transparent",
    padding: 0,
  },
  afterLoginCard: {
    backgroundColor: "transparent",
    padding: 0,
    overflow: "visible",
  },
  beforeLoginTopWrap: {
    position: "relative",
    alignItems: "center",
  },
  beforeLoginTopImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  beforeLoginTopTitle: {
    fontWeight: "700",
    textAlign: "center",
    writingDirection: "ltr",
  },
  beforeLoginCardWrap: {
    alignSelf: "center",
    marginTop: -20,
  },
  beforeLoginCardWrapNewbie: {
    marginTop: -20,
  },
  beforeLoginDivider: {
    width: "100%",
    height: 12,
    resizeMode: "stretch",
    borderRadius: 6,
  },
  beforeLoginCardContent: {
    height: 235,
    marginTop: -6,
  },
  beforeLoginCardContentNewbie: {
    height: 268,
  },
  beforeLoginMainBg: {
    resizeMode: "stretch",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  beforeLoginTopPart: {
    height: 66,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  beforeLoginTopPartNewbie: {
    height: 78,
    paddingHorizontal: 14,
    paddingTop: 2,
  },
  beforeLoginMainWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  beforeLoginMainWrapNewbie: {
    paddingHorizontal: 12,
    justifyContent: "flex-start",
    paddingTop: 30,
  },
  beforeLoginPendingLabel: {
    color: "#FFE38B",
    fontWeight: "800",
    fontStyle: "italic",
    textAlign: "center",
    writingDirection: "ltr",
  },
  beforeLoginPendingAmount: {
    color: "#FFD54D",
    fontWeight: "900",
    fontStyle: "italic",
    textAlign: "center",
    writingDirection: "ltr",
    marginTop: 6,
    marginBottom: 8,
  },
  beforeLoginPendingLabelNewbie: {
    color: "#FFA92F",
    textShadowColor: "#8F4A08",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    writingDirection: "ltr",
  },
  beforeLoginRewardHint: {
    lineHeight: 18,
    writingDirection: "ltr",
  },
  beforeLoginCountdownLabel: {
    marginBottom: 4,
    writingDirection: "ltr",
  },
  beforeLoginCountdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  beforeLoginCountdownDays: {
    fontWeight: "700",
    writingDirection: "ltr",
  },
  beforeLoginCountdownDayLabel: {
    marginHorizontal: 4,
    writingDirection: "ltr",
  },
  countdownBox: {
    width: 25,
    height: 25,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  countdownDigit: {
    fontWeight: "700",
    writingDirection: "ltr",
  },
  beforeLoginCountdownSep: {
    marginHorizontal: 2,
    fontWeight: "800",
    writingDirection: "ltr",
  },
  afterLoginHeaderWrap: {
    position: "relative",
    overflow: "visible",
  },
  afterLoginHeader: {
    height: 62,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: "relative",
    overflow: "visible",
  },
  afterLoginHeaderNewbie: {
    height: 78,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  afterLoginHeaderBg: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  afterLoginHeaderImageBackground: {
    flex: 1,
    position: "relative",
    overflow: "visible",
  },
  afterLoginHeaderImageBackgroundImage: {
    position: "absolute",
    left: 16,
    top: 32,
  },
  afterLoginHeaderImageBackgroundHidden: {
    opacity: 0,
  },
  afterLoginTitle: {
    position: "absolute",
    top: "50%",
    left: 12,
    transform: [{ translateY: -11 }],
    lineHeight: rf(24),
    overflow: "visible",
    writingDirection: "ltr",
  },
  afterLoginTitleNewbie: {
    left: 12,
    top: "50%",
    lineHeight: rf(28),
    fontWeight: "700",
    transform: [{ translateY: -14 }],
    writingDirection: "ltr",
  },
  afterLoginTopImage: {
    position: "absolute",
    right: 0,
    bottom: 0,
    height: 88,
    width: 300,
    zIndex: 2,
  },
  afterLoginBody: {
    marginTop: -6,
    borderRadius: 8,
    padding: 15,
    minHeight: 240,
  },
  afterLoginBodyNewbie: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingTop: 64,
    paddingBottom: 18,
  },
  afterLoginRewardBadge: {
    position: "absolute",
    top: 15,
    left: -6,
    height: 30,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 0,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    overflow: "visible",
    zIndex: 1,
  },
  afterLoginRewardBadgeNewbie: {
    top: 18,
    height: 38,
    paddingHorizontal: 14,
    borderTopRightRadius: 19,
    borderBottomRightRadius: 19,
  },
  afterLoginRewardBadgeCorner: {
    position: "absolute",
    left: 0,
    bottom: -6,
    width: 6,
    height: 6,
  },
  afterLoginRewardLabel: {
    fontSize: rf(11),
    fontWeight: "700",
    color: "#fff",
    marginRight: 4,
    writingDirection: "ltr",
  },
  afterLoginRewardAmount: {
    fontSize: rf(16),
    fontWeight: "900",
    color: "#FFE44D",
    textShadowColor: "#C47A00",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    writingDirection: "ltr",
  },
  afterLoginCountdown: {
    height: 30,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 3,
  },
  afterLoginCountdownDays: {
    fontSize: rf(10),
    fontWeight: "700",
    writingDirection: "ltr",
  },
  afterLoginCountdownDayLabel: {
    fontSize: rf(10),
    writingDirection: "ltr",
  },
  afterLoginCountdownSep: {
    fontSize: rf(10),
    fontWeight: "800",
    writingDirection: "ltr",
  },
  afterLoginTaskList: {
    minHeight: 120,
    maxHeight: 220,
    marginBottom: 26,
  },
  afterLoginTaskListNewbie: {
    minHeight: 220,
    maxHeight: 310,
    marginBottom: 16,
  },
  afterLoginTaskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255, 195, 50, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 195, 50, 0.35)",
  },
  afterLoginTaskItemNewbie: {
    borderColor: "rgba(255, 190, 62, 0.65)",
  },
  afterLoginTaskItemCompleted: {
    backgroundColor: "rgba(80, 200, 120, 0.08)",
    borderColor: "rgba(80, 200, 120, 0.2)",
  },
  afterLoginTaskDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: "#FFC83C",
    marginTop: 1,
  },
  afterLoginTaskCheck: {
    width: 13,
    fontSize: rf(11),
    color: "#50C878",
    lineHeight: 13,
    fontWeight: "700",
    writingDirection: "ltr",
  },
  afterLoginTaskText: {
    flex: 1,
    fontSize: rf(11),
    fontWeight: "500",
    lineHeight: 17,
    writingDirection: "ltr",
  },
  afterLoginTaskTextNewbie: {
    fontSize: rf(11),
    lineHeight: 19,
    fontWeight: "500",
    writingDirection: "ltr",
  },
  afterLoginAllTasksBtn: {
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  afterLoginAllTasksBtnNewbie: {
    height: 40,
    borderRadius: 20,
  },
  afterLoginAllTasksBtnTextNewbie: {
    fontSize: rf(14),
    lineHeight: 16,
    fontWeight: "700",
    writingDirection: "ltr",
  },
  afterLoginProgressBadge: {
    position: "absolute",
    left: 0,
    top: -10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 0,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  afterLoginProgressText: {
    fontSize: rf(10),
    fontWeight: "600",
    color: "#fff",
    writingDirection: "ltr",
  },
  title: {
    fontSize: rf(14),
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    writingDirection: "ltr",
  },
  rewardHint: {
    fontSize: rf(12),
    textAlign: "center",
    marginBottom: 6,
    writingDirection: "ltr",
  },
  rewardAmount: {
    fontSize: rf(24),
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    writingDirection: "ltr",
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  beforeLoginActionRowNewbie: {
    marginTop: 14,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 24,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  beforeLoginActionBtnNewbie: {
    borderRadius: 24,
    paddingVertical: 12,
  },
  actionBtnText: {
    fontSize: rf(12),
    fontWeight: "700",
    writingDirection: "ltr",
  },
  taskList: {
    maxHeight: 180,
    marginTop: 10,
    marginBottom: 10,
  },
  taskItem: {
    paddingVertical: 6,
  },
  taskText: {
    fontSize: rf(11),
    writingDirection: "ltr",
  },
});
