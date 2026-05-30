import { useTheme } from "@/hooks/theme/ThemeProvider";
import { View } from "react-native";
import { useTypeContent } from "../../hook/useTypeContent";
import { Body } from "../Body";
import { Footer } from "../Footer";
import { Pagination } from "./Pagination";

export const TypeContent3 = () => {
  const { theme } = useTheme(); //主题
  // type3 自己使用专属 hook，主组件这里只负责把子区域拼起来
  const {
    activePublicity,
    onPaginate,
  } = useTypeContent();

  return (
    <View className={`p-[12px] rounded-[10px] bg-${theme}-activeColor`}>
      <Body
        activePublicity={activePublicity}
        theme={theme}
      />
      <Pagination
        activePublicityId={activePublicity?.id}
        onPaginate={onPaginate}
        theme={theme}
      />
      <Footer
        activePublicity={activePublicity}
        theme={theme}
      />
    </View>
  );
};
