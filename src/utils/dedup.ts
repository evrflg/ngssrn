const lastRunAtMap = new Map<string, number>();

/**
 * 时间窗去重：在指定毫秒窗口内，相同 key 只允许通过一次。
 * 返回 true 表示本次允许执行；false 表示命中去重应跳过。
 */
export function allowOnceInWindow(key: string, ms: number): boolean {
  const now = Date.now();
  const lastRunAt = lastRunAtMap.get(key) ?? 0;
  if (now - lastRunAt < ms) return false;
  lastRunAtMap.set(key, now);
  return true;
}

/**
 * 手动清理某个 key 的记录（可选使用）。
 */
export function clearDedupKey(key: string): void {
  lastRunAtMap.delete(key);
}

