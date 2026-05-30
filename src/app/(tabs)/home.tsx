import { AutoUpdateView } from "@/components/common/AutoUpdateView";
import { Colors } from "@/constants/Colors";
import AppDownBtn from "@/components/home/components/AppDownBtn";
import EntryBar from "@/components/home/components/EntryBar";
import { Skeleton } from "@/components/home/components/Skeleton";
import { Index } from "@/components/home/Index";
import { Index3 } from "@/components/home/Index3";
import HomePopup from "@/components/home/popup";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { RootState } from "@/store/store";
import { useIsFocused } from "@react-navigation/native";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  NativeModules,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  initialWindowMetrics,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { screen } from "@/utils/screen";
import { MAX_WIDTH } from "@/hooks/useMaxWidth";
import GameTipPopup from "@/components/home/components/popup/GameTipPopup";
import TestUserPopup from "@/components/home/components/popup/TestUserPopup";

const isPCWeb = Platform.OS === "web" && screen.get("window").width >= MAX_WIDTH;
const isWeb = Platform.OS === "web";

/** 原生：SafeAreaView 依赖的首帧 context 在 replace 后可能短时间全 0；与 initialMetrics 取 max 立刻留出状态栏/刘海 */
function useNativeHomeSafePadding() {
  const insets = useSafeAreaInsets();
  const initial = initialWindowMetrics?.insets;

  return useMemo(() => {
    if (Platform.OS === "web") return { top: 0, bottom: 0 };

    let top = Math.max(insets.top, initial?.top ?? 0);
    let bottom = Math.max(insets.bottom, initial?.bottom ?? 0);

    if (top <= 0 && Platform.OS === "ios") {
      const mgr = NativeModules.StatusBarManager as
        | { HEIGHT?: number; getHeight?: (cb: (h: number) => void) => void }
        | undefined;
      const h = mgr?.HEIGHT;
      top = typeof h === "number" && h > 0 ? h : 47;
    }
    if (top <= 0 && Platform.OS === "android") {
      top = StatusBar.currentHeight ?? 0;
    }

    return { top, bottom };
  }, [insets.top, insets.bottom, initial?.top, initial?.bottom]);
}


function HomeScreenRoot({
  theme,
  children,
}: {
  theme: string;
  children: ReactNode;
}) {
  const pad = useNativeHomeSafePadding();
  useEffect(()=>{
    if(isWeb && window?.location){
      //如何url包含fromPwa=true，则设置(window as any).isFromPwa = true
      if(window?.location?.search?.includes('fromPwa=true')){
        if(window){
          (window as any).isFromPwa = true;
        }
      }
    }
  },[])
  if (isWeb) {
    return (
      <SafeAreaView
        edges={{ top: "additive", bottom: "off" }}
        style={{
          backgroundColor: Colors[theme as keyof typeof Colors].background,
        }}
        className="flex-1"
      >
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors[theme as keyof typeof Colors].background,
        paddingTop: pad.top,
        paddingBottom: pad.bottom,
      }}
    >
      {children}
    </View>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const contentWidth = isPCWeb ? Math.min(width, MAX_WIDTH) : width;
  const skeletonWidth = contentWidth / 3 - 14;
  const gameSkeletonHeight = isPCWeb ? 190 : 160;
  const { theme } = useTheme();
  const { indexGame, loaded } = useSelector((state: RootState) => state?.selfConfig);
  const gameList = useSelector((state: RootState) => state?.game?.gameList);
  // 是否在游戏中
  const isShowGameModel = useSelector((s: RootState) => s.game.isShowGameModel);
  const isFocused = useIsFocused();
  const [showHomeSkeleton, setShowHomeSkeleton] = useState(true);
  const [skeletonSettled, setSkeletonSettled] = useState(false);

  useEffect(() => {
    if (!loaded || skeletonSettled) return;

    if (Array.isArray(gameList) && gameList.length > 0) {
      setShowHomeSkeleton(false);
      setSkeletonSettled(true);
      return;
    }

    setShowHomeSkeleton(true);
    const timer = setTimeout(() => {
      setShowHomeSkeleton(false);
      setSkeletonSettled(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [loaded, gameList, skeletonSettled]);

  const skeletonList = useMemo(() => {
    return Array.from({ length: 5 }).map((_, index: number) => (
      <View key={index} style={styles.gameItem}>
        <Skeleton width={skeletonWidth} height={gameSkeletonHeight} />
        <Skeleton width={skeletonWidth} height={gameSkeletonHeight} />
        <Skeleton width={skeletonWidth} height={gameSkeletonHeight} />
      </View>
    ));
  }, [gameSkeletonHeight, skeletonWidth]);

  // fetPersonalization pending 时 loaded 会短暂为 false；若 return null 整页不渲染，会露出导航层默认浅色（白），
  // 与个人中心（SafeArea 始终带 theme.background）不一致
  if (!loaded) {
    return (
      <HomeScreenRoot theme={theme}>
        <View style={styles.loadingPlaceholder} />
      </HomeScreenRoot>
    );
  }

  if (showHomeSkeleton) {
    return (
      <HomeScreenRoot theme={theme}>
        <View className="flex-1 items-center">
          <View style={{ width: contentWidth }}>
            <Skeleton width={contentWidth} height={56} />
          </View>
          <View style={{ width: contentWidth - 24, marginTop: 12 }}>
            <Skeleton width={contentWidth - 24} height={150} />
          </View>
          <View style={{ width: contentWidth, marginTop: 12 }}>{skeletonList}</View>
        </View>
      </HomeScreenRoot>
    );
  }

  return (
    <HomeScreenRoot theme={theme}>
      <View id="home-root" className="flex-1">
        {(indexGame == 1 || indexGame == 2) && <Index />}
        {(indexGame == 3 || indexGame == 4 || indexGame == 5) && <Index3 />}
      </View>
      {isFocused && !isShowGameModel && <HomePopup />}
      {!isWeb && <AutoUpdateView />}
      {isWeb && <AppDownBtn />}
      
      {isFocused && <EntryBar />}
      {isFocused && <GameTipPopup />}
      
    </HomeScreenRoot>
  );
}

const styles = StyleSheet.create({
  loadingPlaceholder: {
    flex: 1,
  },
  gameItem: {
    marginHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
