//vip弹窗的专属标头
import React from "react";
import { View, ImageBackground, StyleSheet, Text } from "react-native";
import { proPopup } from "@/components/active/components/activeConfg";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import { vipTheme } from "../../activeConfg";

const ProPopupContext = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <View className="w-full">
      <View
        className="mb-3 justify-center items-center overflow-hidden rounded-lg"
        style={{ backgroundColor: proPopup[theme].contextBg }}
      >
        <View className="w-full flex-row justify-between items-start">
          <ImageBackground
            style={styles.titlebg}
            resizeMode="contain"
            source={vipTheme[theme].title}
          >
            <Text
              className="-ml-3"
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: '#fff',
              }}
            >
              {t("active.vip.jjbz")}
            </Text>
          </ImageBackground>
        </View>
        <View className="flex-row items-center px-4 py-4">
          <Text
            style={{ fontSize: 11, color: Colors[theme].text }}
            numberOfLines={0}
          >
            {t("active.vip.guize1")}
          </Text>
        </View>
      </View>
      <View
        className="mb-3 justify-center items-center overflow-hidden rounded-lg"
        style={{ backgroundColor: proPopup[theme].contextBg }}
      >
        <View className="w-full flex-row justify-between items-start">
          <ImageBackground
            style={styles.titlebg}
            resizeMode="contain"
            source={vipTheme[theme].title}
          >
            <Text
              className="-ml-3"
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: '#fff',
              }}
            >
              {t("active.vip.rixin")}
            </Text>
          </ImageBackground>
        </View>
        <View className="flex-row items-center px-4 py-4">
          <Text
            style={{ fontSize: 11, color: Colors[theme].text }}
            numberOfLines={0}
          >
            {t("active.vip.guize2")}
          </Text>
        </View>
      </View>

      <View
        className="mb-3 justify-center items-center overflow-hidden rounded-lg"
        style={{ backgroundColor: proPopup[theme].contextBg }}
      >
        <View className="w-full flex-row justify-between items-start">
          <ImageBackground
            style={styles.titlebg}
            resizeMode="contain"
            source={vipTheme[theme].title}
          >
            <Text
              className="-ml-3"
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: '#fff',
              }}
            >
              {t("active.vip.zhouxin")}
            </Text>
          </ImageBackground>
        </View>
        <View className="flex-row items-center px-4 py-4">
          <Text
            style={{ fontSize: 11, color: Colors[theme].text }}
            numberOfLines={0}
          >
            {t("active.vip.guize3")}
          </Text>
        </View>
      </View>

      <View
        className="mb-3 justify-center items-center overflow-hidden rounded-lg"
        style={{ backgroundColor: proPopup[theme].contextBg }}
      >
        <View className="w-full flex-row justify-between items-start">
          <ImageBackground
            style={styles.titlebg}
            resizeMode="contain"
            source={vipTheme[theme].title}
          >
            <Text
              className="-ml-3"
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: '#fff',
              }}
            >
              {t("active.vip.yuexin")}
            </Text>
          </ImageBackground>
        </View>
        <View className="flex-row items-center px-4 py-4">
          <Text
            style={{ fontSize: 11, color: Colors[theme].text }}
            numberOfLines={0}
          >
            {t("active.vip.guize4")}
          </Text>
        </View>
      </View>

      <View
        className="mb-3 justify-center items-center overflow-hidden rounded-lg"
        style={{ backgroundColor: proPopup[theme].contextBg }}
      >
        <View className="w-full flex-row justify-between items-start">
          <ImageBackground
            style={styles.titlebg}
            resizeMode="contain"
            source={vipTheme[theme].title}
          >
            <Text
              className="-ml-3"
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: '#fff',
              }}
            >
              {t("active.vip.gqsj")}
            </Text>
          </ImageBackground>
        </View>
        <View className="flex-row items-center px-4 py-4">
          <Text
            style={{ fontSize: 11, color: Colors[theme].text }}
            numberOfLines={0}
          >
            {t("active.vip.guize5")}
          </Text>
        </View>
      </View>

      <View
        className="mb-3 justify-center items-center overflow-hidden rounded-lg"
        style={{ backgroundColor: proPopup[theme].contextBg }}
      >
        <View className="w-full flex-row justify-between items-start">
          <ImageBackground
            style={styles.titlebg}
            resizeMode="contain"
            source={vipTheme[theme].title}
          >
            <Text
              className="-ml-3"
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: '#fff',
              }}
            >
              {t("active.vip.shsm")}
            </Text>
          </ImageBackground>
        </View>
        <View className="flex-row items-center px-4 py-4">
          <Text
            style={{ fontSize: 11, color: Colors[theme].text }}
            numberOfLines={0}
          >
            {t("active.vip.guize6")}
          </Text>
        </View>
      </View>

      <View
        className="mb-3 justify-center items-center overflow-hidden rounded-lg"
        style={{ backgroundColor: proPopup[theme].contextBg }}
      >
        <View className="w-full flex-row justify-between items-start">
          <ImageBackground
            style={styles.titlebg}
            resizeMode="contain"
            source={vipTheme[theme].title}
          >
            <Text
              className="-ml-3"
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: '#fff',
              }}
            >
              {t("active.vip.shengming")}
            </Text>
          </ImageBackground>
        </View>
        <View className="flex-row items-center px-4 py-4">
          <Text
            style={{ fontSize: 11, color: Colors[theme].text }}
            numberOfLines={0}
          >
            {t("active.vip.guize7")}
          </Text>
        </View>
      </View>

      <View
        className="mb-3 justify-center items-center overflow-hidden rounded-lg"
        style={{ backgroundColor: proPopup[theme].contextBg }}
      >
        <View className="w-full flex-row justify-between items-start">
          <ImageBackground
            style={styles.titlebg}
            resizeMode="contain"
            source={vipTheme[theme].title}
          >
            <Text
              className="-ml-3"
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: '#fff',
              }}
            >
              {t("active.vip.shuoming")}
            </Text>
          </ImageBackground>
        </View>
        <View className="flex-row items-center px-4 py-4">
          <Text
            style={{ fontSize: 11, color: Colors[theme].text }}
            numberOfLines={0}
          >
            {t("active.vip.guize8")}
          </Text>
        </View>
      </View>

      <View
        className="justify-center items-center overflow-hidden rounded-lg"
        style={{ backgroundColor: proPopup[theme].contextBg }}
      >
        <View className="w-full flex-row justify-between items-start">
          <ImageBackground
            style={styles.titlebg}
            resizeMode="contain"
            source={vipTheme[theme].title}
          >
            <Text
              className="-ml-3"
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: '#fff',
              }}
            >
              {t("active.vip.shiytk")}
            </Text>
          </ImageBackground>
        </View>
        <View className="flex-row items-center px-4 py-4">
          <Text
            style={{ fontSize: 11, color: Colors[theme].text }}
            numberOfLines={0}
          >
            {t("active.vip.guize9")}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  titlebg: {
    width: 141,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProPopupContext;
