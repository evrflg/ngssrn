/*
 * @FilePath: \ngrn\src\components\common\Dialog.tsx
 * @Description: 弹窗组件
 */
import React, { FC } from "react";
import Modal from "react-native-modal";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/theme/ThemeProvider"
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
  ImageBackground
} from "react-native";

interface DialogProps {
  visible: boolean; // 是否显示弹窗
  setVisible: (visible: boolean) => void; // 设置弹窗显示隐藏
  title?: string; // 弹窗标题
  titleHasBackground?: boolean;
  TitleComponent?: FC<{}>; // 弹窗标题组件
  isLinearGradientBg?: boolean; // 是否使用渐变背景
  children: React.ReactNode; // 弹窗内容插槽
  style?: StyleProp<ViewStyle>;
  onModalHide?: () => void;
  animationOutTiming?: number
}

function getTitleBackground(theme: string) {
  switch (theme) {
    case 'greenBlack':
      return require("@/assets/images/common/popup-header-greenBlack.png");
    case 'blue':
    case 'blueWhite':
      return require("@/assets/images/common/popup-header-blue.png");
    default:
      return require("@/assets/images/common/popup-header-orange.png");
  }
}

export default function Dialog(props: DialogProps) {
  const {
    visible,
    style,
    title,
    titleHasBackground,
    isLinearGradientBg,
    children,
    TitleComponent,
    animationOutTiming,
    setVisible,
    onModalHide
  } = props;
  const { theme } = useTheme();
  const start_color = useThemeColor({}, "gradientStart");
  const end_color = useThemeColor({}, "gradientEnd");
  const colors: [string, string] = [start_color || "#ff9801", end_color || "#fcbc42"];
  const { width } = useWindowDimensions();

  function renderTitle() {
    if (TitleComponent) return <TitleComponent />
    if (titleHasBackground) {
      return (
        <ImageBackground
          source={getTitleBackground(theme)}
          style={{ height: 44, width: '100%' }}
          resizeMode="stretch"
          className={`flex items-center justify-center`}
        >
          <Text className="text-white text-base font-semibold">{title}</Text>
        </ImageBackground>
      )
    }
    if (title) return <Text className="text-center font-extrabold p-4">{title}</Text>
    return null

  }

  return (
    <Modal animationIn={"slideInUp"} isVisible={visible} backdropOpacity={0.5} onModalHide={onModalHide} animationOutTiming={animationOutTiming || 100} style={{ justifyContent: 'center', alignItems: 'center' }}>
      {isLinearGradientBg ? (
        <LinearGradient
          className="max-h-[75vh]"
          colors={colors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.modal, style, { width: Math.min(400, width * 0.9) }]}
        >
          {renderTitle()}
          <View>{children}</View>
        </LinearGradient>
      ) : (
        <View
          className={`max-h-[75vh] bg-${theme}-btnText`}
          style={[
            style,
            styles.modal,
            { width: Math.min(400, width * 0.9) }
          ]}
        >
          {renderTitle()}
          <View className="p-3">{children}</View>
        </View>
      )
      }

      <TouchableOpacity
        style={{ marginTop: 9, marginHorizontal: "auto" }}
        onPress={() => setVisible(false)}
      >
        <Ionicons color={"#fff"} name={"close-circle-outline"} size={34} />
      </TouchableOpacity>
    </Modal >
  );
}

const styles = StyleSheet.create({
  modal: {
    borderRadius: 16,
    overflow: 'hidden'
  }
});
