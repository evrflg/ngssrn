import { useTheme } from "@/hooks/theme/ThemeProvider";
import { AppDispatch, RootState } from "@/store/store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { degreeInfoAsync } from "@/store/active/activeSlice";
import { getVipConfig } from "../active/activeConfg";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import VipBetIcon from "../icons/my/VipBetIcon";
import { rf } from "@/utils/scaleFont";

interface Props {
  backgroundColor?: string;
  showBetIcon?: boolean;
}

const userIdTextColor = "#adb7ba";

const UserProfileVip = ({ backgroundColor, showBetIcon }: Props) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const info = useSelector((state: RootState) => state.active.degreeInfo);
  const [vip, setVip] = useState<any>();

  const { isBestLevel, depositProgress, betProgress } = useMemo(() => {
    let isBestLevel = false;
    let depositProgress = "0%";
    let betProgress = "0%";

    if (info) {
      isBestLevel = info.curDegreeLevel > 20 && info.newDegreeLevel === 0;
      const depositPercent =
        (info.curDegreeDepositMoney / info.newDegreeDepositMoney) * 100;
      depositProgress = (depositPercent >= 100 ? 100 : depositPercent) + "%";
      const betPercent = (info.curDegreeBetNum / info.newDegreeBetNum) * 100;
      betProgress = (betPercent >= 100 ? 100 : betPercent) + "%";
    }
    return { isBestLevel, depositProgress, betProgress };
  }, [info]);

  useFocusEffect(
    useCallback(() => {
      dispatch(degreeInfoAsync());
    }, [dispatch]),
  );

  useEffect(() => {
    if (info) {
      const { card } = getVipConfig(info.curDegreeLevel);
      const rate = info
        ? info.type == 1
          ? info.curDegreeDepositMoney / info.newDegreeDepositMoney
          : info.curDegreeBetNum / info.newDegreeBetNum
        : 0;
      const percent = `${Math.min(rate, 1) * 100}%` as `${number}%`;
      setVip({ ...card, percent });
    }
  }, [info]);

  const splitLineColor =
    theme === "greenBlack" ? "rgba(250, 250, 250, 0.1)" : "#e6e8e8";

  return (
    <View>
      <View style={[styles.divider, { backgroundColor: splitLineColor }]} />
      <Pressable
        onPress={() => navigation.push("active/vipPage")}
        style={styles.levelRow}
      >
        <View
          className="flex-row items-center justify-center"
          style={styles.iconContainer}
        >
          <Image source={vip?.badge} resizeMode="contain" style={styles.icon} />
          <Text
            className={`font-semibold text-center text-${theme}-darkColor`}
            style={styles.vipName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {info?.curDegreeName}
          </Text>
        </View>
        <View className="flex-1 gap-2">
          {(info?.type === 1 || info?.type === 3) && (
            <View style={styles.contentContainer}>
              <Text className="text-xs" style={{ color: userIdTextColor }}>
                {t("userProfile.currentDeposit", {
                  amount: info?.curDegreeDepositMoney || 0,
                })}
              </Text>
              <View
                style={[styles.progressBar, { backgroundColor: "#ebecf3" }]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: depositProgress,
                      backgroundColor: Colors[theme].primary,
                    } as ViewStyle,
                  ]}
                />
              </View>
              <Text style={[styles.nextTip, { color: userIdTextColor }]}>
                {isBestLevel
                  ? t("active.vip.isBestLevel")
                  : t("userProfile.nextDepositToLevel", {
                    amount: info?.nextDegreeDepositMoney || 0,
                    level: info?.newDegreeName,
                  })}
              </Text>
            </View>
          )}
          {(info?.type === 2 || info?.type === 3) && (
            <View className="flex-1 flex-row gap-2 items-center">
              {showBetIcon && (
                <VipBetIcon
                  width={24}
                  height={24}
                  fill={Colors[theme].themeColor1}
                />
              )}
              <View style={styles.contentContainer}>
                <Text className="text-xs" style={{ color: userIdTextColor }}>
                  {t("userProfile.currentBetting", {
                    amount: info?.curDegreeBetNum || 0,
                  })}
                </Text>
                <View
                  style={[styles.progressBar, { backgroundColor: "#ebecf3" }]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: betProgress,
                        backgroundColor: Colors[theme].primary,
                      } as ViewStyle,
                    ]}
                  />
                </View>
                <Text style={[styles.nextTip, { color: userIdTextColor }]}>
                  {isBestLevel
                    ? t("active.vip.isBestLevel")
                    : t("userProfile.nextBettingToLevel", {
                      amount: info?.nextDegreeBetNum || 0,
                      level: info?.newDegreeName,
                    })}
                </Text>
              </View>
            </View>
          )}
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={18} color={userIdTextColor} />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  /** 對齊 Web：margin 0 15px */
  divider: {
    height: 1,
    opacity: 0.5,
    marginHorizontal: 15,
  },
  levelRow: {
    width: "100%",
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  vipName: {
    fontSize: rf(12),
    marginTop: 2,
    flexShrink: 1,
  },
  iconContainer: {
    gap: 10,
  },
  nextTip: {
    fontSize: rf(11),
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowContainer: {
    width: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 50,
    height: 50,
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 8,
    marginVertical: 4,
    position: "relative",
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    borderRadius: 8,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default UserProfileVip;
