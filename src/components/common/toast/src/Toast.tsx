import { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  DeviceEventEmitter,
  Animated,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  Image,
} from "react-native";
import { ToastOptions } from "./constants";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { screen } from "@/utils/screen";
import Modal from "react-native-modal";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import { MAX_WIDTH } from "@/hooks/useMaxWidth";

const Toast = () => {
  const { width: winW, height: winH } = useWindowDimensions();
  const loadingOverlaySize = useMemo(() => {
    if (Platform.OS === "web") {
      const w = Math.min(MAX_WIDTH, winW);
      return {
        width: w,
        height: winH,
        ...(winW > MAX_WIDTH ? { alignSelf: "center" as const } : {}),
      };
    }
    return { width: winW, height: winH };
  }, [winW, winH]);

  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [toastOption, setToastOption] = useState<ToastOptions>({
    duration: 2000,
    //position: POSTION.BOTTOM,
    containerStyle: {},
    textStyle: {},
  });
  const { theme } = useTheme(); //主题

  const [state, setState] = useState("");

  const [showLoading, setShowLoading] = useState(false);

  const [style, setStyle] = useState<any>({ color: "#fff" });

  const hideModel = () => {
    setTimeout(() => {
      setVisible(false);
    }, 4000);
  };

  useEffect(() => {
    if (theme) {
      setStyle({ color: Colors[theme].text });
    }
  }, [theme]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener("showErrMsg", (data) => {
      if (data?.status === 500) {
        data.msg = t("errMsg.browser.500");
      }
      setMessage(data.msg);
      setState("error");
      setToastOption({ containerStyle: {}, textStyle: {} });
      setVisible(true);
      hideModel();
    });
    return () => subscription.remove(); // 组件卸载时清除
  }, [t]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener("showWarnMsg", (data) => {
      setMessage(data.msg);
      setState("warn");
      setToastOption({ containerStyle: {}, textStyle: {} });
      setVisible(true);
      hideModel();
    });
    return () => subscription.remove(); // 组件卸载时清除
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener("showSuccessMsg", (data) => {
      setMessage(data.msg);
      setState("success");
      setToastOption({ containerStyle: {}, textStyle: {} });
      setVisible(true);
      hideModel();
    });
    return () => subscription.remove(); // 组件卸载时清除
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener("showLoading", (data) => {
      const { isShow, style } = data;
      if (style) {
        setStyle(style);
      }
      setShowLoading(isShow);
    });
    return () => subscription.remove(); // 组件卸载时清除
  }, []);

  return (
    <View style={{ position: "absolute", top: 0, left: 0 }}>
      {visible && (
        <>
          <Modal
            useNativeDriver={false}
            isVisible={true}
            hasBackdrop={false}
            backdropOpacity={0}
            style={styles.modalOverlay}
          >
            {state === "success" ? (
              <Animated.View
                pointerEvents="none"
                style={[styles.successToastCard, toastOption?.containerStyle]}
              >
                <MaterialIcons name="check" size={46} color="#fff" />
                <Text style={[styles.successToastText, toastOption?.textStyle]}>{message}</Text>
              </Animated.View>
            ) : (
              <Animated.View pointerEvents="none" style={styles.toastWrap}>
                {(state === "error" || state === "warn") && (
                  <>
                    <Image
                      source={require("@/assets/images/common/notice-icon.png")}
                      style={styles.warningIcon}
                      resizeMode="contain"
                    />

                    <View
                      style={[
                        styles.toastCard,
                        { backgroundColor: Colors[theme].background },
                        toastOption?.containerStyle,
                      ]}
                    >
                      <Text
                        style={[
                          styles.toastTextNew,
                          { color: Colors[theme].text },
                          toastOption?.textStyle,
                        ]}
                      >
                        {message}
                      </Text>
                    </View>
                  </>
                )}
              </Animated.View>
            )}
          </Modal>
        </>
      )}
      {showLoading && (
        <Modal
          useNativeDriver={false}
          isVisible={true}
          hasBackdrop={false}
          backdropOpacity={0}
          style={[
            styles.modalOverlay,
            Platform.OS === "web" && winW > MAX_WIDTH && styles.loadingModalWebCenter,
          ]}
        >
          <View style={[styles.loadingBox, loadingOverlaySize]}>
            <ActivityIndicator size="large" color={style.color} />
          </View>
        </Modal>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    margin: 0,
    padding: 0,
  },
  /** PC Web：视口宽于内容区时，将加载层与指示器对齐到中间栏 */
  loadingModalWebCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  toastText: {
    marginLeft: 10,
    fontSize: 14,
  },
  loadingBox: {
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  toastWrap: {
    position: "absolute",
    alignSelf: "center",
    top: "46%",
    alignItems: "center",
  },
  warningIcon: {
    width: 86,
    height: 74,
    marginBottom: -25,
    transform: [{ translateY: 8 }],
    zIndex: 2,
  },
  toastCard: {
    minWidth: 250,
    maxWidth: 300,
    minHeight: 92,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  toastTextNew: {
    fontSize: 14,
    lineHeight: 28,
    textAlign: "center",
  },
  successToastCard: {
    position: "absolute",
    alignSelf: "center",
    top: "46%",
    minWidth: 180,
    maxWidth: 240,
    minHeight: 160,
    borderRadius: 12,
    backgroundColor: "rgba(28, 31, 38, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  successToastText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    textAlign: "center",
  },
});

export default Toast;
