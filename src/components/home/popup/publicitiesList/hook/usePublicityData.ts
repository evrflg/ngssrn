import { getPublicizeListServer } from "@/api";
import { RootState } from "@/store/store";
import {
  Publicity,
  PublicityPopupFrequency,
  PublicityType,
} from "@/types/publicity";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getStoreJson } from "@/utils/storage";
import { isFuture } from "date-fns";
import { useCommon } from "@/hooks/CommonProvider";

// 控制是否自动请求宣传弹窗数据
interface UsePublicityDataOptions {
  enabled?: boolean;
  /** 指定展示的宣传类型，不传则按首页逻辑（HOME + 登录相关） */
  publicityTypesOverride?: PublicityType[];
}

// 后端返回的宣传数据需要按 sortNo 排序，保证展示顺序稳定
function sortBySortNo<T extends { sortNo: number }>(a: T, b: T) {
  return a.sortNo - b.sortNo;
}

// 将接口返回的数据整理成当前前端统一使用的 Publicity 结构
function normalizePublicity(rawData: any): Publicity {
  return {
    ...rawData,
    // 点击“立即查看”时用来判断跳转行为
    redirectType: rawData.redirectType,
    // 配合 redirectType 使用，可能是链接、活动 id 或目标页面参数
    targetPage: rawData.targetPage,
    // 后面做宣传弹窗展示资格筛选时会用到
    publicityType: rawData.publicityType,
    // 弹窗顶部图片，兜底为空字符串，避免后续取值报空
    publicityPhoto: rawData.publicityPhoto ?? "",
    // 统一转成布尔值，方便后面直接判断是否启用
    status: !!rawData.status,
    // 弹窗正文内容，兜底为空字符串，避免后续拆分内容时报错
    content: rawData.content ?? "",
    // 前端本地 UI 状态字段，标记“今日不再展示”
    todayDontDisplay: false,
    // 前端本地 UI 状态字段，标记当前宣传是否已读/已选中
    isSeen: false,
  };
}

// 宣传弹窗数据请求 hook
export function usePublicityData({
  enabled = true,
  publicityTypesOverride,
}: UsePublicityDataOptions = {}) {
  const [loaded, setLoaded] = useState(false);
  const [publicities, setPublicities] = useState<Publicity[]>([]);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const userProfile = useSelector((state: RootState) => state.user.userProfile);
  const lastLogin = useSelector((state: RootState) => state.user.lastLogin);
  const isLogin = !!userInfo?.isLogin;
  const loginTimes = userProfile?.loginTimes;
  const { language } = useCommon(); // EN / CN / IN ...

  // 本地记录每条宣传“下一次允许弹出时间”
  const [readableAfterDates, setReadableAfterDates] = useState<
    Record<string, { dateTime: string; type: PublicityPopupFrequency }>
  >({});

  // 单独暴露 refetch，后面无论是首屏自动拉取还是手动重试都能复用这一套逻辑
  const fetchPublicities = useCallback(async () => {
    if (loaded) return;
    // 新一轮请求开始时，先把“已完成请求”标记重置掉
    setLoaded(false);

    try {
      const response = await getPublicizeListServer();
      const list = Array.isArray(response?.data?.data) ? response.data.data : [];

      // 请求成功后先做结构整理，再按 sortNo 排序
      setPublicities(list.map(normalizePublicity).sort(sortBySortNo));
    } catch {
      // 出错时清空当前列表，避免继续使用旧数据
      setPublicities([]);
    } finally {
      // 只有请求完整结束后，外层才应该基于结果决定是否入队
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    // 某些场景下只想拿到 refetch，不想组件一挂载就请求
    if (!enabled || !language) return;

    fetchPublicities();
  }, [enabled, fetchPublicities, language]);

  // 初始化时从本地恢复已读/不再显示记录
  useEffect(() => {
    getStoreJson("publicityReadableAfterDates").then((data) => {
      if (data && typeof data === "object") {
        setReadableAfterDates(
          data as Record<string, { dateTime: string; type: PublicityPopupFrequency }>,
        );
      }
    });
  }, []);

  // 根据登录状态 + 登录次数，计算当前需要展示的宣传类型（可被 override 覆盖，如充值页用 DEPOSIT_TUTORIAL）
  const publicityTypes = useMemo(() => {
    if (publicityTypesOverride && publicityTypesOverride.length > 0) {
      return publicityTypesOverride;
    }
    const types: PublicityType[] = [PublicityType.HOME];

    if (isLogin) {
      switch (String(loginTimes ?? "")) {
        case "1":
          types.push(PublicityType.FIRST_TIME_LOGIN);
          break;
        case "2":
          types.push(PublicityType.SECOND_TIME_LOGIN);
          break;
        case "3":
          types.push(PublicityType.THIRD_TIME_LOGIN);
          break;
      }
    } else {
      types.push(PublicityType.LOGIN_REGISTER);
    }

    return types;
  }, [isLogin, loginTimes, publicityTypesOverride]);

  // 依据登录状态 / 启用状态过滤本次要展示的宣传
  const filteredPublicities = useMemo(() => {
    // 首页逻辑：已登录但 loginTimes 还没返回时，不展示宣传；充值页等 override 场景不依赖 loginTimes
    if (!publicityTypesOverride?.length && isLogin && loginTimes === null) return [];
    if (!publicities.length) return [];

    const now = new Date();

    return publicities.filter((publicity) => {
      const isTypeValid = publicityTypes.includes(publicity.publicityType);
      const isDisabled = publicity.status;
      if (!isTypeValid || isDisabled) return false;

      const stored = readableAfterDates[publicity.id];
      let isAlreadyRead = false;

      try {
        if (stored && stored.type === publicity.popupFrequency) {
          const storedDate = new Date(stored.dateTime);

          if (publicity.popupFrequency === PublicityPopupFrequency.EVERY_LOGIN) {
            // 每次登录弹一次：
            // - 如果 storedDate 在未来：说明勾选了“今日不再弹出”，整天不再弹
            // - 否则：如果 storedDate === lastLogin，说明本次登录已经弹过一次
            if (!isLogin) return false;

            const isDontShowTodayChecked = isFuture(storedDate);
            if (isDontShowTodayChecked) {
              isAlreadyRead = true;
            } else if (lastLogin) {
              const userLastLogin = new Date(lastLogin);
              isAlreadyRead = userLastLogin.getTime() === storedDate.getTime();
            }
          } else {
            // 其它频率：只要下一次允许时间在未来，就视为已读/本轮不再弹
            isAlreadyRead = storedDate.getTime() > now.getTime();
          }
        }
      } catch {
        isAlreadyRead = false;
      }

      if (publicity.popupFrequency === PublicityPopupFrequency.EVERY_LOGIN) {
        return !isAlreadyRead && isLogin;
      }

      return !isAlreadyRead;
    });
  }, [isLogin, loginTimes, lastLogin, publicities, publicityTypes, readableAfterDates]);

  // 外层队列和弹窗显隐只关心当前是否还有可展示内容
  const hasPopupContent = filteredPublicities.length > 0;

  return {
    loaded,
    publicities,
    filteredPublicities,
    hasPopupContent,
    refetch: fetchPublicities,
  };
}
