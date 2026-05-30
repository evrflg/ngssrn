import { TurntableAndRedPacketRainStatus } from "@/api";
import { reedType, reedUrl } from "@/constants/reedData";
import { useToast } from "@/components/common/toast";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { openLuckyWheel, openRedPacketRain } from "@/hooks/reed/reedJump";
import {
  baoxiangInfoAsync,
  isCommunityActivityShownFlag,
  setTurntableAndRedPacketRainStatus,
} from "@/store/active/activeSlice";
import { AppDispatch, RootState } from "@/store/store";
import { stationConfig } from "@/store/tenant/tenantSlice";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DeviceEventEmitter,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { UnreadBadge } from "@/components/my/myPage/ng/common/UnreadBadge";
import { changeIsShowTestUserPopup } from "@/store/user/userSlice";

interface HeaderActivityPopupHandle {
  toggle: () => void;
  applyTreasureWindowRectAndToggle: (r: TreasureWindowRect) => void;
}

export type TreasureWindowRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const HeaderActivityPopup = React.forwardRef<
  HeaderActivityPopupHandle,
  {
    isShowAppDownHeader: Boolean;
    forceCompactTopOffset?: boolean;
    treasureHitRect?: TreasureWindowRect | null;
  }
>(
  (
    {
      isShowAppDownHeader,
      forceCompactTopOffset = false,
      treasureHitRect = null,
    },
    ref,
  ) => {
    const { maxWidth } = useMaxWidth();
    const { width: windowWidth } = useWindowDimensions();
    const modalContentInsetLeft = Math.max(0, (windowWidth - maxWidth) / 2);
    const { theme } = useTheme();
    const { t } = useTranslation();
    const toast = useToast();
    const insets = useSafeAreaInsets();
    const dispatch: AppDispatch = useDispatch();
    // 站点配置
    const siteConfig = useSelector(stationConfig);

    const [show, setShow] = useState(false);
    const [turntable, setTurntable] = useState<number | null>(null);
    const [redpacketRain, setRedPacketRain] = useState<number | null>(null);
    const [modalTopY, setModalTopY] = useState(0);
    const openGuardUntilRef = useRef(0);
    const treasureHitFromToggleRef = useRef<TreasureWindowRect | null>(null);

    // Calculate grid template layout dimensions
    const gridLayout = useMemo(() => {
      const containerPadding = 24 * 2; // horizontal padding from popupContent
      const gap = 16; // gap between items
      const columns = 4; // 4 columns grid
      const availableWidth = maxWidth - containerPadding;
      const totalGapWidth = gap * (columns - 1);
      const itemWidth = (availableWidth - totalGapWidth) / columns;

      return {
        itemWidth: Math.floor(itemWidth),
        gap,
        columns,
      };
    }, []);

    const paddingTop = useMemo(() => {
      // Android Modal 常见会与状态栏产生重复顶部偏移，这里只在 iOS/web 叠加安全区
      let top = Platform.OS === "android" ? 0 : (insets?.top ?? 0);
      top += forceCompactTopOffset ? 50 : isShowAppDownHeader ? 100 : 50;
      return top;
    }, [forceCompactTopOffset, isShowAppDownHeader, insets]);

    const userInfo: any = useSelector(
      (state: RootState) => state?.user?.userInfo,
    );
    const config: any = useSelector(
      (state: RootState) => state?.user?.cfg_site_base,
    );
    const baoxiangInfo: any = useSelector(
      (state: RootState) => state?.active?.baoxiangInfo,
    );
    const unreadMessageCount: number = useSelector(
      (state: RootState) => state?.user?.unreadMessageCount || 0,
    );

    // Calculate treasure count
    const canOpenTreasureCount = useMemo(() => {
      if (!userInfo?.isLogin || !baoxiangInfo?.activityCenterData) {
        return 0;
      }
      // The treasure count is already calculated in baoxiangInfo.baoNum
      return baoxiangInfo?.baoNum || 0;
    }, [userInfo?.isLogin, baoxiangInfo]);

    const openPopup = () => {
      // Guard against immediate close caused by the same tap event chain.
      openGuardUntilRef.current = Date.now() + 250;
      setModalTopY(0);
      setShow(true);
    };

    const closePopup = () => {
      if (Date.now() < openGuardUntilRef.current) return;
      treasureHitFromToggleRef.current = null;
      setShow(false);
    };

    const togglePopup = () => {
      if (show) {
        closePopup();
      } else {
        openPopup();
      }
    };

    const applyTreasureWindowRectAndToggle = (r: TreasureWindowRect) => {
      treasureHitFromToggleRef.current = r;
      togglePopup();
    };

    // Expose open/close methods via ref
    React.useImperativeHandle(ref, () => ({
      toggle: togglePopup,
      applyTreasureWindowRectAndToggle,
    }));

    // Listen for open event
    useEffect(() => {
      const subscription = DeviceEventEmitter.addListener(
        "header-activity-popup-open",
        () => {
          openPopup();
          // Fetch activity list when opened
          if (config?.langCode) {
            dispatch(baoxiangInfoAsync());
          }
        },
      );

      return () => {
        subscription.remove();
      };
    }, [config?.langCode, dispatch]);

    // 打开转盘
    const handleOpenTurntable = async () => {
      await openLuckyWheel(toast, t);
    };

    // 打开红包雨
    const handleOpenRedpacket = async () => {
      await openRedPacketRain(toast, t);
    };

    // Handle button clicks
    const handleButtonClick = async (button: string) => {
      if(userInfo?.isTestUser){
        dispatch(changeIsShowTestUserPopup(true));
        return;
      }
      switch (button) {
        case "mail":
          router.navigate("/my/message");
          break;

        case "redpacket":
          await handleOpenRedpacket();
          break;

        case "lucky-wheel":
          await handleOpenTurntable();
          break;

        case "chatting":
          router.navigate({
            pathname: reedUrl,
            params: { toType: reedType.chatRoom },
          });
          break;

        case "customer-service":
          router.navigate({
            pathname: reedUrl,
            params: { toType: reedType.customerService },
          });

          // if (config?.customServiceLink) {
          //   Linking.openURL(config.customServiceLink);
          // }
          break;

        case "telegram":
          if (config?.telegramChannel) {
            Linking.openURL(config.telegramChannel);
          }
          break;

        case "treasure-box":
          if (baoxiangInfo?.activityCenterData) {
            router.navigate({
              pathname: "/active/activeCenter",
              params: { id: baoxiangInfo.activityCenterData.id, type: 1 },
            });
          }
          break;

        default:
          break;
      }
      closePopup();
    };

    /** 接口 data：{ turntable, redpacketRain }，**0 显示对应入口，其它不显示** */
    const getTurntableAndRedPacketRainStatus = async () => {
      try {
        const resp = await TurntableAndRedPacketRainStatus();
        const data = resp.data?.data as
          | { turntable?: number; redpacketRain?: number }
          | undefined;

        if (data != null) {
          dispatch(setTurntableAndRedPacketRainStatus(data));
          setTurntable(data.turntable ?? null);
          setRedPacketRain(data.redpacketRain ?? null);
        }
      } catch (e) {
        console.log("getTurntableAndRedPacketRainStatus error:", e);
      }
    };

    useEffect(() => {
      if (userInfo?.isLogin) getTurntableAndRedPacketRainStatus();
    }, [userInfo?.isLogin]);

    const treasureShimRect = show
      ? (treasureHitRect ?? treasureHitFromToggleRef.current ?? null)
      : null;

    return (
      <Modal
        isVisible={show}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={[
          styles.modal,
          { paddingTop, width: maxWidth, marginHorizontal: "auto" },
        ]}
        hasBackdrop={false}
        animationInTiming={200}
        animationOutTiming={200}
      >
        {modalTopY > 0 && (
          <Pressable
            onPress={closePopup}
            style={{
              position: "absolute",
              top: modalTopY,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,.7)",
              zIndex: 1,
            }}
          />
        )}

        <View
          style={[styles.popupWrapper, { zIndex: 2 }]}
          onLayout={(e) => {
            const { y } = e.nativeEvent.layout;
            setModalTopY(y);
          }}
        >
          <View
            style={[
              styles.popupContent,
              { backgroundColor: Colors[theme].indexHeaderBgColor || "#fff" },
            ]}
          >
            {/* Arrow indicator */}
            <View
              style={[
                styles.arrow,
                {
                  borderBottomColor: Colors[theme].indexHeaderBgColor || "#fff",
                },
              ]}
            />

            {/* Icon Grid */}
            <View style={[styles.iconGrid, { gap: gridLayout.gap }]}>
              {/* Lucky Wheel */}
              {isCommunityActivityShownFlag(turntable) &&
                siteConfig?.isTestSite && (
                  <TouchableOpacity
                    style={[styles.iconItem, { width: gridLayout.itemWidth }]}
                    onPress={() => handleButtonClick("lucky-wheel")}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconWrapper}>
                      <Image
                        source={require("@/assets/images/home/lucky-wheel.png")}
                        style={styles.activityIcon}
                        resizeMode="contain"
                      />
                    </View>
                  </TouchableOpacity>
                )}

              {/* Red Packet Timer */}
              {isCommunityActivityShownFlag(redpacketRain) &&
                siteConfig?.isTestSite && (
                  <TouchableOpacity
                    style={[styles.iconItem, { width: gridLayout.itemWidth }]}
                    onPress={() => handleButtonClick("redpacket")}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconWrapper}>
                      <Image
                        source={require("@/assets/images/home/redpacket-timer.png")}
                        style={styles.activityIcon}
                        resizeMode="contain"
                      />
                    </View>
                  </TouchableOpacity>
                )}

              {/* Treasure Box */}
              {userInfo?.isLogin &&
                baoxiangInfo?.activityCenterData !== undefined && (
                  <TouchableOpacity
                    style={[styles.iconItem, { width: gridLayout.itemWidth }]}
                    onPress={() => handleButtonClick("treasure-box")}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconWrapper}>
                      {canOpenTreasureCount > 0 ? (
                        <View style={styles.canOpenTreasure}>
                          <Image
                            source={require("@/assets/images/home/baoxiang.gif")}
                            style={styles.activityIcon}
                            resizeMode="contain"
                          />
                          {canOpenTreasureCount > 0 && (
                            <View style={styles.treasureCount}>
                              <Text style={styles.treasureCountText}>
                                {canOpenTreasureCount > 99
                                  ? "99"
                                  : canOpenTreasureCount}
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        <Image
                          source={require("@/assets/images/home/gift-chest.png")}
                          style={styles.activityIcon}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                )}

              {/* Mail Icon */}
              <TouchableOpacity
                style={[styles.iconItem, { width: gridLayout.itemWidth }]}
                onPress={() => handleButtonClick("mail")}
                activeOpacity={0.7}
              >
                <View style={styles.iconWrapper}>
                  <Image
                    source={require("@/assets/images/home/mail-icon.png")}
                    style={styles.activityIcon}
                    resizeMode="contain"
                  />
                  {unreadMessageCount > 0 && (
                    <UnreadBadge count={unreadMessageCount} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Customer Service */}
              {siteConfig?.customerServiceLogo && (
                <TouchableOpacity
                  style={[styles.iconItem, { width: gridLayout.itemWidth }]}
                  onPress={() => handleButtonClick("customer-service")}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconWrapper}>
                    <Image
                      source={require("@/assets/images/home/customer_service.png")}
                      style={styles.activityIcon}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>
              )}

              {/* Telegram */}
              {config?.telegramChannel && (
                <TouchableOpacity
                  style={[styles.iconItem, { width: gridLayout.itemWidth }]}
                  onPress={() => handleButtonClick("telegram")}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconWrapper}>
                    <Image
                      source={require("@/assets/images/home/telegram-icon.png")}
                      style={[styles.activityIcon, styles.telegramIcon]}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>
              )}

              {/* Chatting */}
              {siteConfig?.isTestSite && (
                <TouchableOpacity
                  style={[styles.iconItem, { width: gridLayout.itemWidth }]}
                  onPress={() => handleButtonClick("chatting")}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconWrapper}>
                    <Image
                      source={require("@/assets/images/home/chat-room.png")}
                      style={styles.activityIcon}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {treasureShimRect != null && (
          <Pressable
            accessibilityLabel="header-activity-treasure-toggle"
            onPress={closePopup}
            style={{
              position: "absolute",
              left: treasureShimRect.x - modalContentInsetLeft,
              top: treasureShimRect.y,
              width: treasureShimRect.width,
              height: treasureShimRect.height,
              zIndex: 20,
            }}
          />
        )}
      </Modal>
    );
  },
);

HeaderActivityPopup.displayName = "HeaderActivityPopup";

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-start",
  },
  popupWrapper: {
    width: "100%",
    alignItems: "center",
  },
  popupContent: {
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: "center",
  },
  arrow: {
    position: "absolute",
    top: -5,
    right: 12,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  iconItem: {
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    position: "relative",
    width: 46,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },
  activityIcon: {
    width: 46,
    height: 46,
  },
  telegramIcon: {
    width: 40,
    height: 40,
  },
  canOpenTreasure: {
    position: "relative",
    width: 46,
    height: 46,
  },
  treasureCount: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    backgroundColor: "#ff6754",
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  treasureCountText: {
    color: "#fff",
    fontSize: 10.5,
    fontWeight: "600",
    lineHeight: 18,
  },
});
