import React from "react";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import { AuthPhoneIcon } from "@/components/icons/login/AuthPhoneIcon";
import { AuthUserIcon } from "@/components/icons/login/AuthUserIcon";
import { Pressable, View } from "react-native";
import { bgMap } from "./utils/const";
import { loginActiveMethodBg } from "../home/utils/const";

export enum AuthMethodSwtichMode {
  username = "username",
  phone = "phone",
}

export type AuthMethodSwtichProps = {
  mode: AuthMethodSwtichMode;
  onChangeMode: (data: AuthMethodSwtichMode) => void;
};

export const AuthMethodSwtich = ({ mode, onChangeMode }: AuthMethodSwtichProps) => {
  const { theme } = useTheme();
  const isUsernameMode = mode === AuthMethodSwtichMode.username;
  const isPhoneMode = mode === AuthMethodSwtichMode.phone;

  return (
    <View className="flex-row">
      {/* Android：圆角+描边放在普通 View 上做 overflow:hidden，避免 LinearGradient 同层裁切留缝 */}
      <View
        style={{
          borderRadius: 20,
          borderWidth: 2,
          borderColor: Colors[theme].primary,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          className="flex flex-row"
          colors={bgMap[theme].tabBlock}
        >
          <View className="flex flex-row" style={{ overflow: "hidden" }}>
            {isUsernameMode ? (
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderTopRightRadius: 16, borderBottomRightRadius: 16 }}
                colors={loginActiveMethodBg[theme]}
              >
                <Pressable
                  className={`p-3`}
                  onPress={() => onChangeMode(AuthMethodSwtichMode.username)}
                >
                  <AuthUserIcon size={24} active={isUsernameMode} color={"#fff"} />
                </Pressable>
              </LinearGradient>
            ) : (
              <Pressable
                className={`p-3`}
                onPress={() => onChangeMode(AuthMethodSwtichMode.username)}
              >
                <AuthUserIcon size={24} active={isUsernameMode} color={"#fff"} />
              </Pressable>
            )}

            {isPhoneMode ? (
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }}
                colors={loginActiveMethodBg[theme]}
              >
                <Pressable
                  className={`p-3`}
                  onPress={() => onChangeMode(AuthMethodSwtichMode.phone)}
                >
                  <AuthPhoneIcon size={24} active={isPhoneMode} color={"#fff"} />
                </Pressable>
              </LinearGradient>
            ) : (
              <Pressable className={`p-3`} onPress={() => onChangeMode(AuthMethodSwtichMode.phone)}>
                <AuthPhoneIcon size={24} active={isPhoneMode} color={"#fff"} />
              </Pressable>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};
