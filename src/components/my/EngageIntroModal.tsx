import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import EngageIntroHeaderStars, {
  engageIntroHeaderStarsAspectHeight,
} from "@/components/icons/active/EngageIntroHeaderStars";
import EngageIntroHeaderIntersect, {
  engageIntroIntersectAspectWidth,
} from "@/components/icons/active/EngageIntroHeaderIntersect";

/** 与 styles.header.height 一致，供左侧 Intersect 与布局计算 */
const ENGAGE_MODAL_HEADER_H = 45;

const SUBTRACT_D =
  "M0 10C0 4.47715 4.47715 0 10 0H169C160.163 3.70472e-07 153 7.16344 153 16V24C153 29.5228 148.523 34 143 34H10C4.47715 34 0 29.5228 0 24V10Z";

export interface EngageIntroModalProps {
  visible: boolean;
  onClose: () => void;
}

const EngageIntroModal: React.FC<EngageIntroModalProps> = ({
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

  const headerGradientColors: [string, string] = [tc.primary, tc.gradient];
  const headerStarsH = engageIntroHeaderStarsAspectHeight(cardWidth);
  const headerIntersectW = engageIntroIntersectAspectWidth(ENGAGE_MODAL_HEADER_H);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <View
        style={[
          styles.rnRoot,
          Platform.OS === "android" && {
            minWidth: overlayWidth,
            minHeight: overlayHeight,
          },
        ]}
      >
        <Pressable
          style={styles.rnBackdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View style={styles.rnCenterFlex} pointerEvents="box-none">
          <View style={[styles.column, { width: cardWidth }]}>
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
                <View pointerEvents="none" style={styles.headerStarsLayer}>
                  <View pointerEvents="none"
                    style={[
                      styles.headerIntersectSlot,
                      { width: headerIntersectW, height: ENGAGE_MODAL_HEADER_H },
                    ]}
                  >
                    <EngageIntroHeaderIntersect
                      width={headerIntersectW}
                      height={ENGAGE_MODAL_HEADER_H}
                    />
                  </View>
                  <EngageIntroHeaderStars
                    color="rgba(255,255,255,0.92)"
                    width={cardWidth * 0.6}
                    height={headerStarsH}
                  />
                </View>
                <Text style={[styles.title, { color: Colors[theme].btnText }]}>
                  {t("pointBox.engageIntroTitle")}</Text>
              </LinearGradient>
              <View
                style={[
                  styles.body,
                  {
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    backgroundColor: Colors[theme].cardBg1,
                  },
                ]}
              >
                <ScrollView
                  style={{ maxHeight: maxBodyHeight }}
                  contentContainerStyle={styles.bodyScrollContent}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  nestedScrollEnabled
                >
                  <View style={styles.contentCard}>
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
                      <Svg
                        width={149}
                        height={30}
                        style={styles.subtractSvg}
                        viewBox="0 0 169 34"
                      >
                        <Path d={SUBTRACT_D} fill={primary} opacity={0.45} />
                      </Svg>
                      <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
                        {t("pointBox.engageIntroHowLabel")}
                      </Text>
                    </View>
                    <Text
                      style={[styles.descText, { color: Colors[theme].text }]}
                    >
                      {t("pointBox.engageIntroHowBody")}
                    </Text>
                  </View>
                  <View style={[styles.contentCard, styles.contentCardLast]}>
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
                      <Svg
                        width={149}
                        height={30}
                        style={styles.subtractSvg}
                        viewBox="0 0 169 34"
                      >
                        <Path d={SUBTRACT_D} fill={primary} opacity={0.45} />
                      </Svg>
                      <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
                        {t("pointBox.engageIntroRulesLabel")}
                      </Text>
                    </View>
                    <Text
                      style={[styles.descText, { color: Colors[theme].text }]}
                    >
                      {t("pointBox.engageIntroRulesBody")}
                    </Text>
                  </View>
                </ScrollView>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeOutside}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.85}
            >
              <Image
                source={require("@/assets/images/myCenter/close-circle.png")}
                style={styles.closeImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rnRoot: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
  },
  rnBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 0,
  },
  rnCenterFlex: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 1,
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
    elevation: 10,
  },
  header: {
    position: "relative",
    height: ENGAGE_MODAL_HEADER_H,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    zIndex: 2,
  },
  headerStarsLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  headerIntersectSlot: {
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 0,
    overflow: "visible",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    zIndex: 1,
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
    marginBottom: 12,
  },
  contentCardLast: {
    marginBottom: 0,
  },
  introBox: {
    marginBottom: 11,
    minHeight: 34,
    justifyContent: "center",
    position: "relative",
  },
  subtractSvg: {
    position: "absolute",
    left: -12,
    top: -2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 16.25,
    marginLeft: 4,
    marginBottom: 10,
    paddingRight: 48,
    zIndex: 1,
    textAlign: "left",
    writingDirection: "ltr",
  },
  descText: {
    fontSize: 11,
    lineHeight: 17.6,
    color: "#333",
    zIndex: 1,
    textAlign: "left",
    writingDirection: "ltr",
  },
  closeOutside: {
    marginTop: 14,
    alignSelf: "center",
  },
  closeImage: {
    width: 31,
    height: 31,
  },
});

export default EngageIntroModal;
