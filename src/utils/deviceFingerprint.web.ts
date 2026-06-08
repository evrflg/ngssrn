/**
 * Web / H5 / PWA 设备指纹
 * - 优先读本地缓存，减少重复计算
 * - 首次使用 FingerprintJS 生成 visitorId
 * - 失败时降级为本地持久化随机 ID
 */
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { getStorage, setStorage } from "@/utils/storage";

const STORAGE_KEY = "ngss-rn-device-fingerprint";

let cachedFingerprint: string | null = null;
let initPromise: Promise<string> | null = null;

async function createFallbackId(): Promise<string> {
  const existing = await getStorage(STORAGE_KEY);
  if (existing) return existing;

  const id = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
  await setStorage(STORAGE_KEY, id);
  return id;
}

async function resolveWebFingerprint(): Promise<string> {
  const stored = await getStorage(STORAGE_KEY);
  if (stored) return stored;

  try {
    const agent = await FingerprintJS.load();
    const { visitorId } = await agent.get();
    await setStorage(STORAGE_KEY, visitorId);
    return visitorId;
  } catch {
    return createFallbackId();
  }
}

export function getCachedFingerprint(): string | null {
  return cachedFingerprint;
}

export async function getFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint;

  if (!initPromise) {
    initPromise = resolveWebFingerprint().then((id) => {
      cachedFingerprint = id;
      return id;
    });
  }
  return initPromise;
}
