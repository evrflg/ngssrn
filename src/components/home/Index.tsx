import { RootState } from "@/store/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DeviceEventEmitter,
  FlatList,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";
import { RefreshControl as WebRefreshControl } from "react-native-web-refresh-control";
import { RefreshControl as NativeRefreshControl } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getScrollBottomSpacer } from "@/config/layout/scrollBottomSpacer";
import { useSelector } from "react-redux";
import { selectBottomNavigationType } from "@/store/user/selfConfig";
import { BottomArea } from "./BottomArea";
import BottomFloatArea from "./BottomFloatArea";
import { CarouselBlock } from "./CarouselBlock";
import { GameArea } from "./GameArea";
import { IndexHeader } from "./IndexHeader";
import { GameArea2 } from "./type2/GameArea2";
import { ToolTab } from "./type2/ToolTab";
import { Wins } from "./Wins";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useHomePullToRefresh } from "./components/useHomePullToRefresh";
type ScrollTargetRef = {
  scrollTo: (options: { x?: number; y?: number; animated?: boolean }) => void;
};
type HomeListItem = "header" | "carousel" | "gameArea" | "wins" | "bottom";

export const Index = () => {
  const { refreshing, onRefresh } = useHomePullToRefresh();
  const [isToBottom, setIsToBottom] = useState(false);
  const [isShowToTop, setIsShowToTop] = useState(false);
  const isToBottomRef = useRef(false);
  const isShowToTopRef = useRef(false);
  const floatScrollingRef = useRef(false);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const RefreshControlImpl = Platform.OS === "web" ? WebRefreshControl : NativeRefreshControl;
  const floatScrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flatListRef = useRef<FlatList<HomeListItem> | null>(null);
  const scrollViewRef = useRef<ScrollTargetRef | null>(null);
  const indexGame: any = useSelector((state: RootState) => state?.selfConfig?.indexGame);
  const bottomNavType = useSelector(selectBottomNavigationType);
  const listData = useMemo<HomeListItem[]>(
    () => ["header", "carousel", "gameArea", "wins", "bottom"],
    [],
  );

  const bindFlatListRef = useCallback((ref: FlatList<HomeListItem> | null) => {
    flatListRef.current = ref;
    scrollViewRef.current = ref
      ? {
          scrollTo: ({ y = 0, animated = true }) => {
            ref.scrollToOffset({ offset: y, animated });
          },
        }
      : null;
  }, []);

  const renderListItem = useCallback(
    ({ item }: { item: HomeListItem }) => {
      if (item === "header") return <IndexHeader />;
      if (item === "carousel") return <CarouselBlock />;
      if (item === "gameArea") {
        return (
          <>
            {indexGame == 1 && <GameArea />}
            {indexGame == 2 && (
              <>
                <ToolTab />
                <GameArea2 />
              </>
            )}
          </>
        );
      }
      if (item === "wins") return <Wins />;
      return <BottomArea />;
    },
    [indexGame],
  );

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!floatScrollingRef.current) {
      floatScrollingRef.current = true;
      DeviceEventEmitter.emit("home-scroll-active", { active: true });
    }
    if (floatScrollEndTimerRef.current) {
      clearTimeout(floatScrollEndTimerRef.current);
    }
    floatScrollEndTimerRef.current = setTimeout(() => {
      floatScrollingRef.current = false;
      DeviceEventEmitter.emit("home-scroll-active", { active: false });
      floatScrollEndTimerRef.current = null;
    }, 140);

    const offsetY = event.nativeEvent.contentOffset.y;
    const layoutMeasurement = event.nativeEvent.layoutMeasurement;
    const contentSize = event.nativeEvent.contentSize;

    const nextIsToBottom = layoutMeasurement.height + offsetY >= contentSize.height - 100;
    if (isToBottomRef.current !== nextIsToBottom) {
      isToBottomRef.current = nextIsToBottom;
      setIsToBottom(nextIsToBottom);
    }

    const nextShowToTop = offsetY > 300;
    if (isShowToTopRef.current !== nextShowToTop) {
      isShowToTopRef.current = nextShowToTop;
      setIsShowToTop(nextShowToTop);
    }
  }, []);

  const handleScrollEnd = useCallback(() => {
    if (floatScrollEndTimerRef.current) {
      clearTimeout(floatScrollEndTimerRef.current);
      floatScrollEndTimerRef.current = null;
    }
    if (floatScrollingRef.current) {
      floatScrollingRef.current = false;
      DeviceEventEmitter.emit("home-scroll-active", { active: false });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (floatScrollEndTimerRef.current) {
        clearTimeout(floatScrollEndTimerRef.current);
      }
      DeviceEventEmitter.emit("home-scroll-active", { active: false });
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <View style={styles.pageInner}>
        <View style={styles.containerBox}>
          <FlatList
            data={listData}
            keyExtractor={(item) => item}
            renderItem={renderListItem}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            className="hide-scrollbar"
            ref={bindFlatListRef}
            // 与首页内嵌的竖向列表（如 GameArea2）同时可滚：仅 Android 生效，iOS/Web 为 noop 也无害
            nestedScrollEnabled
            stickyHeaderIndices={[0]} // 设置要固定的子组件索引
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControlImpl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors[theme].primary]}
                tintColor={Colors[theme].primary}
                title={t("common.loading")}
                titleColor={Colors[theme].text}
              />
            }
            onScroll={handleScroll}
            onScrollEndDrag={handleScrollEnd}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={100}
            ListFooterComponent={() => (
              <View
                style={{
                  height: getScrollBottomSpacer(bottomNavType) as any,
                }}
              />
            )}
          />
        </View>
        <BottomFloatArea
          isShowToTop={isShowToTop}
          isToBottom={isToBottom}
          scrollViewRef={scrollViewRef}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
    position: "relative",
  },
  pageInner: {
    flex: 1,
    position: "relative",
  },
  containerBox: {
    flex: 1,
    position: "relative",
  },
  contentContainer: {},
});
