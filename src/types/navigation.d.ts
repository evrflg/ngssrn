export type Code = 'HOME' | 'ACTIVITY' | 'LOGIN' | 'REGISTER' | 'WALLET' | 'MY' | 'VIP' | 'APP_DOWNLOAD' | 'DEPOSIT' | 'WITHDRAW' | 'CUSTOMER' | 'DISCOVER' | 'FREE_TRIAL' | 'REBATE' | 'TASKS' | 'SHARE' | 'PROMOTION' | 'AGENT_CENTER' | 'INTEREST'
export interface TabIcon {
  icon: (({ color }: { color: string; }) => JSX.Element) | FC<SVGProps<SVGSVGElement>>
  centerIcon: FC
}
type IconsMapping = Record<Code, TabIcon>

export interface Tab {
  code: Code
  path: string
  translationKey: string
  requireAuth?: boolean
}

export type Tabs = Tab[]