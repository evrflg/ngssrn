import { RootState } from "@/store/store";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Image, Text, Pressable, View } from "react-native";
import { useSelector } from "react-redux";
import { useToast } from "../common/toast";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { avatarImages, AvatarKey } from "@/constants/avatars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Clipboard from "@react-native-clipboard/clipboard";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { rf } from "@/utils/scaleFont";

interface Props {
  // avatarId?: number;
  // username?: string;
  // uid?: string | number;
  // points?: number;
  // pointsLabel?: string;
  // showPoints?: boolean;
  // showArrow?: boolean;
  // clickable?: boolean;
  backgroundColor?: string;
}

const userIdTextColor = "#adb7ba";
const UserProfileHeader = ({ backgroundColor }: Props) => {
  const userInfo: any = useSelector(
    (state: RootState) => state?.user?.userInfo
  );
  const { theme } = useTheme();
  const [avatar, setAvatar] = useState<AvatarKey>("1");
  const { t } = useTranslation();
  const toast = useToast();

  const loadAvatar = async () => {
    const savedAvatar = await AsyncStorage.getItem("selectedAvatar");
    if (savedAvatar && savedAvatar in avatarImages) {
      setAvatar(savedAvatar as AvatarKey);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setString(text);
      toast.success(t("common.copySuccess"));
    } catch (error) {
      console.error("复制失败:", error);
      toast.error(t("common.copyFailed"));
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAvatar();
    }, [])
  );

  return (
    <View style={[styles.headerRow, { backgroundColor }]}>
      <View style={styles.avatarRing}>
        <View style={styles.avatarInner}>
          <Image
            source={avatarImages[avatar]}
            style={styles.userAvatar}
            resizeMode="cover"
          />
        </View>
      </View>
      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text
            className={`text-${theme}-text`}
            style={styles.username}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {userInfo?.member?.username}
          </Text>
          <Pressable
            onPress={() => router.push("/my/pointBox")}
            style={styles.pointsPressable}
            accessibilityRole="button"
            accessibilityLabel={t("pageName.pointsReward")}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={["#f5b80e", "#e8a105"]}
              style={styles.pointCard}
            >
              <Image
                source={require("@/assets/images/myCenter/point-badge.png")}
                style={styles.pointIcon}
              />
              <Text style={styles.pointsValue}>
                {userInfo?.engage || 0}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
        <View style={styles.uidRow}>
          <Text style={styles.uidText}>
            ID:{userInfo?.member?.uid}
          </Text>
          <Pressable
            onPress={() => {
              if (userInfo?.member?.uid) {
                copyToClipboard(userInfo.member.uid.toString());
              }
            }}
          >
            <Ionicons name="copy-outline" size={16} color={userIdTextColor} />
          </Pressable>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={userIdTextColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  conatiner: {
    borderRadius: 8,
    padding: 8,
    margin: 12,
  },
  /** 對齊 Web UserProfileHeader：padding 5 10 10 10 */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
    paddingTop: 5,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  avatarInner: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  },
  userAvatar: {
    width: "100%",
    height: "100%",
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  username: {
    flex: 1,
    minWidth: 0,
    fontSize: rf(16),
    fontWeight: "600",
  },
  pointsPressable: {
    flexShrink: 0,
  },
  pointCard: {
    minWidth: 60,
    height: 18,
    paddingHorizontal: 8,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  pointIcon: {
    width: 14,
    height: 14,
  },
  pointsValue: {
    color: "#fff",
    fontSize: rf(14),
  },
  uidRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  uidText: {
    color: userIdTextColor,
    fontSize: rf(13),
  },
});

export default UserProfileHeader;
