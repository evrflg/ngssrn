import { registerAll } from "@/api";
import { bgMap } from "@/components/login/utils/const";
import { Colors } from "@/constants/Colors";
import { useCommon } from "@/hooks/CommonProvider";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { nationArr } from "@/lang/language";
import { AppDispatch, RootState } from "@/store/store";
import { Tenant, tenantStore } from "@/store/tenant/tenantSlice";
import { changeSessionState, setLastLogin } from "@/store/user/userSlice";
import { allParams, setAllParams } from "@/api/common/client";
import { getStorage, setStoreJson, setStorage } from "@/utils/storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import { Input, Tooltip } from "@rneui/themed";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "../common/toast";
import { AuthMethodSwtich, AuthMethodSwtichMode } from "./AuthMethodSwitch";
import {
  WEB_BLOCK_BROWSER_CREDENTIALS,
  WEB_REGISTER_PASSWORD_FIELDS,
} from "./utils/webCredentialProps";
import { checkRegisterParmas } from "./utils/util";
import { VerifyCode } from "./verify/Verification";

const isWeb = Platform.OS === "web";

const buildEventExtraHeaderValue = (rawParams: unknown): string => {
  try {
    const json = JSON.stringify(rawParams ?? {});
    return json.replace(/[^\x00-\x7F]/g, (char) => {
      const code = char.charCodeAt(0).toString(16).padStart(4, "0");
      return `\\u${code}`;
    });
  } catch {
    return "{}";
  }
};

type RegisterSubmitSnapshot = {
  loginType: number;
  username?: string;
  phone?: string;
  password: string;
  captchaVerification: string;
  memberType: number;
  sourceType: number;
  degreeId: number;
  groupId: number;
};

type RegisterDraft = {
  password: string;
  confirmPassword: string;
};

type RegisterFormState = {
  username: RegisterDraft;
  phone: RegisterDraft;
};

const defaultRegisterForm: RegisterFormState = {
  username: { password: "", confirmPassword: "" },
  phone: { password: "", confirmPassword: "" },
};

const getRedirectPath = (
  redirect: string | string[] | undefined,
): string | null => {
  const raw = Array.isArray(redirect) ? redirect[0] : redirect;
  if (!raw) return null;

  try {
    const decoded = decodeURIComponent(raw);
    return decoded.indexOf("/") === 0 ? decoded : null;
  } catch {
    return raw.indexOf("/") === 0 ? raw : null;
  }
};

export const RegisterArea = () => {
  const router = useRouter();
  const { theme } = useTheme() || "greenBlack"; //主题
  const { t, i18n } = useTranslation();
  const { language } = useCommon(); //语言
  /** ar-SA 等 RTL 下占位符贴右；与登录页一致，注册表单占位符与密码框统一靠左 */
  const loginInputAlignAr =
    /^ar/i.test(language || "") || /^ar/i.test(String(i18n.language || ""))
      ? ({
          textAlign: "left" as const,
          writingDirection: "ltr" as const,
        })
      : null;
  const toast = useToast();
  const cfg_site_base: any = useSelector(
    (state: RootState) => state?.user?.cfg_site_base,
  );
  const tenantInfo: Tenant = useSelector(tenantStore);
  const cfg_global_switch: any = useSelector(
    (state: RootState) => state?.user?.cfg_global_switch,
  );
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [registerForm, setRegisterForm] =
    useState<RegisterFormState>(defaultRegisterForm);
  const [showPwd, setShowPwd] = useState(false);
  const [showRpwd, setShowPpwd] = useState(false);
  const [checked, setChecked] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const boxHeight = 400;
  const [fromDataList, setFromDataList] = useState([]);
  // const [invitationCode, setInvitationCode] = useState("");
  const [isRequesting, setRequesting] = useState(false);
  const verifyCodeRef = useRef<any>(null);
  const pendingRegisterRef = useRef<RegisterSubmitSnapshot | null>(null);
  const { id, promoCode, defaultTab, redirect } = useLocalSearchParams<{
    id?: string;
    promoCode?: string;
    defaultTab?: string;
    redirect?: string | string[];
  }>();
  const postRegisterPath:any = getRedirectPath(redirect) ?? {pathname:"/home"};
  const [currentMethod, setMethod] = useState<AuthMethodSwtichMode>(
    (defaultTab as AuthMethodSwtichMode) || AuthMethodSwtichMode.phone,
  );
  const [isOpenList, setIsOpenList] = useState(false);
  const [newNationArr, setNewNationArr]: any = useState([]);
  const [lan, setLan] = useState(language); //当前选择的语言

  const currentDraft =
    currentMethod === AuthMethodSwtichMode.phone
      ? registerForm.phone
      : registerForm.username;
  const pwd = currentDraft.password;
  const rpwd = currentDraft.confirmPassword;

  useEffect(() => {
    if (!(id == null && promoCode == null) && fromDataList?.length > 0) {
      let promocode = id || promoCode;
      if (fromDataList?.length > 0) {
        fromDataList.forEach((item: any) => {
          if (item.eleName == "promoCode" && item.value == null) {
            item.value = promocode;
            setFromDataList([...fromDataList]);
          }
        });
      }
    }
  }, [id, promoCode, fromDataList]);

  // 设置站点区号（与 LoginArea 一致）
  useEffect(() => {
    if (!tenantInfo?.language) return;
    nationArr[tenantInfo?.language] && setLan(tenantInfo?.language);

    const allowSet = ["en", "cn", tenantInfo?.language];
    const next = allowSet.map((item: any) => ({
      language: item,
      ...nationArr[item],
    }));

    setNewNationArr(next);
  }, [tenantInfo?.language]);

  useEffect(() => {
    if (defaultTab) {
      setMethod(defaultTab as AuthMethodSwtichMode);
    }
  }, [defaultTab]);

  const toPreRegister = () => {
    const submitData: RegisterSubmitSnapshot = {
      loginType: 0,
      password: pwd,
      captchaVerification: "",
      memberType: 1,
      sourceType: 1,
      degreeId: 0,
      groupId: 0,
    };

    switch (currentMethod) {
      case AuthMethodSwtichMode.username:
        submitData.loginType = 1;
        submitData.username = username;
        break;
      case AuthMethodSwtichMode.phone:
        submitData.loginType = 2;
        const countryCode = nationArr[lan]?.phone ?? "";
        submitData.phone = countryCode + phone;
        break;
      default:
        break;
    }

    if (!checked) {
      toast.error(t("login.agreedTermsService"));
      return;
    }
    const isValid = checkRegisterParmas(
      { ...submitData, rpwd },
      toast,
      t,
      currentMethod,
    );
    if (!isValid) return;

    pendingRegisterRef.current = submitData;
    //如果开启了验证码验证
    if (cfg_global_switch?.memberCfg?.registerCheckEnable) {
      verifyCodeRef?.current?.toggleVerify();
    } else {
      toRegister();
    }
  };
  const toRegister = (verificationCode?: any) => {
    const param = {
      ...(pendingRegisterRef.current ?? {
        loginType: currentMethod === AuthMethodSwtichMode.username ? 1 : 2,
        username:
          currentMethod === AuthMethodSwtichMode.username
            ? username
            : undefined,
        phone:
          currentMethod === AuthMethodSwtichMode.phone
            ? `${nationArr[lan]?.phone ?? ""}${phone}`
            : undefined,
        password: pwd,
        captchaVerification: "",
        memberType: 1,
        sourceType: 1,
        degreeId: 0,
        groupId: 0,
      }),
      captchaVerification: verificationCode ?? "",
    };
    setRequesting(true);
    let config = undefined;
    const doRegister = async () => {
      if (isWeb) {
        const stopPassExtraEvent = await getStorage("stopPassExtraEvent");
        if (!stopPassExtraEvent) {
          config = {
            headers: {
              "Event-Extra": buildEventExtraHeaderValue(allParams),
            },
          };
        }
      }
      return registerAll(param, config);
    };
    doRegister()
      .then(async (res: any) => {
        if (res?.data?.code == 0) {
          if (isWeb) {
            const nextParams = {
              ...(allParams as Record<string, unknown>),
            };
            delete nextParams.promoCode;
            setAllParams(nextParams);
            setStoreJson("allParams", nextParams);
            setStorage("stopPassExtraEvent", "true");
          }
          toast.success(t("status.successText"));
          dispatch(changeSessionState(res.data.data));
          dispatch(setLastLogin(new Date().toISOString()));
          router.replace(postRegisterPath);
        } else {
          toast.error(t(res?.data.code));
        }
      })
      .catch((e: any) => {})
      .finally(() => {
        pendingRegisterRef.current = null;
        setRequesting(false);
      });
  };

  const renderUserNameInput = () => {
    switch (currentMethod) {
      case AuthMethodSwtichMode.username:
        return (
          <Input
            containerStyle={{ marginTop: 10, paddingHorizontal: 0 }}
            placeholder={t("login.pleaseInputUsername")}
            style={[styles.input, { color: Colors[theme].text }]}
            value={username}
            onChangeText={(value) => {
              setUsername(value);
            }}
            {...(isWeb
              ? {
                  ...WEB_BLOCK_BROWSER_CREDENTIALS,
                  textContentType: "none" as const,
                }
              : {
                  autoComplete: "off" as const,
                  textContentType: "oneTimeCode" as const,
                  importantForAutofill: "no" as const,
                })}
            autoCorrect={false}
            spellCheck={false}
            inputContainerStyle={[
              styles.inputContainer,
              {
                backgroundColor: Colors[theme].cardBg1,
                borderColor: Colors[theme].gradient,
              },
            ]}
            inputStyle={
              loginInputAlignAr
                ? { paddingLeft: 5, ...loginInputAlignAr }
                : { paddingLeft: 5 }
            }
            leftIcon={
              <Image
                style={{ width: 27, height: 27 }}
                source={require("@/assets/images/login/username.png")}
              />
            }
            errorStyle={{ height: 0, display: "none" }}
            leftIconContainerStyle={styles.iconStyle}
            rightIconContainerStyle={[styles.iconStyle]}
            rightIcon={
              username?.length > 0 ? (
                <Pressable onPress={() => setUsername("")}>
                  <Ionicons
                    name="close-circle"
                    color={Colors[theme].text}
                    size={18}
                  />
                </Pressable>
              ) : undefined
            }
          />
        );
      case AuthMethodSwtichMode.phone:
        return (
          <Input
            containerStyle={{ marginTop: 10, paddingHorizontal: 0 }}
            placeholder={t("login.pleaseInputPhone")}
            style={[styles.input, { color: Colors[theme].text }]}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(value) => {
              setPhone(value.replace(/\D/g, ""));
            }}
            {...(isWeb ? WEB_BLOCK_BROWSER_CREDENTIALS : {})}
            inputContainerStyle={[
              styles.inputContainer,
              {
                backgroundColor: Colors[theme].cardBg1,
                borderColor: Colors[theme].gradient,
              },
            ]}
            inputStyle={
              loginInputAlignAr
                ? { paddingLeft: 5, ...loginInputAlignAr }
                : { paddingLeft: 5 }
            }
            leftIcon={
              <Tooltip
                visible={isOpenList}
                onOpen={() => setIsOpenList(true)}
                onClose={() => setIsOpenList(false)}
                height={
                  40 *
                  (Object.keys(newNationArr)?.length > 8
                    ? 8
                    : Object.keys(newNationArr)?.length)
                }
                width={110}
                backgroundColor={Colors[theme].cardBg1}
                overlayColor={"#11111160"}
                containerStyle={{ alignItems: "flex-start" }}
                popover={renderToolList()}
              >
                <View
                  className="flex-row items-center justify-start"
                  style={{ width: 60 }}
                >
                  <Image
                    style={{ width: 27, height: 27 }}
                    source={nationArr[lan]?.img}
                  />
                  <Text
                    style={{ fontSize: 12, color: Colors[theme].text }}
                    className="ml-1"
                  >
                    {nationArr[lan]?.phone}
                  </Text>
                </View>
              </Tooltip>
            }
            errorStyle={{ height: 0, display: "none" }}
            leftIconContainerStyle={[
              styles.iconStyle,
              {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              },
            ]}
            rightIconContainerStyle={styles.iconStyle}
            rightIcon={
              phone?.length > 0 ? (
                <Pressable onPress={() => setPhone("")}>
                  <Ionicons
                    name="close-circle"
                    color={Colors[theme].text}
                    size={18}
                  />
                </Pressable>
              ) : undefined
            }
          />
        );
      default:
        return null;
    }
  };

  const renderToolList = () => {
    return (
      <View className="w-full">
        <ScrollView style={{ maxHeight: 320 }}>
          {newNationArr.map((val: any, key: number) => (
            <TouchableOpacity
              key={key}
              className={`flex-row items-center h-[40] w-full p-[5]`}
              onPress={() => selectLan(val)}
            >
              <Image style={{ width: 22, height: 22 }} source={val?.img} />
              <Text
                style={{ fontSize: 12, color: Colors[theme].text }}
                className="ml-3 flex-1"
              >
                {val?.phone}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  const selectLan = (val: any) => {
    setLan(val?.language);
    setIsOpenList(false);
  };

  const logRegAutofillHostWeb = isWeb
    ? ({ "--log-reg-input-fill": Colors[theme].cardBg1 } as Record<
        string,
        string
      >)
    : undefined;

  return (
    <View
      className={isWeb ? "gap-2 log-reg-input-host" : "gap-2"}
      style={[{ width: "90%" }, logRegAutofillHostWeb]}
    >
      <AuthMethodSwtich mode={currentMethod} onChangeMode={setMethod} />
      <View style={{ height: boxHeight }}>
        <BlurView
          intensity={30} // 模糊强度 (0-100)
          tint="light" // iOS 可选：'light' | 'dark' | 'default'
          style={[styles.blurContainer]}
        >
          <LinearGradient
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={{ borderRadius: 15, height: boxHeight }}
            colors={bgMap[theme].bgBlock}
          >
            <View
              className="flex-1 px-4"
              style={[
                isWeb ? styles.centerBgWeb : styles.centerBg,
                { borderColor: Colors[theme].primary },
              ]}
            >
              <View
                className="h-9 justify-left"
                style={{ height: 38, marginTop: 10 }}
              >
                {cfg_site_base?.phoneLogoFileUrl && (
                  <Image
                    style={{ width: 140, height: 35 }}
                    resizeMode="contain"
                    source={{ uri: cfg_site_base?.phoneLogoFileUrl }}
                  />
                )}
              </View>
              <View className="flex flex-row mt-2.5">
                <Text
                  style={{ fontSize: 14, color: Colors[theme].btnText }}
                  className=""
                >
                  {t("login.alreadyHaveAnAccount")}
                </Text>
                <Text
                  onPress={() => {
                    // router.replace("/login");
                    router.replace({
                      pathname: "/login",
                      params: { defaultTab: currentMethod },
                    });
                  }}
                  style={{
                    fontSize: 14,
                    color: theme === "orangeWhite" ? "#A24A00" : "#ffd900",
                  }}
                  className="ml-2.5"
                >
                  {t("login.clickToLogin")}
                </Text>
              </View>
              <View style={{ maxHeight: boxHeight - 180 }}>
                <ScrollView>
                  {renderUserNameInput()}
                  <Input
                    key={`register-password-${currentMethod}`}
                    containerStyle={{ marginTop: 10, paddingHorizontal: 0 }}
                    placeholder={t("login.pleaseInputpwd")}
                    style={[styles.input, { color: Colors[theme].text }]}
                    value={pwd}
                    inputStyle={
                      loginInputAlignAr
                        ? { width: 150, paddingLeft: 5, ...loginInputAlignAr }
                        : { width: 150, paddingLeft: 5 }
                    }
                    onChangeText={(value) => {
                      setRegisterForm((prev) => {
                        const key =
                          currentMethod === AuthMethodSwtichMode.phone
                            ? "phone"
                            : "username";
                        return {
                          ...prev,
                          [key]: {
                            ...prev[key],
                            password: value,
                          },
                        };
                      });
                    }}
                    {...(isWeb
                      ? {
                          ...WEB_REGISTER_PASSWORD_FIELDS,
                          textContentType: "newPassword" as const,
                        }
                      : {
                          autoComplete: "off" as const,
                          textContentType: "oneTimeCode" as const,
                          importantForAutofill: "no" as const,
                        })}
                    autoCorrect={false}
                    spellCheck={false}
                    secureTextEntry={!showPwd}
                    inputContainerStyle={[
                      styles.inputContainer,
                      {
                        backgroundColor: Colors[theme].cardBg1,
                        borderColor: Colors[theme].gradient,
                      },
                    ]}
                    leftIconContainerStyle={styles.iconStyle}
                    errorStyle={{ height: 0, display: "none" }}
                    leftIcon={
                      <Image
                        style={{ width: 27, height: 27 }}
                        source={require("@/assets/images/login/password.png")}
                      />
                    }
                    rightIconContainerStyle={[
                      styles.iconStyle,
                      { width: 26, marginLeft: 10 },
                    ]}
                    rightIcon={
                      <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                        {showPwd ? (
                          <Octicons
                            name="eye"
                            size={20}
                            color={Colors[theme].text}
                          />
                        ) : (
                          <Octicons
                            name="eye-closed"
                            size={20}
                            color={Colors[theme].text}
                          />
                        )}
                      </TouchableOpacity>
                    }
                  />
                  <Input
                    key={`register-confirm-password-${currentMethod}`}
                    containerStyle={{ marginTop: 10, paddingHorizontal: 0 }}
                    placeholder={t("login.pleaseReEnterpwd")}
                    style={[styles.input, { color: Colors[theme].text }]}
                    value={rpwd}
                    inputStyle={
                      loginInputAlignAr
                        ? { width: 150, paddingLeft: 5, ...loginInputAlignAr }
                        : { width: 150, paddingLeft: 5 }
                    }
                    onChangeText={(value) => {
                      setRegisterForm((prev) => {
                        const key =
                          currentMethod === AuthMethodSwtichMode.phone
                            ? "phone"
                            : "username";
                        return {
                          ...prev,
                          [key]: {
                            ...prev[key],
                            confirmPassword: value,
                          },
                        };
                      });
                    }}
                    {...(isWeb
                      ? {
                          ...WEB_REGISTER_PASSWORD_FIELDS,
                          textContentType: "newPassword" as const,
                        }
                      : {
                          autoComplete: "off" as const,
                          textContentType: "oneTimeCode" as const,
                          importantForAutofill: "no" as const,
                        })}
                    autoCorrect={false}
                    spellCheck={false}
                    secureTextEntry={!showRpwd}
                    inputContainerStyle={[
                      styles.inputContainer,
                      {
                        backgroundColor: Colors[theme].cardBg1,
                        borderColor: Colors[theme].gradient,
                      },
                    ]}
                    leftIconContainerStyle={styles.iconStyle}
                    errorStyle={{ height: 0, display: "none" }}
                    leftIcon={
                      <Image
                        style={{ width: 27, height: 27 }}
                        source={require("@/assets/images/login/password.png")}
                      />
                    }
                    rightIconContainerStyle={[
                      styles.iconStyle,
                      { width: 26, marginLeft: 10 },
                    ]}
                    rightIcon={
                      <TouchableOpacity onPress={() => setShowPpwd(!showRpwd)}>
                        {showRpwd ? (
                          <Octicons
                            name="eye"
                            size={20}
                            color={Colors[theme].text}
                          />
                        ) : (
                          <Octicons
                            name="eye-closed"
                            size={20}
                            color={Colors[theme].text}
                          />
                        )}
                      </TouchableOpacity>
                    }
                  />

                  {/* <Input
                    containerStyle={{ marginTop: 10, paddingHorizontal: 0 }}
                    placeholder={t("agent.invitationCode")}
                    value={invitationCode}
                    style={[styles.input, { color: Colors[theme].text }]}
                    inputContainerStyle={[
                      styles.invitationCodeContainer,
                      {
                        backgroundColor: Colors[theme].cardBg1,
                        borderColor: Colors[theme].gradient,
                        paddingRight: 46,
                      },
                    ]}
                    disabledInputStyle={{ backgroundColor: "red" }}
                    inputStyle={{ width: 100, paddingLeft: 4 }}
                    onChangeText={(value) => {
                      setInvitationCode(value);
                    }}
                    leftIconContainerStyle={styles.iconStyle}
                    leftIcon={
                      <View className="flex flex-row">
                        <Image
                          style={{ width: 27, height: 27 }}
                          source={require("@/assets/images/login/prompCode.png")}
                        />
                      </View>
                    }
                    errorStyle={{ height: 0, display: "none" }}
                  /> */}
                </ScrollView>
              </View>
              <View style={styles.passwordView}>
                <TouchableOpacity
                  className="flex flex-row items-center"
                  onPress={() => {
                    setChecked(!checked);
                  }}
                >
                  {checked ? (
                    <View
                      className="flex justify-center items-center"
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: Colors[theme].primary,
                        backgroundColor: Colors[theme].primary,
                      }}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  ) : (
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: Colors[theme].primary,
                      }}
                    ></View>
                  )}
                  <Text
                    style={{
                      color: Colors[theme].text,
                      fontSize: 10,
                      marginLeft: 10,
                    }}
                  >
                    {t("login.iHaveReadAndAgree")}
                  </Text>
                </TouchableOpacity>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View className="flex flex-row ">
                    <Text
                      onPress={() => {
                        router.push("/my/aboutDetail?type=7");
                      }}
                      style={{ fontSize: 10, color: Colors[theme].similarTextColor }}
                    >
                      {t("login.riskDisclosureAgreement")}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.registerBtn}>
                <TouchableOpacity
                  disabled={isRequesting}
                  onPress={() => {
                    toPreRegister();
                  }}
                  className="flex flex-1"
                >
                  <LinearGradient
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    style={{
                      height: 44,
                      borderRadius: 26,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isRequesting ? 0.5 : 1,
                    }}
                    colors={[Colors[theme].gradient, Colors[theme].primary]}
                  >
                    {isRequesting ? (
                      <ActivityIndicator
                        size="small"
                        color={Colors[theme].btnText}
                      />
                    ) : (
                      <Text
                        style={{ fontSize: 16, color: Colors[theme].btnText }}
                        className="px-3 font-medium"
                      >
                        {t("pageName.register")}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
        <VerifyCode
          ref={verifyCodeRef}
          verifyType="register"
          onVerifyCallback={(verificationCode) => {
            toRegister(verificationCode);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    overflow: "hidden",
    borderRadius: 15,
  },
  centerBg: {
    display: "flex",
    flex: 1,
    paddingVertical: 10,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(0,0,0,0)",
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0)",
    overflow: "hidden",
    borderRadius: 15,
  },
  centerBgWeb: {
    display: "flex",
    flex: 1,
    paddingVertical: 10,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderTopLeftRadius: 15,
    overflow: "hidden",
    borderRadius: 15,
  },
  input: {
    fontSize: 14,
    color: "#666",
    borderWidth: 0,
    minHeight: 32,
  },
  iconStyle: {
    height: 32,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingRight: 10,
    borderEndWidth: 1,
    height: 46,
  },
  // invitationCodeContainer: {
  //   borderWidth: 1,
  //   borderRadius: 30,
  //   paddingLeft: 10,
  //   borderEndWidth: 1,
  //   height: 46,
  // },
  passwordView: {
    height: 30,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  registerBtn: {
    height: 44,
    marginTop: 10,
  },
});
