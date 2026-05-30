/*
 * @FilePath: \ngss-rn\src\components\NoData.tsx
 * @Description: 暂无数据
 */
import React, { FC } from 'react';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { Text, View, ViewStyle } from 'react-native';
import { NoDataIcon } from '@/components/icons/wallet';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from "@/hooks/theme/ThemeProvider";

interface Props {
  text?: string
  style?: ViewStyle
  className?: string
  iconClassName?: string
};

const NoData: FC<Props> = ({ text, style, className, iconClassName}) => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const primaryColor = useThemeColor({}, "primary")

  return (
    <View style={style} className={'m-auto ' + className}>
      <NoDataIcon
        fill={primaryColor}
        className={'w-[140px] h-[130px] mb-1 ' + iconClassName}
      />
      <Text style={{ color: Colors[theme].text }} className="text-xs text-center">{ text || t('common.noData') }</Text>
    </View>
  )
}

export default NoData;