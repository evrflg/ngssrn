import { useCallback, useEffect, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import Modal from "react-native-modal";

interface PopupModalProps {
  onClose: () => void | Promise<void>;
  children: React.ReactNode;
  /** 弹窗刚出现时忽略触摸，避免晚到的遮罩接住用户已在首页按下的手势 */
  suppressInitialPointerEventsMs?: number;
  [key: string]: any;
}

export function PopupModal({
  onClose,
  children,
  suppressInitialPointerEventsMs = 320,
  ...props
}: Partial<PopupModalProps>) {
  const { width } = useWindowDimensions();
  const isVisible = !!props.isVisible;

  const [acceptTouches, setAcceptTouches] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      setAcceptTouches(true);
      return;
    }
    if (!suppressInitialPointerEventsMs || suppressInitialPointerEventsMs <= 0) {
      setAcceptTouches(true);
      return;
    }
    setAcceptTouches(false);
    const t = setTimeout(() => setAcceptTouches(true), suppressInitialPointerEventsMs);
    return () => clearTimeout(t);
  }, [isVisible, suppressInitialPointerEventsMs]);

  const handleBackdropPress = useCallback(() => {
    if (!acceptTouches) return;
    if (props.onBackdropPress) {
      props.onBackdropPress();
      return;
    }
    onClose?.();
  }, [acceptTouches, onClose, props.onBackdropPress]);

  return (
    <Modal
      animationIn='slideInUp'
      animationOut='slideOutDown'
      backdropOpacity={0.8}
      animationOutTiming={100}
      deviceWidth={width}
      {...props}
      onBackdropPress={handleBackdropPress}
    >
      <View pointerEvents={acceptTouches ? "auto" : "none"} collapsable={false}>
        {children}
      </View>
    </Modal>
  );
}
