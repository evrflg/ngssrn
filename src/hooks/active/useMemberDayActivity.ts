import { useCallback, useEffect, useMemo, useState } from "react";
import type { TFunction } from "i18next";
import { getActivityCenterList, getActDetail } from "@/api";
import { getStorage, setStorage } from "@/utils/storage";
import {
  type CalendarRuleRspVO,
  type DateNavItem,
  MODE_MAP,
  REWARD_TYPE_ORDER,
  buildDateRulesMap,
  computeVisibleDates,
  fmtDate,
  getValidRules,
  multRateLabelForRule,
  parseCalcConfig,
  toDate,
} from "@/components/active/memberDay/memberDayLogic";

const CLAIMED_STORAGE_KEY = "memberday-claimed";
const ENVELOPE_ID_STORAGE_KEY = "memberday-envelope-id";

export interface CategoryNavItem {
  label: string;
  value: string;
  icon: string;
  tag?: string;
  disabled: boolean;
}

export interface EnvelopeItem {
  id: string;
  amount: number;
  status: number;
}

function userQualifiesForVipPacket(
  rule: CalendarRuleRspVO,
  cfgMap: Map<number, Record<string, unknown> | null>,
  degreeId: string | undefined,
): boolean {
  const cfg = cfgMap.get(rule.id);
  const vipRanges = cfg?.vipRanges;
  if (!vipRanges || typeof vipRanges !== "object") return true;
  if (!degreeId) return false;
  return Object.prototype.hasOwnProperty.call(vipRanges, String(degreeId));
}

export function useMemberDayActivity(
  t: TFunction,
  locale: string,
  opts: {
    routeId?: string;
    mockToday?: string;
  },
  displayTimeZone?: string,
) {
  const [activityData, setActivityData] = useState<any | null>(null);
  const [resolvedId, setResolvedId] = useState(opts.routeId ?? "");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [persistedClaimAmount, setPersistedClaimAmount] = useState<
    number | undefined
  >(undefined);
  const [persistedEnvelopeId, setPersistedEnvelopeId] = useState<string | null>(
    null,
  );

  const serverTodayFromStats = useMemo(() => {
    const statDate = activityData?.optional?.memberDailyStats?.statDate as
      | unknown
      | undefined;
    if (!Array.isArray(statDate) || statDate.length < 3) return undefined;
    const [y, m, d] = statDate.map((v) => Number(v));
    if (![y, m, d].every(Number.isFinite)) return undefined;
    return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }, [activityData]);

  const todayStr = useMemo(
    () =>
      opts.mockToday && /^\d{4}-\d{2}-\d{2}$/.test(opts.mockToday)
        ? opts.mockToday
        : (serverTodayFromStats ?? fmtDate(new Date())),
    [opts.mockToday, serverTodayFromStats],
  );

  const activeRules = useMemo((): CalendarRuleRspVO[] => {
    const rules = (activityData?.memberDayRules ?? []) as CalendarRuleRspVO[];
    const current = rules.filter((r) => r.versionStatus === "CURRENT");
    const statDate = activityData?.optional?.memberDailyStats?.statDate as
      | number[]
      | undefined;
    return getValidRules(current, statDate);
  }, [activityData]);

  const parsedConfigs = useMemo(() => {
    const map = new Map<number, Record<string, unknown> | null>();
    for (const rule of activeRules) {
      map.set(rule.id, parseCalcConfig(rule.calcConfig));
    }
    return map;
  }, [activeRules]);

  const dailyStats = useMemo(() => {
    const stats = activityData?.optional?.memberDailyStats as
      | Record<string, unknown>
      | undefined;
    return {
      degreeId: stats?.degreeId as string | undefined,
      depositAmount: (stats?.depositAmount ?? 0) as number,
      depositLoseAmount: (stats?.depositLoseAmount ?? 0) as number,
      betLoseAmount: (stats?.betLoseAmount ?? 0) as number,
    };
  }, [activityData]);

  const allRewardTypes = useMemo((): string[] => {
    const inActivity = new Set<string>(activeRules.map((r) => r.rewardType));
    if (inActivity.has("VIP_PACKET")) {
      const vipRules = activeRules.filter((r) => r.rewardType === "VIP_PACKET");
      if (
        vipRules.length &&
        !vipRules.some((r) =>
          userQualifiesForVipPacket(r, parsedConfigs, dailyStats.degreeId),
        )
      ) {
        inActivity.delete("VIP_PACKET");
      }
    }
    const ordered = REWARD_TYPE_ORDER.filter((rt) =>
      inActivity.has(rt),
    ) as string[];
    for (const rt of inActivity) {
      if (!ordered.includes(rt)) ordered.push(rt);
    }
    const vipIdx = ordered.indexOf("VIP_PACKET");
    if (vipIdx > 1) {
      ordered.splice(vipIdx, 1);
      ordered.splice(1, 0, "VIP_PACKET");
    }
    return ordered;
  }, [activeRules, dailyStats.degreeId, parsedConfigs]);

  const dateRulesMap = useMemo(() => {
    if (!activeRules.length || !activityData)
      return new Map<string, CalendarRuleRspVO[]>();
    const actStart = toDate(activityData.startTime);
    const actEnd = toDate(activityData.endTime);
    return buildDateRulesMap(activeRules, actStart, actEnd);
  }, [activeRules, activityData]);

  const dates = useMemo(
    () =>
      computeVisibleDates(
        dateRulesMap,
        todayStr,
        t("bonusTask.inProgress"),
        locale,
        displayTimeZone,
      ),
    [dateRulesMap, todayStr, t, locale, displayTimeZone],
  );

  useEffect(() => {
    if (!dates.length) return;
    if (selectedDate && dates.some((d) => d.value === selectedDate)) return;
    setSelectedDate(
      dates.find((d) => d.value === todayStr)?.value ??
        dates.find((d) => d.value >= todayStr)?.value ??
        dates[0].value,
    );
  }, [dates, todayStr, selectedDate]);

  const rulesForSelectedDate = useMemo((): CalendarRuleRspVO[] => {
    if (!selectedDate) return [];
    return dateRulesMap.get(selectedDate) ?? [];
  }, [selectedDate, dateRulesMap]);

  const nextDateForSelectedCategory = useMemo(() => {
    const rt = selectedCategory;
    if (!rt || !selectedDate) return undefined;

    const inVisibleWindow = dates.find(
      (d) =>
        d.value >= selectedDate &&
        (dateRulesMap.get(d.value) ?? []).some((r) => r.rewardType === rt),
    )?.value;
    if (inVisibleWindow) return inVisibleWindow;

    const start = selectedDate;
    const end = new Date(toDate(start));
    end.setDate(end.getDate() + 31);
    const endStr = fmtDate(end);

    const inThirtyOneDays = [...dateRulesMap.keys()]
      .sort()
      .find(
        (dateStr) =>
          dateStr >= start &&
          dateStr <= endStr &&
          (dateRulesMap.get(dateStr) ?? []).some((r) => r.rewardType === rt),
      );
    return inThirtyOneDays ?? selectedDate;
  }, [selectedCategory, selectedDate, dates, dateRulesMap]);

  const rewardTypeLabel = useCallback(
    (rt: string) => {
      const map: Record<string, string> = {
        RECHARGE: t("active.memberDay.rechargeGift"),
        VIP_PACKET: t("active.memberDay.levelEnvelope"),
        RECHARGE_LOSS: t("active.memberDay.rechargeSubsidy"),
        BET_LOSS: t("active.memberDay.bettingSubsidy"),
      };
      return map[rt] ?? rt;
    },
    [t],
  );

  const categories = useMemo((): CategoryNavItem[] => {
    return allRewardTypes.map((rt) => {
      const rule = rulesForSelectedDate.find((r) => r.rewardType === rt);
      let tag: string | undefined;
      if (rule && (rule as { calcType?: string }).calcType === "VIP_RANGE") {
        const cfg = parsedConfigs.get(rule.id);
        const vr = cfg?.vipRanges as
          | Record<string, { max?: string }>
          | undefined;
        if (vr) {
          const maxVal = Math.max(
            ...Object.values(vr).map((v) => parseFloat(v?.max ?? "") || 0),
          );
          if (maxVal > 0) tag = `Max ${maxVal}`;
        }
      }
      return {
        label: rewardTypeLabel(rt),
        value: rt,
        icon: "",
        disabled: false,
        tag,
      };
    });
  }, [allRewardTypes, rulesForSelectedDate, parsedConfigs, rewardTypeLabel]);

  useEffect(() => {
    if (!categories.length) return;
    setSelectedCategory((prev) => {
      const hasRuleOnDate = (rt: string) =>
        rulesForSelectedDate.some((r) => r.rewardType === rt);
      const currentValid = categories.some((c) => c.value === prev);
      if (!currentValid || !hasRuleOnDate(prev)) {
        return (
          categories.find((c) => hasRuleOnDate(c.value))?.value ??
          categories[0].value
        );
      }
      return prev;
    });
  }, [selectedDate, categories, rulesForSelectedDate]);

  const selectedRule = useMemo(
    (): CalendarRuleRspVO | undefined =>
      rulesForSelectedDate.find((r) => r.rewardType === selectedCategory),
    [rulesForSelectedDate, selectedCategory],
  );

  const activeMode = useMemo(
    (): "pot" | "redEnvelope" | "treasureBox" =>
      MODE_MAP[selectedCategory] ?? "treasureBox",
    [selectedCategory],
  );

  const multRateLabel = useMemo(() => {
    return multRateLabelForRule(
      activeMode,
      selectedRule,
      selectedRule ? (parsedConfigs.get(selectedRule.id) ?? null) : null,
    );
  }, [activeMode, selectedRule, parsedConfigs]);

  const claimedInfo = useMemo(() => {
    const opt = activityData?.optional as Record<string, unknown> | undefined;
    const ids: string[] = [];
    const types = new Set<string>();
    let claimedAmount: number | undefined;
    const rule = selectedRule;
    const claimed = opt?.claimed;
    if (Array.isArray(claimed)) {
      for (const item of claimed as Array<Record<string, unknown>>) {
        const rid = String(item?.ruleId ?? "");
        if (rid) ids.push(rid);
        const rt = item?.rewardType as string;
        if (rt) types.add(rt);
        if (
          rule &&
          (rid === String(rule.id) || rt === selectedCategory) &&
          claimedAmount == null
        ) {
          const amt = item?.amount ?? item?.rewardAmount ?? item?.claimAmount;
          const n =
            typeof amt === "number"
              ? amt
              : typeof amt === "string"
                ? Number(amt)
                : NaN;
          if (Number.isFinite(n)) claimedAmount = n;
        }
      }
    }
    return { ids, types, claimedAmount };
  }, [activityData, selectedRule, selectedCategory]);

  const activityStatus = useMemo(():
    | "open"
    | "notStarted"
    | "ended"
    | "claimed" => {
    if (!selectedDate) return "notStarted";
    const today = todayStr;
    if (!selectedRule) {
      if (selectedDate < today) return "ended";
      if (selectedDate > today) return "notStarted";
      const hasPastDate = selectedCategory
        ? [...dateRulesMap.keys()].some(
            (d) =>
              d < today &&
              (dateRulesMap.get(d) ?? []).some(
                (r) => r.rewardType === selectedCategory,
              ),
          )
        : false;
      return hasPastDate ? "ended" : "notStarted";
    }
    const { ids, types } = claimedInfo;
    if (ids.includes(String(selectedRule.id))) return "claimed";
    if (selectedCategory && types.has(selectedCategory)) return "claimed";
    if (selectedDate === today) return "open";
    return selectedDate < today ? "ended" : "notStarted";
  }, [
    selectedDate,
    selectedRule,
    todayStr,
    selectedCategory,
    dateRulesMap,
    claimedInfo,
  ]);

  const activityStartTime = useMemo(
    () =>
      selectedRule
        ? selectedDate
        : (nextDateForSelectedCategory ?? selectedDate),
    [selectedRule, selectedDate, nextDateForSelectedCategory],
  );

  const interactiveTitle = useMemo(() => {
    const titles: Record<string, string> = {
      treasureBox: t("active.memberDay.openTreasure"),
      redEnvelope: t("active.memberDay.pickEnvelope"),
    };
    return titles[activeMode] ?? t("active.memberDay.claimReward");
  }, [activeMode, t]);

  const interactiveKey = `${selectedDate}-${selectedCategory}-${selectedRule?.id ?? ""}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!resolvedId || selectedRule?.id == null || !selectedDate) {
        setPersistedClaimAmount(undefined);
        setPersistedEnvelopeId(null);
        return;
      }
      const claimedKey = `${CLAIMED_STORAGE_KEY}-${resolvedId}-${selectedRule.id}-${selectedDate}`;
      const envKey = `${ENVELOPE_ID_STORAGE_KEY}-${resolvedId}-${selectedRule.id}-${selectedDate}`;
      const [a, e] = await Promise.all([
        getStorage(claimedKey),
        getStorage(envKey),
      ]);
      if (cancelled) return;
      if (a != null) {
        const n = Number(a);
        setPersistedClaimAmount(Number.isFinite(n) ? n : undefined);
      } else {
        setPersistedClaimAmount(undefined);
      }
      setPersistedEnvelopeId(e);
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedId, selectedRule?.id, selectedDate, interactiveKey]);

  const envelopes = useMemo((): EnvelopeItem[] => {
    const base: EnvelopeItem[] = [
      { id: "1", amount: 0, status: 1 },
      { id: "2", amount: 0, status: 1 },
      { id: "3", amount: 0, status: 1 },
    ];
    if (activeMode !== "redEnvelope" || activityStatus !== "claimed") {
      return base;
    }
    const amount = claimedInfo.claimedAmount ?? persistedClaimAmount;
    const openedId = persistedEnvelopeId ?? "1";
    const targetIndex = base.findIndex((e) => e.id === openedId);
    const index = targetIndex >= 0 ? targetIndex : 0;
    const next = [...base];
    next[index] = { ...next[index], amount: amount ?? 0, status: 2 };
    return next;
  }, [
    activeMode,
    activityStatus,
    claimedInfo.claimedAmount,
    persistedClaimAmount,
    persistedEnvelopeId,
  ]);

  const activityIntro = useMemo(
    () => activityData?.introductionDetail || activityData?.introduction || "",
    [activityData],
  );

  const loadActivity = useCallback(async (id: string) => {
    const resp = await getActDetail({ id });
    if (resp?.data?.data) setActivityData(resp.data.data);
  }, []);

  const reloadActivity = useCallback(async () => {
    if (!resolvedId) return;
    try {
      await loadActivity(resolvedId);
    } catch {
      /* keep */
    }
  }, [resolvedId, loadActivity]);

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
              item.memberDayRules?.length || item.activityType === 10,
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

  const setStoredClaimedAmount = useCallback(
    async (amount: number) => {
      if (!resolvedId || selectedRule?.id == null || !selectedDate) return;
      const key = `${CLAIMED_STORAGE_KEY}-${resolvedId}-${selectedRule.id}-${selectedDate}`;
      await setStorage(key, String(amount));
      setPersistedClaimAmount(amount);
    },
    [resolvedId, selectedRule?.id, selectedDate],
  );

  const setStoredEnvelopeId = useCallback(
    async (envelopeId: string) => {
      if (!resolvedId || selectedRule?.id == null || !selectedDate) return;
      const key = `${ENVELOPE_ID_STORAGE_KEY}-${resolvedId}-${selectedRule.id}-${selectedDate}`;
      await setStorage(key, envelopeId);
      setPersistedEnvelopeId(envelopeId);
    },
    [resolvedId, selectedRule?.id, selectedDate],
  );

  const handleClaimed = useCallback(
    async (amount?: number) => {
      if (
        amount != null &&
        Number.isFinite(amount) &&
        resolvedId &&
        selectedRule &&
        selectedDate
      ) {
        await setStoredClaimedAmount(amount);
      }
      await reloadActivity();
    },
    [
      resolvedId,
      selectedRule,
      selectedDate,
      setStoredClaimedAmount,
      reloadActivity,
    ],
  );

  const handleRedEnvelopeOpened = useCallback(
    async (id: string) => {
      await setStoredEnvelopeId(id);
    },
    [setStoredEnvelopeId],
  );

  return {
    activityData,
    resolvedId,
    loading,
    todayStr,
    dates,
    selectedDate,
    setSelectedDate,
    categories,
    selectedCategory,
    setSelectedCategory,
    activeMode,
    selectedRule,
    multRateLabel,
    activityStatus,
    activityStartTime,
    interactiveTitle,
    envelopes,
    dailyStats,
    interactiveKey,
    activityIntro,
    handleClaimed,
    handleRedEnvelopeOpened,
    reloadActivity,
  };
}
