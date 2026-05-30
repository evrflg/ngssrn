import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageStyle,
  NativeSyntheticEvent,
  StyleProp,
  View,
  ViewStyle,
  type ImageLoadEventData,
} from "react-native";
import { Skeleton } from "@/components/home/components/Skeleton";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";

export type ImageFitWidthProps = {
  width: number;
  uri: string;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
  imageStyle?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

/** 与游戏封面占位比例 112:151（宽:高）→ aspectRatio = width/height */
const PLACEHOLDER_W = 112;
const PLACEHOLDER_H = 151;
const PLACEHOLDER_ASPECT = PLACEHOLDER_W / PLACEHOLDER_H;

/**
 * 远程图：优先 getSize 得宽高比；未返回时用 112:151 占位并照常挂 Image，靠 onLoad 补尺寸（避免 getSize 失败时永远不显示）。
 * 仅无 uri、或 Image onError 时用 Skeleton。
 */
export default function ImageFitWidth({
  width,
  uri,
  resizeMode = "contain",
  imageStyle,
  containerStyle,
}: ImageFitWidthProps) {
  const { theme } = useTheme();
  const [wh, setWh] = useState<{ w: number; h: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const imageSlotBg = Colors[theme]?.blockBg1;

  const skeletonHeight = useMemo(
    () => Math.max(1, Math.round((width * PLACEHOLDER_H) / PLACEHOLDER_W)),
    [width],
  );

  const applySize = useCallback((w: number, h: number) => {
    if (w > 0 && h > 0) setWh({ w, h });
  }, []);

  useEffect(() => {
    const u = uri?.trim() ?? "";
    if (!u || typeof width !== "number" || width <= 0) {
      setFailed(true);
      setWh(null);
      return;
    }
    setFailed(false);
    setWh(null);
    Image.getSize(
      u,
      (w, h) => {
        if (w > 0 && h > 0) applySize(w, h);
      },
      () => {},
    );
  }, [uri, width, applySize]);

  const remoteAspect = useMemo(() => {
    if (!wh || wh.h <= 0) return null;
    return wh.w / wh.h;
  }, [wh]);

  const aspectRatio = remoteAspect ?? PLACEHOLDER_ASPECT;

  const handleLoad = useCallback(
    (e: NativeSyntheticEvent<ImageLoadEventData>) => {
      const s = e.nativeEvent.source;
      if (typeof s?.width === "number" && typeof s?.height === "number") {
        applySize(s.width, s.height);
      }
    },
    [applySize],
  );

  if (!uri?.trim() || typeof width !== "number" || width <= 0 || failed) {
    return (
      <View style={[{ width }, containerStyle]}>
        <Skeleton width={width} height={skeletonHeight} />
      </View>
    );
  }

  return (
    <View style={[{ width }, containerStyle]}>
      <Image
        source={{ uri: uri.trim() }}
        style={[{ width, aspectRatio, backgroundColor: imageSlotBg }, imageStyle]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={() => setFailed(true)}
      />
    </View>
  );
}
