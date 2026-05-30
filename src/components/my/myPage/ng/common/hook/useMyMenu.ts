import { useToast } from '@/components/common/toast';
import { BaseRoute } from '@/constants/baseRoute';
import { useTheme } from '@/hooks/theme/ThemeProvider';
import { AppDispatch, RootState } from '@/store/store';
import { changesShowLanguageModal } from '@/store/user/userSlice';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { ThemePopupRef } from '../ThemePopup';

/** 点击处理只读 event / id / route，其余字段由各 Menu 列表透传 */
export type MyMenuPressItem = {
  event?: () => void;
  id?: string;
  route?: string;
  [key: string]: unknown;
};

export type MyMenuCardItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
  route?: string;
  value?: string;
  event?: () => void;
};

/**
 * 个人中心各版 Menu 共用
 */
export function useMyMenu() {
  const themePopupRef = useRef<ThemePopupRef>(null);
  const lastNavAtRef = useRef(0);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { theme: themeKey } = useTheme();
  const toast = useToast();
  const userInfo: any = useSelector(
    (state: RootState) => state?.user?.userInfo,
  );

  // 个人中心「主题」一行副文案（与当前主题 key 一致）
  const personalCenterThemeText = useMemo(() => {
    if (themeKey === 'orangeWhite') return t('my.theme.orange');
    if (themeKey === 'blueWhite') return t('my.theme.blue');
    return t('my.theme.greenblack');
  }, [themeKey, t]);

  // 未读消息数量
  const unreadMessageCount = useSelector(
    (state: RootState) => state?.user?.unreadMessageCount || 0,
  );

  // 显示语言选择弹窗
  const toShowLanguageModel = useCallback(() => {
    dispatch(changesShowLanguageModal(true));
  }, [dispatch]);

  // 打开主题选择弹窗
  const openThemeSheet = useCallback(() => {
    themePopupRef.current?.toggleModal?.();
  }, []);

  // 路由跳转
  const pushMenuPath = useCallback((route: string) => {
    const now = Date.now();
    if (now - lastNavAtRef.current < 1000) return;
    lastNavAtRef.current = now;

    const path = route.startsWith('/') ? route : `/${route}`;
    router.push(path as any);
  }, []);

  // 处理菜单点击事件
  const handlePress = useCallback(
    (item: MyMenuPressItem) => {
      if (item.event) {
        item.event();
        return;
      }
      if (item.id === BaseRoute.agent.id) {
        if (userInfo?.type == 150) {
          toast.warn(t('tryAccount.trialAccountWarning'));
          return;
        }
        if (item.route) pushMenuPath(item.route);
      } else if (item.route) {
        pushMenuPath(item.route);
      }
    },
    [userInfo, toast, t, pushMenuPath],
  );

  return {
    unreadMessageCount,
    personalCenterThemeText,
    themePopupRef,
    toShowLanguageModel,
    pushMenuPath,
    openThemeSheet,
    handlePress,
  };
}
