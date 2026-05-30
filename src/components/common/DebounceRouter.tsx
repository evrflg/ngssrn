import { router } from "expo-router";

/**
 * 用法：DebounceRouter.replace('/')
 * 全局单例防抖，防止多次点击重复跳转。
 */
const debounceLock: { [key: string]: boolean } = {};
const wait = 1000;

function debounceMethod(methodName: keyof typeof router) {
  return (...args: any[]) => {
    if (!debounceLock[methodName]) {
      debounceLock[methodName] = true;
      // @ts-ignore
      router[methodName](...args);
      setTimeout(() => {
        debounceLock[methodName] = false;
      }, wait);
    }
  };
}

export const DebounceRouter = {
  ...router,
  push: debounceMethod("push"),
  replace: debounceMethod("replace"),
  back: debounceMethod("back"),
}; 