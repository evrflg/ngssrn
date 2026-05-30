import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Colors } from "@/constants/Colors";
import { rf } from "@/utils/scaleFont";
import Svg, { Circle, Path } from "react-native-svg";

const DAY_ICON_IMAGES: Record<number, any> = {
  2: require("@/assets/images/active/specialBonus/two.png"),
  3: require("@/assets/images/active/specialBonus/three.png"),
  7: require("@/assets/images/active/specialBonus/seven.png"),
  15: require("@/assets/images/active/specialBonus/fifteen.png"),
  30: require("@/assets/images/active/specialBonus/thirty.png"),
};

function TierCheckIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Circle cx={8} cy={8} r={8} fill={color} fillOpacity={0.15} />
      <Path
        d="M4.5 8L7 10.5L11.5 5.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MilestoneDayIcon({ iconKey }: { iconKey: number }) {
  return (
    <Image
      source={DAY_ICON_IMAGES[iconKey] ?? DAY_ICON_IMAGES[2]}
      style={styles.milestoneIconWrap}
      resizeMode="contain"
    />
  );
}

type Props = {
  milestones: any[];
  selectedMilestoneIndex: number;
  setSelectedMilestoneIndex: (index: number) => void;
  selectedMilestone: any;
  selectedSlotIndex: number;
  selectedSlots: any[];
  selectedSlot: any;
  currentRechargeAmount: number;
  shouldShowTierCheck: boolean;
  rewardTable: any[];
  claiming: boolean;
  onClaim: () => void;
  prevSlot: () => void;
  nextSlot: () => void;
};

export default function SpecialBonusMilestoneCard({
  milestones,
  selectedMilestoneIndex,
  setSelectedMilestoneIndex,
  selectedMilestone,
  selectedSlotIndex,
  selectedSlots,
  selectedSlot,
  currentRechargeAmount,
  shouldShowTierCheck,
  rewardTable,
  claiming,
  onClaim,
  prevSlot,
  nextSlot,
}: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const pal = Colors[theme];
  const primary = pal.primary;
  const cardBg = pal.cardBg1;
  const claimStatus = selectedMilestone?.claimStatus;
  const arrowXPercent = useMemo(() => {
    const n = milestones.length || 1;
    const i = selectedMilestoneIndex;
    return ((i * 2 + 1) / (n * 2)) * 100;
  }, [milestones.length, selectedMilestoneIndex]);

  if (milestones.length === 0) return null;

  return (
    <View
      style={[
        styles.interactionCard,
        {
          backgroundColor: Colors[theme].secondaryBg,
          borderColor: primary,
        },
      ]}
    >
      <LinearGradient
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        colors={[pal.myCenter2BtnEnd, pal.myCenter2BtnStart]}
        style={styles.cardGradient}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.milestoneRow}
        >
          {milestones.map((m, index) => {
            const selected = selectedMilestoneIndex === index;
            return (
              <Pressable
                key={`${m.dayNo}-${index}`}
                onPress={() => setSelectedMilestoneIndex(index)}
                style={[styles.milestoneItem, selected && { opacity: 1 }]}
              >
                <MilestoneDayIcon iconKey={m.iconKey} />
                <Text
                  numberOfLines={2}
                  style={[styles.milestoneLabel, { color: Colors[theme].text }]}
                >
                  {m.label}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    m.claimStatus === "CLAIMED" && {
                      backgroundColor: "#4caf50",
                    },
                    m.status === "FINISHED" &&
                      m.claimStatus !== "CLAIMED" && {
                        backgroundColor: primary,
                      },
                    m.claimStatus === "WAIT_CLAIM" && {
                      backgroundColor:
                        Colors[theme].loginButtonBgColor ?? primary,
                    },
                  ]}
                >
                  <Text style={styles.statusPillText} numberOfLines={2}>
                    {m.statusText}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <LinearGradient
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          colors={[pal.myCenter2BtnStart, pal.myCenter2BtnEnd]}
          style={[styles.rewardCard, { backgroundColor: cardBg }]}
        >
          {claimStatus === "CLAIMED" ? (
            <Text style={[styles.rechargeLine, { color: "#4caf50" }]}>
              {t("active.specialBonus.received")}
            </Text>
          ) : claimStatus === "WAIT_CLAIM" ? (
            <Pressable
              onPress={onClaim}
              disabled={claiming}
              style={styles.claimWrap}
            >
              <LinearGradient
                colors={[pal.gradientStart, pal.gradientEnd]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.claimBtn}
              >
                {claiming ? (
                  <ActivityIndicator color={pal.btnText} />
                ) : (
                  <Text style={[styles.joinText, { color: pal.btnText }]}>
                    {t("active.memberday.claimReward")}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          ) : currentRechargeAmount > 0 ? (
            <Text style={[styles.rechargeLine, { color: Colors[theme].text }]}>
              {t("active.specialBonus.rechargedAmount", {
                day: selectedMilestone?.dayNo ?? "",
              })}
              <Text style={{ color: primary, fontWeight: "700" }}>
                {" "}
                {currentRechargeAmount}
              </Text>
            </Text>
          ) : (
            <Text style={[styles.rechargeLine, { color: Colors[theme].text }]}>
              {t("active.specialBonus.rechargeAmount")}
              {selectedSlot?.rechargeMin != null ? (
                <Text style={{ color: primary, fontWeight: "700" }}>
                  {" "}
                  {selectedSlot.rechargeMin}
                </Text>
              ) : null}
            </Text>
          )}

          <View className="w-full" style={styles.progressRow}>
            {selectedSlots.map((slot: any, i: number) => (
              <View
                key={i}
                style={[
                  styles.progressSeg,
                  {
                    backgroundColor: Colors[theme].screenshotCloseIconBgColor,
                  },
                  currentRechargeAmount >= (slot.rechargeMin ?? 0) && {
                    backgroundColor: primary,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.tierRow}>
            {shouldShowTierCheck ? <TierCheckIcon color={primary} /> : null}
            <Text style={[styles.tierText, { color: Colors[theme].text }]}>
              {t("active.specialBonus.rewardGear")}
              <Text style={{ color: primary, fontWeight: "700" }}>
                {" "}
                {selectedSlotIndex + 1}
              </Text>
            </Text>
          </View>

          <View className="w-full" style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { color: Colors[theme].text }]}>
                {t("active.specialBonus.betMultiple")}
              </Text>
              <Text style={[styles.th, { color: Colors[theme].text }]}>
                {t("active.specialBonus.bonusRange")}
              </Text>
            </View>
            {rewardTable.map((row, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.td, { color: Colors[theme].text }]}>
                  {row.multiplier}
                </Text>
                <Text style={[styles.td, { color: Colors[theme].text }]}>
                  {row.range}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.navArrows}>
            <Pressable
              onPress={prevSlot}
              disabled={selectedSlotIndex === 0}
              style={styles.navHit}
            >
              <AntDesign
                name="left"
                size={rf(22)}
                color={Colors[theme].text}
                style={{ opacity: selectedSlotIndex === 0 ? 0.25 : 0.85 }}
              />
            </Pressable>
            <Pressable
              onPress={nextSlot}
              disabled={selectedSlotIndex >= selectedSlots.length - 1}
              style={styles.navHit}
            >
              <AntDesign
                name="right"
                size={rf(22)}
                color={Colors[theme].text}
                style={{
                  opacity:
                    selectedSlotIndex >= selectedSlots.length - 1 ? 0.25 : 0.85,
                }}
              />
            </Pressable>
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  interactionCard: {
    borderRadius: 12,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  cardGradient: {
    padding: 16,
    borderRadius: 12,
  },
  milestoneRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  milestoneItem: { width: 72, alignItems: "center", gap: 6 },
  milestoneIconWrap: { width: 40, height: 40 },
  milestoneLabel: {
    fontSize: rf(12),
    fontWeight: "500",
    textAlign: "center",
    minHeight: 32,
  },
  statusPill: {
    backgroundColor: "#8a8a8a",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    width: "100%",
    alignItems: "center",
  },
  statusPillText: {
    color: "#fff",
    fontSize: rf(10),
    textAlign: "center",
    lineHeight: rf(14),
  },
  rewardCard: {
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginTop: 10,
    position: "relative",
    alignItems: "center",
    gap: 16
  },
  rewardArrow: {
    position: "absolute",
    top: -10,
    width: 0,
    height: 0,
    marginLeft: -10,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  rechargeLine: {
    fontSize: rf(14),
    fontWeight: "700",
    textAlign: "center",
    width: "100%",
  },
  claimWrap: { width: "80%", marginBottom: 12 },
  claimBtn: {
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  joinText: { fontSize: rf(14), fontWeight: "700" },
  progressRow: {
    flexDirection: "row",
    gap: 6,
  },
  progressSeg: { flex: 1, height: 8, borderRadius: 4 },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tierText: { fontSize: rf(12) },
  table: { maxWidth: 280 },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
    marginBottom: 8,
  },
  th: { flex: 1, fontSize: rf(13), textAlign: "center", fontWeight: "600" },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  td: { flex: 1, fontSize: rf(13), textAlign: "center", fontWeight: "500" },
  navArrows: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    marginTop: -16,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    pointerEvents: "box-none",
  },
  navHit: { padding: 8, pointerEvents: "auto" },
});
