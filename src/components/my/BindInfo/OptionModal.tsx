import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ViewStyle,
  Platform,
} from "react-native";
import Modal from "react-native-modal";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Tenant, tenantStore } from "@/store/tenant/tenantSlice";
import { nationArr } from "@/lang/language";
import { Tooltip } from "@rneui/themed";
import { useCommon } from "@/hooks/CommonProvider";
import Toast from "@/components/common/toast/src/Toast";
import { DEFAULT_LANGUAGE } from "@/lang/language";
import { Ionicons } from "@expo/vector-icons";

interface OptionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  inputText: string;
  onChangeText: (text: string) => void;
  inputSms: string;
  onSubmit: () => void;
  userData: any;
  open: boolean;
  setOpen: (open: boolean) => void;
  config: any;
}

const isAndroid = Platform.OS === "android";

const OptionModal: React.FC<OptionModalProps> = ({
  visible,
  onClose,
  title,
  inputText,
  onChangeText,
  onSubmit,
  userData,
}) => {
  const [shouldRender, setShouldRender] = useState(visible);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const tenantInfo: Tenant = useSelector(tenantStore);
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const { language } = useCommon();

  const isPhoneOption = useMemo(() => title === "phone", [title]);
  const [isOpenList, setIsOpenList] = useState(false);
  const [newNationArr, setNewNationArr]: any = useState([]);
  const [lan, setLan] = useState(language);
  const countryCode = useMemo(() => nationArr?.[lan]?.phone || "", [lan]);
  const phoneInputValue = useMemo(() => {
    if (!isPhoneOption) return inputText;
    if (!countryCode) return inputText;
    if (inputText.startsWith(countryCode)) {
      return inputText.slice(countryCode.length);
    }
    return inputText;
  }, [isPhoneOption, countryCode, inputText]);

  useEffect(() => {
    if (visible) setShouldRender(true);
  }, [visible]);

  // 设置站点区号（与 LoginArea 一致）
  useEffect(() => {
    if (!tenantInfo?.language) return;
    nationArr[tenantInfo?.language] && setLan(tenantInfo?.language);

    const allowSet = ["en", "cn", tenantInfo?.language];
    const newNationArr = allowSet.map((item: any) => {
      return {
        language: item,
        ...nationArr[item],
      };
    });

    setNewNationArr(newNationArr);
  }, [tenantInfo?.language]);

  useEffect(() => {
    // 只有弹窗可见时才做输入补全，避免退场期间/隐藏状态误触发父级 setState
    if (!visible || !isPhoneOption || !countryCode) return;
    if (!inputText) {
      onChangeText(countryCode);
    }
  }, [visible, isPhoneOption, countryCode, inputText, onChangeText]);

  const selectLan = (val: any) => {
    const nextCode = nationArr?.[val?.language]?.phone || "";
    const currentDigits = phoneInputValue;
    setLan(val?.language);
    setIsOpenList(false);
    onChangeText(`${nextCode}${currentDigits}`);
  };

  const renderToolList = () => {
    return (
      <View className="w-full">
        <ScrollView style={{ maxHeight: 320 }}>
          {newNationArr.map((val: any, key: number) => {
            return (
              <TouchableOpacity
                key={key}
                className={`flex-row items-center h-[40] w-full p-[5]`}
                onPress={() => selectLan(val)}
              >
                <Image style={{ width: 22, height: 22 }} source={val?.img} />
                <Text style={{ fontSize: 12, color: Colors[theme].text }} className="ml-3 flex-1">
                  {val?.phone}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const getTitleText = (title: string) => {
    switch (title) {
      case "whatsapp":
        return "WhatsApp";
      case "realName":
        return t("memberInfo.realName");
      case "phone":
        return t("memberInfo.phone");
      case "line":
        return "Line";
      case "facebook":
        return "Facebook";
      case "telegram":
        return t("popup.telegram.bindTelegramTitle");
      case "email":
        return "Email";
      default:
        return title;
    }
  };

  const getPlaceholderText = (title: string) => {
    switch (title) {
      case "whatsapp":
        return t("setting.whatsapp-placeholder");
      case "realName":
        return t("setting.realName-placeholder");
      case "phone":
        return t("setting.phone-placeholder");
      case "line":
        return t("setting.line-placeholder");
      case "facebook":
        return t("setting.facebook-placeholder");
      case "telegram":
        return t("setting.telegram-placeholder");
      case "email":
        return t("setting.email-placeholder");
      default:
        return t("common.pleaseInput", { title: getTitleText(title) });
    }
  };

  const styles = {
    centeredModal: {
      margin: 0,
      justifyContent: "center",
      alignItems: "center" as const,
    } as ViewStyle,
    modalView: {
      width: "85%" as any,
      maxWidth: 350,
      borderRadius: 16,
      overflow: "hidden" as const,
    },
    input: {
      fontSize: 12,
      color: Colors[theme].text,
      padding: 12,
    },
    button: {
      height: 42,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      borderRadius: 25,
    },
  };

  if (!shouldRender) return null;

  return (
    <Modal
      isVisible={visible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={onClose}
      onModalHide={() => {
        if (!visible) setShouldRender(false);
      }}
      onSwipeComplete={onClose}
      backdropOpacity={0.5}
      coverScreen={true}
      style={styles.centeredModal}
    >
      <View style={[styles.modalView, { backgroundColor: Colors[theme].cardBg1 }]}>
        {/* 标题 */}
        <View
          style={{
            paddingVertical: 20,
            paddingHorizontal: 20,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: Colors[theme].text,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {(title === "whatsapp" && userInfo?.whatsapp) ||
            (title === "realName" && userInfo?.realName) ||
            (title === "phone" && userInfo?.phone) ||
            (title === "line" && userInfo?.line) ||
            (title === "facebook" && userInfo?.facebook) ||
            (title === "telegram" && userInfo?.telegram) ||
            (title === "email" && userInfo?.email)
              ? t("common.modifyTarget", { target: getTitleText(title) })
              : t("common.bindingTarget", { target: getTitleText(title) })}
          </Text>
        </View>

        {/* 内容区域 */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {/* 标签 */}
          <Text
            style={{
              fontSize: 12,
              color: Colors[theme].text,
              marginBottom: 12,
              textAlign: "left",
              writingDirection: "ltr",
            }}
          >
            {getTitleText(title)}
          </Text>
          {isPhoneOption ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
                gap: 8,
              }}
            >
              <Tooltip
                visible={isOpenList}
                onOpen={() => setIsOpenList(true)}
                onClose={() => setIsOpenList(false)}
                skipAndroidStatusBar
                height={
                  40 *
                  (Object.keys(newNationArr)?.length > 8 ? 8 : Object.keys(newNationArr)?.length)
                }
                width={110}
                backgroundColor={Colors[theme].cardBg1}
                overlayColor={"#11111160"}
                containerStyle={{ alignItems: "flex-start" }}
                popover={renderToolList()}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    width: 80,
                    minHeight: 40,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    backgroundColor: Colors[theme].background,
                    borderRadius: 12,
                    alignSelf: "flex-start",
                  }}
                >
                  <Image style={{ width: 27, height: 27 }} source={nationArr[lan]?.img} />
                  <Text
                    style={[
                      {
                        flexShrink: 0,
                        marginLeft: 4,
                        fontSize: 12,
                        color: Colors[theme].text,
                        lineHeight: isAndroid ? 16 : undefined,
                      },
                      isAndroid && {
                        includeFontPadding: false,
                        textAlignVertical: "center",
                      },
                    ]}
                  >
                    {countryCode}
                  </Text>
                </View>
              </Tooltip>
              <View className="flex-1" style={{ position: "relative" }}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: Colors[theme].background,
                      borderWidth: 1,
                      borderColor: Colors[theme].background,
                      borderRadius: 12,
                      paddingRight: phoneInputValue.trim().length > 0 ? 40 : 12,
                    },
                  ]}
                  placeholder={getPlaceholderText(title)}
                  placeholderTextColor={Colors[theme].textSecondary}
                  value={phoneInputValue}
                  onChangeText={(value) => onChangeText(`${countryCode}${value}`)}
                  keyboardType="phone-pad"
                  dataDetectorTypes={"phoneNumber"}
                />
                {phoneInputValue.trim().length > 0 ? (
                  <TouchableOpacity
                    onPress={() => onChangeText(countryCode)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: 0,
                      bottom: 0,
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors[theme].lightText} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={{ marginBottom: 20, position: "relative" }}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[theme].background,
                    borderWidth: 1,
                    borderColor: Colors[theme].background,
                    borderRadius: 12,
                    paddingRight: (inputText?.trim()?.length ?? 0) > 0 ? 40 : 12,
                  },
                ]}
                placeholder={getPlaceholderText(title)}
                placeholderTextColor={Colors[theme].textSecondary}
                value={inputText}
                onChangeText={onChangeText}
              />
              {(inputText?.trim()?.length ?? 0) > 0 ? (
                <TouchableOpacity
                  onPress={() => onChangeText("")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 0,
                    bottom: 0,
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={Colors[theme].lightText} />
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>
        {/* 按钮区域 */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingBottom: 16,
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <TouchableOpacity
            className=" flex-1"
            style={[
              styles.button,
              {
                borderWidth: 1,
                borderColor: Colors[theme].primary,
                backgroundColor: "transparent",
              },
            ]}
            onPress={onClose}
          >
            <Text
              style={{
                color: Colors[theme].primary,
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              {t("common.cancel")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1"
            style={[
              styles.button,
              {
                backgroundColor: Colors[theme].primary,
              },
            ]}
            onPress={onSubmit}
          >
            <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>
              {t("common.confirm")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </Modal>
  );
};

export default OptionModal;
