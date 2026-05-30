import {
  Publicity,
  PublicityPopupFrequency,
  PublicityType,
} from "@/types/publicity";
import { useCallback, useEffect, useState } from "react";
import { startOfTomorrow } from "date-fns";
import { getStoreJson, setStoreJson } from "@/utils/storage";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { MAX_DATE } from "@/utils/date";
import { useTypeContentContext } from "../typeContent/TypeContentContext";

export function useTypeContent() {
  const { publicities } = useTypeContentContext();

  // 当前展示的宣传项
  const [activePublicity, setActivePublicity] = useState<Publicity | null>(
    publicities[0] ?? null,
  );
  const lastLogin = useSelector((state: RootState) => state.user.lastLogin);

  // 宣传列表变化后，优先保留当前选中项；当前项不存在时回退到第一条
  useEffect(() => {
    setActivePublicity((prev) => {
      if (!publicities.length) return null;
      if (!prev) return publicities[0];

      const nextActivePublicity =
        publicities.find((item) => item.id === prev.id) ?? publicities[0];

      return nextActivePublicity;
    });
  }, [publicities]);

  // 切换当前宣传项
  const selectPublicity = useCallback((publicity: Publicity) => {
    setActivePublicity(publicity);
  }, []);

  // activePublicity 变化时，按频率规则记录“下一次允许弹出时间”（已读逻辑）
  useEffect(() => {
    if (!activePublicity) return;

    getStoreJson("publicityReadableAfterDates").then((data) => {
      const current =
        (data as Record<
          string,
          { dateTime: string; type: PublicityPopupFrequency }
        >) || {};

      let nextDate: string | null = null;

      if (
        activePublicity.publicityType === PublicityType.FIRST_TIME_LOGIN ||
        activePublicity.publicityType === PublicityType.SECOND_TIME_LOGIN ||
        activePublicity.publicityType === PublicityType.THIRD_TIME_LOGIN
      ) {
        // 各种“第 N 次登录”类：永不再弹
        nextDate = MAX_DATE.toISOString();
      } else if (
        activePublicity.popupFrequency === PublicityPopupFrequency.ONLY_ONCE
      ) {
        // 只弹一次：永不再弹
        nextDate = MAX_DATE.toISOString();
      } else if (
        activePublicity.popupFrequency === PublicityPopupFrequency.DAILY
      ) {
        // 每日一次：明天再弹
        nextDate = startOfTomorrow().toISOString();
      } else if (
        activePublicity.popupFrequency === PublicityPopupFrequency.EVERY_LOGIN &&
        lastLogin
      ) {
        // 每次登录一次：记录本次登录时间
        nextDate = new Date(lastLogin).toISOString();
      } else {
        nextDate = new Date().toISOString();
      }

      if (!nextDate) return;

      const nextMap: Record<
        string,
        { dateTime: string; type: PublicityPopupFrequency }
      > = {
        ...current,
        [activePublicity.id]: {
          dateTime: nextDate,
          type: activePublicity.popupFrequency,
        },
      };

      setStoreJson("publicityReadableAfterDates", nextMap);
    });
  }, [activePublicity, lastLogin]);

  // 分页切换
  const onPaginate = useCallback(
    (index: number) => {
      let nextIndex = Math.max(0, index);
      nextIndex = Math.min(nextIndex, publicities.length - 1);
      selectPublicity(publicities[nextIndex]);
    },
    [publicities, selectPublicity],
  );

  return {
    activePublicity,
    selectPublicity,
    onPaginate,
  };
}
