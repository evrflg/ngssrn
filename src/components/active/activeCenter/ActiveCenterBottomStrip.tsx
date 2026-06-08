// 活动中心底部卡片组件
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import AutoImage from "@/components/common/AutoImage";
import RectangleIcon from "@/components/icons/active/menu/RectangleIcon";
import { activeIntroduction } from "@/components/active/activeConfg";
import { useTheme } from "@/hooks/theme/ThemeProvider";

const BOTTOM_STRIP_CARD_GAP = 8;
const BOTTOM_STRIP_EDGE_EPS = 1;

type CardListItem = {
  id: number;
  activityType: number;
  activityName: string;
  coverImageURL: any;
  introduction?: string;
  showText?: number;
  status?: number;
};

type BottomStripActivityCardProps = {
  image: any;
  text: string;
  id: number;
  type: number;
  index: number;
  actDepositType?: number;
  introduction?: string;
  showText?: number;
  cardInnerWidth: number;
  coverImgH: number;
  isLast: boolean;
  isSelected: boolean;
  isWideScreen: boolean;
  primaryColor: string;
  onCardSelect: (
    id: number,
    index: number,
    text: string,
    type: number,
    actDepositType?: number,
  ) => void;
};

const BottomStripActivityCard = React.memo(function BottomStripActivityCard({
  image,
  text,
  id,
  type,
  index,
  actDepositType,
  introduction,
  showText,
  cardInnerWidth,
  coverImgH,
  isLast,
  isSelected,
  isWideScreen,
  primaryColor,
  onCardSelect,
}: BottomStripActivityCardProps) {
  const imageStyles = useMemo(
    () => [styles.cardImage, { height: coverImgH }],
    [coverImgH],
  );

  const onPress = useCallback(() => {
    onCardSelect(id, index, text, type, actDepositType);
  }, [onCardSelect, id, index, text, type, actDepositType]);

  return (
    <Pressable
      style={[
        styles.cardContainer,
        { width: cardInnerWidth, marginRight: isLast ? 0 : BOTTOM_STRIP_CARD_GAP },
      ]}
      onPress={onPress}
    >
      <View
        className="w-full justify-center items-center"
        style={
          isSelected
            ? {
              padding: 4,
              borderWidth: 1,
              borderRadius: 10,
              borderColor: primaryColor,
            }
            : undefined
        }
      >
        <AutoImage
          uri={image}
          imageStyle={imageStyles}
          viewStyle={imageStyles}
          defaultIsSvg={true}
          slotWidth={cardInnerWidth}
          slotHeight={coverImgH}
        />
        {showText === 0 && introduction ? (
          <Text
            className="px-2 self-start"
            style={{
              position: "absolute",
              top: isWideScreen ? 5 : 4,
              fontSize: 10,
              padding: 5,
              lineHeight: 10,
              fontWeight: 300,
              color: "#ffffff",
              textShadowColor: "rgba(0, 0, 0, 0.5)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}
            numberOfLines={4}
            ellipsizeMode="tail"
          >
            {activeIntroduction(introduction)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
});

export function ActiveCenterBottomStrip({
  cardList,
  bottomCardStride,
  bottomCardW,
  bottomCardImgH,
  viewportW,
  selectedId,
  selectedType,
  isWideScreen,
  primaryColor,
  arrowColor,
  arrowBgColor,
  onSelect,
  containerStyle,
}: {
  cardList: CardListItem[];
  bottomCardStride: number;
  bottomCardW: number;
  bottomCardImgH: number;
  viewportW: number;
  selectedId: number;
  selectedType: number;
  isWideScreen: boolean;
  primaryColor: string;
  arrowColor: string;
  arrowBgColor: string;
  onSelect: (args: {
    id: number;
    text: string;
    type: number;
    actDepositType?: number;
  }) => void;
  containerStyle?: any;
}) {
  const listRef = useRef<FlatList<any>>(null);
  const scrollXRef = useRef(0);
  const webDragCleanupRef = useRef<null | (() => void)>(null);
  const suppressClickUntilRef = useRef(0);
  const [listW, setListW] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [isWebDragging, setIsWebDragging] = useState(false);

  const viewportForMax = listW > 0 ? listW : viewportW;
  const bottomStripMaxX = useMemo(() => {
    const n = cardList.length;
    if (n <= 0 || viewportForMax <= 0) return 0;
    const totalW = (n - 1) * bottomCardStride + bottomCardW;
    return Math.max(0, totalW - viewportForMax);
  }, [cardList.length, viewportForMax, bottomCardStride, bottomCardW]);

  const showLeftArrow =
    bottomStripMaxX > BOTTOM_STRIP_EDGE_EPS && scrollX > BOTTOM_STRIP_EDGE_EPS;
  const showRightArrow =
    bottomStripMaxX > BOTTOM_STRIP_EDGE_EPS &&
    scrollX < bottomStripMaxX - BOTTOM_STRIP_EDGE_EPS;
  // 选中项的索引
  const selectedIndex = useMemo(
    () =>
      cardList.findIndex(
        (item) =>
          Number(item.id) === Number(selectedId) &&
          Number(item.activityType) === Number(selectedType),
      ),
    [cardList, selectedId, selectedType],
  );

  useEffect(() => {
    if (!listRef.current || selectedIndex < 0) return;
    const targetOffset = Math.max(
      0,
      Math.min(bottomStripMaxX, selectedIndex * bottomCardStride),
    );
    listRef.current.scrollToOffset({ offset: targetOffset, animated: false });
    scrollXRef.current = targetOffset;
    setScrollX(targetOffset);
  }, [selectedIndex, bottomStripMaxX, bottomCardStride, listW, viewportW]);

  const stopWebDrag = useCallback(() => {
    if (webDragCleanupRef.current) {
      webDragCleanupRef.current();
      webDragCleanupRef.current = null;
    }
    setIsWebDragging(false);
  }, []);

  useEffect(() => {
    return () => {
      stopWebDrag();
    };
  }, [stopWebDrag]);

  const onArrowLeft = useCallback(() => {
    const x = scrollXRef.current;
    if (x <= BOTTOM_STRIP_EDGE_EPS || !listRef.current) return;
    const step = bottomCardStride;
    if (x < 2 * step) {
      listRef.current.scrollToOffset({ offset: 0, animated: true });
      return;
    }
    const nx = Math.max(0, x - step);
    listRef.current.scrollToOffset({ offset: nx, animated: true });
  }, [bottomCardStride]);

  const onArrowRight = useCallback(() => {
    const maxX = bottomStripMaxX;
    if (maxX <= BOTTOM_STRIP_EDGE_EPS || !listRef.current) return;
    const x = scrollXRef.current;
    if (x >= maxX - BOTTOM_STRIP_EDGE_EPS) return;
    const step = bottomCardStride;
    const remainRight = maxX - x;
    if (remainRight < 2 * step) {
      listRef.current.scrollToOffset({ offset: maxX, animated: true });
      return;
    }
    const nx = Math.min(maxX, x + step);
    listRef.current.scrollToOffset({ offset: nx, animated: true });
  }, [bottomStripMaxX, bottomCardStride]);

  const onCardSelect = useCallback(
    (
      id: number,
      index: number,
      text: string,
      type: number,
      actDepositType?: number,
    ) => {
      if (Date.now() < suppressClickUntilRef.current) return;
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0,
      });
      onSelect({ id, text, type, actDepositType });
    },
    [onSelect],
  );

  const onWebPointerDown = useCallback(
    (event: any) => {
      if (Platform.OS !== "web") return;
      if (!listRef.current) return;
      const btn = event?.button ?? event?.nativeEvent?.button;
      if (btn != null && btn !== 0) return;

      stopWebDrag();

      const startX = Number(
        event?.clientX ??
        event?.nativeEvent?.clientX ??
        event?.nativeEvent?.pageX ??
        0,
      );
      const startOffset = scrollXRef.current;
      let moved = false;

      const onMouseMove = (moveEvent: MouseEvent | PointerEvent) => {
        const deltaX = Number(moveEvent.clientX ?? 0) - startX;
        if (Math.abs(deltaX) > 3) moved = true;

        const nextOffset = Math.max(
          0,
          Math.min(bottomStripMaxX, startOffset - deltaX),
        );

        listRef.current?.scrollToOffset({
          offset: nextOffset,
          animated: false,
        });
        scrollXRef.current = nextOffset;
        setScrollX(nextOffset);

        if (moved) moveEvent.preventDefault();
      };

      const onMouseUp = () => {
        if (moved) {
          suppressClickUntilRef.current = Date.now() + 120;
        }
        stopWebDrag();
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp, { once: true });
      window.addEventListener("pointermove", onMouseMove as any);
      window.addEventListener("pointerup", onMouseUp, { once: true });
      webDragCleanupRef.current = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("pointermove", onMouseMove as any);
        window.removeEventListener("pointerup", onMouseUp);
      };
      setIsWebDragging(true);
      event?.preventDefault?.();
    },
    [bottomStripMaxX, stopWebDrag],
  );

  return (
    <View style={[styles.bottomStripContainer, containerStyle]}>
      <FlatList
        horizontal={true}
        ref={listRef}
        data={cardList}
        scrollEnabled
        directionalLockEnabled
        nestedScrollEnabled
        removeClippedSubviews={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        className="hide-scrollbar"
        style={[
          { overflow: "hidden" },
          Platform.OS === "web"
            ? ({ cursor: isWebDragging ? "grabbing" : "grab" } as any)
            : null,
        ]}
        contentContainerStyle={{ paddingVertical: 4, alignItems: "center" }}
        keyExtractor={(item) => item.id.toString()}
        onLayout={(e: LayoutChangeEvent) => setListW(e.nativeEvent.layout.width)}
        onScroll={(event) => {
          const x = event.nativeEvent.contentOffset.x;
          scrollXRef.current = x;
          setScrollX(x);
        }}
        scrollEventThrottle={16}
        {...(Platform.OS === "web"
          ? ({
            onWheel: (event: any) => {
              const deltaX = Number(event?.deltaX ?? 0);
              const deltaY = Number(event?.deltaY ?? 0);
              const horizontalDelta =
                Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
              if (!horizontalDelta || !listRef.current) return;

              event?.preventDefault?.();
              const nextOffset = Math.max(
                0,
                Math.min(bottomStripMaxX, scrollXRef.current + horizontalDelta),
              );
              listRef.current.scrollToOffset({
                offset: nextOffset,
                animated: false,
              });
              scrollXRef.current = nextOffset;
              setScrollX(nextOffset);
            },
            onPointerDown: onWebPointerDown,
            onMouseDown: onWebPointerDown,
            onMouseDownCapture: onWebPointerDown,
          } as any)
          : {})}
        getItemLayout={(_, index) => ({
          length: bottomCardStride,
          offset: bottomCardStride * index,
          index,
        })}
        renderItem={({ item, index }) => {
          return <BottomStripActivityCard
            image={item.coverImageURL}
            text={item.activityName}
            type={item.activityType}
            id={item.id}
            index={index}
            actDepositType={item.status}
            introduction={item.introduction}
            showText={item.showText}
            cardInnerWidth={bottomCardW}
            coverImgH={bottomCardImgH}
            isLast={index === cardList.length - 1}
            isSelected={Number(item.id) === Number(selectedId) && Number(item.activityType) === Number(selectedType)}
            isWideScreen={isWideScreen}
            primaryColor={primaryColor}
            onCardSelect={onCardSelect}
          />
        }}
      />

      <View pointerEvents="box-none" style={styles.bottomStripArrowOverlay}>
        <View
          pointerEvents={showLeftArrow ? "box-none" : "none"}
          style={[styles.bottomStripArrowSlot, styles.bottomStripArrowSlotOutLeft]}
        >
          {showLeftArrow ? (
            <Pressable hitSlop={10} onPress={onArrowLeft}>
              <RectangleIcon
                arrowColor={arrowColor}
                bgColor={arrowBgColor}
                bgOpacity={0.5}
                style={[
                  styles.bottomStripArrowIconOffset,
                  { transform: [{ scaleX: -1 }] },
                ]}
              />
            </Pressable>
          ) : null}
        </View>
        <View
          pointerEvents={showRightArrow ? "box-none" : "none"}
          style={[styles.bottomStripArrowSlot, styles.bottomStripArrowSlotOutRight]}
        >
          {showRightArrow ? (
            <Pressable hitSlop={10} onPress={onArrowRight}>
              <RectangleIcon
                arrowColor={arrowColor}
                bgColor={arrowBgColor}
                bgOpacity={0.5}
                style={styles.bottomStripArrowIconOffset}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomStripContainer: {
    position: "relative",
    marginTop: 12,
  },
  bottomStripArrowOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
    elevation: 1,
  },
  bottomStripArrowSlot: {
    minWidth: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomStripArrowSlotOutLeft: {
    marginLeft: -10,
  },
  bottomStripArrowSlotOutRight: {
    marginRight: -10,
  },
  bottomStripArrowIconOffset: {
    ...Platform.select({
      web: { marginTop: -12 },
      default: { marginTop: -16 },
    }),
  },
  cardContainer: {
    alignItems: "center",
    alignContent: "center",
    borderRadius: 10,
  },
  cardImage: {
    width: "100%",
    borderRadius: 8,
  },
});

