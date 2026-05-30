//*设置中心 */
import FloatAds from "@/components/common/FloatAds";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React from "react";
import { Platform } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Type1 from "@/components/my/type1/Index";
import Type2 from "@/components/my/type2/Index";
import Type3 from "@/components/my/type3/Index";
import Type4 from "@/components/my/type4/Index";

const isWeb = Platform.OS === "web";
/**
 * 開發手動切版用：改成 1/2/3/4 可強制顯示對應 myCenter 卡片樣式。
 * 正式環境請維持 null，使用 PROFILE.styleType。
 */
const MANUAL_MY_CENTER_TYPE: 1 | 2 | 3 | 4 | null = null;

const settingCenter = () => {
  const { theme } = useTheme();
  const { personalCenterVersion, selfConfigLoaded } = useSelector((state: RootState) => ({
    personalCenterVersion: state.selfConfig.myCenter,
    selfConfigLoaded: state.selfConfig.loaded,
  }));

  const renderPersonalCenter = () => {
    // 未載入個性化設定時不先渲染，避免先顯示錯版造成閃屏。
    if (!selfConfigLoaded && MANUAL_MY_CENTER_TYPE === null) return null;

    const version = (MANUAL_MY_CENTER_TYPE ?? personalCenterVersion) || 1;
    console.log("version", version);
    switch (version) {
      case 1:
        return <Type1 />;
      case 2:
        return <Type2 />;
      case 3:
        return <Type3 />;
      case 4:
        return <Type4 />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        edges={isWeb ? { top: "additive", bottom: "off" } : ["top", "bottom"]}
        className="flex-1"
        style={{ backgroundColor: Colors[theme].background }}
      >
        {renderPersonalCenter()}
        <FloatAds showPage={2} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default settingCenter;
