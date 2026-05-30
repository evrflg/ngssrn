import { useTheme } from "@/hooks/theme/ThemeProvider";
import { type Tab } from "@/types/navigation";
import { type BottomNavProps } from "./index";
import { getIcon } from "@/utils/navigation/fourth";
import { resolveSafeAreaExtensionBg } from "@/utils/resolveSafeAreaExtensionBg";
import { screen } from "@/utils/screen";
import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import MemberDayFooterBadge from "./MemberDayFooterBadge";
import { rf } from "@/utils/scaleFont";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { ActivityDot, computeHasActivityDot } from "./ActivityDot";

const GOLD_BAR_COLORS = [
  "#f7a01d",
  "#fff3ae",
  "#ffe44d",
  "#fffec9",
  "#ffe44d",
  "#fff3ae",
  "#f7a01d",
] as const;

const FourthStyle = ({ tabs, onNavigate, isTabActive }: BottomNavProps) => {
  const {
    theme,
    themeColors: { primary, secondary, gray },
  } = useTheme();
  const { t } = useTranslation();
  const backgroundColor = resolveSafeAreaExtensionBg(theme);
  const reminderCount = useSelector((state: RootState) => state.active.reminderCount);
  const activityList = useSelector((state: RootState) => state.active.activityList);
  const isLogin = useSelector((state: RootState) => Boolean(state?.user?.userInfo?.isLogin));

  // 参考 Web 端 computed：只要任一来源存在未处理事项，就显示“活动”红点
  const hasActivityDot = useMemo(() => {
    return computeHasActivityDot(reminderCount, { isLogin, activityList });
  }, [reminderCount, isLogin, activityList]);

  const barWidth = screen.get("window").width;
  const activityIndex = tabs.findIndex((t) => t.code === "ACTIVITY");
  const activityAnchorX =
    activityIndex >= 0 && tabs.length > 0
      ? ((activityIndex + 0.5) / tabs.length) * barWidth
      : undefined;

  const renderIcon = (tab: Tab, color: string, opacity?: number): ReactNode => {
    const Icons = getIcon(tab.code);
    return <Icons {...{ color, opacity }} />;
  };

const Dot = () => <ActivityDot style={styles.dotPos} />;

  return (
    <View
      style={{
        flex: 1,
        width: barWidth,
        alignSelf: "center",
        position: "relative",
      }}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={["#f7a01d", "#fff3ae", "#ffe44d", "#fffec9", "#ffe44d", "#fff3ae", "#f7a01d"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <LinearGradient
            colors={[...GOLD_BAR_COLORS]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 3, width: "100%", borderWidth: 0, padding: 0, margin: 0 }}
          />
          <View
            style={{
              backgroundColor,
              flex: 1,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
            className="w-full flex-row justify-evenly items-center shadow-[0_-2px_2px_0_rgba(17,17,17,0.15)] overflow-visible"
          >
            {tabs.map((tab) => {
              const active = isTabActive(tab.path);
              const showDot = tab.code === "ACTIVITY" && hasActivityDot;
              return (
                <TouchableOpacity
                  key={tab.code}
                  activeOpacity={1}
                  className="h-full w-[19%] flex justify-center items-center"
                  onPress={() => onNavigate(tab)}
                >
                  {active ? (
                    <LinearGradient
                      colors={[primary, secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        height: 32,
                        width: 44,
                        borderRadius: 16,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10,
                      }}
                    >
                      {renderIcon(tab, "#fff", 1)}
                      {showDot ? <Dot /> : null}
                    </LinearGradient>
                  ) : (
                    <>
                      <View style={{ position: "relative" }}>
                        {renderIcon(tab, gray)}
                        {showDot ? <Dot /> : null}
                      </View>
                      <Text
                        numberOfLines={1}
                        style={{ fontSize: rf(12) }}
                        className={`text-xs mt-[1px] text-${theme}-gray`}
                      >
                        {t(tab.translationKey)}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </View>
      {activityAnchorX !== undefined ? (
        <MemberDayFooterBadge fixedBottom={42} anchorCenterX={activityAnchorX} />
      ) : null}
    </View>
  );
};

export default FourthStyle;

const styles = {
  dotPos: {
    position: "absolute" as const,
    top: -2,
    right: -6,
  },
};
