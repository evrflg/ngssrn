import { t } from "i18next";

interface ReturnItem {
  value: string;
  valueColor?: string;
}
const STATUS_COLOR = {
  0: "#49ce9b", // on
  1: "#ea4e3d", // off
};

export function getAmountColor(amount: number, zeroColor = "#aeb0c6"): string {
  if (amount > 0) return "#49ce9b";
  if (amount < 0) return "#ea4e3d";
  return zeroColor;
}
export function defineAccountStatus(code: number): ReturnItem {
  const jsonData: Record<number, ReturnItem> = {
    0: { value: t("status.enabled"), valueColor: STATUS_COLOR[0] },
    1: { value: t("status.disabled"), valueColor: STATUS_COLOR[1] },
  };
  return jsonData[code] || { value: "-" };
}
export function defineOnlineStatus(code: number): ReturnItem {
  const jsonData: Record<number, ReturnItem> = {
    0: { value: t("status.online"), valueColor: STATUS_COLOR[0] },
    1: { value: t("status.offline"), valueColor: STATUS_COLOR[1] },
  };
  return jsonData[code] || { value: "-" };
}
