import { useEffect, type MutableRefObject, type Dispatch, type SetStateAction } from "react";
import { buildSseUrl } from "./sseBuildUrl";
import { RECONNECT_INTERVAL } from "./sseBuildUrl";

export type SseNativeChannelDeps = {
  session: { accessToken?: string } | null | undefined;
  userInfo: { memberId?: string | number; isLogin?: boolean } | null | undefined;
  tenantId: string;
  nativeRestartNonce: number;
  reconnectTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  setNativeRestartNonce: Dispatch<SetStateAction<number>>;
  clearReconnectTimer: () => void;
  setNativeSseUrl: Dispatch<SetStateAction<string | null>>;
  lastSseUrlRef: MutableRefObject<string>;
  isLoginRef: MutableRefObject<boolean | undefined>;
};

/**
 * 原生：根据登录态与 tenant 等挂载/卸载 WebView SSE。
 */
export function useSseNativeChannel(
  enabled: boolean,
  p: SseNativeChannelDeps,
): void {
  const {
    session,
    userInfo,
    tenantId,
    nativeRestartNonce,
    reconnectTimerRef,
    setNativeRestartNonce,
    clearReconnectTimer,
    setNativeSseUrl,
    lastSseUrlRef,
    isLoginRef,
  } = p;

  useEffect(() => {
    if (!enabled) return;

    // 每次 effect 重跑先取消上次安排的延迟重连，避免多个 timer 叠加
    clearReconnectTimer();
    const token = session?.accessToken;
    const memberId = userInfo?.memberId;

    // 检查连接条件；不满足则卸掉 WebView 并延迟再试
    if (!isLoginRef.current || !memberId || !tenantId || !token) {
      setNativeSseUrl(null);
      reconnectTimerRef.current = setTimeout(
        () => setNativeRestartNonce((n) => n + 1),
        RECONNECT_INTERVAL,
      );
      return () => {
        clearReconnectTimer();
        setNativeSseUrl(null);
      };
    }

    console.log("SSE connection (native) ...");
    const sseUrl = buildSseUrl(tenantId, memberId, token);
    lastSseUrlRef.current = sseUrl;
    setNativeSseUrl(sseUrl);

    return () => {
      setNativeSseUrl(null);
    };
  }, [
    enabled,
    session?.accessToken,
    userInfo?.memberId,
    userInfo?.isLogin,
    tenantId,
    nativeRestartNonce,
  ]);
}
