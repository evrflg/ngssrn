import { showNotificationPopup } from "@/components/common/NotificationPopup";
import { SseWebViewBridge, type SseBridgeEvent } from "@/components/common/sse/SseWebViewBridge";
import type { WinningInfo } from "@/store/bigWinning/bigWinningSlice";
import { showBigWinning } from "@/store/bigWinning/bigWinningSlice";
import { AppDispatch, RootState } from "@/store/store";
import { tenantStore } from "@/store/tenant/tenantSlice";
import { fetchUnreadMessageCount } from "@/store/user/userSlice";
import { usePathname } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RECONNECT_INTERVAL, type WebEventSourceInstance } from "./sseBuildUrl";
import { useSseNativeChannel } from "./useSseNativeChannel";
import { useSseWebChannel } from "./useSseWebChannel";

const isWeb = Platform.OS === "web";

interface ActivityPushPopupHandle {
  showPopup: (message: string) => void;
  show?: boolean;
}

/**
 * 用于管理 SSE（服务器发送事件）连接和活动推送通知的钩子。
 * - 原生：隐藏 WebView 内用浏览器 EventSource，postMessage 回 RN。
 * - Web：页面内 EventSource（与独立 H5 一致）；一般不必用 iframe。
 */
export const useSSE = (
  canShowCServiceAndActivityPopup: boolean,
  activityPushPopupRef: React.RefObject<ActivityPushPopupHandle | undefined>
) => {
  const pathname = usePathname();
  // 导航时 pathname 会变；SSE 回调里不能依赖闭包旧值，用 ref 始终读当前路由
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const dispatch = useDispatch<AppDispatch>();
  // 建立 SSE 连接需要 session、userInfo、tenantId
  const session = useSelector((s: RootState) => s.user.session);
  const userInfo = useSelector((s: RootState) => s.user.userInfo);
  const { tenantId } = useSelector(tenantStore);

  // 是否在游戏中
  const isShowGameModel = useSelector((s: RootState) => s.game.isShowGameModel);

  // 重连计时器（断线或条件未就绪时延迟再试）
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 活动推送弹出窗口计时器
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 活动推送弹出窗口关闭计时器
  const popupCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 以下 ref 每轮 render 同步，供回调里读最新 UI/登录态，避免把 pathname、弹窗开关写进 useCallback 依赖导致频繁重建
  // 是否可以显示活动推送弹出窗口
  const canShowRef = useRef(canShowCServiceAndActivityPopup);
  canShowRef.current = canShowCServiceAndActivityPopup;
  const isLoginRef = useRef(userInfo?.isLogin);
  isLoginRef.current = userInfo?.isLogin;
  const isGameRef = useRef(isShowGameModel);
  isGameRef.current = isShowGameModel;

  // 活动推送消息队列
  const [activityPushMessages, setActivityPushMessages] = useState<string[]>([]);
  /** 原生：非空时挂载隐藏 WebView 并连接该 SSE URL */
  const [nativeSseUrl, setNativeSseUrl] = useState<string | null>(null);
  /** 递增后强制重建连接（错误重连 / 条件从否变是） */
  const [nativeRestartNonce, setNativeRestartNonce] = useState(0);
  const lastSseUrlRef = useRef("");
  const webEventSourceRef = useRef<WebEventSourceInstance | null>(null);

  /**
   * 如果可用，则显示下一个活动推送弹出窗口。
   * 依赖项里不放 pathname / canShow / isLogin，改为上面 ref，避免每次路由切换重建整条 SSE 监听链。
   */
  const displayNextPopup = useCallback(() => {
    setActivityPushMessages((prev) => {
      if (!prev.length || activityPushPopupRef.current?.show) return prev;
      const message = prev[0];
      const path = pathnameRef.current || "";
      // 登录页、注册页不弹活动推送
      if (
        message &&
        canShowRef.current &&
        path !== "/login" &&
        path !== "/register" &&
        isLoginRef.current
      ) {
        activityPushPopupRef.current?.showPopup(message);
        return prev.slice(1);
      }
      return prev;
    });
  }, [activityPushPopupRef]);

  /**
   * 处理活动推送弹出窗口关闭事件（关闭后延迟再尝试队列中下一条）
   */
  const handleActivityPushClose = useCallback(() => {
    if (popupCloseTimerRef.current) clearTimeout(popupCloseTimerRef.current);
    popupCloseTimerRef.current = setTimeout(displayNextPopup, 1000);
  }, [displayNextPopup]);

  // 清除重连计时器
  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  // 清除活动推送弹出窗口计时器
  const clearPopupTimers = () => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }
    if (popupCloseTimerRef.current) {
      clearTimeout(popupCloseTimerRef.current);
      popupCloseTimerRef.current = null;
    }
  };

  // 断开 SSE（原生：卸 WebView；Web：close EventSource）
  const disconnect = useCallback(() => {
    setNativeSseUrl(null);
    if (isWeb) {
      webEventSourceRef.current?.close();
      webEventSourceRef.current = null;
    }
    clearReconnectTimer();
    clearPopupTimers();
  }, []);

  // WebView 内 EventSource → postMessage → 统一在此分发（与原先 addEventListener 分支一致）
  const handleSsePayload = useCallback(
    (type: string, data: string) => {
      if (type === "open") {
        // WebView 内 EventSource 已连接，此处无额外业务
        return;
      }
      if (type === "message") {
        // 已登出则不再处理（避免断连前最后一包误触）
        if (!isLoginRef.current) return;
        // 解析并展示全局消息通知
        showNotificationPopup(data ?? "");
        // 更新未读消息计数
        dispatch(fetchUnreadMessageCount());
        return;
      }
      if (type === "activity") {
        if (!isLoginRef.current) return;
        // 处理活动事件：入队 + 短延迟再调 displayNextPopup（合并高频推送）
        setActivityPushMessages((prev) =>
          [...prev, data ?? ""].slice(-20),
        );
        if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
        popupTimerRef.current = setTimeout(displayNextPopup, 100);
        return;
      }
      if (type === "game") {
        // 大中奖事件：某个玩家盈利达到阈值时，服务端推送给所有在线用户
        // 游戏打开时不展示大中奖推送
        if (isGameRef.current) return;
        // 仅在首页展示；pathnameRef 避免闭包拿到旧路径
        if (pathnameRef.current !== "/home" && pathnameRef.current !== "/")
          return;
        try {
          dispatch(showBigWinning(JSON.parse(data || "{}") as WinningInfo));
        } catch (e) {
          console.warn("Failed to parse big winning event data", e, data);
        }
        return;
      }
      if (type === "error") {
        // 桥里会传 JSON（readyState/url 等）或构造失败时的 message；无内容时说明是纯 onerror 且旧版桥未带详情
        let detail: unknown = data;
        if (data && typeof data === "string") {
          try {
            detail = JSON.parse(data) as unknown;
          } catch {
            detail = data;
          }
        }
        console.warn("[SSE] bridge error", detail);
        // 原生：卸 WebView；Web：close EventSource；延迟后 nonce 重建
        if (isWeb) {
          webEventSourceRef.current?.close();
          webEventSourceRef.current = null;
        } else {
          setNativeSseUrl(null);
        }
        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout(() => {
          setNativeRestartNonce((n) => n + 1);
        }, RECONNECT_INTERVAL);
      }
    },
    [dispatch, displayNextPopup],
  );

  // 原生桥接事件处理
  const onNativeBridgeEvent = useCallback((e: SseBridgeEvent) => {
    handleSsePayload(e.type, e.data);
  }, [handleSsePayload]);

  useSseWebChannel(isWeb, {
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
  });
  useSseNativeChannel(!isWeb, {
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
  });

  // 请留意活动弹出窗口的可用性（例如从游戏页返回大厅后尝试展示队列）
  useEffect(() => {
    if (!canShowCServiceAndActivityPopup) return;
    const t = setTimeout(displayNextPopup, 1000);
    return () => clearTimeout(t);
  }, [canShowCServiceAndActivityPopup, displayNextPopup]);

  // 当有消息入队时自动尝试显示下一条
  useEffect(() => {
    if (activityPushMessages.length > 0) displayNextPopup();
  }, [activityPushMessages.length, displayNextPopup]);

  // 仅原生渲染桥接 WebView；Web 为 null
  const sseWebView =
    !isWeb && nativeSseUrl
      ? React.createElement(SseWebViewBridge, {
        key: nativeSseUrl,
        url: nativeSseUrl,
        onEvent: onNativeBridgeEvent,
      })
      : null;

  return {
    activityPushMessages,
    handleActivityPushClose,
    disconnect,
    sseWebView,
  };
};
