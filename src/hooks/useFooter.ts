import { useBottomNavigation } from "@/hooks/useBottomNavigation";
import { selectBottomNavigationType } from "@/store/user/selfConfig";
import { useMemo } from "react";
import { useSelector } from "react-redux";

export function useFooter() {
  const bottomNav = useBottomNavigation();
  const typeStr = useSelector(selectBottomNavigationType);

  const activeFooterLayout = useMemo(() => {
    const n = parseInt(typeStr || "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [typeStr]);

  const isHigherFooter =
    activeFooterLayout === 1 ||
    activeFooterLayout === 2 ||
    activeFooterLayout === 3;

  return {
    activeFooterLayout,
    isHigherFooter,
    shouldShowFooter: bottomNav.isShow,
    footerHeight: bottomNav.footerHeight,
    tabs: bottomNav.tabs,
    currentPath: bottomNav.currentPath,
    isTabActive: bottomNav.isTabActive,
    onNavigate: bottomNav.onNavigate,
  };
}
