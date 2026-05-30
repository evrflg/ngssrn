import { DependencyList, useEffect, useState } from "react";

interface UsePopupEligibilityOptions {
  enabled?: boolean; // 为 false 时不请求，直接视为不可展示并标记已加载
  onResult?: (canShow: boolean) => void; // 资格判断结束后回调，上报首页队列
}

/**
 * 用于需要异步请求才能决定是否可展示的首页弹窗（如 Telegram、Discount）。
 * @param checkFn 异步资格检查，返回 true 表示可展示
 * @param deps 依赖数组，变化时重新执行检查
 * @param options.enabled 为 false 时不请求，直接视为不可展示
 * @param options.onResult 检查结束后调用，用于上报首页队列
 */
export function usePopupEligibility(
  checkFn: () => Promise<boolean>,
  deps: DependencyList,
  options: UsePopupEligibilityOptions = {},
) {
  const { enabled = true, onResult } = options;
  const [canShow, setCanShow] = useState(false);
  const [loaded, setLoaded] = useState(false); // 避免未完成就上报误入队

  // 异步检查，带取消标志避免卸载后回写
  useEffect(() => {
    if (!enabled) {
      setCanShow(false);
      setLoaded(true);
      return;
    }

    let cancelled = false;
    setLoaded(false);

    const run = async () => {
      const result = await checkFn();
      if (cancelled) return;
      setCanShow(result);
      setLoaded(true);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, deps);

  // 仅在 loaded 为 true 时把结果上报给首页队列
  useEffect(() => {
    if (!loaded || onResult == null) return;
    onResult(canShow);
  }, [canShow, loaded, onResult]);

  return { canShow, loaded };
}
