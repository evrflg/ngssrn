import BaseModal, { ModalRefs } from "@/components/common/BaseModal";
import { I18nText } from "@/components/I18nText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { WithdrawPasswordInput } from "./WithdrawPasswordInput";

interface DepositPasswordPopupProps {
  onResolve: (password: string) => void;
  onReject?: () => void;
}

export interface DepositPasswordPopupRef {
  toggleModal: () => void;
}

export const DepositPasswordPopup = React.forwardRef<
  DepositPasswordPopupRef,
  DepositPasswordPopupProps
>(({ onResolve, onReject }, ref) => {
  const { maxWidth } = useMaxWidth();
  const { theme } = useTheme();
  const [password, setPassword] = useState("");
  const modalRef = useRef<ModalRefs>(null);

  const toggleModal = React.useCallback(() => {
    modalRef.current?.toggleModal();
  }, []);

  // 暴露API
  React.useImperativeHandle(ref, () => {
    return {
      toggleModal,
    };
  }, [toggleModal]);

  const onClose = () => {
    toggleModal();
    setPassword("");
    onReject?.();
  };

  const onSubmit = () => {
    if (password.length < 6) return;
    toggleModal();
    onResolve(password);
    setPassword("");
  };

  return (
    <BaseModal
      ref={modalRef}
      needToast={true}
      hasBackdrop={false}
      style={{ width: maxWidth, margin: 0 }}
      children={
        <BlurView
          intensity={30}
          className="w-full justify-center px-6"
          style={[
            StyleSheet.absoluteFill,
            Platform.OS === "android"
              ? { backgroundColor: "rgba(0,0,0,0.5)" }
              : undefined,
          ]}
        >
          <View
            className="p-4 rounded-lg gap-3"
            style={{ backgroundColor: Colors[theme].activeColor }}
          >
            <I18nText
              i18nKey="wallet.popup.enterTradePassword"
              className={`mx-auto text-center`}
              style={{
                color: Colors[theme].gray7,
                fontWeight: "bold",
                fontSize: 12,
              }}
            />
            <WithdrawPasswordInput
              value={password}
              title="wallet.popup.tradePassword"
              onChangeText={setPassword}
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
                    backgroundColor:
                      password.length >= 6
                        ? Colors[theme].primary
                        : Colors[theme].textGray,
                  },
                ]}
                disabled={password.length < 6}
                onPress={onSubmit}
              >
                <I18nText
                  i18nKey="common.go-on"
                  style={[styles.buttonText, { color: "white" }]}
                />
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
        </BlurView>
      }
    />
  );
});

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
