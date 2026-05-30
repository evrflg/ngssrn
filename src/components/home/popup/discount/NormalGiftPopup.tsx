import { Bonus } from "@/api/types/wallet";
import { Tenant, tenantStore } from "@/store/tenant/tenantSlice";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { GiftBox } from "./GiftBox";
import { GoldCoinRain } from "./GoldCoinRain";
import { buttonUrl, light2Url } from "./assets";

const isAndroid = Platform.OS === "android";

interface NormalGiftPopupProps {
  // 当前奖励数据
  data: Bonus | null;
  // 点击领取普通奖励
  onNormalClaim: () => Promise<void>;
}

/**
 * 普通优惠领取弹窗内容。
 * 负责礼盒、光效、金币雨以及普通奖励领取按钮的展示。
 * 这一阶段专属的展示状态和动画都放在组件内部维护。
 */
export function NormalGiftPopup({
  data,
  onNormalClaim,
}: NormalGiftPopupProps) {
  const { t } = useTranslation();
  const { height: windowHeight } = useWindowDimensions();
  const tenantInfo: Tenant = useSelector(tenantStore);

  const [giftState, setGiftState] = useState<"wait" | "open">("wait");
  const [showReward, setShowReward] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  // 上滑入场改用 Reanimated，避免 RN Animated + useNativeDriver 结束时 native 交接闪一下
  const slideTranslateY = useSharedValue(600);

  // 顶部光效旋转
  useEffect(() => {
    rotateAnim.setValue(0);
    const anim = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [rotateAnim]);

  useEffect(() => {
    slideTranslateY.value = 600;
    slideTranslateY.value = withTiming(0, { duration: 500 });
  }, [slideTranslateY]);

  const slideEnterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideTranslateY.value }],
  }));

  /**
   * 打开普通优惠礼盒。
   * 会先切换礼盒状态，再在动画接近结束时展示奖金文案。
   */
  const openGiftBox = () => {
    setGiftState("open");
    setTimeout(() => {
      // 延迟到动画快要结束
      setShowReward(true);
    }, 1200);
  };

  /**
   * 点击普通奖励领取按钮时，直接调用父层领取逻辑。
   * 这里只保留最轻量的禁重点保护，避免额外按钮动画带来多余重渲染。
   */
  const handleNormalClaim = async () => {
    if (!data || claiming) return;

    setClaiming(true);
    try {
      await onNormalClaim();
    } finally {
      setClaiming(false);
    }
  };

  return (
    <View style={{ width: "100%", minHeight: windowHeight }}>
      {/* 金币雨特效 */}
      <GoldCoinRain />

      {/* 普通优惠弹窗主体 */}
      <Reanimated.View
        collapsable={false}
        style={[styles.step1Wrapper, slideEnterStyle]}
      >
        {/* 顶部旋转光效区域 */}
        <View
          style={[
            styles.lightContainer,
            showReward && styles.openedLight,
          ]}
        >
          <Animated.Image
            source={light2Url}
            style={[
              styles.rotatingLight,
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
            resizeMode="contain"
          />
          {
            showReward && (
              <View className="absolute w-full h-full items-center justify-center">
                <Text style={styles.gotBonusText}>
                  +{`${tenantInfo?.currency ?? "$"} ${data?.depositAmount}`}
                </Text>
              </View>
            )
          }
        </View>

        {/* 礼盒区域 */}
        <View style={[styles.giftBoxWrapper]}>
          <View style={{ marginTop: -60, alignItems: "center", maxWidth: 400 }}>
            {/* 奖金文案 */}
            {giftState === "wait" && (
              <>
                <Text style={styles.bonusText}>{t("popup.discount.bonus")}</Text>
                <Text style={styles.bonusTip}>{t("popup.discount.bonus_tip")}</Text>
              </>
            )}

            {/* 礼盒 */}
            <GiftBox state={giftState} />
          </View>
        </View>

        {/* 打开礼盒按钮 */}
        {giftState === "wait" && (
          <TouchableOpacity
            style={[styles.button, { marginTop: isAndroid ? -60 : -80 }]}
            onPress={openGiftBox}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={buttonUrl}
              style={styles.button}
              imageStyle={{ borderRadius: 8 }}
              resizeMode="cover"
            >
              <Text style={styles.buttonText}>{t("popup.discount.open")}</Text>
            </ImageBackground>
          </TouchableOpacity>
        )}

        {/* 领取奖励按钮 */}
        {showReward && (
          <TouchableOpacity
            style={[styles.button, { marginTop: -60 }]}
            onPress={handleNormalClaim}
            activeOpacity={0.8}
            disabled={claiming}
          >
            <ImageBackground
              source={buttonUrl}
              style={styles.button}
              imageStyle={{ borderRadius: 8 }}
              resizeMode="cover"
            >
              <Text style={styles.buttonText}>
                {t("status.claim.claim")}
              </Text>
            </ImageBackground>
          </TouchableOpacity>
        )}
      </Reanimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  step1Wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    elevation: 4,
  },
  lightContainer: {
    position: "relative",
    width: 400,
    height: 400,
  },
  openedLight: {
    zIndex: 110,
  },
  rotatingLight: {
    width: 400,
    height: 400,
    opacity: 0.8,
  },
  gotBonusText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#f8ff7a",
    textTransform: "uppercase",
    textShadowColor: "#d72f2f",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  giftBoxWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  bonusText: {
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 45,
    textTransform: "uppercase",
    textAlign: "center",
    color: "#f0e96f",
    marginBottom: 8,
  },
  bonusTip: {
    textAlign: "center",
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  button: {
    width: 150,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    position: "relative",
    zIndex: 120,
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "900",
    color: "#854a08",
    textShadowColor: "rgba(255, 255, 255, 0.25)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
