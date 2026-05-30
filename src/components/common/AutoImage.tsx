import React, { useCallback, useEffect, useState } from "react";
import {
  ImageStyle,
  Image as RNImage,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Image as ExpoImage, type ImageContentFit } from "expo-image";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { DefaultIcon } from "@/components/icons/active/index";

/**
 * Created by wille on 2025/04/11.
 *
 * uri里的图片加载失败时，可不显示Image元素，也可显示默认图；
 * 支持自动计算宽高比并适配高度；
 * 支持tailwind。
 * @param {string} uri  你想加载的图片地址
 * @param {string} errorImgUri  远程默认图的位置
 * @param {any} errorImgLocal  本地默认图的位置
 * @param {boolean} defaultSvg  默认图是svg还是图片：是图片就自己配置默认图，是svg就用这里默认的
 * @param {boolean} autoAspectRatio  是否自动计算宽高比
 * @param {number} fallbackSvgScale  调整默认svg相对短边的比例
 */

interface AutoImageProps {
  uri: string;
  imageStyle?: StyleProp<ImageStyle>; //给默认的svg改样式
  viewStyle?: StyleProp<ViewStyle>;// 给img改样式
  className?: string;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
  errorImgLocal?: any;
  errorImgUri?: string;
  defaultIsSvg?: boolean;
  /** 按图片真实宽高比自动设置 aspectRatio（前提是 style 不要写死 height） */
  autoAspectRatio?: boolean;
  /** 如果有明确的 width / height → 用固定尺寸
      如果没有 → 撑满父容器*/
  slotWidth?: number;
  slotHeight?: number;
  /** defaultSvg 相对短边的比例，默认 0.52 */
  fallbackSvgScale?: number;
}

function resizeModeToContentFit(
  mode: AutoImageProps["resizeMode"],
): ImageContentFit {
  switch (mode) {
    case "contain":
      return "contain";
    case "stretch":
      return "fill";
    case "center":
      return "none";
    default:
      return "cover";
  }
}

const AutoImage: React.FC<AutoImageProps> = ({
  uri,
  imageStyle,
  viewStyle,
  className,
  resizeMode = "cover",
  errorImgLocal,
  errorImgUri,
  defaultIsSvg = false,
  autoAspectRatio = false,
  slotWidth,
  slotHeight,
  fallbackSvgScale = 0.6,
}) => {
  const [error, setError] = useState(false);
  const [fallbackBox, setFallbackBox] = useState({ w: 0, h: 0 });
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const { theme } = useTheme();
  const contentFit = resizeModeToContentFit(resizeMode);

  const onFallbackLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setFallbackBox((prev) =>
      prev.w === width && prev.h === height ? prev : { w: width, h: height },
    );
  }, []);

  useEffect(() => {
    if (!uri) {
      setError(true);
      setAspectRatio(undefined);
      return;
    }
    setError(false);
  }, [uri]);

  useEffect(() => {
    if (!autoAspectRatio || !uri) return;
    let cancelled = false;
    RNImage.getSize(
      uri,
      (w, h) => {
        if (cancelled) return;
        if (w > 0 && h > 0) setAspectRatio(w / h);
        else setAspectRatio(undefined);
      },
      () => {
        if (cancelled) return;
        setAspectRatio(undefined);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [autoAspectRatio, uri]);

  const renderFallback = () => {
    if (defaultIsSvg) {
      const effW =
        typeof slotWidth === "number" && slotWidth > 0 ? slotWidth : fallbackBox.w;
      const effH =
        typeof slotHeight === "number" && slotHeight > 0 ? slotHeight : fallbackBox.h;
      const iconLen =
        effW > 0 && effH > 0
          ? Math.round(Math.min(effW, effH) * fallbackSvgScale)
          : 56;
      return (
        <View onLayout={onFallbackLayout}
          className={`bg-${theme}-blockBg justify-center items-center`}
          style={[
            typeof slotWidth === "number" &&
              slotWidth > 0 &&
              typeof slotHeight === "number" &&
              slotHeight > 0
              ? { width: slotWidth, height: slotHeight }
              : StyleSheet.absoluteFillObject,
            viewStyle,
          ]}
        >
          <DefaultIcon
            fill={Colors[theme].lightText}
            width={iconLen}
            height={iconLen}
          />
        </View>
      );
    }
    if (!defaultIsSvg) {
      const fallbackSource = errorImgUri
        ? { uri: errorImgUri }
        : errorImgLocal
          ? errorImgLocal
          : require("@/assets/images/active/missionCenter/default.png");
      return (
        <ExpoImage
          className={className}
          source={fallbackSource}
          style={[
            viewStyle as StyleProp<ImageStyle>,
            autoAspectRatio && aspectRatio ? { aspectRatio } : null,
            imageStyle,
          ]}
          contentFit={contentFit}
          cachePolicy="memory-disk"
          transition={null}
        />
      );
    }
  };
  if (!uri || error) return renderFallback();

  return (
    <ExpoImage
      key={uri}
      recyclingKey={uri}
      className={className}
      source={{ uri }}
      style={[
        viewStyle as StyleProp<ImageStyle>,
        autoAspectRatio && aspectRatio ? { aspectRatio } : null,
        imageStyle,
      ]}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      transition={null}
      onError={() => setError(true)}
    />
  );
};

export default React.memo(AutoImage);
