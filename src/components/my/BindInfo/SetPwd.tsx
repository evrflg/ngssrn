/**登入密码 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import CommonModal from "@/components/common/modal/CommonModal";
import { updateLoginPwd } from "@/api";
import { Input } from "@rneui/themed";
import { useToast } from "@/components/common/toast";
import Toast from "@/components/common/toast/src/Toast";
import { useTranslation } from "react-i18next";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { rf } from "@/utils/scaleFont";
import { validatePassword } from "@/components/login/utils/util";

interface SetPwdProps {
  isVisible: boolean;
  onClose: () => void;
}

const SetPwd: React.FC<SetPwdProps> = ({ isVisible, onClose }) => {
  const { theme } = useTheme();
  const { maxWidth } = useMaxWidth();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const toast = useToast();
  const { t } = useTranslation();
  const onConfirm = () => {
    if (!oldPwd) {
      toast.error(t("setPwd.oldPwdNotEmpty"));
      return;
    }
    if (!validatePassword(newPwd, toast, t)) {
      return;
    }

    let params = {
      oldPwd: oldPwd,
      newPwd: newPwd,
      type: "0",
    };
    updateLoginPwd(params).then((res: any) => {
      if (res?.data?.data === true || res?.data?.code === 0) {
        toast.success(t("common.operationSuccess"));
        setOldPwd("");
        setNewPwd("");
        onClose();
      } else {
        toast.error(t(res?.data?.code));
      }
    });
  };

  return (
    <CommonModal
      visible={isVisible}
      onClose={onClose}
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
            {t("common.modify")} {t("bindInfo.loginPwd")}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 15, paddingTop: 15 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: Colors[theme].text }}> {t("setPwd.inputOldPwd")}</Text>
          </View>
          <Input
            style={styles.input}
            containerStyle={{ paddingHorizontal: 0 }}
            placeholder={t("setPwd.inputOldPwd")}
            value={oldPwd}
            inputStyle={{ width: 150, paddingLeft: 5 }}
            onChangeText={setOldPwd}
            secureTextEntry={!showOldPassword}
            inputContainerStyle={[
              styles.inputContainer,
              {
                backgroundColor: Colors[theme].background,
                borderColor: Colors[theme].background,
              },
            ]}
            rightIconContainerStyle={[styles.iconStyle, { width: 26, marginLeft: 10 }]}
            rightIcon={
              <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                <Ionicons
                  name={showOldPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            }
            placeholderTextColor={Colors[theme].lightText}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: Colors[theme].text }}> {t("forgotPwd.inputRePwd")}</Text>
          </View>
          <Input
            containerStyle={{ paddingHorizontal: 0 }}
            placeholder={t("forgotPwd.inputRePwd")}
            style={styles.input}
            inputStyle={{ width: 150, paddingLeft: 5 }}
            secureTextEntry={!showConfirmPassword}
            value={newPwd}
            onChangeText={setNewPwd}
            inputContainerStyle={[
              styles.inputContainer,
              {
                backgroundColor: Colors[theme].background,
                borderColor: Colors[theme].background,
              },
            ]}
            rightIconContainerStyle={[styles.iconStyle, { width: 26, marginLeft: 10 }]}
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            }
            placeholderTextColor={Colors[theme].lightText}
          />
        </View>

        {/* 按钮区域 */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            paddingBottom: 20,
            justifyContent: "space-between",
            alignItems: "center",
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
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: Colors[theme].primary }]}>
              {t("common.cancel")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: Colors[theme].primary,
              },
            ]}
            onPress={onConfirm}
          >
            <Text style={[styles.buttonText, { color: "white" }]}>{t("common.confirm")}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </CommonModal>
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 35,
    fontSize: 12,
    color: "#666",
    padding: 5,
    borderWidth: 0,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingRight: 10,
    //borderEndWidth: 1,
    height: 46,
  },
  iconStyle: {
    height: 32,
  },
  buttonText: {
    fontSize: rf(14),
    fontWeight: "500",
  },
  modalRoot: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 10,
    overflow: "hidden",
  },
  button: {
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    width: "45%",
  },
});

export default SetPwd;
