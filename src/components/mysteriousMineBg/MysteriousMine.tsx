import { getActDetail, joinAct } from "@/api";
import { MineClaimPopup } from "@/components/mysteriousMineBg/MineClaimPopup";
import {
  MineMainPopup,
  type MineTimeStatus,
} from "@/components/mysteriousMineBg/MineMainPopup";
import { OPEN_MYSTERIOUS_MINE_EVENT } from "./events";
import { useToast } from "@/components/common/toast";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { RootState } from "@/store/store";
import {
  buildMiningTimeList,
  formatCountdown,
  getClaimState,
  getCurrentAward,
  getMineTimeStatus,
  getScheduleCountdownState,
  type MineTimeStatus as BaseMineTimeStatus,
  type MiningSchedule,
} from "@/utils/activityScheduleCountdown";
import { usePathname, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  DeviceEventEmitter,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { useDynamicMaxWidth } from "@/hooks/useMaxWidth";
import { rf } from "@/utils/scaleFont";

const CLAIM_BG_RATIO = 744 / 755;
const FLOAT_SIZE = 95;
const FLOAT_EDGE_GAP = 0;
const isIOSApp = Platform.OS === "ios";
const POPUP_SWITCH_DELAY_MS = 300;
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DEFAULT_POSITION = { x: 0, y: SCREEN_HEIGHT - 295 };

type MineOptional = {
  appLogoURL?: string;
  mineStatus?: number | string;
  mineBtnStatus?: number | string;
  canClaim?: boolean;
  exchangeRatio?: string | number;
};

type MineData = {
  id?: string | number;
  activityType?: number;
  status?: number | string;
  optional?: MineOptional | string | null;
  mysteryMineSchedules?: MiningSchedule[];
  introduction?: string;
  ruleDesc?: string;
};

interface MysteriousMineProps {
  canMove?: boolean;
}

const getOptional = (optional: MineData["optional"]): MineOptional => {
  if (!optional) return {};
  if (typeof optional === "string") {
    try {
      return JSON.parse(optional);
    } catch {
      return {};
    }
  }
  return optional;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

/** 根布局单例挂载后，用路径 + 弹窗可见性驱动倒计时，替代原先随首页焦点的 useFocusEffect */
function routeLooksLikeHome(pathname: string | undefined): boolean {
  if (!pathname) return false;
  const base = pathname.split("?")[0];
  return (
    base === "/home" || base.endsWith("/home") || base.includes("(tabs)/home")
  );
}

export const MysteriousMine: React.FC<MysteriousMineProps> = ({
  canMove = true,
}) => {
  const { height } = useWindowDimensions();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isOnHome = useMemo(() => routeLooksLikeHome(pathname), [pathname]);
  const userInfo: any = useSelector(
    (state: RootState) => state?.user?.userInfo,
  );
  const activityList = useSelector(
    (state: RootState) => state?.active?.activityList,
  );
  const [mineData, setMineData] = useState<MineData | null>(null);
  const [mineDetail, setMineDetail] = useState<MineData | null>(null);
  const [showMainPopup, setShowMainPopup] = useState(false);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [claimAmount, setClaimAmount] = useState<string>("0");
  const [nowTs, setNowTs] = useState(Date.now());
  const toast = useToast();

  const { maxWidth } = useDynamicMaxWidth();
  const defaultPosition = useMemo(
    () => ({ x: maxWidth - FLOAT_SIZE, y: DEFAULT_POSITION.y }),
    [maxWidth],
  );
  const bounds = useMemo(() => {
    const minX = FLOAT_EDGE_GAP;
    const maxX = maxWidth - FLOAT_SIZE;
    return {
      minX,
      maxX: Math.max(minX, maxX),
      minY: FLOAT_EDGE_GAP,
      maxY: Math.max(FLOAT_EDGE_GAP, height - FLOAT_SIZE - 90),
    };
  }, [maxWidth, height]);
  const [floatPosition, setFloatPosition] = useState(defaultPosition);
  const floatPositionRef = useRef(floatPosition);
  const dragStartRef = useRef(floatPosition);
  const hasInitPositionRef = useRef(false);
  const isDraggingRef = useRef(false);
  const canMoveRef = useRef(canMove);
  const boundsRef = useRef(bounds);
  const popupSwitchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const mainPopupWidth = useMemo(() => maxWidth - 40, [maxWidth]);
  const claimPopupWidth = useMemo(
    () => Math.min(Math.max(maxWidth - 56, 260), 360),
    [maxWidth],
  );
  const claimPopupHeight = useMemo(
    () => claimPopupWidth * CLAIM_BG_RATIO,
    [claimPopupWidth],
  );

  const mineDetailOptional = useMemo(
    () => getOptional(mineDetail?.optional),
    [mineDetail],
  );

  const mineSchedules = useMemo<MiningSchedule[]>(() => {
    const schedules = mineDetail?.mysteryMineSchedules;
    return Array.isArray(schedules) ? schedules : [];
  }, [mineDetail]);
  const mineTimeList = useMemo(
    () => buildMiningTimeList(mineSchedules, nowTs),
    [mineSchedules, nowTs],
  );
  const claimState = useMemo(() => getClaimState(mineTimeList), [mineTimeList]);
  const scheduleCountdown = useMemo(
    () =>
      getScheduleCountdownState(
        mineSchedules.map((item) => ({
          dispatchHour: Number(item.dispatchHour),
          durationMinutes: Number(item.durationMinutes),
        })),
        new Date(nowTs),
      ),
    [mineSchedules, nowTs],
  );
  const mineCountdown = useMemo(() => {
    if (claimState !== 3) return "";
    if (!scheduleCountdown || scheduleCountdown.mode !== "before_next")
      return "";
    return formatCountdown(scheduleCountdown.remainingMs);
  }, [claimState, scheduleCountdown]);
  const openTimes = String(mineSchedules.length || 0);
  const maxDecline = String(getCurrentAward(mineTimeList) || 0);
  const crystalAmount = useMemo(() => {
    const total = mineSchedules.reduce((sum, item) => {
      return sum + Number(item?.awardLimitDisplay || 0);
    }, 0);
    return String(total);
  }, [mineSchedules]);
  const exchangeRatio = useMemo(() => {
    const value = mineDetailOptional?.exchangeRatio;
    if (value === undefined || value === null || value === "") {
      return "1:1";
    }
    return String(value);
  }, [mineDetailOptional]);

  const mineTimeItems = useMemo(() => {
    const items: { label: string; status: BaseMineTimeStatus | "empty" }[] =
      mineTimeList.map((item) => ({
        label: `${item.startTime}-${item.endTime}`,
        status: getMineTimeStatus(item) as BaseMineTimeStatus,
      }));
    while (items.length % 3 !== 0) {
      items.push({ label: "", status: "empty" });
    }
    return items.map((item) => ({
      ...item,
      status: item.status as MineTimeStatus,
    }));
  }, [mineTimeList]);

  const mineTimeRows = useMemo(() => {
    const rows: { label: string; status: MineTimeStatus }[][] = [];
    for (let i = 0; i < mineTimeItems.length; i += 3) {
      rows.push(mineTimeItems.slice(i, i + 3));
    }
    return rows;
  }, [mineTimeItems]);

  const introductionHtml = useMemo(() => {
    const raw = String(mineDetail?.introduction ?? "").trim();
    return raw.replace(/\n/g, "<br>");
  }, [mineDetail?.introduction]);

  const ruleDescHtml = useMemo(() => {
    const raw = String(mineDetail?.ruleDesc ?? "").trim();
    return raw.replace(/\n/g, "<br>");
  }, [mineDetail?.ruleDesc]);

  const mineAmountLine = useMemo(
    () =>
      t("active.mysteriousMine.mineAmount", {
        amount: crystalAmount,
        defaultValue: "The mine contains {{amount}} crystals.",
      }),
    [t, crystalAmount],
  );

  const mineAvailable = claimState === 1;
  const mineBtnText = useMemo(() => {
    if (claimState === 1) return t("active.mysteriousMine.mineBtnMining");
    if (claimState === 2) {
      return t("active.mysteriousMine.mineBtnMined", { defaultValue: "Mined" });
    }
    return mineCountdown
      ? t("active.mysteriousMine.notStartedYet", {
          countdown: mineCountdown,
          defaultValue: "{{countdown}} starting soon",
        })
      : "";
  }, [claimState, mineCountdown, t]);

  const claimTextSegments = useMemo(() => {
    const marker = "__AMOUNT__";
    const template = t("active.mysteriousMine.claimSuccessTips", {
      amount: marker,
      defaultValue: "Congratulations on winning __AMOUNT__ in bonus chips",
    });
    const [prefix = "", suffix = ""] = template.split(marker);
    return { prefix, suffix };
  }, [t]);

  const topInfoParts = useMemo(() => {
    const numMarker = "__NUM__";
    const amountMarker = "__AMOUNT__";
    const template = t("active.mysteriousMine.topMineInfoText", {
      num: numMarker,
      amount: amountMarker,
    });
    const tokens = template.split(/(__NUM__|__AMOUNT__)/g);
    return tokens.map((token) => {
      if (token === numMarker) {
        return { text: openTimes, highlight: true };
      }
      if (token === amountMarker) {
        return { text: maxDecline, highlight: true };
      }
      return { text: token, highlight: false };
    });
  }, [t, openTimes, maxDecline]);

  const ruleLines = useMemo(
    () =>
      t("active.mysteriousMine.mysteriousMineRule", {
        crystalAmount,
        exchangeRatio,
      }).split("\n"),
    [t, crystalAmount, exchangeRatio],
  );

  const clearPopupSwitchTimer = useCallback(() => {
    if (popupSwitchTimerRef.current) {
      clearTimeout(popupSwitchTimerRef.current);
      popupSwitchTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    floatPositionRef.current = floatPosition;
  }, [floatPosition]);

  useEffect(() => {
    canMoveRef.current = canMove;
  }, [canMove]);

  useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);

  useEffect(() => {
    return () => {
      clearPopupSwitchTimer();
    };
  }, [clearPopupSwitchTimer]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      OPEN_MYSTERIOUS_MINE_EVENT,
      () => {
        if (!userInfo?.isLogin) {
          router.push("/login");
          return;
        }
        setShowMainPopup(true);
      },
    );
    return () => sub.remove();
  }, [router, userInfo?.isLogin]);

  useEffect(() => {
    const defaultPositionClamped = {
      x: clamp(defaultPosition.x, bounds.minX, bounds.maxX),
      y: clamp(defaultPosition.y, bounds.minY, bounds.maxY),
    };

    if (!hasInitPositionRef.current) {
      hasInitPositionRef.current = true;
      floatPositionRef.current = defaultPositionClamped;
      setFloatPosition(defaultPositionClamped);
      return;
    }

    const nextPosition = {
      x: clamp(floatPositionRef.current.x, bounds.minX, bounds.maxX),
      y: clamp(floatPositionRef.current.y, bounds.minY, bounds.maxY),
    };
    floatPositionRef.current = nextPosition;
    setFloatPosition(nextPosition);
  }, [
    bounds.maxX,
    bounds.maxY,
    bounds.minX,
    bounds.minY,
    defaultPosition.x,
    defaultPosition.y,
  ]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => canMoveRef.current,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        canMoveRef.current &&
        (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2),
      onPanResponderGrant: () => {
        dragStartRef.current = floatPositionRef.current;
        isDraggingRef.current = false;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!canMoveRef.current) return;
        isDraggingRef.current = true;
        const { minX, maxX, minY, maxY } = boundsRef.current;
        const nextPosition = {
          x: clamp(dragStartRef.current.x + gestureState.dx, minX, maxX),
          y: clamp(dragStartRef.current.y + gestureState.dy, minY, maxY),
        };
        floatPositionRef.current = nextPosition;
        setFloatPosition(nextPosition);
      },
      onPanResponderRelease: () => {
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 0);
      },
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
      },
    }),
  ).current;
  void panResponder;

  useEffect(() => {
    if (!mineData) return;
    if (!isOnHome && !showMainPopup && !showClaimPopup) return;
    const timer = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [mineData, isOnHome, showMainPopup, showClaimPopup]);

  useEffect(() => {
    if (!Array.isArray(activityList)) return;
    const mine =
      activityList.find((item: MineData) => item?.activityType === 12) || null;
    setMineData(mine);
    if (!mine?.id) {
      setMineDetail(mine);
      return;
    }

    if (!userInfo?.isLogin) {
      setMineDetail(mine);
      return;
    }

    let mounted = true;
    getActDetail({ id: mine.id })
      .then((detailRes: any) => {
        if (!mounted) return;
        setMineDetail((detailRes?.data?.data as MineData) || mine);
      })
      .catch(() => {
        if (mounted) {
          setMineDetail(mine);
        }
      });

    return () => {
      mounted = false;
    };
  }, [activityList, userInfo?.isLogin]);

  if (!mineData) return null;

  const handleMineClaim = async () => {
    if (!userInfo?.isLogin) {
      router.push("/login");
      return;
    }
    if (!mineAvailable || !mineDetail?.id) return;
    toast.loading(true);
    try {
      const res = await joinAct({
        activityId: String(mineDetail.id),
        treasureId: "",
      });
      if (res?.data?.code === 0) {
        const amount = res?.data?.data ?? 0;
        setClaimAmount(String(amount));
        if (isIOSApp) {
          clearPopupSwitchTimer();
          setShowMainPopup(false);
          popupSwitchTimerRef.current = setTimeout(() => {
            setShowClaimPopup(true);
            popupSwitchTimerRef.current = null;
          }, POPUP_SWITCH_DELAY_MS);
        } else {
          setShowClaimPopup(true);
        }
        const detailRes = await getActDetail({ id: mineDetail.id });
        setMineDetail((detailRes?.data?.data as MineData) || mineDetail);
      } else {
        const errMsg = t(res?.data?.code);
        if (isIOSApp) {
          Alert.alert("", String(errMsg), [
            { text: t("common.confirm", { defaultValue: "Confirm" }) },
          ]);
        } else {
          toast.error(errMsg);
        }
      }
    } catch (error) {
      console.error("handleMineClaim error:", error);
    } finally {
      toast.loading(false);
    }
  };

  return (
    <View style={styles.rootWrap} pointerEvents="box-none">
      <MineMainPopup
        isVisible={showMainPopup}
        onClose={() => setShowMainPopup(false)}
        onMinePress={handleMineClaim}
        mineAvailable={mineAvailable}
        mineBtnText={mineBtnText}
        mainPopupWidth={mainPopupWidth}
        introductionHtml={introductionHtml}
        ruleDescHtml={ruleDescHtml}
        mineAmountLine={mineAmountLine}
        mineTimeRows={mineTimeRows}
        topInfoParts={topInfoParts}
        ruleLines={ruleLines}
      />

      <MineClaimPopup
        isVisible={showClaimPopup}
        onClose={() => {
          setShowClaimPopup(false);
          if (isIOSApp) {
            clearPopupSwitchTimer();
            popupSwitchTimerRef.current = setTimeout(() => {
              setShowMainPopup(true);
              popupSwitchTimerRef.current = null;
            }, POPUP_SWITCH_DELAY_MS);
          }
        }}
        claimPopupWidth={claimPopupWidth}
        claimPopupHeight={claimPopupHeight}
        claimAmount={claimAmount}
        claimPrefixText={claimTextSegments.prefix}
        claimSuffixText={claimTextSegments.suffix}
        confirmText={t("common.confirm", { defaultValue: "Confirm" })}
        themePrimaryColor={Colors[theme].primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootWrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 109,
    elevation: 109,
  },
  floatBtn: {
    position: "absolute",
    zIndex: 110,
    elevation: 110,
  },
  floatBtnTouch: {
    width: FLOAT_SIZE,
    height: FLOAT_SIZE,
    overflow: "hidden",
    position: "relative",
  },
  floatBtnImage: {
    width: "100%",
    height: "100%",
  },
  floatFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#10a1a3",
    alignItems: "center",
    justifyContent: "center",
  },
  floatTitleText: {
    position: "absolute",
    top: 63,
    left: 0,
    right: 0,
    color: "#FFFFFF",
    fontSize: 10,
    textAlign: "center",
  },
  floatCountdownText: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    color: "#FFFFFF",
    fontSize: rf(13),
    textAlign: "center",
    includeFontPadding: false,
  },
});

export default MysteriousMine;
