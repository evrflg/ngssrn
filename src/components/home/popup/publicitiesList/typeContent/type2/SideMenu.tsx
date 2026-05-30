import { activeTheme } from "@/components/active/activeConfg";
import { Colors } from "@/constants/Colors";
import { Publicity } from "@/types/publicity";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTypeContentContext } from "../TypeContentContext";

interface SideMenuProps {
  activePublicityId?: string;
  onSelectPublicity: (publicity: Publicity) => void;
  theme: keyof typeof Colors;
}

export function SideMenu({
  activePublicityId,
  onSelectPublicity,
  theme,
}: SideMenuProps) {
  const { t } = useTranslation();
  const { publicities } = useTypeContentContext();

  if (publicities.length <= 1) return null;

  return (
    <View style={styles.sideMenu}>
      {publicities.map((publicity, index) => (
        <View
          key={`publicity-item-${publicity.id}`}
          className="flex-row items-center justify-center"
        >
          <Pressable
            className="h-[40px] w-full items-center justify-center flex-row"
            onPress={() => onSelectPublicity(publicity)}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.publicityTitle,
                activePublicityId === publicity.id ? styles.active : undefined,
              ]}
            >
              {t("popup.publicitiesList.notificationWithIndex", {
                index: index + 1,
              })}
            </Text>
          </Pressable>
          {activePublicityId === publicity.id && (
            <LinearGradient
              key={`border-${publicity.id}`}
              style={styles.tabBorder}
              colors={[
                activeTheme[theme].tabBorder.s,
                activeTheme[theme].tabBorder.e,
                activeTheme[theme].tabBorder.s,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sideMenu: {
    width: 100,
    paddingTop: 16,
    paddingHorizontal: 8,
    height: 400,
    // overflow: "scroll",
  },
  publicityTitle: {
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowRadius: 2,
    textShadowOffset: { width: 2, height: 2 },
    color: "#eaeaea",
  },
  active: {
    fontWeight: "bold",
    color: "#fff",
  },
  tabBorder: {
    width: 1,
    height: 26,
    position: "absolute",
    right: 0,
  },
});
