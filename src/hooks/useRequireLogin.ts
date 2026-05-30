import { useCallback } from "react";
import { useSelector } from "react-redux";
import { router } from "expo-router";
import type { RootState } from "@/store/store";

/**
 * 统一的登录校验 Hook：
 * - ensureLogin(): 未登录时跳转登录页并返回 false；已登录返回 true
 * - isLogin: 当前是否已登录
 */
export function useRequireLogin() {
  const isLogin = useSelector(
    (state: RootState) => !!state.user.userInfo?.isLogin,
  );

  const ensureLogin = useCallback(() => {
    if (!isLogin) {
      router.push("/login");
      return false;
    }
    return true;
  }, [isLogin]);

  return { isLogin, ensureLogin };
}

