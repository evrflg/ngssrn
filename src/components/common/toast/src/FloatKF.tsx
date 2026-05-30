import FloatDrag from "../../FloatDrag";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Platform, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDynamicMaxWidth } from "@/hooks/useMaxWidth";

export default function FloatingKH() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isDragging, setIsDragging] = useState(false);
  const dragLockRef = useRef(false);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cfg_site_base = useSelector(
    (state: RootState) => state.user.cfg_site_base,
  );
  const { width: SCREEN_WIDTH, maxWidth } = useDynamicMaxWidth();
  const [source, setSource] = useState<{ uri: string } | number | undefined>(
    cfg_site_base?.customServiceIconLink
      ? { uri: cfg_site_base.customServiceIconLink }
      : undefined,
  );
  const isWeb = Platform.OS === "web";
  // PC Web：根节点 html 常被设为 maxWidth 居中（见 _layout），坐标系是窄列宽度，不能按整屏加 gutter
  const layoutWidth = isWeb ? Math.min(SCREEN_WIDTH, maxWidth) : SCREEN_WIDTH;
  const initialX = Math.max(10, layoutWidth - 60);
  const initialY = isWeb ? 160 : 120;
  const onError = () =>
    setSource(require("@/assets/images/home/customer_service_logo.png"));

  useEffect(() => {
    if (cfg_site_base?.customServiceIconLink) {
      setSource({ uri: cfg_site_base.customServiceIconLink });
    }
  }, [cfg_site_base]);

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    };
  }, []);

  return (
    <FloatDrag
      style={styles.float}
      startDrag={() => {
        dragLockRef.current = true;
        if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
        setIsDragging(true);
      }}
      endDrag={() => {
        setIsDragging(false);
        // Web 上 mouseup 后仍可能合成 click，稍微延迟解锁避免误触发 onPress
        unlockTimerRef.current = setTimeout(
          () => {
            dragLockRef.current = false;
          },
          Platform.OS === "web" ? 250 : 0,
        );
      }}
      initialPosition={{ x: initialX, y: initialY }}
    >
      <TouchableOpacity
        disabled={isDragging}
        onPress={() => {
          if (dragLockRef.current) return;
          navigation.navigate("my/customerService");
        }}
      >
        {source && (
          <Image
            style={{ width: 48, height: 48 }}
            source={source}
            onError={onError}
          />
        )}
      </TouchableOpacity>
    </FloatDrag>
  );
}

const styles = StyleSheet.create({
  float: {
    width: 48,
    height: 48,
    borderRadius: 28,
    zIndex: 999,
  },
});
