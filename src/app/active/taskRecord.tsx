// 领取记录
import { getPickTaskPage } from "@/api";
import DateRangePicker from "@/components/common/DateRangePicker";
import { HideScreenHeader } from "@/components/common/Header";
import NoData from "@/components/common/NoData";
import { I18nText } from "@/components/I18nText";
import DropdownButton from "@/components/record/DropdownButton";
import PopWindow from "@/components/record/PopWindow";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { format } from "date-fns";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View, Image, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TimeRange } from "@/types";
import { getBatchDictData } from "@/api";

type RouteParams = {
  type?: string;
};

type Option = {
  index: number;
  value: number;
  text: string;
  type: string;
};

type TaskRecord = {
  rewardName: string;
  sourceCatalog: string;
  claimMethod: number;
  rewardAmount: number;
  claimedTime: string;
  status: number;
  createTime: string;
};

const taskRecord = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<Record<string, RouteParams>>>();
  const options: Option[] = [
    { value: -1, index: 0, text: t("status.allText"), type: "" },
    { value: 0, index: 1, text: t("pageName.activity"), type: "activity_type" },
    {
      value: 2,
      index: 2,
      text: t("pageName.rebate"),
      type: "rebate_type",
    },
    {
      value: 3,
      index: 3,
      text: t("pageName.task"),
      type: "task_type",
    },
  ];
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isPopWindowVisible, setIsPopWindowVisible] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalMoney, setTotalMoney] = useState<number>(0);
  const [currentItem, setCurrentItem] = useState(options[0]);
  const [dateRange, setDateRange] = useState<TimeRange>();
  const [taskGeneralTargetDict, setTaskGeneralTargetDict] = useState<any[]>([]);
  const [taskNewbieTargetDict, setTaskNewbieTargetDict] = useState<any[]>([]);
  const [activityTypeDict, setActivityTypeDict] = useState<any[]>([]);
  const [rebateTypeDict, setRebateTypeDict] = useState<any[]>([]);

  useEffect(() => {
    fetchTargetDicts();
  }, []);

  const fetchTargetDicts = async () => {
    try {
      const res = await getBatchDictData("task_general_target,task_newbie_target,task_type,rebate_type,activity_type");
      if (res?.data?.code === 0) {
        const payload = res?.data?.data || {};
        setTaskGeneralTargetDict(Array.isArray(payload.task_general_target) ? payload.task_general_target : []);
        setTaskNewbieTargetDict(Array.isArray(payload.task_newbie_target) ? payload.task_newbie_target : []);
        setActivityTypeDict(Array.isArray(payload.activity_type) ? payload.activity_type : []);
        setRebateTypeDict(Array.isArray(payload.rebate_type) ? payload.rebate_type : []);
      }
    } catch {
      // 字典失败不阻塞页面；渲染时会兜底显示 "-"
    }
  };

  const getTaskTargetLabel = (item: TaskRecord): string => {
    const sourceCatalog = String((item as any)?.sourceCatalog ?? "");
    const sourceTypeNum = Number((item as any)?.sourceType);

    // sourceCatalog=task_type：保留当前 taskTarget 匹配逻辑
    if (sourceCatalog === "task_type") {
      const dict = sourceTypeNum === 0 ? taskNewbieTargetDict : taskGeneralTargetDict;
      const target = String((item as any)?.taskTarget ?? "");
      const matched = Array.isArray(dict) ? dict.find((d: any) => String(d?.value) === target) : undefined;
      return matched?.label ? String(matched.label) : "-";
    }

    // sourceCatalog=activity_type / rebate_type：按 sourceType 匹配 value 取 label
    if (sourceCatalog === "activity_type") {
      const matched = Array.isArray(activityTypeDict)
        ? activityTypeDict.find((d: any) => String(d?.value) === String(sourceTypeNum))
        : undefined;
      return matched?.label ? String(matched.label) : "-";
    }
    if (sourceCatalog === "rebate_type") {
      const matched = Array.isArray(rebateTypeDict)
        ? rebateTypeDict.find((d: any) => String(d?.value) === String(sourceTypeNum))
        : undefined;
      return matched?.label ? String(matched.label) : "-";
    }

    return "-";
  };
  const handleDateRangeChange = (range: TimeRange) => {
    setDateRange(range);
    setPage(1);
  };

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage(page + 1);
    }
  }, [hasMore, isLoading]);

  const renderItem = useCallback(({ item }: { item: TaskRecord }) => {
    const targetLabel = getTaskTargetLabel(item);
    return (
      <View
        style={[
          styles.taskContent,
          {
            backgroundColor: Colors[theme].activeColor,
            boxShadow: `0 2px 4px ${Colors[theme].shadowColor}`,
          },
        ]}
      >
        <View className="flex-row justify-between">
          <ThemedText type="tiptitle" style={[{ color: Colors[theme].text }, styles.contentDetail]}>
            {item.rewardName}
            {targetLabel !== "-" ? `- ${targetLabel}` : ""}
          </ThemedText>
          <ThemedText type="tiptitle" style={{ color: item.status === 1 ? "#49ce9b" : "#4781ff" }}>
            {item.status === 1 ? t("status.claim.claimed") : t("status.claim.notClaimed")}
          </ThemedText>
        </View>
        <View className="flex-row justify-between">
          <ThemedText
            className="flex-row"
            type="tiptitle"
            style={[{ color: Colors[theme].darkColor }, styles.contentDetail]}
          >
            {format(new Date(Number(item.claimedTime)), "yyyy-MM-dd HH:mm:ss")}
          </ThemedText>
          <View className="flex-row items-center">
            <Image style={styles.icon} source={require("@/assets/images/active/vip/qb.png")} />
            <ThemedText
              className="flex-row m-0"
              type="tiptitle"
              style={[{ color: Colors[theme].text, marginLeft: 5 }, styles.contentDetail]}
            >
              ${item.rewardAmount}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }, [getTaskTargetLabel, theme, t]);

  const getActPageInfo = () => {
    let params = {
      sourceCatalog: currentItem.type,
      claimedTime: dateRange?.join(","),
      pageNo: page,
      pageSize: 20,
      status: 1,
    };
    setLoading(true);
    getPickTaskPage(params)
      .then((response) => {
        if (response.data.code == 0) {
          if (hasMore) {
            setData([...data, ...response.data.data.list]);
          } else {
            setData(response.data.data.list);
          }
          setHasMore(20 < response.data.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (route.params?.type) {
      const item = options.find((opt) => opt.value === parseInt(route.params.type || ""));
      if (item) setCurrentItem(item);
    }
  }, [route.params]);

  useEffect(() => {
    if (!dateRange) return;
    getActPageInfo();
  }, [page, dateRange, currentItem]);

  useEffect(() => {
    const money = data.reduce((val: number, item: TaskRecord) => {
      val += item.rewardAmount;
      return val;
    }, 0);
    setTotalMoney(Number(money.toFixed(2)));
  }, [data.length]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors[theme].background }}>
      <HideScreenHeader
        title={t("pageName.taskRecord")}
        rightSelf={
          data.length > 0 && (
            <ThemedText style={[styles.selectMoney, { color: Colors[theme].redFont }]}>
              <I18nText i18nKey="agent.bonus" style={{ color: Colors[theme].darkColor }} />{" "}
              {totalMoney}
            </ThemedText>
          )
        }
      />
      <View style={styles.dropdownBtnsRow}>
        <DropdownButton
          className="flex-1"
          text={currentItem.text}
          onPress={() => setIsPopWindowVisible(true)}
        />
        <DateRangePicker style={{ flex: 1 }} onConfirm={handleDateRangeChange} showLabel />
      </View>
      {data.length > 0 ? (
        <View className="flex-1" style={styles.recordCenter}>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.createTime}-${index}`}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            onRefresh={() => {
              setPage(1);
            }}
            refreshing={isLoading}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            className="hide-scrollbar"
            ListFooterComponent={() => (
              <View className="justify-center items-center py-2">
                <Text className="fontSize={12}" style={{ color: Colors[theme].text }}>
                  {t("common.noMore")}
                </Text>
              </View>
            )}
          />
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <NoData />
        </View>
      )}
      <PopWindow
        isVisible={isPopWindowVisible}
        setIsVisible={setIsPopWindowVisible}
        data={options.map((option) => ({ title: option.text }))}
        onItemPress={(index) => {
          setData([]);
          setPage(1);
          setCurrentItem(options[index]);
          setIsPopWindowVisible(false);
        }}
        selectedIndex={options.findIndex((option) => option.value === currentItem.value)}
        setSelectedIndex={() => {}}
        hideHeader={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dropdownBtnsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 12,
    gap: 12,
  },
  recordCenter: {
    paddingHorizontal: 15,
  },
  recordContent: {
    marginBottom: 15,
    padding: 5,
    borderRadius: 5,
  },
  icon: { width: 18, height: 18 },
  selectMoney: {
    textAlign: "right",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  taskContent: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  contentDetail: {
    marginBottom: 5,
    alignItems: "center",
  },
});

export default taskRecord;
