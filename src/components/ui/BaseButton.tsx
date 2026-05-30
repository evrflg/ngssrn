import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { I18nText } from '@/components/I18nText';
import { Colors } from '@/constants/Colors';
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonSize = 'sm' | 'default' | 'lg' | 'custom';
type ButtonVariant = 'solid' | 'outline' | 'outlineWhite'; // 只保留solid和outline两种样式

interface BaseButtonProps {
  onPress?: () => void;
  className?: string;
  textClassName?: string;
  children?: React.ReactNode;
  i18nKey?: string;
  scaleTo?: number;
  disabled?: boolean;
  size?: ButtonSize;
  style?: any;
  textStyle?: any;
  roundedFull?: boolean;
  gradient?: boolean;
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  variant?: ButtonVariant; // 按钮变体类型
  borderWidth?: number; // 边框宽度
  dark?: boolean;
  isLoading?: boolean
}

export const BaseButton = ({
  onPress,
  className = '',
  textClassName = '',
  children,
  i18nKey,
  scaleTo = 0.95,
  disabled = false,
  size = 'default',
  style,
  textStyle,
  roundedFull = false,
  gradient = false,
  gradientColors,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 0 },
  variant = 'solid', // 默认为实心按钮
  borderWidth = 1, // 默认边框宽度
  dark = false,
  isLoading = false
}: BaseButtonProps) => {
  const scale = useSharedValue(1);
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleTo, {
      mass: 0.3,
      damping: 4,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      mass: 0.3,
      damping: 4,
      stiffness: 400,
    });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  // 根据尺寸确定样式
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: `px-1 ${roundedFull ? 'rounded-full' : 'rounded-md'} h-[26]`,
          text: 'text-xs'
        };
      case 'lg':
        return {
          button: `px-4 ${roundedFull ? 'rounded-full' : 'rounded-xl'} h-[48]`,
          text: 'text-base font-medium'
        };
      case 'custom':
        return {
          button: `${roundedFull ? 'rounded-full' : ''}`,
          text: ``
        }
      case 'default':
      default:
        return {
          button: `px-2 ${roundedFull ? 'rounded-full' : 'rounded-lg'} h-[36]`,
          text: 'text-sm'
        };
    }
  };

  // 获取默认渐变色
  const getDefaultGradientColors = () => {
    return [
      Colors[theme].gradientStart,
      Colors[theme].gradientEnd
    ];
  };

  // 根据变体类型获取按钮样式
  const getVariantClasses = () => {
    if (variant === 'outline') {
      return `border-[${borderWidth}px] border-${theme}-primary bg-transparent`;
    }
    if (variant === 'outlineWhite') {
      return `border-[${borderWidth}px] border-${theme}-btnText bg-transparent`;
    }
    // solid样式
    return gradient ? '' : dark ? `bg-${theme}-background` : `bg-${theme}-primary`;
  };

  // 根据变体类型获取文字颜色
  const getTextColorClass = () => {
    if (variant === 'outline') {
      return `text-${theme}-primary`;
    }
    if (variant === 'outlineWhite') {
      return `text-${theme}-btnText`;
    }

    return dark ? `text-${theme}-text` : `text-${theme}-btnText`;
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();
  const buttonClasses = `items-center justify-center ${variantClasses} ${sizeClasses.button} ${disabled ? 'opacity-50' : ''} ${className}`;
  const textClasses = `${getTextColorClass()} ${sizeClasses.text} ${textClassName}`;

  // 使用传入的渐变色或默认渐变色
  const colors = gradientColors || getDefaultGradientColors();

  // 渲染按钮内容
  const renderButtonContent = () => {
    if (gradient && variant === 'solid') {
      return i18nKey ? (
        <View className='flex-row items-center'>
          {isLoading && <ActivityIndicator className='mr-2' size="small" color='white' />}
          <I18nText
            i18nKey={i18nKey}
            style={[
              {
                fontSize: size === 'sm' ? 12 : size === 'lg' ? 16 : 14,
                fontWeight: size === 'lg' ? '500' : 'normal',
                color: dark ? 'white' : disabled ? 'white' : Colors[theme].btnText
              },
              textStyle
            ]}
          />
        </View>
      ) : (
        children
      );
    }

    // 普通按钮使用className
    return i18nKey ? (
      <View className='flex-row items-center'>
        {isLoading && <ActivityIndicator className='mr-2' size="small" color='white' />}
        <I18nText i18nKey={i18nKey} className={textClasses} style={textStyle} />
      </View>
    ) : (
      children
    );
  };

  // 如果使用渐变色且是实心按钮
  if (gradient && variant === 'solid') {
    return (
      <Animated.View style={[animatedStyle, { overflow: 'hidden' }]} className={className}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={disabled || isLoading}
          activeOpacity={0.8}
          className={`overflow-hidden ${disabled ? 'opacity-80' : ''}`}
        >
          <LinearGradient
            colors={(disabled ? ['#b0b0b0', '#b0b0b0'] : colors) as [string, string, ...string[]]}
            start={gradientStart}
            end={gradientEnd}
            style={[
              {
                alignItems: 'center',
                justifyContent: 'center',
                height: size === 'lg' ? 48 : size === 'sm' ? 26 : size === 'custom' ? undefined : 36,
                paddingHorizontal: size === 'lg' ? 16 : size === 'sm' ? 4 : size === 'custom' ? undefined : 8,
                borderRadius: roundedFull ? 9999 : size === 'lg' ? 12 : size === 'sm' ? 6 : size === 'custom' ? undefined : 8
              },
              style
            ]}
          >
            {renderButtonContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // 常规按钮（包括线性outline样式）
  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      className={buttonClasses}
      style={[animatedStyle, style]}
      disabled={disabled || isLoading}
    >
      {renderButtonContent()}
    </AnimatedTouchable>
  );
}; 