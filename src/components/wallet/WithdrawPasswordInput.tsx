import React, { useState, useRef } from "react";
import { Pressable, StyleSheet, View, TextInput } from "react-native";
import { I18nText } from "@/components/I18nText";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import Octicons from "@expo/vector-icons/Octicons";
import { Colors } from "@/constants/Colors";

interface WithdrawPasswordInputProps {
  value: string;
  title?: string;
  onChangeText: (text: string) => void;
}

export const WithdrawPasswordInput: React.FC<WithdrawPasswordInputProps> = ({
  value,
  title,
  onChangeText,
}) => {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const currentValue = value || "";
  const digits = Array.from({ length: 6 }, (_, i) => currentValue[i] || "");

  const handleTextChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").charAt(0) || "";

    if (digit) {
      const newDigits = [...digits];
      newDigits[index] = digit;
      const newValue = newDigits.join("");
      onChangeText(newValue);

      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      onChangeText(newDigits.join(""));
      inputRefs.current[index - 1]?.focus();
    } else if (key === "Backspace" && digits[index]) {
      const newDigits = [...digits];
      newDigits[index] = "";
      onChangeText(newDigits.join(""));
    }
  };

  return (
    <>
      <View className="flex-row justify-between items-center mb-2">
        <I18nText
          i18nKey={title ?? "wallet.popup.withdrawPassword"}
          style={{
            color: Colors[theme].textSecondary,
            fontSize: 10,
          }}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <Octicons
              name="eye"
              size={16}
              color={Colors[theme].textSecondary}
            />
          ) : (
            <Octicons
              name="eye-closed"
              size={16}
              color={Colors[theme].textSecondary}
            />
          )}
        </Pressable>
      </View>
      <View style={[styles.container, { paddingHorizontal: 8 }]}>
        {digits.map((digit: string, index: number) => (
          <View
            key={index}
            style={[
              styles.inputBox,
              index === 0 && styles.firstBox,
              index === 5 && styles.lastBox,
              {
                borderColor: Colors[theme].primary,
                backgroundColor: Colors[theme].cardBg1 || Colors[theme].background,
              },
            ]}
          >
            <TextInput
              ref={(ref: TextInput | null) => { inputRefs.current[index] = ref; }}
              style={[styles.input, { color: Colors[theme].text }]}
              value={digit}
              onChangeText={(text: string) => handleTextChange(text, index)}
              onKeyPress={({ nativeEvent }: any) => handleKeyPress(nativeEvent.key, index)}
              secureTextEntry={!showPassword}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          </View>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    marginVertical: 4,
  },
  inputBox: {
    flex: 1,
    minWidth: 40,
    height: 46,
    borderWidth: 1,
    borderRightWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  firstBox: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  lastBox: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderRightWidth: 1,
  },
  input: {
    width: "100%",
    height: "100%",
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    padding: 0,
    backgroundColor: "transparent",
  },
});
