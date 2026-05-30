import {
  Animated,
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useIsMemberDayToday } from "@/hooks/active/useIsMemberDayToday";
import React, { useEffect, useMemo, useRef } from "react";

const BADGE_SIZE = 56;

const MemberDayFooterBadge = ({
  fixedBottom,
  isCenterItem,
  isSecondStyle = false,
  anchorCenterX,
  centerStyle = false,
}: {
  fixedBottom?: number;
  isCenterItem?: boolean;
  isSecondStyle?: boolean;
  anchorCenterX?: number;
  centerStyle?: boolean;
}) => {
  const { t, i18n } = useTranslation();
  const isMemberDayToday = useIsMemberDayToday();
  const resolvedLang = i18n.resolvedLanguage ?? i18n.language;
  const isCnOrTwLocale =
    resolvedLang === "zh-CN" || resolvedLang === "zh-TW";
  const badgeFontSize = isCnOrTwLocale ? 8 : 6;
  const badgeLineHeight = isCnOrTwLocale ? 9 : 8;

  const bulbOpacity = useRef(new Animated.Value(0.2)).current;

  const bulbAnim = useMemo(
    () =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bulbOpacity, {
            toValue: 1,
            duration: 520,
            useNativeDriver: true,
          }),
          Animated.timing(bulbOpacity, {
            toValue: 0.2,
            duration: 520,
            useNativeDriver: true,
          }),
          Animated.delay(260),
        ])
      ),
    [bulbOpacity]
  );

  useEffect(() => {
    if (!isMemberDayToday) return;
    bulbAnim.start();
    return () => bulbAnim.stop();
  }, [bulbAnim, isMemberDayToday]);

  if (!isMemberDayToday) return null;

  const positionStyle =
    anchorCenterX !== undefined
      ? { left: anchorCenterX - BADGE_SIZE / 2 }
      : null;

  const badgeHeight = isSecondStyle ? BADGE_SIZE + 4 : BADGE_SIZE;

  return (
    <View
      style={[
        styles.badge,
        anchorCenterX === undefined && styles.badgeCentered,
        { bottom: fixedBottom ?? 39 },
        { height: badgeHeight },
        positionStyle,
      ]}
    >
      <Image
        style={styles.badgeImage}
        source={
          isCenterItem
            ? require("@/assets/images/memberday/memberday_badge2.webp")
            : require("@/assets/images/memberday/memberday_badge.webp")
        }
        resizeMode="contain"
      />

      <Animated.Image
        source={require("@/assets/images/memberday/star.webp")}
        resizeMode="contain"
        style={[styles.bulbStar, { opacity: bulbOpacity }]}
      />

      <View
        style={[
          styles.textOverlay,
          { top: centerStyle ? isSecondStyle ? "46%" : "41%" : "50%" },
          {transform: [{  translateY: isCenterItem ? -9 : -4 }]},
        ]}
        pointerEvents="none"
      >
        <Text
          style={[
            styles.badgeText,
            { fontSize: badgeFontSize, lineHeight: badgeLineHeight},
          ]}
          numberOfLines={2}
        >
          {t("pageName.memberDay")}
        </Text>
      </View>
    </View>
  );
};

export default MemberDayFooterBadge;

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    zIndex: 9000,
    width: BADGE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeCentered: {
    left: "50%",
    transform: [{ translateX: -BADGE_SIZE / 2 }],
  },
  badgeImage: {
    ...StyleSheet.absoluteFillObject,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
  },
  textOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    height: BADGE_SIZE * 0.33,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    overflow: "visible",
  },
  textOverlayFill: {
    transform: [{ translateY: -4 }],
  },
  textOverlayandroid: {
    transform: [{  translateY: -4 }],
  },
  textOverlayIos: {
    transform: [{ translateY: -4 }],
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
    alignSelf: "center",
    flexShrink: 1,
    textAlignVertical: "center",
    includeFontPadding: false,
    paddingVertical: 0,
    
  },
  /** 非中间 tab 底图留白与中间款不同，文字下移 3px 对齐视觉中心 */
  // badgeTextOffsetSide: {
  //   ...Platform.select({
  //     ios: { transform: [{ translateY: -1 }] },
  //     default: { transform: [{ translateY: 5 }] },
  //   }),
  // },

  bulbStar: {
    position: "absolute",
    top: 8,
    right: 2,
    width: 16,
    height: 16,
  },
});
