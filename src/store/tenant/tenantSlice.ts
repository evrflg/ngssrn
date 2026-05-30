/*
 * @FilePath: \ngss-rn\src\store\tenant\tenantSlice.ts
 * @Description: 租户站点配置的信息
 */
import { getLanguageServer } from "@/api/post/home";
import { defineSiteCodeConfig, type SiteCodeConfig } from "@/config/siteCodeConfig";
import type { RootState } from "../store";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setStoreJson } from "@/utils/storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as Application from "expo-application";

export interface Tenant {
  name: string;
  code: string;
  language: string;
  currency: string;
  timeZoneId: string;
  tenantId: string;
}

/** 接口失败或未返回时仍保证 Redux / selector 永远拿到完整对象，避免 tenantId 解构崩溃 */
export const EMPTY_TENANT: Tenant = {
  name: "",
  code: "",
  language: "",
  currency: "",
  timeZoneId: "",
  tenantId: "",
};

interface TenantState {
  data: Tenant; // 租户信息
  isCurrentAppId: boolean; // 是否是当前应用ID
}

export const fetchTenantInfo = createAsyncThunk("config/getTenantInfo", async () => {
  const res = await getLanguageServer({});
  return res?.data?.data;
});

export const tenantSlice = createSlice({
  name: "tenant",
  initialState: {
    data: { ...EMPTY_TENANT },
    isCurrentAppId: false,
  } as TenantState,
  reducers: {
    setTenantId: (state, action: { payload: string }) => {
      if (!state.data) state.data = { ...EMPTY_TENANT };
      state.data.tenantId = action.payload;
      // setStoreJson("tenant_data", state.data);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTenantInfo.fulfilled, (state, action) => {
      const payload = action.payload;
      if (payload && typeof payload === "object") {
        state.data = { ...EMPTY_TENANT, ...payload };
        // setStoreJson("tenant_data", state.data);

        try {
          // iOS/Android：都是「装进 App 里的那个 id」，热更 JS 不会改这个
          const binaryAppId = Application.applicationId;
          const appIdArr = binaryAppId?.split(".");
          const appId = appIdArr?.[appIdArr.length - 1];

          // 如果当租户code与当前应用bundleId相同，则设置为当前应用ID
          if (payload.code == appId) {
            state.isCurrentAppId = true;
          }
        } catch (error) {
          console.error("get nativeAppId error", error);
        }
      }
      // 未返回有效 data 时保留原 state.data，避免写成 undefined + AsyncStorage 报错
    });
  },
});

export const tenantStore = (state: RootState): Tenant => state.tenant?.data ?? EMPTY_TENANT;
export const tenantIdStore = (state: RootState): string =>
  (state.tenant?.data ?? EMPTY_TENANT).tenantId;
export const tenantTimeZoneStore = (state: RootState): string =>
  (state.tenant?.data ?? EMPTY_TENANT).timeZoneId;
/** 与 ngss-vue useSiteCodeConfigStore.config 一致：按当前租户 code 派生静态站点配置 */
export const stationConfig = (state: RootState): SiteCodeConfig =>
  defineSiteCodeConfig((state.tenant?.data ?? EMPTY_TENANT).code) || {};
export const isCurrentAppIdStore = (state: RootState): boolean => state.tenant.isCurrentAppId;

export const { setTenantId } = tenantSlice.actions;

export default tenantSlice.reducer;
