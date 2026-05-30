import React, { useRef, useEffect, useState } from 'react'
import { View, ScrollView, TouchableOpacity, Animated, Dimensions, Platform, type ViewStyle, Text } from 'react-native'
//import { Text } from "../ui"
//import { useThemeColor } from '@/hooks/theme'
//import defualtColors from "@/ui/colors"
import { screen } from '../../utils/screen'
import { useTheme } from '@/hooks/theme/ThemeProvider'
import { Colors } from '@/constants/Colors'

// 导入所有需要的SVG图标
import AllIcon from '../../assets/images/myCenter/reports/all.svg'
import LotteryIcon from '../../assets/images/myCenter/reports/lottery.svg'
import RealIcon from '../../assets/images/myCenter/reports/real.svg'
import QipaiIcon from '../../assets/images/myCenter/reports/qipai.svg'
import SportIcon from '../../assets/images/myCenter/reports/sport.svg'
import FishingIcon from '../../assets/images/myCenter/reports/fishing.svg'
import DianjingIcon from '../../assets/images/myCenter/reports/dianjing.svg'
import DianziIcon from '../../assets/images/myCenter/reports/dianzi.svg'

const tabIcons = {
  // 全部
  'all': AllIcon,
  // 彩票
  'lottery': LotteryIcon,
  // 真人
  'real': RealIcon,
  // 棋牌
  'qipai': QipaiIcon,
  // 体育
  'sport': SportIcon,
  // 捕鱼
  'fishing': FishingIcon,
  // 电竞
  'dianjing': DianjingIcon,
  // 电子
  'dianzi': DianziIcon,
}

interface Props {
  className?: string
}

interface TabItem {
  name: string
  icon: string
}

const RecordTab = ({
  tabs,
  selectedIndex,
  setIndex,
  onChange,
  renderItem,
  tabStyle,
}: Props & {
  tabs: TabItem[],
  selectedIndex: number,
  setIndex: Function,
  onChange?: (index: number) => void,
  renderItem?: (tab: TabItem, index: number) => React.ReactNode,
  tabStyle?: ViewStyle
}) => {
  const { theme } = useTheme()
  const scrollRef = useRef<any>(null)
  const indicatorRef = useRef(new Animated.Value(selectedIndex)).current
  const scrollXRef = useRef(0)
  const isWebDraggingRef = useRef(false)
  const dragStartClientXRef = useRef(0)
  const scrollAtDragStartRef = useRef(0)
  const webDragMovedRef = useRef(false)
  const lastWebGestureWasDragRef = useRef(false)
  //const colors = useThemeColor({}, 'themeColor')
  const [parentWidth, setParentWidth] = useState(screen.get('window').width)
  const isWeb = Platform.OS === 'web'

  useEffect(() => {
    const updateLayout = () => {
      setParentWidth(screen.get('window').width)
    }
    const subscription = Dimensions.addEventListener('change', updateLayout)
    return () => subscription?.remove()
  }, [])
  const tabWidth = parentWidth / Math.min(tabs.length || 1, 5.3)

  useEffect(() => {
    if (selectedIndex != null) {
      setTimeout(() => handleTabPress(selectedIndex), 100)
    }
  }, [selectedIndex])

  const handleTabPress = (index: number) => {
    if (lastWebGestureWasDragRef.current) {
      lastWebGestureWasDragRef.current = false
      return
    }
    setIndex(index)
    if (onChange) onChange(index)

    Animated.spring(indicatorRef, {
      toValue: index * tabWidth,
      useNativeDriver: false,
    }).start()

    const scrollOffset = index * tabWidth - parentWidth / 2 + tabWidth / 2

    scrollRef.current.scrollTo({
      x: Math.max(0, scrollOffset),
      animated: true,
    })
  }

  useEffect(() => {
    if (!isWeb) return
    const DRAG_THRESHOLD = 6
    const onMove = (e: MouseEvent) => {
      if (!isWebDraggingRef.current) return
      const dx = dragStartClientXRef.current - e.clientX
      if (Math.abs(dx) > DRAG_THRESHOLD) {
        webDragMovedRef.current = true
      }
      const newX = Math.max(0, scrollAtDragStartRef.current + dx)
      scrollRef.current?.scrollTo?.({ x: newX, animated: false })
    }
    const onUp = () => {
      if (!isWebDraggingRef.current) return
      isWebDraggingRef.current = false
      if (typeof document !== 'undefined') {
        document.body.style.cursor = ''
      }
      if (webDragMovedRef.current) {
        lastWebGestureWasDragRef.current = true
      }
      webDragMovedRef.current = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      if (typeof document !== 'undefined') {
        document.body.style.cursor = ''
      }
    }
  }, [isWeb])

  const getTabIcon = (code: string, isActive: boolean) => {
    return tabIcons[code as keyof typeof tabIcons] || tabIcons.all
  }

  const renderSVGIcon = (iconName: string, isActive: boolean) => {
    const IconComponent = getTabIcon(iconName, isActive);
    const fillColor = isActive ? Colors[theme].primary : '#BDC2E8';

    return (
      <IconComponent
        width={22}
        height={22}
        color={fillColor}
      />
    );
  };

  return (
    <View className='' style={tabStyle} onLayout={(e) => {
      if (tabs.length < 5) setParentWidth(e.nativeEvent.layout.width)
    }}>
      <ScrollView
        horizontal
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        className="hide-scrollbar"
        contentContainerStyle={{
          alignItems: 'center', marginTop: 10
        }
        }
        scrollEventThrottle={16}
        onScroll={(e) => {
          scrollXRef.current = e.nativeEvent.contentOffset.x
        }}
        {...(isWeb
          ? {
            onMouseDown: (e: { nativeEvent: { clientX: number } }) => {
              const cx = e.nativeEvent.clientX
              lastWebGestureWasDragRef.current = false
              isWebDraggingRef.current = true
              dragStartClientXRef.current = cx
              scrollAtDragStartRef.current = scrollXRef.current
              webDragMovedRef.current = false
              if (typeof document !== 'undefined') {
                document.body.style.cursor = 'grabbing'
              }
            },
            style: {
              cursor: 'grab' as const,
              userSelect: 'none' as const,
            },
          }
          : {})}
      >
        {tabs.map((tab, index) => (
          <View key={index} style={{ position: 'relative', width: tabWidth }}>
            <TouchableOpacity
              style={[
                { width: tabWidth },
                {
                  borderRadius: 8,
                }
              ]}
              onPress={() => handleTabPress(index)}
            >
              {
                renderItem ? renderItem(tab, index) :
                  <View
                    className="items-center"
                    style={{
                      height: 55,
                      paddingVertical: 4,
                      paddingHorizontal: 4,
                      width: tabWidth,
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{
                      width: 22,
                      height: 22,
                      marginTop: -2,
                    }}>
                      {renderSVGIcon(tab.icon, selectedIndex === index)}
                    </View>
                    <View style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: 32,
                      paddingHorizontal: 2,
                    }}>
                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={{
                          fontSize: 12,
                          color: selectedIndex === index ? Colors[theme].primary : '#666666',
                          fontWeight: selectedIndex === index ? '600' : '400',
                          lineHeight: 15,
                          textAlign: 'center',
                          width: tabWidth - 8,
                        }}
                      >
                        {tab.name}
                      </Text>
                    </View>
                  </View>
              }
            </TouchableOpacity>

            {/* 横线指示器 */}
            <View
              style={{
                position: 'absolute',
                bottom: 1,
                left: tabWidth * 0.1, // 居中：tabWidth * (1 - 0.8) / 2
                width: tabWidth * 0.8,
                height: 2,
                borderRadius: 0.3,
                backgroundColor: selectedIndex === index ? Colors[theme].primary : 'transparent',
              }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default React.memo(RecordTab)
