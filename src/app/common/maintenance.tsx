import { View, Image, Text, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { getBannerServer } from "@/api";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { configAsync } from "@/store/user/userSlice";

const Maintenance = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const accInfoInFlight = useRef(false);
  const cfg_site_base: any = useSelector(
    (state: RootState) => state?.user?.cfg_site_base
  );

  const openCustomerServiceLink = useCallback(async () => {
    const tryOpen = async (url: string) => {
      if (!url) return false;
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    };
    await tryOpen(cfg_site_base?.customServiceLink || "");
  }, [cfg_site_base?.customServiceLink]);

  useEffect(() => {
    const POLL_MS = 5000;
    const tick = () => {
      if (accInfoInFlight.current) return;
      accInfoInFlight.current = true;
      getBannerServer()
        .then(async (res) => {
          if (res?.data?.code === 0) {
            clearInterval(id);
            try {
              await dispatch(configAsync()).unwrap();
            } catch {
              // 仍回首頁，避免維護結束後因配置接口異常卡在維護頁
            }
            router.replace("/home" as any);
          }
        })
        .finally(() => {
          accInfoInFlight.current = false;
        });
    };
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [router, dispatch]);

  return (
    <SafeAreaView className="flex-1">
      <View className={`flex-1 bg-${theme}-background`}>
        <View className="flex-1 items-center justify-center px-6">
          <Image
            source={require("@/assets/images/common/error_black.webp")}
            style={{ width: 180, height: 180 }}
            resizeMode="contain"
          />
          <Text
            className={`mt-2 text-sm text-${theme}-text`}
            style={{ textAlign: "center", opacity: 0.75 }}
          >
            {t("maintenance.desc1")}
          </Text>
          <Text
            className={`mt-1 text-sm text-${theme}-text`}
            style={{ textAlign: "center", opacity: 0.75 }}
          >
            {t("maintenance.desc2")}
          </Text>

          <Pressable
            className={`mt-6 h-8 px-4  items-center justify-center rounded-full bg-${theme}-primary`}
            onPress={() => void openCustomerServiceLink()}
          >
            <Text style={{fontSize:13}} className={`text-base  text-${theme}-btnText`}>
              {t("common.onlineSupport")}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Maintenance;