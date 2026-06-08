import { getRefreshTokenServer } from "@/api";
import { emitAuthLossIfNeeded } from "@/api/common/client";
import { AppDispatch, RootState } from "@/store/store";
import { changeSessionState, sessionStateAsync } from "@/store/user/userSlice";
import React, { createContext, useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const AuthContext = createContext({});

/** 回到前台时若剩余有效期不足该值，立即刷新（避免后台挂起导致 setTimeout 晚于过期时间） */
const FOREGROUND_REFRESH_BUFFER_MS = 2 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch: AppDispatch = useDispatch();
  const session = useSelector((state: RootState) => state.user.session);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const refreshSession = useCallback((token: string) => {
    getRefreshTokenServer({
      refreshToken: token,
      silentErrorToast: true,
    }).then(({ data }) => {
      if (data?.data) {
        dispatch(changeSessionState(data.data));
        return;
      }
      const code = Number(data?.code ?? data?.repCode);
      if (code === 401) {
        emitAuthLossIfNeeded();
        return;
      }
      // refresh-token 的 HTTP 401 被拦截器吞掉后无业务 code，按失效处理
      if (
        sessionRef.current?.accessToken &&
        typeof data?.msg === "string" &&
        /401|unauthorized|token/i.test(data.msg)
      ) {
        emitAuthLossIfNeeded();
      }
    });
  }, [dispatch]);
  //监听session跟新
  useEffect(() => {
    if (session?.accessToken && session?.refreshToken) {
      const expiresTime = new Date(session.expiresTime);
      const refreshTime = expiresTime.getTime() - Date.now() - 20 * 1000;
      if (refreshTime < 0) {
        if(session.refreshToken) {
          refreshSession(session.refreshToken);
        }
      } else {
        if (refreshIntervalRef.current) {
          clearTimeout(refreshIntervalRef.current);
        }
        refreshIntervalRef.current = setTimeout(() => {
          if(session.refreshToken) {
            refreshSession(session.refreshToken);
          }
        }, refreshTime);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearTimeout(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [session, refreshSession]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next !== "active") return;
      const s = sessionRef.current;
      if (!s?.accessToken || !s.refreshToken) return;
      const exp = new Date(s.expiresTime).getTime();
      if (Number.isNaN(exp)) return;
      if (exp - Date.now() < FOREGROUND_REFRESH_BUFFER_MS) {
        refreshSession(s.refreshToken);
      }
    });
    return () => sub.remove();
  }, [refreshSession]);

  useEffect(() => {
    dispatch(sessionStateAsync());
  }, []);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}
