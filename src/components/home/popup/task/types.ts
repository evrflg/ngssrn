export enum DialogShowTiming {
  BEFORE_LOGIN = 0,
  AFTER_LOGIN = 1,
}

export enum TaskType {
  NEW_MEMBER_BONUS = 0,
  DAILY = 1,
  WEEKLY = 2,
}

export enum DialogShowType {
  NOT_SHOW = 0,
  HIGH_FREQUENCY = 1,
  ONCE_ONLY = 2,
  ONCE_A_DAY = 3,
}

export interface TaskRewardRule {
  maxStepValue?: string | number;
  rewardAmount?: number | null;
}

export interface TaskDialogData {
  taskType: TaskType;
  title: string;
  maxReward: string;
  totalCount: number;
  finishedCount: number;
  tasks: Array<{
    id: string;
    name: string;
    taskTarget?: number;
    rewardRules?: TaskRewardRule[];
    isCompleted: boolean;
  }>;
  dialogShowTiming: DialogShowTiming;
  dialogShowType: DialogShowType;
}
