import { useCallback, useEffect, useMemo, useState } from "react";
import type { TFunction } from "i18next";
import {
  getActDetail,
  getActivityCenterList,
  joinAct,
  joinMysteryBonus,
} from "@/api";

export type MilestoneItem = {
  dayNo: number;
  label: string;
  iconKey: number;
  slots: any[];
  status?: string;
  statusText: string;
  claimStatus?: string;
  rechargeAmount: number;
};

type TimelineItem = {
  dayNo: number;
  status?: string;
  claimStatus?: string;
  rechargeAmount?: number;
  targetDate?: string;
  currentTier?: number | null;
};

const DAY_ICON_KEYS: Record<number, number> = {
  2: 2,
  3: 3,
  7: 7,
  15: 15,
  30: 30,
};

function toDateSafe(v: unknown): Date | null {
  if (v == null) return null;
  if (typeof v === "number") return new Date(v);
  if (typeof v === "string") {
    const n = Number(v);
    if (!Number.isNaN(n) && n > 1e12) return new Date(n);
    const normalized = v.replace(" ", "T");
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatTargetDate(
  td: string | undefined,
  locale: string,
  displayTimeZone: string | undefined,
): string {
  if (!td) return "";
  const formatLikeMemberDay = (
    year: number,
    month: number,
    day: number,
  ): string => {
    const anchor = new Date(Date.UTC(year, month - 1, day, 12));
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    if (displayTimeZone) options.timeZone = displayTimeZone;
    try {
      return new Intl.DateTimeFormat(locale || undefined, options).format(
        anchor,
      );
    } catch {
      return new Intl.DateTimeFormat(undefined, options).format(anchor);
    }
  };

  const ymd = td.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T].*)?$/);
  if (ymd) {
    return formatLikeMemberDay(Number(ymd[1]), Number(ymd[2]), Number(ymd[3]));
  }
  const mPrefixed = td.match(/^M(\d+)-(\d+)$/);
  if (mPrefixed) {
    return formatLikeMemberDay(
      new Date().getFullYear(),
      Number(mPrefixed[1]),
      Number(mPrefixed[2]),
    );
  }
  const mmdd = td.match(/^(\d+)-(\d+)$/);
  if (mmdd) {
    return formatLikeMemberDay(
      new Date().getFullYear(),
      Number(mmdd[1]),
      Number(mmdd[2]),
    );
  }
  return td;
}

export function useSpecialBonusActivity(
  t: TFunction,
  locale: string,
  opts: { routeId?: string },
  displayTimeZone?: string,
) {
  const [activityData, setActivityData] = useState<any | null>(null);
  const [resolvedId, setResolvedId] = useState(opts.routeId ?? "");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(0);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  const formatDateTime = useCallback(
    (v: unknown): string => {
      const d = toDateSafe(v);
      if (!d) return v == null ? "" : String(v).replace("T", " ").slice(0, 19);
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      if (displayTimeZone) options.timeZone = displayTimeZone;
      try {
        return new Intl.DateTimeFormat("sv-SE", options)
          .format(d)
          .replace("T", " ");
      } catch {
        return new Intl.DateTimeFormat(undefined, options)
          .format(d)
          .replace("T", " ");
      }
    },
    [displayTimeZone],
  );

  const formatMonthDay = useCallback(
    (v: unknown): string => {
      const d = toDateSafe(v);
      if (!d) return "";
      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
      };
      if (displayTimeZone) options.timeZone = displayTimeZone;
      try {
        return new Intl.DateTimeFormat(locale || undefined, options).format(d);
      } catch {
        return new Intl.DateTimeFormat(undefined, options).format(d);
      }
    },
    [displayTimeZone, locale],
  );

  const milestones = useMemo((): MilestoneItem[] => {
    const data = activityData;
    if (!data?.mysteryBonusData?.length) return [];

    const joined = data.mysteryBonusInfo?.joined ?? false;
    const currentDay = data.mysteryBonusInfo?.currentDay ?? 0;
    const timelineList = (data.mysteryBonusInfo?.timeline ??
      []) as TimelineItem[];
    const timelineMap = new Map<number, TimelineItem>();
    timelineList.forEach((item) => timelineMap.set(item.dayNo, item));

    return data.mysteryBonusData.map((day: any) => {
      const tl = timelineMap.get(day.dayNo);
      let statusText = t("status.unfinished");
      if (tl?.claimStatus === "CLAIMED") {
        statusText = t("status.claim.claimed");
      } else if (tl?.status === "FINISHED") {
        statusText = t("status.completed");
      }

      let label: string;
      if (!joined) {
        label = t("active.specialBonus.dayLabel", { day: day.dayNo });
      } else if (currentDay > day.dayNo) {
        label = t("active.specialBonus.ended");
      } else {
        label = formatTargetDate(tl?.targetDate, locale, displayTimeZone);
      }

      return {
        dayNo: day.dayNo,
        label,
        // Keep parity with Vue icon mapping and default to "2" icon.
        iconKey: DAY_ICON_KEYS[day.dayNo] ?? 2,
        slots: day.slots ?? [],
        status: tl?.status,
        claimStatus: tl?.claimStatus,
        statusText,
        rechargeAmount: tl?.rechargeAmount ?? 0,
      };
    });
  }, [activityData, t, locale, displayTimeZone]);

  const selectedMilestone = milestones[selectedMilestoneIndex];
  const selectedSlots = selectedMilestone?.slots ?? [];
  const selectedSlot = selectedSlots[selectedSlotIndex];

  const currentRechargeAmount = selectedMilestone?.rechargeAmount ?? 0;

  const currentTimeline = useMemo((): TimelineItem | undefined => {
    const dayNo = selectedMilestone?.dayNo;
    if (dayNo == null) return undefined;
    const list = (activityData?.mysteryBonusInfo?.timeline ??
      []) as TimelineItem[];
    return list.find((x) => x.dayNo === dayNo);
  }, [activityData, selectedMilestone?.dayNo]);

  const shouldShowTierCheck = useMemo(() => {
    const tl = currentTimeline;
    if (!tl || tl.status !== "FINISHED" || tl.currentTier == null) return false;
    return selectedSlotIndex < Number(tl.currentTier);
  }, [currentTimeline, selectedSlotIndex]);

  const rewardTable = useMemo(
    () =>
      (selectedSlot?.rules ?? []).map((r: any) => ({
        multiplier: String(r.betMultipleMin ?? ""),
        range: `${r.rewardMin}~${r.rewardMax}`,
      })),
    [selectedSlot],
  );

  const hasJoined = activityData?.mysteryBonusInfo?.joined ?? false;
  const joinTime = activityData?.mysteryBonusInfo?.roundStartTime;

  const activityTimeText = useMemo(() => {
    if (!activityData) return "";
    return `${formatDateTime(activityData.startTime)} -- ${formatDateTime(activityData.endTime)}`;
  }, [activityData, formatDateTime]);

  const introHtml =
    activityData?.introductionDetail || activityData?.introduction || "";
  const ruleHtml = activityData?.ruleDesc ?? "";

  const joinButtonText = useMemo(() => {
    if (!hasJoined) return t("active.specialBonus.participate");
    return `${formatMonthDay(joinTime ?? Date.now())} ${t("active.specialBonus.participated")}`;
  }, [hasJoined, joinTime, formatMonthDay, t]);

  const loadActivity = useCallback(async (id: string) => {
    const resp = await getActDetail({ id });
    if (resp?.data?.data) setActivityData(resp.data.data);
  }, []);

  const reloadActivity = useCallback(async () => {
    if (!resolvedId) return;
    await loadActivity(resolvedId);
  }, [resolvedId, loadActivity]);

  useEffect(() => {
    setSelectedSlotIndex(0);
  }, [selectedMilestoneIndex]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let id = opts.routeId ?? "";
        if (!id) {
          const listResp = await getActivityCenterList();
          const list = (listResp?.data?.data ?? []) as any[];
          const match = list.find(
            (item: any) =>
              item.mysteryBonusData != null || item.activityType === 11,
          );
          if (match) id = String(match.id);
        }
        if (cancelled) return;
        if (!id) {
          setResolvedId("");
          setActivityData(null);
          return;
        }
        setResolvedId(id);
        const resp = await getActDetail({ id });
        if (cancelled) return;
        if (resp?.data?.data) setActivityData(resp.data.data);
      } catch {
        if (!cancelled) setActivityData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [opts.routeId]);

  const handleJoin = useCallback(async (): Promise<boolean> => {
    if (!resolvedId || joining || hasJoined) return false;
    setJoining(true);
    try {
      const resp = await joinMysteryBonus({
        activityId: Number(resolvedId) || resolvedId,
      });
      if (resp?.data?.code === 0) {
        await reloadActivity();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setJoining(false);
    }
  }, [resolvedId, joining, hasJoined, reloadActivity]);

  const handleClaim = useCallback(async (): Promise<boolean> => {
    if (!resolvedId || claiming) return false;
    const dayNo = selectedMilestone?.dayNo;
    setClaiming(true);
    try {
      const res = await joinAct({
        activityId: resolvedId,
        treasureId: String(dayNo ?? ""),
      });
      if (res.data?.code === 0) {
        await reloadActivity();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setClaiming(false);
    }
  }, [resolvedId, claiming, selectedMilestone?.dayNo, reloadActivity]);

  const prevSlot = useCallback(() => {
    setSelectedSlotIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const nextSlot = useCallback(() => {
    setSelectedSlotIndex((i) => (i < selectedSlots.length - 1 ? i + 1 : i));
  }, [selectedSlots.length]);

  return {
    activityData,
    loading,
    resolvedId,
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
    reloadActivity,
  };
}
