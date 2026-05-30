import { RootState } from "@/store/store";
import {
  View, Text, StyleSheet, Image,
  Dimensions,
  Pressable,
} from "react-native"
import { useSelector } from "react-redux";
import { memo, useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AboutUs from "./components/AboutUs";
import JoinUs from "./components/JoinUs";
import { GameManufacturers } from "./components/GameManufacturers";
import { TextUs } from "./components/TextUs";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

const screenWidth = Dimensions.get("window").width - 24;

const BottomAreaComponent = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const indexFooter: any = useSelector((state: RootState) => state?.selfConfig?.indexFooter);
  const cfg_site_base: any = useSelector((state: RootState) => state?.user?.cfg_site_base);
  const gameList: any = useSelector((state: RootState) => state?.game?.gameList);
  const gameZoneDict: any = useSelector((state: RootState) => state?.game?.gameZoneDict);
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const { theme } = useTheme();
  const gameZoneLabelMap = useMemo(() => {
    const dict: Record<string, string> = {};
    if (Array.isArray(gameZoneDict)) {
      gameZoneDict.forEach((item: any) => {
        const key = String(item?.value ?? "");
        if (key) {
          dict[key] = item?.label ?? "";
        }
      });
    }
    return dict;
  }, [gameZoneDict]);

  /** 全页分割线统一：物理细线 + 主题分割色 */
  const dividerLineStyle = useMemo(
    () => ({
      height: StyleSheet.hairlineWidth,
      backgroundColor: Colors[theme].dividerColor,
    }),
    [theme],
  );

  /** 与 `GameBlock`「更多」一致：`type`=gameZone，`id`=区块 id，用于二级游戏页 */
  const openSecondaryGames = useCallback(
    (item: any, tabLabel: string) => {
      if (!userInfo?.isLogin) {
        navigation.push("login");
        return;
      }
      const type = item?.gameZone != null ? String(item.gameZone) : "";
      const id = item?.id != null ? String(item.id) : "";
      if (!type || !id) return;
      navigation.push("secondary-games/index", { type, id, tabLabel });
    },
    [navigation, userInfo?.isLogin]
  );

  const list = Array.isArray(gameList) ? gameList : [];
  const gameListItems = useMemo(
    () =>
      list.map((item: any, index: number) => {
        const gameZoneLabel = gameZoneLabelMap[String(item?.gameZone ?? "")];
        const displayLabel = gameZoneLabel || item?.customName || "";
        return (
          <Pressable
            key={`${item?.id || item?.gameZone || index}-${i18n.language}`}
            onPress={() => openSecondaryGames(item, displayLabel)}
          >
            <Text className="inline-flex" style={{ color: Colors[theme].lightText, fontSize: 13 }}>
              {displayLabel}
            </Text>
          </Pressable>
        );
      }),
    [list, theme, gameZoneLabelMap, i18n.language, openSecondaryGames]
  );

  return <View style={styles.container}  >
    {indexFooter == 1 && <>
      <AboutUs />
      {/* <AppDownload/> */}
      <JoinUs />
      <GameManufacturers />
      <TextUs />
    </>}
    {indexFooter == 2 && <>
      <View className="mt-2.5 flex-row justify-center items-center" 
      style={{ paddingHorizontal: 12,
       marginTop: 10,
        }}>
        <View className="h-10 " style={{ width: 80,marginRight:10 }}>
          {cfg_site_base?.phoneLogoFileUrl && <Image
            style={{ flex: 1 }}
            resizeMode='contain'
            source={{ uri: cfg_site_base?.phoneLogoFileUrl }}
          />}
        </View>
        <View style={[dividerLineStyle, { flex: 1 }]} />
      </View>
      
      <View className="flex-row px-3 gap-2" style={{ marginVertical: 30 }}>
        <Text className="font-bold inline-flex" style={{ color: Colors[theme].text, fontSize: 13 }}>{t("home.bottomArea.games")}</Text>
        <View className="flex-1 flex-row flex-wrap gap-2">{gameListItems}</View>

      </View>
      <View className="mt-3 flex-row px-3 gap-2">
        <Text className="font-bold" style={{ color: Colors[theme].text, fontSize: 13 }}>{t("home.bottomArea.support")}</Text>
        <Text className="" style={{ color: Colors[theme].lightText, fontSize: 13 }}>{t("common.onlineSupport")}</Text>
        <Text className="" style={{ color: Colors[theme].lightText, fontSize: 13 }}>{t("home.aboutUs")}</Text>
        <Text className="" style={{ color: Colors[theme].lightText, fontSize: 13 }}>{t("pageName.feedback")}</Text>
      </View>
      <View
        style={[
          dividerLineStyle,
          { width: screenWidth, marginVertical: 30, marginLeft: 12 },
        ]}
      />
      <JoinUs />
      <View
        style={[
          dividerLineStyle,
          { width: screenWidth, marginVertical: 30, marginLeft: 12 },
        ]}
      />
      <GameManufacturers />
      <View
        style={[
          dividerLineStyle,
          { width: screenWidth, marginVertical: 30, marginLeft: 12 },
        ]}
      />
      <TextUs />
    </>}
    {indexFooter == 3 && <>
      <AboutUs />
      {/* <View className="flex flex-row items-center justify-center mt-4 mb-1 pl-10 pr-10">
        <View style={[dividerLineStyle, { flex: 1 }]} />
        <Text className="ml-3 font-medium mr-3 text-center" style={{color:Colors[theme].text,fontSize:13}}>{t("home.bottomArea.app")}</Text>
        <View style={[dividerLineStyle, { flex: 1 }]} />
      </View> */}
      {/* <AppDownload/> */}
      <View className="flex flex-row items-center justify-center mt-4 mb-4 pl-10 pr-10">
        <View style={[dividerLineStyle, { flex: 1 }]} />
        <Text className="ml-3 font-medium mr-3 text-center" style={{ color: Colors[theme].text, fontSize: 13 }}>{t("home.joinUs")}</Text>
        <View style={[dividerLineStyle, { flex: 1 }]} />
      </View>
      <JoinUs />
      <View className="flex flex-row items-center justify-center mt-4 mb-2 pl-10 pr-10">
        <View style={[dividerLineStyle, { flex: 1 }]} />
        <Text className="ml-3 font-medium mr-3 text-center" style={{ color: Colors[theme].text, fontSize: 13 }}>{t("home.bottomArea.partners")}</Text>
        <View style={[dividerLineStyle, { flex: 1 }]} />
      </View>
      <GameManufacturers />
      <View className="flex flex-row items-center justify-center mt-4 mb-4 pl-10 pr-10">
        <View style={[dividerLineStyle, { flex: 1 }]} />
        <Text className="ml-3 font-medium mr-3 text-center" style={{ color: Colors[theme].text, fontSize: 13 }}>{t("home.bottomArea.siteIntroduction")}</Text>
        <View style={[dividerLineStyle, { flex: 1 }]} />
      </View>
      <TextUs />
    </>}
    {indexFooter == 4 && <>
      <AboutUs />
      {/* <View className='justify-left items-center flex-row mt-4 mb-1' style={{marginLeft:40}}>
            <View className='rounded-md w-2 h-2 mr-1' style={{ backgroundColor: Colors[theme].primary }}></View>
        <Text className='font-medium' style={{ color: Colors[theme].text, fontSize: 13 }}>{t("home.bottomArea.downloadApp")}</Text>
      </View> */}
      {/* <AppDownload/> */}
      <JoinUs />
      <GameManufacturers />
      <TextUs />
    </>}
  </View>

}

export const BottomArea = memo(BottomAreaComponent);

const styles = StyleSheet.create({
  container: {
    //position: 'relative',
  },

});
