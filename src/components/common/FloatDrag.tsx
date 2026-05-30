import React, { useMemo, useRef } from 'react';
import { Animated, PanResponder, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FloatDragProps {
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  style?: object;
  startDrag?: () => void;
  endDrag?: () => void;
}

// 容器/图标大致尺寸（用于边界计算）
const FLOAT_SIZE = 56;
const EDGE_GAP = 10;
// iOS 顶部（动态岛/刘海）额外留白，避免拖进安全区上缘后不好点/不好拖出来
const IOS_TOP_EXTRA_GAP = 12;
const FloatDrag: React.FC<FloatDragProps> = ({
  children,
  initialPosition = { x: 0, y: 0 },
  style,
  startDrag,
  endDrag,
}) => {
  const pan = useRef<any>(new Animated.ValueXY(initialPosition)).current;
  const isDragging = useRef(false);

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const BOUNDS = useMemo(() => {
    const topExtra = Platform.OS === 'ios' ? IOS_TOP_EXTRA_GAP : 0;
    const minX = EDGE_GAP;
    const maxX = Math.max(minX, SCREEN_WIDTH - FLOAT_SIZE - EDGE_GAP);
    const minY = Math.max(EDGE_GAP, (insets?.top ?? 0) + topExtra);
    const maxY = Math.max(minY, SCREEN_HEIGHT - FLOAT_SIZE - EDGE_GAP - (insets?.bottom ?? 0));
    return { minX, maxX, minY, maxY };
  }, [SCREEN_WIDTH, SCREEN_HEIGHT, insets?.top, insets?.bottom]);
  const panResponder = useRef(
    PanResponder.create({
      // 让子组件（如 TouchableOpacity）正常接收点击；只有明显移动时才开始拖拽
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
      onPanResponderGrant: () => {
        isDragging.current = true;
        startDrag?.();
        // 不再取 offset，而是直接 flatten 保持干净
        pan.extractOffset(); 
      },
      onPanResponderMove: (_, gesture) => {
        let newX = gesture.dx + pan.x._offset;
        let newY = gesture.dy + pan.y._offset;
      
        // 边界限制
        newX = Math.max(BOUNDS.minX, Math.min(newX, BOUNDS.maxX));
        newY = Math.max(BOUNDS.minY, Math.min(newY, BOUNDS.maxY));
      
        pan.setValue({ x: newX - pan.x._offset, y: newY - pan.y._offset });
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
        pan.flattenOffset();
        endDrag?.();
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        pan.flattenOffset();
        endDrag?.();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        { transform: pan.getTranslateTransform() },
      ]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 102,
  },
});

export default FloatDrag;
