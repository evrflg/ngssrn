import { Bonus } from "@/api/types/wallet";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { bgBottomUrl, bgLightUrl, bgMiddleUrl, bgTopUrl } from "./assets";

interface MultiplierPopupProps {
  // 当前奖励数据
  data: Bonus | null;
  // 点击“领取加倍奖励”后的处理逻辑
  onMultiplierClaim: () => void | Promise<void>;
}

/**
 * 加倍优惠领取弹窗内容。
 * 负责加倍奖励说明、倍数展示和领取按钮的渲染。
 * 这一阶段专属的出现动画交给组件内部自己维护。
 */
export function MultiplierPopup({
  data,
  onMultiplierClaim,
}: MultiplierPopupProps) {
  const { height } = useWindowDimensions();
  const { t } = useTranslation();
  const { maxWidth } = useMaxWidth();
  const bgImageWidth = Math.round(maxWidth * 0.88);
  // 与 NormalGiftPopup 一致：Reanimated 做入场，避免 RN Animated + native 收尾闪动
  const slideProgress = useSharedValue(0);

  // 控制加倍优惠弹窗主体上移动画
  useEffect(() => {
    slideProgress.value = 0;
    slideProgress.value = withTiming(1, { duration: 500 });
  }, [slideProgress]);

  const slideEnterStyle = useAnimatedStyle(() => ({
    opacity: slideProgress.value,
    transform: [{ translateY: (1 - slideProgress.value) * height }],
  }));

  return (
    <>
      {/* 加倍优惠弹窗主体 */}
      <Reanimated.View
        collapsable={false}
        style={[styles.finalPopup, { width: bgImageWidth }, slideEnterStyle]}
      >
        <View
          className="discount-popup-finalPopupTop"
          style={styles.finalPopupTop}
        >
          <Image
            source={bgTopUrl}
            style={styles.bgTop}
            resizeMode="stretch"
          />
          <Text
            style={[
              styles.finalPopupTopText,
              {
                transform: [{ rotate: "-8deg" }],
              },
            ]}
          >
            {t("popup.discount.final_popup_top")}
          </Text>
        </View>

        <Image
          className="discount-popup-bgLight"
          source={bgLightUrl}
          style={[styles.bgAbsolute, { width: bgImageWidth, zIndex: 1 }]}
          resizeMode="contain"
        />
        <Image
          className="discount-popup-bgMiddle"
          source={bgMiddleUrl}
          style={[
            styles.bgAbsolute,
            {
              width: bgImageWidth,
              height: bgImageWidth * 0.5,
              top: bgImageWidth * 0.35,
            },
          ]}
          resizeMode="contain"
        />
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          colors={["#fff8ee", "#f7c387"]}
          style={[
            styles.bgAbsolute,
            styles.bgContent,
            { width: Math.round(maxWidth * 0.65) },
          ]}
        >
          <Text style={styles.topText}>
            {t("popup.discount.final_deposit_tip")}
          </Text>

          <View style={styles.contentCenter}>
            <View style={styles.topLeftText}>
              <Text style={styles.topLeftTextContent}>
                {t("popup.discount.win")}
              </Text>
            </View>
            <Text style={styles.contentCenterMultiplier}>
              {data?.multiple ?? 0}
              <Text style={styles.multiplierX}>X</Text>
            </Text>
            <Text style={styles.multiplierLabel}>
              {t("popup.discount.multiplier")}
            </Text>
          </View>

          {data?.multipleDepositModuleId ? (
            <Text style={styles.multiplierDes}>
              {t("popup.discount.final_deposit_multiplier_desc", {
                maxDepositAmount: data?.maxDepositAmount || "_",
                multiple: data?.multiple,
              })}
            </Text>
          ) : (
            <Text style={styles.depositDesc}>
              {t("popup.discount.final_deposit_desc")}
            </Text>
          )}
        </LinearGradient>
        <Image
          className="discount-popup-bgBottom"
          source={bgBottomUrl}
          style={[
            styles.bgAbsolute,
            styles.bgBottom,
            {
              width: bgImageWidth,
              height: Math.round(maxWidth * 0.5),
            },
          ]}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={[styles.multiplierButton]}
          onPress={onMultiplierClaim}
          activeOpacity={0.8}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            colors={["#5b7ff4", "#a15cf5"]}
            style={{ borderRadius: 25, paddingHorizontal: 16, paddingVertical: 8 }}
          >
            <Text style={styles.multiplierButtonText}>
              {t("popup.discount.claim_x")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Reanimated.View>
    </>
  );
}

const styles = StyleSheet.create({
  finalPopup: {
    height: 420,
    maxWidth: 400,
    alignItems: "center",
    marginHorizontal: "auto",
  },
  finalPopupTop: {
    width: "100%",
    height: 148,
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bgTop: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  finalPopupTopText: {
    position: "absolute",
    top: "30%",
    color: "#fcfad0",
    fontSize: 20,
    fontWeight: "700",
  },
  bgAbsolute: {
    position: "absolute",
    zIndex: 1,
    width: "100%",
  },
  bgContent: {
    zIndex: 0,
    top: 74,
    height: 258,
    backgroundColor: "#fff8ee",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#f34100",
    borderStyle: "dashed",
    shadowColor: "#f34100",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 11,
    elevation: 5,
  },
  topText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "700",
    color: "#333",
  },
  contentCenter: {
    width: "80%",
    height: "30%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FC974C",
    borderStyle: "dashed",
    marginVertical: 8,
  },
  topLeftText: {
    position: "absolute",
    top: -10,
    left: 12,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#FC974C",
    justifyContent: "center",
    alignItems: "center",
  },
  topLeftTextContent: {
    fontSize: 10,
    fontWeight: "200",
    color: "#fff8ee",
  },
  contentCenterMultiplier: {
    fontSize: 28,
    lineHeight: 34,
    color: "rgb(230, 64, 33)",
    fontWeight: "700",
  },
  multiplierX: {
    fontSize: 20,
  },
  multiplierLabel: {
    color: "rgb(230, 64, 33)",
    fontSize: 14,
    fontWeight: "700",
  },
  multiplierDes: {
    color: "#957959",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: -8,
  },
  depositDesc: {
    color: "#957959",
    fontSize: 12,
    textAlign: "center",
  },
  bgBottom: {
    bottom: -32,
  },
  multiplierButton: {
    position: "absolute",
    zIndex: 2,
    bottom: -40,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  multiplierButtonText: {
    fontSize: 15,
    color: "#fff",
    textShadowColor: "rgba(255, 255, 255, 0.25)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
