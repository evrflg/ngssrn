import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { rf } from "@/utils/scaleFont";
import { formatMoney } from "@/utils/utils";
import React, { useId, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const GRAD_TOP = "#FFD076";
const GRAD_BOTTOM = "#DCA21B";
const GRAD_STROKE = "#BF9126";

function BonusAmountText({ amount }: { amount: string }) {
  const fontSize = rf(22);
  const svgH = Math.ceil(fontSize * 1.2);
  const approxW = Math.ceil(Math.max(amount.length * fontSize * 0.58 + 8, fontSize * 2));
  const gradId = useId().replace(/[^a-zA-Z0-9]/g, "_");
  const textY = fontSize * 0.92;

  return (
    <View style={{ marginLeft: 2 }}>
      <Svg width={approxW} height={svgH}>
        <Defs>
          <SvgLinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={GRAD_TOP} />
            <Stop offset="1" stopColor={GRAD_BOTTOM} />
          </SvgLinearGradient>
        </Defs>
        <SvgText
          fill={`url(#${gradId})`}
          stroke={GRAD_STROKE}
          strokeWidth={1}
          fontSize={fontSize}
          fontWeight="700"
          x={1}
          y={textY}
        >
          {amount}
        </SvgText>
      </Svg>
    </View>
  );
}

interface SubmitButtonProps {
  isLoading: boolean;
  amount: string;
  giftMoney: number;
  walletType?: number;
  joinDepositGift: boolean;
  showBonus: boolean;
  onPress: () => void;
}

export const SubmitButton = React.memo(
  ({ isLoading, amount, giftMoney, walletType = 0, joinDepositGift, showBonus, onPress }: SubmitButtonProps) => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const buttonBg = useMemo(() => {
      if (theme === "greenBlack") return require("@/assets/images/finance/green_button.png");
      if (theme === "blueWhite") return require("@/assets/images/finance/blue_button.png");
      return require("@/assets/images/finance/orange_button.png");
    }, [theme]);

    const starlightBg = require("@/assets/images/finance/starlight2.png");

    const labelColor = theme === "greenBlack" ? Colors[theme].btnText : "#fff";
    const loadingColor = theme === "greenBlack" ? Colors[theme].btnText : "#fff";
    const disabledDim = isLoading || !amount ? { opacity: 0.5 } : undefined;

    return (
      <View style={styles.wrap}>
        {showBonus && (
          <View style={styles.bonusBadge} pointerEvents="none">
            <View style={styles.bonusBadgeBg}>
              <Image source={starlightBg} style={styles.bonusBadgeBgImage} resizeMode="stretch" />
              <Text style={styles.bonusBadgeText} numberOfLines={1}>
                +{formatMoney(giftMoney)}
                {walletType === 1 && (
                  <Text style={styles.bonusPointsLabel}> {t("wallet.recharge.bonusPoints")}</Text>
                )}
              </Text>
            </View>
          </View>
        )}
        <View style={[styles.outer, disabledDim]}>
          <TouchableOpacity
            activeOpacity={0.88}
            disabled={isLoading || !amount}
            onPress={onPress}
            style={styles.touchable}
          >
            <ImageBackground
              source={buttonBg}
              style={styles.gradient}
              imageStyle={styles.gradientImage}
              resizeMode="stretch"
            >
              <View style={styles.content}>
                {isLoading ? (
                  <ActivityIndicator color={loadingColor} size="small" />
                ) : showBonus ? (
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: labelColor, fontSize: rf(14) }]}>
                      {t("pageName.recharge")}
                    </Text>
                    <BonusAmountText amount={String(amount)} />
                  </View>
                ) : (
                  <Text style={[styles.label, { color: labelColor, fontSize: rf(16) }]}>
                    {t("pageName.recharge")}
                  </Text>
                )}
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrap: { position: "relative", marginTop: 4, alignSelf: "center", width: 250 },
  outer: { borderRadius: 9999, width: 250 },
  touchable: { borderRadius: 9999, overflow: "hidden", width: "100%" },
  gradient: { width: "100%", height: 60, borderRadius: 9999, overflow: "hidden" },
  gradientImage: { borderRadius: 9999 },
  content: {
    flex: 1,
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  label: { fontWeight: "700",lineHeight: 22 },
  bonusBadge: {
    position: "absolute",
    zIndex: 2,
    top: -2,
    left: "50%",
    marginLeft: 55,
  },
  bonusBadgeBg: {
    position: "relative",
    alignSelf: "flex-start",
    minWidth: 44,
    paddingVertical: 1,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 10,
  },
  bonusBadgeBgImage: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  bonusBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600", lineHeight: 13.2 },
  bonusPointsLabel: { fontSize: 10 },
});
