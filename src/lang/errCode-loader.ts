import patch from "@/api/PatchVersion";
import type { i18n as I18nInstance } from "i18next";

/** 错误码 JS 文件名与 app 语言代码映射（与 ngss-vue errCode-loader 一致） */
const errorCodeFileMap = new Map<string, string>([
  ["ar-SA", "ar-SA"],
  ["de-DE", "de-DE"],
  ["zh-CN", "zh-CN"],
  ["zh-TW", "zh-TW"],
  ["en-US", "en-US"],
  ["es-MX", "es-ES"],
  ["fr-FR", "fr-FR"],
  ["hi-IN", "hi-IN"],
  ["id-ID", "id-ID"],
  ["it-IT", "it-IT"],
  ["ja-JP", "ja-JP"],
  ["ko-KR", "ko-KR"],
  ["ms-MY", "ms-MY"],
  ["nl-NL", "nl-NL"],
  ["pt-BR", "pt-BR"],
  ["ru-RU", "ru-RU"],
  ["th-TH", "th-TH"],
  ["tl-PH", "tl-PH"],
  ["vi-VN", "vi-VN"],
  ["bn-BD", "bn-BD"],
]);

const ERRCODE_QUERY = "v=20250805";

/**
 * 从站点拉取错误码 JS，合并进 i18n translation.errMsg（与 ngss-vue 行为对齐）
 */
export async function loadErrorCodesForLang(
  i18n: I18nInstance,
  langCode: string
): Promise<boolean> {
  if (!langCode) return false;

  const fileKey = errorCodeFileMap.get(langCode) ?? langCode;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(
      `${patch.DOMAIN_URL}/share/errCode/${fileKey}.js?${ERRCODE_QUERY}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);
    const text = await response.text();

    if (text.trim().startsWith("<!doctype html>") || text.trim().startsWith("<html")) {
      console.error(`⚠️ 找不到 ${fileKey} 的错误码文件`);
      return false;
    }

    let newErrorCodes: Record<string, unknown> = {};
    try {
      const parsed = new Function(text + "; return errCode;")() as Record<string, unknown> | null;
      newErrorCodes =
        parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (syntaxError) {
      console.error(`❌ ${fileKey} 错误码文件语法错误:`, syntaxError);
      return false;
    }

    const bundle = i18n.getResourceBundle(langCode, "translation");
    const existingErrMsg =
      bundle?.errMsg && typeof bundle.errMsg === "object" && !Array.isArray(bundle.errMsg)
        ? { ...(bundle.errMsg as Record<string, unknown>) }
        : {};

    const mergedErrMsg: Record<string, unknown> = {
      ...existingErrMsg,
      ...newErrorCodes,
    };

    i18n.addResourceBundle(langCode, "translation", { errMsg: mergedErrMsg }, true, true);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error(`⏰ 加载 ${fileKey} 错误码语言包超时 (10秒)`);
    } else {
      console.error(`❌ 加载 ${fileKey} 错误码语言包失败:`, error);
    }
    return false;
  }
}
