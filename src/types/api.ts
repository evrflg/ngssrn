import { AxiosResponse } from 'axios';

export interface ApiResponse<T = any> extends AxiosResponse {
  data: {
    success: boolean;
    msg?: string;
    content?: T;
    isLogin?: boolean;
  };
}

export interface AdviceItem {
  id: number;
  content: string;
  createTime: string;
  status: number;
}

export interface AdviceDetail {
  advice?: {
    id: number;
    content: string;
    createTime: string;
  };
  adviceList?: {
    content: string;
    createTime: string;
    contentType: number;
  }[];
} 