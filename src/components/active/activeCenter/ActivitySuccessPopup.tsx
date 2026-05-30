import { rf } from "@/utils/scaleFont";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ActivitySuccessPopupProps = {
  show: boolean;
  bonusAmount?: number | string;
  moneyUnit?: string;
  claimTip?: string;
  onShowChange: (show: boolean) => void;
};

const COUNTDOWN_SECONDS = 4;

export const ActivitySuccessPopup = ({
  show,
  bonusAmount,
  moneyUnit = "",
  claimTip,
  onShowChange,
}: ActivitySuccessPopupProps) => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const titleFont32 = useMemo(() => rf(32), []);
  const titleFont28 = useMemo(() => rf(28), []);
  const titleFont18 = useMemo(() => rf(18), []);
  const titleFont12 = useMemo(() => rf(12), []);
  const titleFont10 = useMemo(() => rf(10), []);
  const headerScale = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0.1)).current;
  const bagFloat = useRef(new Animated.Value(0)).current;
  const coinFloat = useRef(new Animated.Value(0)).current;
  const labelScale = useRef(new Animated.Value(1)).current;

  const popupWidth = useMemo(() => {
    const screenWidth = Dimensions.get("window").width;
    return Math.min(screenWidth - 32, 360);
  }, []);

  const close = useCallback(() => {
    onShowChange(false);
  }, [onShowChange]);

  useEffect(() => {
    if (!show) return;

    setCountdown(COUNTDOWN_SECONDS);
    headerScale.setValue(1);
    glowOpacity.setValue(0.1);
    bagFloat.setValue(0);
    coinFloat.setValue(0);
    labelScale.setValue(1);

    const headerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(headerScale, {
          toValue: 0.9,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(headerScale, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    const bagAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bagFloat, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bagFloat, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    const coinAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(coinFloat, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(coinFloat, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    const labelAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(labelScale, {
          toValue: 1.2,
          duration: 80,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(labelScale, {
          toValue: 1,
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(350),
        Animated.timing(labelScale, {
          toValue: 1.2,
          duration: 80,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(labelScale, {
          toValue: 1,
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(2790),
      ]),
    );

    headerAnimation.start();
    glowAnimation.start();
    bagAnimation.start();
    coinAnimation.start();
    labelAnimation.start();

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    const closeTimer = setTimeout(close, COUNTDOWN_SECONDS * 1000);

    return () => {
      headerAnimation.stop();
      glowAnimation.stop();
      bagAnimation.stop();
      coinAnimation.stop();
      labelAnimation.stop();
      clearInterval(countdownTimer);
      clearTimeout(closeTimer);
    };
  }, [bagFloat, close, coinFloat, glowOpacity, headerScale, labelScale, show]);

  //语言兜底
  const congratulationText = t("active.congratulation", {
    defaultValue: t("active.congratulation", {
      defaultValue: "Congratulations",
    }),
  });
  const headerTitle = claimTip?.trim()
    ? claimTip.trim()
    : congratulationText;

  const headerTitleFontSize = useMemo(() => {
    if (headerTitle.length > 64) return titleFont10;
    if (headerTitle.length > 48) return titleFont12;
    if (headerTitle.length > 30) return titleFont18;
    if (headerTitle.length > 13) return titleFont28;
    return titleFont32;
  }, [
    headerTitle.length,
    titleFont10,
    titleFont12,
    titleFont18,
    titleFont28,
    titleFont32,
  ]);
  const amountPrefix = t("active.redEnvelopeAmountPrefix", {
    defaultValue: "",
  });
  const autoCloseText = t("active.center.autoCloseText", {
    defaultValue: "auto close",
  });

  const bonusAmountText = useMemo(
    () => String(bonusAmount ?? "0.00"),
    [bonusAmount],
  );
  const moneyFontSize = useMemo(() => {
    const len = bonusAmountText.length;
    if (len > 8) return rf(28);
    if (len > 4) return rf(36);
    return rf(44);
  }, [bonusAmountText]);
  const unitFontSize = useMemo(() => {
    const len = bonusAmountText.length;
    if (len > 8) return rf(20);
    if (len > 4) return rf(24);
    return rf(28);
  }, [bonusAmountText]);
  const badgeFontSize = useMemo(() => {
    const len = bonusAmountText.length;
    if (len > 8) return rf(18);
    if (len > 4) return rf(20);
    return rf(24);
  }, [bonusAmountText]);
  const bagTranslateY = bagFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 8],
  });
  const coin1TranslateY = coinFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, popupWidth * 0.05],
  });
  const coin2TranslateY = coinFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -popupWidth * 0.05],
  });

  return (
    <Modal
      visible={show}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { width: popupWidth }]}>
          <View style={[styles.header, { height: popupWidth / 3.5 }]}>
            <Text style={[styles.title,
            { fontSize: headerTitleFontSize },]}>
              {headerTitle}
            </Text>
            <Animated.Image
              source={require("@/assets/images/promotion/redpackpop/header-bg.png")}
              resizeMode="cover"
              style={[
                styles.headerBg,
                { transform: [{ scale: 0.70 }, { scaleX: headerScale }] },
              ]}
            />
          </View>

          <View
            style={[
              styles.content,
              {
                width: popupWidth,
                height: popupWidth,
                marginTop: -popupWidth * 0.14,
              },
            ]}
          >
            <Animated.Image
              source={require("@/assets/images/promotion/redpackpop/bg-glow.webp")}
              resizeMode="contain"
              style={[
                styles.bgGlow,
                {
                  width: popupWidth * 1.1,
                  height: popupWidth * 1.1,
                  opacity: glowOpacity,
                },
              ]}
            />
            <Image
              source={require("@/assets/images/promotion/redpackpop/envelope-bottom.webp")}
              resizeMode="contain"
              style={[
                styles.fullImage,
                {
                  width: popupWidth,
                  height: popupWidth,
                  transform: [{ scale: 0.8 }],
                },
              ]}
            />
            <Animated.Image
              source={require("@/assets/images/promotion/redpackpop/bag.webp")}
              resizeMode="contain"
              style={[
                styles.fullImage,
                {
                  width: popupWidth,
                  height: popupWidth,
                  transform: [{ translateY: bagTranslateY }, { scale: 0.8 }],
                },
              ]}
            />
            <ImageBackground
              source={require("@/assets/images/promotion/redpackpop/envelope-top.png")}
              resizeMode="contain"
              style={[
                styles.fullImage,
                {
                  width: popupWidth,
                  height: popupWidth,
                  transform: [{ scale: 0.8 }],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.labelContainer,
                  {
                    paddingHorizontal: popupWidth * 0.06,
                    transform: [{ scale: labelScale }],
                  },
                ]}
              >
                <View style={styles.moneyRow}>
                  <Text style={[styles.badge, { fontSize: badgeFontSize }]}>
                    {amountPrefix}
                  </Text>
                  <Text style={[styles.money, { fontSize: moneyFontSize }]}>
                    {bonusAmountText}{" "}
                  </Text>
                  <Text style={[styles.unit, { fontSize: unitFontSize }]}>
                    {" "}
                    {moneyUnit}
                  </Text>
                </View>
              </Animated.View>
              <Text style={styles.counter}>
                {countdown}s {autoCloseText}
              </Text>
            </ImageBackground>
            <Animated.Image
              source={require("@/assets/images/promotion/redpackpop/coin1.png")}
              resizeMode="contain"
              style={[
                styles.coin1,
                {
                  width: popupWidth * 0.1,
                  height: popupWidth * 0.1,
                  transform: [{ translateY: coin1TranslateY }],
                },
              ]}
            />
            <Animated.Image
              source={require("@/assets/images/promotion/redpackpop/coin2.png")}
              resizeMode="contain"
              style={[
                styles.coin2,
                {
                  width: popupWidth * 0.1,
                  height: popupWidth * 0.1,
                  transform: [{ translateY: coin2TranslateY }],
                },
              ]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  container: {
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerBg: {
    zIndex: -1,
  },
  title: {
    position: "absolute",
    alignSelf: "center",
    justifyContent: "center",
    bottom: Platform.OS === "web" ? 30 : 38,
    width: "80%",
    color: "#FFFFFF",
    fontSize: rf(32),
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    position: "relative",
  },
  bgGlow: {
    position: "absolute",
    left: "-5%",
    top: "-5%",
  },
  fullImage: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  labelContainer: {
    position: "absolute",
    left: 0,
    bottom: "10%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  moneyRow: {
    maxWidth: "100%",
    minHeight: rf(100),
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    columnGap: 8,
  },
  badge: {
    color: "#FFFFFF",
    fontSize: rf(24),
    fontWeight: "500",
    textAlign: "center",
  },
  money: {
    color: "#FFFFFF",
    fontSize: rf(44),
    fontWeight: "600",
    textAlign: "center",
  },
  unit: {
    color: "#FFFFFF",
    fontSize: rf(28),
    fontWeight: "500",
    textAlign: "center",
  },
  counter: {
    position: "absolute",
    right: "10%",
    bottom: -rf(24),
    color: "#E1E1E1",
    fontSize: rf(14),
    textAlign: "right",
  },
  coin1: {
    position: "absolute",
    left: "15%",
    top: "40%",
  },
  coin2: {
    position: "absolute",
    right: "15%",
    top: "32%",
  },
});

