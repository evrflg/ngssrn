import { AlertModal } from "@/components/common/AlertModal";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import MemberDayDateNavbar from "./MemberDayDateNavbar";
import MemberDayInfo from "./MemberDayInfo";
import MemberDayInteractive from "./MemberDayInteractive";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useCommon } from "@/hooks/CommonProvider";
import { useMemberDayActivity } from "@/hooks/active/useMemberDayActivity";
import MemberDayCategoryNavbar from "./MemberDayCategoryNavbar";
import { useSelector } from "react-redux";
import { stationConfig } from "@/store/tenant/tenantSlice";
import { rf } from "@/utils/scaleFont";

const bannerImg = require("@/assets/images/active/memberday/banner.png");

export default function MemberDayContent() {
  const { t } = useTranslation();
  const { language } = useCommon();
  const params = useLocalSearchParams<{ id?: string; mockToday?: string }>();
  const { theme } = useTheme();
  const siteCfg = useSelector(stationConfig);
  const { maxWidth } = useMaxWidth();
  const displayTimeZone = siteCfg?.isBn102 ? "Asia/Dhaka" : undefined;
  const bannerImgWidth = maxWidth;
  const bannerImgHeight = Math.floor(maxWidth / 3);
  const bannerTitleText = t("active.memberDay.superMemberDay");
  const bannerSubtitleText = t("active.memberDay.memberPromoLottery");
  const isCompact = bannerTitleText.length > 8;
  const isExtraCompact =
    bannerTitleText.length > 15 || bannerSubtitleText.length > 18;

  const locale = (language || "en-US") as string;
  const {
    activityData,
    dates,
    selectedDate,
    setSelectedDate,
    categories,
    selectedCategory,
    setSelectedCategory,
    activeMode,
    activityStatus,
    activityStartTime,
    resolvedId,
    selectedRule,
    dailyStats,
    multRateLabel,
    interactiveTitle,
    envelopes,
    interactiveKey,
    activityIntro,
    handleClaimed,
    handleRedEnvelopeOpened,
  } = useMemberDayActivity(
    t,
    locale,
    {
      routeId: params?.id ? String(params.id) : undefined,
      mockToday: params?.mockToday ? String(params.mockToday) : undefined,
    },
    displayTimeZone,
  );

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    message: string;
    onConfirm?: () => void;
  }>({ message: "" });

  return (
    <View style={[styles.page, { backgroundColor: Colors[theme].background }]}>
      <ImageBackground
        source={bannerImg}
        style={[
          {
            width: bannerImgWidth,
            height: bannerImgHeight,
            justifyContent: "center",
          },
        ]}
        resizeMode="cover"
      >
        <View
          style={[
            styles.bannerTextOverlay,
            {
              width: Math.round(
                bannerImgWidth *
                  (isExtraCompact ? 0.56 : isCompact ? 0.54 : 0.52),
              ),
            },
            isCompact && styles.bannerTextOverlayCompact,
            isExtraCompact && styles.bannerTextOverlayExtraCompact,
          ]}
        >
          <LinearGradient
            colors={["#ffd900", "#f48d16"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[
              styles.rewardBadge,
              {
                boxShadow:
                  "2px 2px 2px 0 rgba(255, 255, 255, 0.5) inset, -2px -2px 2px 0 rgba(234, 131, 12, 0.5) inset",
              },
            ]}
          >
            <Text className="leading-none" style={styles.rewardBadgeText}>
              {t("active.memberDay.cashReward")}
            </Text>
          </LinearGradient>
          <Text
            className="leading-none"
            style={[
              styles.mainTitle,
              isCompact && styles.mainTitleCompact,
              isExtraCompact && styles.mainTitleExtraCompact,
            ]}
          >
            {bannerTitleText}
          </Text>
          <Text
            className="leading-none"
            style={[
              styles.subTitle,
              isExtraCompact && styles.subTitleExtraCompact,
            ]}
          >
            {bannerSubtitleText}
          </Text>
        </View>
      </ImageBackground>
      <View style={styles.dateHeader}>
        <Text
          style={[styles.activityTitle, { color: Colors[theme].darkColor }]}
        >
          {t("pageName.memberDay")}
        </Text>
        <Text style={[styles.yearLabel, { color: Colors[theme].textGray }]}>
          2026
        </Text>
      </View>
      <MemberDayDateNavbar
        value={selectedDate}
        dates={dates}
        onValueChange={setSelectedDate}
      />
      <MemberDayCategoryNavbar
        value={selectedCategory}
        categories={categories}
        onValueChange={setSelectedCategory}
      />
      <MemberDayInteractive
        mode={activeMode}
        rewardType={selectedCategory}
        title={interactiveTitle}
        envelopes={envelopes}
        activityStatus={activityStatus}
        activityStartTime={activityStartTime}
        activityId={resolvedId}
        ruleId={selectedRule?.id}
        mockToday={params?.mockToday ? String(params.mockToday) : undefined}
        depositAmount={dailyStats.depositAmount}
        depositLoseAmount={dailyStats.depositLoseAmount}
        betLoseAmount={dailyStats.betLoseAmount}
        multRateLabel={multRateLabel}
        interactiveKey={interactiveKey}
        onClaimed={handleClaimed}
        onRedEnvelopeOpened={handleRedEnvelopeOpened}
      />
      <MemberDayInfo
        intro={activityIntro}
        ruleDesc={activityData?.ruleDesc}
        startTime={activityData?.startTime}
        endTime={dates.at(-1)?.value}
      />

      <AlertModal
        visible={dialogVisible}
        message={dialogConfig.message}
        confirmText={t("confirm", "确定")}
        showCancel={false}
        onConfirm={() => {
          dialogConfig.onConfirm?.();
          setDialogVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  activityTitle: {
    fontSize: rf(13),
    fontWeight: "600",
  },
  yearLabel: {
    fontSize: rf(13),
    fontWeight: "600",
  },
  bannerContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  bannerTextOverlay: {
    marginRight: 40,
    marginLeft: "auto",
    alignItems: "flex-end",
    gap: 4
  },
  bannerTextOverlayCompact: {
    marginRight: 32,
  },
  bannerTextOverlayExtraCompact: {
    marginRight: 24,
  },
  rewardBadge: {
    display: "flex",
    height: 20,
    lineHeight: 20,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 1,
    paddingHorizontal: 12,
  },
  rewardBadgeText: {
    color: "#fff",
    fontSize: rf(10),
    fontWeight: "500",
    paddingHorizontal: 12,
    textTransform: "uppercase",
    overflow: "hidden",
  },
  mainTitle: {
    color: "#fff",
    fontSize: rf(30),
    fontWeight: "500",
    marginBottom: 5,
    textAlign: "right",
  },
  mainTitleCompact: {
    fontSize: rf(28),
  },
  mainTitleExtraCompact: {
    fontSize: rf(26),
    marginBottom: 3,
  },
  subTitle: {
    color: "#fff",
    fontSize: rf(12),
    fontWeight: "500",
    textAlign: "right",
    letterSpacing: 2.52,
  },
  subTitleExtraCompact: {
    fontSize: rf(11),
    letterSpacing: 1.6,
  },
});
