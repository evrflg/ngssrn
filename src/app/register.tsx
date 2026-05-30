import { Index } from "@/components/login/Index";
import { Colors } from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Platform, View } from "react-native";

const Register = () => {
  const { theme } = useTheme(); //主题
  // const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const router = useRouter();

  //关闭登录注册
  const toggleModal = () => {
    // navigation.goBack()
    // navigation.navigate("index");
    router.replace("/(tabs)/home");
  };

  return Platform.OS === "ios" ? (
    <View className="flex-1" style={{ backgroundColor: Colors[theme].background }}>
      <Index data={{ toggleModal, isLogin: false }} />
    </View>
  ) : (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors[theme].background }}
    >
      <Index data={{ toggleModal, isLogin: false }} />
    </SafeAreaView>
  );
};

export default Register;
