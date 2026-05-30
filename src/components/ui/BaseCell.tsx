import React from "react";
import { TextStyle, View, ViewStyle } from "react-native";
import { I18nText } from "../I18nText";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/Colors";
import { Pressable } from "react-native";
import { rf } from "@/utils/scaleFont";

type CellSize = "sm" | "default" | "lg";

interface BaseCellProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  i18nKey: string;
  value?: string;
  onPress?: () => void;
  size?: CellSize;
  className?: string;
  showArrow?: boolean;
  disabled?: boolean;
  dark?: boolean;
  extraText?: string;
  style?: ViewStyle | ViewStyle[];
  titleTextStyle?: TextStyle;
}

export function BaseCell({
  leftIcon,
  rightIcon,
  i18nKey,
  value,
  onPress,
  size = "default",
  className = "",
  showArrow = true,
  disabled = false,
  dark = false,
  extraText,
  style,
  titleTextStyle,
}: BaseCellProps) {
  const { theme } = useTheme();

  const isDarkMode = dark;

  // 根据尺寸确定样式
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "py-2 px-3";
      case "lg":
        return "py-4 px-5";
      case "default":
      default:
        return "py-3.5 pl-4 pr-3";
    }
  };

  const sizeClasses = getSizeClasses();

  // 根据暗色/亮色模式设置不同的样式
  const getBgColorClass = () => {
    if (isDarkMode) {
      return `bg-${theme}-btnText`;
    } else {
      return "bg-white";
    }
  };

  const getTextColorClass = () => {
    if (isDarkMode) {
      return `text-${theme}-text`;
    } else {
      return `text-${theme}-btnText`;
    }
  };

  const getSecondaryTextColorClass = () => {
    if (isDarkMode) {
      return `text-${theme}-gray`;
    } else {
      return "text-[#888888]";
    }
  };

  const getArrowColor = () => {
    if (isDarkMode) {
      return Colors[theme].text;
    } else {
      return "#666666";
    }
  };

  const bgColorClass = getBgColorClass();
  const customClassName = className ? className : bgColorClass;
  const cellClasses = `flex-row items-center justify-between rounded-lg ${customClassName} ${sizeClasses} ${disabled ? "opacity-50" : ""}`;

  return (
    <Pressable
      className={cellClasses}
      style={style}
      onPress={onPress}
      // disabled={disabled}
      // activeOpacity={0.7}
    >
      <View className="flex-col flex-1">
        <View className="flex-row items-center flex-1">
          {leftIcon && <View className="mr-3">{leftIcon}</View>}
          <I18nText
            i18nKey={i18nKey}
            type={size === "sm" ? "subtitle" : size === "lg" ? "title" : ""}
            className={`${getTextColorClass()} font-medium`}
            style={{ fontSize: rf(12), ...titleTextStyle }}
          />
          {value && (
            <I18nText
              i18nKey={value}
              type={size === "sm" ? "subtitle" : size === "lg" ? "title" : ""}
              className={`${getSecondaryTextColorClass()} mt-1`}
            />
          )}
        </View>
        {extraText && (
          <I18nText
            i18nKey={extraText}
            className={`${getTextColorClass()} mt-4`}
            style={{ fontSize: rf(16) }}
          />
        )}
      </View>

      <View className="flex-row items-center">
        {rightIcon && rightIcon}
        {showArrow && !rightIcon && (
          <Ionicons
            name="chevron-forward"
            size={size === "sm" ? rf(12) : size === "lg" ? rf(20) : rf(16)}
            color={getArrowColor()}
          />
        )}
      </View>
    </Pressable>
  );
}
