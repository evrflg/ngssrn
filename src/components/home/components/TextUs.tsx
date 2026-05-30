import { RootState } from "@/store/store";
import { View, StyleSheet, Image, Text } from "react-native"
import { useSelector } from "react-redux";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

export const TextUs = () => {
  const { theme } = useTheme();//主题
  const { t } = useTranslation();
  const cfg_site_base: any = useSelector((state: RootState) => state?.user?.cfg_site_base);
  const indexFooter: any = useSelector((state: RootState) => state?.selfConfig?.indexFooter);
  return <View style={[styles.container]}>

    {indexFooter == 1 && <View style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center', }}>
      <View className="h-10 " style={{ width: 40 }}>
        {cfg_site_base?.phoneLogoFileUrl && <Image
          style={{ flex: 1 }}
          resizeMode='contain'
          source={{ uri: cfg_site_base?.phoneLogoFileUrl }}
        />}
      </View>
      <Text style={[styles.text, { color: Colors[theme].lightText, marginTop: 10, }]}>{cfg_site_base.siteIntro}</Text>
    </View>}
    {indexFooter == 2 && <View >
      <View className='justify-left items-center flex-row' style={{}}>
        <Text className='font-medium' style={{ color: Colors[theme].text, fontSize: 13 }}>{t("home.bottomArea.siteIntroduction")}</Text>
      </View>
      <Text style={[styles.text, { color: Colors[theme].lightText, marginTop: 10, }]}>{cfg_site_base.siteIntro}</Text>
      <View className="items-center">
        {cfg_site_base?.phoneLogoFileUrl && <Image
          style={{ width: 80, height: 40, marginTop: 10 }}
          resizeMode='contain'
          source={{ uri: cfg_site_base?.phoneLogoFileUrl }}
        />}
      </View>
    </View>}
    {indexFooter == 3 && <View>
      <View className='justify-left items-center flex-row p-3' style={{ backgroundColor: Colors[theme].cardBg1, borderRadius: 8 }}>
        <Text style={[styles.text, { color: Colors[theme].lightText }]}>{cfg_site_base.siteIntro}</Text>
      </View>
      <View className="flex flex-row items-center justify-center mt-4 mb-4 pl-8 pr-8">
        <View style={{ height: 1, backgroundColor: Colors[theme].blockBg2, flex: 1 }}></View>
        {cfg_site_base?.phoneLogoFileUrl && <Image
          style={{ width: 40, height: 40, marginHorizontal: 10 }}
          resizeMode='contain'
          source={{ uri: cfg_site_base?.phoneLogoFileUrl }}
        />}
        <View style={{ height: 1, backgroundColor: Colors[theme].blockBg2, flex: 1 }}></View>
      </View>
    </View>}
    {indexFooter == 4 && <View className="mt-4">
      <View style={{ backgroundColor: Colors[theme].cardBg1, borderRadius: 8 }}>
        <View className='justify-left items-center flex-row  ml-7 mt-4' >
          <View className='rounded-md w-2 h-2 mr-1' style={{ backgroundColor: Colors[theme].primary }}></View>
          <Text className='font-medium' style={{ color: Colors[theme].text, fontSize: 13 }}>{t("home.bottomArea.siteIntroduction")}</Text>
        </View>
        <View className='justify-left items-center flex-row p-3' >
          <Text style={[styles.text, { color: Colors[theme].lightText }]}>{cfg_site_base.siteIntro}</Text>
        </View>
      </View>

      <View className="flex flex-row items-center justify-center mt-4 mb-4 pl-8 pr-8">
        <View style={{ height: 1, backgroundColor: Colors[theme].blockBg2, flex: 1 }}></View>
        {cfg_site_base?.phoneLogoFileUrl && <Image
          style={{ width: 40, height: 40, marginHorizontal: 10 }}
          resizeMode='contain'
          source={{ uri: cfg_site_base?.phoneLogoFileUrl }}
        />}
        <View style={{ height: 1, backgroundColor: Colors[theme].blockBg2, flex: 1 }}></View>
      </View>
    </View>}
  </View>
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  text: {

    fontSize: 12,
    flexWrap: 'wrap',
    textAlign: 'left',
    lineHeight: 20
  }

})