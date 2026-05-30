import React from "react";
import { View, type StyleProp, type ImageStyle, type ViewStyle } from "react-native";
import AutoImage from "@/components/common/AutoImage";

export function ActiveCenterMiningCover({
  uri,
  imageStyle,
  viewStyle,
}: {
  uri?: string;
  imageStyle?: StyleProp<ImageStyle>;
  viewStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View className="w-full">
      <AutoImage
        uri={uri ?? ""}
        resizeMode="cover"
        imageStyle={imageStyle}
        viewStyle={viewStyle}
        defaultIsSvg={true}
        autoAspectRatio={true}
      />
    </View>
  );
}

