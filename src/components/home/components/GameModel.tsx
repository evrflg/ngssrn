import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useDynamicMaxWidth } from "@/hooks/useMaxWidth";
import { RootState } from "@/store/store";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Modal from "react-native-modal";
import WebView from "react-native-webview";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FloatingButton from "./FloatBtn";
import RefreshButton from "./RefreshButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { clearGameNeedPopupScheduleTimers } from "@/components/home/utils/util";
import { getFinanceMoney } from "@/api";
import { gameModalScreenshotRootRef } from "@/utils/gameModalScreenshotRootRef";

const isWeb = Platform.OS === "web";

const GameModel = () => {
  const { maxWidth } = useDynamicMaxWidth();
  const showGameModel = useSelector((state: RootState) => state?.game?.isShowGameModel);
  const isLogin = useSelector((state: RootState) => Boolean(state?.user?.userInfo?.isLogin));
  const gameData: any = useSelector((state: RootState) => state?.game?.gameWebViewData);
  const { theme } = useTheme();
  const [webContainerLoaded, setWebContainerLoaded] = useState(false);
  const [webContentReady, setWebContentReady] = useState(false);
  const insets = useSafeAreaInsets();

  const gameUrl = gameData?.url;

  useEffect(() => {
    setWebContainerLoaded(false);
    setWebContentReady(false);
  }, [showGameModel, gameUrl]);

  useEffect(() => {
    if (!showGameModel) {
      gameModalScreenshotRootRef.current = null;
      clearGameNeedPopupScheduleTimers();
    }
    if(showGameModel) {
      console.log("#10",showGameModel)
      //每15秒执行一次，关闭游戏时清除定时器
      const timer = setInterval(() => {
         getFinanceMoney();
      }, 15000);
      return () => clearInterval(timer);
    }
  }, [showGameModel]);

  useEffect(() => {
    if (!webContainerLoaded || webContentReady) return;
    const timer = setTimeout(() => setWebContentReady(true), 1200);
    return () => clearTimeout(timer);
  }, [webContainerLoaded, webContentReady]);

  const palette = Colors[theme];
  const showLoading = !webContentReady;

  return (
    <View>
      <Modal
        animationIn={"slideInUp"}
        isVisible={showGameModel}
        backdropOpacity={0.5}
        style={[styles.modal, { backgroundColor: palette.background }]}
      >
        <View
          ref={gameModalScreenshotRootRef}
          collapsable={false}
          style={styles.gameModalContent}
        >
          <GestureHandlerRootView
            style={[
              styles.iframeBox,
              {
                position: "relative",
                width: maxWidth,
                paddingTop: Platform.OS === "ios" ? insets.top : 0,
                paddingBottom: isWeb ? 0 : insets.bottom,
                paddingLeft: isWeb ? 0 : insets.left,
                paddingRight: isWeb ? 0 : insets.right,
              },
            ]}
          >
            {isWeb ? (
              <iframe
                id="iframeMainid"
                name="iframeMain"
                style={styles.viewBox}
                src={gameUrl}
                onLoad={() => setWebContainerLoaded(true)}
              />
            ) : (
              /**
               * Android：`captureRef` 截父级位图时，默认硬件层 WebView 往往不会画进 Bitmap → 白屏。
               * `androidLayerType="software"` 让内容走软件绘制，便于 view-shot 合成（略耗内存）。
               */
              <View style={styles.viewBox} collapsable={false}>
                <WebView
                  style={StyleSheet.absoluteFillObject}
                  javaScriptEnabled={true}
                  sharedCookiesEnabled={true}
                  thirdPartyCookiesEnabled={true}
                  injectedJavaScript={`window.isFromRn = true;`}
                  injectedJavaScriptBeforeContentLoaded={`
                  window.isFromRn = true;
                  true;
                `}
                  mixedContentMode={"always"}
                  scalesPageToFit={true}
                  useWebKit={true}
                  source={{ uri: gameUrl }}
                  onLoadEnd={() => setWebContainerLoaded(true)}
                  {...(Platform.OS === "android"
                    ? ({ androidLayerType: "software" } as const)
                    : {})}
                />
              </View>
            )}
            {showLoading && (
              <View style={[styles.loadingMask, { backgroundColor: "#000" }]}>
                <ActivityIndicator size="large" color={palette.tint} />
              </View>
            )}
            <FloatingButton />
          </GestureHandlerRootView>
          {/** Modal 在原生层盖在全屏 app 上，截图条必须画在本 Modal 内并铺满全屏，否则对不齐左缘/被档 */}
          {!isWeb&&showGameModel && isLogin ? (
            <View
              style={StyleSheet.absoluteFillObject}
              pointerEvents="box-none"
              collapsable={false}
            >
              <RefreshButton />
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  modal: {
    margin: 0,
    flex: 1,
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  gameModalContent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    position: "relative",
  },
  iframeBox: {
    height: "100%",
  },
  viewBox: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderWidth: 0,
  },
  loadingMask: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
});

export default GameModel;
