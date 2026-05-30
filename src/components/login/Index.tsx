import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { RootState } from "@/store/store";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Keyboard,
  type KeyboardEvent,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { LoginArea } from "./LoginArea";
import { RegisterArea } from "./RegisterArea";
import { bgMap } from "./utils/const";
import { useIsFocused } from "@react-navigation/native";
import { PublicitiesList } from "@/components/home/popup/publicitiesList/PublicitiesList";
import { PublicityType } from "@/types/publicity";
import { useCommon } from "@/hooks/CommonProvider";
import { useDynamicMaxWidth } from "@/hooks/useMaxWidth";

const android = Platform.OS === "android";
const isIOS = Platform.OS === "ios";
const isWeb = Platform.OS === "web";

function useIOSKeyboardOverlapBottom(windowHeight: number): number {
  const [overlap, setOverlap] = useState(0);

  useEffect(() => {
    if (!isIOS) return;

    const onFrame = (e: KeyboardEvent) => {
      const { screenY } = e.endCoordinates;
      setOverlap(Math.max(0, windowHeight - screenY));
    };
    const onHide = () => setOverlap(0);

    const subShow = Keyboard.addListener("keyboardWillChangeFrame", onFrame);
    const subHide = Keyboard.addListener("keyboardWillHide", onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [windowHeight]);

  return overlap;
}

export const Index = React.memo(({ data }: any) => {
  const { toggleModal, isLogin } = data;
  const { height } = useWindowDimensions();
  const iosKeyboardOverlap = useIOSKeyboardOverlapBottom(height);
  const fullBleedStyle = isWeb
    ? { ...StyleSheet.absoluteFillObject, width: "100%" as const }
    : isIOS
      ? StyleSheet.absoluteFillObject
      : ({ width: "100%" as const, height } as const);
  const { theme } = useTheme(); //主题
  const insets = useSafeAreaInsets();
  const { maxWidth } = useDynamicMaxWidth();
  const config: any = useSelector(
    (state: RootState) => state?.user?.cfg_site_base
  );
  const { language } = useCommon()
  const { type } = useLocalSearchParams();
  const [loginOrRegister, setLoginOrRegister] = useState(isLogin ?? true);
  const isFocused = useIsFocused();
  // 是否展示宣传弹窗（即使为 true，弹窗组件里还有多层检查是否要显示）
  const showLoginRegisterPublicity = isFocused && language // 等待 language 就绪，确保 API 请求使用正确的语言

  useEffect(() => {
    if (type) {
      let islogin = type == "login" ? true : false;
      setLoginOrRegister(islogin);
    } else if (isLogin !== undefined) {
      setLoginOrRegister(isLogin);
    }
  }, [type, isLogin]);

  const closePopup = () => {
    if (toggleModal) {
      toggleModal();
    }
  };

  return (
    <View
      className="flex-1 justify-center items-center relative"
      style={{ backgroundColor: Colors[theme].background }}
    >
      <View
        className="absolute  right-5 flex justify-center items-center rounded-md"
        style={{
          width: 25,
          height: 25,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          zIndex: 1,
          top: isIOS ? insets.top + 8 : android ? insets.top : 20,
          right: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            closePopup();
          }}
          className="flex-1 justify-center items-center"
        >
          <AntDesign name="close" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={fullBleedStyle} className="absolute top-0 left-0">
        <ImageBackground
          source={
            config?.logRegBgUrl
              ? { uri: config?.logRegBgUrl }
              : bgMap[theme].bgimg
          }
          // resizeMode="stretch"
          style={{ width: "100%", height: "100%" }}
        >
          <View className="flex-row justify-center items-center">
            <Image
              source={bgMap[theme].bgTopImg}
              style={{
                width: maxWidth * 0.4,
                height: maxWidth * 0.4,
                marginTop: isIOS ? insets.top + 20 : 20,
              }}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>
      </View>
      {isWeb ? (
        <View
          style={fullBleedStyle}
          className="justify-center items-center absolute top-0">
          {loginOrRegister ? <LoginArea /> : <RegisterArea />}
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={fullBleedStyle}
          className="justify-center items-center absolute inset-0"
          keyboardVerticalOffset={Platform.OS === "ios"
            ? insets.top - 200 : 0
          }>
          {loginOrRegister ? <LoginArea /> : <RegisterArea />}
        </KeyboardAvoidingView>
      )}
      {
        // 登录注册宣传弹窗
        showLoginRegisterPublicity && (
          <View>
            <PublicitiesList
              standalone
              publicityTypesOverride={[PublicityType.LOGIN_REGISTER]}
            />
          </View>
        )
      }
    </View>
  );
});
