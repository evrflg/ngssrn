import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getActDetail, getActivityCenterList, getReminderCount, getUserDegree, getVips } from '@/api';
import type { RootState } from '@/store/store';

interface UserDegreeInfo {
  curDegreeName: string;
  curDegreeLevel: number;
  curDegreeDepositMoney: number;
  curDegreeBetNum: number;
  newDegreeName: string;
  newDegreeLevel: number;
  newDegreeDepositMoney: number;
  newDegreeBetNum: number;
  nextDegreeDepositMoney: number;
  nextDegreeBetNum: number;
  type: number;
  userDegreeIcon: string;
}

/**
 * GET …/activity/community/status 返回体中的 data 字段。
 * 约定：turntable / redpacketRain 为 **0** 时显示对应入口，**其它数值均不显示**。
 */
export type TurntableRedPacketRainStatus = {
  turntable: number | null;
  redpacketRain: number | null;
};

/** 接口约定：0 显示，其它不显示（兼容字符串 "0"） */
export function isCommunityActivityShownFlag(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  return Number(value) === 0;
}

interface ActiveState {
  curTitle: string;
  actTitle: string,
  curTypeId: number,
  degreeInfo: UserDegreeInfo | null,
  vipList: any,
  activityList: any[] | null,
  baoxiangInfo: any,
  loaded: boolean,
  /** 转盘 / 红包雨活动状态，供 EntryBar 等与弹窗共用 */
  turntableRedPacketStatus: TurntableRedPacketRainStatus | null,
  reminderCount: any
}

const fetchDegreeInfo = () => {
  return new Promise<{ data: UserDegreeInfo }>((resolve) => {
    getUserDegree().then((res: any) => {
      if (res?.data?.data) {
        resolve({ data: res?.data?.data })
      }
    })
  });
}

export const degreeInfoAsync = createAsyncThunk(
  'active/degreeInfo',
  async () => {
    const response = await fetchDegreeInfo();
    return response.data;
  }
);

export const vipListAsync = createAsyncThunk(
  'active/vipList',
  async () => {
    const res = await getVips({ pageSize: 30 });
    if (res?.data?.data) return res.data.data;
    return [];
  }
);

export const activityListAsync = createAsyncThunk(
  'active/activityList',
  async () => {
    const res = await getActivityCenterList();
    return res?.data?.code === 0 ? res.data.data : [];
  }
);
// 获取活动中心中的活动状态
export const getReminderCountAsync = createAsyncThunk(
  'active/getReminderCount',
  async () => {
    const res = await getReminderCount();
    return {data: res?.data?.data};
  }
);

export const baoxiangInfoAsync = createAsyncThunk(
  'active/baoxiangInfo',
  async (_, { getState }) => {
    let activityCenterData: any;
    let baoNum = 0;
    let activityList = (getState() as RootState)?.active?.activityList;
    if (!activityList || activityList.length === 0) {
      const listRes = await getActivityCenterList();
      activityList = listRes?.data?.code === 0 ? listRes?.data?.data : [];
    }
    const safeActivityList = activityList ?? [];
    if (safeActivityList.length > 0) {
      activityCenterData = safeActivityList.find((item: any) => item?.activityType === 1);
    }
    if (activityCenterData) {
      await getActDetail({ id: activityCenterData.id }).then(({ data }) => {
        if (data.code === 0) {
          const filteredTreasures = data.data.optional?.treasures?.filter((tt: any) => tt.status === 1)
          baoNum = Array.isArray(filteredTreasures) ? filteredTreasures.length : 0;
        }
      });
    }

    return { activityCenterData, baoNum };
  }
);

const initialState: ActiveState = {
  curTitle: '',
  actTitle: '',
  curTypeId: 0,
  degreeInfo: null,
  vipList: null,
  activityList: null,
  loaded: false,
  turntableRedPacketStatus: null,
  baoxiangInfo: {
    activityCenterData: null,
    baoNum: 0
  },
  reminderCount: null
};

const activeSlice = createSlice({
  name: 'active',
  initialState,
  reducers: {
    setMissionTitle(state, action: PayloadAction<{ title: string }>) {
      state.curTitle = action.payload.title;
    },
    missionTypeId(state, action: PayloadAction<{ typeId: number }>) {
      state.curTypeId = action.payload.typeId;
    },
    setActiveTitle(state, action: PayloadAction<{ title: string }>) {
      state.actTitle = action.payload.title;
    },
    setTurntableAndRedPacketRainStatus(
      state,
      action: PayloadAction<{ turntable?: number; redpacketRain?: number }>,
    ) {
      const p = action.payload;
      state.turntableRedPacketStatus = {
        turntable: p.turntable ?? null,
        redpacketRain: p.redpacketRain ?? null,
      };
    },
    clearTurntableRedPacketStatus(state) {
      state.turntableRedPacketStatus = null;
    },
    clearReminderCount(state) {
      state.reminderCount = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(degreeInfoAsync.fulfilled, (state, action) => {
        if (action.payload) {
          state.degreeInfo = action.payload;
        }
        state.loaded = true;
      })
      .addCase(vipListAsync.fulfilled, (state, action) => {
        if (action.payload) {
          state.vipList = action.payload;
        }
        state.loaded = true;
      })
      .addCase(baoxiangInfoAsync.fulfilled, (state, action) => {
        if (action.payload) {
          state.baoxiangInfo = action.payload;
        }
        state.loaded = true;
      })
      .addCase(activityListAsync.fulfilled, (state, action) => {
        if (action.payload) {
          state.activityList = action.payload;
        }
        state.loaded = true;
      })
      .addCase(getReminderCountAsync.fulfilled, (state, action) => {
        // 接口返回结构：{ data: <any> }
        state.reminderCount = action.payload?.data ?? null;
      });
  }
});

export const {
  setMissionTitle,
  missionTypeId,
  setActiveTitle,
  setTurntableAndRedPacketRainStatus,
  clearTurntableRedPacketStatus,
  clearReminderCount,
} = activeSlice.actions;
export default activeSlice.reducer;