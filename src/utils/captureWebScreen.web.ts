import { InteractionManager, Platform } from "react-native";
import {
  captureViewportBodyToPngDataUrl,
  getViewportCaptureRoot,
  VIEWPORT_SNAPSHOT_LAYOUT_BUFFER_PX,
} from "@/utils/h5SvgSnapshot";

/**
 * 等待浏览器完成布局与绘制；单帧 rAF 往往仍早于 RN Web 提交 DOM。
 */
function raf(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function waitForPaint(frames: number) {
  return (async () => {
    for (let i = 0; i < frames; i += 1) {
      await raf();
    }
  })();
}

function afterInteractions(): Promise<void> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      resolve();
    });
  });
}

function shortDelayMs(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/**
 * 与视口截图 / CORS 准备一致：图是否「值得等」。
 * 仅用 window 视口时，Safari 下 `#home-root` 内部分 `<img>` 的 rect 与 window 相交判定会漏，
 * 导致 `prepareCors` / `waitSubtreeImages` 视口内 0 张 → 外链图未设 crossOrigin → toSvg 里图空。
 */
function isImgRelevantForSnapshot(
  im: HTMLImageElement,
  root: HTMLElement,
  viewportW: number,
  viewportH: number,
  buf: number,
): boolean {
  if (!viewportW || !viewportH) return true;
  if (im.closest?.("[data-snapshot-ignore=\"true\"]")) return false;
  const r = im.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return false;
  const inWindow =
    r.bottom > -buf &&
    r.right > -buf &&
    r.top < viewportH + buf &&
    r.left < viewportW + buf;
  if (inWindow) return true;
  try {
    const br = root.getBoundingClientRect();
    const inRootColumn =
      r.bottom > br.top - buf &&
      r.right > br.left - buf &&
      r.top < br.bottom + buf &&
      r.left < br.right + buf;
    return inRootColumn;
  } catch {
    return false;
  }
}

/**
 * 跨域游戏图等：若首次加载未带 `crossOrigin`，`html-to-image` 内 `fetch` 无法读像素，嵌入 SVG 后为空。
 * 在截图前对「视口内」外链 `img` 设 `anonymous` 并触发重载；超时偏紧以控制「等游戏」体感（封面多图并行，总帽不宜过大）。
 */
const PREPARE_CORS_PER_IMG_MS = 900;
const PREPARE_CORS_TOTAL_MS = 2200;

function imgNeedsCrossOriginPrepare(im: HTMLImageElement): boolean {
  const raw = (im.currentSrc || im.getAttribute("src") || im.src || "").trim();
  if (!/^https?:\/\//i.test(raw) || /^data:/i.test(raw)) return false;
  try {
    if (new URL(raw, window.location.href).origin === window.location.origin) {
      return false;
    }
  } catch {
    return false;
  }
  return im.crossOrigin !== "anonymous";
}

function prepareOneImgCorsForSnapshot(im: HTMLImageElement): Promise<void> {
  const raw = (im.currentSrc || im.getAttribute("src") || im.src || "").trim();
  if (!/^https?:\/\//i.test(raw) || /^data:/i.test(raw)) {
    return Promise.resolve();
  }
  let needsCrossOrigin = false;
  try {
    needsCrossOrigin =
      new URL(raw, window.location.href).origin !== window.location.origin;
  } catch {
    return Promise.resolve();
  }
  if (!needsCrossOrigin) return Promise.resolve();
  if (im.crossOrigin === "anonymous") return Promise.resolve();

  try {
    (im as HTMLImageElement & { loading?: string }).loading = "eager";
  } catch {
    /* ignore */
  }

  return new Promise((resolve) => {
    const t = setTimeout(resolve, PREPARE_CORS_PER_IMG_MS);
    const done = () => {
      clearTimeout(t);
      im.removeEventListener("load", onLoad);
      im.removeEventListener("error", onErr);
      resolve();
    };
    const onLoad = () => done();
    const onErr = () => done();
    im.addEventListener("load", onLoad, { once: true });
    im.addEventListener("error", onErr, { once: true });
    im.crossOrigin = "anonymous";
    const again = raw;
    im.removeAttribute("src");
    im.removeAttribute("srcset");
    void im.offsetHeight;
    im.src = again;
  });
}

function prepareCrossOriginRemoteImages(root: HTMLElement): Promise<void> {
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 0;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 0;
  const buf = VIEWPORT_SNAPSHOT_LAYOUT_BUFFER_PX;
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img")).filter((im) =>
    isImgRelevantForSnapshot(im, root, viewportW, viewportH, buf),
  );
  const toFix = imgs.filter((im) => imgNeedsCrossOriginPrepare(im));
  if (toFix.length === 0) {
    if (typeof __DEV__ === "undefined" || __DEV__) {
      console.log(
        `[screenshot] prepareCors: 视口内 img=${imgs.length}，无需 CORS 重载`,
      );
    }
    return Promise.resolve();
  }
  const t0 = nowMs();
  const pathname =
    typeof window !== "undefined" ? window.location.pathname || "" : "";
  const onActiveLike =
    /(^|\/)(active|missionCenter|activeCenter)(\/|$)/i.test(pathname) ||
    pathname.includes("/active/");
  const work = Promise.all(toFix.map((im) => prepareOneImgCorsForSnapshot(im))).then(
    () => undefined,
  );
  /** 需重载张数多时并行等最慢的一张，总帽略收；活动页外链封面多，略放宽 */
  const tightCap = onActiveLike ? 2200 : 1400;
  const totalCap =
    toFix.length > 24 ? Math.min(PREPARE_CORS_TOTAL_MS, tightCap) : PREPARE_CORS_TOTAL_MS;
  return Promise.race([work, shortDelayMs(totalCap)]).then(() => {
    if (typeof __DEV__ === "undefined" || __DEV__) {
      const elapsed = nowMs() - t0;
      console.log(
        `[screenshot] prepareCors: 视口内 img=${imgs.length}，需重载 ${toFix.length} 张，耗时 ${elapsed.toFixed(0)}ms（总帽 ${totalCap}ms）`,
      );
    }
  });
}

/**
 * 等待单张 `<img>` 可参与 toSvg 内嵌（decode）。
 * 注意：`complete && naturalWidth===0` 常见于懒加载占位或 AutoImage 尚未换成真图，不能立刻 resolve，
 * 否则 `waitSubtreeImages` 与总帽一到就 toSvg → 活动封面「有时有有时无」。
 */
function waitForOneImage(img: HTMLImageElement, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      if (typeof img.decode === "function") {
        img
          .decode()
          .then(() => resolve())
          .catch(() => resolve());
      } else {
        resolve();
      }
    };

    const t = setTimeout(finish, timeoutMs);
    const onDone = () => {
      clearTimeout(t);
      img.removeEventListener("load", onDone);
      img.removeEventListener("error", onErr);
      finish();
    };
    const onErr = onDone;

    if (img.complete && img.naturalWidth > 0) {
      clearTimeout(t);
      finish();
      return;
    }

    img.addEventListener("load", onDone, { once: true });
    img.addEventListener("error", onErr, { once: true });
  });
}

function waitForSubtreeImages(root: HTMLElement) {
  const list = root.querySelectorAll<HTMLImageElement>("img");
  if (list.length === 0) {
    if (typeof __DEV__ === "undefined" || __DEV__) {
      console.log(`[screenshot] waitSubtreeImages: 根下无 <img>`);
    }
    return Promise.resolve();
  }
  const pathname =
    typeof window !== "undefined" ? window.location.pathname || "" : "";
  const onActiveLike =
    /(^|\/)(active|missionCenter|activeCenter)(\/|$)/i.test(pathname) ||
    pathname.includes("/active/");
  /** 单图超时；活动列表封面多、CDN 慢，略加长 */
  const perImage = onActiveLike ? 1400 : 1100;
  /** 全局帽：原 650ms 易在「多张仍未 decode」时提前结束 → toSvg 偶发缺图 */
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 0;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 0;
  const buf = VIEWPORT_SNAPSHOT_LAYOUT_BUFFER_PX;
  const imgs = Array.from(list).filter((im) =>
    isImgRelevantForSnapshot(im, root, viewportW, viewportH, buf),
  );
  const baseCap = onActiveLike ? 2200 : 1400;
  const maxTotal = Math.min(3200, baseCap + imgs.length * 35);

  const t0 = nowMs();
  const work = Promise.all(imgs.map((im) => waitForOneImage(im, perImage))).then(
    () => undefined,
  );
  return Promise.race([work, shortDelayMs(maxTotal)]).then(() => {
    if (typeof __DEV__ === "undefined" || __DEV__) {
      const elapsed = nowMs() - t0;
      console.log(
        `[screenshot] waitSubtreeImages: 根下 img=${list.length}，待等 ${imgs.length} 张，耗时 ${elapsed.toFixed(0)}ms（总帽 ${maxTotal}ms activeLike=${onActiveLike}）`,
      );
    }
  });
}

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

/** 分阶段耗时：上一段到当前的增量 + 相对 capture 起点的累计 */
function logWebCaptureLap(
  phase: string,
  lapStart: number,
  captureT0: number,
): number {
  const t = nowMs();
  const segment = t - lapStart;
  const total = t - captureT0;
  console.log(
    `[screenshot] Web.capture ▶ ${phase}: +${segment.toFixed(0)}ms（累计 ${total.toFixed(0)}ms）`,
  );
  return t;
}

function waitFontsCappedMs(ms: number): Promise<void> {
  if (!document.fonts?.ready) {
    return Promise.resolve();
  }
  return Promise.race([
    document.fonts.ready as Promise<unknown>,
    shortDelayMs(ms),
  ]).then(
    () => undefined,
    () => undefined,
  );
}

/**
 * H5 / Expo Web 截图（当前视口）。
 * 实现：`html-to-image` 视口 `toSvg`（见 `h5SvgSnapshot.web.ts`）；顺序为 CORS 重载后再等子树图片。
 */
export async function captureWebScreenAsDataUrl(): Promise<string> {
  if (Platform.OS !== "web" || typeof document === "undefined") {
    throw new Error("captureWebScreen: web / DOM only");
  }
  const HARD_TIMEOUT_MS = 30_000;
  const hardTimeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("screenshot timeout")), HARD_TIMEOUT_MS);
  });

  const run = async () => {
    const t0 = nowMs();
    const root = getViewportCaptureRoot();
    if (typeof __DEV__ === "undefined" || __DEV__) {
      console.log(
        `[screenshot] Web.capture 开始：根 <${root.tagName.toLowerCase()}> id=${root.id || "—"} scroll≈${root.scrollWidth}×${root.scrollHeight} path=${window.location.pathname}`,
      );
    }
    let lap = nowMs();

    // 与「等字体」并行，并各自限时，避免串行把 450+550ms 叠满
    await Promise.all([
      Promise.race([afterInteractions(), shortDelayMs(180)]),
      waitFontsCappedMs(260),
    ]);
    lap = logWebCaptureLap("afterInteractions ∥ waitFonts（各自限时）", lap, t0);

    await waitForPaint(1);
    lap = logWebCaptureLap("waitForPaint×1（首帧 rAF）", lap, t0);

    /** 先 CORS 重载再统一等 decode，少等一截「即将被 src 重置换掉」的首包 */
    await prepareCrossOriginRemoteImages(root);
    lap = logWebCaptureLap("await prepareCrossOriginRemoteImages", lap, t0);

    await waitForSubtreeImages(root);
    lap = logWebCaptureLap("await waitForSubtreeImages", lap, t0);

    await waitForPaint(1);
    lap = logWebCaptureLap("waitForPaint×1（CORS/等图后）", lap, t0);

    const dataUrl = await captureViewportBodyToPngDataUrl(root);
    lap = logWebCaptureLap("captureViewportBodyToPngDataUrl（html-to-image）", lap, t0);

    const total = lap - t0;
    const dataLen = typeof dataUrl === "string" ? dataUrl.length : 0;
    console.log(
      `[screenshot] Web.capture ✓ 结束：总 ${total.toFixed(0)}ms，data URL 长度 ${dataLen}（约 ${(dataLen / 1024).toFixed(1)} KiB）`,
    );
    return dataUrl;
  };

  return await Promise.race([run(), hardTimeout]);
}
