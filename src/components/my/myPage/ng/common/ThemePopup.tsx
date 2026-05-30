import CommonModal, { CommonModalRef } from "@/components/common/modal/CommonModal";
import { Colors } from "@/constants/Colors";
import { THEME_OPTIONS } from "@/constants/theme";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useDynamicMaxWidth } from "@/hooks/useMaxWidth";
import { rf } from "@/utils/scaleFont";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type ThemePopupRef = {
  toggleModal: () => void;
};

const ThemePopup = forwardRef<ThemePopupRef, object>(function ThemePopup(_, ref) {
  const commonModalRef = useRef<CommonModalRef>(null);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { maxWidth } = useDynamicMaxWidth();

  useImperativeHandle<ThemePopupRef, ThemePopupRef>(
    ref,
    () => ({
      toggleModal: () => commonModalRef.current?.toggleModal(),
    }),
    [],
  );

  return (
    <CommonModal ref={commonModalRef}>
      <View
        style={[
          styles.panel,
          {
            backgroundColor: Colors[theme].cardBg1,
            width: maxWidth,
          },
        ]}
      >
        {THEME_OPTIONS.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={styles.themeOption}
            activeOpacity={0.7}
            onPress={() => {
              toggleTheme(item.value);
              commonModalRef.current?.toggleModal();
            }}
          >
            <Text style={[{ color: Colors[theme].text, fontSize: rf(13) }]}>
              {t(item.labelKey)}
            </Text>
            {theme === item.value ? (
              <View
                style={[
                  styles.checkmark,
                  {
                    borderColor: Colors[theme].primary,
                    backgroundColor: Colors[theme].primary,
                  },
                ]}
              >
                <Text className="text-white">✓</Text>
              </View>
            ) : (
              <View className="border-gray-400" style={styles.checkmark} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </CommonModal>
  );
});

ThemePopup.displayName = "ThemePopup";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  panel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 15,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
});

export default ThemePopup as React.ForwardRefExoticComponent<
  object & React.RefAttributes<ThemePopupRef>
>;
