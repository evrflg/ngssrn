import GameModel from "@/components/home/components/GameModel";
import { usePathname } from "expo-router";
import React, { createContext, useCallback, useContext, useMemo } from "react";
import { DeviceEventEmitter } from "react-native";
import { ToastOptions } from "./constants";
import FloatingKH from "./FloatKF";
import Toast from "./Toast";
export interface ToastContext {
  error: (message: string, options?: ToastOptions) => void;
  warn: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  loading: (isShow: boolean, style?: any) => void;
}

const ToastContext = createContext<ToastContext | undefined>(undefined);

export const useToast = (): ToastContext => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// 独立组件监听 pathname，避免 ToastProvider 因路由变化整体重渲染
function FloatingKHGuard() {
  const pathname = usePathname();
  if (pathname === '/my/customerService') return null;
  if (pathname === '/common/maintenance') return null;
  return <FloatingKH />;
}

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const loading = useCallback(
    (isShow: boolean, style?: any) => {
      DeviceEventEmitter.emit('showLoading', { isShow:isShow,style:style });
    },
    []
  )

  const error = useCallback(
    (message: string, option?: ToastOptions) => {
      DeviceEventEmitter.emit('showErrMsg', { msg:message });
    },
    []
  );

  const warn = useCallback(
    (message: string, option?: ToastOptions) => {
      DeviceEventEmitter.emit('showWarnMsg', { msg:message });
    },
    []
  );

  const success = useCallback(
    (message: string, option?: ToastOptions) => {
      DeviceEventEmitter.emit('showSuccessMsg', { msg:message });
    },
    []
  );

  // 稳定的 context value，避免每次渲染创建新对象导致 89 个消费组件重渲染
  const value = useMemo(() => ({ error, warn, success, loading }), [error, warn, success, loading]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast/>
      <GameModel />
      <FloatingKHGuard />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
