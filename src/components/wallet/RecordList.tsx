import { DeviceEventEmitter, Pressable, View } from "react-native";
import { I18nText } from "@/components/I18nText";
import { useSelector } from "react-redux";
import { getDepositRecord, getWithdrawRecord } from "@/api";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import NoData from "@/components/common/NoData";
import { useTranslation } from "react-i18next";
import BaseScrollLoad from "@/components/common/BaseScrollLoad";
import dayjs from "dayjs";
import { tenantTimeZoneStore } from "@/store/tenant/tenantSlice";
import { getDateRange, formatDate } from "@/utils/date";
import { formatMoney } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import { useToast } from "../common/toast";
import { Colors } from "@/constants/Colors";

interface TransactionRecord {
  //   recordId: string;
  //   createDatetime: number; // 时间戳（毫秒）
  //   lockFlag: number; // 可考虑用 boolean 替代，视业务而定
  //   typeStr: string; // 类型中文描述，如 “手动加款”
  //   betdate: number; // 时间戳（毫秒）
  //   money: number;
  //   opDesc: string; // 操作说明
  //   remark: string; // 备注
  //   bettime: string; // 格式为 HH:mm:ss
  //   title: string; // 英文标题
  //   type: RecordType;
  //   status: RecordStatus;
  id: number;
  depositMoney?: number;
  depositType: number;
  createTime?: string;
  successTime?: string;
  orderNo: string;
  orderMoney?: number;
  handleFeeMoney?: number;
  withdrawType?: number;
  handleTime?: string;
  orderStatus?: number;
  remark: string;
}

export interface ListRefs {
  searchParmas: any;
  setSearchParams: any;
}

export type ListRef = React.ForwardedRef<ListRefs>;

const PAGE_SIZE = 20;

export const RecordList = React.forwardRef(
  (
    {
      options,
      type = "recharge",
    }: {
      options: any;
      type: "recharge" | "withdraw";
    },
    ref: ListRef,
  ) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const primaryColor = useThemeColor({}, "primary");
    const toast = useToast();
    const [isPending, setIsPending] = useState(false); //是否在加载中
    const [loadMore, setLoadMore] = useState(false); //是否正在加载更多
    // 获取日期范围并更新
    const timezone = useSelector(tenantTimeZoneStore);
    const formatDateWithTimeZone = (date: Date) => formatDate(date, timezone);
    const { startTime, endTime } = getDateRange(options[0]?.period);
    const [searchParmas, setSearchParams] = useState({
      startTime: formatDateWithTimeZone(startTime),
      endTime: formatDateWithTimeZone(endTime),
      pageNo: 1,
      pageSize: PAGE_SIZE,
      orderStatus: undefined,
    });
    const [page, setPage] = useState<{
      rows: TransactionRecord[];
      totalCount: number;
      hasNext: boolean;
    }>({
      rows: [],
      totalCount: 0,
      hasNext: false,
    });

    // 暴露API
    React.useImperativeHandle(ref, () => {
      return {
        searchParmas,
        setSearchParams,
      };
    });

    useEffect(() => {
      if (loadMore) {
        setSearchParams((prev) => ({ ...prev, pageNo: prev.pageNo + 1 }));
      }
    }, [loadMore]);

    useEffect(() => {
      getRecordList();
    }, [searchParmas]);

    const getRecordList = async () => {
      setIsPending(true);

      if (type === "recharge") {
        await getDepositRecord(searchParmas)
          .then((result) => {
            if (result.data?.data) {
              const { records, total } = result.data.data;
              const isFinished = records.length < PAGE_SIZE;

              if (loadMore) {
                setLoadMore(false);
              }

              const rows = records.map((record: any) => ({
                id: record.id,
                depositMoney: record.depositMoney,
                depositType: record.depositType,
                createTime: record.createTime,
                successTime: record.successTime,
                orderNo: record.orderNo,
                orderMoney: record.orderMoney,
                orderStatus: record.orderStatus,
                remark: record.remark,
              }));

              setPage((prev) => {
                const updatedRows =
                  searchParmas.pageNo > 1 ? prev.rows.concat(rows) : rows;
                return {
                  ...prev,
                  rows: updatedRows,
                  totalCount: Number(total || 0),
                  hasNext: !isFinished,
                };
              });
            } else {
              DeviceEventEmitter.emit("showErrMsg", {
                msg: result.data?.msg || "Failed to get deposit history",
              });
            }
          })
          .finally(() => {
            setIsPending(false);
          });
      } else {
        const params = {
          pageNo: searchParmas.pageNo,
          pageSize: PAGE_SIZE,
          createTime: [searchParmas.startTime, searchParmas.endTime],
          orderStatus: searchParmas.orderStatus || undefined,
        };
        await getWithdrawRecord(params)
          .then((result) => {
            if (result.data?.data) {
              const { list, total } = result.data.data;
              const isFinished = list.length < PAGE_SIZE;

              if (loadMore) {
                setLoadMore(false);
              }

              const rows = list.map((record: any) => ({
                id: record.id, //表ID
                depositMoney: record.depositMoney, //上分金额
                depositType: record.depositType, //订单金额
                createTime: record.createTime, //创建时间
                successTime: record.successTime, //订单成功时间
                orderNo: record.orderNo, //订单号
                orderMoney: record.orderMoney, //订单金额
                handleFeeMoney: record?.handleFeeMoney || 0, //手续费
                withdrawType: record.withdrawType, //提现类型
                handleTime: record.handleTime, //处理时间
                orderStatus: record.orderStatus, //状态：1--未处理，2--处理中 3--充值成功 4--充值失败 5--已过期
                remark: record.remark, //备注
              }));

              setPage((prev) => {
                const updatedRows =
                  searchParmas.pageNo > 1 ? prev.rows.concat(rows) : rows;
                return {
                  ...prev,
                  rows: updatedRows,
                  totalCount: Number(total || 0),
                  hasNext: !isFinished,
                };
              });
            } else {
              DeviceEventEmitter.emit("showErrMsg", {
                msg: result.data?.msg || "Failed to get withdraw history",
              });
            }
          })
          .finally(() => {
            setIsPending(false);
          });
      }
    };

    const getTextColor = (value: number) => {
      let color = "";
      switch (value) {
        case 1:
        case 2:
          color = "text-[#4781ff]";
          break;
        case 3:
          color = "text-[#49ce9b]";
          break;
        case 4:
          color = "text-[#ff7172]";
          break;
        case 5:
          color = `text-[#ff7172]`;
          break;
        case 6:
          color = `text-[#888888]`;
          break;
        default:
          color = `text-${theme}-text`;
          break;
      }
      return color;
    };

    const handleCopy = (text: string) => {
      Clipboard.setString(text);
      toast.success(t("common.copySuccess"));
    };

    const DepositOptions = [
      { id: 1, label: t("wallet.recordList.onlineRecharge") },
      { id: 2, label: t("wallet.recordList.bankDeposit") },
      { id: 3, label: "USDT" },
    ];

    return (
      <BaseScrollLoad
        needScroll={page.rows.length > 0}
        loadData={{
          isFetching: isPending,
          hasNextPage: page.hasNext,
          loadMoreData: () => {
            if (!loadMore) {
              setLoadMore(true);
            }
          },
        }}
        contentContainerClassName={
          page?.rows.length > 0 ? undefined : "flex-1 justify-center"
        }
      >
        {page?.rows?.length > 0 ? (
          page.rows.map((item, index) => (
            <View
              key={index}
              className={`bg-${theme}-btnText p-3 rounded mt-2.5`}
            >
              <View className="flex-row items-center justify-between py-1 px-1">
                <I18nText
                  className={`text-${theme}-text w-32 text-xs`}
                  style={{ writingDirection: "ltr" }}
                  i18nKey={
                    type == "recharge"
                      ? t("wallet.recordList.depositStatusText")
                      : t("wallet.recordList.withdrawStatusText")
                  }
                />
                <I18nText
                  className={`${getTextColor(item.orderStatus || 0)} text-xs`}
                  i18nKey={
                    (options || []).find(
                      (opt: any) => opt.value == item.orderStatus,
                    )?.title
                  }
                />
              </View>
              <View className="flex-row items-center justify-between py-1 px-1">
                <I18nText
                  i18nKey={
                    type == "recharge"
                      ? t("wallet.recharge.rechargeAmount")
                      : t("wallet.recordList.withdrawAmount")
                  }
                  className={`text-${theme}-text w-20 text-xs`}
                  style={{ writingDirection: "ltr" }}
                />
                <I18nText
                  i18nKey={formatMoney(
                    Number(item?.orderMoney || 0) -
                      Number(item?.handleFeeMoney || 0),
                  )}
                  className={`text-${theme}-text flex-1 text-right text-xs`}
                />
              </View>
              {type == "withdraw" && (
                <>
                  <View className="flex-row items-center justify-between py-1 px-1">
                    <I18nText
                      i18nKey="wallet.recordList.withdrawFeeAmount"
                      className={`text-${theme}-text w-20 text-xs`}
                      style={{ writingDirection: "ltr" }}
                    />
                    <I18nText
                      i18nKey={formatMoney(item?.handleFeeMoney || 0)}
                      className={`text-${theme}-text flex-1 text-right text-xs`}
                    />
                  </View>
                  <View className="flex-row items-center justify-between py-1 px-1">
                    <I18nText
                      i18nKey="common.typeText"
                      className={`text-${theme}-text w-20 text-xs`}
                      style={{ writingDirection: "ltr" }}
                    />
                    <I18nText
                      i18nKey={
                        item.withdrawType === 1
                          ? "wallet.withdrawType.normal"
                          : item.withdrawType === 2
                            ? "wallet.withdrawType.crypto"
                            : "wallet.withdrawType.pix"
                      }
                      className={`text-${theme}-text flex-1 text-right text-xs`}
                    />
                  </View>
                </>
              )}

              {type == "recharge" && (
                <View className="flex-row items-center justify-between py-1 px-1">
                  <I18nText
                    i18nKey="common.typeText"
                    className={`text-${theme}-text w-20 text-xs`}
                    style={{ writingDirection: "ltr" }}
                  />
                  <I18nText
                    i18nKey={DepositOptions[item.depositType - 1]?.label}
                    className={`text-${theme}-text flex-1 text-right text-xs`}
                    style={{ writingDirection: "ltr" }}
                  />
                </View>
              )}
              <View className="flex-row items-center justify-between py-1 px-1">
                <I18nText
                  i18nKey="common.time"
                  className={`text-${theme}-text w-20 text-xs`}
                  style={{ writingDirection: "ltr" }}
                />
                <I18nText
                  i18nKey={`${dayjs(item?.handleTime ? item?.handleTime : item?.createTime).format("YYYY-MM-DD HH:mm:ss")}`}
                  className={`text-${theme}-text flex-1 text-right text-xs`}
                />
              </View>
              <View className="flex-row items-center justify-between py-1 px-1">
                <I18nText
                  i18nKey="wallet.recordList.orderId"
                  className={`text-${theme}-text text-xs`}
                  style={{ writingDirection: "ltr" }}
                />
                <View className="flex-1 flex-row items-center gap-1">
                  <I18nText
                    i18nKey={item.orderNo}
                    className={`text-${theme}-text flex-1 text-right text-xs`}
                    style={{ writingDirection: "ltr" }}
                  />
                  <Pressable
                    className="flex-row items-center"
                    onPress={() => handleCopy(item.orderNo)}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={14}
                      color={Colors[theme].textSecondary}
                    />
                  </Pressable>
                </View>
              </View>
              {item.remark && item.remark.length > 0 && (
                <View className="flex-1 p-1 flex-row items-center justify-between gap-1 ">
                  <I18nText
                    i18nKey="common.remarkText"
                    className={`text-${theme}-text w-20 text-xs`}
                    style={{ writingDirection: "ltr" }}
                  />
                  <I18nText
                    i18nKey={item.remark}
                    className={`text-${theme}-text flex-1 text-xs text-right`}
                  />
                </View>
              )}
            </View>
          ))
        ) : (
          <View className="mx-auto">
            <NoData />
          </View>
        )}
      </BaseScrollLoad>
    );
  },
);
