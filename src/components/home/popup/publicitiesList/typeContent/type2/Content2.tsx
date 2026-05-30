import { activeTheme } from "@/components/active/activeConfg";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { useTypeContent } from "../../hook/useTypeContent";
import { Body } from "../Body";
import { Footer } from "../Footer";
import { SideMenu } from "./SideMenu";
import { useTypeContentContext } from "../TypeContentContext";

export const TypeContent2 = () => {
  const { publicities } = useTypeContentContext();
  const { theme } = useTheme(); //主题
  const {
    activePublicity,
    selectPublicity,
  } = useTypeContent();

  return (
    <LinearGradient
      colors={[
        activeTheme[theme].promotListBg.s,
        activeTheme[theme].promotListBg.e,
      ]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.tabConatainer]}
    >
      <View className="flex-row w-full">
        <SideMenu
          activePublicityId={activePublicity?.id}
          onSelectPublicity={selectPublicity}
          theme={theme}
        />
        <View
          className={`rounded-r-[10px] flex-1 justify-between ${publicities.length > 1 ? '' : 'rounded-l-[10px]'}`}
          style={{
            backgroundColor: Colors[theme].activeColor,
            height: 400,
          }}
        >
          <Body
            activePublicity={activePublicity}
            theme={theme}
            style={{ padding: 12, maxHeight: 370 }}
            type="2"
          />
          <Footer
            activePublicity={activePublicity}
            theme={theme}
            style={{ marginLeft: 10, marginBottom: 10 }}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  tabConatainer: {
    borderWidth: 0,
    display: "flex",
    flexDirection: "row",
    borderRadius: 10,
  },
});
