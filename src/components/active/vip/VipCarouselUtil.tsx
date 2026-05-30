import type { DegreeInfo, VipItem } from "./Carouse";

export function buildVipCarouselItems(
  vipList: unknown,
  degreeInfo: DegreeInfo | null | undefined,
): VipItem[] {
  if (
    !degreeInfo ||
    !vipList ||
    !Array.isArray(vipList) ||
    vipList.length === 0
  ) {
    return [];
  }
  return (vipList as VipItem[])
    .map((item) => {
      let isReached = false;
      if (
        item.type === 1 &&
        degreeInfo.curDegreeDepositMoney >= item.depositMoney
      ) {
        isReached = true;
      } else if (
        item.type === 2 &&
        degreeInfo.curDegreeBetNum >= item.betNum
      ) {
        isReached = true;
      }
      return { ...item, isReached };
    })
    .sort((a, b) => a.level - b.level);
}

export function getVipCarouselIndexForLevel(
  vipData: VipItem[],
  degreeInfo: DegreeInfo | null | undefined,
): number {
  if (!degreeInfo || vipData.length === 0) return 0;
  const targetLevel = Math.min(
    vipData.length - 1,
    degreeInfo.newDegreeLevel ?? vipData.length - 1,
  );
  const index = vipData.findIndex((item) => item.level === targetLevel);
  return index >= 0 ? index : 0;
}
