import { getActDetail } from "@/api";
import { isMemberDayActiveToday } from "@/components/active/memberDay/memberDayLogic";
import type { RootState } from "@/store/store";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

/**
 * 今日是否为会员日（需已登录；活动有效期内 + 规则命中今天）。
 * 列表无 memberDayRules 时会拉详情补全，与 Vue activityStore 逻辑对齐。
 */
export function useIsMemberDayToday(): boolean {
  const activityList = useSelector((s: RootState) => s.active.activityList);
  const userInfo: { isLogin?: boolean } | undefined = useSelector(
    (s: RootState) => s.user.userInfo,
  );
  const isLogin = Boolean(userInfo?.isLogin);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const memberDayAct = useMemo(() => {
    if (!Array.isArray(activityList)) return null;
    return (
      activityList.find(
        (item: { activityType?: number; memberDayRules?: unknown[] }) =>
          item?.activityType === 10 ||
          (Array.isArray(item?.memberDayRules) && item.memberDayRules.length > 0),
      ) ?? null
    );
  }, [activityList]);

  const listRulesLen =
    memberDayAct && Array.isArray(memberDayAct.memberDayRules)
      ? memberDayAct.memberDayRules.length
      : 0;

  useEffect(() => {
    if (!isLogin) {
      setDetail(null);
      return;
    }
    if (!memberDayAct?.id) {
      setDetail(null);
      return;
    }
    if (listRulesLen > 0) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const resp = await getActDetail({ id: memberDayAct.id });
        if (cancelled) return;
        setDetail((resp?.data?.data as Record<string, unknown>) ?? null);
      } catch {
        if (!cancelled) setDetail(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLogin, memberDayAct?.id, listRulesLen]);

  return useMemo(
    () => isLogin && isMemberDayActiveToday(memberDayAct, detail),
    [isLogin, memberDayAct, detail],
  );
}
