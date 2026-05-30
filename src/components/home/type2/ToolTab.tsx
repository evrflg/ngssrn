import {
  View,
  StyleSheet,
  Text,
  Image,
  Pressable,
  Platform,
  InteractionManager,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { memo, useCallback, useRef } from "react";
import { fontTextSize, fontTitleSize } from "../utils/const";
import { GradientButton } from "@/components/ui/gradient/GradientButton";
import { rf } from "@/utils/scaleFont";
import { changeIsShowTestUserPopup } from "@/store/user/userSlice";

/** 与 VIP 页一致：弹窗关闭后再导航，减轻 iOS 上与 Modal 动画同帧 push 的闪屏 */
function runDeferredNavigation(callback: () => void) {
  if (Platform.OS === "ios") {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(callback);
    });
    return;
  }
  requestAnimationFrame(callback);
}

export const ToolTab = memo(() => {
  const cardBg1 = useThemeColor({}, "cardBg1");
  const { theme } = useTheme(); //主题
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);

  // 使用 useRef 替代模块级变量，避免全局状态污染
  const isPassRef = useRef(true);
  const dispatch = useDispatch();

  const goToPage = useCallback(
    (route: string) => {
      if (!isPassRef.current) return;
      isPassRef.current = false;
      runDeferredNavigation(() => {
        if (userInfo?.isLogin) {
          if (userInfo?.isTestUser) {
            dispatch(changeIsShowTestUserPopup(true));
            return;
          }
          navigation.push(route);
        } else {
          navigation.push("login");
        }
      });
      setTimeout(() => {
        isPassRef.current = true;
      }, 2000);
    },
    [userInfo?.isLogin, navigation],
  );
  const withdrawGradientStyle = {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    // borderTopWidth: 1,
    // borderTopColor: 'rgba(255,228,77,0.7)',
  };
  const rechargeInnerStyle = {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden" as const,
  };
  const textStyle = {
    fontSize: fontTitleSize,
    color: Colors[theme].text,
    fontWeight: "500" as const,
    lineHeight: Math.ceil(fontTitleSize * 1.35),
    ...(Platform.OS === "android"
      ? { includeFontPadding: false, textAlignVertical: "center" as const }
      : {}),
  };
  const imageStyle = { width: 22, height: 22 };

  const rechargeBakeOverlay = Colors[theme].homeToolTabRechargeBakeOverlay;

  return (
    <View style={[styles.container, { backgroundColor: cardBg1 }]}>
      <View style={[styles.buttonContainer, styles.leftButtonFirst]}>
        <GradientButton
          onPress={() => goToPage("wallet/recharge")}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={rechargeInnerStyle}
          bakeSolid={{
            backgroundColor: Colors[theme].homeToolTabRechargeBakeBg,
            baseOverlayColor: "rgba(255,255,255,0.06)",
            gradientOverlayColor: rechargeBakeOverlay,
            stop: 0.2333,
          }}
          colors={[
            Colors[theme].searchBtnGradientStart || "rgba(71, 181, 255, 0)",
            rechargeBakeOverlay,
          ]}
          locations={[0.2333, 1]}
          title={t("pageName.recharge")}
          titleStyle={textStyle}
        />
      </View>
      <View style={styles.buttonContainer}>
        <GradientButton
          onPress={() => goToPage("wallet/withdraw")}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={withdrawGradientStyle}
          colors={[
            Colors[theme].primary,
            Colors[theme].btnText,
            Colors[theme].themeColor1 || Colors[theme].gradient,
          ]}
          locations={[0, 0.8077, 1]}
          title={t("pageName.withdraw")}
          titleStyle={textStyle}
        />
      </View>
      <View style={styles.rightArea}>
        <Pressable onPress={() => goToPage("active/vipPage")} style={styles.btnItem}>
          <Image
            source={require("@/assets/images/home/quick-access/vip.png")}
            style={imageStyle}
            resizeMode="contain"
          />
          <Text
            style={[styles.btnText, styles.btnLabelTruncate, { color: Colors[theme].text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            VIP
          </Text>
        </Pressable>
        <Pressable onPress={() => goToPage("active/beDealt")} style={styles.btnItem}>
          <Image
            source={require("@/assets/images/home/quick-access/todo.png")}
            style={imageStyle}
            resizeMode="contain"
          />
          <Text
            style={[styles.btnText, styles.btnLabelTruncate, { color: Colors[theme].text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t("pageName.beDealt")}
          </Text>
        </Pressable>
        <Pressable onPress={() => goToPage("my/reports")} style={styles.btnItem}>
          <Image
            source={require("@/assets/images/home/quick-access/report.png")}
            style={imageStyle}
            resizeMode="contain"
          />
          <Text
            style={[styles.btnText, styles.btnLabelTruncate, { color: Colors[theme].text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t("pageName.report")}
          </Text>
        </Pressable>
        <Pressable onPress={() => goToPage("my/tranctionsRecord")} style={styles.btnItem}>
          <Image
            source={require("@/assets/images/home/quick-access/trade.png")}
            style={imageStyle}
            resizeMode="contain"
          />
          <Text
            style={[styles.btnText, styles.btnLabelTruncate, { color: Colors[theme].text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t("pageName.trade")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

ToolTab.displayName = "ToolTab";
const styles = StyleSheet.create({
  container: {
    height: 50,
    marginHorizontal: rf(8),
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rf(6),
    marginVertical: rf(10),
  },
  buttonContainer: {
    height: 28,
  },
  leftButtonFirst: {
    marginRight: 10,
  },
  rightArea: {
    position: "absolute",
    right: 6,
    width: "50%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  btnItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    marginTop: 4,
    fontSize: fontTextSize,
  },
  btnLabelTruncate: {
    maxWidth: 52,
    textAlign: "center",
  },
});
