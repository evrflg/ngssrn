import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { TouchableOpacity } from "react-native";
import UserProfileHeader from "../UserProfileHeader";
import UserProfileVip from "../UserProfileVip";

/** 我的 type3：资料与 VIP */
export default function Profile() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.push("my/settingCenter");
        }}
      >
        <UserProfileHeader backgroundColor="transparent" />
      </TouchableOpacity>
      <UserProfileVip showBetIcon />
    </>
  );
}
