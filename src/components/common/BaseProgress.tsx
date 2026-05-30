import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';

interface CircularProgressProps {
  size?: number; // 圆环直径
  strokeWidth?: number; // 线宽
  progress: number; // 当前进度（0-1）
  progressColor?: string; // 进度条颜色
  bgColor?: string; // 背景圆环颜色
  textColor?: string; // 文字颜色
  duration?: number; // 动画时长
  textClassName?: string; // 文字样式 
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedNumberProps {
  from?: number;
  to: number;
  duration?: number;
  formatter?: (val: number) => string;
  style?: any;
  className?: string;
  suffix?: string
}

function toFiniteNumber(n: number): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  from = 0,
  to,
  duration = 1000,
  formatter = (val) => {
    if (typeof val === 'number') {
      return val.toFixed(0)
    }
    return val
  },
  style,
  className,
  suffix = ''
}) => {
  const fromN = toFiniteNumber(from);
  const toN = toFiniteNumber(
    typeof to === 'number' ? to : Number.parseFloat(String(to ?? '').replace(/,/g, '')) || 0,
  );
  const progress = useSharedValue(fromN);
  const [displayValue, setDisplayValue] = React.useState(formatter(fromN));

  // 创建 worklet 函数
  const formatValue = (value: number) => {
    'worklet';
    const n = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
    return `${n.toFixed(2)}${suffix}`;
  };

  // 优化更新逻辑
  useDerivedValue(() => {
    const formattedValue = formatValue(progress.value);
    runOnJS(setDisplayValue)(formattedValue);
  });

  React.useEffect(() => {
    progress.value = withTiming(toN, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [toN, duration]);

  return <Text className={className} style={style}>{displayValue}</Text>;
};
  
export const BaseProgress: React.FC<CircularProgressProps> = ({
  size = 120,
  strokeWidth = 10,
  progress,
  progressColor = '#3b82f6',
  bgColor = '#e5e7eb',
  duration = 800,
  textClassName
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // reanimated shared values
  const progressSV = useSharedValue(0);

  useEffect(() => {
    if (progress > 0) {
        progressSV.value = withTiming(progress, { duration, easing: Easing.out(Easing.cubic) });
    }
  }, [progress, duration]);

  // 动画props
  const animatedCircleProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference * (1 - progressSV.value),
    };
  });

  // 百分比动画
  useDerivedValue(() => Math.round(progressSV.value * 100));

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* 背景圆环 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* 进度圆环 */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference},${circumference}`}
          animatedProps={animatedCircleProps}
          strokeLinecap="round"
        />
      </Svg>
      {/* 百分比和内容 */}
      <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center' }]}>        
        <AnimatedNumber
          from={0}
          to={progress * 100}
          duration={1000}
          suffix="%"
          className={textClassName}
        />
      </View>
    </View>
  );
};
