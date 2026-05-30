//活动弹窗的标头
import ProPopupHeader from "@/components/active/components/propopup/ProPopupHeader";
import { vipTheme } from "@/components/active/components/activeConfg";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

const MODAL_BACKDROP = "rgba(0,0,0,0.55)";
/** 与 ProPopupHeader 根 ImageBackground 的 height 保持一致 */
const POPUP_HEADER_HEIGHT = 45;
/** 原 p-4 上下内边距 */
const CARD_BODY_PADDING_V = 32;

interface PopupModalProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  type?: 'default' | 'linear';
}

const ProPopup: React.FC<PopupModalProps> = ({ title, visible, onClose, children, type = 'default' }) => {
  const { theme } = useTheme();
  const { maxWidth } = useMaxWidth();
  const { height: windowHeight } = useWindowDimensions();
  const cardHeight = Math.max(220, Math.round(windowHeight * 0.66));
  const scrollMaxHeight = useMemo(
    () =>
      Math.max(120, cardHeight - POPUP_HEADER_HEIGHT - CARD_BODY_PADDING_V),
    [cardHeight]
  );
  /** 内容不足一屏时收缩高度；超过 scrollMaxHeight 时固定为 scrollMaxHeight 由 ScrollView 滚动 */
  const [scrollBodyH, setScrollBodyH] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (visible) setScrollBodyH(undefined);
  }, [visible]);

  const body = (
    <View style={styles.bodyRoot} collapsable={false}>
      <Pressable
        style={[StyleSheet.absoluteFillObject, { backgroundColor: MODAL_BACKDROP }]}
        onPress={onClose}
      />
      <View
        pointerEvents="box-none"
        style={[StyleSheet.absoluteFillObject, styles.contentLayer]}
        collapsable={false}
      >
        <View
          className="px-9 justify-center flex-1"
          pointerEvents="box-none"
          style={{ width: "100%", maxWidth, alignSelf: "center" }}
        >
          <View
            className="w-full rounded-2xl overflow-hidden"
            style={{
              maxHeight: cardHeight,
              backgroundColor: Colors[theme].background,
            }}
          >
            <ProPopupHeader title={title} />
            {type === 'linear' ? (
              <LinearGradient
                colors={[vipTheme[theme].box.s, vipTheme[theme].box.e]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={styles.linearGradientRoot}
              >
                {/* LinearGradient + NativeWind className 在 iOS/Android 上 padding 常不生效，用普通 View 做内边距 */}
                <View style={styles.cardBody}>
                  <ScrollView
                    scrollEventThrottle={49}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                    style={[
                      { maxHeight: scrollMaxHeight },
                      scrollBodyH != null && {
                        height: Math.min(scrollBodyH, scrollMaxHeight),
                      },
                    ]}
                    contentContainerStyle={styles.scrollInner}
                    onContentSizeChange={(_, h) =>
                      setScrollBodyH((prev) => (prev === h ? prev : h))
                    }
                  >
                    {children}
                  </ScrollView>
                </View>
              </LinearGradient>
            ) : (
              <View style={styles.cardBody}>
                <ScrollView
                  scrollEventThrottle={49}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                  style={[
                    { maxHeight: scrollMaxHeight },
                    scrollBodyH != null && {
                      height: Math.min(scrollBodyH, scrollMaxHeight),
                    },
                  ]}
                  contentContainerStyle={styles.scrollInner}
                  onContentSizeChange={(_, h) =>
                    setScrollBodyH((prev) => (prev === h ? prev : h))
                  }
                >
                  {children}
                </ScrollView>
              </View>)}
          </View>
          <View style={styles.closeRow}>
            <Pressable
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              style={styles.closePressable}
              onPress={onClose}
            >
              <Ionicons
                color={"#fff"}
                name={"close-circle-outline"}
                size={34}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  if (!visible) return null;

  // Web：用 Modal 保证盖住全页；iOS/Android：屏内叠层 + 挂在 GHR 内，避免 Android RN Modal 内 Pressable 完全不响应
  if (Platform.OS === "web") {
    return (
      <Modal transparent visible animationType="none" onRequestClose={onClose}>
        <View style={styles.webModalRoot}>{body}</View>
      </Modal>
    );
  }

  return (
    <View style={styles.screenOverlay} pointerEvents="box-none">
      {body}
    </View>
  );
};

const styles = StyleSheet.create({
  bodyRoot: {
    flex: 1,
    width: "100%",
  },
  linearGradientRoot: {
    width: "100%",
    flexShrink: 1,
  },
  cardBody: {
    padding: 16,
    flexShrink: 1,
  },
  scrollInner: {
    flexGrow: 0,
  },
  closeRow: {
    alignSelf: "center",
    alignItems: "center",
  },
  contentLayer: {
    justifyContent: "center",
    ...Platform.select({
      android: { elevation: 8 },
      default: {},
    }),
  },
  closePressable: {
    marginTop: 9,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  screenOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100000,
    ...Platform.select({
      android: { elevation: 100 },
      default: {},
    }),
  },
  webModalRoot: {
    flex: 1,
    width: "100%",
  },
});

export default ProPopup;
