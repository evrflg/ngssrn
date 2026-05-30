import { serveGetTeamReport } from "@/api/post/record";
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

interface TeamReportData {
  name: string;
  betAmount: number;
  cashbackAmount: number;
  rebateAmount: number;
  winAmount: number;
  activityAmount: number;
  depositAmount: number;
  withdrawalAmount: number;
  actBetTurnoverAmount: number;
  profitLossAmount: number;
}

export const TeamReport = () => {
  const toast = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TeamReportData[]>([]);
  const [dateRange, setDateRange] = useState<TimeRange>();
  const { theme } = useTheme();

  const Item: React.FC<TeamReportData> = ({
    name,
    betAmount,
    cashbackAmount,
    rebateAmount,
    winAmount,
    activityAmount,
    depositAmount,
    withdrawalAmount,
    actBetTurnoverAmount,
    profitLossAmount,
  }) => {
    const { theme } = useTheme();
    return (
      <View style={styles.item} className={`bg-${theme}-btnText`}>
        <View style={styles.topRow}>
          <Text style={styles.userName} className={`text-${theme}-text`}>
            {name}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: Colors[theme].dividerColor }]} />
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <View style={styles.amountGroup}>
              <Text style={styles.amountLabel} className={`text-${theme}-lightText`}>
                {t("pageName.recharge")}
              </Text>
              <Text style={[styles.amountValue]} className={`text-${theme}-text`}>
                {depositAmount}
              </Text>
            </View>
            <View style={styles.amountGroup}>
              <Text style={styles.amountLabel} className={`text-${theme}-lightText`}>
                {t("reports.withdraw")}
              </Text>
              <Text style={[styles.amountValue]} className={`text-${theme}-text`}>
                {withdrawalAmount}
              </Text>
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.amountGroup}>
              <Text style={styles.amountLabel} className={`text-${theme}-lightText`}>
                {t("reports.betAmount")}
              </Text>
              <Text style={[styles.amountValue]} className={`text-${theme}-text`}>
                {betAmount}
              </Text>
            </View>
            <View style={styles.amountGroup}>
              <Text style={styles.amountLabel} className={`text-${theme}-lightText`}>
                {t("agent.winAmount")}
              </Text>
              <Text style={[styles.amountValue, { color: Colors[theme].primary }]}>
                {" "}
                {winAmount}
              </Text>
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.amountGroup}>
              <Text style={styles.amountLabel} className={`text-${theme}-lightText`}>
                {t("reports.rebate")}
              </Text>
              <Text style={[styles.amountValue]} className={`text-${theme}-text`}>
                {cashbackAmount}
              </Text>
            </View>
            <View style={styles.amountGroup}>
              <Text style={styles.amountLabel} className={`text-${theme}-lightText`}>
                {t("reports.promotions")}
              </Text>
              <Text style={[styles.amountValue]} className={`text-${theme}-text`}>
                {activityAmount}
              </Text>
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.amountGroup}>
              <Text style={styles.amountLabel} className={`text-${theme}-lightText`}>
                {t("agent.realBettingMoney")}
              </Text>
              <Text style={[styles.amountValue]} className={`text-${theme}-text`}>
                {actBetTurnoverAmount}
              </Text>
            </View>
            <View style={styles.amountGroup}>
              <Text style={styles.amountLabel} className={`text-${theme}-lightText`}>
                {t("betRecord.winLossAmount")}
              </Text>
              <Text
                style={[
                  styles.amountValue,
                  { color: profitLossAmount > 0 ? "#3CB371" : "#FF4500" },
                ]}
              >
                {profitLossAmount}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const MemoziedItem = React.memo(Item);

  // 获取团队报表数据
  const fetchTeamReport = () => {
    setLoading(true);
    const params = {
      pageSize: 40,
      pageNo: 1,
      statsDate: dateRange?.join(","),
    };

    toast.loading(true);
    serveGetTeamReport(params)
      .then((res: any) => {
        if (res.data?.data?.list && Array.isArray(res.data?.data?.list)) {
          const formattedData = res.data.data.list.map((item: any) => ({
            name: item.username || "",
            betAmount: item.betAmount || 0,
            cashbackAmount: item.cashbackAmount || 0,
            rebateAmount: item.rebateAmount || 0,
            winAmount: item.winAmount || 0,
            activityAmount: item.activityAmount || 0,
            depositAmount: item.depositAmount || 0,
            withdrawalAmount: item.withdrawalAmount || 0,
            actBetTurnoverAmount: item.actBetTurnoverAmount || 0,
            profitLossAmount: item.profitLossAmount || 0,
          }));
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
    if (dateRange?.length) fetchTeamReport();
  }, [dateRange]);

  const renderItem = React.useCallback(
    ({ item }: { item: TeamReportData }) => (
      <MemoziedItem
        name={item.name}
        betAmount={item.betAmount}
        cashbackAmount={item.cashbackAmount}
        rebateAmount={item.rebateAmount}
        winAmount={item.winAmount}
        activityAmount={item.activityAmount}
        depositAmount={item.depositAmount}
        withdrawalAmount={item.withdrawalAmount}
        actBetTurnoverAmount={item.actBetTurnoverAmount}
        profitLossAmount={item.profitLossAmount}
      />
    ),
    [],
  );

  const keyExtractor = React.useCallback(
    (item: TeamReportData, index: number) => `${item.name}-${index}`,
    [],
  );

  const styles = StyleSheet.create({
    container: {
      top: 6,
      paddingBottom: 12,
      flex: 1,
    },
    item: {
      borderRadius: 12,
      marginHorizontal: 12,
      marginVertical: 6,
      paddingHorizontal: 12,
      paddingVertical: 18,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    userName: {
      fontSize: rf(12),
      fontWeight: "300",
    },
    divider: {
      height: 0.1,
      backgroundColor: "#666",
      marginVertical: 8,
    },
    gridContainer: {
      gap: 20,
    },
    gridRow: {
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
      fontSize: rf(12),
      fontWeight: "300",
    },
    amountValue: {
      fontSize: rf(12),
      fontWeight: "300",
    },
  });

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
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={fetchTeamReport}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          className="hide-scrollbar"
          ListFooterComponent={
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 16,
              }}
            >
              <Text style={{ color: Colors[theme].text, fontSize: rf(12) }}>
                {t("common.noMore")}
              </Text>
            </View>
          }
        />
      ) : !loading && dateRange?.length ? (
        <NoData style={{ marginTop: 150 }} />
      ) : null}
    </View>
  );
};

export default TeamReport;
