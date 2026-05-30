import { getCachedParams } from "@/utils/url";

/**
 * PWA Manifest 配置接口
 */
export interface PWAManifestConfig {
  name: string; // 应用完整名称
  short_name: string; // 应用短名称
  description?: string; // 应用描述
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }>;
  theme_color?: string; // 主题颜色
  background_color?: string; // 背景颜色
  display?: "standalone" | "fullscreen" | "minimal-ui" | "browser";
  start_url?: string; // 启动 URL
  scope?: string; // 作用域
  orientation?: "any" | "portrait" | "landscape";
  protocol_handlers?: Array<{
    protocol: string;
    url: string;
  }>;
  related_applications?: Array<{
    platform: string;
    url: string;
  }>;
  prefer_related_applications?: boolean;
  handle_links?: "preferred" | "auto";
}

/**
 * PWA Manifest 动态生成 Composable
 */
export function usePWAManifest() {
  let manifestUrl = "";
  let manifestLinkElement = null;

  /**
   * 设置 Manifest Link（带查询参数）
   * 在页面加载早期动态设置 manifest link，并将 URL 查询参数附加到 manifest 请求中
   * 这样后端可以从查询参数中获取必要信息（如 templateId、ch 等）
   *
   * 注意：URL 查询参数长度限制
   * - IE/Edge: 2,083 字符
   * - Chrome: 约 32,779 字符
   * - 建议安全长度: < 2,000 字符
   */
  const setupManifestLink = (params: PWAManifestConfig, appId: string): boolean => {
    try {
      // 检查是否已存在 manifest link
      const existingLink = document.querySelector('link[rel="manifest"]');
      if (existingLink) {
        return true;
      }

      // 将整个 params 对象序列化为 JSON，并作为一个查询参数传递
      const paramsJson = JSON.stringify(params);
      const encodedParams = encodeURIComponent(paramsJson);

      // 构建 manifest URL（整个 params 作为 forward 参数）
      const manifestHref = `${process.env.NODE_ENV === "development" ? "/dev/api" : "/api"}/app-api/ops/app-store-template/build-manifest?appId=${appId}&forward=${encodedParams}`;

      // 检查 URL 长度
      if (manifestHref.length > 2000) {
        console.warn(
          `⚠️ Manifest URL 长度过长: ${manifestHref.length} 字符，可能在某些浏览器中失败`,
        );
      }

      // 如果已失败3次，跳过创建
      const errorCount = parseInt(sessionStorage.getItem("manifest_api_error_count") || "0");
      if (errorCount >= 3) {
        return false;
      }

      // 创建并注入 manifest link
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = manifestHref;
      document.head.appendChild(link);

      manifestLinkElement = link;
      manifestUrl = link.href;

      // 检测接口是否可用
      fetch(manifestHref, { method: "HEAD", cache: "no-cache" })
        .then((response) => {
          if (response.ok) {
            // 成功，清除失败记录
            sessionStorage.removeItem("manifest_api_error_count");
            return;
          }

          // 失败，增加计数
          const count = errorCount + 1;
          sessionStorage.setItem("manifest_api_error_count", String(count));

          // 移除 link
          link.remove();
          manifestLinkElement = null;
          manifestUrl = "";
        })
        .catch(() => {
          // fetch 失败忽略
        });

      return true;
    } catch (error) {
      console.error("设置 Manifest Link 失败:", error);
      return false;
    }
  };

  /**
   * 从应用信息更新 PWA Manifest（高级封装）
   * @param appInfo 应用信息对象
   * @returns 是否成功更新
   */
  const updatePWAManifestFromAppInfo = (appInfo: any): boolean => {
    if (!appInfo) {
      console.warn("没有应用信息");
      return false;
    }

    // 提取应用信息
    const appName = appInfo?.appStore?.appName || document.title || "App";
    const appDescription = appInfo?.appStore?.appDescription || document.title || "PWA APP";
    // 强制替换图标域名
    const appIcon = appInfo?.appStore?.appIcon;

    // 检查图标
    if (!appIcon) {
      console.warn("没有图标，PWA Manifest 无法生成");
      return false;
    }

    // 检查安装类型
    const installType = appInfo?.installType;
    if (installType !== 0 && installType !== 2) {
      return false;
    }

    // 获取缓存的参数
    const cachedParams = getCachedParams();
    const currentOrigin = window.location.origin;
    // 生成 start_url
    const startUrl = cachedParams
      ? `${currentOrigin}/rn-h5/home?${cachedParams}`
      : `${currentOrigin}/rn-h5/home?fromPwa=true`;
    // 生成图标配置
    const icons = [
      {
        src: appIcon,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ];

    // 更新 manifest
    const success = setupManifestLink(
      {
        name: appName,
        short_name: appName,
        description: appDescription,
        icons,
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: startUrl,
        scope: "/rn-h5/",
        orientation: "portrait",
        protocol_handlers: [
          {
            protocol: "web+app", //web+后面只能跟 ASCII 字母（a-z, A-Z）
            url: "/rn-h5/?%s", ///rn-h5 将参数放在 # 号前面，这样路由切换时不会丢失参数
          },
        ],
        handle_links: "preferred",
      },
      appInfo.appId || appInfo.appStore?.appId,
    );

    if (success) {
      
    }

    return success;
  };

  return {
    manifestUrl,
    manifestLinkElement,
    updatePWAManifestFromAppInfo,
  };
}
