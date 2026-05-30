import FloatDrag from "@/components/common/FloatDrag";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { Platform, StyleSheet, TouchableOpacity, Image, View } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDynamicMaxWidth } from "@/hooks/useMaxWidth";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { getStoreJson } from "@/utils/storage";
import { autoExchangeAccInfo } from "../utils/util";
import { changeIsShowGameModel } from "@/store/game/gameSlice";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function FloatingButton() {
  const [isDragging, setIsDragging] = useState(false);
  const dragLockRef = useRef(false);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const gameState = useSelector((state: RootState) => state.game.isShowGameModel);
  const isWeb = Platform.OS === "web";
  // PC Web：根节点 html 常被设为 maxWidth 居中（见 _layout），坐标系是窄列宽度，不能按整屏加 gutter
  const dispatch: AppDispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const initialX = insets.left + 20;
  const initialY = Platform.OS === "ios" ? insets.top + 20 : 20

  useEffect(() => {
    if (!gameState && isProcessing) {
      setIsProcessing(false);
    }
  }, [gameState, isProcessing]);

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    };
  }, []);



  const goBackToHome = useCallback(() => {
    if (isProcessing) return;
    console.log('goBackToHome');
    //setLogOutModal(true);
    goToHome();
  }, [isProcessing]);

  const goToHome=async()=>{
     if (isProcessing) return;
      setIsProcessing(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, Platform.OS === "ios" ? 100 : 0));
        getStoreJson("lastGame").then((res: any) => {
          if (res?.gameId) {
            autoExchangeAccInfo(dispatch, res?.gameId);
          }
        });

        dispatch(changeIsShowGameModel(false));
      } finally {
        setTimeout(
          () => {
            setIsProcessing(false);
          },
          Platform.OS === "ios" ? 500 : 100,
        );
      }
  }
  return(<FloatDrag
    style={styles.float}
    startDrag={() => {
      dragLockRef.current = true;
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
      setIsDragging(true);
    }}
    endDrag={() => {
      setIsDragging(false);
      // Web 上 mouseup 后仍可能合成 click，稍微延迟解锁避免误触发 onPress
      unlockTimerRef.current = setTimeout(() => {
        dragLockRef.current = false;
      }, Platform.OS === "web" ? 250 : 0);
    }}
    initialPosition={{ x: initialX, y: initialY }}
  >
    <TouchableOpacity
      disabled={isDragging}
      onPress={() => {
        if (dragLockRef.current) return;
        goBackToHome();

      }}
    >
      <View style={styles.buttonContent}>
            <SimpleLineIcons name="arrow-left" size={16} color="rgba(255,255,255,0.9)" />
      </View>
    </TouchableOpacity>
  </FloatDrag>)
}

const styles = StyleSheet.create({
  float: {
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 999,
  },
  buttonContent: {
    width: 40,
    height:40,
    borderRadius: 30,
    backgroundColor: "rgba(121, 129, 141, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});
