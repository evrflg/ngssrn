import { AutoHeightWebView } from "@/components/common/AutoHeightWebView";
import { SimpleHeader } from "@/components/common/Header";
import NoData from "@/components/common/NoData";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { AppDispatch, RootState } from "@/store/store";
import { fetchSiteDataList } from "@/store/user/userSlice";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const AboutDetail = () => {
  const { theme } = useTheme(); //
  const dispatch: AppDispatch = useDispatch();
  const { type } = useLocalSearchParams();
  // 从 Redux store 获取数据
  const siteDataList = useSelector((state: RootState) => state?.user?.siteDataList || [],);

  // 从路由参数获取 pageType，并计算实际的 pageType（处理大于 19 的情况）
  const actualPageType = useMemo(() => {
    const tt = Number(type);
    return tt > 19 ? 0 : tt;
  }, [type]);

  const curSiteData = useMemo(() =>  {
    if(siteDataList) {
      return siteDataList.find((item) => item.type === actualPageType)
    }

    return null
  }, [type, siteDataList])

  // 组件挂载时获取数据
  useEffect(() => {
    if (!siteDataList.length) {
      dispatch(fetchSiteDataList());
    }
  }, []);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors[theme].background }}
      edges={["top", "bottom"]}
    >
      <View className="flex-1">
        <SimpleHeader title={curSiteData?.title || ''} />
        <View className="px-3">
          {!!curSiteData?.content ? (
            <AutoHeightWebView source={curSiteData.content} autoHeight setInnerHTML />
          ) : (
            <NoData style={{ marginTop: 200 }} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AboutDetail;
