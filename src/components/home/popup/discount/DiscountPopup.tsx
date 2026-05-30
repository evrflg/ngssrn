import { checkBonus, getBonus } from "@/api";
import { Bonus, BonusType } from "@/api/types/wallet";
import { RootState } from "@/store/store";
import { showErrorMessage } from "@/utils/utils";
import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MultiplierPopup } from "./MultiplierPopup";
import { NormalGiftPopup } from "./NormalGiftPopup";
import { PopupModal } from "../common/PopupModal";
import CommonModal from "@/components/common/modal/CommonModal";

type DiscountStep = "normal" | "multiplier" | null;

interface DiscountPopupProps {
  // 首页队列控制后的受控显隐
  visible?: boolean;
  // 当前优惠弹窗完整关闭后，通知首页队列移除自己
  onClose?: () => void;
  // 当前组件异步判断完“是否可展示”后，上报给首页队列
  onQueueStateChange?: (canShow: boolean) => void;
}

/**
 * 首页优惠弹窗容器。
 */
export const DiscountPopup = ({
  visible,
  onClose,
  onQueueStateChange,
}: DiscountPopupProps = {}) => {
  const pathname = usePathname();
  const userInfo: any = useSelector(
    (state: RootState) => state?.user?.userInfo,
  );

  // 当前命中的奖励数据，普通优惠和加倍优惠都会用到
  const [data, setData] = useState<Bonus | null>(null);
  // 当前登录态下是否已经展示过优惠弹窗
  const [hasDisplayedDiscount, setHasDisplayedDiscount] = useState(false);
  // 本轮资格判断是否已完成
  const [loaded, setLoaded] = useState(false);
  // 当前业务上是否允许优惠弹窗进入首页队列
  const [canShowPopup, setCanShowPopup] = useState(false);
  // 首次命中的可展示优惠类型
  const [eligibleBonusType, setEligibleBonusType] = useState<BonusType | null>(null);
  // 当前流程处于普通优惠、加倍优惠还是未展示
  const [currentStep, setCurrentStep] = useState<DiscountStep>(null);

  /**
   * 根据奖励类型打开对应的优惠弹窗步骤。
   * @param {BonusType} type 当前要展示的优惠类型，`Normal` 表示普通领取，`Multiplier` 表示加倍领取。
   */
  const openPopup = (type: BonusType) => {
    if (type === BonusType.Normal) {
      setCurrentStep("normal");
    } else {
      setCurrentStep("multiplier");
    }
  };

  /**
   * 请求指定类型的可领奖励数据。
   * @param {BonusType} type 奖励类型，`0` 表示普通奖励，`1` 表示加倍奖励。
   * @returns {Promise<boolean>} 是否成功拿到该类型的奖励数据。
   */
  const getBonusData = async (type: BonusType): Promise<boolean> => {
    try {
      const bonusInfo = await checkBonus(type).then(
        ({ data: response }) => response?.data,
      );

      if (bonusInfo) {
        setData(bonusInfo);
        return true;
      }
    } catch { }

    return false;
  };

  /**
   * 重置优惠弹窗内部流程状态。
   * 这里只负责本组件内部状态复位，不直接处理首页队列。
   */
  const reset = () => {
    setCurrentStep(null);
    setData(null);
  };

  /**
   * 结束整条优惠弹窗链路，并通知首页队列移除当前项。
   * `delayMs` 用于给关闭动画留一点缓冲时间。
   * @param {number} delayMs 延迟关闭的毫秒数。
   */
  const finishPopupFlow = (delayMs = 0) =>
    new Promise<void>((resolve) => {
      const finish = () => {
        // 只有整条优惠链路真正结束时，才标记“本轮已经展示过”
        setHasDisplayedDiscount(true);
        reset();
        onClose?.();
        resolve();
      };

      if (delayMs > 0) {
        setTimeout(finish, delayMs);
        return;
      }

      finish();
    });

  /**
   * 关闭优惠弹窗。
   * 如果当前是普通优惠阶段，会继续检查是否还有加倍优惠可展示；
   * 如果没有后续步骤，再真正重置状态并通知首页队列移除自己。
   */
  const onClosePop = async () => {
    if (currentStep === "normal") {
      // 当前展示的是普通领取，继续检查是否有加倍领取
      const hasMultiplierData = await getBonusData(BonusType.Multiplier);
      if (hasMultiplierData) {
        setEligibleBonusType(BonusType.Multiplier);
        openPopup(BonusType.Multiplier);
      } else {
        await finishPopupFlow();
      }
    } else {
      await finishPopupFlow(200);
    }
  };

  /**
   * 执行普通优惠领取。
   * 领取普通奖励的同时会预取加倍奖励数据，方便后续无缝切换到下一步。
   */
  const onNormalClaim = async () => {
    if (!data) return;

    const [
      {
        data: { data: success, msg },
      },
      hasMultiplierData,
    ] = await Promise.all([
      getBonus(data.id, BonusType.Normal),
      getBonusData(BonusType.Multiplier), // 领取普通奖金的同时请求加倍奖金数据
    ]);

    if (success) {
      if (hasMultiplierData) {
        setEligibleBonusType(BonusType.Multiplier);
        openPopup(BonusType.Multiplier);
      } else {
        await onClosePop();
      }
      return;
    }

    if (msg) {
      showErrorMessage(msg);
      await onClosePop();
    }
  };

  /**
   * 执行加倍优惠领取。
   * 当前流程结束后跳转到充值页，后续由充值链路完成奖金发放。
   */
  const onMultiplierClaim = async () => {
    const offerId = data?.id;

    await onClosePop();

    // 延迟到关闭动画执行完成导航去充值，充值后系统自动派发奖金
    router.push({
      pathname: "/wallet/recharge",
      params: {
        offerId,
      },
    });
  };

  /**
   * 检查当前用户是否存在可展示的优惠奖励。
   * 会优先检查普通奖励，若没有再检查加倍奖励。
   * @returns {Promise<BonusType | null>} 命中的奖励类型；如果没有可展示奖励则返回 `null`。
   */
  const checkOpenPopup = async (): Promise<BonusType | null> => {
    if (!userInfo?.isLogin || pathname !== "/home" || hasDisplayedDiscount) {
      return null;
    }

    try {
      // 请求接口时优先检查普通奖励，再检查加倍奖励
      const hasNormalData = await getBonusData(BonusType.Normal);
      if (hasNormalData) {
        return BonusType.Normal;
      }

      const hasMultiplierData = await getBonusData(BonusType.Multiplier);
      if (hasMultiplierData) {
        return BonusType.Multiplier;
      }

      return null;
    } catch {
      return null;
    }
  };

  // 监听登录态和路由变化，重新判断当前是否存在可展示的优惠奖励
  useEffect(() => {
    let cancelled = false;

    const checkEligibility = async () => {
      loaded && setLoaded(false);

      const nextBonusType = await checkOpenPopup();

      if (cancelled) return;

      setEligibleBonusType(nextBonusType);
      setCanShowPopup(nextBonusType !== null);
      setLoaded(true);
    };

    checkEligibility();

    return () => {
      cancelled = true;
    };
  }, [hasDisplayedDiscount, pathname, userInfo?.isLogin]);

  // 只有资格判断真正结束后，才把结果同步给首页弹窗队列
  useEffect(() => {
    if (!loaded) return;
    onQueueStateChange?.(canShowPopup);
  }, [canShowPopup, loaded, onQueueStateChange]);

  // 首页队列轮到自己后，再根据首次命中的奖励类型真正打开对应步骤
  useEffect(() => {
    if (!visible || currentStep !== null || eligibleBonusType === null) return;
    openPopup(eligibleBonusType);
  }, [currentStep, eligibleBonusType, visible]);

  // 真正展示时要同时满足：首页队列轮到自己 + 已打开弹窗步骤 + 当前业务允许展示
  const isVisible = !!visible && currentStep !== null && canShowPopup;

  if (!isVisible) return null;

  return (
    <CommonModal
      id="discount-popup"
      visible={isVisible}
      onClose={onClosePop}
      contentStyle={{ justifyContent: "center" }}
      extendBottomSafeArea={false}
    >
      {/* 普通优惠弹窗 */}
      {currentStep === "normal" && (
        <NormalGiftPopup
          data={data}
          onNormalClaim={onNormalClaim}
        />
      )}

      {/* 加倍优惠弹窗 */}
      {currentStep === "multiplier" && (
        <MultiplierPopup
          data={data}
          onMultiplierClaim={onMultiplierClaim}
        />
      )}
    </CommonModal>
  );
};
