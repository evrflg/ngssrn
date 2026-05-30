import { serveAccountChangeRecord, serveGetMoneyChangeTypes } from "@/api";
import DateRangePicker from "@/components/common/DateRangePicker";
import { SimpleHeader } from "@/components/common/Header";
import ListNoMore from "@/components/common/ListNoMore";
import NoData from "@/components/common/NoData";
import { useToast } from "@/components/common/toast";
import DropdownButton from "@/components/record/DropdownButton";
import PopWindow from "@/components/record/PopWindow";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Tenant, tenantStore } from "@/store/tenant/tenantSlice";
import { TimeRange } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

// 交易记录 API
interface TransferData {
  type: number;
  beforeMoney: number;
  money: number;
  afterMoney: number;
  createTime: number;
  remark: string | null;
  /** 0 现金 1 彩金；接口未返回时不展示 */
  walletType?: number;
}

// 交易类型 API
interface TypeData {
  id?: string;
  label: string;
  value: string;
  dictType?: string;
}

// 详情、时间、金额的Item UI
interface InnerItemData {
  title: string;
  value: any;
  partColorStr?: string; // 部分颜色字符串
  titleFontSize?: number; // 标题字体大小
}

// 路由参数类型
type RouteParams = {
  type?: string;
};

// 时间戳转日期 2025-04-18 11:27:50
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const Y = date.getFullYear();
  const M = pad(date.getMonth() + 1); // 月份从0开始
  const D = pad(date.getDate());

  return `${Y}-${M}-${D}`;
};

let totalDataNumber = 0;

export const tranctionsRecord = () => {
  const toast = useToast();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [createTime, setCreateTime] = useState<TimeRange>();
  const [selectedType, setSelectedType] = useState<TypeData>({
    value: "",
    label: t("status.allText"),
  });
  const [types, setTypes] = useState<TypeData[]>([]);
  const [datas, setDatas] = useState<TransferData[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [isPopWindowVisible, setIsPopWindowVisible] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  /** 列表接口是否已完成至少一次（避免请求前/加载中误显示 NoData） */
  const [listFetchCompleted, setListFetchCompleted] = useState(false);
  const PAGE_SIZE = 20;
  const tenantInfo: Tenant = useSelector(tenantStore);
  const route = useRoute<RouteProp<Record<string, RouteParams>>>();

  useEffect(() => {
    setDatas([]);
    setPageNumber(1);
    requestGetMoneyChangeTypes();
  }, []);

  useEffect(() => {
    if (types.length > 0) {
      setSelectedType(types[0]);
    }
  }, [types]);

  // 处理路由参数，自动选择指定的交易类型
  useEffect(() => {
    if (route.params?.type && types.length > 0) {
      const targetType = types.find((type) => type.value === route.params?.type?.toString());
      if (targetType) {
        setSelectedType(targetType);
      }
    }
  }, [route.params, types]);

  // 添加一个新的 useEffect 来监听 createTime 的变化
  useEffect(() => {
    setDatas([]);
    if (types.length > 0 && createTime?.length) {
      requestAccountChangeRecord().then(() => {});
    }
  }, [createTime, selectedType]);

  // ----- Request API
  // 请求交易类型
  const requestGetMoneyChangeTypes = () => {
    serveGetMoneyChangeTypes({
      type: "finance_money_change_type",
    })
      .then((res: any) => {
        if (res.data?.code === 0 && res.data?.data?.length > 0) {
          // 服务器已经返回了正确的数据结构，直接使用
          const apiData = res.data.data.map((item: any) => ({
            ...item,
            // 确保字段名称一致
            label: item.label,
            value: item.value,
          }));
          // 在数组第0个位置插入默认数据
          const defaultType = { label: t("status.allText"), value: "" };
          setTypes([defaultType, ...apiData]);
        }
      })
      .catch((error: any) => {
        console.error("请求交易类型失败:", error);
      });
  };

  // 请求交易记录
  const requestAccountChangeRecord = (isLoadMore: boolean = false): Promise<void> => {
    if (isLoadMore && !hasMore) return Promise.resolve();
    if (isLoading) return Promise.resolve();

    if (!isLoadMore) {
      setListFetchCompleted(false);
    }

    setIsLoading(true);
    let param: Record<string, any> = {
      createTime: createTime,
      pageNo: isLoadMore ? pageNumber : 1,
      pageSize: PAGE_SIZE,
      type: selectedType.value,
    };

    toast.loading(true);

    const apiCall = serveAccountChangeRecord(param);

    return apiCall
      .then((res: any) => {
        if (res.data?.code === 0) {
          if (res.data?.data?.list?.length > 0) {
            const rawList = res.data.data.list as any[];
            const newData: TransferData[] = rawList.map((item) => ({
              type: Number(item.type ?? 0),
              beforeMoney: item.beforeMoney ?? 0,
              money: item.money ?? 0,
              afterMoney: item.afterMoney ?? 0,
              createTime: item.createTime ?? 0,
              remark: item.remark ?? null,
              walletType:
                item.walletType !== undefined && item.walletType !== null
                  ? Number(item.walletType)
                  : undefined,
            }));
            if (isLoadMore) {
              setDatas((prevData) => [...prevData, ...newData]);
              setPageNumber((prev) => prev + 1);
            } else {
              setDatas(newData);
              setPageNumber(newData.length === PAGE_SIZE ? 2 : 1);
            }
            totalDataNumber = Number(res.data.data.total) ?? 0;
            setHasMore(newData.length === PAGE_SIZE);
          } else {
            setHasMore(false);
            if (!isLoadMore) {
              setDatas([]);
            }
          }
        } else {
          if (res.data?.msg) {
            toast.error(res.data.msg);
          }
        }
      })
      .finally(() => {
        setIsLoading(false);
        setListFetchCompleted(true);
        toast.loading(false);
      });
  };

  // ----- UI
  // FlatList的Item中的每一个Item
  const InnerItem = ({ title, value, partColorStr, titleFontSize }: InnerItemData) => {
    const renderValue = () => {
      if (typeof value === "number") {
        // 格式化数字：去除无意义的零，最多保留3位有效小数
        const formatNumber = (num: number): string => {
          // 先保留足够的小数位进行处理
          let formatted = num.toFixed(6);

          // 去除末尾的零
          formatted = formatted.replace(/\.?0+$/, "");

          // 如果有小数部分，最多保留3位
          const parts = formatted.split(".");
          if (parts[1] && parts[1].length > 3) {
            formatted = parts[0] + "." + parts[1].substring(0, 3);
          }

          return formatted;
        };

        let currency = tenantInfo.currency || "";

        return (
          <Text
            style={styles.amountValue}
            className={`text-${theme}-${partColorStr ? partColorStr : "text"}`}
          >
            {`${currency} ${formatNumber(value)}`}
          </Text>
        );
      }
      return (
        <Text style={styles.rightText} className={`text-${theme}-text`}>
          {value}
        </Text>
      );
    };

    return (
      <View style={styles.amountContainer} className={`bg-${theme}-background`}>
        <View
          style={[
            styles.amountLabelWrapper,
            { backgroundColor: Colors[theme].tranctionsRecordSlantedEdge },
          ]}
        >
          <View style={styles.amountLabelContainer}>
            <Text
              style={[styles.amountLabelText, titleFontSize ? { fontSize: titleFontSize } : {}]}
              className={`text-${theme}-lightText`}
            >
              {title}
            </Text>
          </View>
          <View
            style={
              Platform.OS === "ios"
                ? {
                    width: 0,
                    height: 0,
                    borderStyle: "solid",
                    borderBottomWidth: 30,
                    borderLeftWidth: 10,
                    marginLeft: -10,
                    borderLeftColor: Colors[theme].tranctionsRecordSlantedEdge,
                    borderBottomColor: Colors[theme].background,
                  }
                : {
                    width: 0,
                    height: 0,
                    borderStyle: "dashed",
                    borderBottomWidth: 30,
                    borderLeftWidth: 10,
                    marginLeft: -10,
                    borderLeftColor: Colors[theme].tranctionsRecordSlantedEdge,
                    borderBlockColor: Colors[theme].background,
                  }
            }
          />
        </View>
        {renderValue()}
      </View>
    );
  };

  const walletTypeLabel = (walletType: number) => {
    if (walletType === 0) return t("tranctionsRecord.walletCash");
    if (walletType === 1) return t("tranctionsRecord.walletBonus");
    return String(walletType);
  };

  // Item
  const TransferItem: React.FC<TransferData> = ({
    type,
    beforeMoney,
    money,
    afterMoney,
    createTime,
    remark,
    walletType,
  }) => {
    // 根据type查找对应的类型名称
    // type是number类型，requestGetMoneyChangeTypes返回的value是string类型
    // 需要将number转换为string进行匹配
    const typeData = types.find((t) => {
      // 确保严格匹配：将number转为string，或将string转为number进行比较
      return t.value === type.toString() || parseInt(t.value) === type;
    });
    const topTitle = typeData?.label || "";

    return (
      <View style={styles.item} className={`bg-${theme}-btnText`}>
        <View style={styles.topBar} className={`bg-${theme}-primary`}>
          <Text style={styles.topText} className={`text-${theme}-btnText`}>
            {topTitle || t("status.allText")}
          </Text>
        </View>
        {walletType != null && (
          <InnerItem
            title={t("tranctionsRecord.walletType")}
            value={walletTypeLabel(walletType)}
            titleFontSize={12}
          />
        )}
        <InnerItem
          title={t("tranctionsRecord.beforeChange")}
          value={beforeMoney}
          titleFontSize={12}
        />
        <InnerItem
          title={t("tranctionsRecord.changeMoney")}
          value={money}
          partColorStr="primary"
          titleFontSize={12}
        />
        <InnerItem
          title={t("tranctionsRecord.afterChange")}
          value={afterMoney}
          titleFontSize={12}
        />
        <InnerItem title={t("common.time")} value={formatDate(createTime || 0)} />
        {remark && remark.length > 0 && (
          <View style={styles.markView}>
            <Text
              style={styles.markTip}
              className={`text-${theme}-lightText`}
            >{`${t("common.remarkText")}：`}</Text>
            <Text style={styles.markText} className={`text-${theme}-text`}>
              {remark}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const MemoizedTransferItem = React.memo(TransferItem);

  const renderItem = React.useCallback(
    ({ item }: { item: TransferData }) => (
      <MemoizedTransferItem
        type={item.type}
        beforeMoney={item.beforeMoney}
        money={item.money}
        afterMoney={item.afterMoney}
        createTime={item.createTime}
        remark={item.remark}
        walletType={item.walletType}
      />
    ),
    [types], // 依赖types数组，因为TransferItem需要根据type查找对应的label
  );

  const keyExtractor = React.useCallback((item: TransferData, index: number) => {
    const timeKey = item.createTime;
    return `${timeKey}-${index}`;
  }, []);

  // 上拉加载
  const handleEndReached = React.useCallback(() => {
    if (hasMore && !isLoading) {
      requestAccountChangeRecord(true);
    }
  }, [hasMore, isLoading]);

  return (
    <SafeAreaView style={styles.container} className={`bg-${theme}-background`}>
      <SimpleHeader title={t("pageName.transactionRecord")} />
      <View style={styles.dropdownBtnsRow}>
        <DropdownButton
          className="h-10"
          text={selectedType?.label || t("status.allText")}
          style={{ flex: 1 }}
          onPress={() => setIsPopWindowVisible(true)}
        />
        <DateRangePicker style={{ flex: 1 }} onConfirm={setCreateTime} showLabel />
      </View>
      {datas.length > 0 ? (
        <FlatList
          style={styles.list}
          data={datas}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          className="hide-scrollbar"
          ListFooterComponent={totalDataNumber === datas.length ? <ListNoMore /> : null}
        />
      ) : !isLoading && listFetchCompleted ? (
        <NoData style={{ marginTop: 150 }} />
      ) : null}

      <PopWindow
        isVisible={isPopWindowVisible}
        setIsVisible={setIsPopWindowVisible}
        data={types.map((type) => ({ title: type.label }))}
        onItemPress={(index) => {
          const newType = types[index];
          if (newType?.value !== selectedType?.value) {
            setDatas([]);
            setPageNumber(1);
            setHasMore(true);
            setSelectedType(types[index]);
            setIsPopWindowVisible(false);
          }
        }}
        selectedIndex={types.findIndex((type) => type.value === selectedType?.value)}
        setSelectedIndex={() => {}}
        hideHeader={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dropdownBtnsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 12,
    gap: 12,
  },
  list: {
    flex: 1,
  },
  listFooter: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  listFooterText: {
    fontSize: 12,
  },
  item: {
    borderRadius: 8,
    gap: 8,
    margin: 8,
    paddingBottom: 12,
    overflow: "hidden",
  },
  topBar: {
    paddingHorizontal: 10,
  },
  topText: {
    fontWeight: 500,
    fontSize: 14,
    textAlign: "left",
    height: 40,
    textAlignVertical: "center",
    lineHeight: 40,
    width: "98%",
  },
  rightText: {
    textAlign: "right",
    fontSize: 14,
    lineHeight: Math.ceil(14 * 1.35),
    ...(Platform.OS === "android"
      ? ({ includeFontPadding: false, textAlignVertical: "center" } as const)
      : null),
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 5,
    marginHorizontal: 5,
  },
  amountLabelWrapper: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  amountLabelContainer: {
    height: 30,
    paddingLeft: 12,
    paddingRight: 12,
    justifyContent: "center",
  },
  slantedEdge: {},
  amountLabelText: {
    fontSize: 14,
  },
  amountValue: {
    fontSize: 12,
    //fontWeight: "600",
    marginLeft: 12,
  },
  markView: {
    //borderWidth: 1,
    borderColor: "grey",
    borderRadius: 8,
    padding: 5,
    minHeight: 65,
    gap: 5, // 设置子组件之间的间距为5
  },
  markTip: {
    fontSize: 13,
    textAlign: "left",
    writingDirection: "ltr",
  },
  markText: {
    fontSize: 12,
    textAlign: "left",
  },
});

export default tranctionsRecord;
