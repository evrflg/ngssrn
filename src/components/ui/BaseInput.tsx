import React, { useState } from 'react';
import { View, TextInput as NTextInput, TouchableOpacity, TextInputProps, Platform, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/theme/ThemeProvider';
import { I18nText } from '../I18nText';
import type { TextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { useController } from 'react-hook-form';

type InputSize = 'sm' | 'default' | 'lg';

type TRule = Omit<
  RegisterOptions,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs'
>;

export type InputControllerType<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  rules?: TRule;
};

interface ControlledInputProps<T extends FieldValues>
  extends BaseInputProps,
  InputControllerType<T> { }

interface BaseInputProps extends Omit<TextInputProps, 'style'> {
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftText?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
  inputClassName?: string;
  onRightIconPress?: () => void;
  borderStyle?: 'rounded' | 'underline' | 'outline' | 'darkRounded';
  dark?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  inputLabel?: string;
  inputLabelIcon?: React.ReactNode;
  hintText?: string;
  /** 覆盖左侧标签字号类（默认 text-xs）；与 leftTextStyle 同时用时可传 "" 避免与动态 fontSize 冲突 */
  leftTextSizeClass?: string;
  leftTextStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  /** 若传入（含空字符串），则替换默认 input 的字号类（如 text-sm） */
  inputTypographyClass?: string;
}

export const BaseInput = React.forwardRef<TextInput, BaseInputProps>(({
  size = 'default',
  leftIcon,
  rightIcon,
  leftText,
  error,
  className = '',
  containerClassName = '',
  inputClassName = '',
  onRightIconPress,
  borderStyle = '',
  dark,
  clearable = false,
  onClear,
  inputLabel,
  inputLabelIcon,
  hintText,
  leftTextSizeClass = 'text-xs',
  leftTextStyle,
  inputStyle,
  inputTypographyClass,
  value,
  ...rest
}, ref) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const isDarkMode = dark;

  // 根据尺寸确定样式
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'h-9',
          input: 'text-xs',
          icon: 'w-4 h-4'
        };
      case 'lg':
        return {
          container: 'h-14',
          input: 'text-base',
          icon: 'w-6 h-6'
        };
      default:
        return {
          container: 'h-11',
          input: 'text-sm',
          icon: 'w-5 h-5'
        };
    }
  };

  // 根据暗色/亮色模式设置不同的样式
  const getBgColorClass = () => {
    if (isDarkMode) {
      return `bg-${theme}-inputBg`; // 暗色模式背景色
    } else {
      return 'bg-white'; // 亮色模式背景色
    }
  };

  const getTextColorClass = () => {
    if (isDarkMode) {
      return `text-${theme}-primary`; // 暗色模式文字颜色
    } else {
      return `text-${theme}-btnText`; // 亮色模式文字颜色
    }
  };

  const getLableTextColorClass = () => {
    if (isDarkMode) {
      return `text-${theme}-text`; // 暗色模式文字颜色
    } else {
      return `text-${theme}-btnText`; // 亮色模式文字颜色
    }
  };

  const getRightBorderClass = () => {
    if (isDarkMode) {
      return `border-r border-[#bababa]`; // 暗色模式文字颜色
    } else {
      return `border-r border-${theme}-btnText`; // 亮色模式文字颜色
    }
  }

  const getHintTextColorClass = () => {
    if (isDarkMode) {
      return 'text-[#ADB7BA]'; // 暗色模式提示文字颜色
    } else {
      return 'text-[#888888]'; // 亮色模式提示文字颜色
    }
  };

  const getBorderStyles = () => {
    // 根据图片样式，我们默认使用圆角矩形
    const focusedBorderColor = isDarkMode ? `border-${theme}-white` : `border-${theme}-primary`;

    switch (borderStyle) {
      case 'underline':
        return `border-b ${isFocused ? focusedBorderColor : `border-${theme}-gray`}`;
      case 'outline':
        return `border ${isFocused ? focusedBorderColor : `border-${theme}-gray`} rounded-md`;
      case 'rounded':
        return `${getBgColorClass()} rounded-full`
      case 'darkRounded':
        return `bg-${theme}-btnText rounded-lg`;
      default:
        return `${getBgColorClass()} rounded-lg ${isFocused ? `border ${focusedBorderColor}` : `border border-${theme}-gray`}`;
    }
  };

  const sizeStyles = getSizeStyles();
  const inputTypoClass =
    inputTypographyClass !== undefined ? inputTypographyClass : sizeStyles.input;
  const borderStyles = getBorderStyles();
  // 获取占位符颜色
  const placeholderColor = borderStyle === 'darkRounded' ? '#777777' : isDarkMode ? '#ADB7BA' : '#888888';

  // 确定是否显示清除按钮
  const shouldClear = clearable && value && value.length > 0;

  return (
    <View className={`w-full mb-2 ${containerClassName}`}>
      <View className='flex-row items-center'>
        {
          inputLabelIcon && (
            <View className={`mr-1.5 ${getLableTextColorClass()} ${borderStyle !== 'darkRounded' ? getRightBorderClass() : ''}`}>
              {inputLabelIcon}
            </View>
          )
        }
        {inputLabel && (
          <I18nText i18nKey={inputLabel} className={`${getLableTextColorClass()} font-medium`} />
        )}
      </View>

      <View className={`flex-row items-center px-3 ${sizeStyles.container} ${borderStyles} ${className}`}>
        {leftIcon && (
          <View className={`mr-3 ${getTextColorClass()} ${borderStyle !== 'darkRounded' ? getRightBorderClass() : ''} pr-2`}>
            {leftIcon}
          </View>
        )}

        {leftText && (
          <I18nText
            i18nKey={leftText}
            style={leftTextStyle}
            className={`mr-3 ${leftTextSizeClass} ${getTextColorClass()} ${borderStyle !== 'darkRounded' ? getRightBorderClass() : ''} pr-2`}
          />
        )}

        <NTextInput
          ref={ref}
          className={`flex-1 h-full ${leftText ? 'pl-2' : ''} ${borderStyle === 'darkRounded' ? `text-${theme}-text` : getTextColorClass()} ${inputTypoClass} ${inputClassName}`}
          placeholderTextColor={placeholderColor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : undefined,
            inputStyle,
          ]}
          value={value == null ? "" : value}
          {...rest}
        />

        {shouldClear && (
          <TouchableOpacity
            onPress={onClear}
            className="mr-2"
          >
            <Ionicons
              name="close-circle"
              size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
              color={borderStyle === 'darkRounded' ? '#777777' : isDarkMode ? '#FFFFFF' : '#666666'}
            />
          </TouchableOpacity>
        )}

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            className="ml-2"
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {hintText && (
        <I18nText i18nKey={hintText} className={`mt-1 ml-3 ${getHintTextColorClass()}`} type='subtitle' />
      )}

      {error && (
        <I18nText
          i18nKey={error}
          className={`text-${theme}-warn text-xs mt-1 ml-3`}
        />
      )}
    </View>
  );
})

// only used with react-hook-form
export function ControlledInput<T extends FieldValues>(
  props: ControlledInputProps<T>
) {
  const { name, control, rules, size, ...inputProps } = props;

  const { field, fieldState } = useController({ control, name, rules });

  return (
    <BaseInput
      ref={field.ref}
      onChangeText={field.onChange}
      value={(field.value as string) || ''}
      size={size}
      {...inputProps}
      error={fieldState.error?.message}
    />
  );
}