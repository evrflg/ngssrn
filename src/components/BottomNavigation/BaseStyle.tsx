import Background from "@/components/icons/navigation/base/background";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { type Tab } from "@/types/navigation";
import { resolveSafeAreaExtensionBg } from "@/utils/resolveSafeAreaExtensionBg";
import { getIcon } from "@/utils/navigation/base";
import { screen } from "@/utils/screen";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { type BottomNavProps } from "./index";
import MemberDayFooterBadge from "./MemberDayFooterBadge";
import { rf } from "@/utils/scaleFont";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { ActivityDot, computeHasActivityDot } from "./ActivityDot";

const Base = ({ tabs, onNavigate, isTabActive }: BottomNavProps) => {
  const {
    theme,
    themeColors: { primary, background, gray },
  } = useTheme();
  const { t } = useTranslation();

  const getIconColor = ({ path }: Tab): string => (isTabActive(path) ? primary : gray);
  const getTitleColor = ({ path }: Tab): string =>
    isTabActive(path) ? `text-${theme}-primary` : `text-${theme}-gray`;

  const centerIndex = Math.floor(tabs.length / 2);
  const backgroundColor = resolveSafeAreaExtensionBg(theme);
  const reminderCount = useSelector((state: RootState) => state.active.reminderCount);
  const activityList = useSelector((state: RootState) => state.active.activityList);
  const isLogin = useSelector((state: RootState) => Boolean(state?.user?.userInfo?.isLogin));
  const hasActivityDot = React.useMemo(
    () => computeHasActivityDot(reminderCount, { isLogin, activityList }),
    [reminderCount, isLogin, activityList],
  );
  const centerTab = tabs[centerIndex];
  const CenterIconComp = centerTab ? getIcon(centerTab.code)?.centerIcon : null;
  const tabColPercent = 100 / tabs.length;
  const centerOverlayLeftPercent = centerIndex * tabColPercent;
  const Dot = React.useMemo(() => () => <ActivityDot style={styles.dotPos} />, []);

  return (
    <View style={styles.container}>
      {/* 弧形背景填充层 —— 凹陷区域透明，页面内容自然透出 */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <Background fill={backgroundColor} />
      </View>

      {/* Tab row —— 透明，仅作布局容器 */}
      <View
        style={styles.row}
        className="w-full flex-1 flex flex-row items-center overflow-visible"
      >
        {tabs.map((tab, index) => {
          const isCenterItem = index === centerIndex;
          const icons = getIcon(tab.code);
          const showDot = tab.code === "ACTIVITY" && hasActivityDot;
          return (
            <TouchableOpacity
              key={tab.code}
              activeOpacity={1}
              style={styles.tabItem}
              hitSlop={isCenterItem ? { top: 40, left: 10, right: 10, bottom: 10 } : undefined}
              onPress={() => {
                onNavigate(tab);
              }}
            >
              <View style={styles.iconSlot}>
                {!isCenterItem && icons?.icon
                  ? (() => {
                      const Icon = icons.icon;
                      return (
                        <View style={{ position: "relative" }}>
                          <Icon color={getIconColor(tab)} />
                          {showDot ? <Dot /> : null}
                        </View>
                      );
                    })()
                  : null}
              </View>
              <Text
                numberOfLines={1}
                style={styles.label}
                className={"text-xs " + getTitleColor(tab)}
              >
                {t(tab.translationKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 金色边框 —— 角标另叠一层，避免盖住 MemberDayFooterBadge */}
      <View pointerEvents="none" style={styles.borderLayer}>
        <Background fill="none" showBorder />
      </View>

      {/* 会员日：在金边层之上；pointerEvents=none 穿透，可叠在 centerIcon 之上且不挡中间按钮 */}
      <View pointerEvents="none" style={styles.memberDayBadgeLayer}>
        {tabs.map((tab, index) => {
          if (tab.code !== "ACTIVITY") return null;
          const isCenterItem = index === centerIndex;
          const colPct = 100 / tabs.length;
          return (
            <View
              key={`member-day-footer-${tab.code}-${index}`}
              style={[
                styles.memberDayBadgeColumn,
                {
                  left: `${index * colPct}%`,
                  width: `${colPct}%`,
                },
              ]}
            >
              <MemberDayFooterBadge
                fixedBottom={isCenterItem ? 8 : 42}
                isCenterItem={isCenterItem}
              />
            </View>
          );
        })}
      </View>

      {/* 中间凸起：叠在 Tab 行之上；宽度仅中间一格，避免挡左右 Tab；会员日见上层 */}
      {CenterIconComp && (
        <View
          pointerEvents="box-none"
          style={[
            styles.centerIconOverlay,
            {
              left: `${centerOverlayLeftPercent}%`,
              width: `${tabColPercent}%`,
            },
          ]}
        >
          <Pressable
            hitSlop={{ top: 12, bottom: 8, left: 0, right: 0 }}
            onPress={() => onNavigate(centerTab)}
          >
            <View style={{ position: "relative" }}>
              <CenterIconComp color={primary} backgroundColor={background} />
              {centerTab?.code === "ACTIVITY" && hasActivityDot ? (
                <ActivityDot style={styles.centerDotPos} />
              ) : null}
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screen.get("window").width,
    marginHorizontal: "auto",
    minHeight: 54,
    overflow: "visible",
  },
  row: {
    flex: 1,
    overflow: "visible",
  },
  tabItem: {
    width: "20%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 3,
  },
  iconSlot: {
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  dotPos: {
    position: "absolute",
    top: -2,
    right: -6,
  },
  // 中间凸起图标更大，红点往下压一点，视觉更贴合
  centerDotPos: {
    position: "absolute",
    top: 20,
    right: 7,
  },
  label: {
    marginTop: 2,
    fontSize: rf(12),
  },
  borderLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 54,
    zIndex: 1,
  },
  memberDayBadgeLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 54,
    zIndex: 20,
    ...Platform.select({
      android: { elevation: 20 },
      default: {},
    }),
  },
  memberDayBadgeColumn: {
    position: "absolute",
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  centerIconOverlay: {
    position: "absolute",
    top: 8, // base 图标 54px，需偏移才能与凹陷弧底对齐
    alignItems: "center",
    zIndex: 10,
    ...Platform.select({
      android: { elevation: 14 },
      default: {},
    }),
  },
});

export default Base;
