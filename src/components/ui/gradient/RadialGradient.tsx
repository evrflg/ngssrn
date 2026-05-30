/**
 * 径向渐变组件
 * @param {StyleProp<ViewStyle>} style 样式
 * @param {string} className 样式类名
 * @param {React.ReactNode} children 子组件
 * @param {GradientColor[]} colors 渐变颜色
 * @param {string} cx 圆心x坐标
 * @param {string} cy 圆心y坐标
 * @param {string} rx 径向渐变半径x坐标
 * @param {string} ry 径向渐变半径y坐标
 */
import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

export interface GradientColor {
  offset: number | string;
  color: string;
}

interface RadialGradientProps {
  style?: StyleProp<ViewStyle>;
  className?: string;
  children?: React.ReactNode;
  colors?: GradientColor[];
  cx?: string;
  cy?: string;
  rx?: string;
  ry?: string;
}

// 生成唯一ID以避免渐变冲突
const uniqueId = `radial-grad-${Math.random().toString(36).substr(2, 9)}`;

const GradientBackground: React.FC<RadialGradientProps> = ({
  style,
  className,
  children,
  colors = [
    { offset: "0.01", color: "#ddfe89" },
    { offset: "0.37", color: "#9ed900" },
    { offset: "1", color: "#4aa34a" },
  ],
  cx = "23%",
  cy = "21%",
  rx = "99%",
  ry = "75%",
}) => {
  // 确保每个组件实例有唯一的ID
  const gradientId = React.useMemo(() => `${uniqueId}-${Date.now()}`, []);

  return (
    <View style={[style]} className={["flex-1", className].join(" ")}>
      <Svg
        className="w-full h-full"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <Defs>
          <RadialGradient
            id={gradientId}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            gradientUnits="userSpaceOnUse"
          >
            {colors.map((stop, index) => (
              <Stop key={index} offset={stop.offset} stopColor={stop.color} />
            ))}
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      {children}
    </View>
  );
};

export default GradientBackground;
