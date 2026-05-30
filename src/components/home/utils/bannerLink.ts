import { reedType, reedUrl } from "@/constants/reedData";
import { router } from "expo-router";
import { Linking } from "react-native";
import { openLuckyWheel, openRedPacketRain } from "../../../hooks/reed/reedJump";

type ToastLike = { error: (msg: string) => void };

export function isValidBannerLink(link: string | undefined | null): boolean {
  if (!link) return false;
  const trimmedLink = link.trim();
  if (/^\d+$/.test(trimmedLink)) return false;
  if (!trimmedLink.includes("/") && !trimmedLink.includes(".")) return false;
  // 外链：必须是 http/https 且能被 URL 解析
  if (trimmedLink.startsWith("http://") || trimmedLink.startsWith("https://")) {
    try {
      const url = new URL(trimmedLink);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  // 站内：必须以 / 开头，且不是纯数字路径（和 web 逻辑保持一致）
  if (trimmedLink.startsWith("/")) {
    return !/^\d+$/.test(trimmedLink.replace(/^\//, ""));
  }

  return false;
}

/** 轮播 openLink 跳转 */
export async function handleBannerOpenLink(
  openLink: string | undefined | null,
  toast: ToastLike,
  t: (key: string) => string,
): Promise<void> {
  const link = openLink?.trim();
  if (!link) return;

  if (link === "/lucky-wheel") {
    await openLuckyWheel(toast, t);
    return;
  }
  if (link === "/red-packet") {
    await openRedPacketRain(toast, t);
    return;
  }
  if (link === "/chat-room") {
    router.navigate({ pathname: reedUrl, params: { toType: reedType.chatRoom } });
    return;
  }

  if (!isValidBannerLink(link)) {
    console.warn("无效地址", link);
    return;
  }

  try {
    if (link.startsWith("http://") || link.startsWith("https://")) {
      const can = await Linking.canOpenURL(link);
      if (can) {
        await Linking.openURL(link);
      }
      return;
    }
    // 站内路由（允许带 query/hash），直接 push
    router.push(link as any);
  } catch {
    console.warn("轮播图跳转失败", link);
  }
}
