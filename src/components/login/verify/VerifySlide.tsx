import { reqCheck } from "@/api";
import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, Animated, PanResponder, Image, Platform } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { aesEncrypt } from "../utils/util";
import { useToast } from "@/components/common/toast";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from "react-i18next";
import Toast from "@/components/common/toast/src/Toast";

const isWeb = Platform.OS === "web";

export const VerifySlide = (data: any) => {
  const { filterModalRef, onVerifyCallback, initPicData, getPictrue } = data.data;
  const { t } = useTranslation();
  const toast = useToast();
  const [text, setText] = useState(t("login.verifySlide.verifySlideTitle"))
  const [leftBarWidth, setLeftBarWidth] = useState(32)
  const [backImgBase, setBackImgBase] = useState("")
  const [blockBackImgBase, setBlockBackImgBase] = useState("")
  const backToken = useRef("")
  const secretKey = useRef("")
  const [, setTipWords] = useState(t("login.verifySlide.verifyText"))
  const panX = useRef(new Animated.Value(0)).current;
  const status = useRef(false) //鼠标状态
  const lastDx = useRef(0);
  const rootNativeId = useRef(`verify-slide-root-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {

    if (initPicData) {
      init()
    }
  }, [initPicData])

  useEffect(() => {
    // 华为浏览器等：滑动时页面会跟着滚动，导致行为验证拖拽失败
    // Web 下在滑块区域内明确禁止 touchmove 的默认滚动
    if (!isWeb || typeof document === "undefined") return;

    const el = document.getElementById(rootNativeId.current);
    if (!el) return;

    const prevOverflow = document.body?.style?.overflow;
    if (document.body?.style) document.body.style.overflow = "hidden";

    const stopScroll = (e: TouchEvent) => {
      // 只拦截发生在验证组件内部的 touchmove
      // （避免影响页面其他区域的手势）
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!el.contains(target)) return;
      e.preventDefault();
    };

    el.addEventListener("touchmove", stopScroll, { passive: false });
    el.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });

    return () => {
      el.removeEventListener("touchmove", stopScroll as any);
      // wheel 这里是匿名函数，无法 remove；但组件卸载即销毁 el，不影响。
      // 恢复滚动
      if (document.body?.style) document.body.style.overflow = prevOverflow || "";
    };
  }, []);

  const init = async () => {
    if (initPicData) {
      setBackImgBase(initPicData.originalImageBase64 || "")
      setBlockBackImgBase(initPicData.jigsawImageBase64 || "")
      backToken.current = initPicData.token || ""
      secretKey.current = initPicData.secretKey || ""
    }
  }
  const start = (e: any) => {
    setText("")
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;
        lastDx.current = dx; // ✅ 实时监听
        setLeftBarWidth(dx)
        panX.setValue(dx); // 更新位置
      },
      onPanResponderRelease: () => {
        let moveLeftDistance = isWeb ? lastDx.current : lastDx.current + 4
        const params: any = {
          captchaType: "blockPuzzle",
          pointJson: secretKey.current
            ? aesEncrypt(JSON.stringify({ x: moveLeftDistance, y: 5.0 }), secretKey.current)
            : JSON.stringify({ x: moveLeftDistance, y: 5.0 }),
          token: backToken.current,
        }
        // 验证逻辑
        validateCaptcha(params, moveLeftDistance)
        // setText("向右滑动完成验证")
      },
    })
  ).current;

  const validateCaptcha = async (params: any, moveLeftDistance: number) => {
    try {
      const resData = await reqCheck(params)
      const res = resData?.data
      if (res?.repCode === '0000') {
        //toast.success(t("login.verifySlide.verifySuccess"), res.repMsg)
        setTipWords(t("login.verifySlide.verifySuccess"))
        setText(t("login.verifySlide.verifySuccess"))
        filterModalRef && filterModalRef.current.closeModal()
        status.current = true
        const captchaVerification = secretKey.current
          ? aesEncrypt(
            backToken.current + '---' + JSON.stringify({ x: moveLeftDistance, y: 5.0 }),
            secretKey.current,
          )
          : backToken.current + '---' + JSON.stringify({ x: moveLeftDistance, y: 5.0 })
        onVerifyCallback && onVerifyCallback(captchaVerification)
        //执行回调
        reset()
      } else {
        toast.error(t("login.verifySlide.verifyFailed2"))
        reset()
      }
    } catch {
      toast.error(t("login.verifySlide.verifyFailed"))
      setTipWords(t("login.verifySlide.verifyFailed2"))
      reset()
    }
  }

  const reset = async () => {
    await sleep()
    await getPictrue()
    setTipWords("")
    setLeftBarWidth(32)
    lastDx.current = 0
    Animated.spring(panX, {
      toValue: 0,
      useNativeDriver: false,
    }).start();

  }

  const sleep = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms))

  return <View nativeID={rootNativeId.current} style={{ position: 'relative' }}>
    <View style={styles.verifyImgOut}>
      <View style={styles.verifyImgPanel}>
        <Image
          source={{ uri: `data:image/png;base64,${backImgBase}` }}
          style={{ width: '100%', height: '100%' }}
          resizeMode='contain'
        />
        {/* 验证码图片 */}
        <View style={styles.verifyRefresh}>
          <Ionicons onPress={() => {
            getPictrue()
          }} name="refresh" size={24} color="black" />
        </View>
      </View>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.verifySubBlock, { width: 36, transform: [{ translateX: panX }], }]}
        onTouchStart={start}
      >
        <Image
          source={{ uri: `data:image/png;base64,${blockBackImgBase}` }}
          style={{ width: 48, height: '100%' }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
    {/* 公共部分 */}
    <View style={styles.verifySideBox}>
      <Text style={{ fontSize: 13 }}>{text}</Text>
      <View style={[styles.verifyLeftBar, { width: leftBarWidth }]}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[{ width: lastDx.current, transform: [{ translateX: panX }], }]}>
          {/* 滑块 */}
          <View onTouchStart={start} style={styles.verifyMoveBlock}>
            <AntDesign name="right" size={16} color="#888" />
          </View>

        </Animated.View>
      </View>

    </View>
    <Toast/>
  </View>;
}
const styles = StyleSheet.create({
  verifyImgOut: {
    height: 174,
  },
  verifyImgPanel: {
    position: 'relative',
    margin: 0,
    height: 172,
    width: 310,
  },
  verifyRefresh: {
    position: 'absolute',
    top: 10,
    right: 0,
    zIndex: 2,
    width: 25,
    height: 25,
    textAlign: 'center',
    cursor: 'pointer',
  },
  /* 滑动验证码 */
  verifySideBox: {
    position: 'relative',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 3,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    width: 310,
  },
  verifyLeftBar: {
    position: 'absolute',
    left: -1,
    top: -1,
    cursor: 'pointer',
    backgroundColor: '#f0fff0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 32,
  },
  verifyMoveBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    cursor: 'pointer',
    backgroundColor: '#fff',
    borderRadius: 8,
    height: 30,
    width: 30,
    shadowColor: '#888',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifySubBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    cursor: 'pointer',
    height: '100%',
  }
});