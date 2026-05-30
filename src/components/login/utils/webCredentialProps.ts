/**
 * Web：弱化浏览器自带「记住账号密码 / 自动填充 / 保存密码」提示。
 * 各浏览器策略不同，无法保证完全关闭；data-* 供常见密码管理器识别。
 */
export const WEB_BLOCK_BROWSER_CREDENTIALS = {
  autoComplete: "off" as const,
  "data-lpignore": "true",
  "data-1p-ignore": "true",
} as const;

/**
 * Web 注册页密码框：须用 new-password，避免被当成「登录密码」触发保存/覆盖已存账号。
 * 与登录页的 current-password / off 语义区分。
 */
export const WEB_REGISTER_PASSWORD_FIELDS = {
  autoComplete: "new-password" as const,
  "data-lpignore": "true",
  "data-1p-ignore": "true",
} as const;
