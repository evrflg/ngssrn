import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * iOS 主屏幕 Web App（PWA）下，聚焦密码框时系统「记忆密码 / 自动填充」底栏
 * 会让 window.innerHeight 短时缩小一截，但远小于完整软键盘；Safari 还会配合
 * layout 滚动，导致整页被顶上去、底部导航悬空、登录区贴顶等问题。
 *
 * 策略：仅在「中等幅度」高度变化时锁定 #root 的最小高度为此前基线，并复位
 * window/html/body/#root 的滚动；出现「大幅」遮挡（真键盘或横竖屏切换）时
 * 更新基线并解除锁定，避免影响正常键盘避让。
 */
function isIOSStandalonePWA(): boolean {
  if (typeof window === "undefined" || Platform.OS !== "web") return false;
  const ua = navigator.userAgent || "";
  if (!/iP(hone|ad|od)/i.test(ua)) return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  try {
    return window.matchMedia("(display-mode: standalone)").matches;
  } catch {
    return false;
  }
}

const ATTR = "data-ngss-ios-pwa-vv-stabilizer";

function pinLayoutViewportScroll(): void {
  if (window.scrollY !== 0 || window.scrollX !== 0) {
    window.scrollTo(0, 0);
  }
  const de = document.documentElement;
  if (de.scrollTop !== 0) de.scrollTop = 0;
  if (document.body.scrollTop !== 0) document.body.scrollTop = 0;
  const root = document.getElementById("root");
  if (root && root.scrollTop !== 0) root.scrollTop = 0;
}

export function useIOSPWAVisualViewportStabilizer(): void {
  useEffect(() => {
    if (!isIOSStandalonePWA()) return;

    const vv = window.visualViewport;
    if (!vv) return;

    /** 当前认为「正常全屏」时的布局高度基线（px） */
    let innerBaseline = window.innerHeight;

    const LARGE_SHRINK = 250;
    const SMALL_SHRINK = 45;
    /** 介于密码条与完整键盘之间的上限（避免误判横屏等） */
    const MEDIUM_SHRINK_MAX = 260;

    const apply = () => {
      const innerH = window.innerHeight;
      const vvObscured = innerH - vv.height;
      const innerDrop = innerBaseline - innerH;

      const root = document.getElementById("root");
      if (!root) return;

      const looksLikeFullKeyboard =
        innerDrop >= LARGE_SHRINK ||
        vvObscured >= LARGE_SHRINK ||
        vv.height / innerH <= 0.68;

      if (looksLikeFullKeyboard) {
        // 采用收缩后的布局高度，避免 dismiss 键盘后基线仍停留在旧大屏高度
        innerBaseline = innerH;
        root.style.removeProperty("min-height");
        return;
      }

      const accessoryLikeInner =
        innerDrop > SMALL_SHRINK && innerDrop < MEDIUM_SHRINK_MAX;
      const accessoryLikeVv =
        vvObscured > SMALL_SHRINK && vvObscured < MEDIUM_SHRINK_MAX;

      if (accessoryLikeInner || accessoryLikeVv) {
        root.style.minHeight = `${innerBaseline}px`;
        pinLayoutViewportScroll();
        return;
      }

      if (innerH > innerBaseline) {
        innerBaseline = innerH;
      }
      root.style.removeProperty("min-height");
    };

    let raf = 0;
    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        apply();
      });
    };

    const onOrientation = () => {
      const run = () => {
        innerBaseline = window.innerHeight;
        const root = document.getElementById("root");
        root?.style.removeProperty("min-height");
        pinLayoutViewportScroll();
      };
      setTimeout(run, 200);
      setTimeout(run, 500);
    };

    window.addEventListener("resize", schedule);
    vv.addEventListener("resize", schedule);
    vv.addEventListener("scroll", schedule);
    window.addEventListener("orientationchange", onOrientation);

    const style = document.createElement("style");
    style.setAttribute(ATTR, "1");
    style.textContent = `
      html { overflow-anchor: none; }
      body { overflow-anchor: none; }
    `;
    document.head.appendChild(style);

    schedule();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      vv.removeEventListener("resize", schedule);
      vv.removeEventListener("scroll", schedule);
      window.removeEventListener("orientationchange", onOrientation);
      document.getElementById("root")?.style.removeProperty("min-height");
      if (style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);
}

export function IOSPWAVisualViewportStabilizer() {
  useIOSPWAVisualViewportStabilizer();
  return null;
}
