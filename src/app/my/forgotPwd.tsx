import { forgetPwd } from "@/api";
import { SimpleHeader } from "@/components/common/Header";
import { useToast } from "@/components/common/toast";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Input } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VerifyCode } from "@/components/login/verify/Verification";
import { validatePassword } from "@/components/login/utils/util";
import { Ionicons, Octicons } from "@expo/vector-icons";
import RealNameIcon from "@/components/icons/RealNameIcon";
import LockIcon from "@/components/icons/LockIcon";

const ForgotPassword = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isShowPass, setIsShowPass] = useState(false);
  const [isShowOkPass, setIsShowOkPass] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaVerification, setCaptchaVerification] = useState("");
  const verifyCodeRef = useRef<any>(null);

  // 表单验证
  const validateForm = () => {
    if (!username.trim()) {
      toast.warn(t("login.pleaseInputUsername"));
      return false;
    }

    if (showPasswordFields) {
      if (!newPassword.trim()) {
        toast.warn(t("login.pleaseInputpwd"));
        return false;
      }

      if (!validatePassword(newPassword.trim(), toast, t)) {
        return false;
      }

      if (!confirmPassword.trim()) {
        toast.warn(t("common.canNotEmpty", { title: t("forgotPwd.inputRePwd") }));
        return false;
      }

      if (newPassword !== confirmPassword) {
        toast.warn(t("forgotPwd.passwordNotSame"));
        return false;
      }
    }

    return true;
  };

  // 提交处理
  const onSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!showPasswordFields) {
      setShowPasswordFields(true);
      return;
    }

    // 第二步：显示验证码
    verifyCodeRef.current?.toggleVerify();
  };

  // 验证码成功回调
  const onCaptchaSuccess = (
    result: { captchaVerification: string } | string
  ) => {
    const verification =
      typeof result === "string" ? result : result.captchaVerification;
    setCaptchaVerification(verification);
    handlePasswordReset(verification);
  };

  // 密码重置
  const handlePasswordReset = async (verification?: string) => {
    const captchaVerificationValue = verification || captchaVerification;

    if (!captchaVerificationValue) {
      toast.warn(t("forgotPwd.captchaVerificationRequired"));
      return;
    }

    try {
      setIsLoading(true);
      const params = {
        username: username.trim(),
        newPwd: newPassword.trim(),
        type: "0",
        vcode: "888888",
        captchaVerification: captchaVerificationValue,
      };

      const response = await forgetPwd(params);

      if (
        response.data?.code === 0 ||
        (response.data as unknown as { repCode: string })?.repCode === "0000"
      ) {
        toast.success(t("common.operationSuccess"));
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(t(response?.data?.code || "common.operationFailed"));
      }
    } catch (error) {
      console.error("Password reset failed:", error);
      toast.error(t("common.operationFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors[theme].background }}
      edges={["top", "bottom"]}
    >
      <View className="flex-1">
        <SimpleHeader title={t("forgotPwd.findBackPassword")} />
        <View className="px-3">
          {/* 用户名输入 */}
          <View className="mt-10">
            <Input
              containerStyle={{ marginTop: 5, paddingHorizontal: 0 }}
              placeholder={t("login.userNameLoginTip")}
              style={styles.input}
              value={username}
              inputStyle={{ width: 150, paddingLeft: 5 }}
              onChangeText={(value) => {
                setUsername(value.trim());
              }}
              inputContainerStyle={[
                styles.inputContainer,
                {
                  backgroundColor: Colors[theme].cardBg1,
                  borderColor: Colors[theme].lightText,
                },
              ]}
              leftIconContainerStyle={styles.iconStyle}
              errorStyle={{ height: 0 }}
              leftIcon={
                <RealNameIcon size={16} color={Colors[theme].primary} />
              }
              rightIcon={
                username?.length > 0 ? (
                  <Pressable onPress={() => setUsername('')}>
                    <Ionicons name="close-circle" color={Colors[theme].primary} size={18} />
                  </Pressable>
                ) : undefined
              }
            />
          </View>

          {/* 密码字段 - 条件显示 */}
          {showPasswordFields && (
            <View style={{ marginTop: 10 }}>
              {/* 新密码 */}
              <Input
                containerStyle={{ marginTop: 5, paddingHorizontal: 0 }}
                placeholder={t("forgotPwd.inputNewPwd")}
                style={styles.input}
                value={newPassword}
                secureTextEntry={!isShowPass}
                inputStyle={{ width: 150, paddingLeft: 5 }}
                onChangeText={(value) => {
                  setNewPassword(value);
                }}
                inputContainerStyle={[
                  styles.inputContainer,
                  {
                    backgroundColor: Colors[theme].cardBg1,
                    borderColor: Colors[theme].lightText,
                  },
                ]}
                leftIconContainerStyle={styles.iconStyle}
                errorStyle={{ height: 0 }}
                leftIcon={<LockIcon size={16} color={Colors[theme].primary} />}
                rightIconContainerStyle={[
                  styles.iconStyle,
                  { width: 26, padding: 0, marginLeft: 10 },
                ]}
                rightIcon={
                  <TouchableOpacity onPress={() => setIsShowPass(!isShowPass)}>
                    {isShowPass ? (
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

              {/* 确认密码 */}
              <Input
                containerStyle={{ marginTop: 5, paddingHorizontal: 0 }}
                placeholder={t("forgotPwd.inputRePwd")}
                style={styles.input}
                value={confirmPassword}
                secureTextEntry={!isShowOkPass}
                inputStyle={{ width: 150, paddingLeft: 5 }}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                }}
                inputContainerStyle={[
                  styles.inputContainer,
                  {
                    backgroundColor: Colors[theme].cardBg1,
                    borderColor: Colors[theme].lightText,
                  },
                ]}
                leftIconContainerStyle={styles.iconStyle}
                errorStyle={{ height: 0 }}
                leftIcon={<LockIcon size={16} color={Colors[theme].primary} />}
                rightIconContainerStyle={[
                  styles.iconStyle,
                  { width: 26, padding: 0, marginLeft: 10 },
                ]}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setIsShowOkPass(!isShowOkPass)}
                  >
                    {isShowOkPass ? (
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
            </View>
          )}

          {/* 提交按钮 */}
          <View className="mt-10 h-[44px]">
            <TouchableOpacity
              onPress={onSubmit}
              disabled={isLoading}
              className="flex flex-1"
            >
              <LinearGradient
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={{
                  height: 44,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isLoading ? 0.6 : 1,
                }}
                colors={[Colors[theme].gradient, Colors[theme].primary]}
              >
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors[theme].btnText}
                  />
                ) : (
                  <Text
                    style={{ fontSize: 16, color: Colors[theme].btnText }}
                    className="px-3 font-medium"
                  >
                    {showPasswordFields ? t("common.submit") : t("common.next")}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 返回登录 */}
          <View className="flex-row justify-center items-center mt-5">
            <Text
              style={{ fontSize: 12, color: Colors[theme].lightText }}
              className=""
            >
              {t("login.alreadyHaveAnAccount")}
            </Text>
            <Text
              onPress={() => {
                router.back();
              }}
              style={{ fontSize: 12, color: Colors[theme].primary }}
              className="ml-2.5"
            >
              {t("login.clickToLogin")}
            </Text>
          </View>
        </View>
      </View>

      {/* 验证码组件 */}
      <VerifyCode
        ref={verifyCodeRef}
        onVerifyCallback={onCaptchaSuccess}
        verifyType="blockPuzzle"
      />
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
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
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingRight: 10,
    borderEndWidth: 1,
    height: 46,
  },
});
