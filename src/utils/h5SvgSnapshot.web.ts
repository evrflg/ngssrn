/**
 * H5 截图：`html-to-image` 克隆 DOM → **toSvg**（`foreignObject`）。
 * 视口结果可先返回 **SVG data URL** 以尽快开弹窗；**PNG** 由 `rasterizeSvgDataUrlToPng` 在弹窗后异步栅格化。
 * 弹窗内单节点合成仍在本模块内 **toSvg → PNG**（在 `buildWebUpload` 路径上，不阻塞首次开框）。
 */

import { MAX_WIDTH } from "@/hooks/useMaxWidth";
import { toSvg } from "html-to-image";

type ToSvgOptions = NonNullable<Parameters<typeof toSvg>[1]>;

const SNAPSHOT_STYLE_ID = "ngss-h5-svg-snapshot-style";

/**
 * 超长页视口截图：克隆根上只用「当前滚动位置 + 一屏 + 缓冲」参与盒模型与裁剪，
 * 视口以下/右侧不参与布局（与整页 `minHeight: scrollHeight` 相比可明显减负；产品已接受语义差异）。
 * `captureWebScreen.web.ts` 等图范围与此对齐，避免多等视口外图片。
 */
export const VIEWPORT_SNAPSHOT_LAYOUT_BUFFER_PX = 80;

/**
 * 根下 `<img>` 数量 ≥ 此值且未 shrink layout 时，仍启用视口几何过滤。
 * 避免单屏首页 200+ 懒加载图全部进入 html-to-image 克隆与 SVG 内嵌（toSvg 数秒、串体积数十 MB）。
 */
const VIEWPORT_FORCE_GEOMETRY_MIN_ROOT_IMGS = 48;

/**
 * 视口 toSvg：只拷贝 `VIEWPORT_TO_PNG_STYLE_PROPERTIES` 中的 computed 样式（可明显提速）。
 * 默认关闭：RN Web + 白名单不全时易出现整屏黑/透明，需逐项补属性并回归后再改为 true。
 */
const VIEWPORT_USE_INCLUDE_STYLE_PROPERTIES = false;

/** 与 CSSStyleDeclaration 驼峰名一致；按 RN Web 常见布局/文字/圆角/阴影补全 */
const VIEWPORT_TO_PNG_STYLE_PROPERTIES: string[] = [
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "inset",
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "boxSizing",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "border",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "borderTopStyle",
  "borderRightStyle",
  "borderBottomStyle",
  "borderLeftStyle",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius",
  "flex",
  "flexDirection",
  "flexWrap",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "justifyContent",
  "alignItems",
  "alignSelf",
  "alignContent",
  "gap",
  "rowGap",
  "columnGap",
  "backgroundColor",
  "backgroundImage",
  "backgroundSize",
  "backgroundPosition",
  "backgroundPositionX",
  "backgroundPositionY",
  "backgroundRepeat",
  "backgroundClip",
  "opacity",
  "visibility",
  "overflow",
  "overflowX",
  "overflowY",
  "transform",
  "transformOrigin",
  "boxShadow",
  "zIndex",
  "color",
  "fontSize",
  "fontWeight",
  "fontFamily",
  "fontStyle",
  "lineHeight",
  "textAlign",
  "textDecoration",
  "textDecorationLine",
  "textDecorationColor",
  "textDecorationStyle",
  "textOverflow",
  "whiteSpace",
  "wordBreak",
  "letterSpacing",
  "verticalAlign",
  "objectFit",
  "objectPosition",
  "outline",
  "outlineWidth",
  "outlineStyle",
  "outlineColor",
  "pointerEvents",
  "cursor",
  "filter",
  "backdropFilter",
  "isolation",
  "mixBlendMode",
  "clipPath",
  "WebkitLineClamp",
  "WebkitBoxOrient",
  "WebkitTapHighlightColor",
];

/** 注入到截图根节点内，随克隆进入 foreignObject */
function getInjectedCss(): string {
  return `
    * { animation: none !important; transition: none !important; }
    html, body { scroll-behavior: auto !important; }
    noscript {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
      position: absolute !important;
      left: -9999px !important;
    }
    .icon {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    svg {
      vertical-align: middle !important;
      flex-shrink: 0 !important;
    }
  `;
}

function installSnapshotStyle(target: HTMLElement): () => void {
  const style = document.createElement("style");
  style.id = SNAPSHOT_STYLE_ID;
  style.textContent = getInjectedCss();
  target.insertBefore(style, target.firstChild);
  return () => {
    style.remove();
  };
}

/** html-to-image：filter 返回 true 表示保留节点（排除子树可明显缩短 toSvg） */
function createDomSnapshotFilter(): (node: HTMLElement) => boolean {
  return (node: HTMLElement) => {
    if (node.getAttribute?.("data-snapshot-ignore") === "true") return false;
    const tag = node.tagName?.toUpperCase?.() ?? "";
    if (tag === "NOSCRIPT") return false;
    const t = tag.toLowerCase();
    if (t === "iframe" || t === "video" || t === "canvas") return false;
    const cls = node.className;
    /**
     * 勿匹配 `carousel`：首页 Banner、活动 VIP 等用 `react-native-reanimated-carousel`，
     * Web 上 class 常含 carousel，整棵被剔除会导致 Safari/Chrome 截图里 Banner/活动图全没。
     */
    if (
      typeof cls === "string" &&
      /skeleton|lottie|animation|marquee|swiper/i.test(cls)
    ) {
      return false;
    }
    return true;
  };
}

/**
 * 在「超长页 layout 已缩小」时启用：剔除与视口（±buf）不相交的子树，少克隆节点。
 * 单屏页（scroll≈视口）勿用：否则对每个节点 getBoundingClientRect，反而拖慢。
 */
function createViewportGeometryFilter(
  viewportW: number,
  viewportH: number,
  buf: number,
  base: (node: HTMLElement) => boolean,
): (node: HTMLElement) => boolean {
  return (node: HTMLElement) => {
    if (!base(node)) return false;
    let r: DOMRect;
    try {
      r = node.getBoundingClientRect();
    } catch {
      return true;
    }
    if (r.width <= 0 && r.height <= 0) return true;
    return (
      r.bottom > -buf &&
      r.right > -buf &&
      r.top < viewportH + buf &&
      r.left < viewportW + buf
    );
  };
}

/** 嵌入外链图用匿名 CORS；`same-origin` 与部分 CDN 的 `ACAOrigin: *` 组合会导致 fetch 失败 → 截图里游戏封面空白 */
const SNAPSHOT_FETCH_INIT: RequestInit = {
  credentials: "omit",
  mode: "cors",
};

/**
 * Safari：RN Web 的 `<Image>` 在 DOM 里是 `<div style="background-image:url(...)">`，
 * 它的 CORS 缓存与 `<img>` 元素不互通，`html-to-image` 内 `fetch(url, {mode:'cors'})`
 * 会重新发请求；CDN 若没设 `ACAOrigin: *` 就拉空 → CarouselBlock 的 Banner、Image 背景图整体缺失。
 *
 * 这里在 `toSvg` 前对 target 子树里的 inline `background-image: url(http...)` 元素，
 * 用我们自己的 fetch 转 data URL 并改写 inline style；截完用返回的 `restore()` 还原。
 * 这样 html-to-image 看到的就是 data URL，无需再次 fetch，Chrome/Safari 表现一致。
 */
const BG_URL_RE = /url\(\s*(['"]?)([^)'"]+)\1\s*\)/g;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractBackgroundImageUrls(styleValue: string): string[] {
  const urls: string[] = [];
  BG_URL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = BG_URL_RE.exec(styleValue))) {
    const u = m[2];
    if (u && !/^data:/i.test(u)) urls.push(u);
  }
  return urls;
}

function isCrossOriginHttp(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    return new URL(url, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

function blobToDataUrl(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onerror = () => resolve(null);
    r.onload = () => resolve(typeof r.result === "string" ? r.result : null);
    r.readAsDataURL(blob);
  });
}

async function fetchAsSnapshotDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, SNAPSHOT_FETCH_INIT);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}

function bgImageDelayMs(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 预 fetch target 子树里 inline `background-image: url(http...)` 中的跨域资源，并把 URL 替换为 data URL。
 * 返回 `restore()`，必须在 `toSvg` 完成后调用以还原 inline style，避免遗留巨大 inline data URL 影响后续 DOM。
 */
async function prepareCrossOriginBackgroundImages(
  target: HTMLElement,
  totalCapMs = 2200,
): Promise<{ restore: () => void; stats: { elements: number; urls: number; resolved: number; ms: number } }> {
  const t0 = nowMs();
  const restores: Array<() => void> = [];
  const stats = { elements: 0, urls: 0, resolved: 0, ms: 0 };

  let els: HTMLElement[] = [];
  try {
    els = Array.from(target.querySelectorAll<HTMLElement>('[style*="background-image"]'));
  } catch {
    return { restore: () => undefined, stats };
  }
  if (els.length === 0) {
    stats.ms = nowMs() - t0;
    return { restore: () => undefined, stats };
  }

  const urlSet = new Set<string>();
  for (const el of els) {
    const bg = el.style.backgroundImage || "";
    if (!bg) continue;
    for (const u of extractBackgroundImageUrls(bg)) {
      if (isCrossOriginHttp(u)) urlSet.add(u);
    }
  }
  stats.elements = els.length;
  stats.urls = urlSet.size;
  if (urlSet.size === 0) {
    stats.ms = nowMs() - t0;
    return { restore: () => undefined, stats };
  }

  const urlToDataUrl = new Map<string, string>();
  const fetches = Array.from(urlSet).map(async (u) => {
    const d = await fetchAsSnapshotDataUrl(u);
    if (d) urlToDataUrl.set(u, d);
  });
  await Promise.race([Promise.all(fetches), bgImageDelayMs(totalCapMs)]);
  stats.resolved = urlToDataUrl.size;
  if (urlToDataUrl.size === 0) {
    stats.ms = nowMs() - t0;
    return { restore: () => undefined, stats };
  }

  for (const el of els) {
    const original = el.style.backgroundImage;
    if (!original) continue;
    let replaced = original;
    let changed = false;
    for (const [u, d] of urlToDataUrl) {
      const re = new RegExp(`url\\((['"]?)${escapeRegExp(u)}\\1\\)`, "g");
      if (re.test(replaced)) {
        replaced = replaced.replace(re, `url("${d}")`);
        changed = true;
      }
    }
    if (changed) {
      el.style.backgroundImage = replaced;
      restores.push(() => {
        el.style.backgroundImage = original;
      });
    }
  }

  stats.ms = nowMs() - t0;
  return {
    restore: () => {
      for (const r of restores) {
        try {
          r();
        } catch {
          /* ignore */
        }
      }
    },
    stats,
  };
}

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function mergeToSvgOptions(partial: Partial<ToSvgOptions>): ToSvgOptions {
  return {
    ...partial,
    fetchRequestInit: SNAPSHOT_FETCH_INIT,
    cacheBust: partial.cacheBust ?? false,
    /** 默认 1，避免 devicePixelRatio 拉高画布与耗时；需要更清晰时再在 partial 里传 pixelRatio */
    pixelRatio: partial.pixelRatio ?? 1,
    /**
     * 大 DOM（整页视口）时字体内嵌极慢；跳过 / 空嵌入可明显缩短 toSvg，代价是部分自定义字体可能回退。
     */
    // skipFonts: partial.skipFonts ?? true,
    // fontEmbedCSS: partial.fontEmbedCSS ?? "",
  };
}

/**
 * 将 `toSvg` 产出的 `data:image/svg+xml...` 画到 Canvas，输出 `data:image/png;base64,...`。
 * 视口截图可在弹窗打开后再调用，避免栅格化阻塞首帧。
 */
export function rasterizeSvgDataUrlToPng(
  svgDataUrl: string,
  rasterOpts?: { backgroundColor?: string },
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("rasterizeSvgDataUrlToPng: no document"));
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      try {
        const w = Math.max(1, img.naturalWidth || img.width || 1);
        const h = Math.max(1, img.naturalHeight || img.height || 1);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("no canvas context"));
          return;
        }
        const bg = rasterOpts?.backgroundColor;
        if (bg) {
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    };
    img.onerror = () => reject(new Error("svg raster decode failed"));
    try {
      (img as HTMLImageElement & { decoding?: string }).decoding = "async";
    } catch {
      /* ignore */
    }
    img.src = svgDataUrl;
  });
}

/**
 * 是否在「首页 Tab」路由上（兼容 basePath：`/home`、`/rn-h5/home` 等）。
 */
function pathLooksLikeHomeTab(pathname: string): boolean {
  const p = (pathname.split("?")[0] || "").replace(/\/+$/, "") || "/";
  if (p === "/home") return true;
  const last = p.split("/").filter(Boolean).pop();
  return last === "home";
}

/** rect 与 scroll 同时为 0 视为「未参与布局」，不要选它做截图根 */
function hasUsableLayout(el: HTMLElement): boolean {
  try {
    const r = el.getBoundingClientRect();
    if (r.width >= 1 && r.height >= 1) return true;
    if (el.scrollWidth >= 1 && el.scrollHeight >= 1) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * 视口截图根：首页用 `#home-root`（PC 居中窄栏）；其它页用 `#root`。
 * PC 宽屏下 `#root` 的 toSvg 输出尺寸在 `captureViewportBodyToPngDataUrl` 内会按 `html` 客户端宽度收紧，与首页一致。
 * Portal 仅挂在 `body` 上时，视口图里可能不含该层。
 *
 * 防御：`#home-root` 偶现 0×0（截图前 `setIsCapturing/openModal` 触发的重排刚好把 `flex-1` 锁在 flex-basis:0%，
 * 或异步 `<Index>` 内部还没量好高），命中后 toSvg 出来就是 1×1 的空图。这里若发现命中的元素 0 尺寸，
 * 顺位降级 `#home-root → #root → body`，确保拿到一个真正在布局里的根。
 */
export function getViewportCaptureRoot(): HTMLElement {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const homeRoot = document.getElementById("home-root");
  if (homeRoot && pathLooksLikeHomeTab(pathname) && hasUsableLayout(homeRoot)) {
    return homeRoot;
  }
  const root = document.getElementById("root");
  if (root && hasUsableLayout(root)) return root;
  const body = document.body;
  if (!body) {
    throw new Error("captureViewport: root and body are missing");
  }
  return body;
}

/**
 * 当前视口截图：返回 **`data:image/svg+xml...`**（不经 PNG 栅格化，便于弹窗先开）。
 * 输出尺寸仍为 window 视口宽高 + 当前 scroll 偏移；超长页见 layout 裁剪说明。
 * @param rootOverride 若由 `captureWebScreen` 传入与 `waitForSubtreeImages` 相同的根，可避免重复 `getViewportCaptureRoot()`。
 */
export async function captureViewportBodyToPngDataUrl(
  rootOverride?: HTMLElement | null,
): Promise<string> {
  const tCap0 = nowMs();
  const target = rootOverride ?? getViewportCaptureRoot();
  const tAfterResolveRoot = nowMs();

  const windowViewportW = window.innerWidth;
  const windowViewportH = window.innerHeight;

  /**
   * PC 窄栏视口导出（与弹窗 `contain` 预览一致）：
   * - 首页：`#home-root` 为居中内容列；
   * - 其它页：`#root` 在 RN Web 上常为整窗宽，但全局已在 `html` 上 `max-width` 居中（见 `_layout`），
   *   若仍按 `innerWidth` toSvg，会得到超宽图 → 弹框里显得很小且不居中。
   */
  const pcHomeRoot = target.id === "home-root";
  const pcRootNarrow =
    !pcHomeRoot &&
    windowViewportW > MAX_WIDTH &&
    target.id === "root";
  const useNarrowViewportToSvg = pcHomeRoot || pcRootNarrow;

  /** 多源取最小但忽略 ≤0：避免 `home-root` 偶现 0×0 时把 captureOut 锁成 1×1（截到 46MB 空图） */
  const minPositive = (...vals: number[]): number => {
    let best = Number.POSITIVE_INFINITY;
    for (const v of vals) {
      if (Number.isFinite(v) && v > 0 && v < best) best = v;
    }
    return Number.isFinite(best) ? best : 0;
  };

  let captureOutW = windowViewportW;
  let captureOutH = windowViewportH;
  let sx = window.scrollX || 0;
  let sy = window.scrollY || 0;
  if (pcHomeRoot) {
    const r = target.getBoundingClientRect();
    const w = minPositive(r.width, target.scrollWidth, windowViewportW);
    const h = minPositive(r.height, target.scrollHeight, windowViewportH);
    captureOutW = Math.max(1, Math.round(w || windowViewportW));
    captureOutH = Math.max(1, Math.round(h || windowViewportH));
    const scrollsY = target.scrollHeight > target.clientHeight + 2;
    const scrollsX = target.scrollWidth > target.clientWidth + 2;
    sx = scrollsX ? target.scrollLeft : window.scrollX || 0;
    sy = scrollsY ? target.scrollTop : window.scrollY || 0;
  } else if (pcRootNarrow) {
    const r = target.getBoundingClientRect();
    const doc = document.documentElement;
    const docClientW = doc?.clientWidth ?? 0;
    const docClientH = doc?.clientHeight ?? 0;
    const w = minPositive(r.width, docClientW, target.scrollWidth, windowViewportW);
    const h = minPositive(r.height, docClientH, target.scrollHeight, windowViewportH);
    captureOutW = Math.max(1, Math.round(w || windowViewportW));
    captureOutH = Math.max(1, Math.round(h || windowViewportH));
    const scrollsY = target.scrollHeight > target.clientHeight + 2;
    const scrollsX = target.scrollWidth > target.clientWidth + 2;
    sx = scrollsX ? target.scrollLeft : window.scrollX || 0;
    sy = scrollsY ? target.scrollTop : window.scrollY || 0;
  }

  const scrollW = useNarrowViewportToSvg
    ? Math.max(target.scrollWidth, captureOutW)
    : Math.max(
        target.scrollWidth,
        document.documentElement.scrollWidth,
        windowViewportW,
      );
  const scrollH = useNarrowViewportToSvg
    ? Math.max(target.scrollHeight, captureOutH)
    : Math.max(
        target.scrollHeight,
        document.documentElement.scrollHeight,
        windowViewportH,
      );

  const buf = VIEWPORT_SNAPSHOT_LAYOUT_BUFFER_PX;
  /** 文档坐标下，从 (0,0) 起至少要容纳 translate(-sx,-sy) 后落在视口内的那一截 */
  const layoutW = Math.min(scrollW, sx + captureOutW + buf);
  const layoutH = Math.min(scrollH, sy + captureOutH + buf);
  const layoutReduced = layoutW < scrollW || layoutH < scrollH;
  const rootImgCount = target.querySelectorAll("img").length;
  const forceViewportGeometry =
    !layoutReduced && rootImgCount >= VIEWPORT_FORCE_GEOMETRY_MIN_ROOT_IMGS;
  const useViewportGeometry = layoutReduced || forceViewportGeometry;
  const baseFilter = createDomSnapshotFilter();
  const filter = useViewportGeometry
    ? createViewportGeometryFilter(windowViewportW, windowViewportH, buf, baseFilter)
    : baseFilter;
  const tAfterLayoutFilter = nowMs();

  const dispose = installSnapshotStyle(target);
  const tAfterInject = nowMs();
  /** Safari 修复：RN Web `<Image>` 是 `background-image` div，html-to-image 的 fetch 在 Safari 拉不下来；先自己 fetch 成 data URL 写回 inline，截完撤销 */
  const bgPrep = await prepareCrossOriginBackgroundImages(target);
  const tAfterBgPrep = nowMs();
  try {
    const tSvg = nowMs();
    const svgDataUrl = await toSvg(
      target,
      mergeToSvgOptions({
        width: captureOutW,
        height: captureOutH,
        //skipFonts: true,先不跳过字体抓取
        /** 超大 DOM 时跳过后续自动缩放步骤，常能省不少时间；输出仍是 width×height 视口 */
        skipAutoScale: true,
        ...(VIEWPORT_USE_INCLUDE_STYLE_PROPERTIES
          ? { includeStyleProperties: VIEWPORT_TO_PNG_STYLE_PROPERTIES }
          : {}),
        style: {
          transform: `translate(${-sx}px, ${-sy}px)`,
          width: `${layoutW}px`,
          height: `${layoutH}px`,
          maxWidth: `${layoutW}px`,
          maxHeight: `${layoutH}px`,
          overflow: "hidden",
          position: "relative",
          boxSizing: "border-box",
        } as Partial<CSSStyleDeclaration>,
        filter,
      }),
    );
    const tAfterSvg = nowMs();
    if (typeof __DEV__ === "undefined" || __DEV__) {
      const kb = (svgDataUrl.length / 1024).toFixed(1);
      const geoNote = layoutReduced
        ? " geo(layout)"
        : forceViewportGeometry
          ? ` geo(根下img=${rootImgCount}≥${VIEWPORT_FORCE_GEOMETRY_MIN_ROOT_IMGS})`
          : "";
      const pcNote = useNarrowViewportToSvg
        ? ` narrowViewport out=${captureOutW}×${captureOutH}${pcHomeRoot ? " home-root" : " root+docClient"}`
        : "";
      const bgNote = bgPrep.stats.urls > 0
        ? ` bgPrep ${(tAfterBgPrep - tAfterInject).toFixed(0)}ms（${bgPrep.stats.resolved}/${bgPrep.stats.urls} URL，${bgPrep.stats.elements} 元素）`
        : "";
      console.log(
        `[screenshot] viewport 分段：resolve根 ${(tAfterResolveRoot - tCap0).toFixed(1)}ms | 布局+filter ${(tAfterLayoutFilter - tAfterResolveRoot).toFixed(1)}ms | injectStyle ${(tAfterInject - tAfterLayoutFilter).toFixed(1)}ms |${bgNote} | **toSvg ${(tAfterSvg - tAfterBgPrep).toFixed(1)}ms** | 输出≈${kb}KiB | clip ${layoutW}×${layoutH} scroll ${scrollW}×${scrollH}${geoNote}${VIEWPORT_USE_INCLUDE_STYLE_PROPERTIES ? " minStyles" : ""}${pcNote}`,
      );
    }
    return svgDataUrl;
  } finally {
    const td = nowMs();
    bgPrep.restore();
    dispose();
    if (typeof __DEV__ === "undefined" || __DEV__) {
      console.log(
        `[screenshot] viewport: 移除注入样式/还原 bgImage dispose() +${(nowMs() - td).toFixed(1)}ms`,
      );
    }
  }
}

/**
 * 单节点（弹窗 gallery）：白底、pixelRatio 对应原 html2canvas `scale`
 */
export async function captureElementToPngDataUrl(
  el: HTMLElement,
  options: {
    backgroundColor?: string;
    pixelRatio?: number;
    cacheBust?: boolean;
  } = {},
): Promise<string> {
  const t0 = nowMs();
  const dispose = installSnapshotStyle(el);
  const tAfterInject = nowMs();
  /** 同 viewport：Safari 下 RN Web `<Image>` 的 `background-image` 需要预 fetch 成 data URL */
  const bgPrep = await prepareCrossOriginBackgroundImages(el);
  try {
    const tSvg = nowMs();
    const svgDataUrl = await toSvg(
      el,
      mergeToSvgOptions({
        pixelRatio: options.pixelRatio,
        backgroundColor: options.backgroundColor,
        cacheBust: options.cacheBust,
        filter: createDomSnapshotFilter(),
      }),
    );
    const tAfterToSvg = nowMs();
    const tPng = nowMs();
    const pngDataUrl = await rasterizeSvgDataUrlToPng(svgDataUrl, {
      backgroundColor: options.backgroundColor,
    });
    const tAfterRaster = nowMs();
    if (typeof __DEV__ === "undefined" || __DEV__) {
      const id = el.id ? `#${el.id}` : el.tagName.toLowerCase();
      let box = "";
      try {
        const r = el.getBoundingClientRect();
        box = ` rect≈${Math.round(r.width)}×${Math.round(r.height)}`;
      } catch {
        /* ignore */
      }
      const bgNote = bgPrep.stats.urls > 0
        ? ` | bgPrep ${bgPrep.stats.ms.toFixed(0)}ms（${bgPrep.stats.resolved}/${bgPrep.stats.urls} URL）`
        : "";
      console.log(
        `[screenshot] gallery ${id}: injectStyle ${(tAfterInject - t0).toFixed(1)}ms | **toSvg ${(tAfterToSvg - tSvg).toFixed(1)}ms** | rasterize→png ${(tAfterRaster - tPng).toFixed(1)}ms | svg串≈${(svgDataUrl.length / 1024).toFixed(1)}KiB${box} pr=${options.pixelRatio ?? 1}${bgNote}`,
      );
    }
    return pngDataUrl;
  } finally {
    const td = nowMs();
    bgPrep.restore();
    dispose();
    if (typeof __DEV__ === "undefined" || __DEV__) {
      console.log(
        `[screenshot] gallery: dispose(inject)+restore(bgImage) +${(nowMs() - td).toFixed(1)}ms`,
      );
    }
  }
}
