import { logoutServer } from "@/api";
import { ConfiremModal } from "@/components/common/modal/ConfirmModal";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { AppDispatch } from "@/store/store";
import { changeSessionState, changeUserInfo } from "@/store/user/userSlice";
import { rf } from "@/utils/scaleFont";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";

export type LogOutPopupRef = {
  toggleModal: () => void;
};

const LogOutPopup = forwardRef<LogOutPopupRef, object>(function LogOutPopup(_, ref) {
  const [logOutModal, setLogOutModal] = useState(false);
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { theme } = useTheme();

  useImperativeHandle(
    ref,
    () => ({
      toggleModal: () => setLogOutModal(!logOutModal),
    }),
    []
  );

  const logout = () => {
    logoutServer({}).then(async (res: any) => {
      if (res?.data?.data) {
        dispatch(changeSessionState(null));
        dispatch(changeUserInfo({}));
        setLogOutModal(false);
        setTimeout(() => {
          router.navigate("/(tabs)/home");
        }, 300);
      }
    });
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: Colors[theme].cardBg1 }]}
        onPress={() => {
          setLogOutModal(true);
        }}
      >
        <Text style={[styles.logoutText, { fontSize: rf(12) }]}>
          {t("my.logOut")}
        </Text>
      </TouchableOpacity>

      <ConfiremModal
        id="log-out-popup"
        isVisible={[logOutModal, setLogOutModal]}
        icon={
          <FontAwesome name="exclamation" size={30} color="#fff" />
        }
        title={t("my.makeSureLoginout")}
        onConfirm={logout}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  menuItem: {
    borderRadius: 8,
    marginHorizontal: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  logoutText: {
    fontSize: rf(12),
    fontWeight: "bold",
    textAlign: "center",
    color: "#888",
  },
});

LogOutPopup.displayName = "LogOutPopup";

export default LogOutPopup;