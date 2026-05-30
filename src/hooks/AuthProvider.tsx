import { getRefreshTokenServer } from "@/api";
import { AppDispatch, RootState } from "@/store/store";
import { changeSessionState, sessionStateAsync } from "@/store/user/userSlice";
import React, { createContext, useCallback, useEffect, useRef } from "react";
import { AppState, DeviceEventEmitter } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const AuthContext = createContext({});

/** 回到前台时若剩余有效期不足该值，立即刷新（避免后台挂起导致 setTimeout 晚于过期时间） */
const FOREGROUND_REFRESH_BUFFER_MS = 2 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch: AppDispatch = useDispatch();
  const session = useSelector((state: RootState) => state.user.session);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userInfo:any = useSelector((state: RootState) => state?.user?.userInfo);
  const sessionRef = useRef(session);
  const userInfoRef = useRef(userInfo);
  sessionRef.current = session;
  userInfoRef.current = userInfo;

  const refreshSession = useCallback((token: string) => {
    getRefreshTokenServer({
      refreshToken: token,
    }).then(({ data }) => {
      if (data.data) {
        dispatch(changeSessionState(data.data));
      } else {
        DeviceEventEmitter.emit("showErrMsg", {
          msg: data.msg || "Failed to refresh token",
        });
      }
    });
  }, [dispatch]);
  //监听session跟新
  useEffect(() => {
    if (session?.accessToken && userInfo?.isLogin) {
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
  }, [session, userInfo, refreshSession]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next !== "active") return;
      const s = sessionRef.current;
      const u = userInfoRef.current;
      if (!s?.accessToken || !u?.isLogin || !s.refreshToken) return;
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
