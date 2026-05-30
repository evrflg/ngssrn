import { uploadFile } from "@/api";
import BaseModal, { ModalRefs } from "@/components/common/BaseModal";
import { useToast } from "@/components/common/toast";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { MAX_WIDTH } from "@/hooks/useMaxWidth";
import { AppDispatch, RootState } from "@/store/store";
import { fetchImageFromUri, isAndroidApp, isIOSApp } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageSourcePropType,
  InteractionManager,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type ImageStyle,
  type ViewStyle,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { captureRef, captureScreen } from "react-native-view-shot";
import { useDispatch, useSelector } from "react-redux";
import { captureWebScreenAsDataUrl } from "@/utils/captureWebScreen";
import { gameModalScreenshotRootRef } from "@/utils/gameModalScreenshotRootRef";
import {
  captureElementToPngDataUrl,
  rasterizeSvgDataUrlToPng,
} from "@/utils/h5SvgSnapshot";
import { fetchPromotionLink } from "@/store/user/userSlice";
import { DeviceEventEmitter } from "react-native";
import * as Sharing from "expo-sharing";
import Toast from "@/components/common/toast/src/Toast";
import { PcWebHorizontalScroll } from "@/components/common/PcWebHorizontalScroll";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isAndroid = Platform.OS === "android";
const isIOS = Platform.OS === "ios";

/** Web：SVG 快照用 document.getElementById；需与 View nativeID 一致 */
const SCREENSHOT_GALLERY_DOM_ID = "screenshot-share-gallery";

export type ScreenshotSharePlatform =
  | "Telegram"
  | "Facebook"
  | "WhatsApp"
  | "Twitter"
  | "Instagram"
  | "SMS"
  | "Email";

interface ShareResult {
  success: boolean;
  copied?: boolean;
}

export interface ScreenshotPopupHandle {
  captureScreenshot: () => Promise<void>;
  clearData: () => void;
  isCapturing: boolean;
}

interface ScreenshotPopupProps {
  onClose?: () => void;
}

const IMG_WIDTH = Math.min(SCREEN_WIDTH * 0.6, 300);
const IMG_HEIGHT = SCREEN_HEIGHT * 0.6;

async function toDataUrlOnWeb(uri: string): Promise<string> {
  if (!uri) return "";
  if (!isWeb) return uri;
  if (/^data:image\//i.test(uri)) return uri;
  if (!/^https?:\/\//i.test(uri)) return uri;
  const res = await fetch(uri, { cache: "no-store" });
  const blob = await res.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("file reader failed"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(blob);
  });
  return dataUrl;
}

/** Web：SVG `toDataURL` 得到像素后，用离屏 Canvas `toBlob('image/png')` 再转成 blob: URL（便于上传走 Blob） */
function dataUrlToPngBlobObjectUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("no document"));
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const w = img.naturalWidth || img.width || 60;
      const h = img.naturalHeight || img.height || 60;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("no canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("toBlob returned null"));
            return;
          }
          resolve(URL.createObjectURL(blob));
        },
        "image/png",
      );
    };
    img.onerror = () => reject(new Error("image decode failed"));
    img.src = dataUrl;
  });
}

/** expo-sharing 需要本地 URI：https/data: 先落到缓存 */
async function resolveShareableImageUri(uri: string): Promise<{
  localUri: string;
  mimeType: string;
  uti: string;
}> {
  const s = uri.trim();
  if (!s) throw new Error("empty uri");

  const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDir) throw new Error("no cache dir");

  const guessMime = (pathLike: string) => {
    const lower = pathLike.toLowerCase();
    if (/\.(jpe?g)(\?|#|$)/i.test(lower)) {
      return { mimeType: "image/jpeg" as const, uti: "public.jpeg" };
    }
    if (/\.webp(\?|#|$)/i.test(lower)) {
      return { mimeType: "image/webp" as const, uti: "public.webp" };
    }
    return { mimeType: "image/png" as const, uti: "public.png" };
  };

  if (/^https?:\/\//i.test(s)) {
    const extRaw =
      s.split("?")[0].match(/\.(png|jpe?g|webp)$/i)?.[1] || "png";
    const ext =
      extRaw.toLowerCase() === "jpeg" ? "jpg" : extRaw.toLowerCase();
    const { mimeType, uti } = guessMime(`.${ext}`);
    const dest = `${baseDir}share-${Date.now()}.${ext}`;
    const dl = await FileSystem.downloadAsync(s, dest);
    return { localUri: dl.uri, mimeType, uti };
  }

  if (/^data:image\//i.test(s)) {
    const m = s.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!m) throw new Error("bad data uri");
    const mimeType = m[1];
    const base64 = m[2];
    const ext = mimeType.includes("jpeg")
      ? "jpg"
      : mimeType.includes("webp")
        ? "webp"
        : "png";
    const dest = `${baseDir}share-${Date.now()}.${ext}`;
    await FileSystem.writeAsStringAsync(dest, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const uti =
      mimeType === "image/jpeg"
        ? "public.jpeg"
        : mimeType === "image/webp"
          ? "public.webp"
          : "public.png";
    return { localUri: dest, mimeType, uti };
  }

  let localUri = s;
  if (
    !/^file:\/\//i.test(localUri) &&
    !/^content:\/\//i.test(localUri) &&
    localUri.startsWith("/")
  ) {
    localUri = `file://${localUri}`;
  }
  if (/^content:\/\//i.test(localUri)) {
    return { localUri, mimeType: "image/png", uti: "public.png" };
  }
  const { mimeType, uti } = guessMime(localUri);
  return { localUri, mimeType, uti };
}

const socialItems: Array<{
  platform: ScreenshotSharePlatform;
  icon: ImageSourcePropType;
  label: string;
}> = [
    {
      platform: "Telegram",
      icon: require("@/assets/images/home/footImg1.png"),
      label: "Telegram",
    },
    {
      platform: "Facebook",
      icon: require("@/assets/images/home/footImg2.png"),
      label: "Facebook",
    },
    {
      platform: "WhatsApp",
      icon: require("@/assets/images/home/footImg3.png"),
      label: "WhatsApp",
    },
    {
      platform: "Twitter",
      icon: require("@/assets/images/home/footImg7.png"),
      label: "X",
    },
    {
      platform: "Instagram",
      icon: require("@/assets/images/home/footImg4.png"),
      label: "Instagram",
    },
    {
      platform: "SMS",
      icon: require("@/assets/images/home/sms.png"),
      label: "SMS",
    },
    {
      platform: "Email",
      icon: require("@/assets/images/home/email.png"),
      label: "Email",
    },
  ];

let imgUrl = "";//图片上传后的url
const ScreenshotPopup = forwardRef<ScreenshotPopupHandle, ScreenshotPopupProps>(
  ({ onClose }, ref) => {
    const isSharingRef = useRef(false);
    const modalRef = useRef<ModalRefs | null>(null);
    const galleryRef = useRef<View | null>(null);
    const qrCodeRef = useRef<any>(null);
    /** 仅当 `webQrPngDataUrl` 为 blob: 时持有，用于 revoke */
    const webQrBlobUrlRef = useRef<string | null>(null);
    /** Web 视口截图由 data URL 转成 blob: 预览/上传，避免巨量字符串进 Image、fetch 与地址栏 */
    const webViewportScreenshotBlobRef = useRef<string | null>(null);
    const [screenshotUri, setScreenshotUri] = useState<string>("");
    const [uploadedImgUrl, setUploadedImgUrl] = useState<string>("");
    const [webScreenshotForCanvas, setWebScreenshotForCanvas] = useState<string>("");
    const [webQrPngDataUrl, setWebQrPngDataUrl] = useState<string>("");
    /** 供上传前等待逻辑读取，避免异步闭包里 `webQrPngDataUrl` 未更新一直判空 */
    const webQrPngDataUrlSyncRef = useRef("");
    const uploadPromiseRef = useRef<Promise<string> | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const { theme } = useTheme();
    const toast = useToast();
    const { t } = useTranslation();
    const { width: windowWidth } = useWindowDimensions();

    /** Web 宽屏（PC 模式）：分享栏固定为 MAX_WIDTH，与 H5 页面内容区同宽 */
    const socialListInnerResolved = useMemo((): ViewStyle[] => {
      const bg = { backgroundColor: Colors[theme].cardBg1 } as ViewStyle;
      if (isWeb && windowWidth > MAX_WIDTH) {
        return [
          styles.socialListInner,
          bg,
          {
            width: MAX_WIDTH,
            maxWidth: MAX_WIDTH,
            alignSelf: "center",
          },
        ];
      }
      return [styles.socialListInner, bg];
    }, [theme, windowWidth]);

    /** PC 宽屏 Web：底部分享条与 `ActiveBlock` 一致，用原生横向滚动 + 滚轮/拖拽 */
    const isPcWideWeb = isWeb && windowWidth > MAX_WIDTH;
    const sharePlatformsForList = useMemo(
      () => socialItems.filter((it) => !(it.platform === "SMS" && isWeb)),
      [isWeb],
    );
    const promotionLink = useSelector(
      (state: RootState) => state?.user?.promotionLink as string,
    );
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
      dispatch(fetchPromotionLink());
    }, []);

    useEffect(() => {
      webQrPngDataUrlSyncRef.current = webQrPngDataUrl;
    }, [webQrPngDataUrl]);

    useEffect(() => {
      if (!isWeb) return;
      if (!screenshotUri) {
        setWebScreenshotForCanvas("");
        return;
      }
      let cancelled = false;
      void (async () => {
        try {
          const dataUrl = await toDataUrlOnWeb(screenshotUri);
          if (!cancelled) setWebScreenshotForCanvas(dataUrl || screenshotUri);
        } catch {
          if (!cancelled) setWebScreenshotForCanvas(screenshotUri);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [screenshotUri]);

    useEffect(() => {
      // Web：把 QRCode(svg) 预先转成 PNG（Canvas toBlob），避免快照链路对 SVG 支持不稳导致“上传图没二维码”
      if (!isWeb) return;
      if (!promotionLink) {
        const prev = webQrBlobUrlRef.current;
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        webQrBlobUrlRef.current = null;
        setWebQrPngDataUrl("");
        webQrPngDataUrlSyncRef.current = "";
        return;
      }
      if (!screenshotUri) return;

      let cancelled = false;
      const run = async () => {
        await new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r())),
        );
        await new Promise<void>((r) => setTimeout(r, 80));

        const tryOnce = (): Promise<boolean> =>
          new Promise((resolve) => {
            const inst = qrCodeRef.current;
            if (!inst?.toDataURL) {
              resolve(false);
              return;
            }
            let settled = false;
            const timer = window.setTimeout(() => {
              if (settled) return;
              settled = true;
              resolve(false);
            }, 450);
            try {
              inst.toDataURL((data: string) => {
                if (settled) return;
                if (!data) {
                  settled = true;
                  window.clearTimeout(timer);
                  resolve(false);
                  return;
                }
                settled = true;
                window.clearTimeout(timer);
                void (async () => {
                  const withPrefix = data.startsWith("data:image/")
                    ? data
                    : `data:image/png;base64,${data}`;
                  try {
                    const objectUrl = await dataUrlToPngBlobObjectUrl(withPrefix);
                    if (cancelled) {
                      URL.revokeObjectURL(objectUrl);
                      resolve(false);
                      return;
                    }
                    const prev = webQrBlobUrlRef.current;
                    if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                    webQrBlobUrlRef.current = objectUrl;
                    webQrPngDataUrlSyncRef.current = objectUrl;
                    setWebQrPngDataUrl(objectUrl);
                    resolve(true);
                  } catch {
                    if (cancelled) {
                      resolve(false);
                      return;
                    }
                    const prev = webQrBlobUrlRef.current;
                    if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                    webQrBlobUrlRef.current = null;
                    webQrPngDataUrlSyncRef.current = withPrefix;
                    setWebQrPngDataUrl(withPrefix);
                    resolve(true);
                  }
                })();
              });
            } catch {
              window.clearTimeout(timer);
              if (!settled) {
                settled = true;
                resolve(false);
              }
            }
          });

        const deadline = Date.now() + 2800;
        while (Date.now() < deadline && !cancelled) {
          // eslint-disable-next-line no-await-in-loop
          const ok = await tryOnce();
          if (ok) return;
          // eslint-disable-next-line no-await-in-loop
          await new Promise<void>((r) => setTimeout(r, 55));
        }
      };
      void run();
      return () => {
        cancelled = true;
      };
    }, [promotionLink, screenshotUri]);

    useEffect(() => {
      if (!isWeb) return;
      return () => {
        const u = webQrBlobUrlRef.current;
        if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
        webQrBlobUrlRef.current = null;
        const v = webViewportScreenshotBlobRef.current;
        if (v?.startsWith("blob:")) URL.revokeObjectURL(v);
        webViewportScreenshotBlobRef.current = null;
      };
    }, []);

    const prepareUploadFileFromUri = useCallback(async (uri: string) => {
      const fileName = `screenshot-${Date.now()}.png`;
      if (Platform.OS === "web") {
        const blob = await fetchImageFromUri(uri);
        return new File([blob], fileName, { type: "image/png" });
      }
      return {
        uri,
        name: fileName,
        type: "image/png",
      };
    }, []);

    const startUploadIfNeeded = useCallback(
      (uri: string) => {
        if (!uri) return;
        if (uploadPromiseRef.current) return;
        uploadPromiseRef.current = (async () => {
          try {
            const imageFile = await prepareUploadFileFromUri(uri);
            const uploadResponse = await uploadFile(imageFile);
            const url = uploadResponse?.data?.data?.url || "";
            imgUrl = url;
            if (url) setUploadedImgUrl(url);
            return url;
          } catch (e) {
            console.error("screenshot upload failed:", e);
            return "";
          }
        })();
      },
      [prepareUploadFileFromUri],
    );

    const buildWebUploadUriAfterModalOpen = useCallback(
      async (fallbackUri: string) => {
        if (!isWeb) return fallbackUri;
        // 等待弹窗内容（含 QR png）渲染完成
        await Promise.race([
          new Promise<void>((resolve) => {
            InteractionManager.runAfterInteractions(() => resolve());
          }),
          new Promise<void>((resolve) => setTimeout(resolve, 550)),
        ]);
        await new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r())),
        );
        await new Promise<void>((r) => setTimeout(r, 72));

        // 用 ref 轮询：闭包里的 state 可能尚未更新；有邀请链接时才等二维码栅格化完成
        if (promotionLink) {
          const start = Date.now();
          while (
            !webQrPngDataUrlSyncRef.current &&
            Date.now() - start < 2400
          ) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise<void>((r) => setTimeout(r, 48));
          }
        }

        try {
          const el =
            typeof document !== "undefined"
              ? (document.getElementById(
                  SCREENSHOT_GALLERY_DOM_ID,
                ) as HTMLElement | null)
              : null;
          if (!el) return fallbackUri;
          return await captureElementToPngDataUrl(el, {
            backgroundColor: "#ffffff",
          });
        } catch (e) {
          console.warn("web upload capture failed:", e);
          return fallbackUri;
        }
      },
      [isWeb, promotionLink],
    );

    const captureScreenshot = useCallback(async () => {
      setIsCapturing(true);
      if (!isWeb) return;
      if (isWeb) {
        imgUrl = "";
        setUploadedImgUrl("");
        uploadPromiseRef.current = null;
        setScreenshotUri("");
        setWebScreenshotForCanvas("");
        const prevQr = webQrBlobUrlRef.current;
        if (prevQr?.startsWith("blob:")) URL.revokeObjectURL(prevQr);
        webQrBlobUrlRef.current = null;
        setWebQrPngDataUrl("");
        webQrPngDataUrlSyncRef.current = "";
        modalRef.current?.openModal();
      }
      try {
        const tCap =
          typeof performance !== "undefined" ? performance.now() : Date.now();
        const imgsrc = isWeb
          ? await Promise.race([
              captureWebScreenAsDataUrl(),
              new Promise<null>((resolve) => {
                setTimeout(() => resolve(null), 30_000);
              }),
            ]).catch((error) => {
              console.error(error);
              return null;
            })
          : await (async () => {
              // Android：全屏游戏在 react-native-modal 的独立 Window 里，captureScreen 只截主 Activity → 误显示首页
              if (gameModalScreenshotRootRef.current) {
                try {
                  // 不要用 InteractionManager 再等一截：叠在游戏 Modal 上时容易多一帧顿挫 → 观感像「闪一下」
                  await new Promise<void>((r) =>
                    requestAnimationFrame(() => requestAnimationFrame(() => r())),
                  );
                  const cap = await captureRef(gameModalScreenshotRootRef, {
                    format: "png",
                    quality: 1,
                    result: "tmpfile",
                  });
                  const uri = typeof cap === "string" ? cap.trim() : "";
                  return uri || null;
                } catch (e) {
                  console.error(e);
                  return null;
                }
              }
              return captureScreen({ format: "png" }).catch((error) => {
                console.error(error);
                return null;
              });
            })();
        if (!isWeb) {
          const capMs =
            (typeof performance !== "undefined" ? performance.now() : Date.now()) -
            tCap;
          console.log(
            `[screenshot] captureScreenshot（Native） ${capMs.toFixed(0)}ms`,
          );
        }
        if (!imgsrc) {
          toast.error(t("common.operationFailed"));
          if (isWeb) modalRef.current?.closeModal();
          return;
        }

        /** 视口截图为 SVG 时，弹窗后再栅格化 PNG，不阻塞 openModal */
        const viewportSvgDataUrl =
          isWeb && /^data:image\/svg/i.test(String(imgsrc))
            ? String(imgsrc)
            : null;

        let uriForState: string = imgsrc;
        let uriForWebUploadFallback: string = imgsrc;
        if (isWeb && /^data:/i.test(String(imgsrc))) {
          try {
            const prev = webViewportScreenshotBlobRef.current;
            if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
            const blob = await fetchImageFromUri(String(imgsrc));
            uriForState = URL.createObjectURL(blob);
            webViewportScreenshotBlobRef.current = uriForState;
            uriForWebUploadFallback = uriForState;
          } catch {
            uriForState = String(imgsrc);
            uriForWebUploadFallback = String(imgsrc);
          }
        }

        setScreenshotUri(uriForState);
        if (!isWeb) {
          // Android：先让 Image 收到 uri 再开第二层 Modal，减轻首帧空白/蒙层与内容不同步的闪动
          await new Promise<void>((r) =>
            requestAnimationFrame(() => requestAnimationFrame(() => r())),
          );
          modalRef.current?.openModal();
        }

        if (isWeb) {
          // Web：先开弹窗；视口 SVG→PNG 在后台完成后再走合成上传，避免栅格化拖慢开框
          void (async () => {
            let fallbackForUpload = uriForWebUploadFallback;
            if (viewportSvgDataUrl) {
              try {
                const pngDataUrl =
                  await rasterizeSvgDataUrlToPng(viewportSvgDataUrl);
                const prev = webViewportScreenshotBlobRef.current;
                if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                const b = await fetchImageFromUri(pngDataUrl);
                const blobUrl = URL.createObjectURL(b);
                webViewportScreenshotBlobRef.current = blobUrl;
                fallbackForUpload = blobUrl;
                setScreenshotUri(blobUrl);
              } catch (e) {
                console.warn("screenshot viewport svg→png:", e);
              }
            }
            await new Promise<void>((r) =>
              requestAnimationFrame(() => requestAnimationFrame(() => r())),
            );
            const uploadUri = await buildWebUploadUriAfterModalOpen(
              fallbackForUpload,
            );
            startUploadIfNeeded(uploadUri);
          })();
        } else {
          // Native：立刻上传原始截图（二维码合成只用于下载/分享）
          startUploadIfNeeded(imgsrc);
        }
      } finally {
        setIsCapturing(false);
      }
    }, [isWeb, startUploadIfNeeded, buildWebUploadUriAfterModalOpen, t, toast]);




    // 兜底：避免某些渲染时序下 ref 未就绪导致“点了没反应”
    useEffect(() => {
      const sub = DeviceEventEmitter.addListener("global-capture-screenshot", () => {
        if (isCapturing) return;
        void captureScreenshot();
      });
      return () => sub.remove();
    }, [captureScreenshot, isCapturing]);

    const clearData = useCallback(() => {
      setScreenshotUri("");
      setUploadedImgUrl("");
      imgUrl = "";
      setWebScreenshotForCanvas("");
      if (isWeb) {
        const u = webQrBlobUrlRef.current;
        if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
        webQrBlobUrlRef.current = null;
        const v = webViewportScreenshotBlobRef.current;
        if (v?.startsWith("blob:")) URL.revokeObjectURL(v);
        webViewportScreenshotBlobRef.current = null;
      }
      setWebQrPngDataUrl("");
      webQrPngDataUrlSyncRef.current = "";
      uploadPromiseRef.current = null;
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        captureScreenshot,
        clearData,
        get isCapturing() {
          return isCapturing;
        },
      }),
      [captureScreenshot, clearData, isCapturing],
    );

    const handleClose = useCallback(() => {
      modalRef.current?.closeModal();
      onClose?.();
    }, [onClose]);

    /** 分享用：把底部二维码与截图合成到一张图（与弹窗展示一致） */
    const captureGalleryForShare = useCallback(async (): Promise<string> => {
      if (!screenshotUri) {
        return "";
      }
      if (!promotionLink) {
        return screenshotUri;
      }
      // Web（尤其部分国产浏览器）下 InteractionManager 可能长时间不回调，导致点击“下载”无反应
      // 这里加超时兜底：最多等 800ms，避免卡死在 await 上
      await Promise.race([
        new Promise<void>((resolve) => {
          InteractionManager.runAfterInteractions(() => resolve());
        }),
        new Promise<void>((resolve) => setTimeout(resolve, 550)),
      ]);
      await new Promise<void>((r) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => r());
        });
      });

      // iOS：截图区 Image 解码与布局稳定后再 capture，否则 captureRef 常 resolve 为空串
      if (!isWeb && isIOS) {
        await new Promise<void>((r) => setTimeout(r, 120));
      }

      if (isWeb) {
        if (promotionLink) {
          const start = Date.now();
          while (
            !webQrPngDataUrlSyncRef.current &&
            Date.now() - start < 2400
          ) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise<void>((r) => setTimeout(r, 48));
          }
        }
        try {
          const el =
            typeof document !== "undefined"
              ? (document.getElementById(
                  SCREENSHOT_GALLERY_DOM_ID,
                ) as HTMLElement | null)
              : null;
          if (el) {
            return await captureElementToPngDataUrl(el, {
              backgroundColor: "#ffffff",
            });
          }
        } catch (e) {
          console.warn("web gallery capture failed:", e);
        }
        return screenshotUri;
      }

      if (!galleryRef.current) {
        return screenshotUri;
      }
      try {
        const cap = await captureRef(galleryRef, {
          format: "png",
          quality: 1,
          result: "tmpfile",
        });
        const uri = typeof cap === "string" ? cap.trim() : "";
        if (uri) return uri;
        console.warn(
          "captureRef gallery returned empty on native, fallback to screenshotUri",
        );
        return screenshotUri;
      } catch (e) {
        console.warn("captureRef gallery failed:", e);
        return screenshotUri;
      }
    }, [promotionLink, screenshotUri]);

    /** 下载与分享同源：有邀请链接时保存带二维码的合成图 */
    const handleDownload = useCallback(async () => {
      if (!screenshotUri) {
        toast.error(t("common.noData"));
        return;
      }
      try {
        const sourceUri = await captureGalleryForShare();
        if (!sourceUri) {
          toast.error(t("common.operationFailed"));
          return;
        }
        const fileName = `screenshot-${Date.now()}.png`;

        if (Platform.OS === "web") {
          // Web：部分浏览器（尤其移动端）对异步后触发下载/`download` 属性支持不稳定
          // - data: 直接作为 href（避免再 fetch 一次，且更接近“用户手势”）
          // - 其它：再转成 blob url
          if (!sourceUri) return

          try {
            const link = document.createElement('a')
            link.href = sourceUri
            link.download = `screenshot-${Date.now()}.jpg`
            link.click()
          } catch (error) {
            console.error('Error downloading screenshot:', error)
            toast.error(t('common.operationFailed'))
          }
          toast.success(t("common.operationSuccess"));
          return;
        }

        // 仅「保存到相册」应请求 writeOnly：否则默认会要完整读相册，iOS 上易被拒且与用途不符
        const { status } = await MediaLibrary.requestPermissionsAsync(true);
        if (status !== "granted") {
          toast.error(t("common.operationFailed"));
          return;
        }

        let localUri = sourceUri;
        if (/^data:image\//i.test(sourceUri)) {
          const m = sourceUri.match(/^data:(image\/[^;]+);base64,(.+)$/);
          if (!m) {
            throw new Error("invalid data uri");
          }
          const dest = `${FileSystem.cacheDirectory ?? ""}${fileName}`;
          await FileSystem.writeAsStringAsync(dest, m[2], {
            encoding: FileSystem.EncodingType.Base64,
          });
          localUri = dest;
        } else if (/^https?:\/\//i.test(sourceUri)) {
          const dest = `${FileSystem.cacheDirectory ?? ""}${fileName}`;
          const dl = await FileSystem.downloadAsync(sourceUri, dest);
          localUri = dl.uri;
        }

        await MediaLibrary.saveToLibraryAsync(localUri);
        toast.success(t("common.operationSuccess"));
      } catch (e) {
        console.error("download failed:", e);
        toast.error(t("common.operationFailed"));
      }
    }, [screenshotUri, captureGalleryForShare, toast, t]);

    //点击分享按钮
    const handleShare = useCallback(
      async (platform: ScreenshotSharePlatform) => {
        if (!screenshotUri) {
          toast.error("Image file is missing!");
          return;
        }
        try {
          const imageUriForShare = await captureGalleryForShare();
          if (!imageUriForShare) {
            toast.error(t("common.operationFailed"));
            return;
          }

          let imgURL = uploadedImgUrl;
          if (!imgURL) {
            startUploadIfNeeded(screenshotUri);
            if (uploadPromiseRef.current) {
              imgURL = await uploadPromiseRef.current;
            }
          }

          // 有邀请链接时底部有二维码：分享合成图，不使用仅含页面的 CDN 原图
          const preferUploaded = !promotionLink;
          const result = await shareToSocial(
            platform,
            preferUploaded ? imgURL : "",
            imageUriForShare,
          );
          if (!result.success) {
            toast.error(t("common.operationFailed"));
          }
          if (platform === "Instagram" && result.copied) {
            toast.success(t("common.copySuccess"));
          }
        } catch (error) {
          console.error("Error sharing promotion link:", error);
          toast.error(t("common.operationFailed"));
        }
      },
      [
        toast,
        t,
        screenshotUri,
        uploadedImgUrl,
        startUploadIfNeeded,
        captureGalleryForShare,
        promotionLink,
      ],
    );

    const getShareUrl = (platform: ScreenshotSharePlatform): string => {
      let url = promotionLink;
      if (isWeb && !url) url = window.location.href;
      const encodedUrl = encodeURIComponent(url);

      // iOS 马甲包中需要使用 sms:// 和 mailto:// 格式
      const smsUrl = `sms:?body=${encodedUrl}`;
      const emailUrl = `mailto:?body=${encodedUrl}`;

      const shareUrls: Record<ScreenshotSharePlatform, string> = {
        Telegram: `https://t.me/share/url?url=${encodedUrl}`,
        WhatsApp: `https://api.whatsapp.com/send?text=${encodedUrl}`,
        Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        Twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
        Instagram: `https://www.instagram.com/share?url=${encodedUrl}`,
        SMS: smsUrl,
        Email: emailUrl,
      };

      return shareUrls[platform];
    };

    const shareViaNavigator = async (data: any) => {
      if (typeof navigator === "undefined" || !navigator?.share) {
        toast.error(t("common.operationFailed"));
        return;
      }

      if (isSharingRef.current) {
        console.warn("Share already in progress, ignoring new share request.");
        return;
      }

      isSharingRef.current = true;
      try {
        await navigator.share(data);
      } catch (error) {
        console.error("navigator.share error:", error);
        const name = (error as any)?.name;
        const msg = String((error as any)?.message || "");
        const isNotAllowed =
          name === "NotAllowedError" ||
          /notallowed/i.test(name || "") ||
          /permission|denied|not allowed/i.test(msg);
        if (isNotAllowed) {
          toast.error(t("errMsg.browser.403"));
        }
      } finally {
        isSharingRef.current = false;
      }
    };

    const shareToSocial = async (
      platform: ScreenshotSharePlatform,
      uploadedImgUrl: string,
      fallbackScreenshotUri: string,
    ): Promise<ShareResult> => {
      let shareUrl = getShareUrl(platform);
      const shareImgLabel = t("popup.screenshotPopup.shareImg");
      const shareTextLabel = t("popup.screenshotPopup.shareText");

      console.log("#shareUrl",shareUrl)

      const effectiveImgSrc =
        (uploadedImgUrl?.trim() || fallbackScreenshotUri?.trim() || "").trim();
      if (!effectiveImgSrc) {
        return { success: false };
      }

      if (isWeb) {
        if (!imgUrl) return { success: false };
        console.log("#1",imgUrl)
        if (platform === "Telegram") {
          const text = `${shareImgLabel}\n${shareTextLabel}\n${promotionLink}`;
          shareUrl =
            "https://t.me/share/url" +
            "?url=" +
            encodeURIComponent(imgUrl) +
            "&text=" +
            encodeURIComponent(text);
          window.open(shareUrl, "_blank");
          return { success: true };
        }
        console.log("#3",imgUrl)
        const file = await fetchImageFromUri(imgUrl).then(
          (blob) =>
            new File(
              [blob],
              imgUrl.split("/").pop()?.split("?")[0] || "share.png",
              { type: blob.type },
            ),
        );
        console.log("#4",file)
        console.log("#5",navigator.canShare?.({ files: [file] }))
        if (navigator.canShare?.({ files: [file] })) {
          if (platform === "Instagram") {
            await shareViaNavigator({
              title: "",
              text: "",
              url: promotionLink,
            });
            return { success: true };
          }
          
          await shareViaNavigator({
            title: "",
            text: "",
            url: promotionLink,
            files: [file],
          });
          return { success: true };
        }
        await shareViaNavigator({
          title: "",
          text: "",
          url: promotionLink,
        });
        return { success: true };
      }

      if (isAndroid || isIOS) {
        try {
          const { localUri, mimeType, uti } =
            await resolveShareableImageUri(effectiveImgSrc);
          const ok = await Sharing.isAvailableAsync().catch(() => false);
          if (ok) {
            await Sharing.shareAsync(localUri, {
              mimeType,
              dialogTitle: shareImgLabel,
              UTI: uti,
            });
          } else {
            await Share.share({
              title: shareImgLabel,
              message: `${shareTextLabel}\n${promotionLink || ""}`.trim(),
              url: localUri,
            });
          }
          return { success: true };
        } catch (e) {
          console.error("native share image:", e);
        }
      }

      return { success: true };
    };


    const renderQrSection = () => {
      if (!promotionLink) return null;
      return (
        <View
          style={[
            styles.qrContent,
            { backgroundColor: Colors[theme].screenshotQRBgColor },
          ]}
        >
          <View style={styles.qrTextSection}>
            <Text style={[styles.qrTitle, { color: Colors[theme].text }]}>
              {t("agent.invitationLink")}
            </Text>
            <TouchableOpacity onPress={handleDownload}>
              <Text
                style={[styles.downloadLink, { color: Colors[theme].primary }]}
              >
                {t("app.download")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.qrCodeWrapper}>
            {isWeb && webQrPngDataUrl ? (
              <Image
                source={{ uri: webQrPngDataUrl }}
                style={{ width: 60, height: 60 }}
                resizeMode="contain"
              />
            ) : (
              <QRCode
                value={promotionLink}
                size={isWeb ? 60 : 70}
                color="#000000"
                backgroundColor="#ffffff"
                // @ts-ignore - react-native-qrcode-svg 支持 getRef 用于导出
                getRef={(c: any) => {
                  qrCodeRef.current = c;
                }}
              />
            )}
          </View>
        </View>
      );
    };

    const renderSocialList = () => {
      const renderChip = (item: (typeof socialItems)[number]) => (
        <Pressable
          style={styles.socialItem}
          onPress={() => handleShare(item.platform)}
        >
          <Image source={item.icon} style={{ width: 32, height: 32 }} />
          <Text style={[styles.socialLabel, { color: Colors[theme].text }]}>
            {item.label}
          </Text>
        </Pressable>
      );

      return (
        <View style={styles.socialList}>
          <View style={socialListInnerResolved}>
            {isPcWideWeb ? (
              <PcWebHorizontalScroll rowStyle={styles.socialItems}>
                {sharePlatformsForList.map((item) => (
                  <View key={item.platform} style={styles.shareChipWrap}>
                    {renderChip(item)}
                  </View>
                ))}
              </PcWebHorizontalScroll>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.socialItems}
              >
                {sharePlatformsForList.map((item) => (
                  <React.Fragment key={item.platform}>
                    {renderChip(item)}
                  </React.Fragment>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      );
    };

    return (
      <BaseModal
        ref={modalRef}
        onBackdropPress={handleClose}
        backdropOpacity={0.5}
        style={styles.modal}
        /** PC 宽屏：外层 `mx-auto`，避免整块卡片贴一侧、两侧像大片留白 */
        centerOnDesktop
        {...(isAndroid
          ? {
              // 叠在全屏游戏 Modal 上时：默认 slide + native driver 在部分机型上会闪一下
              useNativeDriver: false,
              animationIn: "fadeIn" as const,
              animationOut: "fadeOut" as const,
              animationInTiming: 180,
              animationOutTiming: 160,
              backdropTransitionInTiming: 0,
              backdropTransitionOutTiming: 0,
              hideModalContentWhileAnimating: false,
            }
          : { useNativeDriver: true })}
      >
        <View
          style={[
            styles.modalContentRoot,
            Platform.OS === "web"
              ? ({ minHeight: SCREEN_HEIGHT, alignSelf: "stretch" } as ViewStyle)
              : null,
          ]}
        >
          <View
            style={[
              styles.container,
              {
                backgroundColor: Colors[theme].cardBg1,
                borderColor: Colors[theme].screenshotBorderColor,
                ...(isWeb ? { alignSelf: "center" } : null),
              },
            ]}
          >
            <View style={styles.screenshotGallery}>
            <View
              ref={galleryRef}
              nativeID={SCREENSHOT_GALLERY_DOM_ID}
              collapsable={false}
              style={{
                width: IMG_WIDTH,
                height: IMG_HEIGHT,
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
                ...(isWeb
                  ? { backgroundColor: Colors[theme].background }
                  : null),
              }}
            >
              {screenshotUri ? (
                <Image
                  source={{
                    uri: isWeb
                      ? (webScreenshotForCanvas || screenshotUri)
                      : screenshotUri,
                  }}
                  style={[
                    styles.screenshotImage,
                    { width: IMG_WIDTH, height: IMG_HEIGHT },
                    ...(isWeb
                      ? [
                          {
                            objectFit: "contain",
                          } as ImageStyle,
                        ]
                      : []),
                  ]}
                  resizeMode={isWeb ? "contain" : "cover"}
                />
              ) : isCapturing ? (
                <View
                  style={[
                    styles.screenshotImage,
                    {
                      width: IMG_WIDTH,
                      height: IMG_HEIGHT,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <ActivityIndicator size="large" color={Colors[theme].primary} />
                  <Text
                    style={{
                      marginTop: 10,
                      color: Colors[theme].lightText,
                      fontSize: 12,
                    }}
                  >
                    {t("common.loading")}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.screenshotImage,
                    {
                      width: IMG_WIDTH,
                      height: IMG_HEIGHT,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Text style={{ color: Colors[theme].lightText }}>
                    {t("common.noData")}
                  </Text>
                </View>
              )}
              {renderQrSection()}
            </View>
          </View>

            <TouchableOpacity
              style={[
                styles.closeIcon,
                { backgroundColor: Colors[theme].screenshotCloseIconBgColor },
              ]}
              onPress={handleClose}
            >
              <Ionicons name="close" size={18} color={Colors[theme].lightText} />
            </TouchableOpacity>
          </View>

          {renderSocialList()}
          <Toast/>
        </View>
      </BaseModal>
    );
  },
);

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  modalContentRoot: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  container: {
    borderRadius: 30,
    borderWidth: 8,
  },
  screenshotGallery: {
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  screenshotImage: {
    width: "100%",
    height: "100%",
  },
  qrContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qrTextSection: {
    flex: 1,
    marginRight: 8,
  },
  qrTitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  downloadLink: {
    fontSize: 13,
    textAlign: "center",
  },
  qrCodeWrapper: {
    padding: 4,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    position: "absolute",
    top: -26,
    right: -26,
    width: 26,
    height: 26,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  socialList: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "box-none",
  },
  socialListInner: {
    width: "100%",
    maxWidth: 480,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 12,
  },
  socialItems: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  /** PC Web 横向行内子项不收缩，保证可滚出视口 */
  shareChipWrap: {
    flexShrink: 0,
  },
  socialItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    minWidth: 60,
    paddingHorizontal: 12,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  socialLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default ScreenshotPopup;
