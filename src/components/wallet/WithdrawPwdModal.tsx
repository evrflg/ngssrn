import { vertifyReceiptPwd } from "@/api";
import { useToast } from "@/components/common/toast";
import Toast from "@/components/common/toast/src/Toast";
import { I18nText } from "@/components/I18nText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { showErrorMessage } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { WithdrawPasswordInput } from "./WithdrawPasswordInput";
import { useTranslation } from "react-i18next";

export const WithdrawPwdModal = React.forwardRef(
  (
    {
      handleSuccess,
      handleReject,
    }: { handleSuccess: (password: string) => void; handleReject?: () => void },
    ref,
  ) => {
    const { maxWidth } = useMaxWidth();
    const { theme } = useTheme();
    const toast = useToast();
    const { t } = useTranslation();
    const [withdrawPassword, setWithdrawPassword] = useState("");
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // 暴露API
    React.useImperativeHandle(ref, () => ({
      toggleModal,
      closeModal: () => {
        setVisible(false);
        setWithdrawPassword("");
      },
    }));

    const toggleModal = () => {
      setVisible((prev) => !prev);
    };

    const onClose = () => {
      toggleModal();
      setWithdrawPassword("");
      if (handleReject) handleReject();
    };

    const onSubmit = async () => {
      setLoading(true);
      try {
        const result = await vertifyReceiptPwd({
          pwd: withdrawPassword,
        });
        if (result?.data?.data) {
          setVisible(false);
          setWithdrawPassword("");
          handleSuccess(withdrawPassword);
        } else {
          const errorMsg = t(String(result?.data?.code)) || result?.data?.msg
          showErrorMessage(errorMsg);
          toast.error(errorMsg);
        }
      } catch (e) {
        console.error("vertifyReceiptPwd", e);
        const msg = (e as Error)?.message;
        if (msg) toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <BlurView
          intensity={30}
          className="w-full h-full justify-center items-center"
          style={[
            StyleSheet.absoluteFill,
            Platform.OS === "android"
              ? { backgroundColor: "rgba(0,0,0,0.5)" }
              : undefined,
          ]}
        >
          <View
            className="px-6"
            style={{ width: maxWidth, marginHorizontal: "auto" }}
          >
            <View
              className="p-4 rounded-lg gap-3 w-full"
              style={{ backgroundColor: Colors[theme].activeColor }}
            >
              <I18nText
                i18nKey="wallet.popup.please-enter-the-withdrawal-password"
                className={`mx-auto text-center`}
                style={{
                  color: Colors[theme].gray7,
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              />
              <WithdrawPasswordInput
                value={withdrawPassword}
                onChangeText={setWithdrawPassword}
              />
              <I18nText
                i18nKey="wallet.popup.passwordTips"
                className={`text-${theme}-btnText`}
                style={{
                  color: Colors[theme].textGray,
                  fontSize: 10,
                  lineHeight: 12,
                }}
              />
              <View className="flex-row gap-2 items-center">
                <Pressable
                  className="flex-1"
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
                  <I18nText
                    i18nKey="common.cancel"
                    style={[
                      styles.buttonText,
                      { color: Colors[theme].primary },
                    ]}
                  />
                </Pressable>
                <Pressable
                  className="flex-1"
                  style={[
                    styles.button,
                    {
                      backgroundColor: Colors[theme].primary,
                      opacity: loading ? 0.5 : 1,
                    },
                  ]}
                  disabled={loading}
                  onPress={onSubmit}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <I18nText
                      i18nKey="common.confirm"
                      style={[styles.buttonText, { color: "white" }]}
                    />
                  )}
                </Pressable>
              </View>
            </View>
            <TouchableOpacity
              style={{ marginTop: 9, marginHorizontal: "auto" }}
              onPress={onClose}
            >
              <Ionicons
                color={"#fff"}
                name={"close-circle-outline"}
                size={34}
              />
            </TouchableOpacity>
          </View>
        </BlurView>
        <Toast />
      </Modal>
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
    backgroundColor: "red",
  },
  button: {
    borderRadius: 25,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 500,
    textAlign: "center",
  },
});
