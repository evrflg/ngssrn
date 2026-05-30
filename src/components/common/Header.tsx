import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { Stack } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Icon } from "@rneui/themed";
import { I18nText } from "@/components/I18nText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";

interface RightEvent {
  rightText?: string;
  onBalancePress?: () => void;
  onRightPress?: () => void;
}

function HeaderRight({
  rightEvent = {},
  rightSelf,
  rightTextStyle,
}: {
  rightEvent: RightEvent;
  rightSelf: React.ReactNode;
  rightTextStyle?: any;
}) {
  const { theme } = useTheme(); //主题
  return (
    <View className="mr-[10px] flex flex-row items-center gap-[4px]">
      {/* 自定义右边内容 */}
      {rightSelf && rightSelf}
      {rightEvent?.rightText && (
        <TouchableOpacity
          className="flex flex-row items-center"
          onPress={() => rightEvent?.onRightPress?.()}
        >
          <I18nText
            style={[{ color: Colors[theme].text }, rightTextStyle]}
            i18nKey={rightEvent?.rightText}
            className="mr-1"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

function HeaderText(props: { children: string; tintColor?: string; centerSelf?: React.ReactNode }) {
  return (
    <View className="flex-row items-center">
      <I18nText i18nKey={props.children} style={{ color: props.tintColor }} />
      {/* 自定义中间内容 */}
      {props.centerSelf && props.centerSelf}
    </View>
  );
}

function HeaderLeft({ navigation, leftSelf }: { navigation: any; leftSelf: React.ReactNode }) {
  const { theme } = useTheme(); //主题
  return (
    <TouchableOpacity
      style={{
        width: 44,
        height: 36,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingLeft: 2,
      }}
      className="flex flex-row items-center ml-[4px]"
      onPress={() => {
        if (!leftSelf) {
          navigation.goBack();
        }
      }}
    >
      {leftSelf ? (
        leftSelf
      ) : (
        <Icon name="chevron-left" type="feather" color={Colors[theme].text} size={24} />
      )}
    </TouchableOpacity>
  );
}

interface HideScreenHeaderProps {
  title: string;
  rightEvent?: RightEvent;
  leftSelf?: React.ReactNode;
  centerSelf?: React.ReactNode;
  rightSelf?: React.ReactNode;
}

export const HideScreenHeader = ({
  title,
  rightEvent = {},
  leftSelf,
  centerSelf,
  rightSelf,
}: HideScreenHeaderProps) => {
  const primary = useThemeColor({}, "primary");
  const { theme } = useTheme(); //主题
  const navigation = useNavigation();

  return (
    <View
      className="flex-row items-center justify-between"
      style={{
        backgroundColor: Colors[theme].cardBg1,
        borderBottomColor: primary,
        height: 42,
      }}
    >
      <View className="absolute" style={{ width: 44, height: 36, left: 0, zIndex: 100 }}>
        <HeaderLeft navigation={navigation} leftSelf={leftSelf} />
      </View>
      <View className="flex-1">
        {centerSelf ? (
          centerSelf
        ) : (
          <I18nText
            i18nKey={title}
            style={{ color: Colors[theme].text, fontSize: rf(14) }}
            className="text-center font-bold"
          />
        )}
      </View>
      <View className="absolute" style={{ right: 0 }}>
        <HeaderRight
          rightEvent={rightEvent}
          rightSelf={rightSelf}
          rightTextStyle={{ fontSize: rf(14) }}
        />
      </View>
    </View>
  );
};

interface HeaderProps {
  options: any;
  rightEvent?: RightEvent;
  showLeft?: boolean;
  showRight?: boolean;
  centerSelf?: React.ReactNode;
  leftSelf?: React.ReactNode;
  rightSelf?: React.ReactNode;
}

export const Header = ({
  options,
  rightEvent = {},
  centerSelf,
  leftSelf,
  rightSelf,
  showLeft = true,
  showRight = true,
}: HeaderProps) => {
  const primary = useThemeColor({}, "primary");
  const navigation = useNavigation();
  return (
    <Stack.Screen
      options={{
        headerStyle: {
          backgroundColor: primary,
          borderBottomColor: primary,
          height: 42,
        },
        headerBackVisible: false,
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        headerLeft: () => showLeft && <HeaderLeft navigation={navigation} leftSelf={leftSelf} />,
        headerTitle: (props) => <HeaderText {...props} centerSelf={centerSelf} />,
        headerRight: () =>
          showRight && <HeaderRight rightEvent={rightEvent} rightSelf={rightSelf} />,
        ...options,
      }}
    />
  );
};

export const SimpleHeader = (props: any) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { theme } = useTheme(); //主题
  return (
    <View
      style={{ height: 48, backgroundColor: Colors[theme].cardBg1 }}
      className="flex  justify-center items-center relative"
    >
      <Text
        numberOfLines={1} // 限制为 1 行
        ellipsizeMode="tail"
        style={{ fontWeight: 700, fontSize: 14, color: Colors[theme].text, maxWidth: 300 }}
      >
        {props?.title}
      </Text>
      <View
        className="absolute py-0.5 px-2.5 "
        style={{
          width: "100%",
          height: 52,
          top: 0,
          left: 0,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => {
            navigation.goBack();
          }}
          style={{
            width: 44,
            height: 36,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: 2,
          }}
        >
          <Icon name="chevron-left" type="feather" color={Colors[theme].text} size={18} />
        </Pressable>

        <View style={{ alignSelf: "auto" }}>{props?.rightOption}</View>
      </View>
    </View>
  );
};
