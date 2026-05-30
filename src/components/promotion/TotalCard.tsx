import { Text, View } from 'react-native'
import React, { FC, ReactNode } from 'react'
import { I18nText } from '@/components/I18nText'
import { useTheme } from "@/hooks/theme/ThemeProvider";

interface TotalCardProps {
  children: ReactNode
}
interface TotalCardItemProps {
  labelKey: string,
  value?: string | number
  border?: boolean
  className?: string
}

const TotalCard: FC<TotalCardProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <View className={`flex-row flex-wrap p-2.5 rounded-lg mb-3 bg-${theme}-gradientStart`}>
      {children}
    </View>
  )
}

export const TotalCardItem: FC<TotalCardItemProps> = ({ labelKey, value, border, className }) => {
  let styles = 'w-1/2 pb-2 '
  const { theme } = useTheme()
  if (className) styles += className
  if (border) styles += ' border-l ' + (theme === 'greenBlack' ? 'border-l-[#759163]' : 'border-l-[#d9edfe]')

  return (
    <View className={styles}>
      <Text className={`text-${theme}-btnText text-base font-bold text-center leading-1`}>{value || 0}</Text>
      <I18nText
        i18nKey={labelKey}
        className={`text-${theme}-btnText text-xs text-center`}
      />
    </View>
  )
}

export default TotalCard
