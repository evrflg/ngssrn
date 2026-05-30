import { type Code } from "@/types/navigation";
import APPDownloadIcon from '@/components/icons/navigation/fourth/icon_app_normal'
import DepositIcon from '@/components/icons/navigation/fourth/icon_chongzhi_normal'
import AgentIcon from '@/components/icons/navigation/fourth/icon_daili_normal'
import LoginIcon from '@/components/icons/navigation/fourth/icon_denglu_normal'
import RebateIcon from '@/components/icons/navigation/fourth/icon_fanshui_normal'
import DiscoverIcon from '@/components/icons/navigation/fourth/icon_faxian_normal'
import SharingIcon from '@/components/icons/navigation/fourth/icon_fenxiang_normal'
import ActivityIcon from '@/components/icons/navigation/fourth/icon_huodong_normal'
import CustomerServiceIcon from '@/components/icons/navigation/fourth/icon_kefu_normal'
import WalletIcon from '@/components/icons/navigation/fourth/icon_qianbao_normal'
import TaskIcon from '@/components/icons/navigation/fourth/icon_renwu_normal'
import FreePlayIcon from '@/components/icons/navigation/fourth/icon_shiwang_normal'
import HomeIcon from '@/components/icons/navigation/fourth/icon_shouye_normal'
import WithdrawIcon from '@/components/icons/navigation/fourth/icon_tixian_normal'
import PromotionIcon from '@/components/icons/navigation/fourth/icon_tuiguang_normal'
import VIPIcon from '@/components/icons/navigation/fourth/icon_vip_normal'
import MineIcon from '@/components/icons/navigation/fourth/icon_wode_normal'
import InterestIcon from '@/components/icons/navigation/fourth/icon_lixibao_normal'
import { FC } from "react";

type Icon = FC<any>
export const ICONS_MAPPING: Record<Code, {
  icon: Icon
}> = {
  HOME: {
    icon: HomeIcon,
  },
  ACTIVITY: {
    icon: ActivityIcon,
  },
  LOGIN: {
    icon: LoginIcon,
  },
  REGISTER: {
    icon: LoginIcon,
  },
  WALLET: {
    icon: WalletIcon,
  },
  MY: {
    icon: MineIcon,
  },
  VIP: {
    icon: VIPIcon,
  },
  APP_DOWNLOAD: {
    icon: APPDownloadIcon,
  },
  DEPOSIT: {
    icon: DepositIcon,
  },
  WITHDRAW: {
    icon: WithdrawIcon,
  },
  CUSTOMER: {
    icon: CustomerServiceIcon,
  },
  // TODO 待确认
  DISCOVER: {
    icon: DiscoverIcon,
  },
  FREE_TRIAL: {
    icon: FreePlayIcon,
  },
  REBATE: {
    icon: RebateIcon,
  },
  TASKS: {
    icon: TaskIcon,
  },
  SHARE: {
    icon: SharingIcon,
  },
  PROMOTION: {
    icon: PromotionIcon,
  },
  AGENT_CENTER: {
    icon: AgentIcon,
  },
  // 待确认
  INTEREST: {
    icon: InterestIcon,
  },
}

export const getIcon = (code: Code): Icon => ICONS_MAPPING[code].icon