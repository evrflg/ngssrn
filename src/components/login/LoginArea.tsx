import { toLoginServer } from "@/api";
import { Colors } from "@/constants/Colors";
import { useCommon } from "@/hooks/CommonProvider";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { nationArr } from "@/lang/language";
import { AppDispatch, RootState } from "@/store/store";
import { setTenantId, Tenant, tenantStore } from "@/store/tenant/tenantSlice";
import { changeSessionState, setLastLogin } from "@/store/user/userSlice";
import { getStoreJson, removeStorage, setStoreJson } from "@/utils/storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import { Input, Tooltip } from "@rneui/themed";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ImageLoadEventData,
  NativeSyntheticEvent,
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
import { loginPanelBg } from "../home/utils/const";
import { AuthMethodSwtich, AuthMethodSwtichMode } from "./AuthMethodSwitch";
import { WEB_BLOCK_BROWSER_CREDENTIALS } from "./utils/webCredentialProps";
import { checkParmas, reconvert, unicode } from "./utils/util";
import { VerifyCode } from "./verify/Verification";

const isWeb = Platform.OS === "web";
const LOGO_MAX_HEIGHT = 35;

type LoginDraft = {
  username: string;
  password: string;
};

type LoginFormState = {
  username: LoginDraft;
  phone: LoginDraft;
};

type StoredLoginInfo = {
  username?: LoginDraft | string;
  phone?: LoginDraft | string;
  password?: string;
  rawPhone?: string;
  lastMethod?: AuthMethodSwtichMode;
};

type LoginSubmitSnapshot = {
  method: AuthMethodSwtichMode;
  username: string;
  phone: string;
  password: string;
};

const defaultLoginForm: LoginFormState = {
  username: { username: "", password: "" },
  phone: { username: "", password: "" },
};

const getStoredDraftValue = (
  draft: LoginDraft | string | undefined,
  fallbackPassword = "",
): LoginDraft => {
  if (typeof draft === "string") {
    return {
      username: draft,
      password: fallbackPassword,
    };
  }

  return {
    username: draft?.username || "",
    password: draft?.password || fallbackPassword,
  };
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

export const LoginArea = () => {
  const router = useRouter();
  const { theme } = useTheme() || "greenBlack"; //主题
  const { language } = useCommon(); //语言
  const cfg_site_base: any = useSelector(
    (state: RootState) => state?.user?.cfg_site_base,
  );
  // 站点配置
  const tenantInfo: Tenant = useSelector(tenantStore);
  const cfg_global_switch: any = useSelector(
    (state: RootState) => state?.user?.cfg_global_switch,
  );
  const { t, i18n } = useTranslation();
  /** ar-SA 等 RTL 下占位符会贴右，与密码框视觉不一致；登录字段强制左对齐、书写方向 LTR */
  const loginInputAlignAr =
    /^ar/i.test(language || "") || /^ar/i.test(String(i18n.language || ""))
      ? ({
        textAlign: "left" as const,
        writingDirection: "ltr" as const,
      })
      : null;
  const toast = useToast();
  const [loginForm, setLoginForm] = useState<LoginFormState>(defaultLoginForm);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode] = useState("");
  const [isRequesting, setRequesting] = useState(false);
  const [checked, setChecked] = useState(true);
  const boxHeight = 320;
  const { defaultTab: initialTab, redirect } = useLocalSearchParams<{
    defaultTab?: string;
    redirect?: string | string[];
  }>(); // Use a unique name
  const postLoginPath = getRedirectPath(redirect) ?? "/home";

  const [currentMethod, setMethod] = useState<AuthMethodSwtichMode>(
    (initialTab as AuthMethodSwtichMode) || AuthMethodSwtichMode.phone,
  );
  const [isOpenList, setIsOpenList] = useState(false);
  const [newNationArr, setNewNationArr]: any = useState([]);
  const verifyCodeRef = useRef<any>(null);
  const pendingLoginRef = useRef<LoginSubmitSnapshot | null>(null);
  const [lan, setLan] = useState(language); //当前选择的语言
  const dispatch: AppDispatch = useDispatch();
  const currentDraft =
    currentMethod === AuthMethodSwtichMode.phone
      ? loginForm.phone
      : loginForm.username;
  const username = loginForm.username.username;
  const phone = loginForm.phone.username;
  const password = currentDraft.password;
  const currentMethodRef = useRef(currentMethod); // 用 ref 追踪当前登录方式，避免 onChangeText 闭包中捕获过期的 currentMethod 值
  const phoneLogoUri = cfg_site_base?.phoneLogoFileUrl;
  const [logoDisplaySize, setLogoDisplaySize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const logoSizeResolvedRef = useRef(false);

  const applyLogoNaturalSize = useCallback((nw: number, nh: number) => {
    if (!nw || !nh || !Number.isFinite(nw) || !Number.isFinite(nh)) {
      setLogoDisplaySize({
        width: LOGO_MAX_HEIGHT,
        height: LOGO_MAX_HEIGHT,
      });
      return;
    }
    const scale = nh > LOGO_MAX_HEIGHT ? LOGO_MAX_HEIGHT / nh : 1;
    setLogoDisplaySize({
      width: Math.round(nw * scale),
      height: Math.round(nh * scale),
    });
  }, []);

  const readNaturalSizeFromLoadEvent = (
    e: NativeSyntheticEvent<ImageLoadEventData>,
  ): { width: number; height: number } | null => {
    const raw = e.nativeEvent as unknown as {
      source?: { width?: number; height?: number };
      target?: { naturalWidth?: number; naturalHeight?: number };
    };
    let nw = Number(raw?.source?.width);
    let nh = Number(raw?.source?.height);
    const tw = Number(raw?.target?.naturalWidth);
    const th = Number(raw?.target?.naturalHeight);
    if ((!nw || !nh) && tw && th) {
      nw = tw;
      nh = th;
    }
    if (!nw || !nh || !Number.isFinite(nw) || !Number.isFinite(nh)) return null;
    return { width: nw, height: nh };
  };

  useEffect(() => {
    logoSizeResolvedRef.current = false;
    setLogoDisplaySize(null);
    if (!phoneLogoUri) return;

    Image.getSize(
      phoneLogoUri,
      (w, h) => {
        logoSizeResolvedRef.current = true;
        applyLogoNaturalSize(w, h);
      },
      () => {
        setLogoDisplaySize((prev) => prev ?? { width: LOGO_MAX_HEIGHT, height: LOGO_MAX_HEIGHT });
      },
    );
  }, [phoneLogoUri, applyLogoNaturalSize]);

  const handleSiteLogoLoad = (e: NativeSyntheticEvent<ImageLoadEventData>) => {
    if (logoSizeResolvedRef.current) return;
    const natural = readNaturalSizeFromLoadEvent(e);
    if (!natural) return;
    applyLogoNaturalSize(natural.width, natural.height);
    logoSizeResolvedRef.current = true;
  };

  useEffect(() => {
    getStoreJson("loginInfo").then((res) => {
      if (res != null) {
        res = reconvert(res);
        const parsed: StoredLoginInfo = JSON.parse(res);
        const storedUsername = getStoredDraftValue(
          parsed?.username,
          parsed?.password || "",
        );
        const storedPhone = getStoredDraftValue(parsed?.phone);
        const storedRawPhone = storedPhone.username || parsed?.rawPhone || "";

        setLoginForm({
          username: storedUsername,
          phone: {
            ...storedPhone,
            username: storedRawPhone,
          },
        });

        if (!initialTab) {
          if (parsed?.lastMethod) {
            setMethod(parsed.lastMethod);
          } else if (storedUsername.username && !storedRawPhone) {
            setMethod(AuthMethodSwtichMode.username);
          } else if (storedRawPhone) {
            setMethod(AuthMethodSwtichMode.phone);
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    // 每次 currentMethod 变化时同步更新 ref，确保密码输入的 onChangeText 始终使用最新值
    currentMethodRef.current = currentMethod;
  }, [currentMethod]);

  useEffect(() => {
    if (initialTab) {
      setMethod(initialTab as AuthMethodSwtichMode);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!checked) {
      removeStorage("loginInfo");
    }
  }, [checked]);

  // 设置站点区号
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

  const setStorageUser = async () => {
    let loginInfo = {
      username: {
        username: loginForm.username.username,
        password: loginForm.username.password,
      },
      phone: {
        username: loginForm.phone.username,
        password: loginForm.phone.password,
      },
      lastMethod: currentMethod,
    };
    setStoreJson("loginInfo", unicode(JSON.stringify(loginInfo)));
  };

  const toPreLogin = () => {
    const snapshot: LoginSubmitSnapshot = {
      method: currentMethod,
      username,
      phone,
      password,
    };
    let param: any = {
      password: snapshot.password,
      captchaVerification: verificationCode,
    };

    switch (snapshot.method) {
      case AuthMethodSwtichMode.username:
        param["loginType"] = 1;
        param["username"] = snapshot.username;
        break;
      case AuthMethodSwtichMode.phone:
        param["loginType"] = 2;
        const countryCode = nationArr[lan]?.phone ?? "";
        param["phone"] = countryCode + snapshot.phone;
        break;
      default:
        break;
    }

    if (!checkParmas(param, toast, t, snapshot.method)) {
      return;
    }

    pendingLoginRef.current = snapshot;
    if (cfg_global_switch?.memberCfg?.loginCheckEnable) {
      verifyCodeRef?.current?.toggleVerify();
    } else {
      toLogin();
    }
  };
  // 登录
  const toLogin = (verificationCode?: string) => {
    const snapshot = pendingLoginRef.current ?? {
      method: currentMethod,
      username,
      phone,
      password,
    };
    let param: any = {
      password: snapshot.password,
      captchaVerification: verificationCode,
    };
    switch (snapshot.method) {
      case AuthMethodSwtichMode.username:
        param["loginType"] = 1;
        param["username"] = snapshot.username;
        break;
      case AuthMethodSwtichMode.phone:
        param["loginType"] = 2;
        param["phone"] = `${nationArr[lan]?.phone ?? ""}${snapshot.phone}`;
        break;
      default:
        break;
    }
    //行为验证s
    if (verificationCode) {
      param.captchaVerification = verificationCode;
    }

    if (!checkParmas(param, toast, t, snapshot.method)) {
      return;
    }
    setRequesting(true);
    toLoginServer(param)
      .then(async (res: any) => {
        if (res?.data?.data) {
          if (checked) {
            //保存账号密码
            setStorageUser();
          }
          dispatch(changeSessionState(res.data.data));
          // 后台站点信息接口不稳定，经常不返回 tenantId，所以这里一起设置
          dispatch(setTenantId(res.data.data.tenantId));
          dispatch(setLastLogin(new Date().toISOString()));
          //router.back(); //返回上一页
          router.replace(postLoginPath as any);
        } else {
          toast.error(t(res?.data?.code));
          //verifyCodeRef?.current?.setNewVerify()
        }
      })
      .catch((e: any) => {
        //verifyCodeRef?.current?.setNewVerify()
      })
      .finally(() => {
        pendingLoginRef.current = null;
        setRequesting(false);
      });
  };

  // 免费试玩
  // const toFreeTrial = async () => {
  //   toast.loading(true);
  //   guestRegister({})
  //     .then(async (res: any) => {
  //       if (res?.data?.data) {
  //         toast.success(t("login.trialRegistrationSuccessful"));
  //         dispatch(changeSessionState(res.data.data));
  //         await dispatch(accInfoAsync()).unwrap();
  //         router.push("/home");
  //       } else {
  //         toast.error(t(res?.data?.code));
  //       }
  //     })
  //     .finally(() => {
  //       toast.loading(false);
  //     });
  // };

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
                <Text
                  style={{ fontSize: 12, color: Colors[theme].text }}
                  className="ml-3 flex-1"
                >
                  {val?.phone}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const selectLan = (val: any) => {
    setLan(val?.language);
    setIsOpenList(false);
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
              setLoginForm((prev) => ({
                ...prev,
                username: {
                  ...prev.username,
                  username: value,
                },
              }));
            }}
            {...(isWeb
              ? WEB_BLOCK_BROWSER_CREDENTIALS
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
            rightIconContainerStyle={[
              styles.iconStyle,
              ,
              { width: 30, padding: 0 },
            ]}
            rightIcon={
              username?.length > 0 ? (
                <Pressable
                  onPress={() =>
                    setLoginForm((prev) => ({
                      ...prev,
                      username: {
                        ...prev.username,
                        username: "",
                      },
                    }))
                  }
                >
                  <Ionicons
                    name="close-circle"
                    color={Colors[theme].lightText}
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
              // Only allow numeric characters (0-9)
              // Filter the current phoneNumber value to remove any non-numeric characters
              const numericValue = value.replace(/\D/g, "");
              setLoginForm((prev) => ({
                ...prev,
                phone: {
                  ...prev.phone,
                  username: numericValue,
                },
              }));
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
            rightIconContainerStyle={[
              styles.iconStyle,
              ,
              { width: 30, padding: 0 },
            ]}
            rightIcon={
              phone?.length > 0 ? (
                <Pressable
                  onPress={() =>
                    setLoginForm((prev) => ({
                      ...prev,
                      phone: {
                        ...prev.phone,
                        username: "",
                      },
                    }))
                  }
                >
                  <Ionicons
                    name="close-circle"
                    color={Colors[theme].lightText}
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
      <View style={[styles.loginArea, { height: boxHeight }]}>
        <BlurView
          intensity={30} // 模糊强度 (0-100)
          style={[styles.blurContainer]}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              height: boxHeight,
              borderTopColor: Colors[theme].primary,
              borderBottomColor: Colors[theme].primary,
            }}
            className="flex flex-1"
            colors={loginPanelBg[theme]}
          >
            <View
              className="flex-1 px-4"
              style={[
                isWeb ? styles.centerBgWeb : styles.centerBg,
                { borderColor: Colors[theme].primary },
              ]}
            >
              <View
                className="h-9 justify-left relative align-start"
                style={{
                  height: 38,
                  marginTop: 10,
                  alignItems: "flex-start",
                }}
              >
                {phoneLogoUri && (
                  <Image
                    resizeMode="contain"
                    source={{ uri: phoneLogoUri }}
                    onLoad={handleSiteLogoLoad}
                    style={
                      logoDisplaySize
                        ? {
                          width: logoDisplaySize.width,
                          height: logoDisplaySize.height,
                        }
                        : {
                          width: LOGO_MAX_HEIGHT,
                          height: LOGO_MAX_HEIGHT,
                          opacity: 0,
                        }
                    }
                  />
                )}
              </View>
              <Text
                style={{
                  fontSize: 14,
                  marginTop: 10,
                  width: "100%",
                  flexShrink: 1,
                }}
              >
                <Text style={{ color: Colors[theme].text }}>
                  {t("login.noAccount")}
                  {" "}
                </Text>
                <Text
                  onPress={() => {
                    router.push({
                      pathname: "/register",
                      params: { defaultTab: currentMethod },
                    });
                  }}
                  style={{
                    fontSize: 14,
                    color: theme === "orangeWhite" ? "#A24A00" : "#ffd900",
                  }}
                >
                  {t("login.clickToRegister")}
                </Text>
              </Text>
              <View>
                {renderUserNameInput()}
                <Input
                  key={`password-${currentMethod}`}
                  containerStyle={{ marginTop: 10, paddingHorizontal: 0 }}
                  placeholder={t("login.pleaseInputpwd")}
                  style={[styles.input, { color: Colors[theme].text }]}
                  value={password}
                  inputStyle={
                    loginInputAlignAr
                      ? { flex: 1, paddingLeft: 5, ...loginInputAlignAr }
                      : { flex: 1, paddingLeft: 5 }
                  }
                  onChangeText={(value) => {
                    setLoginForm((prev) => {
                      // 使用 ref 而非 currentMethod，防止闭包问题导致密码写入错误的登录方式
                      const key =
                        currentMethodRef.current === AuthMethodSwtichMode.phone
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
                    ? WEB_BLOCK_BROWSER_CREDENTIALS
                    : {
                      autoComplete: "off" as const,
                      textContentType: "oneTimeCode" as const,
                      importantForAutofill: "no" as const,
                    })}
                  autoCorrect={false}
                  spellCheck={false}
                  secureTextEntry={!showPassword}
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
                    {
                      // 有内容时加宽容纳清除按钮和眼睛图标
                      width: password?.length > 0 ? 56 : 30,
                      padding: 0,
                      marginLeft: 10,
                    },
                  ]}
                  rightIcon={
                    password?.length > 0 ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {/* Clear button */}
                        <Pressable
                          onPress={() => {
                            setLoginForm((prev) => {
                              const key =
                                currentMethod === AuthMethodSwtichMode.phone
                                  ? "phone"
                                  : "username";
                              return {
                                ...prev,
                                [key]: {
                                  ...prev[key],
                                  password: "",
                                },
                              };
                            });
                          }}
                        >
                          <Ionicons
                            name="close-circle"
                            color={Colors[theme].lightText}
                            size={18}
                          />
                        </Pressable>
                        {/* Eye toggle */}
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
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
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
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
                    )
                  }
                />
                <View style={styles.passwordView}>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
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
                        className={`text-${theme}-text`}
                        style={{
                          fontSize: 12,
                          marginLeft: 10,
                        }}
                      >
                        {t("login.rememberPassword")}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View className="flex flex-row ">
                      <Text
                        className={`text-${theme}-text`}
                        onPress={() => {
                          router.push("/my/forgotPwd");
                        }}
                        style={{ fontSize: 12 }}
                      >
                        {t("login.forgotPassword")}
                      </Text>
                    </View>
                  </View> */}
                </View>

                <View
                  style={[
                    styles.loginBtn,
                    { backgroundColor: Colors[theme].loginButtonBgColor },
                    { opacity: isRequesting ? 0.5 : 1 },
                  ]}
                >
                  <TouchableOpacity
                    disabled={isRequesting}
                    onPress={() => {
                      toPreLogin();
                    }}
                    className="flex flex-1 items-center justify-center"
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
                        {t("pageName.login")}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <VerifyCode
                ref={verifyCodeRef}
                verifyType="login"
                onVerifyCallback={(verificationCode) => {
                  toLogin(verificationCode);
                }}
              />
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loginArea: {
    overflow: "hidden",
    borderRadius: 15,
  },
  blurContainer: {
    flex: 1,
  },
  centerBg: {
    display: "flex",
    flex: 1,
    paddingVertical: 10,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderTopLeftRadius: 15,
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
    borderEndWidth: 1,
    height: 46,
  },
  verificationCodeContainer: {
    borderWidth: 1,
    borderRadius: 30,
    paddingLeft: 10,
    borderEndWidth: 1,
    height: 46,
  },
  passwordView: {
    height: 30,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loginBtn: {
    height: 44,
    marginTop: 20,
    borderRadius: 26,
  },
});
