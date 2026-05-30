import React, { useState, useImperativeHandle, forwardRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import Modal from "react-native-modal";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { parseContent, ParsedContent } from "@/utils/message";

const { maxWidth } = useMaxWidth();

export interface ActivityPushPopupHandle {
  showPopup: (message: string) => void;
  show?: boolean;
}

interface ActivityPushPopupProps {
  onClose?: () => void;
}
let targetType: string, targetId: string;
export const ActivityPushPopup = forwardRef<
  ActivityPushPopupHandle,
  ActivityPushPopupProps
>(({ onClose }, ref) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [activityId, setActivityId] = useState("");

  const showPopup = (cont: string) => {
    const { content, type, id } = parseContent(cont) as Required<ParsedContent>
    targetType = type
    targetId = id
    setMessage(content);
    setShow(true);
  };

  const handleLinkClick = () => {
    if (targetType === 'unlock') {
      router.push({ pathname: '/my/balanceGold'})
    } else if (targetId) {
      navigation.navigate("active/activeCenter", {
        id: activityId,
        type: 1,
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setShow(false);
    onClose?.();
  };

  useImperativeHandle(ref, () => ({
    showPopup,
    show,
  }));

  return (
    <Modal
      isVisible={show}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.5}
      onBackdropPress={handleClose}
      style={styles.modal}
    >
      <View style={[styles.popupContainer, { maxWidth }]}>
        <Image
          source={require("@/assets/images/promotion/popup.png")}
          style={styles.headerImage}
          resizeMode="contain"
        />
        <View
          style={[
            styles.mainContainer,
            { backgroundColor: Colors[theme].blockBg || "#fff" },
          ]}
        >
          <View style={styles.content}>
            <Text
              style={[styles.activityMessage, { color: Colors[theme].text }]}
            >
              {message}
            </Text>
            <TouchableOpacity
              style={[
                styles.linkButton,
                { backgroundColor: Colors[theme].primary || "#4781ff" },
              ]}
              onPress={handleLinkClick}
            >
              <Text
                style={[
                  styles.linkButtonText,
                  { color: Colors[theme].btnText || "#fff" },
                ]}
              >
                {t("status.claim.goingToClaim")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.closeButtonContainer}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close-circle-outline" size={34} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

ActivityPushPopup.displayName = "ActivityPushPopup";

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  popupContainer: {
    width: "86%",
    alignItems: "center",
  },
  headerImage: {
    width: "100%",
    height: 120,
  },
  mainContainer: {
    marginTop: -2,
    width: "100%",
    borderRadius: 8,
    padding: 2,
  },
  content: {
    width: "100%",
    alignItems: "center",
    gap: 12,
    borderRadius: 6,
    padding: 16,
  },
  activityMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  linkButton: {
    height: 32,
    paddingHorizontal: 24,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100,
  },
  linkButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  closeButtonContainer: {
    padding: 8,
    width: "100%",
    alignItems: "center",
  },
  closeButton: {
    padding: 4,
  },
});
