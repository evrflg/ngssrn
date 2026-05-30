export interface ResponseData {
  hasNext: boolean;
}
export interface User {
  promotionCode: string // 会员推广码，也就是会员 ID
  oriPromotionCode?: string // 原始会员推广码
  username: string
  level: number
}

export interface ResponseData<AggsDataType, RowsType> {
  hasNext: boolean;
  aggsData: AggsDataType;
  rows: Array<User & RowsType>;
}
