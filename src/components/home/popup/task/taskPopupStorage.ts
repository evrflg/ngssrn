import { getStoreJson, setStoreJson } from "@/utils/storage";
import { DialogShowTiming, DialogShowType, TaskType } from "./types";

const TASK_POPUP_PREFIX = "task-popup-dismiss";

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getStorageKey = (taskType: TaskType, timing: DialogShowTiming) =>
  `${TASK_POPUP_PREFIX}-${timing}-${taskType}`;

export async function shouldShowTaskPopup(
  taskType: TaskType,
  dialogShowType: DialogShowType,
  timing: DialogShowTiming,
): Promise<boolean> {
  if (dialogShowType === DialogShowType.NOT_SHOW) return false;
  if (dialogShowType === DialogShowType.HIGH_FREQUENCY) return true;

  const key = getStorageKey(taskType, timing);
  const saved = await getStoreJson(key);
  if (dialogShowType === DialogShowType.ONCE_ONLY) {
    return !saved;
  }
  if (dialogShowType === DialogShowType.ONCE_A_DAY) {
    return saved !== getToday();
  }
  return true;
}

export async function dismissTaskPopup(
  taskType: TaskType,
  dialogShowType: DialogShowType,
  todayNotShowAnymore: boolean,
  timing: DialogShowTiming,
): Promise<void> {
  const key = getStorageKey(taskType, timing);

  if (dialogShowType === DialogShowType.ONCE_ONLY) {
    await setStoreJson(key, "dismissed");
    return;
  }
  if (dialogShowType === DialogShowType.ONCE_A_DAY) {
    await setStoreJson(key, getToday());
    return;
  }
  if (dialogShowType === DialogShowType.HIGH_FREQUENCY && todayNotShowAnymore) {
    await setStoreJson(key, getToday());
  }
}

export async function isTaskPopupDismissedToday(
  taskType: TaskType,
  timing: DialogShowTiming,
): Promise<boolean> {
  const key = getStorageKey(taskType, timing);
  const saved = await getStoreJson(key);
  return saved === getToday();
}
