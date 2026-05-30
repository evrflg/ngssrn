import { initReactI18next } from "react-i18next";
import i18next from "i18next";
import { DEFAULT_LANGUAGE, STORAGE_LANGUAGE_KEY, SUPPORTED_LANGUAGES } from "./language";
import { getStorage } from "../utils/storage";

// 直接导入本地语言文件
import enTranslations from "./locales/en.json";
import cnTranslations from "./locales/cn.json";
import jpTranslations from "./locales/jp.json";
import brTranslations from "./locales/br.json";
import esTranslations from "./locales/es.json";
import viTranslations from "./locales/vi.json";
import thTranslations from "./locales/th.json";
import myTranslations from "./locales/my.json";
import idTranslations from "./locales/id.json";
import inTranslations from "./locales/in.json";
import phTranslations from "./locales/ph.json";
import deTranslations from "./locales/de.json";
import frTranslations from "./locales/fr.json";
import itTranslations from "./locales/it.json";
import koTranslations from "./locales/ko.json";
import nlTranslations from "./locales/nl.json";
import ruTranslations from "./locales/ru.json";
import saTranslations from "./locales/sa.json";
import twTranslations from "./locales/tw.json";
import bnTranslations from "./locales/bn.json";

// 配置资源
const resources = {
  'ar-SA': { translation: saTranslations }, // 阿拉伯语
  'bn-BD': { translation: bnTranslations }, // 孟加拉语
  'de-DE': { translation: deTranslations }, // 德语
  'en-US': { translation: enTranslations }, // 英语
  'es-MX': { translation: esTranslations }, // 西班牙语
  'fr-FR': { translation: frTranslations }, // 法语
  'hi-IN': { translation: inTranslations }, // 印地语
  'id-ID': { translation: idTranslations }, // 印尼语
  'it-IT': { translation: itTranslations }, // 意大利语
  'ja-JP': { translation: jpTranslations }, // 日语
  'ko-KR': { translation: koTranslations }, // 韩语
  'ms-MY': { translation: myTranslations }, // 马来西亚语
  'nl-NL': { translation: nlTranslations }, // 荷兰语
  'pt-BR': { translation: brTranslations }, // 葡萄牙语
  'ru-RU': { translation: ruTranslations }, // 俄语
  'th-TH': { translation: thTranslations }, // 泰语
  // i18next 会把 tl-PH 规范化为 fil-PH（解析链路：fil-PH -> tl -> en-US）
  'tl-PH': { translation: phTranslations }, // 菲律宾语（UI 选择值）
  'fil-PH': { translation: phTranslations }, // 菲律宾语（i18next 规范化值）
  'vi-VN': { translation: viTranslations }, // 越南语
  'zh-CN': { translation: cnTranslations }, // 中文
  'zh-TW': { translation: twTranslations }, // 繁体中文
};

let initPromise: Promise<void> | null = null;

/**
 * 保证 i18next.init 已完成（含 await getStorage）。
 * PWA/Web 冷启动或标签页恢复时，避免 UI 先于 init 渲染导致满屏 i18n key。
 */
export function ensureI18nInitialized(): Promise<void> {
  if (i18next.isInitialized) {
    return Promise.resolve();
  }
  if (!initPromise) {
    initPromise = (async () => {
      const storedLanguage = await getStorage(STORAGE_LANGUAGE_KEY);
      const finalLanguage =
        storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)
          ? storedLanguage
          : DEFAULT_LANGUAGE;
      await i18next.use(initReactI18next).init({
        resources,
        lng: finalLanguage,
        fallbackLng: DEFAULT_LANGUAGE,
      });
    })();
  }
  return initPromise;
}

/** 与根布局 `await` 共用同一 Promise，避免重复 init */
export const i18nReady = ensureI18nInitialized();

export default i18next;
