import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { joinAct } from "@/api";
import { useToast } from "@/components/common/toast";
import MemberDayRedEnvelope, { type Envelope } from "./MemberDayRedEnvelope";
import MemberDayActivityUnavailable, {
  type UnavailableReason,
} from "./MemberDayActivityUnavailable";
import { parseClaimAmount } from "@/components/active/memberDay/memberDayLogic";
import MemberDayTreasureBox from "./MemberDayTreasureBox";
import MemberDayPot from "./MemberDayPot";

export type InteractiveMode = "redEnvelope" | "treasureBox" | "pot";

type Props = {
  mode: InteractiveMode;
  title: string;
  envelopes?: Envelope[];
  activityStatus?: "open" | "notStarted" | "ended" | "claimed";
  activityStartTime?: string;
  activityId?: string;
  ruleId?: number;
  mockToday?: string;
  rewardType?: string;
  depositAmount?: number;
  depositLoseAmount?: number;
  betLoseAmount?: number;
  multRateLabel?: string;
  interactiveKey?: string;
  onClaimed?: (amount?: number) => void;
  onRedEnvelopeOpened?: (id: string) => void;
};

const BULBS = 8;

function Bulb({ bright }: { bright: boolean }) {
  const twinkle = useRef(new Animated.Value(bright ? 1 : 0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, {
          toValue: bright ? 0 : 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(twinkle, {
          toValue: bright ? 1 : 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [bright, twinkle]);

  const opacity = twinkle.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });
  const scale = twinkle.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <Animated.View
      style={[
        styles.bulb,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

function fmtToday(mockToday?: string): string {
  if (mockToday != null && mockToday !== "") return mockToday;
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

export default function MemberDayInteractive({
  mode,
  title,
  envelopes = [],
  activityStatus = "open",
  activityStartTime = "",
  activityId = "",
  ruleId = 0,
  mockToday,
  rewardType = "",
  depositAmount = 0,
  depositLoseAmount = 0,
  betLoseAmount = 0,
  multRateLabel = "",
  interactiveKey,
  onClaimed,
  onRedEnvelopeOpened,
}: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const [treasureTitle, setTreasureTitle] = useState("");
  const [prizeAmount, setPrizeAmount] = useState(0);
  const prizeAmountRef = useRef(0);
  const [locallyUnclaimed, setLocallyUnclaimed] = useState(false);
  const todayStr = useMemo(() => fmtToday(mockToday), [mockToday]);

  useEffect(() => {
    prizeAmountRef.current = prizeAmount;
  }, [prizeAmount]);

  useEffect(() => {
    setTreasureTitle("");
    setPrizeAmount(0);
    prizeAmountRef.current = 0;
    setLocallyUnclaimed(false);
  }, [interactiveKey, mode, activityStartTime]);

  const isSelectedDateToday = useMemo(
    () => !!activityStartTime && activityStartTime === todayStr,
    [activityStartTime, todayStr],
  );

  const isSelectedDateFuture = useMemo(
    () => !!activityStartTime && activityStartTime > todayStr,
    [activityStartTime, todayStr],
  );

  const claimDisabled = useMemo(
    () =>
      (mode === "pot" || mode === "treasureBox" || mode === "redEnvelope") &&
      activityStatus === "claimed",
    [mode, activityStatus],
  );

  const unavailableReason = useMemo((): UnavailableReason => {
    if (activityStatus === "notStarted") return "notStarted";
    if (activityStatus === "ended") {
      return activityStartTime && activityStartTime > todayStr
        ? "notStarted"
        : "ended";
    }
    if (activityStatus === "claimed" && isSelectedDateFuture)
      return "notStarted";
    if (activityStatus === "claimed") return "claimed";
    return "notStarted";
  }, [activityStatus, activityStartTime, todayStr, isSelectedDateFuture]);

  const isUnavailable = useMemo(
    () =>
      claimDisabled ? false : activityStatus !== "open" && !locallyUnclaimed,
    [claimDisabled, activityStatus, locallyUnclaimed],
  );

  const performClaim = useCallback(async (): Promise<number> => {
    if (!activityId || !ruleId) {
      toast.error(t("common.operationFailed"));
      throw new Error("Missing activityId or ruleId");
    }
    const res = await joinAct({
      activityId: String(activityId),
      treasureId: String(ruleId),
    });
    const respData = res?.data;
    const data = respData?.data as unknown;
    if (data === 0) {
      setPrizeAmount(0);
      prizeAmountRef.current = 0;
      toast.warn(t("active.memberDay.noReward"));
      return 0;
    }

    if (!respData || respData.code !== 0) {
      const msg = t(`${respData.code}`);
      toast.error(msg);
      throw new Error(String(msg));
    }

    const amt = parseClaimAmount(data) ?? 0;
    setPrizeAmount(amt);
    prizeAmountRef.current = amt;
    return amt;
  }, [activityId, ruleId, toast, t]);

  const handleAnimationComplete = useCallback(
    (amount?: number) => {
      onClaimed?.(amount ?? prizeAmountRef.current);
    },
    [onClaimed],
  );

  const displayTitle = treasureTitle || title;

  const tryAgainTitle = t("active.memberDay.tryAgainTitle");
  const titleIsLosing = displayTitle === tryAgainTitle;

  const isAnyRedEnvelopeOpened = useMemo(
    () => mode === "redEnvelope" && envelopes.some((e) => e.status === 2),
    [mode, envelopes],
  );

  const subsidyDeposit = useMemo(
    () => (rewardType === "BET_LOSS" ? betLoseAmount : depositLoseAmount),
    [rewardType, betLoseAmount, depositLoseAmount],
  );

  const renderInner = () => {
    if (mode === "redEnvelope") {
      return (
        <MemberDayRedEnvelope
          key={interactiveKey}
          envelopes={envelopes}
          onOpen={claimDisabled ? undefined : performClaim}
          onAnimationComplete={handleAnimationComplete}
          onTitleChange={setTreasureTitle}
          onRedEnvelopeTap={(env) => onRedEnvelopeOpened?.(env.id)}
        />
      );
    }
    if (mode === "pot") {
      return (
        <MemberDayPot
          claimDisabled={claimDisabled}
          showTopBar={isSelectedDateToday}
          mockToday={mockToday}
          depositAmount={depositAmount}
          multRateLabel={multRateLabel}
          prizeAmount={prizeAmount}
          onClaim={performClaim}
          onTitleChange={setTreasureTitle}
          onTreasureOpened={() => setLocallyUnclaimed(true)}
          onComplete={handleAnimationComplete}
        />
      );
    }

    if (mode === "treasureBox")
      return (
        <MemberDayTreasureBox
          claimDisabled={claimDisabled}
          showTopBar={isSelectedDateToday}
          mockToday={mockToday}
          depositAmount={subsidyDeposit}
          multRateLabel={multRateLabel}
          prizeAmount={prizeAmount}
          rewardType={rewardType}
          onClaim={performClaim}
          onTitleChange={setTreasureTitle}
          onTreasureOpened={() => setLocallyUnclaimed(true)}
          onComplete={handleAnimationComplete}
        />
      );

    return null;
  };

  return (
    <View style={styles.outer}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={["rgba(212, 181, 133, 1)", "rgba(200, 165, 120, 1)"]}
        style={styles.frame}
      >
        <View style={styles.lightsTop}>
          {Array.from({ length: BULBS }, (_, i) => (
            <Bulb key={`t${i}`} bright={(i + 1) % 2 === 0} />
          ))}
        </View>
        <View style={styles.lightsBottom}>
          {Array.from({ length: BULBS }, (_, i) => (
            <Bulb key={`b${i}`} bright={(i + 1) % 2 === 0} />
          ))}
        </View>
        <View style={styles.lightsLeft}>
          {Array.from({ length: BULBS }, (_, i) => (
            <Bulb key={`l${i}`} bright={(i + 1) % 2 === 1} />
          ))}
        </View>
        <View style={styles.lightsRight}>
          {Array.from({ length: BULBS }, (_, i) => (
            <Bulb key={`r${i}`} bright={(i + 1) % 2 === 1} />
          ))}
        </View>

        <View style={[styles.inner, isUnavailable && styles.innerUnavailable]}>
          <View style={[styles.content]}>{renderInner()}</View>
          <MemberDayActivityUnavailable
            unavailable={isUnavailable}
            reason={unavailableReason}
            startTime={
              unavailableReason === "notStarted" ? activityStartTime : ""
            }
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { marginHorizontal: 16, marginBottom: 16 },
  frame: {
    padding: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: "relative",
  },
  inner: {
    backgroundColor: "#fffcee",
    borderRadius: 16,
    height: 280,
    overflow: "hidden",
    position: "relative",
  },
  innerUnavailable: {
    opacity: 0.98,
  },
  interactiveTitle: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#9b5a24",
    zIndex: 2,
  },
  interactiveTitleLosing: {
    color: "#666",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  lightsTop: {
    position: "absolute",
    left: 24,
    right: 24,
    top: 0,
    height: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lightsBottom: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 0,
    height: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lightsLeft: {
    position: "absolute",
    left: 0,
    top: 24,
    bottom: 24,
    width: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  lightsRight: {
    position: "absolute",
    right: 0,
    top: 24,
    bottom: 24,
    width: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  bulb: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
});
