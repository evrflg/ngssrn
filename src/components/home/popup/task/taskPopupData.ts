import { getTaskPageList } from "@/api";
import {
  fetchDictData,
  getTaskNameFromDict,
} from "@/components/active/mission/service";
import i18n from "@/lang/i18n";
import {
  DialogShowTiming,
  DialogShowType,
  TaskDialogData,
  TaskType,
} from "./types";

const formatMoney = (value: number) => {
  if (!Number.isFinite(value)) return "0.00";
  return value.toFixed(2);
};

const getTaskTitle = async (taskType: TaskType): Promise<string> => {
  if(taskType === TaskType.NEW_MEMBER_BONUS) {
    return i18n.t('mission.NEW_MEMBER_BONUS-task')
  }

  const taskTypeDict = await fetchDictData("task_type");
  const dictItem = taskTypeDict.find(
    (item: any) => Number(item.value) === taskType,
  );
  return dictItem?.label ?? "";
};

export async function fetchTaskDialogData(
  taskType: TaskType,
): Promise<TaskDialogData | null> {
  try {
    const title = await getTaskTitle(taskType);
    const { data: response } = await getTaskPageList({
      pageNo: 1,
      pageSize: 100,
      taskType,
    });

    if (
      response?.code !== 0 ||
      !Array.isArray(response?.data?.list) ||
      response.data.list.length === 0
    ) {
      return null;
    }

    const list = response.data.list;
    const statistic = response.data.statistic;

    let maxReward = 0;
    for (const task of list) {
      const rules = Array.isArray(task?.rewardRules) ? task.rewardRules : [];
      for (const rule of rules) {
        maxReward += Number(rule?.rewardAmount ?? 0);
      }
    }

    const tasks = await Promise.all(
      list.map(async (task: any) => {
        const name = await getTaskNameFromDict(task.taskType, task.taskTarget);
        return {
          id: String(task.id),
          name: name ?? '',
          taskTarget: task.taskTarget,
          rewardRules: Array.isArray(task.rewardRules) ? task.rewardRules : [],
          isCompleted: task.executeStatus === 1,
        };
      }),
    );

    const firstTask = list[0];

    return {
      taskType,
      title,
      maxReward: formatMoney(maxReward),
      totalCount: statistic?.total ?? list.length,
      finishedCount:
        statistic?.finished ?? tasks.filter((item) => item.isCompleted).length,
      tasks,
      dialogShowTiming: (firstTask?.dialogShowTiming ??
        DialogShowTiming.BEFORE_LOGIN) as DialogShowTiming,
      dialogShowType: (firstTask?.dialogShowType ??
        DialogShowType.NOT_SHOW) as DialogShowType,
    };
  } catch (error) {
    console.error("[task-popup] fetchTaskDialogData failed:", error);
    return null;
  }
}
