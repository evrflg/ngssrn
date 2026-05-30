import { serveGetPersonReport } from "@/api/post/record";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { TimeRange } from "@/types";
import { rf } from "@/utils/scaleFont";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, Text, View } from "react-native";
import DateRangePicker from "../common/DateRangePicker";
import NoData from "../common/NoData";
import { useToast } from "../common/toast";
import { Colors } from "@/constants/Colors";
import ListNoMore from "../common/ListNoMore";

interface ReportItemProps {
  userName: string;
  recharge: number;
  date: string;
  withdrawal: number;
}

const ReportItem: React.FC<ReportItemProps> = ({ userName, recharge, date, withdrawal }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.itemContainer} className={`bg-${theme}-btnText`}>
      <View style={styles.topRow}>
        <Text style={[styles.userName, { fontSize: rf(12) }]} className={`text-${theme}-text`}>
          {userName}
        </Text>
        <Text style={[styles.date, { fontSize: rf(12) }]} className={`text-${theme}-text`}>
          {date}
        </Text>
      </View>
      <View style={[styles.divider, { backgroundColor: Colors[theme].dividerColor }]} />
      <View style={styles.bottomRow}>
        <View style={styles.amountGroup}>
          <Text
            style={[styles.amountLabel, { fontSize: rf(12) }]}
            className={`text-${theme}-lightText`}
          >
            {t("pageName.recharge")}
          </Text>
          <Text style={[styles.amountValue, { fontSize: rf(12) }]} className={`text-${theme}-text`}>
            {recharge}
          </Text>
        </View>
        <View style={styles.amountGroup}>
          <Text
            style={[styles.amountLabel, { fontSize: rf(12) }]}
            className={`text-${theme}-lightText`}
          >
            {t("reports.withdraw")}
          </Text>
          <Text style={[styles.amountValue, { fontSize: rf(12) }]} className={`text-${theme}-text`}>
            {withdrawal}
          </Text>
        </View>
      </View>
    </View>
  );
};

const MemoizedReportItem = React.memo(ReportItem);

let totalDataNumber = 0;
export const PersonalReport = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportItemProps[]>([]);
  const [dateRange, setDateRange] = useState<TimeRange>();

  // 获取个人报表数据
  const fetchPersonalReport = () => {
    setLoading(true);
    const params = {
      pageSize: 40,
      pageNo: 1,
      statsDate: dateRange?.join(","),
    };
    toast.loading(true);
    serveGetPersonReport(params)
      .then((res: any) => {
        if (res.data?.data?.list && Array.isArray(res.data?.data?.list)) {
          const formattedData = res.data.data.list.map((item: any) => ({
            userName: item.username || "",
            recharge: item.depositAmount || 0,
            date: item.statsDate
              ? `${item.statsDate[0]}-${String(item.statsDate[1]).padStart(2, "0")}-${String(item.statsDate[2]).padStart(2, "0")}`
              : "",
            withdrawal: item.withdrawalAmount || 0,
          }));
          totalDataNumber = Number(res.data.data.total) ?? 0;
          setData(formattedData);
        } else {
          setData([]);
          if (res.data?.msg) {
            toast.error(res.data.msg);
          }
        }
      })
      .finally(() => {
        setLoading(false);
        toast.loading(false);
      });
  };

  useEffect(() => {
    if (dateRange?.length) fetchPersonalReport();
  }, [dateRange]);

  const renderItem = React.useCallback(
    ({ item }: { item: ReportItemProps }) => (
      <MemoizedReportItem
        userName={item.userName}
        recharge={item.recharge}
        date={item.date}
        withdrawal={item.withdrawal}
      />
    ),
    [],
  );

  const keyExtractor = React.useCallback(
    (item: ReportItemProps, index: number) => `${item.userName}-${index}`,
    [],
  );

  return (
    <View style={styles.container}>
      <DateRangePicker
        style={{ margin: 12 }}
        textStyle={{ fontSize: rf(14) }}
        onConfirm={setDateRange}
        showLabel
      />
      {data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshing={loading}
          onRefresh={fetchPersonalReport}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          className="hide-scrollbar"
          ListFooterComponent={totalDataNumber === data.length ? <ListNoMore /> : null}
        />
      ) : !loading && dateRange?.length ? (
        <NoData style={{ marginTop: 150 }} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 6,
    paddingBottom: 12,
  },
  itemContainer: {
    marginHorizontal: 12,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 18,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userName: {
    fontSize: 12,
    fontWeight: "500",
  },
  date: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },
  amountGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "space-between",
  },
  amountLabel: {
    fontSize: 12,
  },
  amountValue: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default PersonalReport;
