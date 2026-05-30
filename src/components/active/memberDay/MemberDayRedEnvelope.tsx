import { LinearGradient } from "expo-linear-gradient";
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Animated,
  Easing,
  ImageBackground,
} from "react-native";
import { useTranslation } from "react-i18next";
import { parseClaimAmount } from "@/components/active/memberDay/memberDayLogic";
import { rf } from "@/utils/scaleFont";

export interface Envelope {
  id: string;
  amount: number;
  status: number; // 0: unopened, 1: available, 2: opened
}

interface MemberDayRedEnvelopeProps {
  envelopes: Envelope[];
  onEnvelopeClick?: (envelope: Envelope) => void;
  /** When set (member day API flow), claim runs after wobble and sets amount from API. */
  onOpen?: () => Promise<number>;
  onAnimationComplete?: (amount: number) => void;
  onTitleChange?: (title: string) => void;
  onRedEnvelopeTap?: (envelope: Envelope) => void;
}

const envelopeImg = require("@/assets/images/active/memberday/envelope.png");
const envelopeResultImg = require("@/assets/images/active/memberday/envelope_result.png");
const envelopeEmptyImg = require("@/assets/images/active/memberday/envelope_empty.png");
const imgGold3 = require("@/assets/images/active/memberday/gold3.png");
const coinLoseImg = require("@/assets/images/active/memberday/coin_lose.png");

const WOBBLE_DURATION = 800;
const FLIP_DURATION = 600;

const WOBBLE_KEYFRAMES = [
  { x: 0, r: 0 },
  { x: -0.1, r: -3 },
  { x: 0.08, r: 2 },
  { x: -0.06, r: -2 },
  { x: 0.04, r: 1 },
  { x: -0.02, r: -1 },
  { x: 0, r: 0 },
];

function EnvelopeCard({
  width,
  envelope,
  isWobbling,
  isFlipping,
  wobbleX,
  wobbleRotate,
  flipRotateY,
  flipScale,
  onPress,
  onWobbleEnd,
}: {
  envelope: Envelope;
  isWobbling: boolean;
  isFlipping: boolean;
  wobbleX: Animated.Value;
  wobbleRotate: Animated.Value;
  flipRotateY: Animated.Value;
  flipScale: Animated.Value;
  onPress: () => void;
  onWobbleEnd: () => void;
  width: number;
}) {
  useEffect(() => {
    if (!isWobbling) {
      wobbleX.setValue(0);
      wobbleRotate.setValue(0);
      return;
    }
    const duration = WOBBLE_DURATION / (WOBBLE_KEYFRAMES.length - 1);
    const wobbleAnim = Animated.sequence(
      WOBBLE_KEYFRAMES.slice(1).map((k) =>
        Animated.parallel([
          Animated.timing(wobbleX, {
            toValue: k.x,
            duration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(wobbleRotate, {
            toValue: k.r,
            duration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ),
    );
    wobbleAnim.start(({ finished }) => {
      if (finished) onWobbleEnd();
    });
    return () => (wobbleAnim as any).stop?.();
  }, [isWobbling]);

  useEffect(() => {
    if (!isFlipping) return;
    flipRotateY.setValue(0);
    flipScale.setValue(1);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(flipRotateY, {
          toValue: 1,
          duration: FLIP_DURATION,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.sequence([
          Animated.timing(flipScale, {
            toValue: 1.1,
            duration: FLIP_DURATION / 2,
            useNativeDriver: true,
          }),
          Animated.timing(flipScale, {
            toValue: 1,
            duration: FLIP_DURATION / 2,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [isFlipping]);

  const showBack = envelope.status === 2 || isFlipping;
  const wobbleStyle = {
    transform: [
      {
        translateX: wobbleX.interpolate({
          inputRange: [-0.1, 0.08],
          outputRange: [-10, 8],
        }),
      },
      {
        rotate: wobbleRotate.interpolate({
          inputRange: [-3, 3],
          outputRange: ["-3deg", "3deg"],
        }),
      },
    ],
  };
  const flipStyle = {
    transform: [
      { perspective: 1200 },
      {
        rotateY: flipRotateY.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
      { scale: flipScale },
    ],
  };

  const isClickable = envelope.status !== 2 && !isWobbling && !isFlipping;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        isClickable && pressed && styles.envelopePressed,
        { width, height: Math.round((width * 13) / 9) },
      ]}
      disabled={!isClickable}
    >
      <Animated.View
        style={[
          styles.redEnvelope,
          isWobbling && wobbleStyle,
          isFlipping && flipStyle,
        ]}
      >
        <View style={styles.envelopeInner} collapsable={false}>
          {showBack ? (
            <ImageBackground
              style={{
                borderRadius: 12,
                width,
                height: Math.round((width * 13) / 9),
                paddingTop: 12,
              }}
              source={ envelopeResultImg }
              resizeMode="contain"
            >
              <View style={styles.prizeContent}>
                <Image
                  source={envelope.amount > 0 ? imgGold3 : coinLoseImg}
                  style={styles.goldCoinImg}
                  resizeMode="contain"
                />
                {envelope.amount > 0 ? (
                  <View style={styles.prizeAmountRow}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <Text style={styles.amountValue}>{envelope.amount}</Text>
                  </View>
                ) : (
                  <Text style={styles.emptyLabel}>未中奖</Text>
                )}
              </View>
            </ImageBackground>
          ) : (
            <ImageBackground
              style={{
                borderRadius: 12,
                width,
                height: Math.round((width * 13) / 9),
              }}
              source={envelopeImg}
              resizeMode="contain"
            />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function MemberDayRedEnvelope({
  envelopes,
  onEnvelopeClick,
  onOpen,
  onAnimationComplete,
  onTitleChange,
  onRedEnvelopeTap,
}: MemberDayRedEnvelopeProps) {
  const { t } = useTranslation();
  const [width, setWidth] = useState(0);
  const [title, setTitle] = useState(() => t("active.memberDay.pickEnvelope"));
  const [amountOverrides, setAmountOverrides] = useState<Record<string, number>>(
    {},
  );
  const [wobblingIds, setWobblingIds] = useState<string[]>([]);
  const [flippingIds, setFlippingIds] = useState<string[]>([]);
  const animsRef = useRef<
    Map<
      string,
      {
        wobbleX: Animated.Value;
        wobbleRotate: Animated.Value;
        flipRotateY: Animated.Value;
        flipScale: Animated.Value;
      }
    >
  >(new Map());

  const isAnyRedEnvelopeOpened = useMemo(
    () => envelopes.some((e) => e.status === 2),
    [envelopes],
  );

  const resetEnvelopes = useCallback(() => {
    setWobblingIds([]);
    setFlippingIds([]);
  }, []);

  useEffect(() => {
    resetEnvelopes();
    setAmountOverrides({});
    setTitle(t("active.memberDay.pickEnvelope"));
  }, [resetEnvelopes, t]);

  envelopes.forEach((e) => {
    if (!animsRef.current.has(e.id)) {
      animsRef.current.set(e.id, {
        wobbleX: new Animated.Value(0),
        wobbleRotate: new Animated.Value(0),
        flipRotateY: new Animated.Value(0),
        flipScale: new Animated.Value(1),
      });
    }
  });

  const handleWobbleEnd = useCallback(
    async (envelope: Envelope) => {
      setWobblingIds((prev) => prev.filter((id) => id !== envelope.id));

      let displayAmount = 0;
      if (onOpen) {
        try {
          const data = await onOpen();
          const parsed = parseClaimAmount(data);
          displayAmount = Math.max(
            0,
            parsed ?? (typeof data === "number" ? data : 0),
          );
        } catch {
          return;
        }
      } else {
        // No API: keep server/prop amounts (matches Vue when onOpen is omitted).
        displayAmount = Math.max(0, envelope.amount);
      }

      setAmountOverrides((prev) => ({ ...prev, [envelope.id]: displayAmount }));
      const titleWin = t("active.memberDay.congratulation");
      const titleLose = t("active.memberDay.tryAgainTitle");
      setTitle(displayAmount > 0 ? titleWin : titleLose);
      onTitleChange?.(displayAmount > 0 ? titleWin : titleLose);

      setFlippingIds((prev) => [...prev, envelope.id]);

      const updatedEnvelope: Envelope = {
        ...envelope,
        amount: displayAmount,
        status: 2,
      };
      onEnvelopeClick?.(updatedEnvelope);
      onRedEnvelopeTap?.(updatedEnvelope);

      setTimeout(() => {
        setFlippingIds((prev) => prev.filter((id) => id !== envelope.id));
        onAnimationComplete?.(displayAmount);
      }, FLIP_DURATION + 500);
    },
    [
      envelopes,
      onEnvelopeClick,
      onOpen,
      onAnimationComplete,
      onTitleChange,
      onRedEnvelopeTap,
      t,
    ],
  );

  const handlePress = useCallback(
    (envelope: Envelope) => {
      if (
        envelope.status === 2 ||
        flippingIds.includes(envelope.id) ||
        wobblingIds.includes(envelope.id)
      ) {
        return;
      }
      setWobblingIds((prev) => [...prev, envelope.id]);
    },
    [flippingIds, wobblingIds],
  );

  return (
    <View
      className="flex-1"
      style={styles.container}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setWidth(Math.round((width - 44) / 3));
      }}
    >
      <Text style={styles.title}>{title}</Text>
      <View className="flex-row justify-center gap-3">
        {envelopes.map((envelope) => {
          const anims = animsRef.current.get(envelope.id);
          if (!anims) return null;
          const displayEnv: Envelope = {
            ...envelope,
            amount: amountOverrides[envelope.id] ?? envelope.amount,
          };
          return (
            <EnvelopeCard
              width={width}
              key={envelope.id}
              envelope={displayEnv}
              isWobbling={wobblingIds.includes(envelope.id)}
              isFlipping={flippingIds.includes(envelope.id)}
              wobbleX={anims.wobbleX}
              wobbleRotate={anims.wobbleRotate}
              flipRotateY={anims.flipRotateY}
              flipScale={anims.flipScale}
              onPress={() => handlePress(envelope)}
              onWobbleEnd={() => void handleWobbleEnd(envelope)}
            />
          );
        })}
      </View>
      <View className="flex-row justify-center">
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          colors={["rgba(255, 255, 255, 0.80)", "rgba(255, 240, 188, 0.80)"]}
          style={styles.hintBtn}
        >
          <Text style={styles.hintBtnText}>
            {isAnyRedEnvelopeOpened
              ? t("active.memberDay.autoCredited")
              : t("active.memberDay.pickHint")}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 18,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: "#9B5A24",
    textAlign: "center",
  },
  envelopePressed: {
    opacity: 0.96,
  },
  redEnvelope: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  envelopeInner: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  envelopeFace: {
    borderRadius: 12,
  },
  prizeContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  goldCoinImg: {
    width: 24,
    height: 24,
  },
  prizeAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "900",
    color: "#9B5A24",
  },
  amountValue: {
    fontSize: rf(18),
    fontWeight: "900",
    color: "#9B5A24",
  },
  hintBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  hintBtnText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyLabel: {
    color: "rgba(154, 154, 154, 1)",
    fontWeight: 900,
    fontFamily: "Inters",
    fontSize: 18,
  },
});
