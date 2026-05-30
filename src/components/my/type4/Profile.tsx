import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import UserProfileHeader from "../UserProfileHeader";

/** 我的 type4：头像与资料 */
export default function Profile() {
  return (
    <View style={styles.profileBlock}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/my/settingCenter")}>
        <UserProfileHeader />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  profileBlock: {
    zIndex: 10,
    width: "100%",
  },
});
