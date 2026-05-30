import { Dimensions, Platform, useWindowDimensions } from "react-native";

const isWeb = Platform.OS === 'web';
const screenWidth = Dimensions.get('window').width;

export const MAX_WIDTH = 480;

export function useMaxWidth() {
  const maxWidth = isWeb ? Math.min(MAX_WIDTH, screenWidth) : screenWidth;

  return { width: screenWidth, maxWidth };
}

/**
 * 动态宽度：宽度会随着窗口尺寸变化而更新。
 */
export function useDynamicMaxWidth() {
  const { width: liveWidth } = useWindowDimensions();
  const maxWidth = isWeb ? Math.min(MAX_WIDTH, liveWidth) : liveWidth;

  return { width: liveWidth, maxWidth };
}
