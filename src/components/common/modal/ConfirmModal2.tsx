import Modal from "react-native-modal";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import CommonModal from "./CommonModal";

export const ConfiremModal2 = ({ isVisible, icon, title, onConfirm, content }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <CommonModal
        visible={isVisible[0]}
        contentStyle={{ justifyContent: "center" }}
        extendBottomSafeArea={false}
      >
        <View style={[styles.centeredView, { backgroundColor: Colors[theme].cardBg1 }]}>
          <View style={styles.topView}>
            <Text
              style={{
                textAlign: "center",
                color: Colors[theme].text,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {title}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 14,
                color: Colors[theme].text,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {content}
            </Text>
          </View>

          <View className="justify-between items-center flex-row" style={styles.btnView}>
            <TouchableOpacity
              style={[styles.btn]}
              onPress={() => {
                isVisible[1](false);
              }}
            >
              <Text style={{ color: Colors[theme].lightText, fontSize: 14 }}>
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn]}
              onPress={() => {
                onConfirm();
              }}
            >
              <Text style={{ color: Colors[theme].primary, fontSize: 14 }}>
                {t("common.confirm")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </CommonModal>
    </View>
  );
};

const styles = StyleSheet.create({
  model: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },
  centeredView: {
    width: 240,
    height: 160,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 0,
    shadowColor: "#fff6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 2,
  },
  topView: {
    height: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
  },
  btnView: {
    height: 44,
    marginTop: 10,
    width: 240,
  },
  btn: {
    height: 44,
    width: 120,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});
