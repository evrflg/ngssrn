/**
 * 防止运营/接口误把图片 data URL、超长 base64 写进「路由或外链」，
 * 进地址栏后触发 431、414、或整页异常。
 */

/** 单条链接总长上限（含 query）；正常站内路径足够，可拦 data URL */
export const MAX_NAV_LINK_LENGTH = 4096;

/** 解码 CMS 里常见的 HTML 实体，并去掉首尾引号 */
export function sanitizeNavigationLink(raw: string): string {
  let s = raw
    .trim()
    .replace(/&quot;/gi, '"')
    .replace(/&#0*34;/g, '"')
    .replace(/&#x0*22;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  s = s.replace(/^["'«»]+|["'«»]+$/g, "").trim();
  return s;
}

/** 不可用于 router.push / Linking.openURL 的目标（data URL、过长等） */
export function isUnsafeNavigationTarget(link: string): boolean {
  if (!link || !link.trim()) return true;
  if (link.length > MAX_NAV_LINK_LENGTH) return true;
  const lower = link.toLowerCase();
  if (lower.startsWith("data:")) return true;
  if (lower.startsWith("javascript:") || lower.startsWith("vbscript:"))
    return true;
  if (lower.includes(";base64,")) return true;
  return false;
}
