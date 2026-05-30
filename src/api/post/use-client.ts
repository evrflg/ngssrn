import type { AxiosResponse } from "axios";
import { client } from "../common";
import { Loading } from "@/utils/Util";

export const post = async (
  url: string,
  params?: any,
  isFormData?: boolean,
  queryParams?: any,
  config?: any,
): Promise<AxiosResponse<any, any>> => {
  let bodyParams = params;
  let reqConfig = config;
  if (
    bodyParams &&
    typeof bodyParams === "object" &&
    !(bodyParams instanceof FormData) &&
    "silentErrorToast" in bodyParams
  ) {
    const { silentErrorToast, ...rest } = bodyParams;
    bodyParams = rest;
    reqConfig = { ...config, silentErrorToast: silentErrorToast ?? config?.silentErrorToast };
  }
  // 加载中
  if (bodyParams?.load) {
    Loading.show(bodyParams.load[0]);

    delete bodyParams.load;
  }
  //全局语言设置
  // await getStorage("ng-language").then((res:any={})=>{
  //   res = res || 'en'; // Use the value from storage or default to 'en'
  //   if(params){
  //     params.lan = res
  //   }else{
  //     params = {lan:res}
  //   }
  // })

  // 构建URL，如果有query参数则添加到URL中
  let fullUrl = url;
  if (queryParams) {
    const queryString = serializeParams(queryParams);
    fullUrl = `${url}?${queryString}`;
  }

  // FormData提交方式
  if (isFormData && !(bodyParams instanceof FormData)) {
    bodyParams = new URLSearchParams(bodyParams);
  }
  return client.post(fullUrl, bodyParams, reqConfig);
};
export const get = async (
  url: string,
  params?: any,
  axiosConfig?: any,
): Promise<AxiosResponse<any, any>> => {
  let queryParams = params;
  let reqConfig = axiosConfig;
  if (queryParams && typeof queryParams === "object" && "silentErrorToast" in queryParams) {
    const { silentErrorToast, ...rest } = queryParams;
    queryParams = Object.keys(rest).length ? rest : undefined;
    reqConfig = {
      ...axiosConfig,
      silentErrorToast: silentErrorToast ?? axiosConfig?.silentErrorToast,
    };
  }
  // 加载中
  if (queryParams?.load) {
    Loading.show(queryParams.load[0]);
    delete queryParams.load;
  }
  if (queryParams) {
    return client.get(`${url}?${serializeParams(queryParams)}`, reqConfig);
  } else {
    return client.get(url, reqConfig);
  }
};

function serializeParams(obj: any = {}): string {
  const searchParams = new URLSearchParams();
  const build = (value: any, keyPrefix: string) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        build(v, `${keyPrefix}[${i}]`);
      });
    } else if (typeof value === "object") {
      Object.keys(value).forEach((k) => {
        build(value[k], `${keyPrefix}[${k}]`);
      });
    } else {
      searchParams.append(keyPrefix, String(value));
    }
  };
  Object.keys(obj).forEach((key) => {
    build(obj[key], key);
  });
  return searchParams.toString();
}

export const put = async (
  url: string,
  params?: any,
  axiosConfig?: any,
): Promise<AxiosResponse<any, any>> => {
  let queryParams = params;
  let reqConfig = axiosConfig;
  if (queryParams && typeof queryParams === "object" && "silentErrorToast" in queryParams) {
    const { silentErrorToast, ...rest } = queryParams;
    queryParams = Object.keys(rest).length ? rest : undefined;
    reqConfig = {
      ...axiosConfig,
      silentErrorToast: silentErrorToast ?? axiosConfig?.silentErrorToast,
    };
  }
  if (queryParams?.load) {
    Loading.show(queryParams.load[0]);
    delete queryParams.load;
  }
  if (queryParams) {
    return client.put(`${url}?${serializeParams(queryParams)}`, undefined, reqConfig);
  } else {
    return client.put(url, undefined, reqConfig);
  }
};

export const deleteRequest = async (
  url: string,
  params?: any,
  axiosConfig?: any,
): Promise<AxiosResponse<any, any>> => {
  let bodyParams = params;
  let reqConfig = axiosConfig;
  if (bodyParams && typeof bodyParams === "object" && "silentErrorToast" in bodyParams) {
    const { silentErrorToast, ...rest } = bodyParams;
    bodyParams = Object.keys(rest).length ? rest : undefined;
    reqConfig = {
      ...axiosConfig,
      silentErrorToast: silentErrorToast ?? axiosConfig?.silentErrorToast,
    };
  }
  if (bodyParams?.load) {
    Loading.show(bodyParams.load[0]);
    delete bodyParams.load;
  }
  return client.delete(url, { ...reqConfig, data: bodyParams });
};
