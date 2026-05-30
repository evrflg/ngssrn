import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

interface CloseButtonProps {
  onClose: () => void | Promise<void>;
}

export function CloseButton({ onClose }: CloseButtonProps) {
  return (
    <Pressable
      style={{ marginTop: 17, marginHorizontal: "auto" }}
      onPress={onClose}
    >
      <Ionicons color={"#fff"} name={"close-circle-outline"} size={34} />
    </Pressable>
  );
}
