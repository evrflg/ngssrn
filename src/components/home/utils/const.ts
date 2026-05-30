import { screen } from "@/utils/screen";
export const languageImgMap: any = {
  'BR': require("@/assets/images/country/square/br.png"),
  'ES': require("@/assets/images/country/square/es.png"),
  'VI': require("@/assets/images/country/square/vi.png"),
  'TH': require("@/assets/images/country/square/th.png"),
  'MY': require("@/assets/images/country/square/my.png"),
  'ID': require("@/assets/images/country/square/id.png"),
  'IN': require("@/assets/images/country/square/in.png"),
  'JP': require("@/assets/images/country/square/jp.png"),
  'EN': require("@/assets/images/country/square/en.png"),
  'CN': require("@/assets/images/country/square/cn.png"),
  'PH': require("@/assets/images/country/square/ph.png"),
  'SA': require("@/assets/images/country/square/sa.png"),
  'DE': require("@/assets/images/country/square/de.png"),
  'FR': require("@/assets/images/country/square/fr.png"),
  'IT': require("@/assets/images/country/square/it.png"),
  'KO': require("@/assets/images/country/square/ko.png"),
  'NL': require("@/assets/images/country/square/nl.png"),
  'RU': require("@/assets/images/country/square/ru.png"),
  'TW': require("@/assets/images/country/square/tw.png"),

}

export const languagePhoneNumberMap: any = {
  'BR': '+55',
  'ES': '+52',
  'VI': '+84',
  'TH': '+66',
  'MY': '+60',
  'ID': '+62',
  'IN': '+91',
  'JP': '+81',
  'EN': '+1',
  'CN': '+86',
  'PH': '+63',
  'SA': '+966',
  'DE': '+49',
  'FR': '+33',
  'IT': '+39',
  'KO': '+82',
  'NL': '+31',
  'RU': '+7',
  'TW': '+886',
}

export const bonusBg: any = {
  greenBlack: ["#40654a", "#292c2b"],
  orangeWhite: ["#f48d168f", "#fff"],
  blueWhite: ["#ccdcff", "#fff"],
}

export const loginPanelBg: any = {
  greenBlack: ["rgba(117, 235, 146, 0.5)", "rgba(41, 44, 43, 0.5)"],
  orangeWhite: ["rgba(244, 141, 22, 0.5)", "rgba(235, 236, 243, 0.5)"],
  blueWhite: ["rgba(71, 129, 255, 0.5)", "rgba(235, 236, 243, 0.5)"]
}

export const loginActiveMethodBg: any = {
  greenBlack: ['#75eb92', '#a9e782'],
  orangeWhite: ['#f48d16', '#ffd900'],
  blueWhite: ['#598eff', '#64c1ff'],
}

/** 二级游戏列表：行高 = 行宽 × 该值（RN aspectRatio = width/height） */
export const SECONDARY_GAME_ROW_HEIGHT_RATIO = 0.48;

//屏幕宽度大于等于480时，字体大小为12，否则为10
export const fontTextSize = screen.get("window").width >= 400 ? 12 : 10;
export const fontTitleSize = screen.get("window").width >= 400 ? 14 : 12;