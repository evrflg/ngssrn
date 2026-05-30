import patch from "@/api/PatchVersion";

// 仅浏览器存在；RN 无 DOM 全局时用 globalThis 读取
export type GlobalEventSourceCtor = new (url: string | URL) => {
  readonly readyState: number;
  close(): void;
  onopen: ((this: unknown, ev: Event) => void) | null;
  onmessage: ((this: unknown, ev: MessageEvent) => void) | null;
  onerror: ((this: unknown, ev: Event) => void) | null;
  addEventListener(
    type: string,
    listener: (ev: MessageEvent) => void,
  ): void;
};

export type WebEventSourceInstance = InstanceType<GlobalEventSourceCtor>;

// 断线或未就绪时延迟重连间隔
export const RECONNECT_INTERVAL = 30000;

// 生成随机 sessionId（拼进 SSE URL）
export function generateSessionId(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1e6)
    .toString()
    .padStart(6, "0")}`;
}

// Web / 原生 WebView 共用的 SSE 地址拼装
export function buildSseUrl(
  tenantId: string,
  memberId: string | number,
  token: string,
): string {
  return `${patch.SSE_URL}${tenantId}/${memberId}/${generateSessionId()}?grantType=2&token=${encodeURIComponent(token)}`;
}


