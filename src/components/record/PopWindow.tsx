import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useDynamicMaxWidth } from "@/hooks/useMaxWidth";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import Modal from "react-native-modal";

type MaxHeightType = `${number}%` | number;

/** 面板：略长 + cubic；遮罩入场略短，避免面板 cubic-out 先停住、遮罩后半段还在变暗造成「已经出来了又黑一下」 */
const SHEET_ANIM_IN_MS = 400;
const SHEET_ANIM_OUT_MS = 340;
const BACKDROP_ANIM_IN_MS = 240;
const BACKDROP_ANIM_OUT_MS = 280;

interface PopProp {
  style?: any;
  isVisible: boolean;
  setIsVisible: Function;
  data: { title: string }[];
  onItemPress?: (index: number) => void;
  maxHeight?: MaxHeightType;
  selectedIndex: number;
  setSelectedIndex: Function;
  hideHeader?: boolean; // 是否隐藏头部(隐藏时点击选项要传对应的值出去)
}

const PopWindow = ({
  style,
  isVisible,
  setIsVisible,
  data,
  maxHeight = "50%",
  onItemPress,
  selectedIndex,
  setSelectedIndex,
  hideHeader = false,
}: PopProp) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const { maxWidth } = useDynamicMaxWidth();

  const [headerHeight, setHeaderHeight] = useState(56);
  const [pendingIndex, setPendingIndex] = useState(selectedIndex);

  const sheetHeight = useMemo(() => {
    if (typeof maxHeight === "number") return maxHeight;
    if (typeof maxHeight === "string") {
      const m = maxHeight.trim().match(/^([\d.]+)\s*%$/);
      if (m) return (windowHeight * parseFloat(m[1])) / 100;
    }
    return windowHeight * 0.5;
  }, [maxHeight, windowHeight]);

  const sheetAnimationIn = useMemo(
    () => ({
      from: { translateY: windowHeight },
      to: { translateY: 0 },
      easing: Easing.out(Easing.cubic),
    }),
    [windowHeight],
  );

  const sheetAnimationOut = useMemo(
    () => ({
      from: { translateY: 0 },
      to: { translateY: windowHeight },
      easing: Easing.in(Easing.cubic),
    }),
    [windowHeight],
  );

  const maxListViewport = useMemo(
    () => Math.max(120, sheetHeight - headerHeight),
    [sheetHeight, headerHeight],
  );

  const DEFAULT_ITEM_HEIGHT = 56;
  const [listContentHeight, setListContentHeight] = useState(0);

  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const scrollOffsetRef = useRef(0);
  const contentHeightRef = useRef(0);
  const listHeightRef = useRef(0);
  const itemHeightRef = useRef(DEFAULT_ITEM_HEIGHT);
  const pendingIndexRef = useRef(selectedIndex);

  const applyListContentHeight = useCallback((raw: number) => {
    if (raw <= 0) return;
    const h = Math.ceil(raw) + 2;
    contentHeightRef.current = Math.max(contentHeightRef.current, h);
    setListContentHeight((prev: number) => Math.max(prev, h));
  }, []);

  const listViewportHeight = useMemo(() => {
    const measuredOrEstimated =
      listContentHeight > 0
        ? listContentHeight
        : data.length * Math.max(DEFAULT_ITEM_HEIGHT, itemHeightRef.current);
    return Math.min(maxListViewport, measuredOrEstimated);
  }, [listContentHeight, maxListViewport, data.length]);

  const maxScrollOffset = useCallback(
    () => Math.max(0, contentHeightRef.current - listHeightRef.current),
    [],
  );

  const scrollListToOffset = useCallback(
    (offset: number, animated: boolean) => {
      const maxO = maxScrollOffset();
      const clamped = Math.max(0, Math.min(maxO, offset));
      scrollOffsetRef.current = clamped;
      scrollRef.current?.scrollTo({ y: clamped, animated });
    },
    [maxScrollOffset],
  );

  useEffect(() => {
    pendingIndexRef.current = pendingIndex;
  }, [pendingIndex]);

  useEffect(() => {
    if (!isVisible) return;
    pendingIndexRef.current = selectedIndex;
    setPendingIndex(selectedIndex);
    const h = itemHeightRef.current;
    const runScroll = () => {
      const target = Math.min(maxScrollOffset(), Math.max(0, selectedIndex * h));
      scrollListToOffset(target, false);
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(runScroll);
    });
  }, [isVisible, selectedIndex, maxScrollOffset, scrollListToOffset]);

  const handleSelectItem = (index: number) => {
    const prev = pendingIndexRef.current;
    const delta = index - prev;
    pendingIndexRef.current = index;
    setPendingIndex(index);
    if (delta === 0) return;
    const step = itemHeightRef.current;
    const target = scrollOffsetRef.current + delta * step;
    requestAnimationFrame(() => {
      scrollListToOffset(target, true);
    });
    if (hideHeader) {
      handleConfirm(index);
    }
  };

  const onListScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
  };

  const onScrollViewLayout = (e: LayoutChangeEvent) => {
    listHeightRef.current = e.nativeEvent.layout.height;
  };

  const onScrollContentSizeChange = (_: number, h: number) => {
    applyListContentHeight(h);
  };

  const onListColumnLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    applyListContentHeight(h);
  };

  // 仅随数据变化重置高度；不要在 isVisible 变为 true 时清零，否则 Android 每次打开会先按估算高度画一帧再被 onLayout 拉大，表现为闪一下。
  useEffect(() => {
    setListContentHeight(0);
    contentHeightRef.current = 0;
  }, [data.length]);

  const captureItemHeight = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) itemHeightRef.current = h;
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  const handleConfirm = (index?: number) => {
    // 只通过 onItemPress 提交：父组件已在此回调里更新选中项；再调 setSelectedIndex 会重复 setState，
    // 且部分页面误传 types[index-1] 会导致 iOS 上连续两次变更（列表/请求跳两次）。
    onItemPress?.(index ?? pendingIndex);
    setIsVisible(false);
  };

  const styles = StyleSheet.create({
    modal: {
      padding: 0,
      justifyContent: "flex-end",
      overflow: "hidden",
      margin: 0,
      alignItems: "center",
    },
    contentStyle: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      width: "100%",
      maxWidth,
    },
    sheetColumn: {
      flexDirection: "column",
      flexShrink: 1,
    },
    gestureRoot: {
      width: "100%",
    },
    headerRow: {
      marginTop: 16,
      marginHorizontal: 16,
      marginBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    listWrap: {
      width: "100%",
      minHeight: 0,
      overflow: "hidden",
    },
    scrollView: {
      flexGrow: 0,
      flexShrink: 1,
      width: "100%",
    },
    itemContainer: {
      flexDirection: "row",
      justifyContent: "center",
      padding: 15,
    },
    text: {
      fontSize: 14,
      textAlignVertical: "center",
      textAlign: "left",
      maxWidth: "70%",
    },
    checkmark: {
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors[theme].primary,
    },
  });

  return (
    <Modal
      isVisible={isVisible}
      style={[styles.modal, style]}
      backdropOpacity={0.5}
      onBackdropPress={handleCancel}
      onModalHide={handleCancel}
      animationIn={sheetAnimationIn}
      animationOut={sheetAnimationOut}
      animationInTiming={SHEET_ANIM_IN_MS}
      animationOutTiming={SHEET_ANIM_OUT_MS}
      backdropTransitionInTiming={BACKDROP_ANIM_IN_MS}
      backdropTransitionOutTiming={BACKDROP_ANIM_OUT_MS}
      // slide + cubic 缓动走原生驱动，与遮罩时长对齐，进出更顺
      useNativeDriver
      // true 时入场/出场会暂时卸掉子树，Android 上常与 slideInUp 叠出「闪一下」；统一关掉更稳
      hideModalContentWhileAnimating={false}
      statusBarTranslucent={Platform.OS === "android"}
    >
      {/*
        勿设 swipeDirection：与内部纵向 ScrollView 抢手势时，PanResponder 会改遮罩透明度，松手又拉回 → 像「又黑一下」。
        关闭：点遮罩 / 取消 / 确定。
      */}
      <GestureHandlerRootView
        style={[
          styles.sheetColumn,
          styles.gestureRoot,
          {
            maxWidth,
            maxHeight: sheetHeight,
            backgroundColor: Colors[theme].background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: "hidden",
          },
        ]}
      >
        <View
          style={[
            styles.contentStyle,
            { backgroundColor: Colors[theme].background, overflow: "hidden" },
          ]}
        >
          {!hideHeader && (
            <View
              style={styles.headerRow}
              onLayout={(e) => {
                const h = e.nativeEvent.layout.height;
                if (h > 0) setHeaderHeight(h);
              }}
            >
              <Pressable onPress={handleCancel}>
                <Text className={`text-${theme}-lightText`}>{t("common.cancel")}</Text>
              </Pressable>
              <Pressable onPress={() => handleConfirm()}>
                <Text className={`text-${theme}-text`}>{t("common.confirm")}</Text>
              </Pressable>
            </View>
          )}
          <View style={[styles.listWrap, { height: listViewportHeight }]}>
            <ScrollView
              ref={scrollRef}
              className="hide-scrollbar"
              style={[
                styles.scrollView,
                {
                  height: listViewportHeight,
                  maxHeight: listViewportHeight,
                  ...(Platform.OS === "web" ? { overflowY: "scroll" as const } : {}),
                },
              ]}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              scrollEnabled
              bounces
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              onScroll={onListScroll}
              scrollEventThrottle={16}
              onLayout={onScrollViewLayout}
              onContentSizeChange={onScrollContentSizeChange}
            >
              <View collapsable={false} onLayout={onListColumnLayout}>
                {data.map((item, index) => (
                  <Pressable
                    key={`${item.title}-${index}`}
                    style={styles.itemContainer}
                    onPress={() => handleSelectItem(index)}
                    onLayout={index === 0 ? captureItemHeight : undefined}
                  >
                    <Text
                      style={styles.text}
                      className={`text-${theme}-${pendingIndex === index ? "primary" : "text"}`}
                    >
                      {t(item.title)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default PopWindow;
