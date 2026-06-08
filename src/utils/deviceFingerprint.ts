/**
 * 原生端（iOS / Android）设备指纹
 * - iOS：IDFV（react-native-device-info getUniqueId）
 * - Android：ANDROID_ID
 * - 兜底：本地持久化随机 ID
 */
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { getStorage, setStorage } from "@/utils/storage";

const STORAGE_KEY = "ngss-rn-device-fingerprint";

let cachedFingerprint: string | null = null;
let initPromise: Promise<string> | null = null;

async function createFallbackId(): Promise<string> {
  const existing = await getStorage(STORAGE_KEY);
  if (existing) return existing;

  const id = `${Platform.OS}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
  await setStorage(STORAGE_KEY, id);
  return id;
}

async function resolveNativeFingerprint(): Promise<string> {
  try {
    const uniqueId = await DeviceInfo.getUniqueId();
    if (uniqueId && uniqueId !== "unknown") {
      return uniqueId;
    }
  } catch {
    // 权限或 API 不可用时走兜底
  }
  return createFallbackId();
}

export function getCachedFingerprint(): string | null {
  return cachedFingerprint;
}

export async function getFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint;

  if (!initPromise) {
    initPromise = resolveNativeFingerprint().then((id) => {
      cachedFingerprint = id;
      return id;
    });
  }
  return initPromise;
}
