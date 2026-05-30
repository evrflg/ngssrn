import { PopupModal } from "@/components/home/popup/common/PopupModal";
import { rf } from "@/utils/scaleFont";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import RenderHtml from "react-native-render-html";

export type TopInfoPart = {
  text: string;
  highlight: boolean;
};

export type MineTimeStatus = "active" | "normal" | "disabled" | "empty";

type MineTimeItem = {
  label: string;
  status: MineTimeStatus;
};

interface MineMainPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onMinePress: () => void;
  mineAvailable: boolean;
  mineBtnText: string;
  mainPopupWidth: number;
  mineTimeRows: MineTimeItem[][];
  topInfoParts: TopInfoPart[];
  ruleLines: string[];
  introductionHtml: string;
  ruleDescHtml: string;
  mineAmountLine: string;
}

const RULE_HEIGHT = 170;

export function MineMainPopup({
  isVisible,
  onClose,
  onMinePress,
  mineAvailable,
  mineBtnText,
  mainPopupWidth,
  mineTimeRows,
  topInfoParts,
  ruleLines,
  introductionHtml,
  ruleDescHtml,
  mineAmountLine,
}: MineMainPopupProps) {
  const { width } = useWindowDimensions();
  const htmlInnerWidth = Math.max(mainPopupWidth - 60, 0);
  const { contentWidth, contentHeight, infoBgHeight, mineBtnWidth } =
    useMemo(() => {
      const contentWidth = Math.min(400, width * 0.9);
      const contentHeight = Math.round(contentWidth * 1.7);
      const infoBgHeight = Math.round(contentWidth * 0.65);
      const mineBtnWidth = Math.round(contentWidth * 0.75);
      return { contentWidth, contentHeight, infoBgHeight, mineBtnWidth };
    }, [width]);
  const timeListWidth = mainPopupWidth * 0.8;

  const introSource = useMemo(
    () => ({ html: introductionHtml.trim() }),
    [introductionHtml],
  );

  const ruleSource = useMemo(
    () => ({ html: ruleDescHtml.trim() }),
    [ruleDescHtml],
  );

  const timeChips = useMemo((): MineTimeItem[] => {
    const chips: MineTimeItem[] = [];
    for (const row of mineTimeRows) {
      for (const cell of row) {
        if (cell?.label?.trim()) {
          chips.push({
            label: cell.label,
            status: cell.status ?? "empty",
          });
        }
      }
    }
    return chips;
  }, [mineTimeRows]);

  const showApiRule = ruleSource.html.length > 0;

  return (
    <PopupModal
      id="mysterious-mine-main-popup"
      isVisible={isVisible}
      onClose={onClose}
      backdropOpacity={0.7}
      useNativeDriver={false}
      style={styles.modal}
    >
      <ImageBackground
        source={require("@/assets/images/active/mysteriousMine/mysteriousMineBg.png")}
        style={[
          styles.mainPopupWrap,
          {
            width: contentWidth,
            height: contentHeight,
          },
        ]}
        imageStyle={{ borderRadius: 12 }}
      >
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={34} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={mineAvailable ? 0.9 : 1}
          disabled={!mineAvailable}
          onPress={onMinePress}
          style={{
            zIndex: 2,
            marginBottom: Math.round(-infoBgHeight / 9),
          }}
        >
          <ImageBackground
            source={
              mineAvailable
                ? require("@/assets/images/active/mysteriousMine/mineAbleBtn.png")
                : require("@/assets/images/active/mysteriousMine/mineDisableBtn.png")
            }
            style={[styles.mineBtn, { width: mineBtnWidth }]}
            resizeMode="stretch"
          >
            <Text style={styles.mineBtnText}>{mineBtnText}</Text>
          </ImageBackground>
        </TouchableOpacity>
        <ImageBackground
          source={require("@/assets/images/active/mysteriousMine/infoBg.png")}
          style={[styles.infoBg, { width: contentWidth, height: infoBgHeight }]}
          resizeMode="stretch"
        >
          <View style={styles.topMineInfoText}>
            {introSource.html.length > 0 ? (
              <View style={styles.tipsHtmlWrap}>
                <RenderHtml
                  contentWidth={htmlInnerWidth}
                  source={introSource}
                  baseStyle={styles.introHtmlBase}
                />
              </View>
            ) : (
              <Text style={styles.topMineInfoTextValue}>
                {topInfoParts.map((part, idx) => {
                  if (!part.text) return null;
                  return (
                    <Text
                      key={`top-info-part-${idx}`}
                      style={
                        part.highlight
                          ? [
                              styles.topMineInfoHighlight,
                              styles.topMineInfoEmphasis,
                            ]
                          : undefined
                      }
                    >
                      {part.text}
                    </Text>
                  );
                })}
              </Text>
            )}

            <View
              style={[
                styles.bottomMineTime,
                {
                  width: timeListWidth,
                },
              ]}
            >
              {timeChips.map((item, idx) => {
                const expired = item.status === "disabled";
                return (
                  <Text
                    className="leading-none"
                    key={`mine-time-chip-${idx}-${item.label}`}
                    style={[
                      styles.timeChipText,
                      expired
                        ? styles.timeChipTextExpired
                        : styles.timeChipTextLive,
                    ]}
                  >
                    {item.label}
                  </Text>
                );
              })}
            </View>
          </View>
        </ImageBackground>
        <View
          style={[
            styles.ruleContent,
            {
              height: RULE_HEIGHT,
            },
          ]}
        >
          <ScrollView
            style={styles.ruleScroll}
            contentContainerStyle={styles.ruleScrollContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {showApiRule ? (
              <>
                <Text style={styles.rulePlain}>{mineAmountLine}</Text>
                <RenderHtml
                  contentWidth={htmlInnerWidth}
                  source={ruleSource}
                  baseStyle={styles.ruleHtmlBase}
                  tagsStyles={{
                    span: { color: "#cccccc" },
                  }}
                />
              </>
            ) : (
              ruleLines.map((line, idx) => (
                <Text key={`mine-rule-line-${idx}`} style={styles.ruleLineText}>
                  {line}
                </Text>
              ))
            )}
          </ScrollView>
        </View>
      </ImageBackground>
    </PopupModal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  mainPopupWrap: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  closeBtn: {
    position: "absolute",
    right: 8,
    top: 8,
    zIndex: 5,
  },
  infoBg: {
    alignItems: "center",
    justifyContent: "center",
  },
  mineBtn: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  mineBtnText: {
    color: "#FFFFFF",
    fontSize: rf(14),
    fontWeight: "600",
    textAlign: "center",
    includeFontPadding: false,
    bottom: 3,
  },
  topMineInfoText: {
    justifyContent: "center",
    alignItems: "center",
  },
  topMineInfoTextValue: {
    color: "#ffa500",
    fontSize: rf(12),
    textAlign: "center",
    lineHeight: 14,
    fontWeight: "600",
  },
  topMineInfoHighlight: {
    fontSize: rf(12),
    lineHeight: 14,
    fontWeight: "600",
  },
  topMineInfoEmphasis: {
    color: "#ffffff",
    fontWeight: "700",
  },
  bottomMineTime: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    padding: 10,
    backgroundColor: "#1b274c",
    borderRadius: 10,
    overflow: "hidden",
  },
  timeChipText: {
    fontSize: rf(13),
    fontWeight: "400",
    textAlign: "center",
    includeFontPadding: false,
  },
  timeChipTextLive: {
    color: "#FFFFFF",
  },
  timeChipTextExpired: {
    color: "#8e8b8b",
  },
  ruleLineText: {
    color: "#cccccc",
    fontSize: rf(12),
    lineHeight: 18,
    marginBottom: 3,
  },
  tipsHtmlWrap: {
    width: "100%",
    paddingHorizontal: 30,
    paddingVertical: 5,
  },
  introHtmlBase: {
    fontSize: rf(12),
    color: "#ffa500",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },
  ruleContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    minHeight: 80,
  },
  ruleScroll: {
    minHeight: 80,
  },
  ruleScrollContent: {
    paddingBottom: 12,
  },
  rulePlain: {
    fontSize: rf(12),
    color: "#cccccc",
    marginBottom: 3,
    lineHeight: 18,
  },
  ruleHtmlBase: {
    fontSize: rf(12),
    color: "#cccccc",
    lineHeight: 18,
    textAlign: "left",
  },
});
