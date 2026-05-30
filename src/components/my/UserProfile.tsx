import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { accInfoAsync } from "@/store/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/common/toast";
import {
  avatarImages,
  AvatarKey,
  AVATAR_STORAGE_KEY,
} from "@/constants/avatars";
import { rf } from "@/utils/scaleFont";

const UserProfile = () => {
  const userInfo: any = useSelector(
    (state: RootState) => state?.user?.userInfo,
  );
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [avatar, setAvatar] = useState<AvatarKey>("1");
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const toast = useToast();

  useEffect(() => {
    dispatch(accInfoAsync());
  }, []);

  const loadAvatar = async () => {
    const savedAvatar = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
    if (savedAvatar && savedAvatar in avatarImages) {
      setAvatar(savedAvatar as AvatarKey);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAvatar();
    }, []),
  );

  const handleAvatarPress = () => {
    navigation.push("avatars", { index: avatar });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setString(text);
      toast.success(t("common.copySuccess"));
    } catch {
      toast.error(t("common.copyFailed"));
    }
  };

  return (
    <View style={[{ backgroundColor: Colors[theme].background }]}>
      <View
        style={[styles.userInfo, { backgroundColor: Colors[theme].cardBg1 }]}
      >
        <TouchableOpacity style={styles.avatarInfo} onPress={handleAvatarPress}>
          <View style={styles.avatarBox}>
            <Image
              source={avatarImages[avatar]}
              style={styles.userAvatar}
              resizeMode="cover"
            />
          </View>
          <View style={styles.right}>
            <Text
              style={[
                styles.changeText,
                { color: Colors[theme].text, fontSize: rf(14) },
              ]}
            >
              {t("my.changePicture")}
            </Text>
            {/* <Ionicons name="chevron-forward" size={16} color="#666" /> */}
          </View>
        </TouchableOpacity>

        <View style={styles.item}>
          <Text
            style={[
              styles.label,
              { color: Colors[theme].text, fontSize: rf(13) },
            ]}
          >
            {t("userProfile.nickName")}
          </Text>
          <View style={styles.right}>
            <Text
              style={[
                styles.value,
                { color: Colors[theme].text, fontSize: rf(14) },
              ]}
            >
              {userInfo?.member?.username}
            </Text>
          </View>
        </View>

        <View style={styles.item}>
          <Text
            style={[
              styles.label,
              { color: Colors[theme].text, fontSize: rf(13) },
            ]}
          >
            UID
          </Text>
          <View style={styles.right}>
            <Text
              style={[
                styles.value,
                { color: Colors[theme].text, fontSize: rf(14) },
              ]}
            >
              {userInfo?.member?.uid}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (userInfo?.member?.uid) {
                  copyToClipboard(userInfo.member.uid.toString());
                }
              }}
            >
              <Ionicons name="copy-outline" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userInfo: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 12,
    marginTop: 8,
  },
  avatarInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "transparent",
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  },
  userAvatar: {
    width: "100%",
    height: "100%",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeText: {
    color: "#666",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "transparent",
  },
  label: {
    flex: 1,
    fontSize: 12,
    color: "#333",
    writingDirection: "ltr",
  },
  value: {
    color: "#666",
    marginRight: 8,
  },
});

export default UserProfile;
