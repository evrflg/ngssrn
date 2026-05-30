import { type Code, type TabIcon, type IconsMapping } from "@/types/navigation";
import APPDownloadIcon from '@/components/icons/navigation/second/icon_app_normal.svg'
import DepositIcon from '@/components/icons/navigation/second/icon_chongzhi_normal.svg'
import AgentIcon from '@/components/icons/navigation/second/icon_daili_normal.svg'
import LoginIcon from '@/components/icons/navigation/second/icon_denglu_normal.svg'
import RebateIcon from '@/components/icons/navigation/second/icon_fanshui_normal.svg'
import DiscoverIcon from '@/components/icons/navigation/second/icon_faxian_normal.svg'
import SharingIcon from '@/components/icons/navigation/second/icon_fenxiang_normal.svg'
import ActivityIcon from '@/components/icons/navigation/second/icon_huodong_normal.svg'
import CustomerServiceIcon from '@/components/icons/navigation/second/icon_kefu_normal.svg'
import WalletIcon from '@/components/icons/navigation/second/icon_qianbao_normal.svg'
import TaskIcon from '@/components/icons/navigation/second/icon_renwu_normal.svg'
import FreePlayIcon from '@/components/icons/navigation/second/icon_shiwang_normal.svg'
import HomeIcon from '@/components/icons/navigation/second/icon_shouye_normal.svg'
import WithdrawIcon from '@/components/icons/navigation/second/icon_tixian_normal.svg'
import PromotionIcon from '@/components/icons/navigation/second/icon_tuiguang_normal.svg'
import VIPIcon from '@/components/icons/navigation/second/icon_vip_normal.svg'
import MineIcon from '@/components/icons/navigation/second/icon_wode_normal.svg'
import InterestIcon from '@/components/icons/navigation/second/icon_lixibao_normal.svg'

import APPDownloadCenterIcon from '@/components/icons/navigation/second/center/icon_app'
import DepositCenterIcon from '@/components/icons/navigation/second/center/icon_chongchi'
import AgentCenterIcon from '@/components/icons/navigation/second/center/icon_daili'
import LoginCenterIcon from '@/components/icons/navigation/second/center/icon_denglu'
import RebateCenterIcon from '@/components/icons/navigation/second/center/icon_fanshui'
import DiscoverCenterIcon from '@/components/icons/navigation/second/center/icon_faxian'
import SharingCenterIcon from '@/components/icons/navigation/second/center/icon_fenxiang'
import ActivityCenterIcon from '@/components/icons/navigation/second/center/icon_huodong'
import CustomerServiceCenterIcon from '@/components/icons/navigation/second/center/icon_kefu'
import WalletCenterIcon from '@/components/icons/navigation/second/center/icon_qianbao'
import TaskCenterIcon from '@/components/icons/navigation/second/center/icon_renwu'
import FreePlayCenterIcon from '@/components/icons/navigation/second/center/icon_shiwan'
import HomeCenterIcon from '@/components/icons/navigation/second/center/icon_shouye'
import WithdrawCenterIcon from '@/components/icons/navigation/second/center/icon_tixian'
import PromotionCenterIcon from '@/components/icons/navigation/second/center/icon_tuiguang'
import VIPCenterIcon from '@/components/icons/navigation/second/center/icon_vip'
import MineCenterIcon from '@/components/icons/navigation/second/center/icon_wode'
import InterestCenterIcon from '@/components/icons/navigation/second/center/icon_lixibao'

export const ICONS_MAPPING: IconsMapping = {
  HOME: {
    icon: HomeIcon,
    centerIcon: HomeCenterIcon
  },
  ACTIVITY: {
    icon: ActivityIcon,
    centerIcon: ActivityCenterIcon
  },
  LOGIN: {
    icon: LoginIcon,
    centerIcon: LoginCenterIcon
  },
  REGISTER: {
    icon: LoginIcon,
    centerIcon: LoginCenterIcon
  },
  WALLET: {
    icon: WalletIcon,
    centerIcon: WalletCenterIcon
  },
  MY: {
    icon: MineIcon,
    centerIcon: MineCenterIcon
  },
  VIP: {
    icon: VIPIcon,
    centerIcon: VIPCenterIcon
  },
  APP_DOWNLOAD: {
    icon: APPDownloadIcon,
    centerIcon: APPDownloadCenterIcon
  },
  DEPOSIT: {
    icon: DepositIcon,
    centerIcon: DepositCenterIcon
  },
  WITHDRAW: {
    icon: WithdrawIcon,
    centerIcon: WithdrawCenterIcon
  },
  CUSTOMER: {
    icon: CustomerServiceIcon,
    centerIcon: CustomerServiceCenterIcon
  },
  // TODO 待确认
  DISCOVER: {
    icon: DiscoverIcon,
    centerIcon: DiscoverCenterIcon
  },
  FREE_TRIAL: {
    icon: FreePlayIcon,
    centerIcon: FreePlayCenterIcon
  },
  REBATE: {
    icon: RebateIcon,
    centerIcon: RebateCenterIcon
  },
  TASKS: {
    icon: TaskIcon,
    centerIcon: TaskCenterIcon
  },
  SHARE: {
    icon: SharingIcon,
    centerIcon: SharingCenterIcon
  },
  PROMOTION: {
    icon: PromotionIcon,
    centerIcon: PromotionCenterIcon
  },
  AGENT_CENTER: {
    icon: AgentIcon,
    centerIcon: AgentCenterIcon
  },
  // 待确认
  INTEREST: {
    icon: InterestIcon,
    centerIcon: InterestCenterIcon
  },
}

export const getIcon = (code: Code): TabIcon => ICONS_MAPPING[code]