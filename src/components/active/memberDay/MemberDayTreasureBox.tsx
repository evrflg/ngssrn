import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ImageBackground,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

export interface ScratchPrize {
  icon: string;
  text: string;
  amount: number;
}

interface MemberDayTreasureBoxProps {
  onClaim?: () => Promise<number | undefined>;
  claimDisabled?: boolean;
  showTopBar?: boolean;
  mockToday?: string;
  depositAmount?: number;
  rewardType?: string;
  multRateLabel?: string;
  prizeAmount?: number;
  onTitleChange?: (title: string) => void;
  onTreasureOpened?: () => void;
  prize?: ScratchPrize | null;
  onComplete: (amount?: number) => void;
}

type Phase = "prizeReady" | "animating" | "result";
type AnimStage = "idle" | "landing" | "waterfall" | "burst";

function msUntilEndOfDay(mockToday?: string): number {
  const now = new Date();
  let end: Date;
  if (mockToday && /^\d{4}-\d{2}-\d{2}$/.test(mockToday)) {
    const [y, m, d] = mockToday.split("-").map(Number);
    end = new Date(y, m - 1, d, 23, 59, 59, 0);
  } else {
    end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      0,
    );
  }
  return Math.max(0, end.getTime() - now.getTime());
}

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(s)}`;
}

export default function MemberDayTreasureBox({
  onClaim,
  claimDisabled = false,
  showTopBar = true,
  mockToday,
  depositAmount = 0,
  rewardType = "",
  multRateLabel = "",
  prizeAmount = 0,
  onTitleChange,
  onTreasureOpened,
  prize,
  onComplete,
}: MemberDayTreasureBoxProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("prizeReady");
  const [animStage, setAnimStage] = useState<AnimStage>("idle");
  const [isClaiming, setIsClaiming] = useState(false);
  const [countdown, setCountdown] = useState(() =>
    formatMs(msUntilEndOfDay(mockToday)),
  );
  const [shownAmount, setShownAmount] = useState(0);
  const [width, setWidth] = useState(0);
  const openedRef = useRef(false);
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const mainFloatAnim = useRef(new Animated.Value(0)).current;
  const sideFloatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatMs(msUntilEndOfDay(mockToday)));
    }, 1000);
    return () => clearInterval(timer);
  }, [mockToday]);

  useEffect(() => {
    setPhase("prizeReady");
    setAnimStage("idle");
    setShownAmount(0);
    openedRef.current = false;
  }, [mockToday, rewardType, depositAmount, prizeAmount]);

  const treasureImg = useMemo(() => {
    if (phase === "animating") {
      return animStage === "landing"
        ? require("@/assets/images/active/memberday/treasure_box_closed.png")
        : require("@/assets/images/active/memberday/open_animation.gif");
    }

    if (phase === "prizeReady") {
      return require("@/assets/images/active/memberday/treasure_box_closed.png");
    }

    return require("@/assets/images/active/memberday/treasure_box_full.png");
  }, [phase, animStage]);

  useEffect(() => {
    if (phase !== "prizeReady") return;
    const wobbleTimer = setInterval(() => {
      Animated.sequence([
        Animated.timing(wobbleAnim, {
          toValue: -1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnim, {
          toValue: -0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }, 10000);
    return () => clearInterval(wobbleTimer);
  }, [phase, wobbleAnim]);

  useEffect(() => {
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(mainFloatAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(mainFloatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    const sideFloating = Animated.loop(
      Animated.sequence([
        Animated.timing(sideFloatAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(sideFloatAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );
    floating.start();
    sideFloating.start();
    return () => {
      floating.stop();
      sideFloating.stop();
    };
  }, [mainFloatAnim, sideFloatAnim]);

  const runAnimSequence = (finalAmount: number) => {
    setAnimStage("landing");
    setTimeout(() => setAnimStage("waterfall"), 1600);
    setTimeout(() => setAnimStage("burst"), 3600);
    setTimeout(() => {
      setAnimStage("idle");
      setPhase("result");
      onTitleChange?.(t("active.memberDay.congratulation"));
      setTimeout(() => onComplete?.(finalAmount), 500);
    }, 4100);
  };

  const handleBoxClick = () => {
    if (phase !== "prizeReady") return;
    Animated.sequence([
      Animated.timing(wobbleAnim, {
        toValue: -1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(wobbleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(wobbleAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClaim = async () => {
    if (phase !== "prizeReady" || isClaiming || claimDisabled) return;
    if (onClaim) {
      setIsClaiming(true);
      try {
        const amount = await onClaim();
        const claimAmount =
          typeof amount === "number" && Number.isFinite(amount)
            ? amount
            : (prize?.amount ?? prizeAmount);
        setShownAmount(claimAmount);
        if (!openedRef.current) {
          openedRef.current = true;
          onTreasureOpened?.();
        }
        setPhase("animating");
        runAnimSequence(claimAmount);
      } catch {
        return;
      } finally {
        setIsClaiming(false);
      }
    } else {
      const claimAmount = prize?.amount ?? prizeAmount;
      setShownAmount(claimAmount);
      if (!openedRef.current) {
        openedRef.current = true;
        onTreasureOpened?.();
      }
      setPhase("animating");
      runAnimSequence(claimAmount);
    }
  };

  const wobbleRotate = wobbleAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-3deg", "0deg", "2.5deg"],
  });
  const mainTranslateY = mainFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const sideTranslateY = sideFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <View
      style={styles.root}
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
      }}
    >
      <ImageBackground
        source={require("@/assets/images/active/memberday/bg.png")}
        style={styles.bg}
        resizeMode="stretch"
      >
        {phase !== "result" ? (
          <>
            {showTopBar && phase === "prizeReady" && !claimDisabled && (
              <View style={styles.topBar}>
                <Text style={styles.topBarLabel} numberOfLines={1}>
                  {t("active.memberDay.inProgress")}
                </Text>
                <Text style={styles.topBarTime}>{countdown}</Text>
              </View>
            )}
            <Animated.View
              style={[
                styles.mainSphere,
                { left: Math.round(width / 2) - 40 },
                { transform: [{ translateY: mainTranslateY }] },
              ]}
            >
              <ImageBackground
                source={require("@/assets/images/active/memberday/crystal_ball_red.png")}
                style={styles.sphereCircle}
              >
                <Text style={styles.sphereDollar}>$</Text>
                <Text style={styles.sphereAmount}>{depositAmount}</Text>
              </ImageBackground>
              <Text style={styles.sphereTag}>
                {t("active.memberDay.lostAmount")}
              </Text>
            </Animated.View>

            {(phase === "prizeReady" || phase === "animating") && (
              <>
                <Animated.View
                  style={[
                    styles.sideBubbleLeft,
                    { transform: [{ translateY: sideTranslateY }] },
                  ]}
                >
                  <ImageBackground
                    source={require("@/assets/images/active/memberday/crystal_ball_red.png")}
                    style={styles.sideBubbleCircle}
                  >
                    <Image
                      source={require("@/assets/images/active/memberday/coin_small_2.png")}
                      style={styles.sideBubbleCoin}
                    />
                  </ImageBackground>
                  <Text style={styles.sideBubbleTag}>
                    {t("active.memberDay.reimbursement")}
                  </Text>
                </Animated.View>
                <Animated.View
                  style={[
                    styles.sideBubbleRight,
                    {
                      transform: [
                        { translateY: Animated.multiply(sideTranslateY, -1) },
                      ],
                    },
                  ]}
                >
                  <ImageBackground
                    source={require("@/assets/images/active/memberday/crystal_ball_red.png")}
                    style={styles.sideBubbleCircle}
                  >
                    <Image
                      source={require("@/assets/images/active/memberday/coin_small_1.png")}
                      style={styles.sideBubbleCoin}
                    />
                  </ImageBackground>
                  <Text style={styles.sideBubbleTag}>
                    {t("active.memberDay.reimbursement")}
                  </Text>
                </Animated.View>
              </>
            )}

            <ImageBackground
              source={require("@/assets/images/active/memberday/multiplier_coin.png")}
              style={styles.multDisc}
            >
              <Text style={styles.multLabel}>{multRateLabel || "x10%"}</Text>
            </ImageBackground>
            <Pressable
              onPress={handleClaim}
              style={styles.claimBtnWrap}
              disabled={isClaiming || claimDisabled}
            >
              <ImageBackground
                source={
                  !isClaiming && !claimDisabled
                    ? require("@/assets/images/active/memberday/claim_btn.png")
                    : require("@/assets/images/active/memberday/claim_btn_disabled.png")
                }
                style={{
                  width: 133,
                  height: 38,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isClaiming ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.claimBtnText}>
                    {claimDisabled
                      ? t("status.claim.claimed")
                      : t("status.claim.claim")}
                  </Text>
                )}
              </ImageBackground>
            </Pressable>
            <Animated.View
              style={[
                styles.treasureBox,
                { left: Math.round((width - 133) / 2) },
                {
                  transform: [{ rotate: wobbleRotate }],
                  opacity:
                    phase === "animating" && animStage !== "landing" ? 0.9 : 1,
                },
              ]}
            >
              <Pressable onPress={handleBoxClick}>
                <Image
                  source={treasureImg}
                  style={{ width: 133, height: 133 }}
                  resizeMode="contain"
                />
              </Pressable>
            </Animated.View>
          </>
        ) : (
          <View style={styles.resultLayer}>
            <Text style={styles.resultTitle}>
              {t("active.memberDay.congratulation")}
            </Text>
            <View style={styles.resultCard}>
              <Text style={styles.resultAmount}>${shownAmount}</Text>
            </View>
            <Text style={styles.resultPill}>
              {t("status.claim.claimSuccess")}
            </Text>
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center", alignItems: "center" },
  bg: {
    height: 280,
    width: "100%",
    overflow: "hidden",
    justifyContent: "center",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 24,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "rgba(5, 23, 80, 0.6)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    zIndex: 5,
  },
  topBarLabel: {
    color: "#fff",
    fontSize: 11,
    flexShrink: 1,
  },
  topBarTime: { color: "#ffd900", fontSize: 11, fontWeight: "700" },
  mainSphere: {
    position: "absolute",
    top: 18,
    width: 80,
    alignItems: "center",
    zIndex: 3,
  },
  sphereCircle: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  sphereDollar: { color: "#ff5e62", fontSize: 14, fontWeight: "900" },
  sphereAmount: { color: "#ff5e62", fontSize: 18, fontWeight: "900" },
  sphereTag: {
    minWidth: 70,
    marginTop: -12,
    paddingHorizontal: 8,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ff5e62",
    color: "#fff",
    fontSize: 11,
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
  },
  sideBubbleLeft: {
    position: "absolute",
    top: 72,
    left: 58,
    alignItems: "center",
    zIndex: 2,
  },
  sideBubbleRight: {
    position: "absolute",
    top: 56,
    right: 58,
    alignItems: "center",
    zIndex: 2,
  },
  sideBubbleCircle: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  sideBubbleCoin: { width: 22, height: 22 },
  sideBubbleTag: {
    marginTop: -6,
    paddingHorizontal: 8,
    height: 15,
    borderRadius: 9,
    backgroundColor: "#f4a216",
    color: "#fff",
    fontSize: 9,
    textAlign: "center",
    textAlignVertical: "center",
  },
  multDisc: {
    position: "absolute",
    top: 84,
    left: "50%",
    transform: [{ translateX: -43 }],
    width: 86,
    height: 86,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  multLabel: {
    fontSize: 18,
    fontWeight: "900",
    fontStyle: "italic",
    color: "#fbeb97",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  claimBtnWrap: {
    position: "absolute",
    bottom: 8,
    left: "50%",
    transform: [{ translateX: -66 }],
    width: 133,
    height: 38,
    zIndex: 3,
  },
  claimBtn: {
    width: "100%",
    height: "100%",
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  claimBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  treasureBox: {
    position: "absolute",
    bottom: 0,
    zIndex: 2,
  },
  hint: {
    position: "absolute",
    bottom: 52,
    left: "50%",
    transform: [{ translateX: -66 }],
    width: 133,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  hintText: { color: "#292c2b", fontSize: 11, textAlign: "center" },
  resultLayer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 8,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f4a216",
    textAlign: "center",
  },
  resultCard: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  resultAmount: { fontSize: 22, fontWeight: "900", color: "#e27902" },
  resultPill: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.75)",
    color: "#292c2b",
    fontSize: 12,
  },
});
