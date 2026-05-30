import { useRequireLogin } from "@/hooks/useRequireLogin";
import { Publicity, PublicityActionType, PublicityPopupFrequency, PublicityType } from "@/types/publicity";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "expo-router";
import { Linking } from "react-native";
import { getStoreJson, setStoreJson } from "@/utils/storage";
import { startOfTomorrow } from "date-fns";
import { useTypeContentContext } from "../typeContent/TypeContentContext";

interface UseFooterOptions {
  activePublicity: Publicity | null;
}

export function useFooter({
  activePublicity,
}: UseFooterOptions) {
  const { publicities } = useTypeContentContext();
  const { ensureLogin } = useRequireLogin();
  const router = useRouter();
  const pathname = usePathname();
  const normalizedCurrentPath = (pathname || "").replace(/^\/\(tabs\)(?=\/|$)/, "") || "/";

  // 跳转页面的时候，判断是否是当前页面
  const navigateIfNeeded = (
    pathname:
      | "/active/activeCenter"
      | "/active"
      | "/wallet/recharge"
      | "/wallet/withdraw",
    params?: Record<string, string>,
  ) => {
    const normalizedTargetPath = pathname.replace(/^\/\(tabs\)(?=\/|$)/, "") || "/";
    if (normalizedTargetPath === normalizedCurrentPath) return;
    router.navigate(params ? { pathname, params } : pathname);
  };

  // 是否勾选“今日不再弹出”
  const [isDontPopupTodayChecked, setIsDontPopupTodayChecked] = useState(false);
  const checkedRef = useRef(isDontPopupTodayChecked);
  const publicitiesRef = useRef(publicities);

  useEffect(() => {
    checkedRef.current = isDontPopupTodayChecked;
  }, [isDontPopupTodayChecked]);

  useEffect(() => {
    publicitiesRef.current = publicities;
  }, [publicities]);

  // 切换“今日不再弹出”勾选态
  const onCheckPublicity = () => {
    setIsDontPopupTodayChecked((prev) => !prev);
  };

  // 立即查看
  const gotoView = () => {
    console.log("gotoView");

    if (!activePublicity) return;

    switch (activePublicity.redirectType) {
      case PublicityActionType.OPEN_LINK:
        if (activePublicity.targetPage) {
          const targetPage = activePublicity.targetPage;
          Linking.canOpenURL(targetPage).then((canOpen) => {
            if (canOpen) {
              Linking.openURL(targetPage);
            }
          });
        }
        break;
      case PublicityActionType.DO_ACTIVITY:
        if (!ensureLogin()) return;
        if (activePublicity.targetPage) {
          navigateIfNeeded("/active/activeCenter", { id: activePublicity.targetPage });
        } else {
          navigateIfNeeded("/active");
        }
        break;
      case PublicityActionType.DO_TASK:
        if (!ensureLogin()) return;
        // 任务暂未实现，保留占位
        break;
      case PublicityActionType.OPEN_DEPOSIT_PAGE:
        if (!ensureLogin()) return;
        navigateIfNeeded("/wallet/recharge");
        break;
      case PublicityActionType.OPEN_WITHDRAW_PAGE:
        if (!ensureLogin()) return;
        navigateIfNeeded("/wallet/withdraw");
        break;
      case PublicityActionType.OPEN_TELEGRAM:
        const tgUrl = activePublicity?.targetPage ?? '';
        console.log("tgUrl", !tgUrl);
        if (tgUrl!==''&&tgUrl!==null&&tgUrl!==undefined){
          Linking.canOpenURL(tgUrl).then((canOpen) => {
            if (canOpen) {
              Linking.openURL(tgUrl);
            }
          });
        }
        break;
      default:
        break;
    }
  };

  // 在弹窗真正关闭（组件卸载）时，如果勾选了“今日不再弹出”，再写入本地记录
  useEffect(() => {
    return () => {
      if (!checkedRef.current) return;

      getStoreJson("publicityReadableAfterDates").then((data) => {
        const current =
          (data as Record<
            string,
            { dateTime: string; type: PublicityPopupFrequency }
          >) || {};
        const nextMap: Record<
          string,
          { dateTime: string; type: PublicityPopupFrequency }
        > = { ...current };

        publicitiesRef.current.forEach((publicity) => {
          if (
            (publicity.popupFrequency ===
              PublicityPopupFrequency.EVERY_LOGIN ||
              publicity.popupFrequency ===
              PublicityPopupFrequency.HIGH_FREQUENCY) &&
            publicity.publicityType !== PublicityType.FIRST_TIME_LOGIN &&
            publicity.publicityType !== PublicityType.SECOND_TIME_LOGIN &&
            publicity.publicityType !== PublicityType.THIRD_TIME_LOGIN
          ) {
            nextMap[publicity.id] = {
              dateTime: startOfTomorrow().toISOString(),
              type: publicity.popupFrequency,
            };
          }
        });

        setStoreJson("publicityReadableAfterDates", nextMap);
      });
    };
  }, []);

  // 只有高频/每次登录这类宣传并且不是首次登录、二次登录、三次登录，才显示“今日不再弹出”
  const canShowDontPopupToday = useMemo(
    () =>
      publicities.some(
        (publicity) =>
          (publicity.popupFrequency === PublicityPopupFrequency.EVERY_LOGIN ||
            publicity.popupFrequency === PublicityPopupFrequency.HIGH_FREQUENCY) &&
          publicity.publicityType !== PublicityType.FIRST_TIME_LOGIN &&
          publicity.publicityType !== PublicityType.SECOND_TIME_LOGIN &&
          publicity.publicityType !== PublicityType.THIRD_TIME_LOGIN,
      ),
    [publicities],
  );

  return {
    gotoView,
    isDontPopupTodayChecked,
    onCheckPublicity,
    canShowDontPopupToday,
  };
}
