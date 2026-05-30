import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import { HideScreenHeader } from "@/components/common/Header";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from "@/store/store";
import { fetchSiteDataList } from "@/store/user/userSlice";
import { ABOUT_MENU_ICONS } from "@/constants/aboutIcon";
import NoData from "@/components/common/NoData";

export interface SiteDataVO {
  id: number           // 表id
  title: string        // 标题
  language: string     // 语种
  type: number         // 公告类型
  content: string      // 内容
  status: number       // 状态 0:启用,1:禁用
  startTime: Record<string, unknown>
  endTime: Record<string, unknown>
  sortNo: number       // 序号
  createTime: Record<string, unknown>
}

const About = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch: AppDispatch = useDispatch();
  // 从 Redux store 获取数据
  const siteDataList = useSelector((state: RootState) => state?.user?.siteDataList || []);
  const [loading, setLoading] = useState(false);

  // 根据主题色选择对应的图片
  const getBannerImage = () => {
    switch (theme) {
      case 'blueWhite':
        return require("@/assets/images/common/banner-blue.webp");
      case 'greenBlack':
        return require("@/assets/images/common/banner-green.webp");
      case 'orangeWhite':
        return require("@/assets/images/common/banner-orange.webp");
      default:
        return require("@/assets/images/common/banner-green.webp");
    }
  };

  // 根據type獲取對應的icon
  const renderIcon = (type: number) => {
    const IconComponent = ABOUT_MENU_ICONS[type];
    if (!IconComponent) {
      return (
        <Ionicons
          name="information-circle-outline"
          size={20}
          color="red"
        />
      );
    }
    return (
      <IconComponent
        width={20}
        height={20}
        fill={Colors[theme].svgIconColor}
      />
    );
  };

  // 处理菜单项点击
  const handleItemPress = (item: SiteDataVO) => {
    navigation.push("my/aboutDataManagement", { type: item.type });
  };

  // 组件挂载时获取数据
  useEffect(() => {
    if (!siteDataList.length) {
      setLoading(true);
      dispatch(fetchSiteDataList()).finally(() => {
        setLoading(false);
      });
    }
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors[theme].background,
        overflow: "hidden",
      }}
    >
      <HideScreenHeader title={t("pageName.about")} />
      <ScrollView className={`flex-1 `}>
        {/* Top image section */}
        <View className={`items-center justify-center  bg-${theme}-gradient`}>
          <Image
            style={styles.aboutBg}
            source={getBannerImage()}
            resizeMode={"cover"}
          />
        </View>
        {/* Menu items */}
        {siteDataList.length > 0 ? (
          <View style={styles.menuContainer}>
            <View style={[styles.card, { backgroundColor: Colors[theme].cardBg1 }]}>
              {siteDataList.map((item, index) => (
                <TouchableOpacity
                  key={item.type}
                  style={[
                    styles.menuItem,
                    {
                      borderBottomColor: Colors[theme].grayDark,
                      borderBottomWidth: StyleSheet.hairlineWidth
                    }
                  ]}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: Colors[theme].iconBackground }]}>
                    {renderIcon(item.type)}
                  </View>
                  <Text style={[styles.menuTitle, { color: Colors[theme].text }]}>
                    {item.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : loading ? (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, { color: Colors[theme].lightText }]}>
              {t("common.loading")}
            </Text>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <NoData style={{ marginTop: 48 }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  aboutBg: {
    width: "100%",
    height: 160,
    marginVertical: 2,
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: -8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 14,
  },
});

export default About;
