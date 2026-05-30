import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTheme } from '@/hooks/theme/ThemeProvider'
import { Colors } from '@/constants/Colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

let globalNotificationRef: NotificationPopupHandle | null = null
const { width: screenWidth } = Dimensions.get('window')

export interface InternalMessage {
  templateNickname: string
  templateContent: string
}
export interface NotificationPopupHandle {
  show: (content: string) => void
}

export const showNotificationPopup = (content: string) => {
  if (globalNotificationRef) {
    globalNotificationRef.show(content)
  } else {
    console.warn('🚀 ~ NotificationPopup is not mounted yet:')
  }
}

export const NotificationPopup = forwardRef<NotificationPopupHandle>((props, ref) => {
  const router = useRouter()
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const [queue, setQueue] = useState<InternalMessage[]>([]) // 站内信队列
  const [currentMessage, setCurrentMessage] = useState<InternalMessage | null>(null)
  const [isShowing, setIsShowing] = useState(false)
  const slideAnim = useRef(new Animated.Value(screenWidth)).current
  const autoCloseTimer = useRef<NodeJS.Timeout | null>(null)

  useImperativeHandle(ref, () => ({
    show: (content: string) => {
      const regex = /(.+?)\[nick-name:(.+?)\]/gs
      const matches = [...content.matchAll(regex)]
      
      const newMessages = matches.map(match => {
        if (match && match.length >= 3) {
          return {
            templateContent: match[1].trim(),
            templateNickname: match[2].trim()
          }
        }
        return null
      }).filter(Boolean) as InternalMessage[]
      
      if (newMessages.length > 0) {
        setQueue(prev => [...prev, ...newMessages])
      }
    }
  }))
  useEffect(() => {
    globalNotificationRef = {
      show: (content: string) => {
        const regex = /(.+?)\[nick-name:(.+?)\]/gs
        const matches = [...content.matchAll(regex)]
        
        const newMessages = matches.map(match => {
          if (match && match.length >= 3) {
            return {
              templateContent: match[1].trim(),
              templateNickname: match[2].trim()
            }
          }
          return null
        }).filter(Boolean) as InternalMessage[]
        
        if (newMessages.length > 0) {
          setQueue(prev => [...prev, ...newMessages])
        }
      }
    }
    return () => {
      globalNotificationRef = null
    }
  }, [])
  useEffect(() => {
    if (!isShowing && queue.length) processNextMessage()
  }, [queue, isShowing])

  const processNextMessage = () => {
    const nextMsg = queue[0]
    setCurrentMessage(nextMsg)
    setQueue(prev => prev.slice(1))
    setIsShowing(true)

    // 划入
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 350,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
      useNativeDriver: true,
    }).start(() => {
      // 消息展示5秒钟后自动消失
      autoCloseTimer.current = setTimeout(() => {
        closeCurrentMessage()
      }, 5000)
    })
  }
  const closeCurrentMessage = (onClosed?: () => void) => {
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current)
      autoCloseTimer.current = null
    }

    // 划出
    Animated.timing(slideAnim, {
      toValue: screenWidth,
      duration: 250,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setIsShowing(false)
      setCurrentMessage(null)
      onClosed?.()
    })
  }
  const handleClose = () => {
    closeCurrentMessage()
  }
  const handleCheckDetail = () => {
    closeCurrentMessage(() => {
      router.push('/my/message')
    })
    setQueue([])
  }

  if (!isShowing && !currentMessage) return null
  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top > 0 ? insets.top + 8 : 20,
          transform: [{ translateX: slideAnim }],
        }
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        className={`h-[72px] px-3 flex-row items-center gap-3 rounded-lg shadow-black border border-[rgba(0,0,0,0.05)] bg-${theme}-btnText`}
        activeOpacity={0.9}
        onPress={handleCheckDetail}
      >
        <Ionicons name="information-circle" color="#0688e5" size={24} />
        <View className='flex-1 justify-center'>
          <Text numberOfLines={1} className={`text-${theme}-text text-base font-semibold mb-1`}>
            {currentMessage?.templateNickname}
          </Text>
          <Text numberOfLines={1} className={`text-${theme}-lightText text-sm`}>
            {currentMessage?.templateContent}
          </Text>
        </View>
        <TouchableOpacity className='p-2 -mr-1' onPress={handleClose}>
          <Ionicons name="close" size={20} color={Colors[theme].lightText || '#999'} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  )
})

NotificationPopup.displayName = 'NotificationPopup'

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9999,
  }
})
