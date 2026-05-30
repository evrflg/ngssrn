/**
 * 项目路由配置
 */
export const BaseRoute = {
  vip: { id: "vip", route: "active/vipPage" },
  bet: { id: "bet", route: "my/betRecord" },
  report: { id: "report", route: "my/reports" },
  wallet: { id: "wallet", route: "wallet" },
  message: { id: "message", route: "my/message" },
  setting: { id: "setting", route: "my/settingCenter" },
  agent: { id: "agent", route: "my/proxyManagement" },
  about: { id: "about", route: "my/about" },
  feedback: { id: "feedback", route: "my/feedBackScreen" },
  customer: { id: "customer", route: "my/customerService" },
  trade: { id: "trade", route: "my/tranctionsRecord" },
  pointsReward: { id: "pointsReward", route: "my/pointBox" },
  bonusTask: { id: "bonusTask", route: "my/balanceGold" },
} as const;
