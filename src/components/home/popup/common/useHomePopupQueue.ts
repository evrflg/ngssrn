import { useCallback, useReducer } from "react";

// 弹窗唯一标识，如 "downloadGuide" | "publicity" | "telegram" | "discount"
export type HomePopupName = string;

// 队列项：resolvedAt 为资格判断完成时间戳，谁先完成谁排前面
export interface HomePopupQueueItem<T = unknown> {
  name: HomePopupName;
  data?: T;
  resolvedAt: number;
}

// 按 resolvedAt 升序排序
const sortByResolved = <T,>(a: HomePopupQueueItem<T>, b: HomePopupQueueItem<T>) =>
  a.resolvedAt - b.resolvedAt;

type QueueState<T> = {
  queue: Array<HomePopupQueueItem<T>>;
  initialized: boolean;
};

type QueueAction<T> =
  | { type: "replace"; payload: Array<HomePopupQueueItem<T>> }
  | { type: "reset" }
  | { type: "close"; name?: HomePopupName }
  | { type: "remove"; name: HomePopupName }
  | { type: "enqueue"; item: HomePopupQueueItem<T> };

function queueReducer<T>(
  state: QueueState<T>,
  action: QueueAction<T>,
): QueueState<T> {
  switch (action.type) {
    case "replace": {
      const nextQueue = [...action.payload];
      nextQueue.sort(sortByResolved as (a: HomePopupQueueItem<T>, b: HomePopupQueueItem<T>) => number);
      return { queue: nextQueue, initialized: true };
    }
    case "reset":
      return { queue: [], initialized: false };
    case "close": {
      const { name } = action;
      if (!state.queue.length) return state;
      if (name != null && state.queue[0]?.name !== name) return state;
      return { ...state, queue: state.queue.slice(1) };
    }
    case "remove": {
      const hasTarget = state.queue.some((item) => item.name === action.name);
      if (!hasTarget) return state;
      return {
        ...state,
        queue: state.queue.filter((item) => item.name !== action.name),
      };
    }
    case "enqueue": {
      const { item } = action;
      if (state.queue.some((popup) => popup.name === item.name)) return state;
      const nextQueue = [...state.queue, item];
      nextQueue.sort(sortByResolved as (a: HomePopupQueueItem<T>, b: HomePopupQueueItem<T>) => number);
      return { ...state, queue: nextQueue };
    }
    default:
      return state;
  }
}

const initial: QueueState<unknown> = { queue: [], initialized: false };

export const useHomePopupQueue = <T = unknown>() => {
  const [state, dispatch] = useReducer(
    queueReducer as (s: QueueState<T>, a: QueueAction<T>) => QueueState<T>,
    initial as QueueState<T>,
  );
  const { queue, initialized } = state;

  // 当前展示的弹窗信息
  const currentPopup = queue[0] ?? null;

  // 判断指定 name 是否为当前应展示的弹窗
  const isCurrentPopup = useCallback(
    (name: HomePopupName) => currentPopup?.name === name,
    [currentPopup?.name],
  );

  // 当前队列的 name 列表，便于调试
  // const queueNames = useMemo(() => queue.map((item) => item.name), [queue]);
  // console.log("弹窗显示", queueNames);

  const resetQueue = useCallback(() => dispatch({ type: "reset" }), []);
  const closeCurrentPopup = useCallback((name?: HomePopupName) => {
    dispatch({ type: "close", name });
  }, []);
  const removePopup = useCallback((name: HomePopupName) => {
    dispatch({ type: "remove", name });
  }, []);
  const enqueuePopup = useCallback((item: HomePopupQueueItem<T>) => {
    dispatch({ type: "enqueue", item });
  }, []);
  const replaceQueue = useCallback((items: Array<HomePopupQueueItem<T>>) => {
    dispatch({ type: "replace", payload: items });
  }, []);

  return {
    queue,
    currentPopup,
    initialized,
    isCurrentPopup,
    enqueuePopup,
    replaceQueue,
    closeCurrentPopup,
    removePopup,
    resetQueue,
  };
};
