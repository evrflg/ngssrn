import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** 为 true 时，该请求失败不触发全局错误 Toast（与 URLSearchParams 中的 hideToast 等价） */
    silentErrorToast?: boolean;
    customData?: {
      hideToast?: boolean | string;
      toastDuration?: string;
    };
  }
}
