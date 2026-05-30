import { View, Image, useWindowDimensions } from "react-native";
import TopLeftBadge from "./TopLeftBadge";

export default function ({ type = "2" }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const padding = Math.max(12, Math.min(24, screenWidth * 0.05));
  const imageHeight = Math.min(
    type === "2" ? 540 : 470,
    Math.max(220, screenHeight * 0.45),
  );

  return (
    <View
      style={{ padding }}
      className="border border-[#f48d16] rounded-lg bg-white"
    >
      <TopLeftBadge />
      <Image
        source={{ uri: "https://wk6.me/img/IY81/LawXFFhdi.png" }}
        resizeMode="contain"
        style={{ height: 48, width: 144, alignSelf: "center" }}
      />
      {type === "2" ? (
        <Image
          source={require("@/assets/images/promotion/agentType2.jpg")}
          resizeMode="contain"
          style={{ width: "100%", height: imageHeight }}
        />
      ) : (
        <Image
          source={require("@/assets/images/promotion/agentType3.jpg")}
          resizeMode="contain"
          style={{ width: "100%", height: imageHeight }}
        />
      )}
    </View>
  );
}
