/** Ported from ngss-vue memberDay/index.vue — pure helpers (no React). */

export type CalendarRuleRspVO = {
  id: number;
  dayType: "FIXED_DATE" | "MONTH_DAY" | "WEEK_DAY" | string;
  dayValue: string;
  rewardType: string;
  versionStatus?: string;
  calcType?: string;
  calcConfig?: string;
};

export const DOW_MAP: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export const DAY_TYPE_PRIORITY: Record<string, number> = {
  FIXED_DATE: 3,
  MONTH_DAY: 2,
  WEEK_DAY: 1,
};

export const REWARD_TYPE_ORDER = [
  "RECHARGE",
  "VIP_PACKET",
  "RECHARGE_LOSS",
  "BET_LOSS",
] as const;

export const MODE_MAP: Record<string, "pot" | "redEnvelope" | "treasureBox"> = {
  RECHARGE: "pot",
  VIP_PACKET: "redEnvelope",
};

export function toDate(v: unknown): Date {
  if (typeof v === "number") return new Date(v);
  if (typeof v === "string") {
    const n = Number(v);
    return !isNaN(n) && n > 1e12 ? new Date(n) : new Date(v);
  }
  return new Date();
}

export function fmtDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function formatDateLabel(
  dateStr: string,
  locale: string,
  timeZone?: string,
): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const anchor = new Date(Date.UTC(y, m - 1, d, 12));
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  if (timeZone) options.timeZone = timeZone;
  return new Intl.DateTimeFormat(locale, options).format(anchor);
}

export function parseCalcConfig(
  raw: string | undefined,
): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function ruleMatchesDate(
  rule: CalendarRuleRspVO,
  dateStr: string,
): boolean {
  if (rule.dayType === "FIXED_DATE") return rule.dayValue === dateStr;
  const d = new Date(dateStr);
  if (rule.dayType === "MONTH_DAY")
    return d.getDate() === parseInt(rule.dayValue, 10);
  if (rule.dayType === "WEEK_DAY") return d.getDay() === DOW_MAP[rule.dayValue];
  return false;
}

export function datesForRule(
  rule: CalendarRuleRspVO,
  start: Date,
  end: Date,
): string[] {
  const out: string[] = [];
  if (rule.dayType === "FIXED_DATE") {
    const dateStr = rule.dayValue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return out;
    const startStr = fmtDate(start);
    const endStr = fmtDate(end);
    if (dateStr >= startStr && dateStr <= endStr) out.push(dateStr);
  } else if (rule.dayType === "MONTH_DAY") {
    const target = parseInt(rule.dayValue, 10);
    if (isNaN(target)) return out;
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur <= end && out.length < 18) {
      const maxDay = new Date(
        cur.getFullYear(),
        cur.getMonth() + 1,
        0,
      ).getDate();
      if (target <= maxDay) {
        const candidate = new Date(cur.getFullYear(), cur.getMonth(), target);
        if (candidate >= start && candidate <= end)
          out.push(fmtDate(candidate));
      }
      cur.setMonth(cur.getMonth() + 1);
    }
  } else if (rule.dayType === "WEEK_DAY") {
    const target = DOW_MAP[rule.dayValue];
    if (target === undefined) return out;
    const cur = new Date(start);
    while (cur.getDay() !== target) cur.setDate(cur.getDate() + 1);
    while (cur <= end && out.length < 18) {
      out.push(fmtDate(cur));
      cur.setDate(cur.getDate() + 7);
    }
  }
  return out;
}

export function isFixedDateExpired(
  dayValue: string,
  statDate: number[] | undefined,
): boolean {
  const [y1, m1, d1] = dayValue.split("-").map(Number);
  const targetDate = new Date(y1, m1 - 1, d1).setHours(0, 0, 0, 0);
  let compareDate: number;
  if (statDate?.[0] != null && statDate?.[1] != null && statDate?.[2] != null) {
    const [y2, m2, d2] = statDate;
    compareDate = new Date(y2, m2 - 1, d2).setHours(0, 0, 0, 0);
  } else {
    compareDate = new Date().setHours(0, 0, 0, 0);
  }
  return compareDate > targetDate;
}

export function getValidRules(
  rules: CalendarRuleRspVO[],
  statDate: number[] | undefined,
): CalendarRuleRspVO[] {
  return rules.filter((rule) => {
    if (rule.dayType !== "FIXED_DATE") return true;
    return !isFixedDateExpired(rule.dayValue, statDate);
  });
}

export function parseClaimAmount(data: unknown): number | null {
  if (typeof data === "number" && Number.isFinite(data)) return data;
  if (typeof data === "string") {
    const n = Number(data);
    return Number.isFinite(n) ? n : null;
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.amount === "number" && Number.isFinite(obj.amount))
      return obj.amount;
    if (typeof obj.amount === "string") {
      const n = Number(obj.amount);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export function buildDateRulesMap(
  activeRules: CalendarRuleRspVO[],
  activityStart: Date,
  activityEnd: Date,
): Map<string, CalendarRuleRspVO[]> {
  const map = new Map<string, CalendarRuleRspVO[]>();
  if (!activeRules.length) return map;

  const allDates = new Set<string>();
  for (const rule of activeRules) {
    for (const d of datesForRule(rule, activityStart, activityEnd))
      allDates.add(d);
  }

  for (const dateStr of allDates) {
    const rules = activeRules
      .filter((r) => ruleMatchesDate(r, dateStr))
      .sort(
        (a, b) =>
          (DAY_TYPE_PRIORITY[b.dayType] ?? 0) -
          (DAY_TYPE_PRIORITY[a.dayType] ?? 0),
      );
    map.set(dateStr, rules);
  }
  return map;
}

export type DateNavItem = { label: string; value: string; badge?: string };

export function computeVisibleDates(
  dateRulesMap: Map<string, CalendarRuleRspVO[]>,
  todayStr: string,
  inProgressLabel: string,
  locale: string,
  timeZone?: string,
): DateNavItem[] {
  if (!dateRulesMap.size) return [];
  const allFutureOrToday = [...dateRulesMap.keys()]
    .sort()
    .filter((d) => d >= todayStr);
  if (!allFutureOrToday.length) return [];
  const startIdx = allFutureOrToday.findIndex((d) => d >= todayStr);
  const start = startIdx >= 0 ? startIdx : 0;
  const visible = allFutureOrToday.slice(start, start + 5);
  return visible.map((d) => ({
    label: formatDateLabel(d, locale, timeZone),
    value: d,
    badge: d === todayStr ? inProgressLabel : undefined,
  }));
}

/** 与 ngss-vue memberDay isMemberDayToday 一致：在活动有效期内且今日命中任一 CURRENT 规则 */
export function isMemberDayActiveToday(
  act: {
    startTime?: unknown;
    endTime?: unknown;
    memberDayRules?: unknown;
  } | null,
  detail: { memberDayRules?: unknown } | null,
): boolean {
  if (!act) return false;

  const now = Date.now();
  const start =
    typeof act.startTime === "number" ? act.startTime : Number(act.startTime);
  const end =
    typeof act.endTime === "number" ? act.endTime : Number(act.endTime);

  if (isNaN(start) || isNaN(end)) return false;
  if (now < start || now > end) return false;

  const listRules = Array.isArray(act.memberDayRules) ? act.memberDayRules : [];
  const detailRules =
    detail && Array.isArray(detail.memberDayRules) ? detail.memberDayRules : [];
  const rules: CalendarRuleRspVO[] = (
    listRules.length > 0 ? listRules : detailRules
  ) as CalendarRuleRspVO[];

  if (!rules.length) return false;

  const todayStr = fmtDate(new Date());
  return rules
    .filter((r) => !r.versionStatus || r.versionStatus === "CURRENT")
    .some((r) => ruleMatchesDate(r, todayStr));
}

export function multRateLabelForRule(
  mode: "pot" | "redEnvelope" | "treasureBox",
  rule: CalendarRuleRspVO | undefined,
  parsedConfig: Record<string, unknown> | null,
): string {
  const r = rule as { calcType?: string } | undefined;
  if (!r || r.calcType !== "PERCENT") return "";
  const rate = Number(parsedConfig?.rate);
  if (!Number.isFinite(rate)) return "";
  if (mode === "pot") {
    const multiplier = 1 + rate / 100;
    const display = Number(multiplier.toFixed(2)).toString();
    return `x${display}`;
  }
  const percent = Number(rate.toFixed(2)).toString();
  return `${percent}%`;
}
