import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useToast } from "@/components/common/toast";
import { rf } from "@/utils/scaleFont";

export interface MemberDayPotProps {
  onClaim?: () => Promise<number | undefined>;
  claimDisabled?: boolean;
  showTopBar?: boolean;
  mockToday?: string;
  depositAmount?: number;
  multRateLabel?: string;
  prizeAmount?: number;
  onTitleChange?: (title: string) => void;
  onTreasureOpened?: () => void;
  onComplete?: (amount?: number) => void;
}

type Phase = "prizeReady" | "animating" | "result";
type AnimStage = "idle" | "landing" | "waterfall" | "burst";

const ANIM = {
  LANDING: 1600,
  WATERFALL: 2000,
  BURST: 500,
  get TOTAL() {
    return this.LANDING + this.WATERFALL + this.BURST;
  },
};

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

export default function MemberDayPot({
  onClaim,
  claimDisabled = false,
  showTopBar = true,
  mockToday,
  depositAmount = 0,
  multRateLabel = "",
  prizeAmount = 0,
  onTitleChange,
  onTreasureOpened,
  onComplete,
}: MemberDayPotProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [phase, setPhase] = useState<Phase>("prizeReady");
  const [animStage, setAnimStage] = useState<AnimStage>("idle");
  const [isClaiming, setIsClaiming] = useState(false);
  const [countdown, setCountdown] = useState(() =>
    formatMs(msUntilEndOfDay(mockToday)),
  );
  const [shownAmount, setShownAmount] = useState(0);
  const openedRef = useRef(false);
  const phaseRef = useRef<Phase>("prizeReady");
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const mainFloatAnim = useRef(new Animated.Value(0)).current;
  const sideFloatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const raysRotate = useRef(new Animated.Value(0)).current;
  const eruptGlow = useRef(new Animated.Value(0)).current;
  const wobbleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

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
  }, [mockToday, depositAmount, prizeAmount]);

  const potSource = useMemo(() => {
    if (phase === "animating") {
      return animStage === "landing"
        ? require("@/assets/images/active/memberday/afterclick.gif")
        : require("@/assets/images/active/memberday/errupt.gif");
    }
    if (phase === "prizeReady") {
      return claimDisabled
        ? require("@/assets/images/active/memberday/treasure_pot.png")
        : require("@/assets/images/active/memberday/treasure_pot_full.png");
    }
    return require("@/assets/images/active/memberday/treasure_pot_full.png");
  }, [phase, animStage, claimDisabled]);

  const triggerWobble = useCallback(() => {
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
  }, [wobbleAnim]);

  useEffect(() => {
    if (phase !== "prizeReady") {
      if (wobbleTimerRef.current) {
        clearInterval(wobbleTimerRef.current);
        wobbleTimerRef.current = null;
      }
      return;
    }
    triggerWobble();
    wobbleTimerRef.current = setInterval(() => {
      if (phaseRef.current === "prizeReady") triggerWobble();
    }, 10000);
    return () => {
      if (wobbleTimerRef.current) {
        clearInterval(wobbleTimerRef.current);
        wobbleTimerRef.current = null;
      }
    };
  }, [phase, triggerWobble]);

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

  useEffect(() => {
    if (phase !== "prizeReady") return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [phase, pulseAnim]);

  useEffect(() => {
    const erupting =
      phase === "animating" &&
      (animStage === "waterfall" || animStage === "burst");
    if (!erupting) {
      eruptGlow.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(eruptGlow, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(eruptGlow, {
          toValue: 0,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [phase, animStage, eruptGlow]);

  useEffect(() => {
    if (phase !== "result") return;
    raysRotate.setValue(0);
    const spin = Animated.loop(
      Animated.timing(raysRotate, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      }),
    );
    spin.start();
    return () => spin.stop();
  }, [phase, raysRotate]);

  const runAnimSequence = (finalAmount: number) => {
    setAnimStage("landing");
    setTimeout(() => setAnimStage("waterfall"), ANIM.LANDING);
    setTimeout(() => setAnimStage("burst"), ANIM.LANDING + ANIM.WATERFALL);
    setTimeout(() => {
      setAnimStage("idle");
      setPhase("result");
      onTitleChange?.(t("active.memberDay.congratulation"));
      setTimeout(() => {
        const amt = finalAmount;
        if (amt > 0) {
          toast.success(
            t("active.mysteriousMine.claimSuccessTips", { amount: amt }),
          );
        }
        onComplete?.(amt);
      }, 500);
    }, ANIM.TOTAL);
  };

  const handlePotPress = () => {
    if (phase === "prizeReady") triggerWobble();
  };

  const handleClaim = async () => {
    if (phase !== "prizeReady" || isClaiming || claimDisabled) return;
    if (wobbleTimerRef.current) {
      clearInterval(wobbleTimerRef.current);
      wobbleTimerRef.current = null;
    }

    if (onClaim) {
      setIsClaiming(true);
      try {
        const amount = await onClaim();
        const claimAmount =
          typeof amount === "number" && Number.isFinite(amount)
            ? amount
            : prizeAmount;
        setShownAmount(claimAmount);
        if (!openedRef.current) {
          openedRef.current = true;
          onTreasureOpened?.();
        }
        setPhase("animating");
        runAnimSequence(claimAmount);
      } catch {
        /* parent toasts */
      } finally {
        setIsClaiming(false);
      }
    } else {
      const claimAmount = prizeAmount;
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
  const sideTranslateYInverted = sideFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6],
  });
  const raysSpin = raysRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const eruptOpacity = eruptGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });

  return (
    <View style={styles.root}>
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
                { transform: [{ translateY: mainTranslateY }] },
              ]}
            >
              <View style={styles.sphereWrap}>
                <Image
                  source={require("@/assets/images/active/memberday/crystal_ball.png")}
                  style={styles.sphereImg}
                  resizeMode="contain"
                />
                <View style={styles.sphereAmt}>
                  <Text style={styles.amtDollar}>$</Text>
                  <Text style={styles.amtNum}>{depositAmount}</Text>
                </View>
              </View>
              <LinearGradient
                colors={["#FFD900", "#F48D16"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.sphereTag}
              >
                <Text style={styles.sphereTagText} numberOfLines={1}>
                  {t("active.memberDay.accumulated")}
                </Text>
              </LinearGradient>
            </Animated.View>

            {(phase === "prizeReady" || phase === "animating") && (
              <>
                <Animated.View
                  style={[
                    styles.sideBubbleLeft,
                    { transform: [{ translateY: sideTranslateY }] },
                  ]}
                >
                  <View style={styles.bubWrap}>
                    <Image
                      source={require("@/assets/images/active/memberday/crystal_ball.png")}
                      style={styles.bubSphereImg}
                      resizeMode="contain"
                    />
                    <Image
                      source={require("@/assets/images/active/memberday/coin_small_2.png")}
                      style={styles.bubIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <LinearGradient
                    colors={["#FFD900", "#F48D16"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.bubTag}
                  >
                    <Text style={styles.bubTagText} numberOfLines={1}>
                      {t("active.memberDay.giftReward")}
                    </Text>
                  </LinearGradient>
                </Animated.View>
                <Animated.View
                  style={[
                    styles.sideBubbleRight,
                    { transform: [{ translateY: sideTranslateYInverted }] },
                  ]}
                >
                  <View style={styles.bubWrap}>
                    <Image
                      source={require("@/assets/images/active/memberday/crystal_ball.png")}
                      style={styles.bubSphereImg}
                      resizeMode="contain"
                    />
                    <Image
                      source={require("@/assets/images/active/memberday/coin_small_1.png")}
                      style={styles.bubIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <LinearGradient
                    colors={["#FFD900", "#F48D16"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.bubTag}
                  >
                    <Text style={styles.bubTagText} numberOfLines={1}>
                      {t("active.memberDay.giftReward")}
                    </Text>
                  </LinearGradient>
                </Animated.View>
              </>
            )}

            <View style={styles.multDisc} pointerEvents="none">
              <Animated.View
                style={[
                  styles.discGlow,
                  phase === "prizeReady" && { opacity: pulseAnim },
                ]}
              />
              <ImageBackground
                source={require("@/assets/images/active/memberday/multiplier_coin.png")}
                style={styles.multImg}
              >
                <Text style={styles.multLabel} numberOfLines={1}>
                  {multRateLabel || ""}
                </Text>
              </ImageBackground>
            </View>

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
                style={styles.claimBtnBg}
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

            {phase === "animating" && animStage === "waterfall" && (
              <>
                <Image
                  source={require("@/assets/images/active/memberday/coin_waterfall.gif")}
                  style={[styles.animRain, styles.animRainCenter]}
                  resizeMode="cover"
                />
                <Image
                  source={require("@/assets/images/active/memberday/coin_waterfall.gif")}
                  style={[styles.animRain, styles.animRainLeft]}
                  resizeMode="cover"
                />
                <Image
                  source={require("@/assets/images/active/memberday/coin_waterfall.gif")}
                  style={[styles.animRain, styles.animRainRight]}
                  resizeMode="cover"
                />
              </>
            )}
            {phase === "animating" && animStage === "burst" && (
              <Image
                source={require("@/assets/images/active/memberday/coin_burst_from_pot.gif")}
                style={styles.animBurst}
                resizeMode="contain"
              />
            )}

            <Animated.View
              style={[
                styles.potWrap,
                {
                  transform: [{ rotate: wobbleRotate }],
                },
                phase === "animating" &&
                  (animStage === "waterfall" || animStage === "burst") && {
                    zIndex: 4,
                  },
              ]}
            >
              {phase === "animating" &&
                (animStage === "waterfall" || animStage === "burst") && (
                  <Animated.View
                    style={[styles.potGlowOverlay, { opacity: eruptOpacity }]}
                    pointerEvents="none"
                  >
                    <View style={styles.potGlowRing} />
                  </Animated.View>
                )}
              <Pressable onPress={handlePotPress}>
                <Image
                  source={potSource}
                  style={styles.potImg}
                  resizeMode="contain"
                />
              </Pressable>
            </Animated.View>
          </>
        ) : (
          <View style={styles.resultLayer}>
            <Animated.View
              style={[styles.resRays, { transform: [{ rotate: raysSpin }] }]}
            >
              <Image
                source={require("@/assets/images/active/memberday/sparkle_gold.png")}
                style={styles.resRaysImg}
                resizeMode="contain"
              />
            </Animated.View>
            <Text style={styles.resTitle}>
              {t("active.memberDay.congratulation")}
            </Text>
            <View style={styles.resCard}>
              <Image
                source={require("@/assets/images/active/memberday/coin_gold.png")}
                style={styles.resCoin}
                resizeMode="contain"
              />
              <View style={styles.resAmt}>
                <Text style={styles.resSymbol}>$</Text>
                <Text style={styles.resVal}>{shownAmount}</Text>
              </View>
            </View>
            <LinearGradient
              colors={["rgba(255,255,255,0.6)", "rgba(255,240,188,0.6)"]}
              style={styles.resPill}
            >
              <Text style={styles.resPillText}>
                {t("active.memberDay.claimSuccess")}
              </Text>
            </LinearGradient>
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
    borderRadius: 8,
    backgroundColor: "#0d1435",
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
    zIndex: 10,
    paddingHorizontal: 8,
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
    left: "50%",
    marginLeft: -40,
    width: 80,
    alignItems: "center",
    zIndex: 3,
  },
  sphereWrap: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  sphereImg: {
    position: "absolute",
    width: 80,
    height: 80,
  },
  sphereAmt: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 1,
    zIndex: 1,
  },
  amtDollar: {
    color: "#FFD900",
    fontSize: 14,
    fontWeight: "900",
  },
  amtNum: {
    color: "#FFD900",
    fontSize: 18,
    fontWeight: "900",
  },
  sphereTag: {
    minWidth: 50,
    maxWidth: 100,
    paddingHorizontal: 8,
    height: 20,
    marginTop: -18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#b44600",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 4,
  },
  sphereTagText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 11,
  },
  sideBubbleLeft: {
    position: "absolute",
    top: 70,
    left: 58,
    alignItems: "center",
    zIndex: 2,
  },
  sideBubbleRight: {
    position: "absolute",
    top: 52,
    right: 58,
    alignItems: "center",
    zIndex: 2,
  },
  bubWrap: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  bubSphereImg: {
    position: "absolute",
    width: 42,
    height: 42,
  },
  bubIcon: { width: 22, height: 22, zIndex: 1 },
  bubTag: {
    height: 15,
    maxWidth: 52,
    marginTop: -8,
    paddingHorizontal: 6,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  bubTagText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 8,
  },
  multDisc: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -43,
    marginTop: -43,
    width: 86,
    height: 86,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  discGlow: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(255, 215, 0, 0.35)",
  },
  multImg: {
    position: "absolute",
    width: 86,
    height: 86,
    top: "37%",
    marginTop: -32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  multLabel: {
    fontWeight: "900",
    fontStyle: "italic",
    fontSize: 18,
    color: "#FBEB97",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    maxWidth: 70,
  },
  claimBtnWrap: {
    position: "absolute",
    bottom: 8,
    left: "50%",
    marginLeft: -66,
    width: 133,
    height: 38,
    zIndex: 5,
  },
  claimBtnBg: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  claimBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  animRain: {
    position: "absolute",
    zIndex: 3,
    opacity: 0.95,
  },
  animRainCenter: {
    top: 105,
    left: 150,
    width: 83,
    height: 70,
    transform: [{ rotate: "60deg" }],
  },
  animRainLeft: {
    top: 86,
    left: 78,
    width: 62,
    height: 56,
    transform: [{ rotate: "-12deg" }],
  },
  animRainRight: {
    top: 100,
    right: 24,
    width: 62,
    height: 51,
    transform: [{ rotate: "-50deg" }],
  },
  animBurst: {
    position: "absolute",
    left: "50%",
    marginLeft: -90,
    bottom: 30,
    width: 180,
    height: 120,
    zIndex: 4,
  },
  potWrap: {
    position: "absolute",
    bottom: -10,
    left: "50%",
    marginLeft: -66.5,
    width: 133,
    zIndex: 2,
  },
  potGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  potGlowRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 200, 60, 0.45)",
  },
  potImg: {
    width: 133,
    height: 133,
  },
  resultLayer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
  },
  resRays: {
    position: "absolute",
    top: 100,
    left: "50%",
    marginLeft: -150,
    width: 300,
    height: 300,
    marginTop: -150,
    opacity: 0.6,
    zIndex: 1,
  },
  resRaysImg: { width: 300, height: 300 },
  resTitle: {
    marginTop: 22,
    fontSize: 20,
    fontWeight: "600",
    color: "#F48D16",
    textAlign: "center",
    zIndex: 2,
  },
  resCard: {
    marginTop: 12,
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  resCoin: { width: 24, height: 24 },
  resAmt: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    marginTop: 2,
  },
  resSymbol: { fontSize: 16, fontWeight: "900", color: "#E27902" },
  resVal: { fontSize: 16, fontWeight: "900", color: "#E27902" },
  resPill: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 20,
    zIndex: 3,
  },
  resPillText: {
    color: "#292C2B",
    fontSize: 12,
    fontWeight: "500",
  },
});
