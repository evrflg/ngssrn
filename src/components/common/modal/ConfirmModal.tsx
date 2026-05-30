import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CommonModal from "./CommonModal";

export const ConfiremModal = ({
  isVisible,
  icon,
  title,
  onConfirm,
  onCancel,
  onModalHide,
  hideIconGradient,
  iconOverlapTop = 0,
}: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <CommonModal
      visible={isVisible[0]}
      onClose={onModalHide}
      contentStyle={{ justifyContent: "center" }}
      extendBottomSafeArea={false}
    >
      <View style={[styles.centeredView, { backgroundColor: Colors[theme].cardBg1 }]}>
        <View style={styles.topView}>
          {icon &&
            (hideIconGradient ? (
              <View
                style={{
                  marginTop: -(iconOverlapTop || 0),
                  marginBottom: iconOverlapTop > 0 ? 8 : 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icon}
              </View>
            ) : (
              <LinearGradient
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={{
                  height: 60,
                  width: 60,
                  borderRadius: 60,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                colors={[Colors[theme].gradient, Colors[theme].primary]}
              >
                {icon}
              </LinearGradient>
            ))}
          <Text
            style={{
              textAlign: "center",
              color: Colors[theme].text,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            {title}
          </Text>
        </View>

        <View className="justify-between items-center flex-row mt-2" style={styles.btnView}>
          <TouchableOpacity
            style={[styles.btn, { borderWidth: 1, borderColor: Colors[theme].primary }]}
            onPress={() => {
              isVisible[1](false);
              if (onCancel) {
                onCancel();
              }
            }}
          >
            <Text style={{ color: Colors[theme].primary, fontSize: 14 }}>{t("common.cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: Colors[theme].loginButtonBgColor }]}
            onPress={() => {
              onConfirm?.();
              onModalHide?.();
            }}
          >
            <Text style={{ color: Colors[theme].btnText, fontSize: 14 }}>
              {t("common.confirm")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CommonModal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    width: 300,
    //   height: 200,
    minHeight: 200,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#fff6",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 2,
    padding: 16,
    overflow: "visible",
  },
  topView: {
    // height:120,
    minHeight: 120,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  btnView: {
    height: 44,
    marginTop: 0,
    width: 260,
  },
  btn: {
    height: 44,
    width: 120,
    borderRadius: 44,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  titleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    color: "#000",
  },
});
