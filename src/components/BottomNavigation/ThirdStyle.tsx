import { useTheme } from "@/hooks/theme/ThemeProvider";
import { resolveSafeAreaExtensionBg } from "@/utils/resolveSafeAreaExtensionBg";
import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, TouchableOpacity, LayoutChangeEvent } from "react-native";
import { type Tab } from "@/types/navigation";
import { type BottomNavProps } from "./index";
import { getIcon } from "@/utils/navigation/third";
import { LinearGradient } from "expo-linear-gradient";
import Intersect from "@/components/icons/navigation/third/Intersect.svg";
import { screen } from "@/utils/screen";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from "react-native-svg";
import MemberDayFooterBadge from "./MemberDayFooterBadge";
import { rf } from "@/utils/scaleFont";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { ActivityDot, computeHasActivityDot } from "./ActivityDot";

const GOLD_LINE_BASE_Y = 12;
const GOLD_LINE_PEAK_Y = 2;
const GOLD_CURVE_TEMPLATE_WIDTH = 73.3516;
const GOLD_CURVE_TEMPLATE_HEIGHT = 10;
const GOLD_LINE_HEIGHT = 14;
const ACTIVE_BUMP_EXTRA_WIDTH_MIN = 12;
const ACTIVE_BUMP_EXTRA_WIDTH_MAX = 24;

const buildGoldPaths = (
  width: number,
  activeCenterX: number,
  activeTabWidth: number,
  totalTabs: number,
) => {
  const safeWidth = Math.max(1, width);
  const safeTabs = Math.max(1, totalTabs);
  const fallbackTabWidth = safeWidth / safeTabs;
  const tabWidth = Math.max(1, activeTabWidth || fallbackTabWidth);
  const centerX = Math.max(0, Math.min(safeWidth, activeCenterX));
  const activeLeft = Math.max(0, Math.min(safeWidth, centerX - tabWidth / 2));
  const activeRight = Math.max(activeLeft, Math.min(safeWidth, centerX + tabWidth / 2));
  const activeWidth = Math.max(1, activeRight - activeLeft);

  const widthFactor = Math.max(0, Math.min(1, (safeWidth - 320) / 160));
  const responsiveExtraWidth =
    ACTIVE_BUMP_EXTRA_WIDTH_MAX -
    (ACTIVE_BUMP_EXTRA_WIDTH_MAX - ACTIVE_BUMP_EXTRA_WIDTH_MIN) * widthFactor;
  const desiredBumpWidth = Math.min(safeWidth, Math.max(56, activeWidth + responsiveExtraWidth));
  let peakStart = centerX - desiredBumpWidth / 2;
  let peakEnd = centerX + desiredBumpWidth / 2;

  if (peakStart < 0) {
    peakEnd = Math.min(safeWidth, peakEnd - peakStart);
    peakStart = 0;
  }
  if (peakEnd > safeWidth) {
    peakStart = Math.max(0, peakStart - (peakEnd - safeWidth));
    peakEnd = safeWidth;
  }
  const bumpWidth = Math.max(40, peakEnd - peakStart);
  const bumpHeight = GOLD_LINE_BASE_Y - GOLD_LINE_PEAK_Y;
  const mapX = (x: number) => peakStart + (x / GOLD_CURVE_TEMPLATE_WIDTH) * bumpWidth;
  const mapY = (y: number) => GOLD_LINE_PEAK_Y + (y / GOLD_CURVE_TEMPLATE_HEIGHT) * bumpHeight;

  let goldCurvePath = `M 0,${GOLD_LINE_BASE_Y}`;
  goldCurvePath += ` L ${Math.max(0, peakStart)},${GOLD_LINE_BASE_Y}`;
  goldCurvePath += ` C ${mapX(2.36299)},${mapY(9.99992)} ${mapX(4.56123)},${mapY(8.9054)} ${mapX(6.30664)},${mapY(7.3125)}`;
  goldCurvePath += ` C ${mapX(11.2839)},${mapY(2.77014)} ${mapX(17.9064)},${mapY(0)} ${mapX(25.1758)},${mapY(0)}`;
  goldCurvePath += ` L ${mapX(48.1758)},${mapY(0)}`;
  goldCurvePath += ` C ${mapX(55.4452)},${mapY(0)} ${mapX(62.0676)},${mapY(2.77014)} ${mapX(67.0449)},${mapY(7.3125)}`;
  goldCurvePath += ` C ${mapX(68.7903)},${mapY(8.9054)} ${mapX(70.9886)},${mapY(9.99992)} ${mapX(73.3516)},${mapY(10)}`;
  goldCurvePath += ` L ${Math.min(safeWidth, peakEnd)},${GOLD_LINE_BASE_Y}`;
  goldCurvePath += ` L ${safeWidth},${GOLD_LINE_BASE_Y}`;

  let goldBumpAreaPath = `M ${Math.max(0, peakStart)},${GOLD_LINE_BASE_Y}`;
  goldBumpAreaPath += ` C ${mapX(2.36299)},${mapY(9.99992)} ${mapX(4.56123)},${mapY(8.9054)} ${mapX(6.30664)},${mapY(7.3125)}`;
  goldBumpAreaPath += ` C ${mapX(11.2839)},${mapY(2.77014)} ${mapX(17.9064)},${mapY(0)} ${mapX(25.1758)},${mapY(0)}`;
  goldBumpAreaPath += ` L ${mapX(48.1758)},${mapY(0)}`;
  goldBumpAreaPath += ` C ${mapX(55.4452)},${mapY(0)} ${mapX(62.0676)},${mapY(2.77014)} ${mapX(67.0449)},${mapY(7.3125)}`;
  goldBumpAreaPath += ` C ${mapX(68.7903)},${mapY(8.9054)} ${mapX(70.9886)},${mapY(9.99992)} ${mapX(73.3516)},${mapY(10)}`;
  goldBumpAreaPath += ` L ${Math.min(safeWidth, peakEnd)},${GOLD_LINE_BASE_Y} Z`;

  return { goldCurvePath, goldBumpAreaPath };
};

const ThirdStyle = ({ tabs, onNavigate, isTabActive }: BottomNavProps) => {
  const {
    theme,
    themeColors: { primary, secondary, gray },
  } = useTheme();
  const { t } = useTranslation();
  const backgroundColor = resolveSafeAreaExtensionBg(theme);
  const reminderCount = useSelector((state: RootState) => state.active.reminderCount);
  const activityList = useSelector((state: RootState) => state.active.activityList);
  const isLogin = useSelector((state: RootState) => Boolean(state?.user?.userInfo?.isLogin));
  const hasActivityDot = React.useMemo(
    () => computeHasActivityDot(reminderCount, { isLogin, activityList }),
    [reminderCount, isLogin, activityList],
  );
  const width = screen.get("window").width;
  const [tabLayouts, setTabLayouts] = useState<Record<string, { x: number; width: number }>>({});
  let activeIndex = 0;
  for (let i = 0; i < tabs.length; i += 1) {
    if (isTabActive(tabs[i].path)) {
      activeIndex = i;
      break;
    }
  }
  const fallbackTabWidth = Math.max(1, width / Math.max(1, tabs.length));
  const fallbackCenterX = (activeIndex + 0.5) * fallbackTabWidth;
  const activeTab = tabs[activeIndex];
  const activeLayout = activeTab ? tabLayouts[activeTab.code] : undefined;
  const activeCenterX = activeLayout ? activeLayout.x + activeLayout.width / 2 : fallbackCenterX;
  const activeTabWidth = activeLayout?.width ?? fallbackTabWidth;
  const { goldCurvePath, goldBumpAreaPath } = buildGoldPaths(
    width,
    activeCenterX,
    activeTabWidth,
    tabs.length,
  );

  const handleTabLayout = (tabCode: string, event: LayoutChangeEvent) => {
    const { x, width: tabWidth } = event.nativeEvent.layout;
    setTabLayouts((prev: Record<string, { x: number; width: number }>) => {
      const current = prev[tabCode];
      if (current && current.x === x && current.width === tabWidth) {
        return prev;
      }
      return { ...prev, [tabCode]: { x, width: tabWidth } };
    });
  };

  const renderIcon = (tab: Tab, color: string, fillOpacity?: number): ReactNode => {
    const Icons = getIcon(tab.code);
    return <Icons {...{ color, fillOpacity }} />;
  };

  const Dot = React.useMemo(() => () => <ActivityDot style={dotStyles.dotPos} />, []);

  return (
    <View
      style={{
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        width,
        marginHorizontal: "auto",
        height: "100%",
      }}
    >
      <Svg
        width={width}
        height={GOLD_LINE_HEIGHT}
        viewBox={`0 0 ${width} ${GOLD_LINE_HEIGHT}`}
        preserveAspectRatio="none"
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -11,
          left: 0,
          zIndex: 2,
        }}
      >
        <Defs>
          <SvgLinearGradient id="footerMinimalGoldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#f7a01d" />
            <Stop offset="18%" stopColor="#fff3ae" />
            <Stop offset="35%" stopColor="#ffe44d" />
            <Stop offset="50%" stopColor="#fffec9" />
            <Stop offset="65%" stopColor="#ffe44d" />
            <Stop offset="82%" stopColor="#fff3ae" />
            <Stop offset="100%" stopColor="#f7a01d" />
          </SvgLinearGradient>
        </Defs>
        <Path d={goldBumpAreaPath} fill={backgroundColor} />
        <Path
          d={goldCurvePath}
          stroke="url(#footerMinimalGoldGradient)"
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <View
        style={{ backgroundColor }}
        className={`h-full w-full flex flex-row justify-evenly  items-center  shadow-[0_-2px_2px_0_rgba(17,17,17,0.15)] overflow-visible`}
      >
        {tabs.map((tab) => {
          const active = isTabActive(tab.path);
          const showDot = tab.code === "ACTIVITY" && hasActivityDot;
          return active ? (
            <TouchableOpacity
              className="size-[50px] overflow-visible"
              key={tab.code}
              activeOpacity={1}
              onLayout={(event: LayoutChangeEvent) => handleTabLayout(tab.code, event)}
              style={{
                transform: [{ translateY: -2 }],
              }}
              onPress={() => onNavigate(tab)}
            >
              <Intersect
                fill={backgroundColor}
                style={{
                  position: "absolute",
                  left: -12,
                  top: -10,
                }}
              />
              <LinearGradient
                colors={[secondary, primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 50,
                  width: 50,
                  borderRadius: 16,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <View style={{ position: "relative" }}>
                  {renderIcon(tab, "#fff", 1)}
                  {showDot ? <Dot /> : null}
                </View>
                <View className="size-1 mt-0.5 bg-white rounded-full" />
              </LinearGradient>
              {tab.code === "ACTIVITY" && (
                <MemberDayFooterBadge fixedBottom={48} isCenterItem={false} />
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={tab.code}
              className="h-full min-w-12 flex justify-center items-center"
              activeOpacity={1}
              onLayout={(event: LayoutChangeEvent) => handleTabLayout(tab.code, event)}
              onPress={() => onNavigate(tab)}
            >
              <View style={{ position: "relative" }}>
                {renderIcon(tab, gray)}
                {showDot ? <Dot /> : null}
              </View>
              <Text
                numberOfLines={1}
                textBreakStrategy="balanced"
                style={{ fontSize: rf(12) }}
                className={`text-xs mt-[1px] text-${theme}-gray`}
              >
                {t(tab.translationKey)}
              </Text>
              {tab.code === "ACTIVITY" && (
                <MemberDayFooterBadge fixedBottom={42} isCenterItem={false} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ThirdStyle;

const dotStyles = {
  dotPos: {
    position: "absolute" as const,
    top: -2,
    right: -6,
  },
};
