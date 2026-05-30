import { type Code, type TabIcon, type IconsMapping } from "@/types/navigation";
import APPDownloadIcon from '@/components/icons/navigation/base/icon_app_normal'
import DepositIcon from '@/components/icons/navigation/base/icon_chongzhi_normal'
import AgentIcon from '@/components/icons/navigation/base/icon_daili_normal'
import LoginIcon from '@/components/icons/navigation/base/icon_denglu_normal'
import RebateIcon from '@/components/icons/navigation/base/icon_fanshui_normal'
import DiscoverIcon from '@/components/icons/navigation/base/icon_faxian_normal'
import SharingIcon from '@/components/icons/navigation/base/icon_fenxiang_normal'
import ActivityIcon from '@/components/icons/navigation/base/icon_huodong_normal'
import CustomerServiceIcon from '@/components/icons/navigation/base/icon_kefu_normal'
import WalletIcon from '@/components/icons/navigation/base/icon_qianbao_normal'
import TaskIcon from '@/components/icons/navigation/base/icon_renwu_normal'
import FreePlayIcon from '@/components/icons/navigation/base/icon_shiwang_normal'
import HomeIcon from '@/components/icons/navigation/base/icon_shouye_normal'
import WithdrawIcon from '@/components/icons/navigation/base/icon_tixian_normal'
import PromotionIcon from '@/components/icons/navigation/base/icon_tuiguang_normal'
import VIPIcon from '@/components/icons/navigation/base/icon_vip_normal'
import MineIcon from '@/components/icons/navigation/base/icon_wode_normal'
import InterestIcon from '@/components/icons/navigation/base/icon_lixibao_normal'

import APPDownloadCenterIcon from '@/components/icons/navigation/base/center/icon_app'
import DepositCenterIcon from '@/components/icons/navigation/base/center/icon_chongchi'
import AgentCenterIcon from '@/components/icons/navigation/base/center/icon_daili'
import LoginCenterIcon from '@/components/icons/navigation/base/center/icon_denglu'
import RebateCenterIcon from '@/components/icons/navigation/base/center/icon_fanshui'
import DiscoverCenterIcon from '@/components/icons/navigation/base/center/icon_faxian'
import SharingCenterIcon from '@/components/icons/navigation/base/center/icon_fenxiang'
import ActivityCenterIcon from '@/components/icons/navigation/base/center/icon_huodong'
import CustomerServiceCenterIcon from '@/components/icons/navigation/base/center/icon_kefu'
import WalletCenterIcon from '@/components/icons/navigation/base/center/icon_qianbao'
import TaskCenterIcon from '@/components/icons/navigation/base/center/icon_renwu'
import FreePlayCenterIcon from '@/components/icons/navigation/base/center/icon_shiwan'
import HomeCenterIcon from '@/components/icons/navigation/base/center/icon_shouye'
import WithdrawCenterIcon from '@/components/icons/navigation/base/center/icon_tixian'
import PromotionCenterIcon from '@/components/icons/navigation/base/center/icon_tuiguang'
import VIPCenterIcon from '@/components/icons/navigation/base/center/icon_vip'
import MineCenterIcon from '@/components/icons/navigation/base/center/icon_wode'
import InterestCenterIcon from '@/components/icons/navigation/base/center/icon_lixibao'

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