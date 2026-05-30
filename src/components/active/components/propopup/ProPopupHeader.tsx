import { proPopup } from "@/components/active/components/activeConfg";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React from "react";
import { ImageBackground, Text, View } from "react-native";

const ProPopupHeader = ({ title }: { title: string }) => {
  const { theme } = useTheme();
  return (
    <ImageBackground
      source={proPopup[theme].header}
      resizeMode="cover"
      style={{
        width: "100%",
        height: 45,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <ImageBackground
        style={{ width: "100%", height: "100%", position: "relative" }}
        resizeMode="cover"
        source={require("@/assets/images/active/components/texture.png")}
      >
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 11,
          }}
        >
          <Text
            className="text-[15]"
            style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}
          >
            {title}
          </Text>
        </View>
      </ImageBackground>
    </ImageBackground>
  );
};

export default ProPopupHeader;
