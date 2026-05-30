//打码量记录
import { getBettingAmountRecordData, getBettingAmountRecordType } from "@/api";
import DateRangePicker from "@/components/common/DateRangePicker";
import { HideScreenHeader } from "@/components/common/Header";
import NoData from "@/components/common/NoData";
import { I18nText } from "@/components/I18nText";
import DropdownButton from "@/components/record/DropdownButton";
import PopWindow from "@/components/record/PopWindow";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { TimeRange } from "@/types";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type BetItem = {
  id: string;
  proxyId: string;
  proxyName: string;
  parentIds: string;
  memberId: string;
  username: string;
  betNum: number;
  beforeNum: number;
  afterNum: number;
  type: number;
  remark: string | null;
  orderId: string | null;
  drawNeed: number;
  beforeDrawNeed: number;
  afterDrawNeed: number;
  createTime: string;
  typeStr?: string;
};

type TypeData = {
  id: string;
  label: string;
  value: string;
  dictType: string;
};

const taskRecord = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [isLoading, setLoading] = useState<boolean>(true);
  const [isPopWindowVisible, setIsPopWindowVisible] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<TimeRange>()
  const pageSize = 20;
  const [selectedType, setSelectedType] = useState<TypeData | null>(null);
  const [options, setOptions] = useState<TypeData[]>([]);
  const [data, setData] = useState<BetItem[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [finished, setFinished] = useState<boolean>(false);
  const { userInfo }: any = useSelector((state: RootState) => state?.user);

  useEffect(() => {
    getTypes();
  }, []);

  const getTypes = async () => {
    setLoading(true);
    try {
      const res = await getBettingAmountRecordType({ type: 'betnum_change_type' });
      if (res.data.code == 0) {
        const newOptions = [{ label: t("status.allText") }, ...res.data.data];
        setOptions(newOptions);
      }
    } catch (error) {
      console.error('Error fetching types:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = useCallback(({ item }: { item: BetItem }) => {
    return (
      <View
        style={[
          styles.recordContent,
          {
            backgroundColor: Colors[theme].activeColor,
            boxShadow: `0 2px 4px ${Colors[theme].shadowColor}`,
          },
        ]}
      >
        <View className="flex-row items-center justify-between">
          <ThemedText type="title" style={{ color: Colors[theme].lightText }}>
            {item.typeStr}
          </ThemedText>
          <ThemedText
            type="tiptitle"
            className="flex-row text-end"
            style={{ color: Colors[theme].textGrayLight }}
          >
            {item.createTime}
          </ThemedText>
        </View>
        <View
          className="my-1 items-center"
          style={{ borderWidth: 1, borderColor: Colors[theme].btnBorder }}
        ></View>
        <View className="flex-row items-center justify-between">
          <ThemedText>
            <Image
              style={styles.icon}
              source={require("@/assets/images/promotion/point.png")}
              alt=""
            />
            <I18nText
              type="tiptitle"
              i18nKey="reports.beforeNum"
              style={{ color: Colors[theme].textGrayLight }}
            />
          </ThemedText>
          <ThemedText
            type="tiptitle"
            className="flex-row text-end"
            style={{ color: Colors[theme].textGrayLight }}
          >
            {item.beforeNum}
          </ThemedText>
        </View>
        <View className="flex-row items-center justify-between">
          <ThemedText>
            <Image
              style={styles.icon}
              source={require("@/assets/images/promotion/point.png")}
              alt=""
            />
            <I18nText
              type="tiptitle"
              i18nKey="agent.realBettingMoney"
              style={{ color: Colors[theme].textGrayLight }}
            />
          </ThemedText>
          <ThemedText
            type="tiptitle"
            className="flex-row text-end"
            style={{ color: Colors[theme].redFont }}
          >
            {item.betNum}
          </ThemedText>
        </View>
        <View className="flex-row items-center justify-between">
          <ThemedText>
            <Image
              style={styles.icon}
              source={require("@/assets/images/promotion/point.png")}
              alt=""
            />
            <I18nText
              type="tiptitle"
              i18nKey="reports.afterNum"
              style={{ color: Colors[theme].textGrayLight }}
            />
          </ThemedText>
          <ThemedText
            type="tiptitle"
            className="flex-row text-end"
            style={{ color: Colors[theme].darkColor }}
          >
            {item.afterNum}
          </ThemedText>
        </View>
        <View className="flex-row items-center justify-between">
          <ThemedText>
            <Image
              style={styles.icon}
              source={require("@/assets/images/promotion/point.png")}
              alt=""
            />
            <I18nText
              type="tiptitle"
              i18nKey="reports.afterDrawNeed"
              style={{ color: Colors[theme].textGrayLight }}
            />
          </ThemedText>
          <ThemedText
            type="tiptitle"
            className="flex-row text-end"
            style={{ color: Colors[theme].primary }}
          >
            {item.afterDrawNeed}
          </ThemedText>
        </View>


        <View className="flex-row items-center justify-between">
          <ThemedText>
            <Image
              style={styles.icon}
              source={require("@/assets/images/promotion/point.png")}
              alt=""
            />
            <I18nText
              type="tiptitle"
              i18nKey="common.remarkText"
              style={{ color: Colors[theme].textGrayLight }}
            />
          </ThemedText>
          <ThemedText
            type="tiptitle"
            className="flex-row text-end"
            style={{ color: Colors[theme].darkColor }}
          >
            {item.remark == "null" || item.remark == null ? "--" : item.remark}
          </ThemedText>
        </View>
      </View>
    );
  }, []);


  const fetchBetRecords = async () => {
    try {
      const params = {
        pageNo: pageNumber.toString(),
        pageSize: pageSize.toString(),
        createTime: dateRange?.join(','),
        memberId: userInfo.id,
        type: selectedType?.value || undefined
      };

      const response = await getBettingAmountRecordData(params);

      if (response.data.code == 0 && response.data.data?.list) {
        const newItems = response.data.data.list.map((item: any) => ({
          ...item,
          typeStr: options.find(opt => opt.value === item.type?.toString())?.label || '',
          createTime: format(new Date(item.createTime), "yyyy-MM-dd HH:mm:ss")
        }));

        if (pageNumber === 1) {
          setData(newItems);
        } else {
          setData(prevData => [...prevData, ...newItems]);
        }

        if (newItems.length < pageSize) {
          setFinished(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bet records:', error);
    }
  };

  const resetListAndFetch = () => {
    setPageNumber(1);
    setFinished(false);
    setData([]);
    fetchBetRecords();
  };

  const handleEndReached = useCallback(() => {
    if (!finished && !isLoading) {
      setPageNumber(prev => prev + 1);
    }
  }, [finished, isLoading]);

  useEffect(() => {
    if (pageNumber > 1) {
      fetchBetRecords();
    }
  }, [pageNumber]);

  useEffect(() => {
    // 确保 options 已加载 且 dateRange 有值 时才请求数据
    if (options.length > 0 && dateRange?.length) {
      resetListAndFetch();
    }
  }, [selectedType, dateRange, options]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors[theme].background }}
    >
      <HideScreenHeader title={t("pageName.orderBetHis")} />
      <View style={styles.dropdownBtnsRow}>
        <DropdownButton
          className="flex-1"
          text={selectedType?.label || t("status.allText")}
          onPress={() => setIsPopWindowVisible(true)}
        />
        <View className="flex-1">
          <DateRangePicker
            style={{ flex: 1 }}
            onConfirm={setDateRange}
            showLabel
          />
        </View>
      </View>
      {data.length > 0 ? (
        <View style={styles.recordCenter}>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              `${item.id}-${index}`
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            onRefresh={() => {
              resetListAndFetch();
            }}
            refreshing={isLoading}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            className="hide-scrollbar"
          />
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <NoData />
        </View>
      )}
      <PopWindow
        isVisible={isPopWindowVisible}
        setIsVisible={setIsPopWindowVisible}
        data={options.map((option) => ({ title: option.label }))}
        onItemPress={(index) => {
          setSelectedType(options[index]);
          setIsPopWindowVisible(false);
        }}
        selectedIndex={options.findIndex(
          (option) => option.value === selectedType?.value
        )}
        setSelectedIndex={() => { }}
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
    height: "85%",
    paddingHorizontal: 15,
  },
  recordContent: {
    marginBottom: 15,
    padding: 5,
    borderRadius: 5,
  },
  icon: { width: 10, height: 10, marginRight: 5 },
});

export default taskRecord;
