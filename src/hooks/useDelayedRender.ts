import { useEffect, useState } from "react";

interface UseDelayedRenderOptions {
  // 是否允许开始渲染；为 false 时会立即隐藏
  enabled?: boolean;
  // 延迟多久后再开始渲染，单位毫秒
  delay?: number;
}

/**
 * 通用延迟渲染开关。
 * 适合“弹窗先出来，再晚一点挂重组件/启动动画”这类场景。
 */
export function useDelayedRender({
  enabled = true,
  delay = 0,
}: UseDelayedRenderOptions = {}) {
  const [shouldRender, setShouldRender] = useState(
    enabled && delay <= 0,
  );

  useEffect(() => {
    if (!enabled) {
      setShouldRender(false);
      return;
    }

    if (delay <= 0) {
      setShouldRender(true);
      return;
    }

    const timer = setTimeout(() => {
      setShouldRender(true);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [delay, enabled]);

  return shouldRender;
}
