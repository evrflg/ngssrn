import { buildHomeHrefWithEntryQuery } from "@/utils/navigation/entryQuery";
import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect, useRef } from "react";

/**
 * 统一将 tabs 根路由重定向到首页，避免 index 空页面导致黑屏。
 * 保留 URL 查询参数（如 id、promoCode 等）。
 */
const Index = () => {
  const router = useRouter();
  const navState = useRootNavigationState();
  const didRedirectRef = useRef(false);

  useEffect(() => {
    if (didRedirectRef.current || !navState?.key) return;
    didRedirectRef.current = true;
    router.replace(buildHomeHrefWithEntryQuery() as never);
  }, [router, navState]);

  return null;
};

export default Index;
