import React, { memo } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

function isCustomActivityClaimable(item: any): boolean {
  if (!item || item.activityType !== 0 || item.status !== 1) return false;
  const optional: any = item.optional ?? {};
  const claimTimesLimit = Number(optional?.claimTimesLimit);
  const claimedTimes = Number(optional?.claimedTimes);
  if (!Number.isFinite(claimTimesLimit) || !Number.isFinite(claimedTimes)) return false;
  return claimTimesLimit > 0 && claimedTimes < claimTimesLimit;
}

function isMinedActivityClaimableNow(item: any, nowTs = Date.now()): boolean {
  if (!item || item.activityType !== 12) return false;
  const schedules: any[] | undefined = item.mysteryMineSchedules;
  if (!Array.isArray(schedules) || schedules.length === 0) return false;
  return schedules.some((schedule) => {
    const dispatchHour = Number(schedule?.dispatchHour);
    const durationMinutes = Number(schedule?.durationMinutes);
    const userDailyLimit = Number(schedule?.userDailyLimit);
    const claimedTimes = Number(schedule?.claimedTimes);
    if (
      !Number.isFinite(dispatchHour) ||
      !Number.isFinite(durationMinutes) ||
      !Number.isFinite(userDailyLimit) ||
      !Number.isFinite(claimedTimes) ||
      dispatchHour < 0 ||
      dispatchHour > 23 ||
      durationMinutes <= 0
    ) {
      return false;
    }
    const startDate = new Date();
    startDate.setHours(dispatchHour, 0, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    const inCurrentWave = nowTs >= startDate.getTime() && nowTs <= endDate.getTime();
    return inCurrentWave && userDailyLimit > 0 && claimedTimes < userDailyLimit;
  });
}

function computeHasClaimableCustomOrMinedReward(
  activityList: any[] | null | undefined,
  isLogin: boolean,
): boolean {
  if (!isLogin) return false;
  if (!Array.isArray(activityList) || activityList.length === 0) return false;
  const nowTs = Date.now();
  return activityList.some(
    (a) => isCustomActivityClaimable(a) || isMinedActivityClaimableNow(a, nowTs),
  );
}

function parseActivityItemRow(row: any): {
  activityType: number;
  unclaimed: number;
  inProgress: number;
  notJoined: number;
} | null {
  if (typeof row !== "object" || row === null) return null;
  const rec: any = row;
  const type = Number(rec.activityType ?? rec.type);
  if (!Number.isFinite(type)) return null;
  const hasNewShape =
    "inProgressCount" in rec || "unacceptedCount" in rec || "notJoinedCount" in rec;
  if (hasNewShape) {
    return {
      activityType: type,
      unclaimed: Math.max(0, Number(rec.unacceptedCount) || 0),
      inProgress: Math.max(0, Number(rec.inProgressCount) || 0),
      notJoined: Math.max(0, Number(rec.notJoinedCount) || 0),
    };
  }
  return {
    activityType: type,
    unclaimed: Math.max(0, Number(rec.count) || 0),
    inProgress: 0,
    notJoined: 0,
  };
}

export function computeHasActivityDot(
  reminderCount: any,
  ctx?: { isLogin?: boolean; activityList?: any[] | null },
): boolean {
  // 退出登录必须隐藏红点：不依赖 reminderCount 是否残留
  if (ctx?.isLogin === false) return false;
  const rc: any = reminderCount ?? {};
  const n = (v: any) => {
    const num = Number(v);
    return Number.isFinite(num) ? num : 0;
  };
  const sum =
    n(rc.taskCount ?? rc.taskUnclaimedCount) +
    n(rc.taskInProgressCount) +
    n(rc.bonusUnaccepted ?? rc.bonusTaskCount ?? rc.bonusTaskUnaccepted) +
    n(rc.bonusInProgress ?? rc.bonusTaskInProgress) +
    n(rc.rewardRecordUnclaimedCount);

  const activityItems = rc.activityItems;
  const parsedItems: Array<ReturnType<typeof parseActivityItemRow>> = Array.isArray(activityItems)
    ? activityItems.map(parseActivityItemRow).filter(Boolean)
    : [];
  const hasFromActivityItems = parsedItems.some(
    (x: any) => x.inProgress > 0 || x.unclaimed > 0 || (x.activityType === 11 && x.notJoined > 0),
  );

  // 参考 Web(Pinia) 的 computed：优先使用接口字段；没有时用 activityList 计算
  const fromApiFlag = rc.hasClaimableCustomOrMinedReward;
  const hasClaimableCustomOrMinedReward =
    typeof fromApiFlag === "boolean"
      ? fromApiFlag
      : computeHasClaimableCustomOrMinedReward(
          ctx?.activityList,
          Boolean(ctx?.isLogin),
        );
  return (
    sum > 0 ||
    Boolean(hasFromActivityItems) ||
    Boolean(hasClaimableCustomOrMinedReward)
  );
}

export const ActivityDot = memo(function ActivityDot({
  style,
}: {
  style?: any;
}) {
  return (
    <View style={style} pointerEvents="none">
      <Svg width={8} height={8} viewBox="0 0 8 8">
        <Defs>
          <RadialGradient
            id="actDot"
            cx="37.5%"
            cy="33.33%"
            rx="70.71%"
            ry="70.71%"
            fx="37.5%"
            fy="33.33%"
          >
            <Stop offset="0" stopColor="#ff6754" stopOpacity="1" />
            <Stop offset="1" stopColor="#ce1c06" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Circle cx={4} cy={4} r={4} fill="url(#actDot)" />
      </Svg>
    </View>
  );
});

