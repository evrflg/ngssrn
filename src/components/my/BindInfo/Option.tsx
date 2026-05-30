import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { I18nManager, Text, TouchableOpacity, View } from "react-native";

export interface OptionProps {
  title: string;
  action: string;
  info?: string;
  leftIcon?:
    | keyof typeof Ionicons.glyphMap
    | "line"
    | React.ComponentType<{ size?: number; color?: string }>
    | React.ReactElement;
  leftIconStyle?: any;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

const Option: React.FC<OptionProps> = ({
  title,
  action,
  info,
  leftIcon = "lock-closed-outline",
  leftIconStyle,
  rightIcon = "chevron-forward",
  onPress,
}) => {
  const { theme } = useTheme();
  const getIconColor = () => {
    if (theme === "greenBlack") {
      return Colors[theme].gradient;
    }
    return Colors[theme].svgIconColor;
  };

  const renderLeftIcon = () => {
    if (typeof leftIcon === "string") {
      return (
        <Ionicons
          name={leftIcon as keyof typeof Ionicons.glyphMap}
          size={16}
          color={getIconColor()}
        />
      );
    }
    // 已渲染好的节点（如 <ClearCacheIcon ... />），按调用方传入原样展示
    if (React.isValidElement(leftIcon)) {
      return leftIcon;
    }
    // 组件类型（如 LockIcon），由 Option 统一注入 size / color
    const IconComponent = leftIcon as React.ComponentType<{ size?: number; color?: string }>;
    return <IconComponent size={16} color={getIconColor()} />;
  };
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between p-3 rounded-2xl"
      style={{ backgroundColor: Colors[theme].cardBg1 }}
      onPress={onPress}
    >
      <View className="flex-row items-center space-x-3 flex-1 mr-2">
        <View
          className="w-8 h-8 rounded-lg items-center justify-center mr-2"
          style={{ backgroundColor: Colors[theme].iconBackground }}
        >
          {renderLeftIcon()}
        </View>
        <View className="flex-col flex-1">
          <Text
            style={{
              color: Colors[theme].text,
              fontSize: rf(12),
              textAlign: I18nManager.isRTL ? "right" : "left",
            }}
          >
            {title}
          </Text>
          {!!info && (
            <Text
              style={{
                color: "#969799",
                fontSize: rf(12),
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
              className="pt-2"
            >
              {info}
            </Text>
          )}
        </View>
      </View>
      <View className="flex-row items-center space-x-1">
        <Text className="text-gray-500 mr-1 flex-shrink" style={{ fontSize: rf(12) }}>
          {action}
        </Text>
        <Ionicons name={rightIcon} size={16} color="#666" />
      </View>
    </TouchableOpacity>
  );
};

export default Option;
