/** Metro 非 Web 占位；实现见 `h5SvgSnapshot.web.ts` */

/** 与 `h5SvgSnapshot.web.ts` 一致，供类型与常量引用 */
export const VIEWPORT_SNAPSHOT_LAYOUT_BUFFER_PX = 80;

export function getViewportCaptureRoot(): HTMLElement {
  throw new Error("h5SvgSnapshot: web only");
}

export async function captureViewportBodyToPngDataUrl(
  _rootOverride?: HTMLElement | null,
): Promise<string> {
  throw new Error("h5SvgSnapshot: web only");
}

export async function captureElementToPngDataUrl(
  _el: HTMLElement,
  _options?: {
    backgroundColor?: string;
    pixelRatio?: number;
    cacheBust?: boolean;
  },
): Promise<string> {
  throw new Error("h5SvgSnapshot: web only");
}

export async function rasterizeSvgDataUrlToPng(
  _svgDataUrl: string,
  _rasterOpts?: { backgroundColor?: string },
): Promise<string> {
  throw new Error("h5SvgSnapshot: web only");
}
