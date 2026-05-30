import DownloadGuide from "@/components/home/popup/downloadGuide/DownloadGuide";
import { DiscountPopup } from "@/components/home/popup/discount/DiscountPopup";
import { TelegramPopup } from "@/components/home/popup/telegram/TelegramPopup";
import { PublicitiesList } from "@/components/home/popup/publicitiesList/PublicitiesList";
import {
  AfterLoginTaskPopup,
  BeforeLoginTaskPopup,
} from "@/components/home/popup/task/TaskPopup";
import { TaskType } from "@/components/home/popup/task/types";
import {
  type HomePopupQueueItem,
  HomePopupName,
  useHomePopupQueue,
} from "@/components/home/popup/common/useHomePopupQueue";
import {
  consumeDownloadGuideRequest,
  registerShowDownloadGuideNowListener,
} from "@/components/home/popup/downloadGuide/hook/requestDownloadGuideOnHome";
import { RootState } from "@/store/store";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

const isWeb = Platform.OS === "web";
const MemoDownloadGuide = memo(DownloadGuide);
const MemoTelegramPopup = memo(TelegramPopup);
const MemoPublicitiesList = memo(PublicitiesList);
const MemoDiscountPopup = memo(DiscountPopup);

// 参与首轮资格收集的弹窗，顺序即展示优先级
function getExpectedPopupNames(isWeb: boolean, isLoggedIn: boolean): HomePopupName[] {
  const list: HomePopupName[] = isWeb ? ["downloadGuide", "publicity"] : ["publicity"];
  if (isLoggedIn) {
    list.push(
      "discount",
      "task-newcomer",
      "task-daily",
      "task-weekly",
      "telegram",
    );
  } else {
    list.push("task-bl-newcomer", "task-bl-daily", "task-bl-weekly");
  }
  return list;
}

interface PendingPopupReport {
  canShow: boolean;
  resolvedAt: number;
}

type PopupComponent = React.ComponentType<{
  onClose?: () => void;
  onQueueStateChange?: (canShow: boolean) => void;
  visible?: boolean;
}>;

interface PopupControlProps {
  onClose?: () => void;
  onQueueStateChange?: (canShow: boolean) => void;
  visible?: boolean;
}

const BeforeLoginNewcomerTask = memo((props: PopupControlProps) => (
  <BeforeLoginTaskPopup {...props} taskType={TaskType.NEW_MEMBER_BONUS} />
));
const BeforeLoginDailyTask = memo((props: PopupControlProps) => (
  <BeforeLoginTaskPopup {...props} taskType={TaskType.DAILY} />
));
const BeforeLoginWeeklyTask = memo((props: PopupControlProps) => (
  <BeforeLoginTaskPopup {...props} taskType={TaskType.WEEKLY} />
));
const AfterLoginNewcomerTask = memo((props: PopupControlProps) => (
  <AfterLoginTaskPopup {...props} taskType={TaskType.NEW_MEMBER_BONUS} />
));
const AfterLoginDailyTask = memo((props: PopupControlProps) => (
  <AfterLoginTaskPopup {...props} taskType={TaskType.DAILY} />
));
const AfterLoginWeeklyTask = memo((props: PopupControlProps) => (
  <AfterLoginTaskPopup {...props} taskType={TaskType.WEEKLY} />
));

export default function HomePopup() {
  // 是否已登录
  const isLoggedIn = useSelector((state: RootState) => !!state?.user?.userInfo?.isLogin);

  // 首页队列相关操作
  const {
    replaceQueue,
    enqueuePopup,
    removePopup,
    initialized,
    isCurrentPopup,
    closeCurrentPopup,
    resetQueue,
  } = useHomePopupQueue();
  // 参与首轮资格收集的弹窗，顺序即展示优先级
  const expectedPopupNames = useMemo(() => getExpectedPopupNames(isWeb, isLoggedIn), [isLoggedIn]);
  // 记录每个弹窗的资格判断结果，避免重复请求s
  const pendingReportsRef = useRef<Partial<Record<HomePopupName, PendingPopupReport>>>({});
  // 是否已收集完首轮资格，避免重复入队
  const hasBootstrappedRef = useRef(false);
  const forceShowDownloadGuideRef = useRef(false);
  /** 本轮已关闭过的弹窗，避免资格分批就绪时 replaceQueue 再次把已关弹窗插回队首 */
  const dismissedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 每次重新进入首页弹窗挂载流程时重置资格与队列
    pendingReportsRef.current = {};
    hasBootstrappedRef.current = false;
    dismissedRef.current.clear();
    resetQueue();
  }, [isLoggedIn, resetQueue]);

  // 已在首页时点击底部 APP_DOWNLOAD：直接入队并强制展示下载引导
  useEffect(() => {
    const unregister = registerShowDownloadGuideNowListener(() => {
      dismissedRef.current.delete("downloadGuide");
      forceShowDownloadGuideRef.current = true;
      removePopup("downloadGuide");
      enqueuePopup({ name: "downloadGuide", resolvedAt: 0 });
    });
    return unregister;
  }, [enqueuePopup, removePopup]);

  // 关闭回调：按 name 分发，稳定引用
  const closeHandlers = useMemo(
    () => ({
      downloadGuide: () => {
        dismissedRef.current.add("downloadGuide");
        forceShowDownloadGuideRef.current = false;
        closeCurrentPopup("downloadGuide");
      },
      publicity: () => {
        dismissedRef.current.add("publicity");
        closeCurrentPopup("publicity");
      },
      telegram: () => {
        dismissedRef.current.add("telegram");
        closeCurrentPopup("telegram");
      },
      discount: () => {
        dismissedRef.current.add("discount");
        closeCurrentPopup("discount");
      },
      "task-bl-newcomer": () => {
        dismissedRef.current.add("task-bl-newcomer");
        closeCurrentPopup("task-bl-newcomer");
      },
      "task-bl-daily": () => {
        dismissedRef.current.add("task-bl-daily");
        closeCurrentPopup("task-bl-daily");
      },
      "task-bl-weekly": () => {
        dismissedRef.current.add("task-bl-weekly");
        closeCurrentPopup("task-bl-weekly");
      },
      "task-newcomer": () => {
        dismissedRef.current.add("task-newcomer");
        closeCurrentPopup("task-newcomer");
      },
      "task-daily": () => {
        dismissedRef.current.add("task-daily");
        closeCurrentPopup("task-daily");
      },
      "task-weekly": () => {
        dismissedRef.current.add("task-weekly");
        closeCurrentPopup("task-weekly");
      },
    }),
    [closeCurrentPopup],
  );

  // 首轮按优先级顺序入队：高优先级资格一就绪即可展示，不必等最慢的接口；resolvedAt 用列表下标保证排序稳定
  const reportQueueState = useCallback(
    (name: HomePopupName, canShow: boolean) => {
      if (!hasBootstrappedRef.current) {
        const previousReport = pendingReportsRef.current[name];
        pendingReportsRef.current[name] = {
          canShow,
          resolvedAt: previousReport?.resolvedAt ?? Date.now(),
        };

        const hasAllReports = expectedPopupNames.every(
          (popupName) => pendingReportsRef.current[popupName],
        );

        const forceDownloadGuideFirst = hasAllReports ? consumeDownloadGuideRequest() : false;
        if (forceDownloadGuideFirst) forceShowDownloadGuideRef.current = true;

        const items: HomePopupQueueItem[] = [];
        for (const popupName of expectedPopupNames) {
          if (dismissedRef.current.has(popupName)) continue;

          const report = pendingReportsRef.current[popupName];
          if (!report) continue;

          const include =
            report.canShow || (forceDownloadGuideFirst && popupName === "downloadGuide");
          if (!include) continue;

          const priority = expectedPopupNames.indexOf(popupName);
          items.push({
            name: popupName,
            resolvedAt: forceDownloadGuideFirst && popupName === "downloadGuide" ? -1 : priority,
          });
        }

        replaceQueue(items);

        if (hasAllReports) {
          hasBootstrappedRef.current = true;
        }
        return;
      }

      if (canShow) {
        if (dismissedRef.current.has(name)) return;
        enqueuePopup({
          name,
          resolvedAt: expectedPopupNames.indexOf(name),
        });
        return;
      }

      removePopup(name);
    },
    [enqueuePopup, expectedPopupNames, removePopup, replaceQueue],
  );

  // 上报资格到队列：按 name 分发，downloadGuide 仅 Web 上报
  const queueStateHandlers = useMemo(
    () => ({
      downloadGuide: (canShow: boolean) => {
        if (!isWeb) return;
        reportQueueState("downloadGuide", canShow);
      },
      publicity: (canShow: boolean) => reportQueueState("publicity", canShow),
      telegram: (canShow: boolean) => reportQueueState("telegram", canShow),
      discount: (canShow: boolean) => reportQueueState("discount", canShow),
      "task-bl-newcomer": (canShow: boolean) =>
        reportQueueState("task-bl-newcomer", canShow),
      "task-bl-daily": (canShow: boolean) =>
        reportQueueState("task-bl-daily", canShow),
      "task-bl-weekly": (canShow: boolean) =>
        reportQueueState("task-bl-weekly", canShow),
      "task-newcomer": (canShow: boolean) =>
        reportQueueState("task-newcomer", canShow),
      "task-daily": (canShow: boolean) =>
        reportQueueState("task-daily", canShow),
      "task-weekly": (canShow: boolean) =>
        reportQueueState("task-weekly", canShow),
    }),
    [reportQueueState],
  );

  const popupConfigs = useMemo<
    Array<{ name: HomePopupName; Component: PopupComponent; show: boolean }>
  >(
    () => [
      // 下载引导弹窗
      { name: "downloadGuide", Component: MemoDownloadGuide, show: isWeb },
      // 宣传弹窗
      { name: "publicity", Component: MemoPublicitiesList, show: true },
      // 任务弹窗（登录前）
      { name: "task-bl-newcomer", Component: BeforeLoginNewcomerTask, show: !isLoggedIn },
      { name: "task-bl-daily", Component: BeforeLoginDailyTask, show: !isLoggedIn },
      { name: "task-bl-weekly", Component: BeforeLoginWeeklyTask, show: !isLoggedIn },
      // 优惠弹窗
      { name: "discount", Component: MemoDiscountPopup, show: isLoggedIn },
      // 任务弹窗（登录后）
      { name: "task-newcomer", Component: AfterLoginNewcomerTask, show: isLoggedIn },
      { name: "task-daily", Component: AfterLoginDailyTask, show: isLoggedIn },
      { name: "task-weekly", Component: AfterLoginWeeklyTask, show: isLoggedIn },
      // 电报弹窗
      { name: "telegram", Component: MemoTelegramPopup, show: isLoggedIn },
    ],
    [isLoggedIn],
  );

  return (
    <View style={styles.popupHost} pointerEvents="box-none">
      {popupConfigs.map(
        ({ name, Component, show }) =>
          show && (
            <Component
              key={name}
              onClose={closeHandlers[name as keyof typeof closeHandlers]}
              onQueueStateChange={queueStateHandlers[name as keyof typeof queueStateHandlers]}
              visible={initialized && isCurrentPopup(name)}
              {...(name === "downloadGuide" && {
                forceShow: forceShowDownloadGuideRef.current,
              })}
            />
          ),
      )}
    </View>
  );
}

/** 与 VIP 规则弹层一致：全屏叠层挂在首页树内，避免子 Modal 与导航转场叠出闪屏 */
const styles = StyleSheet.create({
  popupHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    ...Platform.select({
      android: { elevation: 90 },
      default: {},
    }),
  },
});
