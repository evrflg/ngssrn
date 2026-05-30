import React, { forwardRef } from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from "react-native"
import { useTranslation } from 'react-i18next'
import Entypo from '@expo/vector-icons/Entypo'
import { useTheme } from '@/hooks/theme/ThemeProvider'

interface DropdownButtonProps {
  className?: string,
  text: string
  style?: any
  onPress: () => void
  centerContent?: boolean // 新增参数：是否居中显示内容
}

const DropdownButton = forwardRef<any, DropdownButtonProps>(({ className = '', text, style, onPress, centerContent = false }, ref) => {
  const { t } = useTranslation()
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      ref={ref}
      onPress={onPress}
      style={[styles.button, centerContent && styles.centeredButton, style]}
      className={`bg-${theme}-btnText ${className}`}
    >
      {centerContent ? (
        <View style={styles.contentRow}>
          <Text
            style={styles.centeredText}
            className={`text-[#acafc2]`}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {t(text)}
          </Text>
          <View style={styles.rightIconWrap}>
            <Entypo
              name="chevron-small-down"
              size={20}
              style={styles.iconBase}
            />
          </View>
        </View>
      ) : (
        <View style={styles.contentRow}>
          <Text
            style={styles.text}
            className={`text-[#acafc2]`}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {t(text)}
          </Text>
          <View style={styles.rightIconWrap}>
            <Entypo
              name="chevron-small-down"
              size={20}
              className={`text-[#888]`}
              style={styles.iconBase}
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 38,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minWidth: 0,
  },
  text: {
    fontSize: 12,
    textAlignVertical: 'center',
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  iconBase: {
    height: 20,
    width: 20,
    alignSelf: 'center',
    color: '#888'
  },
  centeredButton: {
    justifyContent: 'center',
  },
  centeredText: {
    fontSize: 14,
    textAlignVertical: 'center',
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  rightIconWrap: {
    position: 'absolute',
    right: 0,
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default DropdownButton