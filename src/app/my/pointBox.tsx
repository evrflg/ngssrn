import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { HideScreenHeader } from "@/components/common/Header";
import NoData from "@/components/common/NoData";
import { getEngageBox, pickEngageBox } from "@/api";
import { LinearGradient } from "expo-linear-gradient";
import { useToast } from "@/components/common/toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { accInfoAsync } from "@/store/user/userSlice";
import { rf } from "@/utils/scaleFont";
import EngageIntroModal from "@/components/my/EngageIntroModal";
import { FontAwesome } from "@expo/vector-icons";
import ListNoMore from "@/components/common/ListNoMore";
interface AppItem {
  awardMoney: string;
  awardType: number;
  boxName: string;
  createTime?: number;
  engage: number;
  iconImage: string;
  id: string;
  maxAwardMoney: string;
  minAwardMoney?: string;
  type: number;
}

let totalDataNumber = 0;
export default function PointBoxPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState<AppItem[]>([]);
  const toast = useToast();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const [engageIntroModalVisible, setEngageIntroModalVisible] = useState(false);

  // 获取图片URL
  const getImgUrl = (boxType: number) => {
    if (boxType === 0) {
      return require("@/assets/images/point/point1.webp");
    } else if (boxType === 1) {
      return require("@/assets/images/point/point2.webp");
    } else if (boxType === 2) {
      return require("@/assets/images/point/point3.webp");
    } else if (boxType === 3) {
      return require("@/assets/images/point/point4.webp");
    }
    return require("@/assets/images/point/point1.webp");
  };

  // 获取header渐变背景色
  const getHeaderBackground = (boxType?: number) => {
    if (boxType === 0) {
      return ["#E58153", "#B5523B"];
    } else if (boxType === 1) {
      return ["#A5B3B3", "#5F6D6D"];
    } else if (boxType === 2) {
      return ["#EEC16C", "#BF9126"];
    } else if (boxType === 3) {
      return ["#8149C4", "#48217E"];
    } else {
      return ["#E58153", "#B5523B"];
    }
  };

  useEffect(() => {
    getBoxListData();
  }, []);

  // 获取宝箱数据
  const getBoxListData = async () => {
    setLoading(true);
    try {
      const res = await getEngageBox();
      if (res?.data?.data) {
        totalDataNumber = res.data.data.length;
        setDataList(res.data.data);
      } else {
        setDataList([]);
      }
    } catch {
      //console.error('获取数据失败：', err);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  // 领取积分宝箱
  const goPick = async (
    id: string,
    reward: string,
    type: number,
    minValue?: string,
    maxValue?: string,
  ) => {
    if (!id) return;

    try {
      const res = await pickEngageBox({ boxId: id } as any);
      if (res?.data?.code === 0) {
        // awardType===0 显示固定金额  ===1 显示区间
        if (type === 0) {
          toast.success(`${t("status.claim.claimSuccess")} ${reward || 0.0}`);
        } else {
          toast.success(
            `${t("status.claim.claimSuccess")} ${minValue || 0.0} - ${maxValue || 0.0}`,
          );
        }
        // 成功后刷新数据
        setTimeout(() => {
          getBoxListData();
          dispatch(accInfoAsync()); // 刷新用户信息
        }, 500);
      } else {
        toast.error(t(res?.data?.code));
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error(t("status.claim.claimFailedWithDetail", { detail }), err);
      toast.error(t("status.claim.claimFailedWithDetail", { detail }));
    }
  };

  const goBoxRecord = () => {
    router.push("/my/pointBoxRecord");
  };

  const getButtonBgColor = (theme: string) => {
    if (theme === "greenBlack") {
      return ["#75eb92", "#a9e782"];
    } else if (theme === "orangeWhite") {
      return ["#f48d16", "#ffd900"];
    } else if (theme === "blueWhite") {
      return ["#4781ff", "#47b5ff"];
    }
    return ["#75eb92", "#a9e782"]; // 默认绿黑
  };

  // 获取头部渐变背景色
  const getLinearGradientColors = (theme: string): [string, string] => {
    switch (theme) {
      case "greenBlack":
        return ["#439762", "#175A42"];
      case "orangeWhite":
        return ["#f48d16", "#f48d16"];
      case "blueWhite":
        return ["#4781ff", "#47b5ff"];
      default:
        return ["#439762", "#175A42"];
    }
  };

  const renderItem = ({ item }: { item: AppItem }) => {
    const headerColors = getHeaderBackground(item.type);

    return (
      <View style={styles.app}>
        <LinearGradient
          colors={headerColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={[styles.boxName, { textAlign: "left", writingDirection: "ltr" }]}>
              {item.boxName}
            </Text>
            <Text style={[styles.rewardText, { textAlign: "left", writingDirection: "ltr" }]}>
              {item.awardType === 0
                ? `${t("promotion.activeAward")} `
                : `${t("home.activeBlock.highestReward")} `}
              <Text style={{ color: "#FFF", fontWeight: "600" }}>
                {item.awardType === 0 ? item.awardMoney : item.maxAwardMoney}
              </Text>
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Image source={getImgUrl(item.type)} style={styles.boxImage} resizeMode="contain" />
          </View>
        </LinearGradient>

        <View style={[styles.footer, { backgroundColor: Colors[theme].cardBg1 }]}>
          <View style={styles.footerLeft}>
            <Text
              style={[
                styles.engageText,
                { fontSize: rf(11), textAlign: "left", writingDirection: "ltr" },
              ]}
            >
              {t("pointBox.activityLevel")}{" "}
              <Text style={{ color: Colors[theme].primary }}>{item.engage}</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              goPick(
                item.id,
                item.awardMoney,
                item.awardType,
                item.minAwardMoney,
                item.maxAwardMoney,
              )
            }
          >
            <LinearGradient
              colors={getButtonBgColor(theme) as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.receiveBtn}
            >
              <Text style={[styles.receiveText, { fontSize: rf(12) }]}>
                {t("status.claim.claim")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <SafeAreaView className={`flex-1 bg-${theme}-background`}>
        <Stack.Screen options={{ headerShown: false }} />
        <HideScreenHeader
          title={t("pointBox.activityLevelBox")}
          rightEvent={{
            rightText: t("active.vip.record"),
            onRightPress: goBoxRecord,
          }}
        />
        <View style={styles.head}>
          <LinearGradient
            colors={getLinearGradientColors(theme)}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.headWenliWrap} pointerEvents="none">
            <Image
              source={require("@/assets/images/myCenter/wenli.png")}
              style={styles.headWenli}
              resizeMode="cover"
            />
          </View>
          <TouchableOpacity style={styles.helpBtn} onPress={() => setEngageIntroModalVisible(true)}>
            <FontAwesome name="question-circle-o" size={15} color={Colors[theme].btnText} />
          </TouchableOpacity>
          <Text style={[styles.headMoney, { color: Colors[theme].cardBg1 }]}>
            {userInfo?.engage || 0}
          </Text>
          <Text style={[styles.headText, { color: Colors[theme].cardBg1 }]}>
            {t("pageName.pointsReward")}
          </Text>
        </View>
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors[theme].primary} style={styles.loader} />
          ) : dataList.length > 0 ? (
            <FlatList
              data={dataList}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              className="hide-scrollbar"
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: Platform.OS === "android" ? 96 : 72 },
              ]}
              ListFooterComponent={() =>
                totalDataNumber === dataList.length ? <ListNoMore /> : null
              }
            />
          ) : (
            <NoData />
          )}
        </View>
      </SafeAreaView>
      <EngageIntroModal
        visible={engageIntroModalVisible}
        onClose={() => setEngageIntroModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  head: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    position: "relative",
    overflow: "hidden",
  },
  headWenliWrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  headWenli: {
    width: "100%",
    height: "100%",
    opacity: 0.45,
  },
  helpBtn: {
    position: "absolute",
    right: 14,
    top: 12,
  },
  headMoney: {
    fontSize: 30,
    fontWeight: "700",
    zIndex: 1,
  },
  headText: {
    fontSize: 14,
    marginTop: 5,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.greenBlack.bg,
  },
  listContent: {
    paddingBottom: 35,
  },
  loader: {
    marginTop: 50,
  },
  app: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 100,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: "relative",
  },
  headerLeft: {
    width: "66%",
    color: "#fff",
    paddingLeft: 20,
  },
  headerRight: {
    width: "55%",
    height: "100%",
    position: "relative",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  boxName: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "500",
    marginBottom: 5,
    width: "80%",
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFF",
  },
  boxImage: {
    height: 100,
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  footer: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  engageText: {
    fontSize: 11,
    color: "#adb7ba",
  },
  receiveBtn: {
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
    height: 23,
    overflow: "hidden",
  },
  receiveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
});
