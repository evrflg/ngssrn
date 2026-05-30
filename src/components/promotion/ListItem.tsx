import { FC, ReactNode } from "react";
import { View, Text, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { rf } from "@/utils/scaleFont";

interface ListItemProps {
  IconComponent: FC<{ color: string }>;
  title: string;
  url?: string;
  iconName?: "chevron-forward" | "copy-outline";
  children?: ReactNode;
  clickHandler?: () => void;
}

const ListItem: FC<ListItemProps> = ({
  IconComponent,
  title,
  children,
  url,
  iconName = "chevron-forward",
  clickHandler,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {
    theme,
    themeColors: { primary },
  } = useTheme();

  return (
    <Pressable
      onPress={
        clickHandler ??
        (() => {
          if (!url) return;
          navigation.push(url);
        })
      }
    >
      <View
        className={`flex-1 flex-row items-center rounded-lg p-2.5 mb-2 bg-${theme}-btnText
        shadow shadow-black/10 shadow-offset-[1px/1px] shadow-radius-[2px] elevation-[4]`}
      >
        <IconComponent color={primary} />
        <Text className={`ml-2 text-${theme}-text`} style={{ fontSize: rf(12) }}>
          {title}
        </Text>
        <View className="flex-1">{children}</View>
        <Ionicons color={"#666"} name={iconName} size={20} />
      </View>
    </Pressable>
  );
};

export default ListItem;
