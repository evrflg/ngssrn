import BaseNavigation from './BaseStyle'
import SecondNavigation from './SecondStyle'
import ThirdNavigation from './ThirdStyle'
import FourthNavigation from './FourthStyle'
import { resolveSafeAreaExtensionBg } from "@/utils/resolveSafeAreaExtensionBg";
import {
  StyleSheet,
  Animated,
  Platform,
  View,
} from 'react-native'
import { useBottomNavigation } from "@/hooks/useBottomNavigation";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from "react-redux";
import { selectBottomNavigationType } from "@/store/user/selfConfig";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "@/hooks/theme/ThemeProvider";
import type { Tab, Tabs } from '@/types/navigation';

export interface BottomNavProps {
  tabs: Tabs;
  onNavigate: (tab: Tab) => void;
  isTabActive: (path: string) => boolean;
}

const isWeb = Platform.OS === 'web';
const NAV_BAR_HEIGHT = 54;

const Index = () => {
  const { isShow, tabs, onNavigate, isTabActive } = useBottomNavigation()
  const { theme } = useTheme()
  const navBgColor = resolveSafeAreaExtensionBg(theme)
  const rawInsets = useSafeAreaInsets();

  const bottomInset = isWeb ? 0 : rawInsets.bottom;
  const navHeight = NAV_BAR_HEIGHT + bottomInset;

  const translateY = useRef(new Animated.Value(navHeight)).current;
  const [shouldRender, setShouldRender] = useState(isShow);

  const opacity = translateY.interpolate({
    inputRange: [0, navHeight],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const type = useSelector(selectBottomNavigationType)

  // 用 ref 保持 onNavigate 回调引用稳定，避免因回调身份变化导致导航组件不必要的重建。
  // 注意：isTabActive 必须保留为直接依赖，路由切换时需要触发重渲染以更新选中态。
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;
  const stableOnNavigate = useCallback((tab: Tab) => onNavigateRef.current(tab), []);

  const RenderNavigation = useMemo(() => {
    const navProps: BottomNavProps = { tabs, onNavigate: stableOnNavigate, isTabActive };
    switch (type) {
      case '1':
        return <BaseNavigation {...navProps} />
      case '2':
        return <SecondNavigation {...navProps} />
      case '3':
        return <ThirdNavigation {...navProps} />
      default:
        return <FourthNavigation {...navProps} />
    }
  }, [type, tabs, stableOnNavigate, isTabActive])

  useEffect(() => {
    if (isWeb) return;
    if (isShow) {
      setShouldRender(true);
    }

    Animated.timing(translateY, {
      toValue: isShow ? 0 : navHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !isShow) {
        setShouldRender(false);
      }
    });
  }, [isShow, navHeight, translateY]);

  if (isWeb && !isShow) return null;
  if (!isWeb && !shouldRender) return null;

  if (isWeb) {
    const safeBottom = 'env(safe-area-inset-bottom, 0px)' as const;
    return (
      <Animated.View
        style={[
          styles.webView,
          {
            height: `calc(${NAV_BAR_HEIGHT}px + ${safeBottom})` as any,
            backgroundColor: 'transparent',
          },
        ]}
      >
        {/** 仅包住 Home Indicator 一条：不透明，避免透明栏体时根视图与真实屏底之间的缝 */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: safeBottom as any,
            backgroundColor: navBgColor,
          }}
        />
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: safeBottom as any,
            height: NAV_BAR_HEIGHT,
            backgroundColor: 'transparent',
          }}
        >
          {RenderNavigation}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.nativeView,
        {
          height: navHeight,
          paddingBottom: bottomInset,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {RenderNavigation}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  nativeView: {
    position: 'absolute',
    width: '100%',
    left: 0,
    bottom: 0,
    pointerEvents: 'box-none',
    zIndex: 999,
    // 中间 Tab 图标会向上凸起，避免被固定高度裁切
    overflow: 'visible',
  },
  webView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    zIndex: 999,
    pointerEvents: 'box-none',
    overflow: 'visible',
  },
})

export default Index
