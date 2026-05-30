import React from "react";
import { ScrollView, ActivityIndicator, View, ViewStyle, TextStyle } from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { I18nText } from "@/components/I18nText";

interface LoadData {
  isFetching: boolean;
  hasNextPage: boolean;
  loadMoreData: () => void;
}

interface BaseScrollLoadProps {
  children: React.ReactNode;
  loadData?: LoadData;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  needScroll?: boolean;
  className?: string;
  contentContainerClassName?: string;
}

const BaseScrollLoad = ({
  children,
  loadData,
  needScroll = true,
  containerStyle,
  textStyle,
  className = "",
  contentContainerClassName = "",
}: BaseScrollLoadProps) => {
  const { theme } = useTheme(); //主题

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isNearBottom && !loadData?.isFetching && loadData?.hasNextPage) {
      loadData?.loadMoreData();
    }
  };

  const loadText = () => {
    if (loadData?.isFetching) {
      return <ActivityIndicator className="my-1" size="small" color={Colors[theme].primary} />;
    }

    if (loadData?.hasNextPage) {
      return (
        <View
          className="w-full py-3 bg-charcoal-100"
          style={[containerStyle, { backgroundColor: Colors[theme].background }]}
        >
          <I18nText
            i18nKey="moreLoad"
            className={`text-sm text-${theme}-text text-center`}
            style={textStyle}
          />
        </View>
      );
    }

    return (
      <View
        className="w-full py-3"
        style={[containerStyle, { backgroundColor: Colors[theme].background }]}
      >
        <I18nText
          i18nKey="common.noMore"
          className={`text-sm text-center text-[#969799]`}
          style={textStyle}
        />
      </View>
    );
  };

  return (
    <ScrollView
      className={`hide-scrollbar flex-1 ${className}`}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={100}
      contentContainerClassName={contentContainerClassName}
    >
      {children}
      {needScroll && loadText()}
    </ScrollView>
  );
};

export default BaseScrollLoad;
