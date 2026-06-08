import React, { useRef, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  type ViewStyle,
  type TextStyle,
  Text,
} from "react-native";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Colors } from "@/constants/Colors";
import { screen } from "../../utils/screen";

const WINDOW_WIDTH = screen.get("window").width;
/** 頁面左右 padding + 卡片內距約略值，onLayout 前 wrap 網格用此估算避免用滿屏寬 */
const WRAP_WIDTH_FALLBACK = Math.max(260, WINDOW_WIDTH - 72);

interface Props {
  className?: string;
}

interface TabItem {
  name: string;
}

const BaseTab = ({
  tabs,
  selectedIndex,
  setIndex,
  onChange,
  renderItem,
  tabStyle,
  tabClassName = '',
  scrollStyle = {
    alignItems: "center",
    marginTop: 10,
  },
  showNumber = 4,
  TextStyle,
  autoWidth = false,
  ActiveTextStyle,
  indicatorWidthRatio,
  showIndicator = true,
  wrap = false,
}: Props & {
  tabs: TabItem[];
  selectedIndex: number;
  setIndex: Function;
  onChange?: (index: number) => void;
  renderItem?: (tab: TabItem, index: number) => React.ReactNode;
  tabStyle?: ViewStyle;
  tabClassName?: string;
  showNumber?: number;
  TextStyle?: TextStyle;
  autoWidth?: boolean;
  ActiveTextStyle?: TextStyle;
  scrollStyle?: ViewStyle;
  indicatorWidthRatio?: number;
  showIndicator?: boolean;
  /**  true：多列換行排版，每列最多 showNumber 個（垂直方向由外層卷軸滾動） */
  wrap?: boolean;
}) => {
  const scrollRef = useRef<any>(null);
  const indicatorRef = useRef(new Animated.Value(selectedIndex)).current;
  const [parentWidth, setParentWidth] = useState(0);
  const [tabWidths, setTabWidths] = useState<number[]>([]);
  const [tabPositions, setTabPositions] = useState<number[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", () => {
      setParentWidth(0);
    });
    return () => subscription?.remove();
  }, []);

  // gap：與 Vue PaymentSelector gap 接近（10px），wrap grid 用 flex 均分避免父寬量錯導致只排兩欄
  const gapSize = wrap ? 10 : 8;
  /** 換行 grid：每列固定 showNumber 欄（與項目總數無關）；橫向捲動：仍按較少欄數適配 */
  const columnCount = wrap
    ? Math.max(1, showNumber)
    : Math.min(tabs.length || 1, showNumber);
  const totalGapWidth = (columnCount - 1) * gapSize;
  const layoutWidth = parentWidth > 0 ? parentWidth : WINDOW_WIDTH;
  const wrapMeasureW =
    wrap && parentWidth <= 0 ? WRAP_WIDTH_FALLBACK : layoutWidth;
  const wrapCellWidth =
    wrap && wrapMeasureW > 0
      ? (wrapMeasureW - totalGapWidth) / columnCount
      : 0;
  const tabWidth = autoWidth
    ? 0
    : wrap
      ? wrapCellWidth
      : (layoutWidth - totalGapWidth) / columnCount;

  // 计算指示器宽度和偏移量
  const indicatorWidth = indicatorWidthRatio ? tabWidth * indicatorWidthRatio : tabWidth;
  const indicatorOffset = indicatorWidthRatio ? (tabWidth - indicatorWidth) / 2 : 0;

  // 计算tab位置
  useEffect(() => {
    if (autoWidth && tabWidths.length === tabs.length) {
      const positions: number[] = [];
      let currentPos = 0;
      tabWidths.forEach((width, index) => {
        positions[index] = currentPos + width / 2; // 每个tab的中心位置
        currentPos += width;
      });
      setTabPositions(positions);
    }
  }, [tabWidths, autoWidth, tabs.length]);

  const handleTabPress = (index: number) => {
    setIndex(index);
    if (onChange) onChange(index);

    if (wrap) return;

    if (autoWidth && tabPositions.length > 0) {
      // 自适应宽度模式下的滚动居中
      const tabCenter = tabPositions[index];
      const scrollOffset = tabCenter - parentWidth / 2;

      scrollRef?.current?.scrollTo({
        x: Math.max(0, scrollOffset),
        animated: true,
      });
    } else {
      // 固定宽度模式
      const tabWithGapWidth = tabWidth + gapSize; // 每个tab的实际占用宽度（包括间距）
      Animated.spring(indicatorRef, {
        toValue: index * tabWithGapWidth,
        useNativeDriver: false,
      }).start();

      const scrollOffset = index * tabWithGapWidth - parentWidth / 2 + tabWidth / 2;

      scrollRef?.current?.scrollTo({
        x: Math.max(0, scrollOffset),
        animated: true,
      });
    }
  };

  /** 受控 selectedIndex 变化时仅同步指示器/横向滚动，勿再 setIndex（否则会与父级 tab 状态互相触发） */
  useEffect(() => {
    if (selectedIndex == null || wrap) return;

    const timer = setTimeout(() => {
      if (autoWidth && tabPositions.length > 0) {
        const tabCenter = tabPositions[selectedIndex];
        const scrollOffset = tabCenter - parentWidth / 2;
        scrollRef?.current?.scrollTo({
          x: Math.max(0, scrollOffset),
          animated: true,
        });
        return;
      }

      const tabWithGapWidth = tabWidth + gapSize;
      Animated.spring(indicatorRef, {
        toValue: selectedIndex * tabWithGapWidth,
        useNativeDriver: false,
      }).start();

      const scrollOffset =
        selectedIndex * tabWithGapWidth - parentWidth / 2 + tabWidth / 2;
      scrollRef?.current?.scrollTo({
        x: Math.max(0, scrollOffset),
        animated: true,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [
    selectedIndex,
    wrap,
    autoWidth,
    tabPositions,
    parentWidth,
    tabWidth,
    gapSize,
    indicatorRef,
  ]);

  // 处理tab布局变化
  const handleTabLayout = (index: number, width: number) => {
    if (!autoWidth) return;

    setTabWidths(prev => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
  };

  /** wrap 網格：把 tabs 分成每列 columnCount 個的列陣列，再用 flex:1 均分寬度
   *  等效於 Vue 的 grid-template-columns: 1fr 1fr 1fr，不依賴 px 寬度計算 */
  const renderWrapGrid = () => {
    const rows: Array<Array<{ tab: TabItem; index: number }>> = [];
    for (let i = 0; i < tabs.length; i += columnCount) {
      rows.push(
        tabs.slice(i, i + columnCount).map((tab, j) => ({
          tab,
          index: i + j,
        })),
      );
    }
    return (
      <View style={{ overflow: "visible", paddingTop: 6, width: "100%" }}>
        {rows.map((row, rowIdx) => (
          <View
            key={rowIdx}
            style={{
              flexDirection: "row",
              gap: gapSize,
              marginBottom: rowIdx < rows.length - 1 ? gapSize : 0,
              overflow: "visible",
            }}
          >
            {row.map(({ tab, index }) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleTabPress(index)}
                style={{ flex: 1, minWidth: 0, overflow: "visible" }}
                className={tabClassName}
              >
                {renderItem ? (
                  renderItem(tab, index)
                ) : (
                  <Text
                    style={selectedIndex === index ? ActiveTextStyle : TextStyle}
                    className={`text-[13px] font-medium text-${theme}-${selectedIndex === index ? "primary" : "lightText"}`}
                  >
                    {tab.name}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
            {/* 末列若不足 columnCount 個，補佔位保持對齊 */}
            {row.length < columnCount &&
              Array.from({ length: columnCount - row.length }).map((_, i) => (
                <View key={`pad-${i}`} style={{ flex: 1, minWidth: 0 }} />
              ))}
          </View>
        ))}
      </View>
    );
  };

  const tabNodes = tabs.map((tab, index) => (
    <TouchableOpacity
      key={index}
      className={`flex-row align-center justify-center ${tabClassName}`}
      style={
        autoWidth
          ? {}
          : [{ width: tabWidth, minWidth: Math.min(tabWidth, 100) }]
      }
      onPress={() => handleTabPress(index)}
      onLayout={
        autoWidth
          ? (e) => handleTabLayout(index, e.nativeEvent.layout.width)
          : undefined
      }
    >
      {renderItem ? (
        renderItem(tab, index)
      ) : (
        <Text
          style={selectedIndex == index ? ActiveTextStyle : TextStyle}
          className={`text-[13px] font-medium text-${theme}-${selectedIndex == index ? "primary" : "lightText"}`}
        >
          {tab.name}
        </Text>
      )}
    </TouchableOpacity>
  ));

  return (
    <View
      className=""
      style={tabStyle}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) setParentWidth(w);
      }}
    >
      {wrap ? (
        renderWrapGrid()
      ) : (
        <ScrollView
          horizontal
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={scrollStyle}
          scrollEventThrottle={100}
        >
          <View className="flex-row align-center justify-center gap-2">
            {tabNodes}
          </View>
          {showIndicator && !renderItem && !autoWidth && (
            <Animated.View
              style={[
                {
                  position: "absolute",
                  height: 2,
                  backgroundColor: Colors[theme].primary,
                  bottom: 0,
                },
                {
                  width: indicatorWidth,
                  transform: [
                    { translateX: Animated.add(indicatorRef, indicatorOffset) },
                  ],
                },
              ]}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default React.memo(BaseTab);
