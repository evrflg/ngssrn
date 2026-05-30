import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import UserProfileHeader from "../UserProfileHeader";
import UserProfileVip from "../UserProfileVip";
import { router } from "expo-router";

/** 我的 type1：顶部资料与头像；点击进入设置中心 */
export default function ProfileCard() {
  const { theme } = useTheme();

  return (
    <View style={[styles.userInfo, { backgroundColor: Colors[theme].cardBg1 }]}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => router.navigate("/my/settingCenter")}>
        <UserProfileHeader />
      </TouchableOpacity>
      {/* VIP 等级等 */}
      <UserProfileVip showBetIcon />
    </View>
  );
}

const styles = StyleSheet.create({
  userInfo: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 0,
    marginTop: 10,
    marginHorizontal: 12,
    marginBottom: 0,
    overflow: "hidden",
    gap: 0,
  },
});
