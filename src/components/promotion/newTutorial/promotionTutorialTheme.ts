import type { ImageSourcePropType } from "react-native";
import type { ThemeType } from "@/hooks/theme/ThemeProvider";

export type PromotionTutorialPalette = {
  pageText: string;
  topBg: ImageSourcePropType;
  border: string;
  areaBoxFillColors: string[];
  areaBoxFillLocations?: number[];
  areaBoxFillStart: { x: number; y: number };
  areaBoxFillEnd: { x: number; y: number };
  areaInnerBg: string;
  boxBg: string;
  exampleBorder: string;
  exampleGold: [string, string];
  exampleTopFillColors: string[];
  exampleTopFillStart: { x: number; y: number };
  exampleTopFillEnd: { x: number; y: number };
  exampleTopFillLocations?: number[];
  exampleInnerBg: string;
  itemBoxInnerBg: string;
  titleTextOnBanner: string;
  arrowPillText: string;
  arrowPillBorder: string;
  arrowPillGradient: [string, string];
  lineColor: string;
  lineShadow: string;
  tipsTextsBg: string;
  greyMuted: string;
  tickG1: string;
  tickG2: string;
  tickInner: string;
  peopleG1: string;
  peopleG2: string;
  nameDark: string;
  info2Bg: string;
  info2Text: string;
};

export function getPromotionTutorialPalette(
  theme: ThemeType,
): PromotionTutorialPalette {
  if (theme === "greenBlack") {
    return {
      pageText: "#fff",
      topBg: require("@/assets/images/promotion/tutorial/green.webp"),
      border: "#75EB92",
      areaBoxFillColors: ["rgba(169, 231, 130, 0.15)", "#292C2B"],
      areaBoxFillStart: { x: 0.5, y: 0 },
      areaBoxFillEnd: { x: 0.5, y: 1 },
      areaInnerBg: "#292C2B",
      boxBg: "#292C2B",
      exampleBorder: "#FFF0BA",
      exampleGold: ["#DBA662", "#ECCD8D"],
      exampleTopFillColors: ["#ECCD8D", "#DBA662"],
      exampleTopFillStart: { x: 0.5, y: 0 },
      exampleTopFillEnd: { x: 0.5, y: 1 },
      exampleInnerBg: "#292C2B",
      itemBoxInnerBg: "#292C2B",
      titleTextOnBanner: "#292C2B",
      arrowPillText: "#fff",
      arrowPillBorder: "#fff0ba",
      arrowPillGradient: ["#ffd900", "#f48d16"],
      lineColor: "#E8C060",
      lineShadow: "#FFD700",
      tipsTextsBg: "rgba(169, 231, 130, 0.1)",
      greyMuted: "#ADB7BA",
      tickG1: "#75EB92",
      tickG2: "#A9E782",
      tickInner: "#292C2B",
      peopleG1: "#75EB92",
      peopleG2: "#A9E782",
      nameDark: "#292c2b",
      info2Bg: "#eed8a9",
      info2Text: "#af6d18",
    };
  }
  if (theme === "blueWhite") {
    return {
      pageText: "#292C2B",
      topBg: require("@/assets/images/promotion/tutorial/blue.webp"),
      border: "#4781FF",
      areaBoxFillColors: ["rgba(71, 181, 255, 0.15)", "#ffffff"],
      areaBoxFillStart: { x: 0.5, y: 0 },
      areaBoxFillEnd: { x: 0.5, y: 1 },
      areaInnerBg: "#fff",
      boxBg: "#fff",
      exampleBorder: "#FFF0BA",
      exampleGold: ["#DBA662", "#ECCD8D"],
      exampleTopFillColors: ["#ECCD8D", "#DBA662"],
      exampleTopFillStart: { x: 0.5, y: 0 },
      exampleTopFillEnd: { x: 0.5, y: 1 },
      exampleInnerBg: "#fff",
      itemBoxInnerBg: "#fff",
      titleTextOnBanner: "#fff",
      arrowPillText: "#292C2B",
      arrowPillBorder: "#fff0ba",
      arrowPillGradient: ["#ffd900", "#f48d16"],
      lineColor: "#E8C060",
      lineShadow: "#FFD700",
      tipsTextsBg: "rgba(71, 181, 255, 0.1)",
      greyMuted: "#888888",
      tickG1: "#4781FF",
      tickG2: "#47B5FF",
      tickInner: "#fff",
      peopleG1: "#4781FF",
      peopleG2: "#47B5FF",
      nameDark: "#292c2b",
      info2Bg: "#eed8a9",
      info2Text: "#af6d18",
    };
  }
  return {
    pageText: "#292C2B",
    topBg: require("@/assets/images/promotion/tutorial/orange.webp"),
    border: "#F48D16",
    areaBoxFillColors: ["rgba(255, 217, 0, 0.15)", "#ffffff"],
    areaBoxFillStart: { x: 0.5, y: 0 },
    areaBoxFillEnd: { x: 0.5, y: 1 },
    areaInnerBg: "#fff",
    boxBg: "#fff",
    exampleBorder: "#FFF0BA",
    exampleGold: ["#DBA662", "#ECCD8D"],
    exampleTopFillColors: ["#ECCD8D", "#DBA662"],
    exampleTopFillStart: { x: 0.5, y: 0 },
    exampleTopFillEnd: { x: 0.5, y: 1 },
    exampleInnerBg: "#fff",
    itemBoxInnerBg: "#fff",
    titleTextOnBanner: "#fff",
    arrowPillText: "#292C2B",
    arrowPillBorder: "#fff0ba",
    arrowPillGradient: ["#ffd900", "#f48d16"],
    lineColor: "#E8C060",
    lineShadow: "#FFD700",
    tipsTextsBg: "rgba(244, 141, 22, 0.1)",
    greyMuted: "#888888",
    tickG1: "#F48D16",
    tickG2: "#FFD900",
    tickInner: "#fff",
    peopleG1: "#F48D16",
    peopleG2: "#FFD900",
    nameDark: "#292c2b",
    info2Bg: "#eed8a9",
    info2Text: "#af6d18",
  };
}

export const PT_IMG = {
  lock1: require("@/assets/images/promotion/tutorial/lock_1.webp"),
  lock2: require("@/assets/images/promotion/tutorial/lock_2.webp"),
  bet: require("@/assets/images/promotion/tutorial/bet.webp"),
  purse: require("@/assets/images/promotion/tutorial/purse.webp"),
  withdrawal: require("@/assets/images/promotion/tutorial/withdrawal.webp"),
  wallet: require("@/assets/images/promotion/tutorial/wallet.webp"),
  figure1: require("@/assets/images/promotion/tutorial/figure_1.webp"),
  figure2: require("@/assets/images/promotion/tutorial/figure_2.webp"),
  figure3: require("@/assets/images/promotion/tutorial/figure_3.webp"),
  figure4: require("@/assets/images/promotion/tutorial/figure_4.webp"),
  figure5: require("@/assets/images/promotion/tutorial/figure_5.webp"),
  figure6: require("@/assets/images/promotion/tutorial/figure_6.webp"),
  abcd: require("@/assets/images/promotion/tutorial/abcd.webp"),
  vip6: require("@/assets/images/promotion/tutorial/vip6.webp"),
  vip2: require("@/assets/images/promotion/tutorial/vip2.webp"),
  vip1: require("@/assets/images/promotion/tutorial/vip1.webp"),
  vip0: require("@/assets/images/promotion/tutorial/vip0.webp"),
  arrowLeft: require("@/assets/images/promotion/tutorial/arrow_left.webp"),
  arrowRight: require("@/assets/images/promotion/tutorial/arrow_right.webp"),
  union: require("@/assets/images/promotion/tutorial/union.webp"),
  leftLine: require("@/assets/images/promotion/tutorial/left-line.webp"),
};
