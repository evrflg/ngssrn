import { updateAccountInfo } from "@/api";
import { useToast } from "@/components/common/toast";
import { TelegramPopup } from "@/components/home/popup/telegram/TelegramPopup";
import BirthdayIcon from "@/components/icons/BirthdayIcon";
import ClearCacheIcon from "@/components/icons/ClearCacheIcon";
import EmailIcon from "@/components/icons/EmailIcon";
import FacebookIcon from "@/components/icons/FacebookIcon";
import LineIcon from "@/components/icons/LineIcon";
import LockIcon from "@/components/icons/LockIcon";
import PhoneIcon from "@/components/icons/PhoneIcon";
import RealNameIcon from "@/components/icons/RealNameIcon";
import TelegramIcon from "@/components/icons/TelegramIcon";
import VersionIcon from "@/components/icons/VersionIcon";
import WhatsappIcon from "@/components/icons/WhatsappIcon";
import { Colors } from "@/constants/Colors";
import { useCommon } from "@/hooks/CommonProvider";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { DATE_PICKER_LOCALE_MAP } from "@/lang/language";
import { stationConfig } from "@/store/tenant/tenantSlice";
import { RootState } from "@/store/store";
import { accInfoAsync } from "@/store/user/userSlice";
import { formatDateTime } from "@/utils/date";
import { rf } from "@/utils/scaleFont";
import { clearStorage, getSizeStorage, getStorage } from "@/utils/storage";
import { RouteProp, useRoute } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DatePickerModal } from "react-native-paper-dates";
import { useDispatch, useSelector } from "react-redux";
import Option from "./Option";
import OptionModal from "./OptionModal";
import SetPwd from "./SetPwd";
import SetWithdrawlPwd, { type SetWithdrawlPwdHandle } from "./SetWithdrawlPwd";
import * as Updates from "expo-updates";

type RouteParams = {
  title: string;
  type?: string;
  task_target?: string;
};

type UserProfileKey =
  | "phone"
  | "email"
  | "birthday"
  | "realName"
  | "whatsapp"
  | "line"
  | "facebook"
  | "telegram";

const actionTypeMap: Record<UserProfileKey, string> = {
  phone: "0",
  email: "1",
  birthday: "2",
  realName: "3",
  whatsapp: "4",
  line: "5",
  facebook: "6",
  telegram: "7",
};

const packageJSON = require("../../../../package.json");
const isWeb = Platform.OS === "web";

const BindInfo = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const route = useRoute<RouteProp<Record<string, RouteParams>>>();
  const { type } = useLocalSearchParams();
  const [title, setTitle] = useState("");
  const [inputText, setInputText] = useState("");
  const [inputSms, setInputSms] = useState("");
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const withdrawlPwdModalRef = useRef<SetWithdrawlPwdHandle>(null);
  const { t } = useTranslation();
  const toast = useToast();
  const { language } = useCommon();
  const [open, setOpen] = useState(false);
  const [telegramPopupVisible, setTelegramPopupVisible] = useState(false);
  const config = useSelector((state: RootState) => state?.user?.cfg_site_base);
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const [birthdayPickerVisible, setBirthdayPickerVisible] = useState(false);
  const [birthdayDate, setBirthdayDate] = useState<Date | undefined>(undefined);
  const [cacheSize, setCacheSize] = useState(0);
  // 当前应用ID
  const isCurrentAppId = useSelector((state: RootState) => state?.tenant?.isCurrentAppId);
  // 站点配置
  const siteCodeConfig = useSelector(stationConfig);

  const showLocalError = (message: string) => {
    toast.error(message);
  };

  useEffect(() => {
    if (route.params?.title) {
      setTitle(route.params.title);
    } else if (route.params?.task_target) {
      BindInfo(route.params.task_target);
    }
    if (type === "withdrawPassword") {
      withdrawlPwdModalRef.current?.open();
    }
  }, [route.params, type]);

  // 初始化缓存大小 & 自动检查更新开关
  useEffect(() => {
    getSizeStorage().then((res: any) => {
      setCacheSize(res / 1024);
    });
  }, []);

  const getTitleText = (title: string) => {
    switch (title) {
      case "whatsapp":
        return "WhatsApp";
      case "line":
        return "Line";
      case "facebook":
        return "Facebook";
      case "telegram":
        return "Telegram";
      case "realName":
        return t("memberInfo.realName");
      case "phone":
        return t("memberInfo.phone");
      case "email":
        return "Email";
      case "birthday":
        return t("memberInfo.birthday");
      case "telegram-message":
        return t("setting.telegram-message");
      default:
        return title;
    }
  };

  //綁定信息
  const handleUpdateInfo = async () => {
    const infoKey = title as UserProfileKey;
    const inputValue = inputText;

    if (!inputValue) {
      showLocalError(t("common.canNotEmpty", { title: getTitleText(title) }));
      return;
    }
    //phone regEx
    if (infoKey === "phone") {
      const normalizedPhone = inputValue.replace(/\s/g, "");
      const phoneRegex = /^(?:\+[1-9]\d{8,14}|0\d{9,11}|1\d{10}|[1-9]\d{5,14})$/;
      const isValid = phoneRegex.test(normalizedPhone);

      if (!isValid) {
        showLocalError(t("bindInfo.phoneValidation"));
        return;
      }
    }

    //realName regEx
    if (infoKey === "realName") {
      const realNameRegex = /^[\p{L}\p{M}·. ]{2,30}$/u;
      const isValid = realNameRegex.test(inputValue);

      if (!isValid) {
        showLocalError(t("bindInfo.realNameValidation"));
        return;
      }
    }

    //whatsApp regEx
    if (infoKey === "whatsapp") {
      const trimmed = inputValue.replace(/\s/g, "");
      const whatsappRegex = /^(?:\+[1-9]\d{8,14}|0\d{9,11})$/;
      const isValid = whatsappRegex.test(trimmed);

      if (!isValid) {
        showLocalError(t("bindInfo.phoneValidation"));
        return;
      }
    }

    //email regEx
    if (infoKey === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = emailRegex.test(inputValue);

      if (!isValid) {
        showLocalError(t("bindInfo.emailValidation"));
        return;
      }
    }

    let params: any = {};
    params[infoKey] = infoKey === "phone" ? inputValue.replace(/\s/g, "") : inputValue;
    // 添加memberId
    if (userInfo?.memberId) {
      params.memberId = userInfo.memberId;
    }
    if (actionTypeMap[infoKey]) {
      params.actionType = actionTypeMap[infoKey];
    }
    setOptionModalVisible(false);
    updateAccountInfo(params)
      .then((res: any) => {
        if (res?.data?.data === true || res?.data?.code === 0) {
          toast.success(t("common.operationSuccess"));

          // 重新获取用户信息
          dispatch(accInfoAsync() as any);
          setTimeout(() => {
            setInputText("");
            setInputSms("");
          }, 1000);
        } else {
          showLocalError(t(res?.data?.code) || res?.msg || t("common.operationFailed"));
        }
      })
      .catch((error) => {
        showLocalError(t("common.operationFailed"));
      });
  };

  const BindInfo = (bindTitle: string, prefilledOptionInfo?: string) => {
    setInputSms("");
    setTitle(bindTitle);
    if (bindTitle === "birthday") {
      setInputText("");
      // 如果已有生日，初始化日期
      if (userInfo?.birthday) {
        const [year, month, day] = userInfo.birthday.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        setBirthdayDate(date);
      } else {
        // 如果没有生日，默认选择当前日期
        setBirthdayDate(new Date());
      }
      setBirthdayPickerVisible(true);
    } else if (bindTitle === "telegram-message") {
      setInputText("");
      setTelegramPopupVisible(true);
    } else {
      setInputText(prefilledOptionInfo?.trim() ?? "");
      setOptionModalVisible(true);
    }
  };

  // 处理生日更新
  const handleBirthdayUpdate = async (date: Date) => {
    const formattedDate = formatDateTime(date);
    let params: any = {
      birthday: formattedDate,
      actionType: actionTypeMap.birthday,
    };

    if (userInfo?.memberId) {
      params.memberId = userInfo.memberId;
    }

    updateAccountInfo(params)
      .then((res: any) => {
        if (res?.data?.data === true || res?.data?.code === 0) {
          toast.success(t("common.operationSuccess"));
          setBirthdayPickerVisible(false);
          dispatch(accInfoAsync() as any);
        } else {
          toast.error(t(res?.data?.code) || res?.msg || t("common.operationFailed"));
        }
      })
      .catch((error) => {
        console.error("API调用错误:", error);
        toast.error(t("errMsg.browser.elseErr"));
      });
  };

  const handleClearCache = async () => {
    await clearStorage();
    toast.success(t("bindInfo.clearCacheSuccess"));
    const res: any = await getSizeStorage();
    setCacheSize(res / 1024);
  };

  const guardTrialAccountPress = (onPress?: () => void) => {
    return () => {
      const typeVal = userInfo?.member?.type;
      if (typeVal && (typeVal === 3 || typeVal === 4)) {
        toast.warn(t("tryAccount.trialAccountWarning"));
        return;
      }
      onPress?.();
    };
  };

  // 检查热更新
  const onFetchUpdateAsync = async () => {
    try {
      // 如果当前应用ID不匹配，提示不让热更，测试站不管怎么样都开放出来，方便开发
      if (!isCurrentAppId && !siteCodeConfig?.isTestSite) {
        alert(t("autoUpdateView.currentAppIdError"));
        return;
      }

      toast.loading(true);

      // 检查更新
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        // 下载更新
        await Updates.fetchUpdateAsync();
        // 重启应用
        await Updates.reloadAsync();
      } else {
        toast.warn(t("bindInfo.noUpdateAvailable"));
      }
    } catch (error) {
      alert(`onFetchUpdateAsync error: ${error}`);
    } finally {
      toast.loading(false);
    }
  };

  const pwdOptions = [
    {
      key: "loginPwd",
      title: t("bindInfo.loginPwd"),
      action: t("common.modify"),
      info: "",
      leftIcon: LockIcon,
      onPress: () => setIsPasswordModalVisible(true),
    },
    {
      key: "withdrawalsPassword",
      title: t("bindInfo.withdrawalsPassword"),
      action: t("common.modify"),
      info: "",
      leftIcon: LockIcon,
      onPress: () => withdrawlPwdModalRef.current?.open(),
    },
  ];

  const options = [
    {
      key: "realName",
      title: t("memberInfo.realName"),
      action: userInfo?.realName ? t("common.modify") : t("common.binding"),
      info: userInfo?.realName || "",
      leftIcon: RealNameIcon,
      onPress: () => BindInfo("realName", userInfo?.realName || ""),
    },
    {
      key: "birthday",
      title: t("memberInfo.birthday"),
      action: userInfo?.birthday ? t("common.modify") : t("common.binding"),
      info: userInfo?.birthday || "",
      leftIcon: BirthdayIcon,
      onPress: () => BindInfo("birthday"),
    },
    {
      key: "phone",
      title: t("memberInfo.phone"),
      action: userInfo?.phone ? t("common.modify") : t("common.binding"),
      info: userInfo?.phone || "",
      leftIcon: PhoneIcon,
      onPress: () => BindInfo("phone", userInfo?.phone || ""),
    },
    {
      key: "email",
      title: "Email",
      action: userInfo?.email ? t("common.modify") : t("common.binding"),
      info: userInfo?.email || "",
      leftIcon: EmailIcon,
      onPress: () => BindInfo("email", userInfo?.email || ""),
    },
    {
      key: "whatsapp",
      title: "Whatsapp",
      action: userInfo?.whatsapp ? t("common.modify") : t("common.binding"),
      info: userInfo?.whatsapp || "",
      leftIcon: WhatsappIcon,
      onPress: () => BindInfo("whatsapp", userInfo?.whatsapp || ""),
    },
 
    {
      key: "line",
      title: "Line",
      action: userInfo?.line ? t("common.modify") : t("common.binding"),
      info: userInfo?.line || "",
      leftIcon: LineIcon,
      onPress: () => BindInfo("line", userInfo?.line || ""),
    },
    {
      key: "facebook",
      title: "Facebook",
      action: userInfo?.facebook ? t("common.modify") : t("common.binding"),
      info: userInfo?.facebook || "",
      leftIcon: FacebookIcon,
      onPress: () => BindInfo("facebook", userInfo?.facebook || ""),
    },
    {
      key: "telegram",
      title: "Telegram",
      action: userInfo?.telegram ? t("common.modify") : t("common.binding"),
      info: userInfo?.telegram || "",
      leftIcon: TelegramIcon,
      onPress: () => BindInfo("telegram", userInfo?.telegram || ""),
    },
    {
      key: "telegram-message",
      title: t("setting.telegram-message"),
      action: userInfo?.tgChatId ? t("common.bound") : t("common.binding"),
      info: userInfo?.tgChatId || "",
      leftIcon: TelegramIcon,
      onPress: () => {
        if (!userInfo?.tgChatId)BindInfo("telegram-message")
      },
    },
  ];

  // app操作选项
  const appOptions = [
    {
      key: "storage",
      title: t("bindInfo.storage"),
      action: `${cacheSize.toFixed(2)}KB`,
      info: "",
      leftIcon: <ClearCacheIcon size={16} color={Colors[theme].svgIconColor} />,
      onPress: handleClearCache,
    },
    {
      key: "aboutVersion",
      title: t("bindInfo.aboutVersion"),
      action: `V${packageJSON.version}`,
      info: "",
      leftIcon: <VersionIcon size={16} color={Colors[theme].svgIconColor} />,
      onPress: () => {},
    },
    {
      key: "checkUpdate",
      title: t("bindInfo.checkUpdate"),
      action: "",
      info: "",
      leftIcon: <VersionIcon size={16} color={Colors[theme].svgIconColor} />,
      onPress: onFetchUpdateAsync,
      hide: isWeb,
    },
  ];

  useEffect(() => {
    if (!optionModalVisible) {
      setInputText("");
      setInputSms(""); // 清空 SMS 验证码
    }
  }, [optionModalVisible]);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: Colors[theme].background }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: Platform.OS === "android" ? 10 : Platform.OS === "web" ? 0 : 64,
      }}
    >
      <View className="p-4">
        {/* 安全信息标题 */}
        <View className="flex-row items-center mb-4">
          <View style={[styles.textTitle, { backgroundColor: Colors[theme].primary }]} />
          <Text
            className="font-bold ml-2"
            style={{
              color: Colors[theme].text,
              fontSize: rf(14),
            }}
          >
            {t("bindInfo.securityInformation")}
          </Text>
        </View>

        {/* 密码管理*/}
        <View className="mb-4" style={[styles.card, { backgroundColor: Colors[theme].cardBg1 }]}>
          {pwdOptions.map((opt) => (
            <Option
              key={opt.key}
              title={opt.title}
              action={opt.action}
              info={opt.info}
              leftIcon={opt.leftIcon}
              onPress={guardTrialAccountPress(opt.onPress)}
            />
          ))}
        </View>

        {/* 绑定信息*/}
        <View className="mb-4" style={[styles.card, { backgroundColor: Colors[theme].cardBg1 }]}>
          {options.map((opt) => (
            <Option
              key={opt.key}
              title={opt.title}
              action={opt.action}
              info={opt.info}
              leftIcon={opt.leftIcon}
              onPress={guardTrialAccountPress(opt.onPress)}
            />
          ))}
        </View>

        {/* 清除缓存 / 版本信息 / 自动检查更新 */}
        <View className="mb-4" style={[styles.card, { backgroundColor: Colors[theme].cardBg1 }]}>
          {appOptions.map((opt) => {
            if (opt.hide) return null;
            return (
              <Option
                key={opt.key}
                title={opt.title}
                action={opt.action}
                info={opt.info}
                leftIcon={opt.leftIcon}
                onPress={opt.onPress}
              />
            );
          })}
        </View>
      </View>

      {/* 让弹窗组件自己决定何时卸载（onModalHide 后再移除），避免 iOS 上“闪一下” */}
      <SetPwd isVisible={isPasswordModalVisible} onClose={() => setIsPasswordModalVisible(false)} />
      <SetWithdrawlPwd
        ref={withdrawlPwdModalRef}
        onClose={() => {
          if (type === "withdrawPassword") {
            // 取消設定提款密碼，返回錢包首頁，避免繞過密碼檢查
            router.replace("/wallet");
          }
        }}
        hasWithdrawalPassword={!!userInfo?.member?.receiptPwd}
      />

      {/** 设置modal*/}
      {optionModalVisible && (
        <OptionModal
          visible={optionModalVisible}
          onClose={() => setOptionModalVisible(false)}
          title={title}
          inputText={inputText}
          onChangeText={(text) => setInputText(text)}
          inputSms={inputSms}
          onSubmit={handleUpdateInfo}
          userData={userInfo}
          open={open}
          setOpen={setOpen}
          config={config}
        />
      )}

      {/** 设置页入口：与首页同款 Telegram 绑定弹窗，不跳首页，隐藏「今日不再弹出」*/}
      <TelegramPopup
        standalone
        hideCheckBox
        visible={telegramPopupVisible}
        onClose={() => setTelegramPopupVisible(false)}
      />

      {/** 生日日期选择器*/}
      <DatePickerModal
        locale={DATE_PICKER_LOCALE_MAP.get(language.toLowerCase()) || "en"}
        mode="single"
        visible={birthdayPickerVisible}
        onDismiss={() => {
          setBirthdayPickerVisible(false);
          setTitle("");
        }}
        date={birthdayDate}
        onConfirm={({ date }: { date: Date | undefined }) => {
          if (date) {
            handleBirthdayUpdate(date);
          }
        }}
        saveLabel={t("common.confirm")}
        label={t("memberInfo.birthday")}
        validRange={{
          startDate: new Date(1900, 0, 1),
          endDate: new Date(),
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  textTitle: {
    width: 3,
    height: 20,
    borderRadius: 1.5,
  },
  card: {
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  setTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  checkboxContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BindInfo;
