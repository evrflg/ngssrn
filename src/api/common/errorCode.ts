import i18n from "@/lang/i18n";

export default function getMessageByCode(code: number) {
  // 注意：不要在模块初始化时就 i18n.t，否则语言/资源尚未就绪时会把空字符串缓存死
  const map: Record<number, string> = {
    401: i18n.t("errMsg.browser.401"),
    403: i18n.t("errMsg.browser.403"),
    404: i18n.t("errMsg.browser.404"),
    500: i18n.t("errMsg.browser.500"),
    502: i18n.t("errMsg.browser.502"),
  };
  return map[code] || i18n.t("errMsg.browser.elseErr");
}
