//vip弹窗的专属标头
import ProPopupHeader from "@/components/active/components/propopup/ProPopupHeader";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const MODAL_BACKDROP = "rgba(0,0,0,0.55)";

interface QuePopupModalProps {
  title: string;
  visible: boolean;
  onClose: () => void;
}

const QuePopup: React.FC<QuePopupModalProps> = ({
  title,
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { maxWidth } = useMaxWidth();

  const body = (
    <View style={styles.bodyRoot} collapsable={false}>
      <Pressable
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: MODAL_BACKDROP },
        ]}
        onPress={onClose}
      />
      <View
        pointerEvents="box-none"
        style={[StyleSheet.absoluteFillObject, styles.contentLayer]}
        collapsable={false}
      >
        <View
          className="px-9 justify-center flex-1"
          pointerEvents="box-none"
          style={{ width: "100%", maxWidth, alignSelf: "center" }}
        >
          <View
            className="w-full rounded-2xl overflow-hidden"
            style={{ backgroundColor: Colors[theme].background }}
          >
            <ProPopupHeader title={title} />
            <View className="p-4">
              <View
                className="p-3"
                style={{
                  borderRadius: 5,
                  backgroundColor: Colors[theme].downloadGuideBgColor,
                }}
              >
                <Text
                  className="flex-row"
                  style={{
                    fontSize: 12,
                    color: Colors[theme].darkColor,
                    textAlign: "left",
                  }}
                >
                  {t("active.vip.fuLiTip1")}
                  <Text style={{ fontSize: 12, color: Colors[theme].primary }}>
                    {t("active.vip.fuLiTip2")}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
          <View className="w-full self-stretch justify-center items-center">
            <Pressable
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              style={styles.closePressable}
              onPress={onClose}
            >
              <Ionicons
                color={"#fff"}
                name={"close-circle-outline"}
                size={34}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  if (!visible) return null;

  if (Platform.OS === "web") {
    return (
      <Modal transparent visible animationType="none" onRequestClose={onClose}>
        <View style={styles.webModalRoot}>{body}</View>
      </Modal>
    );
  }

  return (
    <View style={styles.screenOverlay} pointerEvents="box-none">
      {body}
    </View>
  );
};

const styles = StyleSheet.create({
  bodyRoot: {
    flex: 1,
    width: "100%",
  },
  contentLayer: {
    justifyContent: "center",
    ...Platform.select({
      android: { elevation: 8 },
      default: {},
    }),
  },
  closePressable: {
    marginTop: 9,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  screenOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100000,
    ...Platform.select({
      android: { elevation: 100 },
      default: {},
    }),
  },
  webModalRoot: {
    flex: 1,
    width: "100%",
  },
});

export default QuePopup;
