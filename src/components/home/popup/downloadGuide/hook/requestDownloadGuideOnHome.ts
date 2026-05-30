/**
 * 用于「点击 APP_DOWNLOAD 后进首页并优先展示下载引导弹窗」的请求位。
 * - 在其它页点击：request() + 跳首页，入队时 consume() 让下载引导排第一。
 * - 已在首页点击：requestShowDownloadGuideNow()，由 HomePopup 订阅后直接入队并弹窗。
 */
let pending = false;
let showNowListener: (() => void) | null = null;

export function requestDownloadGuideOnNextHome(): void {
  pending = true;
}

/** 消费一次请求，返回是否应在本次入队时让下载引导排第一；消费后清除 */
export function consumeDownloadGuideRequest(): boolean {
  const v = pending;
  pending = false;
  return v;
}

/** 已在首页时点击 APP_DOWNLOAD：直接触发「立即展示下载引导」，由 HomePopup 订阅后入队并弹窗 */
export function requestShowDownloadGuideNow(): void {
  showNowListener?.();
}

/** HomePopup 注册「立即展示」回调，返回取消注册函数 */
export function registerShowDownloadGuideNowListener(cb: () => void): () => void {
  showNowListener = cb;
  return () => {
    showNowListener = null;
  };
}
