import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

export type UnavailableReason =
  | "notStarted"
  | "ended"
  | "claimed"
  | "notEligible";

type Props = {
  unavailable: boolean;
  reason?: UnavailableReason;
  startTime?: string;
  endTime?: string;
};

export default function MemberDayActivityUnavailable({
  unavailable,
  reason = "notStarted",
  startTime = "",
  endTime = "",
}: Props) {
  const { t } = useTranslation();

  const { label, value } = useMemo(() => {
    const map: Record<UnavailableReason, string> = {
      notStarted: t("active.memberDay.activityStartTime"),
      ended: t("active.memberDay.activityEnded"),
      claimed: t("active.memberDay.rewardClaimed"),
      notEligible: t("active.memberDay.notEligible"),
    };
    const lbl = map[reason] ?? t("active.memberDay.unavailable");
    let val = "";
    if (reason === "notStarted" && startTime) val = startTime;
    if (reason === "ended" && endTime) val = endTime;
    return { label: lbl, value: val };
  }, [reason, startTime, endTime, t]);

  if (!unavailable) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto" className="backdrop-blur-sm">
      <View style={styles.message}>
        <Text style={styles.label}>{label}</Text>
        {!!value && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{value}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  message: {
    alignItems: "center",
    gap: 10,
  },
  label: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#c8a96e",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  pillText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4781ff",
  },
});
