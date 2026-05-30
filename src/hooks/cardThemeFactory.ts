type ThemeName = "greenBlack" | "orangeWhite" | "blueWhite";

type ThemePalette<T> = Record<ThemeName, T>;

export const createThemeFactory = <T>(palette: ThemePalette<T>) => {
  return (theme: string): T => {
    if (theme in palette) {
      return palette[theme as ThemeName];
    }
    return palette.greenBlack;
  };
};

export const getSplitLineColor = createThemeFactory<string>({
  greenBlack: "rgba(250, 250, 250, 0.1)",
  orangeWhite: "#e6e8e8",
  blueWhite: "#e6e8e8",
});

export const getType2ThemeTokens = createThemeFactory({
  greenBlack: {
    border: "#3c5c44",
    linearGradient: ["#222527", "#404a3c"] as [string, string],
    depositWithdrawBg: "#314036",
    moneyCardLabel: "#ffffff",
    menuLabel: "#adb7ba",
  },
  orangeWhite: {
    border: "#ffd5a5",
    linearGradient: ["#ffebd0", "#fff"] as [string, string],
    depositWithdrawBg: "rgba(244, 141, 22, 0.1)",
    moneyCardLabel: "#888888",
    menuLabel: "#292c2b",
  },
  blueWhite: {
    border: "#7fbaff",
    linearGradient: ["#ccdafc", "#fff"] as [string, string],
    depositWithdrawBg: "#e3f2ff",
    moneyCardLabel: "#888888",
    menuLabel: "#515151",
  },
});

/** Web profile/type3：color-mix(主題色 18%, transparent) 四角柔光近似 */
const type3CornerTint = {
  greenBlack: "rgba(117, 235, 146, 1)",
  orangeWhite: "rgba(244, 141, 22, 1)",
  blueWhite: "rgba(71, 129, 255, 1)",
} as const;

export const getType3ThemeTokens = createThemeFactory({
  greenBlack: {
    linearGradient: ["#439762", "#175A42"] as [string, string],
    mutedText: "#fff",
    cornerTint: type3CornerTint.greenBlack,
    cornerOrb: {
      /** Vue: ellipse 150px 100px */
      default: { w: 150, h: 100 },
      /** Vue: ellipse 250px 150px */
      footer: { w: 250, h: 150 },
    },
  },
  orangeWhite: {
    linearGradient: ["#fff", "#ffebd0"] as [string, string],
    mutedText: "#888888",
    cornerTint: type3CornerTint.orangeWhite,
    cornerOrb: {
      default: { w: 150, h: 100 },
      footer: { w: 250, h: 150 },
    },
  },
  blueWhite: {
    linearGradient: ["#fff", "#ccdafc"] as [string, string],
    mutedText: "#888888",
    cornerTint: type3CornerTint.blueWhite,
    cornerOrb: {
      default: { w: 150, h: 100 },
      footer: { w: 250, h: 150 },
    },
  },
});

export type MyCenterProfileType = 1 | 2 | 3 | 4;

type Type2Tokens = ReturnType<typeof getType2ThemeTokens>;
type Type3Tokens = ReturnType<typeof getType3ThemeTokens>;
type Type4Tokens = ReturnType<typeof getType4ThemeTokens>;

export type BuildMyCenterCardThemeResult =
  | { profileType: 1 }
  | { profileType: 2; tokens: Type2Tokens }
  | { profileType: 3; tokens: Type3Tokens }
  | { profileType: 4; tokens: Type4Tokens };

/**
 * 個人中心各版型主題 token 統一入口；既有 getTypeNThemeTokens 仍保留供直接呼叫處使用。
 */
export function buildMyCenterCardTheme(theme: string, profileType: 1): { profileType: 1 };
export function buildMyCenterCardTheme(
  theme: string,
  profileType: 2,
): { profileType: 2; tokens: Type2Tokens };
export function buildMyCenterCardTheme(
  theme: string,
  profileType: 3,
): { profileType: 3; tokens: Type3Tokens };
export function buildMyCenterCardTheme(
  theme: string,
  profileType: 4,
): { profileType: 4; tokens: Type4Tokens };
export function buildMyCenterCardTheme(
  theme: string,
  profileType: MyCenterProfileType,
): BuildMyCenterCardThemeResult {
  switch (profileType) {
    case 1:
      return { profileType: 1 };
    case 2:
      return { profileType: 2, tokens: getType2ThemeTokens(theme) };
    case 3:
      return { profileType: 3, tokens: getType3ThemeTokens(theme) };
    case 4:
      return { profileType: 4, tokens: getType4ThemeTokens(theme) };
    default:
      return { profileType: 1 };
  }
}

export const getType4ThemeTokens = createThemeFactory({
  greenBlack: {
    headerGradient: ["#222527", "#404a3c"] as [string, string],
  },
  orangeWhite: {
    headerGradient: ["#ffebd0", "#fff"] as [string, string],
  },
  blueWhite: {
    headerGradient: ["#ccdafc", "#fff"] as [string, string],
  },
});
