/**
 * 渐变文本
 * @description 默认从上到下渐变，如果需要从左到右渐变，可以传入 x2 = '100%'，如果有其他需求，可以传入 x1、y1、x2、y2
 * @param {string} text - 文字内容
 * @param {string[]} colors - 渐变色颜色
 * @param {number} fontSize - 字体大小
 * @param {string} x1 - 渐变起始x坐标
 * @param {string} y1 - 渐变起始y坐标
 * @param {string} x2 - 渐变结束x坐标
 * @param {string} y2 - 渐变结束y坐标
 */
import React, { useState, useCallback, memo } from "react";
import { LayoutChangeEvent, View, Text as RNText } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Text } from "react-native-svg";

interface GradientTextProps {
  text: string;
  colors: string[];
  fontSize?: number;
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
}

const GradientText = memo(
  ({
    text,
    colors = ["#FF6B6B", "#5F27CD"],
    fontSize = 30,
    x1 = "0%",
    y1 = "0%",
    x2 = "0%",
    y2 = "100%",
  }: GradientTextProps) => {
    const [textSize, setTextSize] = useState({ width: 0, height: 0 });

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setTextSize({ width, height });
    }, []);

    // 缓存渐变色的渲染
    const gradientStops = useCallback(
      () =>
        colors.map((color, index) => (
          <Stop key={index} offset={`${(index / (colors.length - 1)) * 100}%`} stopColor={color} />
        )),
      [colors],
    );

    return (
      <View style={{ width: textSize.width || "100%" }}>
        {/* 隐藏的 Text 用于测量尺寸 */}
        <View className="absolute opacity-0">
          <RNText onLayout={handleLayout} style={{ fontSize, lineHeight: fontSize + 4 }}>
            {text}
          </RNText>
        </View>
        {/* 实际显示的 Text */}
        {textSize.width > 0 && (
          <Svg width={textSize.width} height={textSize.height}>
            <Defs>
              <LinearGradient id="text-gradient" x1={x1} y1={y1} x2={x2} y2={y2}>
                {gradientStops()}
              </LinearGradient>
            </Defs>
            <Text x="0" y={fontSize} fontSize={fontSize} fill="url(#text-gradient)">
              {text}
            </Text>
          </Svg>
        )}
      </View>
    );
  },
);

export default GradientText;
