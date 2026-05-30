import { getCustomerServiceList } from "@/api";
import { HideScreenHeader } from "@/components/common/Header";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { rf } from "@/utils/scaleFont";
import { SafeAreaView } from "react-native-safe-area-context";

const onlineSupport = require('@/assets/images/myCenter/img_kf01.png');

interface CustomerServiceList {
  type: number
  name: string
  link: string
  iconUrl: string
  icon: string
  description: string
}

const CustomerService = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [customerServiceList, setCustomerServiceList] = useState<CustomerServiceList[]>([]);

  useEffect(() => {
    getCustomerServiceListData();
  }, []);

  // 根据主题色选择对应的图片
  const getBannerImage = () => {
    switch (theme) {
      case 'blueWhite':
        return require("@/assets/images/common/customer-service-banner-blue.webp");
      case 'greenBlack':
        return require("@/assets/images/common/customer-service-banner-green.webp");
      case 'orangeWhite':
        return require("@/assets/images/common/customer-service-banner-orange.webp");
      default:
        return require("@/assets/images/common/banner-green.webp");
    }
  };

  const getCustomerServiceListData = () => {
    try {
      getCustomerServiceList().then((res) => {
        const body = res?.data;
        if (body?.data) {
          setCustomerServiceList(body.data);
        }
      });
    } catch {
      // ignore
    }
  };

  const handleLinkPress = async (url: string) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors[theme].background,
        overflow: "hidden",
      }}
    >
      <HideScreenHeader title={t("common.customerService")} />

      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Image
          style={styles.onlineServerBg}
          source={getBannerImage()}
          resizeMode={"cover"}
        />
      </View>
      {/* 联系方式栏目 */}
      {customerServiceList.length ? (
        <ScrollView
          style={styles.onlineServerCenter}
          contentContainerStyle={{
            paddingBottom: Platform.OS === "android" ? 96 : 72,
          }}
        >
          {customerServiceList.map((item, index) => (
            <View key={index} style={[styles.item, { backgroundColor: Colors[theme].cardBg1, borderColor: Colors[theme].primary }]}>
              <View style={styles.title}>
                <View style={styles.child}>
                  <View style={styles.childContent}>
                    <Text style={[styles.childContentText, { color: Colors[theme].text, textAlign: 'left', writingDirection: 'ltr'}]}>
                      {item.name}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.content}>
                <View style={[styles.vanRow, { backgroundColor: Colors[theme].background }]}>
                  <View style={styles.iconCol}>
                    <Image
                      source={item.type === 1 ? onlineSupport : { uri: item.iconUrl }}
                      style={styles.iconImage}
                    />
                  </View>

                  <View style={styles.textCol}>
                    <Text
                      className={`text-${theme}-darkColor`}
                      style={[styles.serviceText, { fontSize: rf(10), lineHeight: rf(11),textAlign:'left',writingDirection: 'ltr' }]}
                    >
                      {t("customerService.customerServiceDes")}
                    </Text>
                    <Text
                      className={`text-${theme}-darkColor`}
                      style={{ fontSize: rf(9), lineHeight: rf(11),textAlign:'left', writingDirection:'ltr' }}
                    >
                      {item.description}
                    </Text>
                  </View>

                  <View style={styles.buttonCol}>
                    <TouchableOpacity
                      onPress={() => handleLinkPress(item.link)}
                      style={[styles.contentKfBtn, { backgroundColor: Colors[theme].tabsActive }]}
                    >
                      <Text
                        style={[
                          styles.contentKfBtnText,
                          { color: Colors[theme].primary, fontSize: rf(10), lineHeight: rf(11) },
                        ]}
                      >
                        {t("customerService.nowContact")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={{ color: Colors[theme].lightText, fontSize: rf(14) }}>
            {t("common.noData")}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  onlineServerBg: {
    width: "100%",
    height: 160,
    marginVertical: 0,
  },

  onlineServerCenter: {
    padding: 11,
    flex: 1,
    height: '100%',
  },

  item: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  title: {
  },
  child: {},
  childContent: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  childContentText: {
    fontWeight: '600',
  },

  content: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  vanRow: {
    padding: 7,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCol: {
    width: '16.67%',
    alignItems: 'center',
  },

  iconImage: {
    width: 35,
    height: 35,
  },

  textCol: {
    width: '58.33%',
    paddingHorizontal: 10,
  },

  serviceText: {
    marginBottom: 5,
  },

  buttonCol: {
    width: '25%',
    alignItems: 'center',
  },
  contentKfBtn: {
    borderRadius: 5,
    paddingHorizontal: 3,
    paddingVertical: 7,
    minWidth: 60,
    alignItems: 'center',
  },

  contentKfBtnText: {
    textAlign: 'center',
  },

  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default CustomerService;
