import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

const OVERLAY_PATH =
  "M86 20C86 25.5228 81.5229 30 76 30H0C8.83656 30 16 22.8366 16 14V10C16 4.47715 20.4772 0 26 0H76C81.5229 0 86 4.47715 86 10V20Z";

export type ButtonOverlayProps = {
  uniqueId: string;
  color: string;
};

export default function ButtonOverlay({ color }: ButtonOverlayProps) {
  return (
    <View
      pointerEvents="none"
      className="backdrop-blur-sm"
      style={{
        position: "absolute",
        right: 0,
        bottom: 0,
        zIndex: 10,
        width: 86,
        height: 30,
      }}
    >
      <Svg width={86} height={30} viewBox="0 0 86 30">
        <Path d={OVERLAY_PATH} fill={color} fillOpacity={0.15} />
      </Svg>
    </View>
  );
}
