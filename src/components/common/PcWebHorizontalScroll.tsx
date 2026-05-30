import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";

/** Web 上等同 div；与 `ActiveBlock` PC 横向滚动一致 */
const WebDiv: any = View;

export type PcWebHorizontalScrollProps = {
  children: ReactNode;
  /** 外层滚动容器 */
  style?: ViewStyle | ViewStyle[] | undefined;
  /** 内层横向 flex 行（如 gap、alignItems） */
  rowStyle?: ViewStyle | ViewStyle[] | undefined;
  className?: string;
};

/**
 * PC Web：原生 overflow-x + 滚轮映射 + 拖拽横滑（与首页 `ActiveBlock` 行为对齐）。
 * 仅在 `Platform.OS === "web"` 时挂载 window 级拖拽监听。
 */
export function PcWebHorizontalScroll({
  children,
  style,
  rowStyle,
  className = "pc-hscrollbar",
}: PcWebHorizontalScrollProps) {
  const webScrollRef = useRef<any>(null);
  const webDragStateRef = useRef<{
    dragging: boolean;
    startClientX: number;
    startScrollLeft: number;
  }>({ dragging: false, startClientX: 0, startScrollLeft: 0 });

  const scrollWebTo = useCallback((left: number) => {
    const el = webScrollRef.current as any;
    if (!el) return;
    el.scrollLeft = left;
  }, []);

  const handleWebWheelNative = useCallback(
    (event: any) => {
      const el = webScrollRef.current as any;
      if (!el) return;
      const deltaX = Number(event?.deltaX ?? event?.nativeEvent?.deltaX ?? 0);
      const deltaY = Number(event?.deltaY ?? event?.nativeEvent?.deltaY ?? 0);
      const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      if (!delta) return;

      const max = Math.max(0, Number(el.scrollWidth ?? 0) - Number(el.clientWidth ?? 0));
      const next = Math.max(0, Math.min(Number(el.scrollLeft ?? 0) + delta, max));
      if (Math.abs(next - Number(el.scrollLeft ?? 0)) < 0.5) return;

      if (typeof event?.preventDefault === "function") event.preventDefault();
      scrollWebTo(next);
    },
    [scrollWebTo],
  );

  const handleWebMouseDown = useCallback((event: any) => {
    const el = webScrollRef.current as any;
    if (!el) return;
    webDragStateRef.current.dragging = true;
    webDragStateRef.current.startClientX = Number(
      event?.clientX ?? event?.nativeEvent?.clientX ?? 0,
    );
    webDragStateRef.current.startScrollLeft = Number(el.scrollLeft ?? 0);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const onMove = (e: any) => {
      if (!webDragStateRef.current.dragging) return;
      const el = webScrollRef.current as any;
      if (!el) return;
      const clientX = Number(e?.clientX ?? 0);
      const dx = clientX - webDragStateRef.current.startClientX;
      const max = Math.max(0, Number(el.scrollWidth ?? 0) - Number(el.clientWidth ?? 0));
      const next = Math.max(0, Math.min(webDragStateRef.current.startScrollLeft - dx, max));
      scrollWebTo(next);
    };
    const onUp = () => {
      webDragStateRef.current.dragging = false;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove as any);
      window.removeEventListener("mouseup", onUp as any);
    };
  }, [scrollWebTo]);

  if (Platform.OS !== "web") {
    return <View style={style}>{children}</View>;
  }

  return (
    <WebDiv
      ref={webScrollRef}
      className={className}
      style={[styles.webScroller, style] as any}
      onWheel={handleWebWheelNative as any}
      onMouseDown={handleWebMouseDown as any}
    >
      <View style={[styles.webRow, rowStyle]}>{children}</View>
    </WebDiv>
  );
}

const styles = StyleSheet.create({
  webScroller: {
    overflowX: "scroll",
    overflowY: "hidden",
    WebkitOverflowScrolling: "touch",
    paddingBottom: 2,
  } as any,
  webRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
  } as any,
});
