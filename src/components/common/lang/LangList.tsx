import { Colors } from '@/constants/Colors';
import { useCommon } from '@/hooks/CommonProvider';
import { useTheme } from '@/hooks/theme/ThemeProvider';
import { useMaxWidth } from '@/hooks/useMaxWidth';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_NAME_MAP,
  languageImgMap,
  TENANT_LANGUAGE_MAP,
} from '@/lang/language';
import { AppDispatch } from '@/store/store';
import { stationConfig, Tenant, tenantStore } from '@/store/tenant/tenantSlice';
import { changesShowLanguageModal } from '@/store/user/userSlice';
import { rf } from '@/utils/scaleFont';
import { useMemo } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export const LangList = () => {
  const { maxWidth } = useMaxWidth();
  const { language, changeLanguage } = useCommon(); //语言
  const { theme } = useTheme(); //主题
  const dispatch: AppDispatch = useDispatch();
  const tenantInfo: Tenant = useSelector(tenantStore);
  // 站点配置
  const siteConfig = useSelector(stationConfig);

  const lanArr = useMemo(() => {
    const allLanguages = Array.from(LANGUAGE_NAME_MAP.entries()).map(
      ([code, name]) => ({
        code,
        name,
      }),
    );
    if (siteConfig?.isTestSite) return allLanguages;

    const tenantLanguageCode = TENANT_LANGUAGE_MAP.get(tenantInfo?.language);

    const allowSet = [DEFAULT_LANGUAGE, tenantLanguageCode, 'zh-CN'];
    return allLanguages.filter((item) => allowSet.includes(item.code));
  }, [siteConfig?.isTestSite, tenantInfo]);

  //关闭语言选择
  const toHideLanguageModel = () => dispatch(changesShowLanguageModal(false));

  return (
    <View
      style={[
        styles.modalContent,
        { backgroundColor: Colors[theme].cardBg1, width: maxWidth },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {lanArr?.length > 0 &&
          lanArr.map((item: any, index: number) => {
            const url = languageImgMap[item.code];
            return (
              <TouchableOpacity
                key={index}
                style={styles.themeOption}
                onPress={() => {
                  toHideLanguageModel();
                  setTimeout(() => {
                    changeLanguage(item.code);
                  }, 0);
                }}
              >
                <View className="flex-row items-center">
                  <Image style={styles.imgstyle} source={url} />
                  <Text
                    style={[
                      styles.themeOptionText,
                      { color: Colors[theme].text, fontSize: rf(13) },
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>

                {language == item.code ? (
                  <View
                    style={[
                      styles.checkmark,
                      {
                        borderColor: Colors[theme].primary,
                        backgroundColor: Colors[theme].primary,
                      },
                    ]}
                  >
                    <Text className="text-white">✓</Text>
                  </View>
                ) : (
                  <View
                    className="border-gray-400"
                    style={[styles.checkmark]}
                  ></View>
                )}
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 0,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 300,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  imgstyle: {
    width: 28,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  themeOptionText: {
    fontSize: 13,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
