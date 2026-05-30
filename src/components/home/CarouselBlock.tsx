import { View, StyleSheet, Image, Pressable } from "react-native";
import { Extrapolation, interpolate, useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState, memo, useMemo } from "react";
import { getBannerServer } from "@/api";
import { useToast } from "@/components/common/toast";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useTranslation } from "react-i18next";
import { Skeleton } from "./components/Skeleton";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { handleBannerOpenLink } from "./utils/bannerLink";
/** 与设计稿 Banner 比例一致：宽 340、高 145 */
const BANNER_RATIO_W = 340;
const BANNER_RATIO_H = 145;

type CarouselBlockProps = {
  // 0 = 首页 banner，1 = 钱包 banner
  bannerType?: 0 | 1;
};

// 屏蔽 react-native-reanimated-carousel 的 findDOMNode 废弃警告，只执行一次
const _origConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("findDOMNode is deprecated")) return;
  _origConsoleError(...args);
};

const CarouselBlockComponent = ({ bannerType = 0 }: CarouselBlockProps) => {
  const { maxWidth } = useMaxWidth();

  const carouselHeight = useMemo(
    () => Math.max(1, Math.round((maxWidth * BANNER_RATIO_H) / BANNER_RATIO_W)),
    [maxWidth],
  );

  const skeletonHeight = useMemo(
    () => Math.max(1, Math.round(((maxWidth - 24) * BANNER_RATIO_H) / BANNER_RATIO_W)),
    [maxWidth],
  );

  const banner: any = useSelector((state: RootState) => state?.selfConfig?.banner);
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [imgList, setImgList] = useState([]);
  const ref = useRef<ICarouselInstance>(null);
  /** 已成功拉取过一次（含接口返回空列表），避免同屏重复打接口 */
  const loadedRef = useRef(false);
  /** 防止并发双请求（比「先发请求再置 loaded」更安全，减少 iOS 偶现只打一次却未 setState 的竞态） */
  const inFlightRef = useRef(false);
  /** 与 useFocusEffect 清理联动：失焦后丢弃晚到的 setState，且不把本次算作已加载 */
  const focusAliveRef = useRef(true);

  const typeConfig = useMemo(
    () =>
      banner == 3
        ? {
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 52,
        }
        : {
          parallaxScrollingScale: 1,
          parallaxScrollingOffset: 0,
        },
    [banner],
  );

  const getBanner = useCallback(() => {
    if (loadedRef.current) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    getBannerServer()
      .then((res: any) => {
        if (!focusAliveRef.current) return;
        if (res?.data?.data?.length > 0) {
          const list = res.data.data.filter((item: any) => {
            if (item.status != 0) return false;
            return item.type === bannerType;
          });
          setImgList(list.length > 0 ? list : []);
        } else {
          setImgList([]);
        }
      })
      .catch(() => {
        // loadedRef.current = false;
      })
      .finally(() => {
        loadedRef.current = true;
        inFlightRef.current = false;
      });
  }, [bannerType]);

  useFocusEffect(
    useCallback(() => {
      focusAliveRef.current = true;
      getBanner();
      return () => {
        focusAliveRef.current = false;
      };
    }, [getBanner]),
  );

  // 语言切换时需要重新拉 Banner（不依赖页面重新聚焦）
  useEffect(() => {
    loadedRef.current = false;
    getBanner();
  }, [i18n.language, getBanner]);

  const progress = useSharedValue<number>(0);

  const onBannerImagePress = useCallback(
    (openLink: string) => {
      if (!openLink) return;
      void handleBannerOpenLink(openLink, toast, t);
    },
    [toast, t],
  );

  const renderItem = useCallback(
    (e: any) => {
      const imageSource = e.item?.bannerImg1 ? { uri: e.item.bannerImg1 } : e.item;
      const openLink = typeof e.item?.openLink === "string" ? e.item.openLink.trim() : "";

      return (
        <Pressable
          style={[styles.item, { width: maxWidth, height: carouselHeight }]}
          disabled={!openLink}
          onPress={() => onBannerImagePress(openLink)}
        >
          <Image
            style={[styles.img, { height: carouselHeight }]}
            resizeMethod={"scale"}
            resizeMode={"cover"}
            source={imageSource}
          />
        </Pressable>
      );
    },
    [onBannerImagePress, maxWidth, carouselHeight],
  );

  const onPressPagination = useCallback(
    (index: number) => {
      ref.current?.scrollTo({
        count: index - progress.value,
        animated: true,
      });
    },
    [progress.value],
  );

  return (
    <View>
      {imgList?.length > 0 ? (
        <View
          style={[
            {
              marginHorizontal: banner == 3 ? 0 : 12,
              height: carouselHeight,
              marginBottom: 0,
              marginTop: banner == 3 ? 0 : 10,
            },
          ]}
        >
          <View style={[styles.block]}>
            <Carousel
              ref={ref}
              loop={true}
              width={maxWidth}
              height={carouselHeight}
              mode="parallax"
              modeConfig={typeConfig}
              snapEnabled={true}
              pagingEnabled={true}
              autoPlay={true}
              autoPlayInterval={2000}
              data={imgList || []}
              vertical={banner == 2 ? true : false}
              style={{ width: maxWidth }}
              onScrollStart={() => { }}
              onScrollEnd={() => { }}
              onProgressChange={progress}
              onConfigurePanGesture={(g: { enabled: (arg0: boolean) => any }) => {
                "worklet";
                g.enabled(true);
              }}
              onSnapToItem={(index: number) => { }}
              renderItem={renderItem}
            />
          </View>
          {imgList?.length > 1 && (
            <View style={styles.dotBox}>
              <Pagination.Custom<{ color: string }>
                progress={progress}
                data={imgList}
                size={6}
                dotStyle={{
                  borderRadius: 7,
                  backgroundColor: Colors[theme].blockBg,
                }}
                activeDotStyle={{
                  borderRadius: 7,
                  width: 40,
                  overflow: "hidden",
                  backgroundColor: Colors[theme].primary,
                }}
                containerStyle={{
                  gap: 5,
                  marginBottom: 10,
                  alignItems: "center",
                  height: 10,
                }}
                horizontal
                onPress={onPressPagination}
                customReanimatedStyle={(progress, index, length) => {
                  let val = Math.abs(progress - index);
                  if (index === 0 && progress > length - 1) {
                    val = Math.abs(progress - length);
                  }
                  return {
                    transform: [
                      {
                        translateY: interpolate(val, [0, 1], [0, 0], Extrapolation.CLAMP),
                      },
                    ],
                  };
                }}
              />
            </View>
          )}
        </View>
      ) : loadedRef.current ? null :
        (
          <View
            style={{
              width: maxWidth,
              height: skeletonHeight,
              paddingTop: 10,
              marginVertical: 12,
              borderRadius: 6,
              marginHorizontal: 12
            }}
          >
            <Skeleton width={maxWidth - 24} height={skeletonHeight} />
          </View>
        )}
    </View>
  );
};

export const CarouselBlock = memo(CarouselBlockComponent);

const styles = StyleSheet.create({
  block: {
    flex: 1,
    width: "100%",
    borderRadius: 6,
    overflow: "hidden",
  },
  item: {
    borderRadius: 6,
  },
  img: {
    width: "100%",
    borderRadius: 6,
    overflow: "hidden",
  },
  dotBox: {
    position: "absolute",
    bottom: 10,
    height: 10,
    left: 0,
    right: 0,
    margin: "auto",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
