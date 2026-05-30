import { Index } from "@/components/login/Index";
import { Colors } from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform, View } from 'react-native';
import { useEffect, useRef } from "react";
import { useToast } from "@/components/common/toast";
import { useTranslation } from "react-i18next";

const LoginAndRegister = () => {
  const { theme } = useTheme(); //主题
  // const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const router = useRouter();
  const { isAfterAuthLoss } = useLocalSearchParams<{ isAfterAuthLoss?: string }>();
  const toast = useToast();
  const { t, i18n, ready } = useTranslation();
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!ready) return; // 如果 i18n 还没准备好，直接返回
    if (warnedRef.current || isAfterAuthLoss !== '1') return;

    warnedRef.current = true;
    toast.warn(t("login.pleaseReLogin"));
    router.setParams({ isAfterAuthLoss: undefined });
  }, [ready, isAfterAuthLoss, t]);

  //关闭登录注册
  const toggleModal = () => {
    // navigation.goBack();
    router.replace("/(tabs)/home");
  };
  return (
    Platform.OS === "ios" ? (
      <View className="flex-1" style={{ backgroundColor: Colors[theme].background }}>
        <Index data={{ toggleModal, isLogin: true }} />
      </View>
    ) : (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: Colors[theme].background }}
      >
        <Index data={{ toggleModal, isLogin: true }} />
      </SafeAreaView>
    ))
};


export default LoginAndRegister;
