import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import BaseRowLine from "./BaseRowLine";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { BaseCell } from "@/components/ui/BaseCell";

type RowLike = {
  id: string | number;
  icon: React.ReactNode;
  label: string;
  value?: string;
};

export type BaseCardProps<T extends RowLike> = {
  items: T[];
  onPress: (item: T) => void;
  style?: StyleProp<ViewStyle>;
};

export default function BaseCard<T extends RowLike>({ items, onPress, style }: BaseCardProps<T>) {
  const { theme } = useTheme();

  return (
    <View style={[{ borderRadius: 8, backgroundColor: Colors[theme].cardBg1 }, style]}>
      {items.map((item) => (
        <BaseRowLine key={item.id} item={item} handlePress={() => onPress(item)} />
      ))}
    </View>
  );
}
