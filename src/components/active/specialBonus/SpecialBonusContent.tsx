import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  ImageBackground,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useCommon } from "@/hooks/CommonProvider";
import { useSpecialBonusActivity } from "@/hooks/active/useSpecialBonusActivity";
import { useToast } from "@/components/common/toast";
import { rf } from "@/utils/scaleFont";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { stationConfig } from "@/store/tenant/tenantSlice";
import ActTime from "@/components/icons/active/ActTime";
import ActContent from "@/components/icons/active/ActContent";
import SpecialBonusInfo from "./SpecialBonusInfo";
import SpecialBonusMilestoneCard from "./SpecialBonusMilestoneCard";

type Props = {
  idProp?: string;
};

export default function SpecialBonusContent({ idProp }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { language } = useCommon();
  const toast = useToast();
  const params = useLocalSearchParams<{ id?: string }>();
  const siteCfg = useSelector(stationConfig);
  const { width: windowWidth } = useWindowDimensions();
  const { maxWidth } = useMaxWidth();

  const displayTimeZone = siteCfg?.isBn102 ? "Asia/Dhaka" : undefined;
  const routeId = idProp
    ? String(idProp)
    : params?.id
      ? String(params.id)
      : undefined;

  const hook = useSpecialBonusActivity(
    t,
    language || "en-US",
    { routeId },
    displayTimeZone,
  );

  const {
    activityData,
    loading,
    milestones,
    selectedMilestoneIndex,
    setSelectedMilestoneIndex,
    selectedSlotIndex,
    selectedMilestone,
    selectedSlots,
    selectedSlot,
    currentRechargeAmount,
    shouldShowTierCheck,
    rewardTable,
    hasJoined,
    activityTimeText,
    introHtml,
    ruleHtml,
    joinButtonText,
    joining,
    claiming,
    handleJoin,
    handleClaim,
    prevSlot,
    nextSlot,
  } = hook;

  const contentWidth = useMemo(
    () => Math.min(windowWidth, maxWidth),
    [windowWidth, maxWidth],
  );

  const onJoin = useCallback(async () => {
    const ok = await handleJoin();
    if (ok) toast.success(t("common.success"));
    else if (!hasJoined) toast.warn(t("common.operationFailed"));
  }, [handleJoin, hasJoined, toast, t]);

  const onClaim = useCallback(async () => {
    const ok = await handleClaim();
    if (ok) toast.success(t("status.claim.claimSuccess"));
    else toast.warn(t("status.claim.claimFailed"));
  }, [handleClaim, toast, t]);

  const pal = Colors[theme];
  const cardBg = pal.cardBg1;
  const primary = pal.primary;

  if (loading && !activityData) {
    return (
      <View
        style={[styles.loader, { backgroundColor: Colors[theme].background }]}
      >
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: Colors[theme].background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#ffd370", "#f7ad00"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[{ width: contentWidth }]}
      >
        <ImageBackground
          source={require("@/assets/images/active/specialBonus/banner.png")}
          style={[styles.bannerImg, { width: contentWidth }]}
          resizeMode="cover"
        >
          <Image
            source={require("@/assets/images/active/specialBonus/moneybag.png")}
            style={{ width: 138, height: 138 }}
            resizeMode="contain"
          />
        </ImageBackground>
      </LinearGradient>
      <View className="p-4 gap-5">
        <View className="gap-3">
          <View style={styles.sectionHeaderRow}>
            <ActTime fill={primary} />
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              {t("active.specialBonus.activityTime")}
            </Text>
          </View>
          <View
            style={[
              styles.timeBox,
              { backgroundColor: Colors[theme].specialBonusTimeRangeBg },
            ]}
          >
            <Text style={[styles.timeText, { color: Colors[theme].darkColor }]}>
              {activityTimeText || "—"}
            </Text>
          </View>
        </View>

        <View className="gap-3">
          <View style={styles.sectionHeaderRow}>
            <ActContent fill={primary} />
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              {t("active.specialBonus.activities")}
            </Text>
          </View>
          <SpecialBonusInfo introHtml={introHtml} ruleHtml={ruleHtml} />
        </View>

        <Pressable
          onPress={onJoin}
          disabled={hasJoined || joining}
          style={({ pressed }) => [
            styles.joinOuter,
            (hasJoined || joining) && { opacity: 0.55 },
            pressed && !hasJoined && { opacity: 0.85 },
          ]}
        >
          <LinearGradient
            colors={[pal.tgBindGradientStart, pal.tgBindGradientEnd]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.joinGradient}
          >
            {joining ? (
              <ActivityIndicator color={pal.btnText} />
            ) : (
              <Text style={[styles.joinText, { color: pal.btnText }]}>
                {joinButtonText}
              </Text>
            )}
          </LinearGradient>
        </Pressable>

        <SpecialBonusMilestoneCard
          milestones={milestones}
          selectedMilestoneIndex={selectedMilestoneIndex}
          setSelectedMilestoneIndex={setSelectedMilestoneIndex}
          selectedMilestone={selectedMilestone}
          selectedSlotIndex={selectedSlotIndex}
          selectedSlots={selectedSlots}
          selectedSlot={selectedSlot}
          currentRechargeAmount={currentRechargeAmount}
          shouldShowTierCheck={shouldShowTierCheck}
          rewardTable={rewardTable}
          claiming={claiming}
          onClaim={onClaim}
          prevSlot={prevSlot}
          nextSlot={nextSlot}
        />
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32, alignItems: "stretch" },
  loader: {
    flex: 1,
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImg: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  moneybagCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.28)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.45)",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 4,
  },
  sectionTitle: { fontSize: rf(14), fontWeight: "600" },
  timeBox: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  timeText: { fontSize: rf(13), textAlign: "center" },
  joinOuter: {
    borderRadius: 24,
    overflow: "hidden",
  },
  joinGradient: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    paddingVertical: 12
  },
  joinText: { fontSize: rf(14), fontWeight: "700" },
});
