/**
 * 重要：此文件是应用程序中所有颜色值的唯一真实来源。
 * tailwind.config.js 文件从此处导入颜色并将其映射到 tailwind 格式。
 * 请勿直接在 tailwind.config.js 中修改颜色 - 而是在此处进行更改。
 */

const tintColorLight = "#0a7ea4"; // 深青色
const tintColorDark = "#fff"; // 白色

export const Colors: any = {
  lightFontColor: "#aeb0c6", // 淡灰蓝色
  greenBlack: {
    primary: "#75eb92", //主题色 (浅绿色)
    secondary: "#00E09E",
    themeColor1: "#a9e782",
    text: "#fff", //一般文字 (白色)
    lightText: "rgba(173, 183, 186, 1)", //浅色文字 (淡灰色)
    btnText: "#292c2b", //按钮文字 (深灰色)
    dividerColor: "#313233",
    btnBorder: "#ADB7BA", //按钮边框
    gradient: "#a9e782", //主题浅变配合色 (淡绿色)
    background: "#202222", //页面背景色 (近黑色)
    secondaryBg: "#141515",
    blockBg: "#373939", //block 背景色 (深灰色)
    blockBg1: "#242626", //block 背景色2 (深灰色)
    blockBg2: "rgba(255,255,255,0.1)", //block 背景色3 (半透明白色)
    cardBg1: "rgba(41, 44, 43, 1)", //卡片 (深灰绿色)
    filterBg: "#1A1A1A",
    tint: tintColorLight, // 深青色
    icon: "#687076", // 灰蓝色
    tabIconDefault: "#687076", // 灰蓝色
    tabIconSelected: tintColorLight, // 深青色
    gradientStart: "#A9E782", // 淡绿色
    gradientEnd: "#00E09E", // 青绿色
    searchBtnGradientStart: "rgba(169, 231, 130, 0)", //代理模块的按钮色
    searchBtnGradientEnd: "rgba(117, 235, 146, 0.25)",
    /** 首页 ToolTab 充值 bakeSolid：混色底（与 cardBg1 一致即可） */
    homeToolTabRechargeBakeBg: "rgba(41, 44, 43, 1)",
    /** 首页 ToolTab 充值 bakeSolid：叠层色 */
    homeToolTabRechargeBakeOverlay: "rgba(117, 235, 146, 0.25)",
    searchBtnGradientBg: "rgba(255, 255, 255, 0.1)",
    activeColor: "#292C2B", // 深灰色
    gray: "#adb7ba", // 中灰色
    grayLight: "#fafafa1a", // 半透明浅灰色
    grayDark: "#ddd", // 浅灰色
    warn: "#ff7172", // 淡红色
    shadowColor: "rgba(0, 0, 0, 0.1)",
    textGray: "#adb7ba",
    textGrayLight: "#acafc2",
    darkColor: "#fff",
    redFont: "#ea4e3d",
    textPrimary: "#ddd",
    textSecondary: "#fff",
    inputBg: "#1A1C1C",
    inputBorder: "#1A1C1C",
    borderFontColor: "#666",
    svg3: "#f87700",
    activeTabColor: "#00E09E",
    slantedEdge: "#696969",
    vipColor: "#fff",
    profile2Btn: "rgba(169, 231, 130, 0.1)",
    lightPrimary: "rgba(117, 235, 146, .2)",
    registerTabsActiveFill: "#235D48",
    iconBackground: "rgba(117, 235, 146, 0.68)", // 图标背景色 mix(#75eb92, #000, 68%)
    svgIconColor: "#fff", // SVG图标颜色
    goldColor: "#FFD900",
    closeBtnBgColor: "rgba(255, 255, 255, 0.4)",
    downloadGuideBgColor: "rgba(169, 231, 130, 0.1)",
    loginButtonBgColor: "#a9e782",
    buttonBg3: "rgba(255, 255, 255, 0.2)",
    gray7: "#646566",
    type3SmallIconBg: "rgba(40, 60, 50, 0.7)",
    screenshotBorderColor: "#515151",
    screenshotCloseIconBgColor: "rgba(173, 183, 186, 0.4)",
    screenshotQRBgColor: "rgba(52, 55, 54, 0.8)",
    tranctionsRecordSlantedEdge: "rgb(61, 61, 61)",
    indexHeaderBgColor: "rgba(52, 55, 54, .9)", // 头部宝箱下拉的颜色
    indexHeaderBgColor2: "rgba(255, 255, 255, .1)", // 头部金额背景颜色
    mineTimeBgColor: "#fafafa1a",
    // 首页游戏区样式5
    gameListTabTextColor: "#fff",
    gameListBoxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
    gameListTopGradient: "#f7a01d",
    gameListTopBg: "#333635",
    gameListTopBottomBg: "#292c2b",
    gameListTopPartButtonBg: "rgba(41, 44, 43, 0.5)",
    gameListBorderIntervalBg: "#111",
    gameListSwiperBg: "#292c2b",
    gameListTopPartTotalTextColor: "#75eb92",
    gameListGoldBarHeight: 3,
    gameListAreaGradientStart: "rgba(41, 44, 43, 1)",
    gameListAreaGradientEnd: "#252827",
    activeCardTitleTextColor: "rgba(0, 0, 0, .5)",
    tgBindGradientStart: "#75eb92",
    tgBindGradientEnd: "#a9e782",
    tgBindContentBgColor: "rgba(169, 231, 130, 0.1)",
    myCenter2BtnStart: "#404a3c",
    myCenter2BtnEnd: "#222527",
    appDownBarBg: "#3e4140",
    appDownBarBtnBg: "rgba(117, 235, 146, 0.2)",
    specialBonusTimeRangeBg: '#2d352d',
    taskItemBg: 'rgba(117, 235, 146, 0.15)',
    taskItemColor: '#ffe98a',
    SimilarTextColor: '#75eb92',
    paymentTabGradientStart: 'rgba(117, 235, 146, 0.25)',
    paymentTabGradientEnd: 'rgba(169, 231, 130, 0.25)',
  },
  blueWhite: {
    primary: "#4781ff", // 蓝色
    secondary: "#acc5fc",
    themeColor1: "#47B5FF",
    text: "#515151", // 深灰色
    lightText: "rgba(136, 136, 136, 1)", // 灰色
    btnText: "#fff", // 白色
    dividerColor: "#f6f6f8",
    btnBorder: "#dfdede",
    gradient: "rgba(71, 181, 255, 1)", // 亮蓝色
    background: "#ebecf3", // 淡灰蓝色
    secondaryBg: "#CCCED6",
    blockBg: "#ebecf3", // 淡灰蓝色
    blockBg1: "#e6e7ee", //block 背景色2 (淡灰蓝色)
    blockBg2: "rgba(0,0,0,0.08)", //block 背景色3 (半透明黑色)
    cardBg1: "#fff", // 白色
    filterBg: "#DFE0E8",
    tint: tintColorLight, // 深青色
    icon: "#687076", // 灰蓝色
    tabIconDefault: "#687076", // 灰蓝色
    tabIconSelected: tintColorLight, // 深青色
    gradientStart: "#4781ff", // 蓝色
    gradientEnd: "#acc5fc", // 浅蓝色
    searchBtnGradientStart: "rgba(71, 181, 255, 0)", //代理模块的按钮色
    searchBtnGradientEnd: "rgba(71, 129, 255, 0.25)",
    /** 首页 ToolTab 充值 bakeSolid：避免白底混色底部过白 */
    homeToolTabRechargeBakeBg: "#e8edf8",
    homeToolTabRechargeBakeOverlay: "rgba(71, 129, 255, 0.32)",
    searchBtnGradientBg: "rgba(255, 255, 255, 0.1)",
    activeColor: "#ffffff", // 白色
    gray: "#adb7ba", // 中灰色
    grayLight: "#fafafa1a", // 半透明浅灰色
    grayDark: "#ddd", // 浅灰色
    warn: "#ff7172", // 淡红色
    shadowColor: "#d0d0ed5c",
    textGray: "#888888",
    textGrayLight: "#acafc2",
    darkColor: "#292C2B",
    redFont: "#ffb7af",
    textPrimary: "#333",
    textSecondary: "#666",
    inputBg: "#f2f2f2",
    inputBorder: "#ebebeb",
    borderFontColor: "#daddf0",
    svg3: "#4781FF",
    activeTabColor: "#4781ff",
    slantedEdge: "#F5F5F5",
    vipColor: "#888888",
    profile2Btn: "rgba(71, 129, 255, 0.1)",
    lightPrimary: "rgba(71, 129, 255, .2)",
    registerTabsActiveFill: "#244B73",
    iconBackground: "rgba(71, 129, 255, 0.2)", // 图标背景色 fade(20%)
    svgIconColor: "#4781ff", // SVG图标颜色
    goldColor: "#FFD900",
    closeBtnBgColor: "rgba(71, 181, 255, 0.4)",
    downloadGuideBgColor: "rgba(71, 181, 255, 0.1)",
    loginButtonBgColor: "#4781ff",
    buttonBg3: "rgba(41, 44, 43, 0.2)",
    gray7: "#646566",
    type3SmallIconBg: "rgba(71, 129, 255, 0.12)",
    screenshotBorderColor: "#cbccd3",
    screenshotCloseIconBgColor: "#d9d9d9",
    screenshotQRBgColor: "rgba(217, 217, 217, 0.8)",
    tranctionsRecordSlantedEdge: "rgb(241, 243, 255)",
    indexHeaderBgColor: "rgba(217, 217, 217, .9)",
    indexHeaderBgColor2: "rgba(41, 44, 43, .1)",
    mineTimeBgColor: "#e6e8e8",
    // 首页游戏区样式5
    gameListTabTextColor: "#000",
    gameListBoxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.1)",
    gameListTopGradient: "#f7a01d",
    gameListTopBg: "#ffffff",
    gameListTopBottomBg: "#f5f5f5",
    gameListTopPartButtonBg: "rgba(41, 44, 43, 0.1)",
    gameListBorderIntervalBg: "#d0d0d0",
    gameListSwiperBg: "#ffffff",
    gameListTopPartTotalTextColor: "#4781ff",
    gameListTopBgGradient: ["#f0f5ff", "#ffffff"],
    gameListGoldBarHeight: 5,
    gameListAreaGradientStart: "#f8f9ff",
    gameListAreaGradientEnd: "#e1ebff",
    activeCardTitleTextColor: "rgba(255, 255, 255, .5)",
    tgBindGradientStart: "#4781ff",
    tgBindGradientEnd: "#47b5ff",
    tgBindContentBgColor: "rgba(71, 129, 255, 0.1)",
    myCenter2BtnStart: "#ccdafc",
    myCenter2BtnEnd: "#fff",
    appDownBarBg: "rgba(71, 129, 255, 0.2)",
    appDownBarBtnBg: "rgba(71, 129, 255, 0.2)",
    specialBonusTimeRangeBg: '#dae1f4',
    taskItemBg: 'transparent',
    taskItemColor: '#292C2B',
    SimilarTextColor: '#4781ff',
    paymentTabGradientStart: 'rgba(71, 129, 255, 0.25)',
    paymentTabGradientEnd: 'rgba(71, 181, 255, 0.25)',
  },
  orangeWhite: {
    primary: "#f48d16", // 橙色
    secondary: "#fcbc42",
    themeColor1: "#ff9801",
    text: "#292c2b", // 深灰色
    lightText: "rgba(136, 136, 136, 1)", // 灰色
    btnText: "#fff", // 白色
    dividerColor: "#f6f6f8",
    btnBorder: "#dfdede", //按钮边框
    gradient: "rgba(255, 217, 0, 1)", // 亮黄色
    background: "#ebecf3", // 淡灰蓝色
    secondaryBg: "#CCCED6",
    blockBg: "#d3d4da", // 淡灰色
    blockBg1: "#e6e7ee", // 淡灰蓝色
    blockBg2: "rgba(0,0,0,0.08)", //block 背景色3 (半透明黑色)
    cardBg1: "#fff", // 白色
    filterBg: "#DFE0E8",
    tint: tintColorDark, // 白色
    icon: "#9BA1A6", // 灰色
    tabIconDefault: "#9BA1A6", // 灰色
    tabIconSelected: tintColorDark, // 白色
    gradientStart: "#ff9801", // 橙色
    gradientEnd: "#fcbc42", // 浅橙色
    searchBtnGradientStart: "rgba(255, 217, 0, 0)", //代理模块的按钮色
    searchBtnGradientEnd: "rgba(244, 141, 22, 0.25)",
    /** 首页 ToolTab 充值 bakeSolid：避免白底混色底部过白 */
    homeToolTabRechargeBakeBg: "#f8f2ea",
    homeToolTabRechargeBakeOverlay: "rgba(244, 141, 22, 0.32)",
    searchBtnGradientBg: "rgba(255, 255, 255, 0.1)",
    activeColor: "#ffffff", // 白色
    gray: "#adb7ba", // 中灰色
    grayLight: "#fafafa1a", // 半透明浅灰色
    grayDark: "#ddd", // 浅灰色
    warn: "#ff7172", // 淡红色
    shadowColor: "#d0d0ed5c",
    textGray: "#888888",
    textGrayLight: "#acafc2",
    darkColor: "#292C2B",
    redFont: "#080706",
    textPrimary: "#333",
    textSecondary: "#666",
    inputBg: "#f2f2f2",
    inputBorder: "#ebebeb",
    borderFontColor: "#daddf0",
    svg3: "#f87700",
    activeTabColor: "#f48d16",
    slantedEdge: "#F5F5F5",
    vipColor: "#888888",
    profile2Btn: "rgba(244, 141, 22, 0.1)",
    lightPrimary: "rgba(244, 141, 22, .2)",
    registerTabsActiveFill: "#885831",
    iconBackground: "rgba(244, 141, 22, 0.2)", // 图标背景色 fade(20%)
    svgIconColor: "#ff9801", // SVG图标颜色
    goldColor: "#FFD900",
    closeBtnBgColor: "rgba(255, 217, 0, 0.4)",
    downloadGuideBgColor: "rgba(255, 217, 0, 0.1)",
    loginButtonBgColor: "#ff9801",
    buttonBg3: "rgba(41, 44, 43, 0.2)",
    gray7: "#646566",
    type3SmallIconBg: "rgba(71, 129, 255, 0.12)",
    screenshotBorderColor: "#cbccd3",
    screenshotCloseIconBgColor: "#d9d9d9",
    screenshotQRBgColor: "rgba(217, 217, 217, 0.8)",
    tranctionsRecordSlantedEdge: "rgb(241, 243, 255)",
    indexHeaderBgColor: "rgba(217, 217, 217, .9)",
    indexHeaderBgColor2: "rgba(41, 44, 43, .1)",
    mineTimeBgColor: "#e6e8e8",
    // 首页游戏区样式5
    gameListTabTextColor: "#000",
    gameListBoxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.1)",
    gameListTopGradient: "#f7a01d",
    gameListTopBg: "#ffffff",
    gameListTopBottomBg: "#f5f5f5",
    gameListTopPartButtonBg: "rgba(41, 44, 43, 0.1)",
    gameListBorderIntervalBg: "#d0d0d0",
    gameListSwiperBg: "#ffffff",
    gameListTopPartTotalTextColor: "#f48d16",
    gameListTopBgGradient: ["#fff8f0", "#ffffff"],
    gameListGoldBarHeight: 5,
    gameListAreaGradientStart: "#fffbf7",
    gameListAreaGradientEnd: "#feeddd",
    activeCardTitleTextColor: "rgba(255, 255, 255, .5)",
    tgBindGradientStart: "#f48d16",
    tgBindGradientEnd: "#ffd900",
    tgBindContentBgColor: "rgba(244, 141, 22, 0.1)",
    myCenter2BtnStart: "#ffebd0",
    myCenter2BtnEnd: "#fff",
    appDownBarBg: "rgba(244, 141, 22, 0.2)",
    appDownBarBtnBg: "rgba(244, 141, 22, 0.2)",
    specialBonusTimeRangeBg: '#ece3dc',
    taskItemBg: 'transparent',
    taskItemColor: '#292C2B',
    similarTextColor: '#A24A00', // 相似颜色文字调整,
    paymentTabGradientStart: 'rgba(244, 141, 22, 0.25)',
    paymentTabGradientEnd: 'rgba(255, 217, 0, 0.25)',
  },
};
