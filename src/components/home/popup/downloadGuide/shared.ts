import { useMaxWidth } from "@/hooks/useMaxWidth";
import { Dimensions, Platform } from "react-native";

export const GOLD_GRADIENT_COLORS = [
  "#f7a01d",
  "#fff3ae",
  "#ffe44d",
  "#fffec9",
  "#ffe44d",
  "#fff3ae",
  "#f7a01d",
] as const;

// Backend scenes mapped to specific routes
// VISIT_HOMEPAGE(0, "访问主页"),
// USER_RECHARGE(1, "用户充值"),
// FIRST_WITHDRAWAL(2, "首次提现"),
export enum GuideInstallScene {
  VISIT_HOMEPAGE = "VISIT_HOMEPAGE",
  USER_RECHARGE = "USER_RECHARGE",
  FIRST_WITHDRAWAL = "FIRST_WITHDRAWAL",
}

/** 单场景的关闭记录（按场景分别存，互不影响） */
export type AppDownloadPopupSceneRecord = {
  dateTime: string;
  dontPopup: boolean;
};

/**
 * AsyncStorage key: `appDownloadPopupLastTime`
 * 普通对象，场景枚举值为 key（只会有已出现过的场景）。
 * @example
 * {
 *   "VISIT_HOMEPAGE": { "dateTime": "2025-01-01T00:00:00.000Z", "dontPopup": false },
 *   "USER_RECHARGE": { "dateTime": "...", "dontPopup": true }
 * }
 */
export type AppDownloadPopupLastTimeStored = Partial<
  Record<GuideInstallScene, AppDownloadPopupSceneRecord>
>;

// 场景枚举 -> 数字映射（渠道会用到）
export const SceneToNumber: Record<GuideInstallScene, number> = {
  [GuideInstallScene.VISIT_HOMEPAGE]: 0,
  [GuideInstallScene.USER_RECHARGE]: 1,
  [GuideInstallScene.FIRST_WITHDRAWAL]: 2,
};

// 工具函数：检查场景是否匹配（渠道会用到）
export function isSceneMatch(scene: GuideInstallScene, num: number): boolean {
  return SceneToNumber[scene] === num;
}

// Get iOS helper steps lines with type information
export interface StepLine {
  type: "safari" | "chrome" | "other";
  prefix: string;
  text: string;
}

export interface DownloadGuideProps {
  visible?: boolean;
  onClose?: () => void;
  onQueueStateChange?: (canShow: boolean) => void;
  /** 强制展示APP_DOWNLOAD，与点击引导按钮效果一致直接弹窗 */
  forceShow?: boolean;
}

/** 安装引导弹窗内 appInfo 字段（安装按钮规则用） */
export type InstallGuideAppInfo = {
  installType?: number;
  appstoreUrl?: string;
  downloadUrl?: string;
  appStore?: { templateStyle?: string | number } | null;
} | null;

/** iOS 保存桌面：可跳转落地页或应用商店时，点击才有反应 */
export function getIosInstallClickable(
  appInfo: InstallGuideAppInfo,
  goLandingPage: boolean,
): boolean {
  const canLand = goLandingPage && !!appInfo?.appStore?.templateStyle;
  const canStore = !!appInfo?.appstoreUrl;
  return canLand || canStore;
}

/** iOS 是否显示安装按钮 */
export function getIosInstallButtonVisible(
  appInfo: InstallGuideAppInfo,
  goLandingPage: boolean,
): boolean {
  if (appInfo?.installType === 1) return true;
  if (appInfo?.installType === 0) {
    return getIosInstallClickable(appInfo, goLandingPage);
  }
  return false;
}

/** iOS 安装按钮是否禁用（与 goInstall 前置校验一致） */
export function getIosInstallButtonDisabled(
  appInfo: InstallGuideAppInfo,
  goLandingPage: boolean,
  channelId: string | null,
): boolean {
  if (appInfo?.installType === 1) {
    if (!channelId) {
      return !appInfo?.appstoreUrl;
    }
    return (
      (goLandingPage && !appInfo?.appStore) ||
      (!appInfo?.appstoreUrl && !goLandingPage)
    );
  }
  if (appInfo?.installType === 0) {
    return !getIosInstallClickable(appInfo, goLandingPage);
  }
  return true;
}

// 组装渠道数据跟引导弹窗配置数据参数一致
export const assembleChannelData = (
  channelConfig: any,
  appDomainConfig: any,
  type: GuideInstallScene,
  isIOS = false,
): any => {
  // 从渠道配置获取渠道数据
  const channelRsp = channelConfig.channelRsp || {};
  // 从域名管理获取模板信息
  const templateInfo = appDomainConfig.templateInfo || {};

  // 弹窗触发时机类型是否匹配场景，不匹配则不组装数据
  const popupOccasionType = isIOS
    ? channelRsp.iosPopupOccasionType
    : channelRsp.androidPopupOccasionType;
  const isMatch = isSceneMatch(type, popupOccasionType);
  if (!isMatch) {
    return null;
  }

  // 是否显示下载按钮
  const showDownloadButton = isIOS
    ? channelRsp.iosShowDownloadButton
    : channelRsp.androidShowDownloadButton;

  // 弹框时间间隔类型
  const popupIntervalTimeType = isIOS
    ? channelRsp.iosPopupIntervalTimeType
    : channelRsp.androidPopupIntervalTimeType;

  return {
    id: channelRsp.id,
    nameI18n: [],
    appId: "",
    showDownloadButton: showDownloadButton,
    popupOccasionType: popupOccasionType,
    popupIntervalTimeType: popupIntervalTimeType,
    android: {
      appId: null,
      appName: templateInfo.appName,
      installType: channelRsp.androidInstallType,
      appStore: templateInfo,
      downloadUrl: channelRsp.androidDownloadUrl,
    },
    ios: {
      appId: null,
      appName: templateInfo.appName,
      installType: channelRsp.iosInstallType,
      appStore: templateInfo,
      appstoreUrl: channelRsp.iosAppstoreUrl,
    },
  };
};
