import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Image,
  Platform,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useModalSubtractBleedRow } from "@/hooks/useModalSubtractBleed";
import CoinArtIcon from "./CoinArtIcon";

const SUBTRACT_D =
  "M0 10C0 4.47715 4.47715 0 10 0H169C160.163 3.70472e-07 153 7.16344 153 16V24C153 29.5228 148.523 34 143 34H10C4.47715 34 0 29.5228 0 24V10Z";

export interface BonusWalletExplainModalProps {
  visible: boolean;
  onClose: () => void;
}

const BonusWalletExplainModal: React.FC<BonusWalletExplainModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const screen = Dimensions.get("screen");
  const overlayWidth = Math.max(windowWidth, screen.width);
  const overlayHeight = Math.max(windowHeight, screen.height);
  const cardWidth = Math.min(300, overlayWidth * 0.9);
  const maxBodyHeight = Math.min(overlayHeight * 0.62, 420);
  const tc = Colors[theme];
  const primary = tc.primary;

  const headerGradientColors: [string, string] = [tc.primary, tc.gradientEnd];

  const subtractRow1 = useModalSubtractBleedRow();
  const subtractRow2 = useModalSubtractBleedRow();
  const subtractRow3 = useModalSubtractBleedRow();

  const bonusExplainSections = [
    {
      key: "bw-1",
      row: subtractRow1,
      intro: "popup.bonusWallet.bonus-wallet-intro1",
      desc: "popup.bonusWallet.bonus-wallet-desc1",
    },
    {
      key: "bw-2",
      row: subtractRow2,
      intro: "popup.bonusWallet.bonus-wallet-intro2",
      desc: "popup.bonusWallet.bonus-wallet-desc2",
    },
    {
      key: "bw-3",
      row: subtractRow3,
      intro: "popup.bonusWallet.bonus-wallet-intro3",
      desc: "popup.bonusWallet.bonus-wallet-desc3",
    },
  ];

  /** Android：整屏单层 Pressable 接收遮罩点击；勿再叠一层 absoluteFill + box-none（系统上常吞触摸） */
  const rootPressableStyle = [
    styles.dimRoot,
    Platform.OS === "android"
      ? { width: overlayWidth, height: overlayHeight }
      : { flex: 1, alignSelf: "stretch" as const },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={false}
      hardwareAccelerated={Platform.OS !== "android"}
    >
      <Pressable
        style={rootPressableStyle}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close backdrop"
        android_disableSound
      >
        <View
          style={[styles.column, { width: cardWidth }]}
          pointerEvents="box-none"
          collapsable={false}
        >
          <Pressable accessible={false} onPress={() => {}}>
            <View style={[styles.shadowWrap, { width: cardWidth }]}>
              <LinearGradient
                colors={headerGradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.header,
                  {
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  },
                ]}
              >
                <Text style={styles.title}>{t("my.caiBalance")}</Text>
              </LinearGradient>
              <View
                style={[
                  styles.body,
                  {
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    backgroundColor: Colors[theme].cardBg1,
                  },
                  Platform.OS === "android" && { overflow: "hidden" },
                ]}
              >
                <ScrollView
                  style={{ maxHeight: maxBodyHeight }}
                  contentContainerStyle={styles.bodyScrollContent}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  scrollEventThrottle={16}
                  overScrollMode="never"
                >
                  {bonusExplainSections.map((item, index) => {
                    const { row } = item;
                    const isLast = index === bonusExplainSections.length - 1;
                    return (
                      <View
                        key={item.key}
                        style={[
                          styles.contentCard,
                          isLast && styles.contentCardLast,
                        ]}
                      >
                        <View
                          pointerEvents="none"
                          style={[
                            StyleSheet.absoluteFillObject,
                            {
                              backgroundColor: primary,
                              opacity: 0.15,
                              borderRadius: 10,
                            },
                          ]}
                        />
                        <View style={styles.introBox}>
                          <View
                            style={styles.introInner}
                            onLayout={row.onIntroInnerLayout}
                          >
                            <Svg
                              width={row.subtractSvgWidth}
                              height={34}
                              style={[
                                styles.subtractSvg,
                                { left: -row.bleedPx },
                              ]}
                              viewBox="0 0 169 34"
                              preserveAspectRatio="none"
                            >
                              <Path
                                d={SUBTRACT_D}
                                fill={primary}
                                opacity={0.45}
                              />
                            </Svg>
                            <Text
                              style={[
                                styles.sectionTitle,
                                {
                                  color: "#fff",
                                },
                              ]}
                            >
                              {t(item.intro)}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.descText,
                            {
                              color: Colors[theme].text,
                              writingDirection: "ltr",
                              textAlign: "left",
                            },
                          ]}
                        >
                          {t(item.desc)}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </Pressable>
          <View style={styles.coinArt} pointerEvents="none">
            <CoinArtIcon />
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            style={styles.closeOutside}
            android_disableSound
          >
            <Image
              source={require("@/assets/images/myCenter/close-circle.png")}
              style={styles.closeImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dimRoot: {
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  column: {
    alignItems: "center",
    position: "relative",
    overflow: "visible",
  },
  shadowWrap: {
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    ...Platform.select({
      android: { elevation: 4 },
      default: { elevation: 10 },
    }),
  },
  header: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    zIndex: 2,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  coinArt: {
    position: "absolute",
    right: 4,
    top: -22,
    width: 81,
    height: 62,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
  },
  bodyScrollContent: {
    paddingBottom: 4,
  },
  contentCard: {
    borderRadius: 10,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
    position: "relative",
    marginBottom: 5,
  },
  contentCardLast: {
    marginBottom: 0,
  },
  introBox: {
    marginBottom: 0,
    minHeight: 34,
    justifyContent: "center",
    position: "relative",
    width: "100%",
  },
  introInner: {
    position: "relative",
    alignSelf: "flex-start",
    maxWidth: "100%",
    zIndex: 1,
  },
  subtractSvg: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    zIndex: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 16.25,
    marginLeft: 4,
    marginBottom: 10,
    paddingRight: 48,
    zIndex: 1,
  },
  descText: {
    fontSize: 11,
    lineHeight: 17.6,
    color: "#333",
    zIndex: 1,
  },
  closeOutside: {
    marginTop: 5,
    alignSelf: "center",
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    ...Platform.select({
      android: { elevation: 8 },
      default: {},
    }),
  },
  closeImage: {
    width: 31,
    height: 31,
  },
});

export default BonusWalletExplainModal;
