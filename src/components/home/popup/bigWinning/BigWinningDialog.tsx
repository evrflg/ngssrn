// 大中奖弹窗：
// - 不参与首页弹窗队列，纯独立弹窗。
// - 通过 showBigWinning(info) 在任意地方触发（例如 SSE game 事件）。
// - 打开条件：当前在 /home，且收到服务端推送的大中奖数据。

import CommonModal, { CommonModalRef } from "@/components/common/modal/CommonModal";
import { useToast } from "@/components/common/toast";
import { goToThreeGame } from "@/components/home/utils/util";
import { BaseButton } from "@/components/ui/BaseButton";
import { Colors } from "@/constants/Colors";
import { useCommon } from "@/hooks/CommonProvider";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { MAX_WIDTH } from "@/hooks/useMaxWidth";
import { DEFAULT_LANGUAGE } from "@/lang/language";
import { hideBigWinning } from "@/store/bigWinning/bigWinningSlice";
import { AppDispatch, RootState } from "@/store/store";
import { formatMoney } from "@/utils/utils";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CloseButton } from "../common/CloseButton";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("screen");
const CARD_W = Math.min(SCREEN_W, MAX_WIDTH) * 0.88;

export const BigWinningDialog: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { language } = useCommon();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const commonModalRef = useRef<CommonModalRef>(null);
  const visible = useSelector((state: RootState) => state.bigWinning.visible);
  const info = useSelector((state: RootState) => state.bigWinning.info);
  const userProfile: any = useSelector((state: RootState) => state.user.userProfile);
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);

  useEffect(() => {
    if (visible) {
      commonModalRef.current?.toggleModal();
    }
  }, [visible]);

  const gameName = useMemo(() => {
    if (!info) return "";
    if (info.customName) return info.customName;
    try {
      const parsed = JSON.parse(info.gameName);
      const key = language;
      for (const lang in parsed) {
        if (lang.toLowerCase().includes(key.toLowerCase())) return parsed[lang];
      }
      return parsed[DEFAULT_LANGUAGE];
    } catch {
      return info.gameName;
    }
  }, [info, language]);

  const amountText = useMemo(() => {
    if (!info) return "";
    const currency = userProfile?.member?.currency ?? "";
    return `${currency} ${formatMoney(info.amount)}`;
  }, [info, userProfile?.member?.currency]);

  const handleClose = () => {
    dispatch(hideBigWinning());
  };

  const handleTry = () => {
    dispatch(hideBigWinning());
    const cash = Number(userProfile?.money ?? 0);
    const bonus = Number(userProfile?.bonus ?? 0);
    if (!cash && !bonus) {
      router.push("/wallet/recharge");
      return;
    }
    if (!info) return;
    goToThreeGame(
      String(info.gameId),
      {
        id: String(info.gameId),
        name: gameName,
        gameType: info.gameType,
        icon: info.icon,
      },
      dispatch,
      userInfo,
      toast,
      t,
    );
  };

  if (!info) return null;

  return (
    <CommonModal
      ref={commonModalRef}
      onClose={handleClose}
      contentStyle={{ justifyContent: "center" }}
      extendBottomSafeArea={false}
    >
      <View style={[styles.card, { width: CARD_W, backgroundColor: Colors[theme].cardBg1 }]}>
        <Text style={[styles.title, { color: Colors[theme].text }]}>
          🎉 <Text style={styles.highlight}>{t("popup.big-winning.congratulations")}</Text> 🎉
        </Text>

        <Text style={[styles.desc, { color: Colors[theme].text }]}>
          {t("popup.big-winning.des", {
            username: info.username,
            gameName,
            amount: amountText,
          })}
        </Text>

        <BaseButton
          i18nKey="popup.big-winning.try"
          onPress={handleTry}
          gradient
          roundedFull
          style={styles.button}
        />
      </View>
      <CloseButton onClose={handleClose} />
    </CommonModal>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  highlight: {
    fontWeight: "700",
  },
  desc: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "left",
    marginBottom: 20,
  },
  button: {
    marginTop: 4,
  },
});
