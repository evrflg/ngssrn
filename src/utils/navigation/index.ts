import { type Tabs, type Tab, type Code } from "@/types/navigation";

type BaseFooterTabsMapping = Record<string, Omit<Tab, 'code'>>

export const FOOTER_TABS_MAPPING: BaseFooterTabsMapping = {
  HOME: {
    path: 'home',
    translationKey: 'pageName.homepage',
  },
  ACTIVITY: {
    path: 'active',
    translationKey: 'pageName.activity',
  },
  LOGIN: {
    path: 'login',
    translationKey: 'pageName.login',
  },
  REGISTER: {
    path: 'login',
    translationKey: 'pageName.register',
  },
  WALLET: {
    path: 'wallet',
    requireAuth: true,
    translationKey: 'pageName.wallet',
  },
  MY: {
    path: 'my',
    requireAuth: true,
    translationKey: 'pageName.my',
  },
  VIP: {
    path: 'active/vipPage',
    requireAuth: true,
    translationKey: 'VIP',
  },
  APP_DOWNLOAD: {
    path: 'my/appDownload',
    translationKey: 'app.download',
  },
  DEPOSIT: {
    path: 'wallet/recharge',
    requireAuth: true,
    translationKey: 'pageName.recharge',
  },
  WITHDRAW: {
    path: 'wallet/withdraw',
    requireAuth: true,
    translationKey: 'pageName.withdraw',
  },
  CUSTOMER: {
    path: 'my/customerService',
    requireAuth: true,
    translationKey: 'common.customerService',
  },
  // TODO 待确认
  DISCOVER: {
    path: 'discover',
    translationKey: 'navigation.discover',
  },
  FREE_TRIAL: {
    path: 'trial',
    translationKey: 'navigation.trial',
  },
  REBATE: {
    path: 'active/rebate',
    requireAuth: true,
    translationKey: 'pageName.rebate',
  },
  TASKS: {
    path: 'active/missionCenter',
    requireAuth: true,
    translationKey: 'pageName.task',
  },
  SHARE: {
    path: 'active/activeCenter?type=TODO',
    translationKey: 'navigation.share',
  },
  PROMOTION: {
    path: 'promotion',
    requireAuth: true,
    translationKey: 'pageName.promotion',
  },
  AGENT_CENTER: {
    path: 'my/proxyManagement',
    requireAuth: true,
    translationKey: 'agent.proxy',
  },
  // 待确认
  INTEREST: {
    path: 'activity/interest/TODO',
    translationKey: 'navigation.interest',
  },
}

export function processNavigation(tabsCode: string): Tabs {
  const codes = tabsCode.split(',') as Code[]
  return codes.map(code => ({ code, ...FOOTER_TABS_MAPPING[code] }))
}