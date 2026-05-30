import { useToast } from "@/components/common/toast";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { RootState } from "@/store/store";
import { rf } from "@/utils/scaleFont";
import { router, type Href } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import BetIcon from "./icons/Bet";
import DepositIcon from "./icons/Deposit";
import TradeIcon from "./icons/Trade";
import VipIcon from "./icons/Vip";
import WithdrawIcon from "./icons/Withdraw";

/** 我的 type4：充值 / 提现 / VIP / 交易 / 投注 快捷入口 */
export default function ShortcutGrid() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const toast = useToast();
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);

  const list: { icon: typeof DepositIcon; label: string; path: Href }[] = [
    { icon: DepositIcon, label: t("pageName.recharge"), path: "/wallet/recharge" },
    { icon: WithdrawIcon, label: t("pageName.withdraw"), path: "/wallet/withdraw" },
    { icon: VipIcon, label: "VIP", path: "/active/vipPage" },
    { icon: TradeIcon, label: t("pageName.trade"), path: "/my/tranctionsRecord" },
    { icon: BetIcon, label: t("active.vip.xiazhu"), path: "/my/betRecord" },
  ];

  const goPage = (path: Href) => {
    if (path === "/wallet/recharge" || path === "/wallet/withdraw") {
      if (userInfo?.member?.type && userInfo.member.type <= 2) {
        router.push(path);
      } else {
        toast.warn(t("tryAccount.trialAccountWarning"));
      }
    } else {
      router.push(path);
    }
  };

  return (
    <View style={styles.listBox} className={`bg-${theme}-btnText`}>
      {list.map((item, i) => (
        <TouchableOpacity key={i} style={styles.list} onPress={() => goPage(item.path)}>
          <item.icon width={40} height={40} />
          <Text
            className={`text-${theme}-darkColor`}
            style={[styles.listLabel, { fontSize: rf(12) }]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 14,
  },
  list: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  listLabel: {
    fontSize: 12,
  },
});
