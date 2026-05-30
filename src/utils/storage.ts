/**
 * 缓存处理工具（AsyncStorage + Web Cookie）
 *
 * 说明：
 * - 原有逻辑只使用 AsyncStorage，在原生 App 场景下没有问题；
 * - 在 iOS Safari 与「添加到主屏幕」的 Web App 之间，localStorage / AsyncStorage 彼此隔离，
 *   但 Cookie 是共享的；
 * - 为了让 ngss-rn 的 Web 版在 Safari 登录后，PWA 也能保持登录，这里增加一层基于 Cookie 的
 *   session 同步（仅在 Platform.OS === 'web' 时生效）。
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export const setStorage = async (key: string, value?: any) => {
  try {
    if (value === undefined || value === null) {
      await AsyncStorage.removeItem(key);
      return;
    }
    return await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error("storage =>", e);
  }
};

export const setStoreJson = async (key: string, value?: any) => {
  try {
    if (value === undefined || value === null) {
      await AsyncStorage.removeItem(key);
      return;
    }
    return await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("storage =>", e);
  }
};

export const getStorage = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    console.error("storage =>", e);
    return null;
  }
};

export const getStoreJson = async (key: string) => {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) || null : null;
  } catch (e) {
    console.error("storage =>", e);
    return null;
  }
};

export const removeStorage = async (key: string) => {
  try {
    return await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error("storage =>", e);
  }
};

// 清除所有缓存
export const clearStorage = async () => {
  try {
    AsyncStorage.clear();
  } catch (e) {
    console.error("storage =>", e);
  }
};

// 得到缓存大小，计算的是字符串的字节大小
export const getSizeStorage = async () => {
  return new Promise((resolve, reject) => {
    try {
      AsyncStorage.getAllKeys((err, keys) => {
        if (err) {
          reject(err);
        } else {
          let size = 0;
          const getSize = (index: number) => {
            if (keys) {
              if (index >= keys.length) {
                resolve(size);
                return;
              }
              AsyncStorage.multiGet([keys[index]], (err2, result) => {
                if (err2) {
                  reject(err2);
                } else {
                  const value = result && result[0][1];
                  size += value ? value.length : 0;
                  getSize(index + 1);
                }
              });
            }
          };
          getSize(0);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

// =========================
// Web 端 Session Cookie 支持
// =========================

const SESSION_COOKIE_KEY = "ngss_session";

const setCookie = (name: string, value: string, days: number = 30) => {
  if (!isWeb) return;
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(
      value,
    )}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch (e) {
    console.error("setCookie error =>", e);
  }
};

const getCookie = (name: string): string | null => {
  if (!isWeb) return null;
  try {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i += 1) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  } catch (e) {
    console.error("getCookie error =>", e);
    return null;
  }
};

const deleteCookie = (name: string) => {
  if (!isWeb) return;
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  } catch (e) {
    console.error("deleteCookie error =>", e);
  }
};

/**
 * 将 session 数据写入 Cookie（仅 Web 有效）
 * 期望结构与后端登录返回的 data 一致：{ accessToken, refreshToken, expiresTime, ... }
 */
export const setSessionCookie = (session: any) => {
  if (!isWeb) return;
  try {
    let days = 30;
    if (session?.expiresTime) {
      const expires = new Date(session.expiresTime);
      if (!Number.isNaN(expires.getTime())) {
        const diffDays = Math.ceil(
          (expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays > 0) {
          days = diffDays;
        }
      }
    }
    setCookie(SESSION_COOKIE_KEY, JSON.stringify(session), days);
  } catch (e) {
    console.error("setSessionCookie error =>", e);
  }
};

/**
 * 从 Cookie 读取 session 数据（仅 Web 有效）
 */
export const getSessionCookie = (): any | null => {
  if (!isWeb) return null;
  try {
    const val = getCookie(SESSION_COOKIE_KEY);
    if (!val) return null;
    return JSON.parse(val);
  } catch (e) {
    console.error("getSessionCookie error =>", e);
    return null;
  }
};

export const deleteSessionCookie = () => {
  deleteCookie(SESSION_COOKIE_KEY);
};

