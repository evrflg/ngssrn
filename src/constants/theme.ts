/** 仅存文案 key；顶层 i18n.t 会早于异步 init，Web 上会得到空字符串 */
export const THEME_OPTIONS = [
  { labelKey: "my.theme.orange", value: "orangeWhite" },
  { labelKey: "my.theme.blue", value: "blueWhite" },
  { labelKey: "my.theme.greenblack", value: "greenBlack" },
] as const;
