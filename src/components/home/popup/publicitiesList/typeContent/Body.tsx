import { AutoHeightWebView } from "@/components/common/AutoHeightWebView";
import { Colors } from "@/constants/Colors";
import { Publicity } from "@/types/publicity";
import { AppDispatch, RootState } from "@/store/store";
import { changeIsShowTestUserPopup } from "@/store/user/userSlice";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useImageSize } from "../hook/useImageSize";
import { Dimensions, Image, ScrollView, View, StyleProp, ViewStyle, Pressable } from "react-native";
import { useFooter } from "../hook/useFooter";
import { useTypeContentContext } from "./TypeContentContext";

interface BodyProps {
  activePublicity: Publicity | null;
  theme: keyof typeof Colors;
  style?: StyleProp<ViewStyle>;
  type?: '1' | '2' | '3';
}

const { height } = Dimensions.get('window');

export function Body({
  activePublicity,
  theme,
  style,
  type,
}: BodyProps) {
  const dispatch: AppDispatch = useDispatch();
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const { onRequestClose } = useTypeContentContext();
  const { gotoView } = useFooter({ activePublicity });
  const [popWidth, setPopWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  // 图片尺寸
  const { imageWidth, imageHeight } = useImageSize({
    photoUrl: activePublicity?.publicityPhoto,
    popWidth,
  });

  // 公告正文可能是“纯文本 + HTML 标签”混合内容
  const messageHtml = useMemo(() => {
    const raw = activePublicity?.content;
    if (!raw) return "";
    // 换行符处理，末尾会生成一些空行，需要去掉
    const normalized = String(raw)
      .replace(/\r\n?/g, "\n")
      .replace(/\n+$/g, "");
    return `<div style="white-space: pre-wrap; word-break: break-word;">${normalized}</div>`;
  }, [activePublicity?.content]);

  // 每次切换宣传弹窗时，滚动到顶部
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [activePublicity?.id]);

  const handleImagePress = () => {
    if (!activePublicity) return;
    if (userInfo?.isTestUser) {
      dispatch(changeIsShowTestUserPopup(true));
      return;
    }
    gotoView();
    onRequestClose();
  };

  return (
    <View
      style={[{ gap: 8, maxHeight: Math.min(400, height * 0.5) }, style]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        let curWidth = width;
        // 类型1需要paading，类型2的弹窗是左边导航，宽度需要减去24
        if (type === '1' || type === '2') curWidth -= 24

        if (curWidth !== popWidth) {
          setPopWidth(curWidth);
        }
      }}
    >
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <Pressable onPress={handleImagePress}>
          <Image
            source={
              activePublicity?.publicityPhoto
                ? { uri: activePublicity.publicityPhoto }
                : require("@/assets/images/promotion/default.png")
            }
            style={{ borderRadius: 6, width: imageWidth, height: imageHeight }}
            resizeMode="cover"
          />
        </Pressable>
        {messageHtml.length > 0 && (
          <View className="flex-1">
            <AutoHeightWebView
              key={`publicity-webview-${activePublicity?.id ?? "default"}`}
              source={messageHtml}
              width={popWidth > 0 ? popWidth : undefined}
              setInnerHTML
              autoHeight
              htmlStyle={{
                color: Colors[theme].darkColor,
                fontSize: 13,
                backgroundColor: Colors[theme].activeColor,
              }}
            />
          </View>
        )}
      </ScrollView >
    </View>
  );
}
