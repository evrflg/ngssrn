import getMessageByCode from "@/api/common/errorCode";
import i18n from "@/lang/i18n";
import { ExtractErrorCode, processErrorMessage } from "@/utils/message-parser";

/** 将 i18n 模板中的 {0}、{1} 替换为参数（与 vue-i18n 列表插值行为对齐） */
function applyListPlaceholders(template: string, values?: string[]): string {
  let out = template;
  (values ?? []).forEach((v, i) => {
    out = out.split(`{${i}}`).join(v);
  });
  return out;
}

/**
 * 按业务错误码 / errMsg 表解析展示文案（含 {errorCode=xxx} 包裹与占位符）
 */
export function resolveLocalizedApiErrorMessage(
  code: unknown,
  rawMsg: string | undefined | null
): string {
  const fallback = rawMsg != null && rawMsg !== "" ? String(rawMsg) : "";
  const fromHttp = getMessageByCode(code as number | string);
  const baseMsg = fromHttp ?? fallback;

  const parsed = ExtractErrorCode(String(baseMsg));
  const messageSource = parsed?.errorMessage ?? String(baseMsg);
  const messageInfo = processErrorMessage(messageSource);
  const codeKey = parsed?.errorCode ?? String(code);
  const browserKey = `errMsg.browser.${codeKey}`;
  const commonKey = `errMsg.${codeKey}`;
  const values = messageInfo.values;

  if (i18n.exists(browserKey)) {
    return applyListPlaceholders(String(i18n.t(browserKey)), values);
  }
  if (i18n.exists(commonKey)) {
    return applyListPlaceholders(String(i18n.t(commonKey)), values);
  }
  return String(baseMsg);
}
