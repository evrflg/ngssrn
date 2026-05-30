/**彩金任务领取记录 */
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { HideScreenHeader } from "@/components/common/Header";
import DateRangePicker from "@/components/common/DateRangePicker";
import DropdownButton from "@/components/record/DropdownButton";
import PopWindow from "@/components/record/PopWindow";
import NoData from "@/components/common/NoData";
import { getClaimedHistory } from "@/api/post/my";
import { getUserTypeDictData } from "@/api/post/active";
import { TimeRange } from "@/types";
import { format } from "date-fns";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

interface DictItem {
  id: string | number;
  label: string;
  value: string;
  dictType: string;
}

interface MoneyListItem {
  id: string;
  bonusUnlockId: string;
  unlockType: number;
  amount: number;
  optional: {
    unlockDays?: number;
    rechargeDays?: number;
  };
  claimedTime: number;
  unlockAmount: number;
  endTime: number;
  status: number;
}

interface PickerColumn {
  text: string;
  value: string;
  id?: string | number;
}

type RouteParams = {
  name?: string;
  type?: string;
};

const PAGE_SIZE = 20;

export default function GoldUnlockRecord() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();

  const [moneyList, setMoneyList] = useState<MoneyListItem[]>([]);
  const [isShowList, setIsShowList] = useState(false);
  const queryTime: TimeRange = [
    format(new Date(), "yyyy-MM-dd 00:00:00"),
    format(new Date(), "yyyy-MM-dd 23:59:59"),
  ];
  const [pageNumber, setPageNumber] = useState(1);
  const [chooseVal, setChooseVal] = useState<string>("");
  const [columns, setColumns] = useState<PickerColumn[]>([
    { text: t("status.allText"), value: "" },
  ]);
  const [selectedTypeName, setSelectedTypeName] = useState<string>(
    columns[0]?.text ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [dateRange, setDateRange] = useState<TimeRange>();
  const [page, setPage] = useState<number>(1);
  // 获取类型字典
  const getTypes = async () => {
    try {
      const res = await getUserTypeDictData("bonus_unlock_type");
      if (res.data?.data) {
        const dictData = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data.bonus_unlock_type || [];

        const list = dictData.map((item: DictItem) => ({
          text: item.label,
          value: item.value,
          id: item.id,
        }));

        setColumns([{ text: t("status.allText"), value: "" }, ...list]);
      }
    } catch (err) {
      console.error("Failed to fetch types:", err);
    }
  };

  // 设置时间参数
  const handleDateRangeChange = (range: TimeRange) => {
    setDateRange(range);
    setPage(1);
    setMoneyList([]);
    setFinished(false);
  };

  // 确定选择类型
  const onConfirm = (index: number) => {
    setIsShowList(false);
    const selectedOption = columns[index];
    setChooseVal(selectedOption?.value ?? "");
    setSelectedTypeName(selectedOption?.text || "");
    setMoneyList([]);
    setFinished(false);
    setPage(1);
  };

  // 获取列表
  const onLoad = useCallback(
    async (isLoadMore: boolean = false) => {
      if (isLoadMore && finished) return;
      if (loading && !isLoadMore) return;

      try {
        setLoading(true);
        const currentPage = isLoadMore ? pageNumber : 1;
        const params: any = {
          pageNo: currentPage,
          pageSize: PAGE_SIZE,
          createTime: queryTime,
        };

        if (chooseVal) {
          params.unlockType = chooseVal;
        }

        const res = await getClaimedHistory(params);
        const rawList = res.data?.data?.list || [];
        const total = res.data?.data?.total ?? 0;

        if (isLoadMore) {
          setMoneyList((prev) => {
            const newList = [...prev, ...rawList];
            if (newList.length >= total) {
              setFinished(true);
            } else {
              setPageNumber((prevPage) => prevPage + 1);
            }
            return newList;
          });
        } else {
          setMoneyList(rawList);
          if (rawList.length >= total) {
            setFinished(true);
          } else {
            setPageNumber(2);
          }
        }
      } catch (err) {
        console.error("Failed to load records:", err);
      } finally {
        setLoading(false);
      }
    },
    [queryTime, chooseVal, pageNumber, finished, loading],
  );

  // 处理下拉刷新
  const handleRefresh = useCallback(() => {
    setPageNumber(1);
    setFinished(false);
    setMoneyList([]);
    setTimeout(() => {
      onLoad();
    }, 100);
  }, [onLoad]);

  // 处理加载更多
  const handleEndReached = useCallback(() => {
    if (!loading && !finished) {
      onLoad(true);
    }
  }, [onLoad, loading, finished]);

  const dateChange = (timestamp: number) => {
    return format(new Date(timestamp), "yyyy-MM-dd");
  };

  const getStatus = (status: number) => {
    switch (status) {
      case 0:
        return t("status.inProgress");
      case 1:
        return t("status.completed");
      case 2:
        return t("status.unfinished");
      default:
        return "--";
    }
  };

  const getTypeName = (type: number) => {
    const name = columns.find((item) => item.value === String(type))?.text;
    return name || "--";
  };

  //标题背景渐变色
  const getTitleGradientColors = (): [string, string] => {
    switch (theme) {
      case "blueWhite":
        return [Colors[theme].gradientStart, Colors[theme].gradientEnd];
      case "orangeWhite":
        return [Colors[theme].gradientStart, Colors[theme].gradientEnd];
      case "greenBlack":
        return [Colors[theme].gradientStart, Colors[theme].gradientEnd];
      default:
        return [Colors.greenBlack.gradientStart, Colors.greenBlack.gradientEnd];
    }
  };

  // 左边背景色
  const getRowBackgroundColor = (): string => {
    switch (theme) {
      case "greenBlack":
        return Colors[theme].background;
      case "blueWhite":
      case "orangeWhite":
        return Colors[theme].background;
      default:
        return Colors[theme].background;
    }
  };

  // 右边数据背景色
  const getLabelBackgroundColor = (): string => {
    switch (theme) {
      case "greenBlack":
        return "#3d3d3d";
      case "blueWhite":
      case "orangeWhite":
        return "#f1f3ff";
      default:
        return "#3d3d3d";
    }
  };

  // 获取值区域背景色
  const getValueBackgroundColor = (): string => {
    switch (theme) {
      case "greenBlack":
        return "#202222";
      case "blueWhite":
      case "orangeWhite":
        return "#ebecf3";
      default:
        return "#202222";
    }
  };

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const typeFromQuery = route.params?.type?.toString() ?? "";
    getTypes().then(() => {
      if (typeFromQuery) {
        setTimeout(() => {
          setColumns((prev) => {
            const target = prev.find((item) => item.value === typeFromQuery);
            if (target) {
              setChooseVal(typeFromQuery);
              setSelectedTypeName(target.text);
            }
            return prev;
          });
        }, 100);
      }
      setIsInitialized(true);
    });

    // 初始化日期范围为今天
    const today = format(new Date(), "yyyy-MM-dd");
    setDateRange([`${today} 00:00:00`, `${today} 23:59:59`]);
  }, []);

  useEffect(() => {
    if (
      isInitialized &&
      columns.length > 0 &&
      dateRange &&
      dateRange.length === 2 &&
      !loading
    ) {
      const loadData = async () => {
        try {
          setLoading(true);
          const params: any = {
            pageNo: page,
            pageSize: PAGE_SIZE,
            createTime: dateRange,
          };

          if (chooseVal) {
            params.unlockType = chooseVal;
          }
          // alert(JSON.stringify(params));

          const res = await getClaimedHistory(params);
          const rawList = res.data?.data?.list || [];
          const total = res.data?.data?.total ?? 0;

          setMoneyList(rawList);
          if (rawList.length >= total) {
            setFinished(true);
          } else {
            setPage(2);
          }
        } catch (err) {
          console.error("Failed to load records:", err);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [isInitialized, columns.length, dateRange, chooseVal, page]);

  const renderItem = ({ item }: { item: MoneyListItem }) => {
    return (
      <View className={`rounded-lg mb-2.5 overflow-hidden bg-${theme}-cardBg1`}>
        {/* 顶部标题 */}
        <LinearGradient
          colors={getTitleGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-[30px]justify-center"
        >
          <View className="h-[30px] pl-2.5 justify-center">
            <Text
              style={{
                fontSize: 14,
                color: Colors[theme].btnText,
                fontWeight: "bold",
                textAlign: "left",
              }}
            >
              {getTypeName(item.unlockType)}
            </Text>
          </View>
        </LinearGradient>

        {/* 详情内容 */}
        <View className="p-1.5">
          {/* 状态 */}
          <View
            className="flex-row justify-between items-center h-[30px] rounded-md pr-1.25 mb-2"
            style={{ backgroundColor: getRowBackgroundColor() }}
          >
            <View
              className="flex-row items-stretch h-[30px] rounded-md"
              style={{ backgroundColor: getLabelBackgroundColor() }}
            >
              <View className="h-[30px] pl-2 pr-3 justify-center">
                <Text
                  className={`text-xs leading-[30px] text-${theme}-textGray`}
                >
                  {t("common.statusText")}
                </Text>
              </View>
              <View
                className="w-[15px] h-[30px]"
                style={{
                  backgroundColor: getValueBackgroundColor(),
                  transform: [{ skewX: "-12deg" }],
                  left: 5,
                }}
              />
            </View>
            <View
              className="h-[30px] pl-2 pr-3 justify-center rounded-md"
              style={{ backgroundColor: getValueBackgroundColor() }}
            >
              <Text className={`text-xs text-${theme}-textSecondary`}>
                {getStatus(item.status)}
              </Text>
            </View>
          </View>

          {/* 解锁金额 */}
          <View
            className="flex-row justify-between items-center h-[30px] rounded-md pr-1.25 mb-2"
            style={{ backgroundColor: getRowBackgroundColor() }}
          >
            <View
              className="flex-row items-stretch h-[30px] rounded-md"
              style={{ backgroundColor: getLabelBackgroundColor() }}
            >
              <View className="h-[30px] pl-2 pr-3 justify-center">
                <Text
                  className={`text-xs leading-[30px] text-${theme}-textGray`}
                >
                  {t("bonusTask.unlockAmount")}
                </Text>
              </View>
              <View
                className="w-[15px] h-[30px] "
                style={{
                  backgroundColor: getValueBackgroundColor(),
                  transform: [{ skewX: "-12deg" }],
                  left: 5,
                }}
              />
            </View>
            <View
              className="h-[30px] pl-2 pr-3 justify-center rounded-md"
              style={{ backgroundColor: getValueBackgroundColor() }}
            >
              <Text
                className={`text-xs`}
                style={{ color: Colors[theme].primary }}
              >
                {item.unlockAmount}
              </Text>
            </View>
          </View>

          {/* 时间 */}
          <View
            className="flex-row justify-between items-center h-[30px] rounded-md pr-1.25 mb-2"
            style={{ backgroundColor: getRowBackgroundColor() }}
          >
            <View
              className="flex-row items-stretch h-[30px] rounded-md"
              style={{ backgroundColor: getLabelBackgroundColor() }}
            >
              <View className="h-[30px] pl-2 pr-3 justify-center rounded-md ">
                <Text
                  className={`text-xs leading-[30px] text-${theme}-textGray`}
                >
                  {t("common.time")}
                </Text>
              </View>
              <View
                className="w-[15px] h-[30px]"
                style={{
                  backgroundColor: getValueBackgroundColor(),
                  transform: [{ skewX: "-12deg" }],
                  left: 5,
                }}
              />
            </View>
            <View
              className="h-[30px] pl-2 pr-3 justify-center rounded-md"
              style={{ backgroundColor: getValueBackgroundColor() }}
            >
              <Text className={`text-xs text-${theme}-textSecondary`}>
                {dateChange(item.claimedTime)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 bg-${theme}-background`}>
      <HideScreenHeader title={t("pageName.taskRecord")} />

      {/* 筛选区域 */}
      <View className="z-10 h-[60px]">
        <View className="flex-row p-2.5 absolute top-0 w-full z-[1] gap-2.5">
          {/* 类型选择 */}
          <View className="flex-1 h-8 justify-center">
            <DropdownButton
              text={selectedTypeName}
              style={{
                height: 32,
                borderRadius: 5,
                minHeight: 32,
                maxHeight: 32,
              }}
              onPress={() => setIsShowList(true)}
            />
          </View>

          {/* 日期选择 */}
          <View className="flex-1 h-8 justify-center">
            <DateRangePicker
              showLabel
              onConfirm={handleDateRangeChange}
              style={{ height: 32, minHeight: 32, maxHeight: 32 }}
            />
          </View>
        </View>
      </View>

      {/* 记录列表 */}
      <View className="flex-1 px-2.5">
        {moneyList.length > 0 ? (
          <FlatList
            data={moneyList}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={{ paddingBottom: 16 }}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.2}
            refreshControl={
              <RefreshControl
                refreshing={loading && moneyList.length === 0}
                onRefresh={handleRefresh}
              />
            }
            ListFooterComponent={
              loading && moneyList.length > 0 ? (
                <View className="p-4 items-center">
                  <Text className={`text-${theme}-textGray`}>
                    {t("common.loading")}
                  </Text>
                </View>
              ) : finished && moneyList.length > 0 ? (
                <View className="p-4 items-center">
                  <Text className={`text-${theme}-textGray`}>
                    {t("common.noMore") || "No more data"}
                  </Text>
                </View>
              ) : null
            }
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            {loading ? (
              <Text className={`text-${theme}-textGray`}>
                {t("common.loading")}
              </Text>
            ) : (
              <NoData />
            )}
          </View>
        )}
      </View>

      {/* 类型选择弹窗 */}
      <PopWindow
        isVisible={isShowList}
        setIsVisible={setIsShowList}
        data={columns.map((item) => ({ title: item.text }))}
        onItemPress={onConfirm}
        selectedIndex={columns.findIndex((item) => item.value === chooseVal)}
        setSelectedIndex={() => { }}
        maxHeight="45%"
        hideHeader={true}
      />
    </SafeAreaView>
  );
}
