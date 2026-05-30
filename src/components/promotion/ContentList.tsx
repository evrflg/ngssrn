import { FC } from 'react'
import NoData from "@/components/common/NoData"
import { I18nText } from '@/components/I18nText'
import { useThemeColor } from "@/hooks/useThemeColor"
import { useTheme } from "@/hooks/theme/ThemeProvider"
import { FlatList, ActivityIndicator, View } from 'react-native'

interface ContentListProps {
  isLoading: boolean
  data: Array<any>
  className?: string
  contentContainerClassName?: string,
  noDataClass?: string
  style?: any
  ListHeaderComponent?: () => JSX.Element
  renderItem: (item: any) => JSX.Element
  keyExtractor: (item: any) => string
}

const ContentList: FC<ContentListProps> = ({ noDataClass = 'h-96', style, contentContainerClassName, ...props }) => {
  const primaryColor = useThemeColor({}, "primary")
  const { theme } = useTheme();

  return (
    <>
      <FlatList
        {...props}
        style={style}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onEndReachedThreshold={.3}
        ListEmptyComponent={
          props.isLoading
            ? <ActivityIndicator size="large" color={primaryColor} className='m-auto h-full' />
            : <View className={noDataClass}>
              <NoData />
            </View>
        }
        ListFooterComponent={() => (
          !props.isLoading && props.data.length > 0 && (
            <I18nText
              i18nKey='common.noMore'
              className={`text-center text-${theme}-textGray my-4`}
            />
          )
        )}
      />
    </>
  )
}

export default ContentList