import { useMemo } from "react";
import { useTypeContentContext } from "../typeContent/TypeContentContext";

interface UsePaginationOptions {
  activePublicityId?: string;
}

export function usePagination({
  activePublicityId
}: UsePaginationOptions) {
  const { publicities } = useTypeContentContext();
  const publicitiesLength = publicities.length;

  // 分页组件自己计算当前索引，外层不再额外传 currentIndex
  const currentIndex = useMemo(
    () => publicities.findIndex((item) => item.id === activePublicityId),
    [activePublicityId, publicities],
  );

  return {
    currentIndex,
    publicitiesLength,
  };
}
