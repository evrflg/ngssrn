import { useEffect, type MutableRefObject, type Dispatch, type SetStateAction } from "react";
import { buildSseUrl, type WebEventSourceInstance, type GlobalEventSourceCtor } from "./sseBuildUrl";
import { RECONNECT_INTERVAL } from "./sseBuildUrl";

type SseWebChannelDeps = {
  session: { accessToken?: string } | null | undefined;
  userInfo: { memberId?: string | number; isLogin?: boolean } | null | undefined;
  tenantId: string;
  nativeRestartNonce: number;
  reconnectTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  setNativeRestartNonce: Dispatch<SetStateAction<number>>;
  clearReconnectTimer: () => void;
  webEventSourceRef: MutableRefObject<WebEventSourceInstance | null>;
  handleSsePayload: (type: string, data: string) => void;
  lastSseUrlRef: MutableRefObject<string>;
  isLoginRef: MutableRefObject<boolean | undefined>;
};

function getBrowserEventSource(): GlobalEventSourceCtor | undefined {
  return (globalThis as unknown as { EventSource?: GlobalEventSourceCtor })
    .EventSource;
}

/**
 * Web：页面内 EventSource（需接口同源或后端 CORS 允许当前页面源）
 */
export function useSseWebChannel(enabled: boolean, p: SseWebChannelDeps): void {
  const {
    session,
    userInfo,
    tenantId,
    nativeRestartNonce,
    reconnectTimerRef,
    setNativeRestartNonce,
    clearReconnectTimer,
    webEventSourceRef,
    handleSsePayload,
    lastSseUrlRef,
    isLoginRef,
  } = p;

  useEffect(() => {
    if (!enabled) return;

    clearReconnectTimer();
    const token = session?.accessToken;
    const memberId = userInfo?.memberId;
    const ES = getBrowserEventSource();

    if (!ES) {
      console.warn("[SSE] EventSource 不可用");
      return;
    }

    if (!isLoginRef.current || !memberId || !tenantId || !token) {
      webEventSourceRef.current?.close();
      webEventSourceRef.current = null;
      reconnectTimerRef.current = setTimeout(
        () => setNativeRestartNonce((n) => n + 1),
        RECONNECT_INTERVAL,
      );
      return () => {
        clearReconnectTimer();
        webEventSourceRef.current?.close();
        webEventSourceRef.current = null;
      };
    }

    console.log("SSE connection (web) ...");
    const sseUrl = buildSseUrl(tenantId, memberId, token);
    lastSseUrlRef.current = sseUrl;

    webEventSourceRef.current?.close();
    webEventSourceRef.current = null;

    const es = new ES(sseUrl);
    webEventSourceRef.current = es;

    es.onopen = () => handleSsePayload("open", "");
    es.onmessage = (e) => handleSsePayload("message", e.data);
    es.addEventListener("activity", (e) =>
      handleSsePayload("activity", (e as MessageEvent).data ?? ""),
    );
    es.addEventListener("game", (e) =>
      handleSsePayload("game", (e as MessageEvent).data ?? ""),
    );
    es.onerror = () => {
      handleSsePayload(
        "error",
        JSON.stringify({
          source: "EventSource.onerror",
          readyState: es.readyState,
          url: sseUrl,
        }),
      );
    };

    return () => {
      es.close();
      if (webEventSourceRef.current === es) webEventSourceRef.current = null;
    };
  }, [
    enabled,
    session?.accessToken,
    userInfo?.memberId,
    userInfo?.isLogin,
    tenantId,
    nativeRestartNonce,
    handleSsePayload,
  ]);
}
