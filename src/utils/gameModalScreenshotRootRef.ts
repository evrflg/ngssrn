import type { MutableRefObject } from "react";
import type { View } from "react-native";

/**
 * 全屏游戏 Modal（GameModel）内根 View 的 ref。
 * Android：`captureScreen` 只截主 Activity，不含 Modal 对话框层，会误截到底下首页；
 * 游戏打开时应优先 `captureRef(gameModalScreenshotRootRef, …)`。
 */
export const gameModalScreenshotRootRef: MutableRefObject<View | null> = {
  current: null,
};
