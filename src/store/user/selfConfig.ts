import { getPersonalization, getPreviewPersonalization } from "@/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

type BottomNavigationConfig = {
  status: number;
  style: {
    [key: string]: {
      id: string | number;
      moduleCode: string;
      itemCode: string;
      values: string;
      replace: string;
    };
  };
};
// 个性化接口返回的原始结构
export type ItemCode = "BEFORE_LOGIN" | "AFTER_LOGIN";
export type Status = 0 | 1;

export interface BottomNavigation {
  itemCode: ItemCode;
  values: string;
  /** 与个性化接口一致：用于将 APP_DOWNLOAD 等占位替换为实际 tab code */
  replace?: string;
}

export interface NavigationStyle {
  [key: string]: BottomNavigation;
}

export interface ButtonStyle {
  BOTTOM_NAVIGATION: {
    [key: string]: {
      style: NavigationStyle;
      status: Status;
    };
  };
}

export interface PersonalizationLayout {
  [key: string]: any;
}

interface SelfConfigState {
  banner: number;
  myCenter: number;
  indexGame: number;
  indexFooter: number;
  publicity: number;
  loaded: boolean;
  bottomNavigation: BottomNavigationConfig[];
  topDownload: any;
  layout: PersonalizationLayout;
  buttonStyle: ButtonStyle;
  currentGuideInstallConfig: any;
}
const initialState: SelfConfigState = {
  banner: 1, //主题
  myCenter: 1,
  indexGame: 1, //首页游戏 1: Default, 2: Left menu, 3,4,5
  indexFooter: 1, //首页底部内容
  publicity: 1, //宣传弹窗 1: Bottom, 2: Left, 3: Top
  loaded: false, // 自配置是否已拉取完成
  bottomNavigation: [] as BottomNavigationConfig[], //底部导航栏
  topDownload: {
    //首页头部下载栏
    enable: false,
    logo: "",
    introduction: "",
    awardIcon: "",
    buttonLabel: "",
    backgroundColor: "",
  },
  layout: {},
  buttonStyle: {} as ButtonStyle,
  currentGuideInstallConfig: null,
};

// 统一的个性化请求
export const fetPersonalization = createAsyncThunk(
  "config/personalization",
  async (randomCode?: string) => {
    let response;
    if (randomCode) {
      response = await getPreviewPersonalization({ randomCode });
    } else {
      response = await getPersonalization();
    }
    //response.data.data.layout.INDEX_GAME.styleType = "1"
    return response.data?.data;
  },
);

export const selfConfigSlice = createSlice({
  name: "selfConfig",
  initialState,
  reducers: {
    setCurrentGuideInstallConfig: (state, action: PayloadAction<any>) => {
      state.currentGuideInstallConfig = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetPersonalization.pending, (state) => {
        state.loaded = false;
      })
      .addCase(fetPersonalization.fulfilled, (state, action) => {
        const payload = action.payload as
          | { layout: PersonalizationLayout; buttonStyle: ButtonStyle }
          | undefined;
        if (payload) {
          state.layout = payload.layout || {};
          state.buttonStyle = payload.buttonStyle || {};

          const layout = payload.layout || {};
          state.banner = (layout as any)?.INDEX_BANNER?.styleType ?? state.banner;
          // PROFILE 沒帶 styleType 時回退到 1，避免依賴初始值導致版型閃爍
          state.myCenter = (layout as any)?.PROFILE?.styleType ?? 1;
          state.indexGame = (layout as any)?.INDEX_GAME?.styleType ?? state.indexGame;
          state.indexFooter = (layout as any)?.INDEX_FOOTER?.styleType ?? state.indexFooter;
          state.publicity = (layout as any)?.MODAL?.styleType ?? state.publicity;
          try {
            const rawConfig = (layout as any)?.TOP_DOWNLOAD?.styleConfig;
            state.topDownload = rawConfig ? JSON.parse(rawConfig) : state.topDownload;
          } catch {
            // 保留原来的 topDownload，避免 JSON 解析失败导致崩溃
          }
        }
        state.loaded = true;
      });
  },
});

export const { setCurrentGuideInstallConfig } = selfConfigSlice.actions;

// 底部导航栏类型（无配置时回退为样式 1 / Base）
export const selectBottomNavigationType = (state: {
  selfConfig: SelfConfigState;
}): string => {
  const { BOTTOM_NAVIGATION } = state.selfConfig.buttonStyle;
  if (BOTTOM_NAVIGATION) {
    for (const key in BOTTOM_NAVIGATION) {
      if (BOTTOM_NAVIGATION[key].status) return key;
    }
  }
  return "1";
};

// 底部导航栏样式
export const selectBottomNavigation = (state: {
  selfConfig: SelfConfigState;
}): NavigationStyle | null => {
  const { BOTTOM_NAVIGATION } = state.selfConfig.buttonStyle;
  if (BOTTOM_NAVIGATION) {
    const activeStyle = Object.values(BOTTOM_NAVIGATION).find((item) => item.status);
    return activeStyle?.style ?? null;
  }
  return null;
};

export default selfConfigSlice.reducer;
