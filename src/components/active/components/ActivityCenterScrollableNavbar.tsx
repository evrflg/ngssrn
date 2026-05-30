import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { RootState } from "@/store/store";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import RectangleIcon from "@/components/icons/active/menu/RectangleIcon";
import boundIcon from "@/components/icons/active/menu/BonusTaskIcon";
import { VipIcon } from "@/components/icons/active/menu/VipIcon";
import { MissionCenterIcon } from "@/components/icons/active/menu/MissionCenterIcon";
import { RebateIcon } from "@/components/icons/active/menu/RebateIcon";
import { BeDealtIcon } from "@/components/icons/active/menu/BeDealtIcon";
import { MemberDayIcon } from "@/components/icons/active/menu/MemberDayIcon";
import { SpecialBonusIcon } from "@/components/icons/active/menu/SpecialBonusIcon";
import { TaskRecordIcon } from "@/components/icons/active/menu/TaskRecordIcon";
import { useCommon } from "@/hooks/CommonProvider";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { getActiveData, getEffectiveGameType } from "@/api";
import { changeIsShowTestUserPopup } from "@/store/user/userSlice";

const redCounterImg = require("@/assets/images/active/red-counter.png");
const greenCounterImg = require("@/assets/images/active/green-counter.png");
import { StarCoinBadge } from "./StarCoinBadge";

type ActivityCategory = {
  title: string;
  pathname: string;
  isAuthRequired: boolean;
  isLinearBackground: boolean;
  IconComponent?: ComponentType<any>;
  colors?: [string, string];
  onPress?: () => void;
};

type ActivityCenterScrollableNavbarProps = {
  handleToRelief: () => void;
  data: any[];
};

const ActivityCenterScrollableNavbar = ({
  handleToRelief,
  data,
}: ActivityCenterScrollableNavbarProps) => {
  const { width: windowWidth } = useWindowDimensions();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { language } = useCommon();
  const config = useSelector((state: RootState) => state?.user?.cfg_site_base);
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const reminderCount: any = useSelector((state: RootState) => state?.active?.reminderCount);
  const [memberDayId, setMemberDayId] = useState<string>("");
  const [specialBonusId, setSpecialBonusId] = useState<string>("");
  const [showRebateTab, setShowRebateTab] = useState(false); //是否显示返水tab
  const scrollRef = useRef<ScrollView>(null);
  const scrollXRef = useRef(0);
  const viewportWidthRef = useRef(0);
  const contentWidthRef = useRef(0);
  /** 子项相对内容容器的 { x, width }，由 onLayout 填充（Android 需外层 collapsable={false} 才能稳定量到） */
  const tabLayoutsRef = useRef<{ x: number; width: number }[]>([]);
  /** 用于箭头显隐；仅靠 ref 不会触发渲染 */
  const [scrollEdge, setScrollEdge] = useState({ x: 0, maxX: 0 });
  const scrollEdgeRef = useRef({ x: 0, maxX: 0 });
  const scrollRafRef = useRef<number | null>(null);
  const scrollNextXRef = useRef(0);
  const dispatch = useDispatch();
  useEffect(() => {
    if (data && data?.length > 0) {
      const memberDay = data.find((item: any) => item.activityType === 10);
      setMemberDayId(memberDay?.id ? memberDay.id.toString() : "");
      const specialBonus = data.find((item: any) => item.activityType === 11);
      setSpecialBonusId(specialBonus?.id ? specialBonus.id.toString() : "");
    }
  }, [data]);

  // 未登入時不請求返水相關接口：後端常回 isLogin:false，會觸發 axios 攔截器里的 replaceHomeAfterAuthLoss，
  // 造成首次進入活動頁被立即踢回首頁（第二次因防抖略過 replace 才看似正常）。
  useEffect(() => {
    if (!userInfo?.isLogin) {
      setShowRebateTab(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const effectiveRes = await getEffectiveGameType();
        const raw = effectiveRes?.data?.data;
        const effectiveOk = effectiveRes?.data?.code === 0 && Array.isArray(raw) && raw.length > 0;
        if (!effectiveOk) {
          if (!cancelled) setShowRebateTab(false);
          return;
        }
        const activeRes = await getActiveData();
        const ok = activeRes?.data?.code === 0 && Boolean(activeRes?.data?.data);
        if (!cancelled) setShowRebateTab(ok);
      } catch {
        if (!cancelled) setShowRebateTab(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userInfo?.isLogin]);

  // 通用登录检查函数
  const checkLogin = () => {
    if (!userInfo?.isLogin) {
      router.push({ pathname: "/login" });
      return false;
    } else {
      if (userInfo?.isTestUser) {
        dispatch(changeIsShowTestUserPopup(true));
        return false;
      }
    }
    return true;
  };

  const tabItems: ActivityCategory[] = useMemo(() => {
    const items: ActivityCategory[] = [
      {
        title: t("pageName.bonusTask"),
        pathname: "/my/balanceGold",
        isAuthRequired: true,
        isLinearBackground: true,
        IconComponent: boundIcon,
        colors: ["#37b3bc", "#e2f4f5"],
      },
      {
        title: t("pageName.missionCenter"),
        pathname: "/active/missionCenter",
        isAuthRequired: true,
        isLinearBackground: true,
        IconComponent: MissionCenterIcon,
        colors: ["#30cc6b", "#e4feb9"],
      },
      ...(specialBonusId
        ? [
          {
            title: t("pageName.specialBonus"),
            pathname: "/active/activeCenter",
            isAuthRequired: true,
            isLinearBackground: true,
            IconComponent: SpecialBonusIcon,
            colors: ["#fb6c5f", "#fcdcab"] as [string, string],
          },
        ]
        : []),
      ...(memberDayId
        ? [
          {
            title: t("pageName.memberDay"),
            pathname: "/active/activeCenter",
            isAuthRequired: true,
            isLinearBackground: true,
            IconComponent: MemberDayIcon,
            colors: ["#007AFF", "#007AFF"] as [string, string],
          },
        ]
        : []),
      {
        title: "VIP",
        pathname: "/active/vipPage",
        isAuthRequired: true,
        isLinearBackground: true,
        IconComponent: VipIcon,
        colors: ["#D94BFF", "#EFC0FF"],
      },
      ...(showRebateTab
        ? [
          {
            title: t("pageName.rebate"),
            pathname: "/active/rebate",
            isAuthRequired: true,
            isLinearBackground: true,
            IconComponent: RebateIcon,
            colors: ["#15cea2", "#b6ffe0"] as [string, string],
          },
        ]
        : []),
      {
        title: t("pageName.beDealt"),
        pathname: "/active/beDealt",
        isAuthRequired: true,
        isLinearBackground: true,
        IconComponent: BeDealtIcon,
        colors: ["#fb6c5f", "#fcdcab"],
      },
      {
        title: t("pageName.taskRecord"),
        pathname: "/active/taskRecord",
        isAuthRequired: true,
        isLinearBackground: true,
        IconComponent: TaskRecordIcon,
        colors: ["#37b3bc", "#e2f4f5"],
      },
    ];

    return items;
  }, [config, language, i18n.language, memberDayId, specialBonusId, showRebateTab, t]);

  // 参考 Web 端逻辑：bonusTaskBadgeIsRed 为 true 显示红角标，否则显示绿角标
  const bonusBadgeSource = useMemo(() => {
    if (reminderCount?.bonusUnaccepted > 0 || reminderCount?.bonusTaskCount > 0) {
      const isRed = Number(reminderCount?.bonusUnaccepted ?? reminderCount?.bonusTaskCount) > 0;
      return isRed ? redCounterImg : greenCounterImg;
    }
  }, [reminderCount?.bonusUnaccepted, reminderCount?.bonusTaskCount]);
  const bonusBadgeCount = useMemo(() => {
    if (!reminderCount) return 0;
    const raw = Number(reminderCount?.bonusUnaccepted ?? reminderCount?.bonusTaskCount);
    let count = 0;
    if (raw > 0) {
      count = Number(raw);
    } else {
      count = Number(reminderCount?.bonusInProgress);
    }
    return count > 99 ? "99+" : String(Math.floor(count));
  }, [reminderCount]);

  const mysteryNotJoinedCount = useMemo(() => {
    if (!reminderCount) return 0;
    const activityItems = reminderCount?.activityItems;
    const mysteryNotJoinedCount = activityItems?.find(
      (item: any) => item.activityType === 11,
    )?.notJoinedCount;
    const count = Number(mysteryNotJoinedCount);
    return count > 0 ? (count > 99 ? "99+" : Math.floor(count)) : 0;
  }, [reminderCount]);

  const mysteryUnclaimedCount = useMemo(() => {
    if (!reminderCount) return 0;
    const activityItems = reminderCount?.activityItems;
    const mysteryUnclaimedCount = activityItems?.find(
      (item: any) => item.activityType === 11,
    )?.unacceptedCount;
    const count = Number(mysteryUnclaimedCount);
    return count > 0 ? (count > 99 ? "99+" : Math.floor(count)) : 0;
  }, [reminderCount]);

  const mysteryInProgressCount = useMemo(() => {
    if (!reminderCount) return 0;
    const activityItems = reminderCount?.activityItems;
    const mysteryInProgressCount = activityItems?.find(
      (item: any) => item.activityType === 11,
    )?.inProgressCount;
    const count = Number(mysteryInProgressCount);
    return count > 0 ? (count > 99 ? "99+" : Math.floor(count)) : 0;
  }, [reminderCount]);

  const memberDayUnclaimedCount = useMemo(() => {
    if (!reminderCount) return 0;
    const activityItems = reminderCount?.activityItems;
    const memberDayUnclaimedCount = activityItems?.find(
      (item: any) => item.activityType === 10,
    )?.unacceptedCount;
    const count = Number(memberDayUnclaimedCount);
    return count > 0 ? (count > 99 ? "99+" : Math.floor(count)) : 0;
  }, [reminderCount]);

  const { maxWidth } = useMaxWidth();
  const safeScreenWidth =
    Number.isFinite(maxWidth) && maxWidth > 0
      ? maxWidth
      : viewportWidthRef.current > 0
        ? viewportWidthRef.current
        : 375;
  const tabItemWidth = Math.max(58, safeScreenWidth / 5.35);

  // 边界容差，避免浮点误差导致“已到边界但仍显示箭头”
  const EDGE_EPS = 1;
  const TAB_SCROLL_FALLBACK_STEP = tabItemWidth;

  const getExpectedContentWidth = () => {
    // contentContainerStyle 有左右各 12 的内边距
    const tabsTotalWidth = tabItems.length * tabItemWidth + 24;
    // minWidth: "100%"，内容宽度至少不小于可视宽
    return Math.max(
      Number.isFinite(tabsTotalWidth) ? tabsTotalWidth : 0,
      Number.isFinite(viewportWidthRef.current) ? viewportWidthRef.current : 0,
    );
  };

  // 根据内容宽 - 视口宽计算最大可滚动距离
  const syncMaxScrollX = () => {
    const maxX = Math.max(0, contentWidthRef.current - viewportWidthRef.current);
    scrollEdgeRef.current = { ...scrollEdgeRef.current, maxX };
    setScrollEdge((s) => (s.maxX === maxX ? s : { ...s, maxX }));
  };

  useEffect(() => {
    tabLayoutsRef.current = [];
    scrollXRef.current = 0;
    setScrollEdge((s) => ({ ...s, x: 0 }));
    contentWidthRef.current = getExpectedContentWidth();

    // Web 上布局有延迟，连续两帧同步一次最大滚动距离更稳定
    requestAnimationFrame(() => {
      syncMaxScrollX();
      requestAnimationFrame(syncMaxScrollX);
    });
  }, [tabItems, tabItemWidth]);

  // 当前 scrollX 对应的“左侧锚点项”索引（用于按项滚动）
  const getAnchorTabIndex = (x: number) => {
    const layouts = tabLayoutsRef.current;
    for (let i = tabItems.length - 1; i >= 0; i--) {
      const L = layouts[i];
      if (L && L.x <= x + EDGE_EPS) return i;
    }
    return 0;
  };

  /** 相邻两项起点间距 ≈ 一个 tab 在滚动方向上的占用；缺数据时走固定兜底 */
  const getStepRight = (i: number) => {
    const L = tabLayoutsRef.current;
    const cur = L[i];
    const next = L[i + 1];
    if (cur && next) return Math.max(EDGE_EPS, next.x - cur.x);
    if (cur?.width) return Math.max(EDGE_EPS, cur.width);
    return TAB_SCROLL_FALLBACK_STEP;
  };

  const getStepLeft = (i: number) => {
    const L = tabLayoutsRef.current;
    const cur = L[i];
    const prev = L[i - 1];
    if (cur && prev) return Math.max(EDGE_EPS, cur.x - prev.x);
    if (cur?.width) return Math.max(EDGE_EPS, cur.width);
    return TAB_SCROLL_FALLBACK_STEP;
  };

  // 左箭头：向左滚动约 1 个 tab 宽度，已到最左则不滚动
  const onArrowScrollLeft = () => {
    const x = scrollXRef.current;
    if (x <= EDGE_EPS) return;
    // 距离最左不足两个兜底步长时，直接吸附到最左
    if (x < 2 * TAB_SCROLL_FALLBACK_STEP) {
      scrollRef.current?.scrollTo({ x: 0, animated: true });
      scrollXRef.current = 0;
      setScrollEdge((s) => ({ ...s, x: 0 }));
      return;
    }
    const i = getAnchorTabIndex(x);
    const step = getStepLeft(i);
    const newX = Math.max(0, Number.isFinite(x - step) ? x - step : 0);
    scrollRef.current?.scrollTo({ x: newX, animated: true });
    scrollXRef.current = newX;
    setScrollEdge((s) => ({ ...s, x: newX }));
  };

  // 右箭头：向右滚动约 1 个 tab 宽度，已到最右则不滚动
  const onArrowScrollRight = () => {
    const maxX = Math.max(0, contentWidthRef.current - viewportWidthRef.current);
    if (maxX <= EDGE_EPS || scrollXRef.current >= maxX - EDGE_EPS) return;
    const remainRight = maxX - scrollXRef.current;
    // 距离最右不足两个兜底步长时，直接吸附到最右
    if (remainRight < 2 * TAB_SCROLL_FALLBACK_STEP) {
      scrollRef.current?.scrollTo({ x: maxX, animated: true });
      scrollXRef.current = maxX;
      setScrollEdge((s) => ({ ...s, x: maxX }));
      return;
    }
    const i = getAnchorTabIndex(scrollXRef.current);
    const step = getStepRight(i);
    const next = Number.isFinite(scrollXRef.current + step)
      ? scrollXRef.current + step
      : scrollXRef.current;
    const newX = Math.min(maxX, next);
    scrollRef.current?.scrollTo({ x: newX, animated: true });
    scrollXRef.current = newX;
    setScrollEdge((s) => ({ ...s, x: newX }));
  };

  // 箭头显隐：仅在可继续滚动的方向显示
  const showLeftArrow = scrollEdge.x > EDGE_EPS;
  const showRightArrow = scrollEdge.maxX > EDGE_EPS && scrollEdge.x < scrollEdge.maxX - EDGE_EPS;

  const n = (v: any) => {
    const num = Number(v);
    return Number.isFinite(num) ? num : 0;
  };
  const specialBonusTitle = t("pageName.specialBonus");
  const memberDayTitle = t("pageName.memberDay");

  const taskCount = n(reminderCount?.taskCount);
  const taskInProgressCount = n(reminderCount?.taskInProgressCount);
  const rewardRecordUnclaimedCount = n(reminderCount?.rewardRecordUnclaimedCount);
  const mysteryNJ = n(mysteryNotJoinedCount);
  const mysteryUC = n(mysteryUnclaimedCount);
  const mysteryIP = n(mysteryInProgressCount);
  const memberDayUC = n(memberDayUnclaimedCount);

  const onTabPress = (item: ActivityCategory) => {
    if (item.isAuthRequired) {
      if (!checkLogin()) return;
    }
    if (item.title === t("pageName.specialBonus") && specialBonusId) {
      router.push({
        pathname: "/active/activeCenter",
        params: { id: specialBonusId, type: "11" },
      });
      return;
    }
    if (item.title === t("pageName.memberDay") && memberDayId) {
      router.push({
        pathname: "/active/activeCenter",
        params: { id: memberDayId, type: "10" },
      });
      return;
    }
    router.push(item.pathname as any);
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          indicatorStyle="default"
          persistentScrollbar={true}
          onLayout={(e) => {
            // 记录可视区宽度（viewport）
            viewportWidthRef.current = e.nativeEvent.layout.width;
            contentWidthRef.current = getExpectedContentWidth();
            syncMaxScrollX();
          }}
          onContentSizeChange={() => {
            // 记录内容总宽度（content）
            contentWidthRef.current = getExpectedContentWidth();
            syncMaxScrollX();
          }}
          onScroll={(e) => {
            // 实时记录当前位置，驱动箭头显隐
            const x = e.nativeEvent.contentOffset.x;
            scrollXRef.current = x;
            scrollNextXRef.current = x;
            if (scrollRafRef.current != null) return;
            scrollRafRef.current = requestAnimationFrame(() => {
              scrollRafRef.current = null;
              const nextX = scrollNextXRef.current;
              const prev = scrollEdgeRef.current;
              if (Math.abs(prev.x - nextX) < 0.5) return;
              scrollEdgeRef.current = { ...prev, x: nextX };
              setScrollEdge((s) => (Math.abs(s.x - nextX) < 0.5 ? s : { ...s, x: nextX }));
            });
          }}
          scrollEventThrottle={16}
          contentContainerStyle={{
            marginVertical: 10,
            //paddingHorizontal: 12,
          }}
        >
          {tabItems.map((tabItem, index) => (
            <View
              key={`activity-tab-${index}`}
              style={[styles.tabCell, { width: tabItemWidth }]}
              collapsable={false}
              onLayout={(e) => {
                // 每个 tab 的起始位置与宽度，用于“按项滚动”
                const { x, width } = e.nativeEvent.layout;
                tabLayoutsRef.current[index] = {
                  x: Number.isFinite(x) ? x : 0,
                  width: Number.isFinite(width) ? width : tabItemWidth,
                };
              }}
            >
              <Pressable
                className="justify-center items-center w-full"
                onPress={() => {
                  if (tabItem.onPress) tabItem.onPress();
                  else onTabPress(tabItem);
                }}
              >
                {tabItem.IconComponent ? (
                  <View style={styles.menuIcon}>
                    <tabItem.IconComponent key={`activity-tab-${index}`} width={40} height={40} />

                    {tabItem?.pathname === "/my/balanceGold" && !!bonusBadgeCount && (
                      <View style={styles.bonusBadge} pointerEvents="none">
                        <Image
                          source={bonusBadgeSource}
                          style={styles.bonusBadgeBg}
                          resizeMode="contain"
                        />
                        <Text numberOfLines={1} style={styles.bonusBadgeText}>
                          {bonusBadgeCount}
                        </Text>
                      </View>
                    )}
                    {
                      //神秘彩金角标
                      tabItem.title === specialBonusTitle && mysteryNJ > 0 && (
                        <View style={styles.bonusBadge} pointerEvents="none">
                          <Image
                            source={redCounterImg}
                            style={styles.bonusBadgeBg}
                            resizeMode="contain"
                          />
                          <Text numberOfLines={1} style={styles.bonusBadgeText}>
                            {mysteryNJ}
                          </Text>
                        </View>
                      )
                    }
                    {
                      //神秘彩金角标
                      tabItem.title === specialBonusTitle && mysteryNJ == 0 && mysteryUC > 0 && (
                        <View style={styles.bonusBadge} pointerEvents="none">
                          <Image
                            source={redCounterImg}
                            style={styles.bonusBadgeBg}
                            resizeMode="contain"
                          />
                        </View>
                      )
                    }
                    {
                      //神秘彩金角标
                      tabItem.title === specialBonusTitle &&
                      mysteryNJ == 0 &&
                      mysteryUC == 0 &&
                      mysteryIP > 0 && (
                        <View style={styles.bonusBadge} pointerEvents="none">
                          <Image
                            source={greenCounterImg}
                            style={styles.bonusBadgeBg}
                            resizeMode="contain"
                          />
                          <Text numberOfLines={1} style={styles.bonusBadgeText}>
                            {mysteryIP}
                          </Text>
                        </View>
                      )
                    }
                    {
                      //任务角标
                      tabItem.pathname === "/active/missionCenter" && taskCount > 0 && (
                        <View style={styles.bonusBadge} pointerEvents="none">
                          <Image
                            source={redCounterImg}
                            style={styles.bonusBadgeBg}
                            resizeMode="contain"
                          />
                        </View>
                      )
                    }
                    {
                      //任务角标
                      tabItem.pathname === "/active/missionCenter" &&
                      !(taskCount > 0) &&
                      taskInProgressCount > 0 && (
                        <View style={styles.bonusBadge} pointerEvents="none">
                          <Image
                            source={greenCounterImg}
                            style={styles.bonusBadgeBg}
                            resizeMode="contain"
                          />
                          <Text numberOfLines={1} style={styles.bonusBadgeText}>
                            {taskInProgressCount}
                          </Text>
                        </View>
                      )
                    }
                    {
                      //会员日角标
                      tabItem.title === memberDayTitle && memberDayUC > 0 && (
                        <View style={styles.bonusBadge} pointerEvents="none">
                          <Image
                            source={redCounterImg}
                            style={styles.bonusBadgeBg}
                            resizeMode="contain"
                          />
                        </View>
                      )
                    }
                  </View>
                ) : null}
                <Text
                  className={`font-medium text-${theme}-text`}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={[styles.tabLabel, { color: Colors[theme].text }]}
                >
                  {tabItem.title}
                </Text>

                {/* 代办：星星提示点（外圈闪灯泡） */}
                {tabItem.pathname === "/active/beDealt" && rewardRecordUnclaimedCount > 0 ? (
                  <View style={styles.starCoinBadgePos} pointerEvents="none">
                    <StarCoinBadge compact />
                  </View>
                ) : null}
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <View
          pointerEvents="box-none"
          className="w-full absolute top-0 bottom-0 right-0 left-0 flex-row justify-between items-center"
          style={styles.arrowOverlay}
        >
          {/* 隐藏时禁用命中，避免占位层挡住 ScrollView 手势 */}
          <View pointerEvents={showLeftArrow ? "box-none" : "none"} style={styles.arrowSlot}>
            {showLeftArrow ? (
              <Pressable hitSlop={10} onPress={onArrowScrollLeft}>
                <RectangleIcon
                  arrowColor={Colors[theme].text}
                  bgColor={Colors[theme].btnText}
                  bgOpacity={0.5}
                  style={[styles.arrowIconOffset, { transform: [{ scaleX: -1 }] }]}
                />
              </Pressable>
            ) : null}
          </View>
          <View pointerEvents={showRightArrow ? "box-none" : "none"} style={styles.arrowSlot}>
            {showRightArrow ? (
              <Pressable hitSlop={10} onPress={onArrowScrollRight}>
                <RectangleIcon
                  arrowColor={Colors[theme].text}
                  bgColor={Colors[theme].btnText}
                  bgOpacity={0.5}
                  style={styles.arrowIconOffset}
                />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  tabCell: {
    paddingHorizontal: 8,
    overflow: "visible",
  },
  tabLabel: {
    width: "100%",
    textAlign: "center",
    fontSize: 11,
    lineHeight: 14,
  },
  container: {
    //marginVertical: 8,
    //paddingTop: 10,
    position: "relative",
    paddingHorizontal: 12,
  },
  arrowOverlay: {
    zIndex: 1,
    elevation: 1,
  },
  arrowSlot: {
    minWidth: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIconOffset: {
    ...Platform.select({
      web: { marginTop: -12 },
      default: { marginTop: -16 },
    }),
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginBottom: 8,
    position: "relative",
  },
  bonusBadge: {
    position: "absolute",
    top: -9,
    right: -9,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9000,
    elevation: 9000,
  },
  bonusBadgeBg: {
    width: "100%",
    height: "100%",
  },
  bonusBadgeText: {
    position: "absolute",
    color: "#fff",
    fontSize: 9,
    lineHeight: 10,
    fontWeight: "700",
    textAlign: "center",
    includeFontPadding: false,
  },
  starCoinBadgePos: {
    position: "absolute",
    top: -8,
    right: 0,
    zIndex: 9000,
    elevation: 9000,
  },
});

export default ActivityCenterScrollableNavbar;
