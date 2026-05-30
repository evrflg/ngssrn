import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  type ImageLoadEventData,
  Image,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Globle from "@/components/icons/home/Globle";
import { baoxiangInfoAsync } from "@/store/active/activeSlice";
import { AppDispatch, RootState } from "@/store/store";
import {
  accInfoAsync,
  changeFirstDepoRefundPopStatus,
  changeIsShowTestUserPopup,
  changesShowLanguageModal,
  fetchUnreadMessageCount,
} from "@/store/user/userSlice";
import { getStoreJson } from "@/utils/storage";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, usePathname } from "expo-router";
import { GradientButton } from "@/components/ui/gradient/GradientButton";

// 隔离 usePathname，防止 IndexHeaderComponent 因路由变化整体重渲染
function AppDownloadBarGuard({
  isShowAppDown,
  topDownload,
  theme,
  handleAppDownload,
  handleCloseAppDownload,
  t,
}: {
  isShowAppDown: boolean;
  topDownload: any;
  theme: string;
  handleAppDownload: () => void;
  handleCloseAppDownload: () => void;
  t: (key: string) => string;
}) {
  const pathname = usePathname();
  if (!isShowAppDown || (pathname !== "/home" && pathname !== "/")) return null;
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: Colors[theme].background,
      }}
    >
      <View
        style={{
          width: "100%",
          paddingHorizontal: 6,
          paddingVertical: 3,
          borderRadius: 6,
          backgroundColor: topDownload?.backgroundColor || Colors[theme].blockBg,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Image
          style={{ width: 26, height: 26 }}
          resizeMode="contain"
          source={
            topDownload?.logo
              ? { uri: topDownload.logo }
              : require("@/assets/images/home/appdownload/app-download.png")
          }
        />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 11,
              color: "#fff",
              textAlign: "center",
              lineHeight: 13.75,
            }}
          >
            {topDownload?.introduction || t("app.downloadAppTips")}
          </Text>
        </View>
        <Image
          style={{ width: 26, height: 26 }}
          resizeMode="contain"
          source={
            topDownload?.awardIcon
              ? { uri: topDownload.awardIcon }
              : require("@/assets/images/home/appdownload/app-download.png")
          }
        />
        <Pressable
          style={{
            paddingHorizontal: 6,
            height: 24,
            backgroundColor: Colors[theme].appDownBarBtnBg || "transparent",
            borderRadius: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={handleAppDownload}
        >
          <Text style={{ fontSize: 11, color: Colors[theme].primary }}>
            {topDownload?.buttonLabel || t("app.download")}
          </Text>
        </Pressable>
        <Pressable
          style={{
            width: 24,
            height: 24,
            backgroundColor: Colors[theme].appDownBarBtnBg || "transparent",
            borderRadius: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={handleCloseAppDownload}
        >
          <AntDesign name="close" size={14} color={Colors[theme].primary} />
        </Pressable>
      </View>
    </View>
  );
}
import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import Gift from "../icons/Gift";
import Money from "../icons/home/Money";
import {
  HeaderActivityPopup,
  type TreasureWindowRect,
} from "./components/popup/HeaderActivityPopup";
import { Skeleton } from "./components/Skeleton";
import { autoExchangeAccInfo } from "./utils/util";
import { requestShowDownloadGuideNow } from "./popup/downloadGuide/hook/requestDownloadGuideOnHome";
import { resolveSafeAreaExtensionBg } from "@/utils/resolveSafeAreaExtensionBg";
import { allowOnceInWindow } from "@/utils/dedup";
import { UnreadBadge } from "@/components/my/myPage/ng/common/UnreadBadge";
import { getIsPWA } from "@/utils/utils";
const isWeb = Platform.OS === "web";
const headerAuthBtnHeight = 34;

const IndexHeaderComponent = ({
  forceCompactTopOffset = false,
}: {
  forceCompactTopOffset?: boolean;
}) => {
  const { theme } = useTheme(); //主题
  const safeAreaBg = resolveSafeAreaExtensionBg(theme);
  const { width } = useWindowDimensions();
  const cfg_site_base: any = useSelector(
    (state: RootState) => state?.user?.cfg_site_base,
    (prev, next) => prev === next,
  );
  const userInfo: any = useSelector(
    (state: RootState) => state?.user?.userInfo,
    (prev, next) => prev?.isLogin === next?.isLogin && prev?.member?.type === next?.member?.type,
  );
  const userProfile: any = useSelector(
    (state: RootState) => state?.user?.userProfile,
    (prev, next) => prev?.money === next?.money && prev?.bonus === next?.bonus,
  );
  const firstDepositRefund: any = useSelector(
    (state: RootState) => state?.user?.firstDepositRefund,
    (prev, next) => prev?.activityInProgress === next?.activityInProgress,
  );
  const unreadMessageCount: number = useSelector(
    (state: RootState) => state?.user?.unreadMessageCount || 0,
  );

  const baoxiangInfo: any = useSelector(
    (state: RootState) => state?.active?.baoxiangInfo,
    (prev, next) => prev?.baoNum === next?.baoNum,
  );
  const dispatch: AppDispatch = useDispatch();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { baoNum } = useMemo(() => baoxiangInfo || { baoNum: 0 }, [baoxiangInfo]);
  const { id, promoCode } = useLocalSearchParams();
  const [appDownShow, setAppDownShow] = useState(true);
  const topDownload: any = useSelector((state: RootState) => state?.selfConfig?.topDownload);
  const headerActivityPopupRef = useRef<{
    toggle: () => void;
    applyTreasureWindowRectAndToggle: (r: TreasureWindowRect) => void;
  } | null>(null);
  const treasureMeasureRef = useRef<View | null>(null);
  const [treasureHitRect, setTreasureHitRect] = useState<TreasureWindowRect | null>(null);
  // 导航防抖标记（替代原先模块级别的 let ispass，避免多实例共享状态导致竞态）
  const isNavigatingRef = useRef(false);

  /** 站点 logo：最高高度 40，宽度随原图比例；加载前占位避免高度塌缩 */
  const LOGO_MAX_HEIGHT = 40;
  const phoneLogoUrl = cfg_site_base?.phoneLogoFileUrl as string | undefined;
  const [logoDisplaySize, setLogoDisplaySize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  /** Web 上 RN Image 的 onLoad 多为浏览器事件，与 iOS/Android 的 source 尺寸并存；getSize 成功后可跳过 onLoad */
  const logoSizeResolvedRef = useRef(false);

  const applyLogoNaturalSize = useCallback((nw: number, nh: number) => {
    if (!nw || !nh || !Number.isFinite(nw) || !Number.isFinite(nh)) {
      setLogoDisplaySize({
        width: LOGO_MAX_HEIGHT,
        height: LOGO_MAX_HEIGHT,
      });
      return;
    }
    const scale = nh > LOGO_MAX_HEIGHT ? LOGO_MAX_HEIGHT / nh : 1;
    setLogoDisplaySize({
      width: Math.round(nw * scale),
      height: Math.round(nh * scale),
    });
  }, []);

  const readNaturalSizeFromLoadEvent = (
    e: NativeSyntheticEvent<ImageLoadEventData>,
  ): { width: number; height: number } | null => {
    const raw = e.nativeEvent as unknown as {
      source?: { width?: number; height?: number };
      target?: { naturalWidth?: number; naturalHeight?: number };
    };
    let nw = Number(raw?.source?.width);
    let nh = Number(raw?.source?.height);
    const tw = Number(raw?.target?.naturalWidth);
    const th = Number(raw?.target?.naturalHeight);
    if ((!nw || !nh) && tw && th) {
      nw = tw;
      nh = th;
    }
    if (!nw || !nh || !Number.isFinite(nw) || !Number.isFinite(nh)) return null;
    return { width: nw, height: nh };
  };

  useEffect(() => {
    logoSizeResolvedRef.current = false;
    setLogoDisplaySize(null);
    if (!phoneLogoUrl) return;

    Image.getSize(
      phoneLogoUrl,
      (w, h) => {
        logoSizeResolvedRef.current = true;
        applyLogoNaturalSize(w, h);
      },
      () => {
        /* getSize 失败（如部分跨域）时占位，真实尺寸仍可由 onLoad 从 DOM 图读出后覆盖 */
        setLogoDisplaySize((prev) => prev ?? { width: LOGO_MAX_HEIGHT, height: LOGO_MAX_HEIGHT });
      },
    );
  }, [phoneLogoUrl, applyLogoNaturalSize]);

  const handleSiteLogoLoad = (e: NativeSyntheticEvent<ImageLoadEventData>) => {
    if (logoSizeResolvedRef.current) return;
    const natural = readNaturalSizeFromLoadEvent(e);
    if (!natural) return;
    applyLogoNaturalSize(natural.width, natural.height);
    logoSizeResolvedRef.current = true;
  };

  // 格式化数字为两位小数
  const NumberString = (value: any) => Number(value || 0).toFixed(2);

  // 计算未读消息数（含宝箱数量）
  const unreadMessageCountWithTreasure = useMemo(() => {
    const messageCount = Number(unreadMessageCount || 0);
    const treasureCount = Number(baoNum || 0);
    const total = messageCount + treasureCount;
    return total > 0 ? total : 0;
  }, [unreadMessageCount, baoNum]);

  // 判断是否显示下载条（与 Vue 逻辑对齐）
  // isShowAppDown 不再依赖 pathname，pathname 改由 AppDownloadBar 内部判断
  const isShowAppDown = useMemo(() => {
    if (!topDownload?.enable) return false;
    if (isWeb) {
      const isHaveHide = sessionStorage.getItem("appDownHide");
      if (isHaveHide === "1") return false;
      if (typeof navigator !== "undefined" && navigator.userAgent.includes("APP")) {
        return false;
      }
    }
    return appDownShow;
  }, [topDownload?.enable, appDownShow]);

  const isSmallDevice = useMemo(() => width < 380, [width]);

  useFocusEffect(
    useCallback(() => {
      if (!userInfo?.isLogin) return;
      // 30秒内不重复请求
      if (!allowOnceInWindow("home:indexHeader:focusEffect", 30_000)) return;
      getStoreJson("lastGame").then((res: any) => {
        if (res?.gameId) {
          autoExchangeAccInfo(dispatch, res.gameId);
        }
      });
      dispatch(accInfoAsync());
      dispatch(baoxiangInfoAsync());
      return () => {};
    }, [userInfo?.isLogin, dispatch]),
  );

  // 登录后拉取未读数
  useEffect(() => {
    if (!userInfo?.isLogin) return;
    if (!allowOnceInWindow("home:indexHeader:fetchUnreadMessageCount", 2000)) return;
    dispatch(fetchUnreadMessageCount());
  }, [userInfo?.isLogin]);

  //登录
  const toLogin = () => {
    if (!isNavigatingRef.current) {
      isNavigatingRef.current = true;
      navigation.push("login");
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 2000);
    }
  };

  //注册
  const toRegister = () => {
    if (!isNavigatingRef.current) {
      isNavigatingRef.current = true;
      navigation.push("register", { id, promoCode });
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 2000);
    }
  };

  //语言选择
  const toShowLanguageModel = () => {
    dispatch(changesShowLanguageModal(true));
  };

  // 处理 app 下载点击事件（首页头部，直接触发弹窗）
  const handleAppDownload = () => {
    requestShowDownloadGuideNow();
  };

  const handleCloseAppDownload = () => {
    setAppDownShow(false);
    //如果是预览模式的时候 不需要存sessionStorage
    if (isWeb) {
      const params = new URLSearchParams(window.location.search);
      const randomCode = params.get("randomCode");
      if (!randomCode) {
        sessionStorage.setItem("appDownHide", "1");
      }
    }
  };

  // 测试账号：与活动中心一致，弹窗提示；非测试账号则正常跳转
  const goPage = (path: string) => {
    if (userInfo?.isTestUser) {
      dispatch(changeIsShowTestUserPopup(true));
      return;
    }
    navigation.push(path);
  };

  const measureTreasureInWindow = useCallback(() => {
    const node = treasureMeasureRef.current;
    if (!node || typeof node.measureInWindow !== "function") return;
    node.measureInWindow((x, y, w, h) => {
      if (w > 0 && h > 0) {
        setTreasureHitRect({ x, y, width: w, height: h });
      }
    });
  }, []);

  useEffect(() => {
    measureTreasureInWindow();
  }, [measureTreasureInWindow, width, isShowAppDown, userInfo?.isLogin]);

  // 打开首页活动弹窗（宝箱）
  const toggleHomeActivityPopup = () => {
    const node = treasureMeasureRef.current;
    if (node && typeof node.measureInWindow === "function") {
      node.measureInWindow((x, y, w, h) => {
        const rect = w > 0 && h > 0 ? { x, y, width: w, height: h } : null;
        if (rect) {
          setTreasureHitRect(rect);
          headerActivityPopupRef.current?.applyTreasureWindowRectAndToggle(rect);
        } else {
          headerActivityPopupRef.current?.toggle();
        }
      });
    } else {
      headerActivityPopupRef.current?.toggle();
    }
  };

  // 登录/注册按钮样式（useMemo 缓存，避免每次渲染创建新对象）
  const loginGradientInnerStyle = useMemo(
    () => ({
      minWidth: 59,
      height: headerAuthBtnHeight,
      paddingHorizontal: 8,
      borderRadius: 10,
      display: "flex" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      backgroundColor: "rgba(255,255,255,0.1)",
      overflow: "hidden" as const,
    }),
    [],
  );
  const loginGradientTextStyle = useMemo(
    () => ({ fontSize: 13, color: Colors[theme].text }),
    [theme],
  );

  const rechargeBakeOverlay = Colors[theme].homeToolTabRechargeBakeOverlay;

  return (
    <View>
      {isWeb && (
        <AppDownloadBarGuard
          isShowAppDown={isShowAppDown}
          topDownload={topDownload}
          theme={theme}
          handleAppDownload={handleAppDownload}
          handleCloseAppDownload={handleCloseAppDownload}
          t={t}
        />
      )}
      <View
        className=" py-0.5 px-2 justify-between items-center flex-row "
        style={{ backgroundColor: safeAreaBg, height: 52 }}
      >
        <Pressable
          className="h-10 flex-row items-center"
          onPress={() => {
            //alert(getIsPWA()+"-----1:"+(window as any)?.isFromPwa)
            navigation.navigate("home")}}
        >
          {phoneLogoUrl ? (
            <View
              style={{
                height: LOGO_MAX_HEIGHT,
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <Image
                resizeMode="contain"
                source={{ uri: phoneLogoUrl }}
                onLoad={handleSiteLogoLoad}
                style={
                  logoDisplaySize
                    ? {
                        width: logoDisplaySize.width,
                        height: logoDisplaySize.height,
                      }
                    : {
                        width: LOGO_MAX_HEIGHT,
                        height: LOGO_MAX_HEIGHT,
                        opacity: 0,
                      }
                }
              />
            </View>
          ) : (
            <Skeleton width={40} height={30}></Skeleton>
          )}

          {/* <Text
            style={{
              fontSize: isSmallDevice ? 12 : 14,
              fontWeight: "600",
              color: Colors[theme].text,
              marginLeft: cfg_site_base?.phoneLogoFileUrl ? 4 : 0,
              //maxWidth: 80,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {cfg_site_base?.siteName || ""}
          </Text> */}
        </Pressable>
        <View className="justify-center items-center pr-2" style={{ height: 48 }}>
          {userInfo?.isLogin ? (
            <View className="flex-row items-center" style={{ height: 40 }}>
              <View
                className="justify-center items-center mr-2.5 flex-row px-1.5"
                style={{
                  height: 40,
                  backgroundColor: Colors[theme].indexHeaderBgColor2 || "#f2f3f5",
                  borderRadius: 8,
                }}
              >
                <View>
                  <Money />
                </View>
                <View className="px-1" style={{ minWidth: 30 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: Colors[theme].text,
                      lineHeight: 14.4,
                    }}
                  >
                    {NumberString(userProfile?.money)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: Colors[theme].lightText || "#888",
                      lineHeight: 12,
                    }}
                  >
                    {NumberString(userProfile?.bonus)}
                  </Text>
                </View>
                <View>
                  <Pressable onPress={() => goPage("wallet/recharge")}>
                    <LinearGradient
                      start={{ x: 1, y: 0 }}
                      end={{ x: 0, y: 0 }}
                      style={{
                        height: 23,
                        width: 23,
                        borderRadius: 5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      colors={[Colors[theme].gradient, Colors[theme].primary]}
                    >
                      <Feather name="plus" size={16} color={Colors[theme].btnText} />
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
              {userInfo?.isLogin && (
                <View
                  ref={treasureMeasureRef}
                  collapsable={false}
                  onLayout={measureTreasureInWindow}
                  style={{
                    width: 35,
                    height: 35,
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  <LinearGradient
                    colors={[
                      "rgba(213,146,105,0.4)",
                      "rgba(213,146,105,0)",
                      "rgba(213,146,105,0.4)",
                    ]}
                    locations={[0, 0.5, 1]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{
                      width: 35,
                      height: 35,
                      borderRadius: 8,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Pressable
                      onPress={toggleHomeActivityPopup}
                      style={{
                        width: 35,
                        height: 35,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={
                          baoNum > 0
                            ? require("@/assets/images/home/baoxiang.gif")
                            : require("@/assets/images/home/baoxiang-close.png")
                        }
                        style={{ width: 25, height: 25 }}
                        resizeMode="contain"
                      />
                    </Pressable>
                  </LinearGradient>
                  <UnreadBadge count={unreadMessageCountWithTreasure} />
                </View>
              )}
            </View>
          ) : (
            <View className="flex-row" style={{ height: headerAuthBtnHeight }}>
              {firstDepositRefund?.activityInProgress && (
                <View
                  className="justify-center items-center mr-2"
                  style={{ height: headerAuthBtnHeight }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      dispatch(changeFirstDepoRefundPopStatus(true));
                    }}
                    className="flex-1 justify-center"
                  >
                    <Gift color={Colors[theme].primary} />
                  </TouchableOpacity>
                </View>
              )}
              <View
                className="justify-center items-center mr-2"
                style={{ height: headerAuthBtnHeight }}
              >
                <GradientButton
                  onPress={toLogin}
                  // 对齐 Vue3：linear-gradient(0deg, start 23.33%, end 100%)
                  start={{ x: 0.5, y: 1 }}
                  end={{ x: 0.5, y: 0 }}
                  style={loginGradientInnerStyle}
                  bakeSolid={{
                    backgroundColor: Colors[theme].homeToolTabRechargeBakeBg,
                    baseOverlayColor: "rgba(255,255,255,0.06)",
                    gradientOverlayColor: rechargeBakeOverlay,
                    stop: 0.2333,
                  }}
                  // 原始渐变参数仅作为兜底（bakeSolid 生效时会覆盖）
                  colors={[
                    Colors[theme].searchBtnGradientStart || "rgba(71, 181, 255, 0)",
                    rechargeBakeOverlay,
                  ]}
                  locations={[0.2333, 1]}
                  title={t("pageName.login")}
                  titleStyle={loginGradientTextStyle}
                />
              </View>
              <View
                className="justify-center items-center mr-2"
                style={{ height: headerAuthBtnHeight }}
              >
                <GradientButton
                  onPress={toRegister}
                  direction="vertical"
                  style={styles.registerGradientStyle}
                  colors={[
                    Colors[theme].primary,
                    Colors[theme].btnText,
                    Colors[theme].themeColor1 || Colors[theme].gradient,
                  ]}
                  locations={[0, 0.8077, 1]}
                  title={t("pageName.register")}
                  titleStyle={loginGradientTextStyle}
                />
              </View>
              <View
                className="justify-center items-center rounded-md px-2"
                style={{
                  backgroundColor: Colors[theme].blockBg,
                  height: headerAuthBtnHeight,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    toShowLanguageModel();
                  }}
                  className="flex-1 justify-center items-center"
                >
                  <Globle fill={Colors[theme].primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
      <HeaderActivityPopup
        ref={headerActivityPopupRef}
        isShowAppDownHeader={isShowAppDown && isWeb}
        forceCompactTopOffset={forceCompactTopOffset}
        treasureHitRect={treasureHitRect}
      />
    </View>
  );
};

// memo 包裹，避免父组件重渲染时触发不必要的更新
export const IndexHeader = memo(IndexHeaderComponent);

const styles = StyleSheet.create({
  registerGradientStyle: {
    minWidth: 59,
    height: headerAuthBtnHeight,
    paddingHorizontal: 8,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
