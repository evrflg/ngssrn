import { getAccInfoServer, getConfigServer } from "@/api";
import {
  getOverview,
  getSiteInfoList,
  getUnreadMessageCount,
} from "@/api/post/my";
import { setStoreJson } from "@/utils/storage";
export function fetchAccInfo() {
  return new Promise<{ data: any }>((resolve) => {
    getAccInfoServer().then((res: any) => {
      if (res?.data?.data) {
        res.data.data.isLogin = true;
        setStoreJson("userInfo", res.data.data);
        resolve({ data: res.data.data });
      } else {
        setStoreJson("userInfo", null);
        resolve({ data: {} });
      }
    });
  });
}

export const fetchConfig = () => {
  return new Promise<{ data: any }>((resolve) => {
    getConfigServer("cfg_site_base").then((res: any) => {
      if (res?.data?.data?.cfg_site_base) {
        setStoreJson("cfg_site_base", res.data.data.cfg_site_base);
        resolve({ data: res.data.data.cfg_site_base });
      }
    });
  });
};
export const fetchSwitches = () => {
  return new Promise<{ data: any }>((resolve) => {
    getConfigServer("cfg_global_switch").then((res: any) => {
      if (res?.data?.data) {
        setStoreJson("cfg_global_switch", res.data.data.cfg_global_switch);
        resolve({ data: res.data.data.cfg_global_switch });
      }
    });
  });
};

export const fetchUnreadMessageCount = () => {
  return new Promise<{ data: number }>((resolve) => {
    getUnreadMessageCount()
      .then((res: any) => {
        const count = res?.data?.data ?? 0;
        resolve({ data: count });
      })
      .catch(() => {
        resolve({ data: 0 });
      });
  });
};

export const fetchSiteDataList = () => {
  return new Promise<{ data: any[] }>((resolve, reject) => {
    getSiteInfoList({})
      .then((res: any) => {
        if (res?.data?.code === 0 && res?.data?.data) {
          // 过滤 status === 0 的数据
          const filteredData = res.data.data.filter(
            (item: any) => item.status === 0,
          );
          resolve({ data: filteredData });
        } else {
          resolve({ data: [] });
        }
      })
      .catch((error) => {
        console.error("Failed to fetch site data list:", error);
        reject(error);
      });
  });
};

export const fetchFinanceOverview = () => {
  return new Promise<{ data: any }>((resolve, reject) => {
    getOverview()
      .then((res: any) => {
        resolve({ data: res?.data?.data ?? null });
      })
      .catch((error) => {
        console.error("Failed to fetch finance overview:", error);
        reject(error);
      });
  });
};
