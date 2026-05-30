import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, Platform, Pressable, ScrollView, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import TransparentHeader from "@/components/active/components/TransparentHeader";
import ProPopup from "@/components/active/components/propopup/ProPopup";
import ProPopupContext from "@/components/active/components/propopup/ProPopupContext";
import QuePopup from "@/components/active/components/propopup/QuePopup";
import Account from "@/components/active/vip/Account";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";

/**
 * 目前接口对应的规则
 *
 * @returns
 */
const vipPage = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [showQues, setShowQues] = useState(false);
  const [pendingNavToTransactions, setPendingNavToTransactions] = useState(false);

  /**
   * 规则/说明叠层关掉后再去「记录」页。
   * ProPopup 在原生端是 absolute 叠层而非 Modal，runAfterInteractions 常会立刻回调；
   * 再叠一层短延迟 + 双 rAF，让遮罩与 GHR 先完成一帧布局，减轻与 push 转场同帧的闪屏/残影。
   */
  useEffect(() => {
    if (!pendingNavToTransactions) return;
    if (showRules || showQues) return;

    let cancelled = false;
    let interactionTask: { cancel: () => void } | undefined;

    const go = () => {
      if (cancelled) return;
      setPendingNavToTransactions(false);
      navigation.push("my/tranctionsRecord", { type: "1" });
    };

    const runNavAfterPaint = () => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (cancelled) return;
          go();
        });
      });
    };

    const afterLead = () => {
      if (cancelled) return;
      if (Platform.OS === "ios") {
        interactionTask = InteractionManager.runAfterInteractions(() => {
          if (cancelled) return;
          runNavAfterPaint();
        });
      } else {
        runNavAfterPaint();
      }
    };

    const leadMs = Platform.OS === "ios" ? 100 : 48;
    const leadTimer = setTimeout(afterLead, leadMs);

    return () => {
      cancelled = true;
      clearTimeout(leadTimer);
      interactionTask?.cancel?.();
    };
  }, [pendingNavToTransactions, showRules, showQues, navigation]);

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const maxScroll = 60;

    // 计算透明度：0 到 1 之间
    const opacity = Math.min(scrollY / maxScroll, 1);
    setHeaderOpacity(opacity);
  };

  return (
    <SafeAreaView style={{ backgroundColor: Colors[theme].background }} className="flex-1">
      {/* 弹层放在 GHR 最后：Android 上 RN Modal 外 Pressable 常失效；屏内叠层 + 高 zIndex/elevation 盖住 Carousel，关闭/点遮罩才稳定 */}
      <GestureHandlerRootView className="flex-1">
        <TransparentHeader
          title={"VIP"}
          opacity={headerOpacity}
          rightOption={
            <Pressable
              className="items-center flex-row mr-1"
              onPress={() => {
                setShowRules(false);
                setShowQues(false);
                setPendingNavToTransactions(true);
              }}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ fontSize: 14, color: Colors[theme].text }}
              >
                {t("active.vip.record")}
              </Text>
            </Pressable>
          }
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          className="hide-scrollbar"
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <Account
            showRules={showRules}
            showQues={showQues}
            setShowRules={setShowRules}
            setShowQues={setShowQues}
          />
        </ScrollView>
        {showRules ? (
          <ProPopup visible title={t("active.vip.guize")} onClose={() => setShowRules(false)}>
            <ProPopupContext />
          </ProPopup>
        ) : null}
        {showQues ? (
          <QuePopup title={t("popup.niceTipTitle")} visible onClose={() => setShowQues(false)} />
        ) : null}
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};
export default vipPage;
