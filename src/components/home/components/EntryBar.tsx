import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, type RelativePathString } from "expo-router";
import { getActDetail } from "@/api";
import { OPEN_MYSTERIOUS_MINE_EVENT } from "../../mysteriousMineBg/events";
import { AppDispatch, RootState } from "@/store/store";
import { stationConfig } from "@/store/tenant/tenantSlice";
import {
  formatCountdown,
  getScheduleCountdownState,
  type AwardSchedule,
} from "@/utils/activityScheduleCountdown";
import {
  Animated,
  DeviceEventEmitter,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { reedType, reedUrl } from "@/constants/reedData";
import { changeIsShowTestUserPopup } from "@/store/user/userSlice";
import { openLuckyWheel, openRedPacketRain } from "@/hooks/reed/reedJump";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/common/toast";
type EntryItem = {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  path?: string;
};

const COLLAPSED_WIDTH = 50;
const EXPANDED_WIDTH = 66;
const EXPANDED_MAX_HEIGHT = 270;

const ENTRY_ITEMS: EntryItem[] = [
  {
    key: "luckywheel",
    label: "luckywheel",
    icon: "wheel-barrow",
    // path: `${reedUrl}?toType=${reedType.luckyWheel}`,
  },
  {
    key: "redbag",
    label: "redbag",
    icon: "gift-outline",
    // path: `${reedUrl}?toType=${reedType.redpackeTrain}`,
  },
  {
    key:"bonusUnlock",
    label: "bonusUnlock",
    icon: "gift-outline",
    path: "/my/balanceGold",
  },
  {
    key: "memberDay",
    label: "memberDay",
    icon: "wallet-outline",
    path: "/active/activeCenter?type=10",
  },
  { key: "mine", label: "Mine", icon: "pickaxe" },
];

const isWeb = Platform.OS === "web";
type MineOptional = { appLogoURL?: string };
type MineData = {
  id?: number | string;
  activityType?: number;
  optional?: MineOptional | string | null;
  mysteryMineSchedules?: AwardSchedule[];
};

const getMineOptional = (optional: MineData["optional"]): MineOptional => {
  if (!optional) return {};
  if (typeof optional === "string") {
    try {
      return JSON.parse(optional);
    } catch {
      return {};
    }
  }
  return optional;
};

const MineCountdownText = ({ schedules }: { schedules: AwardSchedule[] }) => {
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    if (!schedules.length) return;
    const timer = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [schedules.length]);

  const text = useMemo(() => {
    if (!schedules.length) return "";
    const state = getScheduleCountdownState(schedules, new Date(nowTs));
    return state ? formatCountdown(state.remainingMs) : "";
  }, [schedules, nowTs]);

  if (!text) return null;
  return <Text style={styles.mineCountdownText}>{text}</Text>;
};

const EntryBar = () => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const activityList = useSelector(
    (state: RootState) => state?.active?.activityList,
  );
  const turntableRedPacketStatus = useSelector(
    (state: RootState) => state?.active?.turntableRedPacketStatus,
  );
  const siteConfig = useSelector(stationConfig);
  const userInfo = useSelector((state: RootState) => state?.user?.userInfo);
  const isLogin = Boolean(userInfo?.isLogin);

  /** 与 HeaderActivityPopup 一致：测试站 + 接口 turntable/redpacketRain === 0 才显示转盘/红包 */
  const entryItems = useMemo(() => {
    // 转盘/红包：未登录时不显示，登录后才显示
    if (!isLogin) {
      return ENTRY_ITEMS.filter((i) => i.key !== "luckywheel" && i.key !== "redbag"&&i.key !== "bonusUnlock");
    }
    if (!siteConfig?.isTestSite) {
      return ENTRY_ITEMS.filter(
        (i) => i.key !== "luckywheel" && i.key !== "redbag",
      );
    }
    return ENTRY_ITEMS.filter((item) => {
      if (item.key === "luckywheel") {
        return turntableRedPacketStatus?.turntable === 0;
      }
      if (item.key === "redbag") {
        return turntableRedPacketStatus?.redpacketRain === 0;
      }
      return true;
    });
  }, [isLogin, siteConfig?.isTestSite, turntableRedPacketStatus]);
  const [visible, setVisible] = useState(true);
  // 进入页面默认展开
  const [expanded, setExpanded] = useState(true);
  const progress = useRef(new Animated.Value(1)).current; // 0 collapsed, 1 expanded
  const slideProgress = useRef(new Animated.Value(0)).current; // 0 visible, 1 hidden to right
  const collapsedTrackX = useRef(new Animated.Value(0)).current;
  const collapsedIndexRef = useRef(0);

  const expandedHeight = useMemo(() => {
    // 展开态是纵向列表：paddingVertical 10、item 高 52、gap 10
    const itemH = 52;
    const gap = 10;
    const paddingV = 10 * 2;
    const count = entryItems.length;
    const contentH = paddingV + count * itemH + Math.max(0, count - 1) * gap;
    return Math.min(EXPANDED_MAX_HEIGHT, Math.max(COLLAPSED_WIDTH, contentH));
  }, [entryItems.length]);

  const animatedContainer = useMemo(
    () => ({
      width: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [COLLAPSED_WIDTH, EXPANDED_WIDTH],
      }),
      height: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [COLLAPSED_WIDTH, expandedHeight],
      }),
    }),
    [progress, expandedHeight],
  );

  const rotateDeg = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "0deg"],
  });
  const animatedHostStyle = useMemo(
    () => ({
      transform: [
        {
          translateX: slideProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 96],
          }),
        },
      ],
      opacity: slideProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.25],
      }),
    }),
    [slideProgress],
  );

  const setScrollHidden = (hidden: boolean) => {
    slideProgress.stopAnimation();
    Animated.timing(slideProgress, {
      toValue: hidden ? 1 : 0,
      duration: hidden ? 140 : 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    // 统一使用同一个全局滚动状态：home-scroll-active
    const subActive = DeviceEventEmitter.addListener(
      "home-scroll-active",
      (payload) => {
        const active = Boolean(payload?.active);
        setScrollHidden(active);
      },
    );
    return () => subActive.remove();
  }, [slideProgress]);

  useEffect(() => {
    if (!isLogin) return;
    if (expanded || entryItems.length <= 1) return;
    const len = entryItems.length;
    const timer = setInterval(() => {
      const next = (collapsedIndexRef.current + 1) % len;
      collapsedIndexRef.current = next;
      Animated.timing(collapsedTrackX, {
        toValue: -next * COLLAPSED_WIDTH,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 5000);
    return () => clearInterval(timer);
  }, [isLogin, expanded, collapsedTrackX, entryItems.length]);

  useEffect(() => {
    if (expanded) {
      collapsedIndexRef.current = 0;
      collapsedTrackX.setValue(0);
    }
  }, [expanded, collapsedTrackX]);

  useEffect(() => {
    if (collapsedIndexRef.current >= entryItems.length) {
      collapsedIndexRef.current = 0;
      collapsedTrackX.setValue(0);
    }

  }, [entryItems.length, collapsedTrackX]);

  const toggleExpanded = () => {
    
    const next = !expanded;
    setExpanded(next);
    Animated.timing(progress, {
      toValue: next ? 1 : 0,
      duration: 240,
      useNativeDriver: false,
    }).start();
  };

  const handleClose = () => setVisible(false);

  const handleItemPress = (item: EntryItem) => {
    if (!isLogin) {
      router.push("/login" as RelativePathString);
      return;
    }
    if(userInfo?.isTestUser){
      dispatch(changeIsShowTestUserPopup(true));
      return;
    }
    if (item.key === "mine") {
      DeviceEventEmitter.emit(OPEN_MYSTERIOUS_MINE_EVENT);
      return;
    }
    if (item.key === "memberDay") {
      const memberDayPath = memberDayId
        ? `/active/activeCenter?id=${memberDayId}&type=10`
        : "/active/activeCenter?type=10";
      router.push(memberDayPath as RelativePathString);
      return;
    }

    if(item.key === 'luckywheel') {
      return openLuckyWheel(toast, t);
    } else if (item.key === 'redbag') {
      return openRedPacketRain(toast, t);
    }
    
    if (item.path) {
      router.push(item.path as RelativePathString);
    }
  };

  const memberDayId = useMemo(() => {
    if (!Array.isArray(activityList)) return "";
    const memberDay = activityList.find(
      (item: MineData) => item?.activityType === 10,
    );
    return memberDay?.id ? String(memberDay.id) : "";
  }, [activityList]);

  const mineRow = useMemo(() => {
    if (!Array.isArray(activityList)) return null;
    return (
      activityList.find((item: MineData) => item?.activityType === 12) || null
    );
  }, [activityList]);

  const mineLogoFromList = useMemo(
    () => getMineOptional(mineRow?.optional).appLogoURL || "",
    [mineRow],
  );

  const mineSchedulesFromList = useMemo(
    () =>
      Array.isArray(mineRow?.mysteryMineSchedules)
        ? mineRow.mysteryMineSchedules
        : ([] as AwardSchedule[]),
    [mineRow],
  );

  const [mineDetailLogo, setMineDetailLogo] = useState("");
  const [mineDetailSchedules, setMineDetailSchedules] = useState<
    AwardSchedule[]
  >([]);
  const mineDetailFetchKeyRef = useRef(0);
  const prevLoginRef = useRef(isLogin);
  const requestedListRef = useRef(false);

  useEffect(() => {
    const wasLogin = prevLoginRef.current;
    if (!wasLogin && isLogin) {
      setMineDetailLogo("");
      setMineDetailSchedules([]);
      requestedListRef.current = true;
    }
    if (!isLogin) {
      requestedListRef.current = false;
    }
    prevLoginRef.current = isLogin;
  }, [dispatch, isLogin]);

  useEffect(() => {
    if (!isLogin) {
      setMineDetailLogo("");
      setMineDetailSchedules([]);
      return;
    }
    if (!mineRow?.id) {
      if (!requestedListRef.current) {
        requestedListRef.current = true;
      }
      setMineDetailLogo("");
      setMineDetailSchedules(mineSchedulesFromList);
      return;
    }
    requestedListRef.current = false;

    const fetchKey = ++mineDetailFetchKeyRef.current;
    let mounted = true;

    getActDetail({ id: mineRow.id })
      .then((detailRes: any) => {
        if (!mounted || fetchKey !== mineDetailFetchKeyRef.current) return;
        const data = (detailRes?.data?.data as MineData) || mineRow;
        const opt = getMineOptional(data?.optional);
        setMineDetailLogo(opt.appLogoURL || "");
        setMineDetailSchedules(
          Array.isArray(data?.mysteryMineSchedules)
            ? data.mysteryMineSchedules
            : mineSchedulesFromList,
        );
      })
      .catch(() => {
        if (!mounted || fetchKey !== mineDetailFetchKeyRef.current) return;
        setMineDetailLogo(mineLogoFromList);
        setMineDetailSchedules(mineSchedulesFromList);
      });

    return () => {
      mounted = false;
    };
  }, [dispatch, isLogin, mineRow, mineLogoFromList, mineSchedulesFromList]);

  const displayMineLogo = isLogin ? mineDetailLogo : mineLogoFromList;
  const displayMineSchedules = isLogin
    ? mineDetailSchedules
    : mineSchedulesFromList;

  if (!visible || entryItems.length === 0) {
    return null;
  }

  const renderEntryIcon = (item: EntryItem, size: number) => {
    const iconSize = size + 16;
    if (item.key === "luckywheel") {
      return (
        <Image
          source={require("@/assets/images/home/spinning_wheel.webp")}
          style={{ width: iconSize + 10, height: iconSize + 10 }}
          resizeMode="contain"
        />
      );
    }
    if (item.key === "redbag") {
      return (
        <Image
          source={require("@/assets/images/home/red_envelope.webp")}
          style={{ width: iconSize + 10, height: iconSize + 10 }}
          resizeMode="contain"
        />
      );
    }
    if (item.key === "bonusUnlock") {
      return (
        <Image
          source={require("@/assets/images/home/bonus_unlock.webp")}
          style={{ width: iconSize + 10, height: iconSize + 10 }}
          resizeMode="contain"
        />
      );
    }
    if (item.key === "memberDay") {
      return (
        <Image
          source={require("@/assets/images/home/bonuaccs.webp")}
          style={{ width: iconSize + 10, height: iconSize + 10 }}
          resizeMode="contain"
        />
      );
    }
    if (item.key === "mine") {
      if (displayMineLogo) {
        return (
          <View style={styles.mineIconWrap}>
            <Image
              key={`mine-entry-logo-${isLogin}-${displayMineLogo}`}
              source={{ uri: displayMineLogo }}
              style={{ width: iconSize + 12, height: iconSize + 12 }}
              resizeMode="contain"
            />
            <MineCountdownText schedules={displayMineSchedules} />
          </View>
        );
      }
      return (
        <View style={styles.mineIconWrap}>
          {/* <Image
            source={require("@/assets/images/active/mysteriousMine/mineAbleBtn.png")}
            style={{ width: iconSize + 8, height: iconSize + 8 }}
            resizeMode="contain"
          /> */}
          <MineCountdownText schedules={displayMineSchedules} />
        </View>
      );
    }
    return (
      <MaterialCommunityIcons
        name={item.icon}
        size={iconSize}
        color="#ffd666"
      />
    );
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.host, animatedHostStyle]}
    >
      <View style={styles.anchor}>
        {entryItems.length > 1 && (
          <Pressable className="w-full mb-1" onPress={toggleExpanded} style={styles.expandBtn}>
            <Animated.View style={{ transform: [{ rotate: rotateDeg }] }}>
              <Image source={require('@/assets/images/home/entry-arrow.png')} style={{ width:22, height:22 }} />
            </Animated.View>
          </Pressable>
        )}

        <Pressable onPress={handleClose} style={styles.closeBtn}>
          <AntDesign name="close" size={14} color="#868686" />
        </Pressable>

        <Animated.View
          style={[
            styles.panel,
            animatedContainer,
            {
              backgroundColor:
                theme.theme === "greenBlack"
                  ? "rgba(0, 0, 0, 0.5)"
                  : "rgba(255, 255, 255, 0.5)",
            },
          ]}
        >
          {!expanded ? (
            <View style={styles.singleEntryMask}>
              <Animated.View
                style={[
                  styles.singleEntryTrack,
                  {
                    width: COLLAPSED_WIDTH * entryItems.length,
                    transform: [{ translateX: collapsedTrackX }],
                  },
                ]}
              >
                {entryItems.map((item) => (
                  <Pressable
                    key={item.key}
                    style={styles.singleEntry}
                    onPress={() => handleItemPress(item)}
                  >
                    {renderEntryIcon(item, 12)}
                  </Pressable>
                ))}
              </Animated.View>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {entryItems.map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => handleItemPress(item)}
                  style={styles.item}
                >
                  {renderEntryIcon(item, 26)}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    right: isWeb ? 8 : 4,
    bottom: isWeb ? 120 : 96,
    zIndex: 999,
  },
  anchor: {
    position: "relative",
    alignItems: "flex-end",
  },
  panel: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  expandBtn: {
    // position: "absolute",
    // top: -28,
    // right: 18,
    // width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  closeBtn: {
    position: "absolute",
    top: -14,
    left: -14,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  singleEntry: {
    width: COLLAPSED_WIDTH,
    height: COLLAPSED_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  singleEntryMask: {
    width: COLLAPSED_WIDTH,
    height: COLLAPSED_WIDTH,
    overflow: "hidden",
  },
  singleEntryTrack: {
    flexDirection: "row",
    height: COLLAPSED_WIDTH,
  },
  scrollContent: {
    paddingVertical: 10,
    alignItems: "center",
    gap: 10,
  },
  item: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  itemText: {
    color: "#fff",
    fontSize: 10,
    lineHeight: 12,
  },
  mineIconWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  mineCountdownText: {
    position: "absolute",
    bottom: 2,
    left: 0,
    right: 0,
    color: "#fff",
    fontSize: 8,
    lineHeight: 10,
    textAlign: "center",
    includeFontPadding: false,
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default EntryBar;
