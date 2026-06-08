// 前端支持的语言代码（用于类型约束与运行时校验）
export const SUPPORTED_LANGUAGES: string[] = [
  "zh-CN",
  "zh-TW",
  "en-US",
  "ar-SA",
  "bn-BD",
  "de-DE",
  "es-MX",
  "fr-FR",
  "hi-IN",
  "id-ID",
  "it-IT",
  "ja-JP",
  "ko-KR",
  "ms-MY",
  "nl-NL",
  "pt-BR",
  "ru-RU",
  "th-TH",
  "tl-PH",
  "vi-VN",
];

// 语言代码与语言名称的映射（下拉框显示）
export const LANGUAGE_NAME_MAP = new Map<string, string>([
  ["zh-CN", "简体中文"], // 简体中文
  ["zh-TW", "繁體中文"], // 繁体中文
  ["en-US", "English"], // 英语
  ["ar-SA", "العربية"], // 阿拉伯语
  ["bn-BD", "বাংলা"], // 孟加拉语
  ["de-DE", "Deutsch"], // 德语
  ["es-MX", "Español"], // 西班牙语
  ["fr-FR", "Français"], // 法语
  ["hi-IN", "हिन्दी"], // 印地语
  ["id-ID", "Bahasa Indonesia"], // 印尼语
  ["it-IT", "Italiano"], // 意大利语
  ["ja-JP", "日本語"], // 日语
  ["ko-KR", "한국어"], // 韩语
  ["ms-MY", "Bahasa Melayu"], // 马来语
  ["nl-NL", "Nederlands"], // 荷兰语
  ["pt-BR", "Português (BR)"], // 葡萄牙语
  ["ru-RU", "Русский"], // 俄语
  ["th-TH", "ไทย"], // 泰语
  ["tl-PH", "Filipino"], // 菲律宾语
  ["vi-VN", "Tiếng Việt"], // 越南语
]);

// 站点语言/错误码的映射（错误码文件名）
export const TENANT_LANGUAGE_MAP = new Map<string, string>([
  ["cn", "zh-CN"],
  ["tw", "zh-TW"],
  ["en", "en-US"],
  ["ar", "ar-SA"],
  ["bn", "bn-BD"],
  ["de", "de-DE"],
  ["es", "es-MX"],
  ["fr", "fr-FR"],
  ["in", "hi-IN"],
  ["id", "id-ID"],
  ["it", "it-IT"],
  ["ja", "ja-JP"],
  ["ko", "ko-KR"],
  ["ms", "ms-MY"],
  ["nl", "nl-NL"],
  ["br", "pt-BR"],
  ["ru", "ru-RU"],
  ["th", "th-TH"],
  ["ph", "tl-PH"],
  ["vi", "vi-VN"],
]);

// 日期组件 locale 映射 bn、ph、ms、tl、vi 等语言插件不支持，需要映射为 en
export const DATE_PICKER_LOCALE_MAP = new Map<string, string>([
  ["zh-cn", "zh"],
  ["zh-tw", "zh-TW"],
  ["en-us", "en"],
  ["ar-sa", "ar"],
  ["bn-bd", "bn"],
  ["de-de", "de"],
  ["es-mx", "es"],
  ["fr-fr", "fr"],
  ["hi-in", "hi"],
  ["id-id", "id"],
  ["it-it", "it"],
  ["ja-jp", "ja"],
  ["ko-kr", "ko"],
  ["ms-my", "en"],
  ["nl-nl", "nl"],
  ["pt-br", "pt"],
  ["ru-ru", "ru"],
  ["th-th", "th"],
  ["tl-ph", "en"],
  ["vi-vn", "vi"],
]);

// 默认语言
export const DEFAULT_LANGUAGE = "en-US";
export const STORAGE_LANGUAGE_KEY = "ngss-rn-language";

// 个人中心-语言对应的图片
export const languageImgMap: any = {
  "zh-CN": require("@/assets/images/country/square/cn.png"),
  "zh-TW": require("@/assets/images/country/square/tw.png"),
  "en-US": require("@/assets/images/country/square/en.png"),
  "ar-SA": require("@/assets/images/country/square/sa.png"),
  "bn-BD": require("@/assets/images/country/square/bn.png"),
  "de-DE": require("@/assets/images/country/square/de.png"),
  "es-MX": require("@/assets/images/country/square/es.png"),
  "fr-FR": require("@/assets/images/country/square/fr.png"),
  "hi-IN": require("@/assets/images/country/square/in.png"),
  "id-ID": require("@/assets/images/country/square/id.png"),
  "it-IT": require("@/assets/images/country/square/it.png"),
  "ja-JP": require("@/assets/images/country/square/jp.png"),
  "ko-KR": require("@/assets/images/country/square/ko.png"),
  "ms-MY": require("@/assets/images/country/square/my.png"),
  "nl-NL": require("@/assets/images/country/square/nl.png"),
  "pt-BR": require("@/assets/images/country/square/br.png"),
  "ru-RU": require("@/assets/images/country/square/ru.png"),
  "th-TH": require("@/assets/images/country/square/th.png"),
  "tl-PH": require("@/assets/images/country/square/ph.png"),
  "vi-VN": require("@/assets/images/country/square/vi.png"),
};

// 语言对应的电话号码
export const languagePhoneNumberMap: any = {
  "zh-CN": "+86",
  "zh-TW": "+886",
  "en-US": "+1",
  "ar-SA": "+966",
  "bn-BD": "+880",
  "de-DE": "+49",
  "es-MX": "+52",
  "fr-FR": "+33",
  "hi-IN": "+91",
  "id-ID": "+62",
  "it-IT": "+39",
  "ja-JP": "+81",
  "ko-KR": "+82",
  "ms-MY": "+60",
  "nl-NL": "+31",
  "pt-BR": "+55",
  "ru-RU": "+7",
  "th-TH": "+66",
  "tl-PH": "+63",
  "vi-VN": "+84",
};

// 登录注册：短码与 TENANT_LANGUAGE_MAP 一致，区号与 languagePhoneNumberMap 一致
export const nationArr: any = {
  cn: { phone: "+86", img: require("@/assets/images/country/round/cn.png") }, // zh-CN
  tw: { phone: "+886", img: require("@/assets/images/country/round/tw.png") }, // zh-TW
  en: { phone: "+1", img: require("@/assets/images/country/round/en.png") }, // en-US
  ar: { phone: "+966", img: require("@/assets/images/country/round/sa.png") }, // ar-SA
  bn: { phone: "+880", img: require("@/assets/images/country/round/bn.png") }, // bn-BD
  de: { phone: "+49", img: require("@/assets/images/country/round/de.png") }, // de-DE
  es: { phone: "+52", img: require("@/assets/images/country/round/es.png") }, // es-MX
  fr: { phone: "+33", img: require("@/assets/images/country/round/fr.png") }, // fr-FR
  in: { phone: "+91", img: require("@/assets/images/country/round/in.png") }, // hi-IN
  id: { phone: "+62", img: require("@/assets/images/country/round/id.png") }, // id-ID
  it: { phone: "+39", img: require("@/assets/images/country/round/it.png") }, // it-IT
  ja: { phone: "+81", img: require("@/assets/images/country/round/ja.png") }, // ja-JP
  ko: { phone: "+82", img: require("@/assets/images/country/round/ko.png") }, // ko-KR
  ms: { phone: "+60", img: require("@/assets/images/country/round/my.png") }, // ms-MY
  nl: { phone: "+31", img: require("@/assets/images/country/round/nl.png") }, // nl-NL
  br: { phone: "+55", img: require("@/assets/images/country/round/br.png") }, // pt-BR
  ru: { phone: "+7", img: require("@/assets/images/country/round/ru.png") }, // ru-RU
  th: { phone: "+66", img: require("@/assets/images/country/round/th.png") }, // th-TH
  ph: { phone: "+63", img: require("@/assets/images/country/round/ph.png") }, // tl-PH
  vi: { phone: "+84", img: require("@/assets/images/country/round/vi.png") }, // vi-VN
};
