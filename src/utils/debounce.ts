type AnyFunction = (...args: unknown[]) => void;

export type DebouncedFunction<T extends AnyFunction> = ((...args: Parameters<T>) => void) & {
  cancel: () => void;
};

/**
 * 防抖：
 * - immediate = false：在最后一次触发 delay 后执行（适合搜索输入，停止输入后再请求）
 * - immediate = true（默认）：首次立即执行，随后在 delay 内忽略重复触发（适合按钮防连点、短时间重复点击拦截）
 */
export const debounce = <T extends AnyFunction>(
  func: T,
  delay: number,
  immediate = true
): DebouncedFunction<T> => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (immediate) {
      const shouldCallNow = timeout === null;
      timeout = setTimeout(() => {
        timeout = null;
      }, delay);

      if (shouldCallNow) {
        func(...args);
      }
      return;
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, delay);
  };

  // 取消尚未执行的调用，并清空计时状态
  debounced.cancel = () => {
    if (!timeout) return;
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
};
