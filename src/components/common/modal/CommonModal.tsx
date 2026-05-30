import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/theme/ThemeProvider';
import { resolveSafeAreaExtensionBg } from '@/utils/resolveSafeAreaExtensionBg';

export type CommonModalRef = {
  toggleModal: () => void;
  openModal: () => void;
  closeModal: () => void;
};

interface CommonModalProps {
  children: React.ReactNode;
  backdropOpacity?: number;
  onBackdropPress?: () => void;
  onClose?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  safeAreaBgColor?: string;
  /** 底部是否补一条与刘海区同色的填充（贴底弹窗用）；居中弹窗请传 false */
  extendBottomSafeArea?: boolean;
  [key: string]: any;
}

/**
 * 使用 RN 自带 Modal，避免 react-native-modal 在 close 动画结束且 isVisible 仍为 true 时再次 open()
 * （易与 ScrollView/手势叠加出「缩回再弹出」）。布局用绝对定位贴底，不依赖外层 flex 首帧高度。
 */
const CommonModal = forwardRef<CommonModalRef, CommonModalProps>(
  (
    {
      children,
      backdropOpacity = 0.7,
      onBackdropPress,
      onClose,
      contentStyle,
      safeAreaBgColor,
      extendBottomSafeArea = true,
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const resolvedSafeAreaBgColor = resolveSafeAreaExtensionBg(
      theme,
      safeAreaBgColor,
    );

    useImperativeHandle(
      ref,
      () => ({
        toggleModal: () => setVisible((v) => !v),
        openModal: () => setVisible(true),
        closeModal: () => setVisible(false),
      }),
      [],
    );

    // 点击遮罩层
    const handleBackdropPress = () => {
      onBackdropPress?.() ?? handleClose();
    };

    // 关闭弹窗事件
    const handleClose = () => {
      !props.visible && setVisible(false);
      onClose?.();
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        statusBarTranslucent
        {...props}
      >
        <View
          style={[styles.root, { pointerEvents: 'box-none' }, contentStyle]}
        >
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: `rgba(0,0,0,${backdropOpacity})` },
            ]}
            onPress={handleBackdropPress}
          />
          <View style={[styles.sheet]}>
            <View>{children}</View>
            {extendBottomSafeArea && insets.bottom > 0 && (
              <View
                pointerEvents="none"
                style={[
                  styles.safeAreaFill,
                  {
                    height: insets.bottom,
                    backgroundColor: resolvedSafeAreaBgColor,
                  },
                ]}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  },
);

CommonModal.displayName = 'CommonModal';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  safeAreaFill: {
    width: '100%',
  },
});

export default CommonModal;
