import React, { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import {
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import CommonModal from "@/components/common/modal/CommonModal";
import { initPickPwd } from "@/api";
import { useToast } from "@/components/common/toast";
import { Input } from "@rneui/base";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { useWithdraw } from "@/hooks/wallet/useWithdraw";
import { accInfoAsync } from "@/store/user/userSlice";
import Toast from "@/components/common/toast/src/Toast";
import { useMaxWidth } from "@/hooks/useMaxWidth";

export type SetWithdrawlPwdHandle = {
  open: () => void;
  close: () => void;
};

interface SetWithdrawlPwdProps {
  /** 关窗时回调（取消、点遮罩、提交成功里先关窗都会走到）；打开请用 ref.open() */
  onClose: () => void;
  hasWithdrawalPassword?: boolean;
}

const SetWithdrawlPwd = forwardRef<SetWithdrawlPwdHandle, SetWithdrawlPwdProps>(
  function SetWithdrawlPwd({ onClose, hasWithdrawalPassword }, ref) {
    const dispatch = useDispatch<AppDispatch>();
    const { theme } = useTheme();
    const [visible, setVisible] = useState(false);
    const [showOldPwd, setShowOldPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    const [oldPwd, setOldPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const { t } = useTranslation();
    const { type } = useLocalSearchParams();
    const { setIsPwdSet } = useWithdraw({ initData: false });
    const { maxWidth } = useMaxWidth();

    const resetFormState = useCallback(() => {
      setShowOldPwd(false);
      setShowNewPwd(false);
      setShowConfirmPwd(false);
      setOldPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setIsSubmitting(false);
    }, []);

    const dismiss = useCallback(() => {
      resetFormState();
      setVisible(false);
      onClose();
    }, [onClose, resetFormState]);

    useImperativeHandle(
      ref,
      () => ({
        open: () => setVisible(true),
        close: () => dismiss(),
      }),
      [dismiss],
    );

    const filterDigits = (text: string) => text.replace(/[^0-9]/g, "");
    const isSetMode = !hasWithdrawalPassword;

    // 計算所有必填欄位還差幾位才滿 6 碼
    const remainingCount = (() => {
      let r = 0;
      if (!isSetMode) r += Math.max(0, 6 - oldPwd.length);
      r += Math.max(0, 6 - newPwd.length);
      if (isSetMode) r += Math.max(0, 6 - confirmPwd.length);
      return r;
    })();
    const isFormComplete = remainingCount === 0;

    const onConfirm = async () => {
      if (isSubmitting) return;
      // 验证旧密码
      if (hasWithdrawalPassword) {
        if (!oldPwd || oldPwd.length < 6) {
          toast.error(t("bindInfo.withdrawPassword.oldPasswordRequired"));
          return;
        }
      }

      // 验证新密码
      if (!newPwd || newPwd.length < 6) {
        toast.error(t("bindInfo.withdrawPassword.newPasswordRequired"));
        return;
      }

      // 首次设置：确认密码一致
      if (isSetMode) {
        if (!confirmPwd || confirmPwd.length < 6) {
          toast.error(t("bindInfo.withdrawPassword.confirmPasswordRequired"));
          return;
        }
        if (confirmPwd !== newPwd) {
          toast.error(t("bindInfo.withdrawPassword.passwordMismatch"));
          return;
        }
      }

      // 验证新旧密码是否相同（修改模式）
      if (hasWithdrawalPassword && oldPwd === newPwd) {
        toast.error(t("bindInfo.withdrawPassword.newPasswordSameAsOld"));
        return;
      }

      let params = {
        oldPwd: hasWithdrawalPassword ? oldPwd : "",
        newPwd: newPwd,
        type: 1,
      };

      try {
        setIsSubmitting(true);
        const res: any = await initPickPwd(params);
        if (res?.data?.data === true || res?.data?.code === 0) {
          setIsPwdSet(true);
          setNewPwd("");
          setOldPwd("");
          setConfirmPwd("");
          // 先关弹窗，再拉用户信息 / Toast / 跳转，避免 iOS 上 Modal 退场与大更新叠同帧导致卡死/闪屏
          dismiss();
          const afterClose = async () => {
            try {
              await dispatch(accInfoAsync() as any);
            } catch {
              /* ignore */
            }
            setTimeout(() => {
              toast.success(t("common.operationSuccess"));
            }, 300);
            if (type === "withdrawPassword") {
              router.replace("/wallet/withdraw");
            }
          };
          if (Platform.OS === "ios") {
            InteractionManager.runAfterInteractions(() => {
              setTimeout(() => {
                void afterClose();
              }, 180);
            });
          } else {
            await afterClose();
          }
        } else {
          toast.error(t(res?.data?.code));
        }
      } catch {
        toast.error(t("common.operationFailed"));
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <CommonModal
        visible={visible}
        onClose={dismiss}
        contentStyle={styles.modalRoot}
        extendBottomSafeArea={false}
        backdropOpacity={0.5}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: Colors[theme].cardBg1,
              width: maxWidth * 0.85,
            },
          ]}
        >
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text
              style={{
                color: Colors[theme].text,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {isSetMode
                ? t("setting.set-withdrawal-password")
                : t("setting.modify-withdrawal-password")}
            </Text>
          </View>

          <View
            style={{
              paddingHorizontal: 15,
              paddingTop: 15,
            }}
          >
            {isSetMode && (
              <Text
                style={[
                  styles.hint,
                  {
                    color: Colors[theme].textSecondary,
                    textAlign: "left",
                    writingDirection: "ltr",
                  },
                ]}
              >
                {t("setting.hint-of-first-time-set-withdrawal-password")}
              </Text>
            )}
            {!isSetMode && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: Colors[theme].text, fontSize: 12 }}>
                    {t("setting.old-withdrawal-password")}
                  </Text>
                </View>
                <Input
                  style={styles.input}
                  containerStyle={{ paddingHorizontal: 0 }}
                  placeholder={`${t("setting.old-withdrawal-password-placeholder")}`}
                  value={oldPwd}
                  inputStyle={{ width: 150, paddingLeft: 5 }}
                  onChangeText={(text) => setOldPwd(filterDigits(text))}
                  maxLength={6}
                  secureTextEntry={!showOldPwd}
                  inputContainerStyle={[
                    styles.inputContainer,
                    {
                      backgroundColor: Colors[theme].background,
                      borderColor: Colors[theme].background,
                    },
                  ]}
                  rightIconContainerStyle={[styles.iconStyle, { width: 26, marginLeft: 10 }]}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowOldPwd(!showOldPwd)}>
                      <Ionicons
                        name={showOldPwd ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  }
                  placeholderTextColor={Colors[theme].lightText}
                />
                <Text
                  style={[
                    styles.fieldHint,
                    {
                      color: Colors[theme].textSecondary,
                      textAlign: "left",
                      writingDirection: "ltr",
                    },
                  ]}
                >
                  {t("bindInfo.withdrawPassword.sixDigitHint")}
                </Text>
              </>
            )}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: Colors[theme].text,
                  fontSize: 12,
                  textAlign: "left",
                  writingDirection: "ltr",
                }}
              >
                {t("setting.new-withdrawal-password")}
              </Text>
            </View>
            <Input
              containerStyle={{ paddingHorizontal: 0 }}
              placeholder={`${t("setting.new-withdrawal-password-placeholder")}`}
              style={styles.input}
              inputStyle={{ width: 150, paddingLeft: 5 }}
              secureTextEntry={!showNewPwd}
              value={newPwd}
              onChangeText={(text) => setNewPwd(filterDigits(text))}
              maxLength={6}
              inputContainerStyle={[
                styles.inputContainer,
                {
                  backgroundColor: Colors[theme].background,
                  borderColor: Colors[theme].background,
                },
              ]}
              rightIconContainerStyle={[styles.iconStyle, { width: 26, marginLeft: 10 }]}
              rightIcon={
                <TouchableOpacity onPress={() => setShowNewPwd(!showNewPwd)}>
                  <Ionicons
                    name={showNewPwd ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              }
              placeholderTextColor={Colors[theme].lightText}
            />
            <Text
              style={[
                styles.fieldHint,
                {
                  color: Colors[theme].textSecondary,
                  textAlign: "left",
                  writingDirection: "ltr",
                },
              ]}
            >
              {t("bindInfo.withdrawPassword.sixDigitHint")}
            </Text>
            {isSetMode && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      color: Colors[theme].text,
                      fontSize: 12,
                      textAlign: "left",
                      writingDirection: "ltr",
                    }}
                  >
                    {t("forgotPwd.inputRePwd")}
                  </Text>
                </View>
                <Input
                  containerStyle={{ paddingHorizontal: 0 }}
                  placeholder={`${t("setting.same-password-placeholder")}`}
                  style={styles.input}
                  inputStyle={{ width: 150, paddingLeft: 5 }}
                  secureTextEntry={!showConfirmPwd}
                  value={confirmPwd}
                  onChangeText={(text) => setConfirmPwd(filterDigits(text))}
                  maxLength={6}
                  inputContainerStyle={[
                    styles.inputContainer,
                    {
                      backgroundColor: Colors[theme].background,
                      borderColor:
                        confirmPwd.length > 0 && confirmPwd !== newPwd
                          ? "#ff4d4f"
                          : Colors[theme].background,
                    },
                  ]}
                  rightIconContainerStyle={[styles.iconStyle, { width: 26, marginLeft: 10 }]}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowConfirmPwd(!showConfirmPwd)}>
                      <Ionicons
                        name={showConfirmPwd ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  }
                  placeholderTextColor={Colors[theme].lightText}
                />
                {confirmPwd.length > 0 && confirmPwd !== newPwd ? (
                  <Text style={styles.inlineError}>
                    {t("bindInfo.withdrawPassword.passwordMismatch")}
                  </Text>
                ) : (
                  <Text
                    style={[
                      styles.fieldHint,
                      {
                        color: Colors[theme].textSecondary,
                        textAlign: "left",
                        writingDirection: "ltr",
                      },
                    ]}
                  >
                    {t("bindInfo.withdrawPassword.sixDigitHint")}
                  </Text>
                )}
                <Text
                  style={[
                    styles.hint,
                    {
                      color: Colors[theme].textSecondary,
                      textAlign: "left",
                      writingDirection: "ltr",
                    },
                  ]}
                >
                  {t("setting.hing-of-set-withdrawal-password")}
                </Text>
              </>
            )}
          </View>

          {/* 按钮区域 */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 15,
              paddingBottom: 20,
              gap: 8,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={[
                styles.button,
                {
                  borderWidth: 1,
                  borderColor: Colors[theme].primary,
                  backgroundColor: "transparent",
                },
              ]}
              onPress={dismiss}
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
              style={[
                styles.button,
                {
                  backgroundColor: Colors[theme].primary,
                  opacity: isSubmitting || !isFormComplete ? 0.5 : 1,
                },
              ]}
              onPress={onConfirm}
              disabled={isSubmitting || !isFormComplete}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                {isSetMode ? t("common.submit") : t("common.confirm")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Toast />
      </CommonModal>
    );
  },
);

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 35,
    fontSize: 12,
    padding: 5,
    borderWidth: 0,
    color: "#666",
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingRight: 10,
    height: 46,
  },
  hint: {
    fontSize: 12,
    marginBottom: 10,
  },
  fieldHint: {
    fontSize: 11,
    marginTop: -6,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  inlineError: {
    fontSize: 11,
    color: "#ff4d4f",
    marginTop: -6,
    marginBottom: 8,
    paddingHorizontal: 2,
    textAlign: "left",
    writingDirection: "ltr",
  },
  iconStyle: {
    height: 32,
  },
  modalRoot: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 10,
    overflow: "hidden",
    marginHorizontal: "auto",
  },
  button: {
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    width: "45%",
  },
});

export default SetWithdrawlPwd;
