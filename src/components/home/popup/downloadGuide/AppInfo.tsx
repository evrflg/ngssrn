import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { RootState } from "@/store/store";
import { Image, Text, View } from "react-native";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { updateIOSAppTitle } from "@/utils/webInfo";
import { useDownloadGuideContext } from "./Context";
import { styles } from "./styles";

export const DownloadGuideAppInfo = () => {
  const { theme } = useTheme();
  const { appInfo } = useDownloadGuideContext();
  const siteConfig = useSelector((state: RootState) => state.user.cfg_site_base);
  const appIcon = appInfo?.appStore?.appIcon || siteConfig?.phoneLogoFileUrl;
  const appName =
    appInfo?.appName || appInfo?.appStore?.appName || siteConfig?.siteName;

  useEffect(() => {
    updateIOSAppTitle(appName ?? undefined);
  }, [appName]);

  if (!appIcon && !appName) return null;

  return (
    // 应用信息
    <View
      className="flex-row px-4 rounded items-center py-1 gap-3"
      style={{
        backgroundColor: Colors[theme].downloadGuideBgColor,
      }}
    >
      <Image
        source={{ uri: appIcon }}
        defaultSource={require("@/assets/images/home/appdownload/apk-icon.png")}
        style={styles.apkIconImage}
      />
      <Text className={`text-${theme}-darkColor`} style={styles.apkLink}>
        {appName}
      </Text>
    </View>
  );
};
