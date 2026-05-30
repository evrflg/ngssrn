import { get } from "./use-client";

// 获取 VPN 套餐列表
export const getVpnPackageList = (params?: any) => get(`/api/app-api/vpn/package/list`, params);
