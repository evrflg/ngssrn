import { ServiceFeeParams, WithdrawTab } from "./types";
import { getDefaultWithdrawIcon, typeToTabId, withdrawTypeMap } from "./constants";

// ─────────────────────────────────────────────
// 提现通道组装
// ─────────────────────────────────────────────

/** 过滤已禁用（status ≠ 0）条目，按 sortNo 升序 */
export function filterAndSortWithdrawRows(rows: any[]): any[] {
  const enabled = rows.filter(
    (w) => w != null && (w.status === undefined || w.status === null || Number(w.status) === 0),
  );
  return [...enabled].sort((a, b) => {
    const sa = a.sortNo != null ? Number(a.sortNo) : 0;
    const sb = b.sortNo != null ? Number(b.sortNo) : 0;
    return sa - sb;
  });
}

/** 解析 orderLimitMoneyConfig 并按用户层级匹配 min/max */
export function parseOrderLimitMoneyConfig(
  configString: string | undefined,
  userRankId: string | number | undefined,
): { minMoney: number; maxMoney: number } {
  if (!configString || userRankId == null || userRankId === "") {
    return { minMoney: 0, maxMoney: 0 };
  }
  const configArray = parseOrderLimitMoneyConfigList(configString);
  const matched = configArray.find(
    (item: any) => String(item?.rankId ?? "") === String(userRankId),
  );
  if (!matched) return { minMoney: 0, maxMoney: 0 };
  return {
    minMoney: Number(matched.minMoney) || 0,
    maxMoney: Number(matched.maxMoney) || 0,
  };
}

/** 解析 orderLimitMoneyConfig JSON 字段，容错 */
export function parseOrderLimitMoneyConfigList(orderLimitMoneyConfig: unknown): any[] {
  if (orderLimitMoneyConfig == null || orderLimitMoneyConfig === "") return [];
  try {
    const parsed =
      typeof orderLimitMoneyConfig === "string"
        ? JSON.parse(orderLimitMoneyConfig)
        : orderLimitMoneyConfig;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** 原始接口行 → WithdrawTab */
export function mapWithdrawRowToTab(withdraw: any): WithdrawTab {
  const rawType = withdraw.type;
  const numType =
    typeof rawType === "string" && String(rawType).trim() !== "" ? Number(rawType) : rawType;
  const semanticId = typeToTabId[numType as keyof typeof typeToTabId] || `type-${rawType}`;
  return {
    id: semanticId,
    tabId: withdraw.id != null ? String(withdraw.id) : undefined,
    name: withdraw.name || `Type ${rawType}`,
    icon: withdraw.iconUrl ? { uri: withdraw.iconUrl } : getDefaultWithdrawIcon(numType),
    isHot: withdraw.badge === "hot" || numType === 2,
    badge: withdraw.badge,
    payBadge: withdraw.payBadge,
    payCode: withdraw.payCode,
    tunnelCode: withdraw.tunnelCode,
    tunnels: withdraw.tunnels,
  };
}

/**
 * 接口数据 + 登录态 + rankId 齐备后组装：
 * 有层级配置的只保留当前层级，并挂上 rankWithdrawLimit
 */
export function assembleWithdrawTabs(
  sortedRows: any[],
  isLogin: boolean,
  rankId: string | number | undefined,
): WithdrawTab[] {
  const out: WithdrawTab[] = [];
  for (const withdraw of sortedRows) {
    const tierList = parseOrderLimitMoneyConfigList(withdraw.orderLimitMoneyConfig);
    const baseTab = mapWithdrawRowToTab(withdraw);
    if (tierList.length === 0) {
      out.push(baseTab);
      continue;
    }
    if (!isLogin || rankId == null || rankId === "") continue;
    const matched = tierList.find((item: any) => String(item?.rankId ?? "") === String(rankId));
    if (!matched) continue;
    out.push({
      ...baseTab,
      rankWithdrawLimit: {
        minDrawMoney: Number(matched.minMoney) || 0,
        maxDrawMoney: Number(matched.maxMoney) || 0,
      },
    });
  }
  return out;
}

/** 判断是否为互通钱包提现类型（type 5 或 6） */
export function isThirdInterConnectWithdrawType(n: unknown): n is number {
  const num = typeof n === "string" && n.trim() !== "" ? Number(n) : n;
  return num === 5 || num === 6;
}

// ─────────────────────────────────────────────
// 手续费（纯函数，无副作用）
// ─────────────────────────────────────────────

/**
 * 根据提现配置计算手续费字符串。
 * 返回如 "0" / "12.50" / "5" 等字符串，调用方直接展示。
 */
export function calculateServiceFee({ withdrawAmount, configData }: ServiceFeeParams): string {
  if (!configData) return "0";
  const { strategy, curWnum } = configData;
  if (!strategy) return "0";

  if ((curWnum ?? 0) < (strategy.drawNum ?? 0)) {
    return "0";
  }

  if (!withdrawAmount) return "0";

  if (strategy.feeType === 2) {
    let money = ((Number(withdrawAmount) * Number(strategy.feeValue)) / 100).toFixed(2);
    if (strategy.upperLimit && money > strategy.upperLimit) {
      money = String(strategy.upperLimit);
    } else if (strategy.lowerLimit && money < strategy.lowerLimit) {
      money = String(strategy.lowerLimit);
    }
    return money;
  }

  return String(strategy.feeValue ?? "0");
}

// ─────────────────────────────────────────────
// 充值权限过滤
// ─────────────────────────────────────────────

/**
 * 根据会员等级/分组判断是否有权限查看该充值通道。
 * degreeIds / groupIds 为逗号分隔的 id 字符串，空字符串表示不限制。
 */
export function checkUserPermission(
  degreeIds: string,
  groupIds: string,
  userDegreeId: string | number | undefined,
  userGroupId: string | number | undefined,
): boolean {
  if (!degreeIds && !groupIds) return true;

  const degreeIdStr = userDegreeId != null ? String(userDegreeId) : "";
  const groupIdStr = userGroupId != null ? String(userGroupId) : "";

  if (degreeIds && groupIds) {
    return degreeIds.includes(degreeIdStr) && groupIds.includes(groupIdStr);
  }
  if (degreeIds) {
    return degreeIds.includes(degreeIdStr);
  }
  return groupIds.includes(groupIdStr);
}
