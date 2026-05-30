import { AutoUpdateView } from "@/components/common/AutoUpdateView";
import { Index } from "@/components/home/Index";
import { Index3 } from "@/components/home/Index3";
import HomePopup from "@/components/home/popup";
import { BigWinningDialog } from "@/components/home/popup/bigWinning/BigWinningDialog";
import { useThemeColor } from "@/hooks/useThemeColor";
import { showBigWinning } from "@/store/bigWinning/bigWinningSlice";
import { AppDispatch, RootState } from "@/store/store";
import { useIsFocused } from "@react-navigation/native";
import { Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const isWeb = Platform.OS === "web";

export default function HomeScreen() {
  const background = useThemeColor({}, "background");
  const indexGame: any = useSelector((state: RootState) => state?.selfConfig?.indexGame);
  const isFocused = useIsFocused();
  const dispatch = useDispatch<AppDispatch>();

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={{
        backgroundColor: background,
      }}
      className="flex-1"
    >
      <View className="flex-1">
        {(indexGame == 1 || indexGame == 2) && <Index />}
        {(indexGame == 3 || indexGame == 4 || indexGame == 5) && <Index3 />}
      </View>
      {/* 首页弹窗队列：仅在当前标签页聚焦时挂载，离开首页自动卸载 */}
      {isFocused && <HomePopup />}
      {/* 大中奖弹窗：仅在首页挂载，通过 SSE game 事件 + showBigWinning 触发 */}
      {isFocused && <BigWinningDialog />}
      {/* 临时测试按钮：本地调试大中奖弹窗，联调完成后可删除 */}
      {__DEV__ && isFocused && (
        <Pressable
          style={{
            position: "absolute",
            bottom: 160,
            left: 16,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
          onPress={() =>
            dispatch(showBigWinning({
              username: "TestUser",
              amount: 8888.88,
              gameId: 1001,
              gameType: 1,
              customName: "Demo Game",
              gameName: JSON.stringify({
                cn: "演示游戏（中文）",
                en: "Demo Game (EN)",
              }),
              icon: "",
            }))
          }
        >
          <Text style={{ color: "#fff", fontSize: 12 }}>测试大中奖弹窗</Text>
        </Pressable>
      )}
      {/* 热更提醒 */}
      {!isWeb && <AutoUpdateView />}
      {/* <FloatAds showPage={1}/> */}
    </SafeAreaView>
  );
}
