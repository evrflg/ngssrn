import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import patch from "@/api/PatchVersion";
import { useCommon } from "@/hooks/CommonProvider";

const isWeb = Platform.OS === "web";
const isIOS = Platform.OS === "ios";
const isAndroid = Platform.OS === "android";
const baseReedPath = "/share/community/";
const CLOSE_EVENT = "reed-close";
const READY_EVENT = "reed-ready";

const parseEventType = (rawData: unknown): string | null => {
  if (typeof rawData === "string") {
    if (rawData === CLOSE_EVENT || rawData === READY_EVENT) return rawData;
  } else {
    return null;
  }

  try {
    const payload = JSON.parse(rawData);
    if (typeof payload === "string") {
      return payload;
    }
    return payload?.type || payload?.event || payload?.action || null;
  } catch {
    return rawData;
  }
};

const isCloseEvent = (rawData: unknown) => parseEventType(rawData) === CLOSE_EVENT;

const isReadyEvent = (rawData: unknown) => {
  return parseEventType(rawData) === READY_EVENT;
};

const styles = StyleSheet.create({
  loadingMask: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

// 加载中组件
const LoadingComponent = ({ toType }: { toType: string }) => {
  const backgroundColorMap: Record<string, { backgroundColor: string; color: string }> = {
    luckyWheel: { backgroundColor: "#000", color: "#fff" },
    redpackeTrain: { backgroundColor: "#000", color: "#fff" },
    coinWallet: { backgroundColor: "#fff", color: "#000" },
    coinWalletSetting: { backgroundColor: "#fff", color: "#000" },
    chatRoom: { backgroundColor: "#fff", color: "#000" },
    customerService: { backgroundColor: "#fff", color: "#000" },
  };

  // 根据社区类型设置背景颜色
  const typeColor = backgroundColorMap[toType] || { backgroundColor: "#fff", color: "#000" };

  return (
    <View style={[styles.loadingMask, { backgroundColor: typeColor.backgroundColor }]}>
      <ActivityIndicator size="large" color={typeColor.color} />
    </View>
  );
};

export default function ReedLayout() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userInfo = useSelector((state: RootState) => state?.user?.userInfo);
  const session = useSelector((state: RootState) => state?.user?.session);
  const [webContentReady, setWebContentReady] = useState(false);
  const [webContainerLoaded, setWebContainerLoaded] = useState(false);
  const uaSuffix = isIOS ? "ios-rn" : isAndroid ? "android-rn" : undefined;
  const { language } = useCommon();

  // 检查登录状态
  useFocusEffect(
    useCallback(() => {
      if (JSON.stringify(userInfo) === "{}") return;
      if (!userInfo?.isLogin) router.push("/login");
    }, [userInfo?.isLogin, router]),
  );

  // 处理桥接消息
  const handleBridgeMessage = useCallback(
    (rawData: unknown) => {
      if (isCloseEvent(rawData)) {
        router.back();
        return;
      }
      if (isReadyEvent(rawData)) {
        setWebContentReady(true);
      }
    },
    [router],
  );

  // Web 端监听 iframe postMessage: window.parent.postMessage("reed-close", "*")
  useEffect(() => {
    if (!isWeb) return;

    const handleMessage = (event: MessageEvent) => {
      handleBridgeMessage(event?.data);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleBridgeMessage]);

  // 构建带 token 的完整 URL（始终带域名）
  const reedUrl = useMemo(() => {
    // 获取域名
    const baseUrl =
      isWeb && typeof window !== "undefined"
        ? __DEV__
          ? patch.webDomainUseApp
          : window.location.origin
        : patch.DOMAIN_URL || "";

    // 域名 + reed的线上路径
    const fullBaseReedUrl = `${baseUrl}${baseReedPath}`;

    // 构建查询参数
    const query = new URLSearchParams();
    query.set("isRn", "true");
    if (session?.accessToken) {
      query.set("token", String(session.accessToken));
      query.set("clientType", isIOS ? "5" : isAndroid ? "4" : "3");
    }
    query.set("lang", language);

    // 添加社区类型
    const communityType = params.toType as string;
    if (communityType) {
      query.set("type", communityType);
    }

    return `${fullBaseReedUrl}?${query.toString()}`;
  }, [params.toType, session?.accessToken, language]);

  // URL 变化后重置 ready 状态
  useEffect(() => {
    setWebContainerLoaded(false);
    setWebContentReady(false);
  }, [reedUrl]);

  // 兜底：load 完成后若未收到 reed-ready，1.2s 后也结束 loading
  useEffect(() => {
    if (!webContainerLoaded || webContentReady) return;
    const timer = setTimeout(() => setWebContentReady(true), 1200);
    return () => clearTimeout(timer);
  }, [webContainerLoaded, webContentReady]);

  // 保持 Hook 顺序稳定后，再根据登录态决定是否渲染
  if (!userInfo?.isLogin) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1">
      <View className={`flex-1`}>
        {isWeb ? (
          <>
            <iframe
              src={reedUrl}
              onLoad={() => setWebContainerLoaded(true)}
              style={{ width: "100%", height: "100%", border: 0 }}
            />
            {!webContentReady && <LoadingComponent toType={params.toType as string} />}
          </>
        ) : (
          <>
            <WebView
              source={{ uri: reedUrl }}
              javaScriptEnabled={true}
              sharedCookiesEnabled={true}
              domStorageEnabled={true}
              thirdPartyCookiesEnabled={true}
              originWhitelist={["*"]}
              applicationNameForUserAgent={uaSuffix}
              mixedContentMode="always"
              onLoadEnd={() => setWebContainerLoaded(true)}
              onMessage={(event) => {
                handleBridgeMessage(event?.nativeEvent?.data);
              }}
              style={{ flex: 1 }}
            />
            {!webContentReady && <LoadingComponent toType={params.toType as string} />}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
