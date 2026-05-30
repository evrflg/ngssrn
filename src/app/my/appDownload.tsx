import { SimpleHeader } from "@/components/common/Header";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, View, ImageBackground, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import { LinearGradient } from "expo-linear-gradient";
import { getAppPackageListServer } from "@/api";
import NoData from "@/components/common/NoData";
import { useToast } from "@/components/common/toast";
import AntDesign from "@expo/vector-icons/AntDesign";

const appDownload = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [appPackageList, setAppPackageList] = useState<any[]>([]);
  const toast = useToast();
  useEffect(() => {
    getAppPackageList();
  }, []);
  const getAppPackageList = () => {
    toast.loading(true);
    getAppPackageListServer()
      .then((res: any) => {
        if (res?.data?.data) {
          setAppPackageList(res.data.data);
        }
      })
      .finally(() => {
        toast.loading(false);
      });
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <View className="flex-1 relative">
        <ImageBackground
          className="absolute top-0 left-0"
          style={{ width: "100%", height: "100%" }}
          source={require("@/assets/images/home/appdownload/pic_beijing_green.png")}
        ></ImageBackground>
        <SimpleHeader title={t("app.download")} />
        <ScrollView
          className="hide-scrollbar"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "center",
              paddingVertical: 15,
              paddingHorizontal: 12,
            }}
          >
            {appPackageList.length > 0 ? (
              <>
                {appPackageList.map((item: any, index: number) => {
                  const systemType = item.systemType; //1安卓 2苹果
                  return (
                    <TouchableOpacity
                      key={index}
                      style={{ width: "100%", height: 170, marginBottom: 10 }}
                      onPress={() => {
                        let url: string = item.appPath;
                        if (url) {
                          window.open(url);
                        }
                      }}
                    >
                      <View
                        style={{
                          width: "100%",
                          height: 170,
                          backgroundColor: Colors[theme].cardBg1,
                          borderRadius: 10,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <ImageBackground
                          className="flex-1"
                          source={
                            systemType == 2
                              ? require("@/assets/images/home/appdownload/img_android.png")
                              : require("@/assets/images/home/appdownload/img_ios.png")
                          }
                          style={{ width: "100%", height: 104 }}
                          resizeMode="stretch"
                        >
                          <View style={{ height: 60, marginLeft: 20, marginTop: 20 }}>
                            <Text style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>
                              {systemType == 2 ? "iOS" : "Android"} {t("app.download")}
                            </Text>
                            <View
                              className="flex justify-start flex-row"
                              style={{ height: 30, marginTop: 10 }}
                            >
                              <View
                                className="flex justify-start flex-row items-center pl-3 pr-3"
                                style={{ borderWidth: 1, borderColor: "#fff", borderRadius: 15 }}
                              >
                                {systemType == 1 && (
                                  <FontAwesome name="android" size={20} color="#fff" />
                                )}
                                {systemType == 2 && (
                                  <FontAwesome name="apple" size={20} color="#fff" />
                                )}
                                <Text className="ml-2 mr-2" style={{ color: "#fff", fontSize: 14 }}>
                                  {systemType == 2 ? "IOS" : "Android"}
                                </Text>
                                <View
                                  className="justify-center items-center"
                                  style={{
                                    width: 16,
                                    height: 16,
                                    borderWidth: 1,
                                    borderColor: "#fff",
                                    borderRadius: 16,
                                  }}
                                >
                                  <Entypo name="chevron-small-right" size={14} color="#fff" />
                                </View>
                              </View>
                            </View>
                          </View>
                        </ImageBackground>
                        <View
                          className="flex-row justify-between pt-2 pl-3 pr-3"
                          style={{ width: "100%", height: 66 }}
                        >
                          <View>
                            <View className="flex-row items-center">
                              <Image
                                source={{ uri: item.logo192 || item.logo144 }}
                                style={{ width: 30, height: 30 }}
                                resizeMode="stretch"
                              />
                              <Text style={{ color: Colors[theme].text, fontSize: 14 }}>
                                {" "}
                                {item.name}
                              </Text>
                            </View>
                            <Text
                              className="mt-0"
                              style={{ color: Colors[theme].lightText, fontSize: 11 }}
                            >
                              {t("app.mark")}
                            </Text>
                          </View>
                          <View className="justify-center items-center">
                            <LinearGradient
                              start={{ x: 1, y: 0 }}
                              end={{ x: 0, y: 0 }}
                              style={{
                                height: 24,
                                borderRadius: 24,
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              colors={[Colors[theme].gradient, Colors[theme].primary]}
                            >
                              <Text
                                style={{ fontSize: 13, color: Colors[theme].btnText }}
                                className="px-2"
                              >
                                {t("app.download")}
                              </Text>
                              <View
                                className="justify-center items-center mr-2"
                                style={{ width: 16, height: 16, borderRadius: 16 }}
                              >
                                <Entypo
                                  name="chevron-small-right"
                                  size={16}
                                  color={Colors[theme].btnText}
                                />
                              </View>
                            </LinearGradient>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <View className="flex-row justify-center items-center">
                  <FontAwesome name="apple" size={24} color="#fff" />
                  <AntDesign className="pl-3 pr-3" name="close" size={12} color="#fff" />
                  <FontAwesome name="android" size={24} color="#fff" />
                </View>
              </>
            ) : (
              <NoData />
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default appDownload;
