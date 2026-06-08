import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAccInfo,
  fetchConfig,
  fetchFinanceOverview as fetchFinanceOverviewAPI,
  fetchSwitches,
  fetchUnreadMessageCount as fetchUnreadMessageCountAPI,
  fetchSiteDataList as fetchSiteDataListAPI,
} from "./userAPI";
import {
  getStorage,
  getStoreJson,
  setStorage,
  setStoreJson,
  setSessionCookie,
  getSessionCookie,
  deleteSessionCookie,
} from "@/utils/storage";
import { markActiveLoginSession, setConfigSession } from "@/api/common/client";
import { getInviteOverview } from "@/api/post/my";

interface UserState {
  theme: string;
  userInfo: any;
  userProfile: any;
  cfg_site_base: any;
  cfg_global_switch: any;
  lan: string;
  showLanguageModal: boolean;
  firstDepositRefund: any;
  showFirstDepoRefundPop: boolean;
  isNeedUpgrade: boolean;
  session: any;
  lastLogin: string;
  unreadMessageCount: number;
  siteDataList: any[];
  promotionLink: string;
  isShowTestUserPopup: boolean;
  financeOverview: any;
}

const initialState: UserState = {
  theme: "greenBlack", //主题
  userInfo: {}, //用户数据
  userProfile: {
    name: "", //用户名
    money: "", //余额
    bonus: "", //彩金
  }, //用户资料
  cfg_site_base: {}, //开关配置
  cfg_global_switch: {}, //全局开关配置
  lan: "EN", //语言
  showLanguageModal: false, //是否展示语言弹窗
  firstDepositRefund: {},
  showFirstDepoRefundPop: false,
  isNeedUpgrade: false,
  session: {},
  lastLogin: "",
  unreadMessageCount: 0,
  siteDataList: [],
  promotionLink: "",
  isShowTestUserPopup: false,
  financeOverview: null,
};

export const accInfoAsync = createAsyncThunk("user/fetchAccinfo", async () => {
  let response: any = await fetchAccInfo();
  if (response.data?.member?.type > 2) {
    response.data.isTestUser = true;
  } else {
    response.data.isTestUser = false;
  }
  const lastLogin = await getStorage("lastLogin");
  return { ...response.data, lastLogin };
});

export const configAsync = createAsyncThunk("user/fetchConfig", async () => {
  const response = await fetchConfig();
  return response.data;
});
export const switchesAsync = createAsyncThunk(
  "user/fetchSwitches",
  async () => {
    const response = await fetchSwitches();
    return response.data;
  },
);

export const sessionStateAsync = createAsyncThunk("user/session", async () => {
  // 先从 AsyncStorage 读取
  const stored = await getStoreJson("session");
  if (stored && stored.accessToken) {
    return stored;
  }

  // Web 场景下再尝试从 Cookie 读取（用于 Safari 与 PWA 共享登录状态）
  const cookieSession = getSessionCookie();
  if (cookieSession && cookieSession.accessToken) {
    return cookieSession;
  }

  return stored;
});

export const fetchUnreadMessageCount = createAsyncThunk(
  "user/fetchUnreadMessageCount",
  async () => {
    const response = await fetchUnreadMessageCountAPI();
    return response.data;
  },
);

export const fetchSiteDataList = createAsyncThunk(
  "user/fetchSiteDataList",
  async () => {
    const response = await fetchSiteDataListAPI();
    return response.data;
  },
);

export const fetchPromotionLink = createAsyncThunk(
  "user/fetchPromotionLink",
  async () => {
    const response = await getInviteOverview();
    return response?.data?.data?.promLink || "";
  },
);

export const fetchFinanceOverview = createAsyncThunk(
  "user/fetchFinanceOverview",
  async (force: boolean = false, { getState }: any) => {
    const state = getState() as { user?: UserState };
    if (!force && state?.user?.financeOverview) {
      return state.user.financeOverview;
    }
    const response = await fetchFinanceOverviewAPI();
    return response.data;
  },
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    changeTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
    changesShowLanguageModal: (state, action: PayloadAction<boolean>) => {
      state.showLanguageModal = action.payload;
    },
    changeFirstDepoRefundPopStatus: (state, action: PayloadAction<boolean>) => {
      state.showFirstDepoRefundPop = action.payload;
    },
    changeSessionState: (state, action: PayloadAction<any>) => {
      state.session = action.payload;

      if (action.payload?.accessToken) {
        // 更新请求头使用的 token
        setConfigSession(action.payload.accessToken);
        // 同步到 Web Cookie（Safari <-> PWA 共享）
        setSessionCookie(action.payload);
      } else {
        // 清除登录态时，移除 Cookie
        deleteSessionCookie();
      }

      getStoreJson("session").then((res) => {
        if (JSON.stringify(res) !== JSON.stringify(action.payload)) {
          setStoreJson("session", action.payload);
        }
      });
    },
    setLastLogin: (state, action: PayloadAction<string>) => {
      state.lastLogin = action.payload;
      setStorage("lastLogin", action.payload);
    },
    changeUserInfo: (state, action: PayloadAction<any>) => {
      state.userInfo = action.payload;
    },
    updateUnreadMessageCount: (state, action: PayloadAction<number>) => {
      state.unreadMessageCount = action.payload;
    },
    changeIsShowTestUserPopup: (state, action: PayloadAction<boolean>) => {
      state.isShowTestUserPopup = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(accInfoAsync.fulfilled, (state, action) => {
      state.userProfile.money = action.payload?.money;
      state.userProfile.bonus = action.payload?.bonus;
      state.userInfo = action.payload;
      if (action.payload?.lastLogin) state.lastLogin = action.payload.lastLogin;
      if (action.payload?.isLogin) {
        markActiveLoginSession();
      }
    });
    builder.addCase(configAsync.fulfilled, (state, action) => {
      state.cfg_site_base = action.payload;
    });
    builder.addCase(switchesAsync.fulfilled, (state, action) => {
      state.cfg_global_switch = action.payload;
    });
    builder.addCase(sessionStateAsync.fulfilled, (state, action) => {
      if (action.payload) {
        state.session = action.payload;
        if (action.payload.accessToken)
          setConfigSession(action.payload.accessToken);
        setStoreJson("session", action.payload);
      }
    });
    builder.addCase(fetchUnreadMessageCount.fulfilled, (state, action) => {
      state.unreadMessageCount = action.payload;
    });
    builder.addCase(fetchSiteDataList.fulfilled, (state, action) => {
      state.siteDataList = action.payload;
    });
    builder.addCase(fetchPromotionLink.fulfilled, (state, action) => {
      state.promotionLink = action.payload;
    });
    builder.addCase(fetchFinanceOverview.fulfilled, (state, action) => {
      state.financeOverview = action.payload;
    });
  },
});

export const {
  changeTheme,
  changesShowLanguageModal,
  changeFirstDepoRefundPopStatus,
  changeSessionState,
  setLastLogin,
  changeUserInfo,
  updateUnreadMessageCount,
  changeIsShowTestUserPopup,
} = userSlice.actions;
export default userSlice.reducer;
