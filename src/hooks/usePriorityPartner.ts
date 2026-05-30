import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  getPartnerListServer,
  getGameListByPartnersServer,
} from "@/api/post/home";

// 与 vue3 useGameProVendorTabs 保持一致的映射关系
const PRIORITY_PARTNER_TO_GAME_TYPE: Record<string, number> = {
  "1": 2, // 电子 (GameType.Electronic = 2)
  "2": 1, // 真人 (GameType.RealPerson = 1)
  "3": 8, // 彩票
  "4": 6, // 棋牌
  "5": 4, // 体育
  "6": 7, // 电竞
  "7": 3, // 捕鱼
};

/** 将平铺游戏列表按 GameArea/GameArea5 的行格式化规则拆分为 rows/gameList/gameList2 */
function toRowFormat(games: any[]) {
  if (games.length > 4) {
    const rowsize = games.length < 8 ? 4 : Math.ceil(games.length / 2);
    const row1 = games.slice(0, rowsize);
    const row2 = games.slice(rowsize);
    const gameList2 = row1.map((g, i) => [g, row2[i]].filter(Boolean));
    return { rows: 2, gameList: games, gameList2 };
  }
  return { rows: 1, gameList: games };
}

export interface PartnerZone {
  id: string;
  gameZone: string;
  customName: string;
  icon?: string;
  /** 供 GameBlock/GameBlock5 的"更多"跳转使用 */
  _partnerId: number;
  _partnerGameType: number;
  sort: number;
  rows: 1 | 2;
  gameList: any[];
  gameList2?: any[][];
}

/**
 * 读取 cfg_global_switch.tenantGameConfig.priorityPartner 配置，
 * 拉取对应游戏类型的厂商列表及其游戏，返回可直接追加到 GameArea/GameArea5 的
 * zone 数组（与普通 gameList item 同形，key 为 'partner_${id}'）。
 *
 * - priorityPartner 为 '0' 或空时返回 []
 * - 只在首次 gameType 确定后请求一次，切 Tab 回来不重复请求
 */
export function usePriorityPartner(): PartnerZone[] {
  const cfg_global_switch = useSelector(
    (s: RootState) => s.user.cfg_global_switch
  );
  const [partnerZones, setPartnerZones] = useState<PartnerZone[]>([]);
  const loadedGameTypeRef = useRef<number | null>(null);

  const priorityPartner: string | undefined =
    cfg_global_switch?.tenantGameConfig?.priorityPartner;
  const gameType =
    priorityPartner && priorityPartner !== "0"
      ? PRIORITY_PARTNER_TO_GAME_TYPE[priorityPartner]
      : undefined;

  useEffect(() => {
    // config 未就绪、或不配置厂商 tab
    if (!gameType) {
      if (partnerZones.length > 0) setPartnerZones([]);
      loadedGameTypeRef.current = null;
      return;
    }
    // 同一 gameType 已加载过，不重复请求
    if (loadedGameTypeRef.current === gameType) return;

    let alive = true;

    const load = async () => {
      try {
        const partnerRes = await getPartnerListServer({ gameType });
        if (!alive) return;

        const partners: any[] = partnerRes?.data?.data ?? [];
        if (!partners.length) return;

        const ids = partners.map((p: any) => p.id).join(",");
        const gamesRes = await getGameListByPartnersServer({ partnerIds: ids, size: 16 });
        if (!alive) return;

        const gamesData: any[] = gamesRes?.data?.data ?? [];
        const gamesById: Record<number, any[]> = {};
        gamesData.forEach((item: any) => {
          gamesById[item.partnerId] = item.gameList ?? [];
        });

        const zones: PartnerZone[] = partners
          .map((p: any, index: number) => ({
            id: `partner_${p.id}`,
            gameZone: `partner_${p.id}`,
            customName: p.name ?? "",
            icon: p.icon,
            _partnerId: p.id,
            _partnerGameType: gameType,
            sort: 1000 + index,
            ...toRowFormat(gamesById[p.id] ?? []),
          }))
          .filter((z) => z.gameList.length > 0) as PartnerZone[];

        loadedGameTypeRef.current = gameType;
        setPartnerZones(zones);
      } catch {
        // 静默失败，不展示厂商区块
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [gameType]);

  return partnerZones;
}
