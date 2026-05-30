import { useTheme } from "@/hooks/theme/ThemeProvider";
import { View } from "react-native";
import { useTypeContent } from "../../hook/useTypeContent";
import { Body } from "../Body";
import { Footer } from "../Footer";
import { Tabs } from "./Tabs";

export const TypeContent1 = () => {
  const { theme } = useTheme(); //主题
  const {
    activePublicity,
    selectPublicity,
  } = useTypeContent();

  return (
    <View className={`rounded-[10px] bg-${theme}-activeColor`}>
      <Tabs
        activePublicityId={activePublicity?.id}
        onSelectPublicity={selectPublicity}
      />
      <Body
        activePublicity={activePublicity}
        theme={theme}
        style={{ padding: 12 }}
        type="1"
      />
      <View className="px-[12px] pb-[12px]">
        <Footer
          activePublicity={activePublicity}
          theme={theme}
        />
      </View>
    </View>
  );
};
