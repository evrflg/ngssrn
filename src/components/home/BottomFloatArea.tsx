import React, { memo, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Animated,
  Easing,
  Platform,
  DeviceEventEmitter,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useTranslation } from "react-i18next";
const { width: screenWidth } = Dimensions.get("window");
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Modal from "react-native-modal";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { I18nText } from "../I18nText";

type BottomFloatAreaProps = {
  /** Index3：由组件内订阅滚动 y，避免父级 setState 导致整页重渲染 */
  isShowToTop?: boolean;
  isToBottom?: boolean;
  scrollViewRef: any;
};

const BottomFloatArea = ({
  isShowToTop: isShowToTopProp,
  isToBottom: isToBottomProp,
  scrollViewRef,
}: BottomFloatAreaProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  /** Web：home 使用 edges.bottom=off，需手动加安全区，否则 PWA 全屏时视觉上比 Safari 更“贴底” */
  const webSafeBottom = Platform.OS === "web" ? insets.bottom : 0;
  const config: any = useSelector(
    (state: RootState) => state?.user?.cfg_site_base,
    (prev, next) =>
      prev?.isTurnlate === next?.isTurnlate &&
      prev?.mobile_desktop_logo === next?.mobile_desktop_logo &&
      prev?.mobile_restart_logo === next?.mobile_restart_logo &&
      prev?.station_name === next?.station_name,
  );
  const userInfo: any = useSelector(
    (state: RootState) => state?.user?.userInfo,
    (prev, next) => prev?.isLogin === next?.isLogin,
  );
  const [showShortModal, setShowShortModal] = useState(false);
  const [isModalShown, setIsModalShown] = useState(false);
  const [isShowToTopInternal, setIsShowToTopInternal] = useState(false);
  const rafFloatRef = useRef<number | null>(null);
  const pendingFloatYRef = useRef<number | null>(null);

  const isShowToTop = typeof isShowToTopProp === "boolean" ? isShowToTopProp : isShowToTopInternal;

  useEffect(() => {
    if (typeof isShowToTopProp === "boolean") return;

    const applyY = (y: number) => {
      const nextShowToTop = y > 300;
      setIsShowToTopInternal((prev) => (prev === nextShowToTop ? prev : nextShowToTop));
    };

    const flush = () => {
      rafFloatRef.current = null;
      const p = pendingFloatYRef.current;
      if (p == null) return;
      pendingFloatYRef.current = null;
      applyY(p);
    };

    const subY = DeviceEventEmitter.addListener("home-float-scroll-y", (payload: number) => {
      pendingFloatYRef.current = payload;
      if (rafFloatRef.current == null) {
        rafFloatRef.current = requestAnimationFrame(flush);
      }
    });
    const subReset = DeviceEventEmitter.addListener("home-float-reset", () => {
      setIsShowToTopInternal(false);
    });

    return () => {
      subY.remove();
      subReset.remove();
      if (rafFloatRef.current != null) {
        cancelAnimationFrame(rafFloatRef.current);
      }
    };
  }, [isShowToTopProp]);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const translateY = useRef(new Animated.Value(0)).current;
  const textColor = theme === "greenBlack" ? "#313536" : "#fff";

  // 仅在弹窗可见时运行指针动画，避免在不可见时持续占用 JS 线程
  useEffect(() => {
    if (!showShortModal) return;
    const upDownAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 10,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    upDownAnimation.start();
    return () => upDownAnimation.stop();
  }, [showShortModal, translateY]);

  //登录
  const toLogin = () => {
    navigation.push("login");
  };

  const toPlayTurnable = () => {
    if (userInfo?.isLogin) {
      navigation.push("turntable/eventPlay");
    } else {
      toLogin();
    }
  };

  const hideModal = () => {
    if (isModalShown) {
      setShowShortModal(false);
    }
  };

  const animatedStyle = {
    transform: [{ translateY: translateY }, { rotate: "180deg" }],
  };

  return (
    <View style={[styles.bottomContent, { bottom: 48 + webSafeBottom }]}>
      <Modal
        isVisible={showShortModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        style={styles.shortcutModal}
        animationInTiming={100}
        onModalShow={() => setIsModalShown(true)}
        onBackdropPress={() => hideModal()}
        onModalHide={() => setIsModalShown(false)}
      >
        <View
          style={{
            backgroundColor: Colors[theme].background,
            height: 433,
            overflow: "hidden",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            className="absolute top-[16px] right-[16px]"
            onPress={() => setShowShortModal(false)}
          >
            <Ionicons name="close" color={Colors[theme].darkColor} size={24} />
          </TouchableOpacity>
          <I18nText
            i18nKey="popup.niceTipTitle"
            style={[styles.shortcutTitle, { color: Colors[theme].darkColor }]}
          />
          <View className="p-[20px] w-full">
            <I18nText
              type="tiptitle"
              className="w-4/5"
              i18nKey="home.desktopTips.addHomeScreenStep1"
              style={[styles.step, { color: Colors[theme].textGray }]}
            />
            <View className="w-full items-center">
              <ImageBackground
                source={require("@/assets/images/desktopTips/add-home-screen-step-1.png")}
                style={[styles.guideImage, styles.guideImage1]}
              >
                <Text style={styles.guideText}>{t("home.desktopTips.adicionar")}</Text>
                <Text style={styles.guideText}>{t("home.desktopTips.encontre")}</Text>
                <Text style={styles.guideText}>{t("home.desktopTips.telainicial")}</Text>
                <Text style={styles.guideText}>{t("home.desktopTips.marcaTexto")}</Text>
              </ImageBackground>
            </View>
            <I18nText
              className="w-4/5"
              i18nKey="home.desktopTips.addHomeScreenStep2"
              style={[styles.step, { color: Colors[theme].textGray }]}
            />
            <View className="w-full items-center">
              <ImageBackground
                source={require("@/assets/images/desktopTips/ios_jc_2.png")}
                style={[styles.guideImage, styles.guideImage2]}
              >
                <View className="flex-row justify-between" style={{ paddingHorizontal: 5 }}>
                  <Text style={[styles.guideText, { color: "#1678ff" }]}>{t("common.cancel")}</Text>
                  <Text style={styles.guideText}>{t("home.desktopTips.telainicial")}</Text>
                  <Text style={[styles.guideText, { color: "#1678ff" }]}>
                    {t("common.confirm")}
                  </Text>
                </View>
                <View className="flex-row pl-[12px] mt-[34px]">
                  <Image
                    source={{ uri: config?.mobile_desktop_logo || config?.mobile_restart_logo }}
                    alt="logo"
                    style={{ width: 37, height: 37 }}
                  />
                  <View className="ml-[8px]">
                    <Text style={styles.stepContent}>{config?.station_name}</Text>
                    <Text style={[styles.stepContent, { color: "#8f8f8f", marginTop: 5 }]}>
                      {route.name}
                    </Text>
                  </View>
                </View>
                <Text className="leading-none" style={styles.bottomText}>
                  {t("home.desktopTips.adicionado")}
                </Text>
              </ImageBackground>
            </View>
            <Animated.Image
              source={require("@/assets/images/desktopTips/pointer.png")}
              resizeMode="contain"
              style={[styles.pointerImage, animatedStyle]}
            />
          </View>
        </View>
      </Modal>
      <View style={[styles.leftFloatArea]}>
        {isShowToTop && (
          <TouchableOpacity
            onPress={() => {
              scrollViewRef.current?.scrollTo({
                y: 0,
                animated: true,
              });
            }}
          >
            <LinearGradient
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              colors={[Colors[theme].gradient || Colors[theme].primary, Colors[theme].primary]}
              style={[styles.toTop, { borderColor: textColor }]}
            >
              <MaterialCommunityIcons name="rocket-outline" size={16} color={textColor} />
              <Text style={{ fontSize: 6, color: textColor }}>TOP</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {config?.isTurnlate && (
          <View style={styles.turntable}>
            <TouchableOpacity onPress={toPlayTurnable}>
              <Image
                style={{ width: 56, height: 56 }}
                source={require("@/assets/images/home/turntable-img.png")}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContent: {
    position: "absolute",
    width: screenWidth,
    height: 0,
  },
  redBag: {
    position: "absolute",
    height: 80,
    width: 80,
    left: 20,
    bottom: 20,
  },
  addDeskTop: {
    position: "absolute",
    height: 40,
    left: "50%",
    transform: [{ translateX: "-50%" }],
    bottom: 40,
  },
  toTop: {
    borderWidth: 2,
    height: 40,
    width: 40,
    borderRadius: 30,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  longDragon: {
    height: 56,
    width: 56,
    marginTop: 20,
  },
  turntable: {
    height: 56,
    width: 56,
    marginTop: 20,
  },
  leftFloatArea: {
    position: "absolute",
    bottom: 20,
    left: 2,
    width: 40,
  },
  shortcutModal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  shortcutTitle: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
    fontWeight: "bold",
  },
  step: {
    marginLeft: 22,
    fontSize: 11,
  },
  guideImage: {
    marginVertical: 10,
    borderRadius: 10,
  },
  guideImage1: {
    width: 240,
    height: 129,
    paddingLeft: 20,
  },
  guideText: {
    fontSize: 10,
    color: "#333",
    lineHeight: 31,
  },
  guideImage2: {
    width: 240,
    height: 140,
  },
  stepContent: {
    color: "#211f20",
    fontSize: 12,
    width: 150,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  bottomText: {
    fontSize: 8,
    padding: 10,
    color: "#8f8f8f",
    marginTop: 5,
  },
  pointerImage: {
    position: "absolute",
    width: 44,
    height: 44,
    left: "45%",
    bottom: 20,
  },
});

export default memo(
  BottomFloatArea,
  (prev, next) =>
    prev.scrollViewRef === next.scrollViewRef &&
    prev.isShowToTop === next.isShowToTop &&
    prev.isToBottom === next.isToBottom,
);
