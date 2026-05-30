import { openRedPacket, openTurntable } from "@/api";
import { reedType, reedUrl } from "@/constants/reedData";
import { router } from "expo-router";

type ToastLike = { error: (msg: string) => void };

export async function openLuckyWheel(toast: ToastLike, t: (key: string) => string) {
  const resp: any = await openTurntable();
  if (resp?.data?.code === 0) {
    router.navigate({ pathname: reedUrl, params: { toType: reedType.luckyWheel } });
    return;
  }
  toast.error(resp?.data?.msg || t("common.invalidSignature"));
}

export async function openRedPacketRain(toast: ToastLike, t: (key: string) => string) {
  const resp: any = await openRedPacket();
  if (resp?.data?.code === 0) {
    router.navigate({ pathname: reedUrl, params: { toType: reedType.redpackeTrain } });
    return;
  }
  toast.error(resp?.data?.msg || t("common.invalidSignature"));
}
