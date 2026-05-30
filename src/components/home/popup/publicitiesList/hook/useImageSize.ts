import { Image } from "react-native";
import { useEffect, useMemo, useState } from "react";

interface UseImageSizeOptions {
  photoUrl?: string;
  popWidth: number;
}

const DEFAULT_IMAGE_SIZE = {
  width: 287,
  height: 96,
};

export function useImageSize({
  photoUrl,
  popWidth,
}: UseImageSizeOptions) {
  const [imageSize, setImageSize] = useState(DEFAULT_IMAGE_SIZE);

  // 当前展示图片变化后，重新读取图片原始尺寸，方便按比例计算展示高度
  useEffect(() => {
    if (!photoUrl) {
      setImageSize(DEFAULT_IMAGE_SIZE);
      return;
    }

    Image.getSize(
      photoUrl,
      (width, height) => {
        setImageSize({ width, height });
      },
      () => {
        setImageSize(DEFAULT_IMAGE_SIZE);
      },
    );
  }, [photoUrl]);

  // 根据弹窗内容区域宽度和图片原始比例，计算最终展示尺寸
  const { imageWidth, imageHeight } = useMemo(() => {
    const imageWidth = popWidth;
    const imageHeight = Math.floor(
      (imageWidth * imageSize.height) / imageSize.width,
    );
    return { imageWidth, imageHeight };
  }, [imageSize, popWidth]);

  return {
    imageWidth,
    imageHeight,
  };
}
