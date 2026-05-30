export interface SiteCodeConfig {
  appHeaderSiteNameStyle?: Record<string, string> // app头部站点名称样式
  carouselImageNoBorder?: boolean // 首页轮播图片无边框
  redPacketLogo?: string | Record<string, string> // 红包入口图标文件名 👈 支持多语言
  isTestSite?: boolean // 是否是测试站点
  missionFirstDepositImage?: string // 任务-首次充值 banner 图
  customerServiceLogo?: string // 客服图标（RN HeaderActivityPopup）
  reedUiURL?: string
  defaultThemeId?: 'ngBlkGreen' | 'ngBlue' | 'ngOrange' | 'ngGreen'
  [key: string]: unknown
}

const siteCodeConfig: Record<string, SiteCodeConfig> = {
  F001: {
    isTestSite: true,
    isBn102: true,
    customerServiceLogo: '/share/station/ZT031700000513/images/customer_service_logo.png',
    redPacketLogo: {
      'bn-BD': '/share/station/ZT031700000513/images/red_packet_logo_bn.png',
      'en-US': '/share/station/ZT031700000513/images/red_packet_logo_en.png',
    },
    csPageBanner: {
      'bn-BD': '/share/station/ZT031700000513/images/csPageBanner_bn.jpg',
      'en-US': '/share/station/ZT031700000513/images/csPageBanner_en.jpg',
    },
    activityCenterBanner: {
      'bn-BD': '/share/station/ZT031700000513/images/activityCenterBanner_bn.jpg',
      'en-US': '/share/station/ZT031700000513/images/activityCenterBanner_en.jpg',
    },
    defaultThemeId: 'ngBlkGreen',
    noShowTelegramPopup: true,
  },
  // 中国站-测试
  ZT050800000604: {
    isBn102: true,
    isTestSite: true,
    defaultThemeId: 'ngBlkGreen',
  },
  // 印度站-测试
  ZT050800000605: {
    isTestSite: true,
    defaultThemeId: 'ngBlkGreen',
  },
  ZT033000000409: {
    defaultThemeId: 'ngBlkGreen',
    isTestSite: true,
  },
  // bn102
  ZT031700000513: {
    isBn102: true,
    removeFooterItemKeys: ['contact'],
    appHeaderSiteNameStyle: { fontSize: '2rem' },
    carouselImageNoBorder: true,
    customerServiceLogo: '/share/station/ZT031700000513/images/customer_service_logo.png',
    redPacketLogo: {
      'bn-BD': '/share/station/ZT031700000513/images/red_packet_logo_bn.png',
      'en-US': '/share/station/ZT031700000513/images/red_packet_logo_en.png',
    },
    csPageBanner: {
      'bn-BD': '/share/station/ZT031700000513/images/csPageBanner_bn.jpg',
      'en-US': '/share/station/ZT031700000513/images/csPageBanner_en.jpg',
    },
    mysteriousColoredGoldIcon: '/share/station/ZT031700000513/images/mysterious-colored-gold.png',
    noShowBonusUnlockingInstructions: true,
    activityCenterBanner: {
      'bn-BD': '/share/station/ZT031700000513/images/activityCenterBanner_bn.jpg',
      'en-US': '/share/station/ZT031700000513/images/activityCenterBanner_en.jpg',
    },
    defaultThemeId: 'ngBlkGreen',
    noShowAgreement: true,
    isInvalidAmount: true,
    noShowTelegramPopup: true,
    headerPopupShowWhatsapp: true,
    hideCustomerService: true,
    noShowIsPreferentialBtn: true,
  },
  // ph101
  ZT020900000502: {
    isPh101: true,
    missionFirstDepositImage: '/share/station/ZT020900000502/images/ph101-FIRST_DEPOSIT.jpg',
    isShowAllGameManufacturer: true,
    defaultThemeId: 'ngBlkGreen',
    hiddenBankIFSC: true,
    defaultLang: 'en-US',
    appDownloadLogo: '/share/station/ZT020900000502/images/app_dowload_logo.png',
  },
  // yd115
  ZT040600000302: {
    isYd115: true,
    defaultThemeId: 'ngBlkGreen',
    noShowTelegramPopup: true,
  },
  // my101
  ZT051600000302: {},
  // ng3web9.ngss.bet 演示站
  ZT031600000304: {},
}

export function defineSiteCodeConfig(siteCode?: string): SiteCodeConfig {
  if (!siteCode) return {}
  return siteCodeConfig[siteCode] ?? {}
}

export function getLangAsset(
  value: string | Record<string, string> | undefined,
  lang: string | undefined,
): string | undefined {
  if (!value || !lang) return undefined
  if (typeof value === 'string') return value
  return value[lang]
}
