import { replaceHomeAfterAuthLoss } from "@/api/common/client";
import { accInfoAsync } from "@/store/user/userSlice";
import { RootState, AppDispatch } from "@/store/store";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

interface Options {
  isPwdSet: boolean;
  onShowPwdModal: () => void;
  onClosePwdModal: () => void;
  onCloseWithdrawPwdModal: () => void;
}

/**
 * 提现页认证逻辑：
 * 1. focus 时刷新 accInfo
 * 2. 未设提现密码时弹引导弹窗（可通过 skipPwdModal=1 跳过一次）
 * 3. 被挤下线后关闭弹窗并跳首页
 */
export function useWithdrawAuth({
  isPwdSet,
  onShowPwdModal,
  onClosePwdModal,
  onCloseWithdrawPwdModal,
}: Options) {
  const dispatch: AppDispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state?.user?.userInfo);
  const session = useSelector((state: RootState) => state?.user?.session);
  const { skipPwdModal } = useLocalSearchParams<{ skipPwdModal?: string }>();
  const consumedSkipParamRef = useRef(false);
  const withdrawWasAuthedRef = useRef(false);

  // skipPwdModal 变化时重置消耗标记
  useEffect(() => {
    if (skipPwdModal !== "1") consumedSkipParamRef.current = false;
  }, [skipPwdModal]);

  // focus 时刷新账户信息 + 按需弹密码引导
  useFocusEffect(
    useCallback(() => {
      if (!userInfo?.isLogin || !session?.accessToken) return;
      dispatch(accInfoAsync());
      if (skipPwdModal === "1" && !consumedSkipParamRef.current) {
        consumedSkipParamRef.current = true;
        onClosePwdModal();
        return;
      }
      if (!isPwdSet) onShowPwdModal();
    }, [dispatch, isPwdSet, skipPwdModal, userInfo?.isLogin, session?.accessToken]),
  );

  // 登录态变化：挤下线后关弹窗 + 跳首页
  useEffect(() => {
    const authed = !!(userInfo?.isLogin && session?.accessToken);
    if (authed) {
      withdrawWasAuthedRef.current = true;
      return;
    }
    onClosePwdModal();
    onCloseWithdrawPwdModal();
    if (withdrawWasAuthedRef.current) {
      withdrawWasAuthedRef.current = false;
      replaceHomeAfterAuthLoss();
    }
  }, [userInfo?.isLogin, session?.accessToken]);

  return { userInfo, session };
}
