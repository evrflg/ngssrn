export type MineTimeStatus = "active" | "normal" | "disabled";

export interface AwardSchedule {
  dispatchHour: number;
  durationMinutes: number;
}

export interface MiningSchedule extends AwardSchedule {
  userDailyLimit?: number;
  claimedTimes?: number;
  awardLimitDisplay?: number | string;
}

export interface MiningTimeItem {
  key: string;
  startTime: string;
  endTime: string;
  isExpired: boolean;
  isInRange: boolean;
  userDailyLimit: number;
  claimedTimes: number;
  awardLimitDisplay: number | string;
}

export type CountdownMode = "in_progress" | "before_next";

export interface ScheduleCountdownResult {
  mode: CountdownMode;
  targetTimeMs: number;
  remainingMs: number;
  currentSchedule?: AwardSchedule;
  nextSchedule?: AwardSchedule;
}

interface NormalizedSchedule {
  source: AwardSchedule;
  startMs: number;
  endMs: number;
}

const toSafeNumber = (value: unknown, defaultValue = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

const formatHourMinute = (date: Date): string =>
  `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

const buildIntervals = (
  baseDate: Date,
  schedules: AwardSchedule[],
): NormalizedSchedule[] => {
  return schedules
    .filter(
      (item) =>
        Number.isFinite(item.dispatchHour) &&
        Number.isFinite(item.durationMinutes) &&
        item.dispatchHour >= 0 &&
        item.dispatchHour <= 23 &&
        item.durationMinutes > 0,
    )
    .map((item) => {
      const start = new Date(baseDate);
      start.setHours(item.dispatchHour, 0, 0, 0);
      const startMs = start.getTime();
      const endMs = startMs + item.durationMinutes * 60 * 1000;
      return {
        source: item,
        startMs,
        endMs,
      };
    });
};

export const getScheduleCountdownState = (
  schedules: AwardSchedule[],
  now: Date = new Date(),
): ScheduleCountdownResult | null => {
  if (!Array.isArray(schedules) || schedules.length === 0) return null;

  const nowMs = now.getTime();
  const todayIntervals = buildIntervals(now, schedules);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIntervals = buildIntervals(tomorrow, schedules);
  const allIntervals = [...todayIntervals, ...tomorrowIntervals].sort(
    (a, b) => a.startMs - b.startMs,
  );

  const current = allIntervals.find(
    (item) => nowMs >= item.startMs && nowMs < item.endMs,
  );
  if (current) {
    return {
      mode: "in_progress",
      targetTimeMs: current.endMs,
      remainingMs: Math.max(0, current.endMs - nowMs),
      currentSchedule: current.source,
    };
  }

  const next = allIntervals.find((item) => item.startMs > nowMs);
  if (!next) return null;

  return {
    mode: "before_next",
    targetTimeMs: next.startMs,
    remainingMs: Math.max(0, next.startMs - nowMs),
    nextSchedule: next.source,
  };
};

export const formatCountdown = (remainingMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
};

export const buildMiningTimeList = (
  schedules: MiningSchedule[],
  nowTs: number,
): MiningTimeItem[] => {
  return schedules
    .filter(
      (item) =>
        Number.isFinite(item?.dispatchHour) &&
        Number.isFinite(item?.durationMinutes) &&
        Number(item.dispatchHour) >= 0 &&
        Number(item.dispatchHour) <= 23 &&
        Number(item.durationMinutes) > 0,
    )
    .map((item, index) => {
      const startDate = new Date();
      startDate.setHours(Number(item.dispatchHour), 0, 0, 0);
      const endDate = new Date(
        startDate.getTime() + Number(item.durationMinutes) * 60 * 1000,
      );
      const claimedTimes = toSafeNumber(item.claimedTimes, 0);
      const userDailyLimit = toSafeNumber(item.userDailyLimit, 0);

      return {
        key: `${item.dispatchHour}-${item.durationMinutes}-${index}`,
        startTime: formatHourMinute(startDate),
        endTime: formatHourMinute(endDate),
        isExpired: nowTs > endDate.getTime(),
        isInRange: nowTs >= startDate.getTime() && nowTs <= endDate.getTime(),
        userDailyLimit,
        claimedTimes,
        awardLimitDisplay: item.awardLimitDisplay ?? 0,
      };
    });
};

const getCurrentOrNextWave = (
  items: MiningTimeItem[],
): MiningTimeItem | undefined => {
  if (!items.length) return undefined;
  if (items.every((item) => item.isExpired)) return items[0];
  const inRange = items.find((item) => item.isInRange);
  if (inRange) return inRange;
  return items.find((item) => !item.isExpired);
};

export const getCurrentAward = (items: MiningTimeItem[]): number | string =>
  getCurrentOrNextWave(items)?.awardLimitDisplay ?? 0;

export const getCurrentClaimTimes = (items: MiningTimeItem[]): number =>
  getCurrentOrNextWave(items)?.userDailyLimit ?? 0;

export const getClaimState = (items: MiningTimeItem[]): 1 | 2 | 3 => {
  const current = items.find((item) => item.isInRange);
  if (!current) return 3;
  return current.claimedTimes < current.userDailyLimit ? 1 : 2;
};

export const getMineTimeStatus = (item: MiningTimeItem): MineTimeStatus => {
  if (item.isInRange) return "active";
  if (item.isExpired) return "disabled";
  return "normal";
};
