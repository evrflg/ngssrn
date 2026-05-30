/** 我的分享-存款信息*/
import { getDepositRecord } from "@/api";
import DateRangePicker from "@/components/common/DateRangePicker";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useToast } from "@/components/common/toast";
import { TimeRange } from "@/types";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DeviceEventEmitter,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NoData from "../common/NoData";

interface Data {
  username: string;
  depositMoney: number;
  createTime: number;
  giftMoney: number;
}

export default function DepositInformation() {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState<TimeRange>();
  const [dataList, setDataList] = useState<Data[]>([]);
  const { t } = useTranslation();
  const [finished, setFinised] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const toast = useToast();

  const handleDateRangeConfirm = (range: TimeRange) => {
    setPageNumber(1);
    setDateRange(range);
  };

  const getInviteDeposits = () => {
    if (!dateRange?.length) return;

    const params = {
      startTime: dateRange?.[0],
      endTime: dateRange?.[1],
      pageNumber: pageNumber,
      pageSize: 20,
      orderStatus: 3, // 3:成功
    };
    toast.loading(true);
    getDepositRecord(params)
      .then(({ data }) => {
        if (data.data) {
          setFinised(data.data.records.length < 20);
          if (pageNumber > 1) {
            setDataList((list) => list.concat(data.data.records));
          } else {
            setDataList(data.data.records);
          }
        } else {
          DeviceEventEmitter.emit("showErrMsg", {
            msg: data.msg || "Failed to get deposit records",
          });
        }
      })
      .finally(() => {
        toast.loading(false);
      });
  };

  useEffect(() => {
    if (dateRange?.length) {
      getInviteDeposits();
    }
  }, [dateRange, pageNumber]);

  const renderItem = ({ item, index }: { item: Data; index: number }) => (
    <View
      style={[
        styles.itemContent,
        {
          backgroundColor:
            index % 2 === 0
              ? Colors[theme].shadowColor
              : Colors[theme].activeColor,
        },
      ]}
    >
      <View style={styles.box}>
        <Text style={[styles.username, { color: Colors[theme].darkColor }]}>
          {item.username}
        </Text>
        <View style={styles.rightContent}>
          <Text style={styles.label}>{t("wallet.recharge.rechargeAmount")}</Text>
          <Text style={[styles.amount, { color: Colors[theme].primary }]}>
            {item.depositMoney}
          </Text>
        </View>
      </View>
      <View style={styles.box}>
        <View style={styles.rightContent}>
          <Text style={styles.label}>{t("common.time")}</Text>
          <Text style={styles.label}>
            {format(new Date(item.createTime), "yyyy-MM-dd HH:mm:ss")}
          </Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.label}>{t("agent.depositBonusTitle")}</Text>
          <Text style={styles.label}>{item.giftMoney ?? 0}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <View
        style={[
          styles.container,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <View className="flex-row justify-between items-center">
          <View style={{ flex: 1 }}>
            <DateRangePicker onConfirm={handleDateRangeConfirm} showLabel />
          </View>
        </View>

        {dataList.length > 0 ? (
          <FlatList
            className="hide-scrollbar py-3"
            data={dataList}
            renderItem={renderItem}
            keyExtractor={(_item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onEndReached={() => {
              if (!finished) setPageNumber((pg) => pg + 1);
            }}
            ListFooterComponent={
              <View className="justify-center items-center py-2">
                <Text
                  className="fontSize={12}"
                  style={{ color: Colors[theme].text }}
                >
                  {t("common.noMore")}
                </Text>
              </View>
            }
          />
        ) : (
          <View
            className="flex-1"
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <NoData />
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContent: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    marginBottom: 10,
    //paddingTop: 20,
  },
  evenItem: {
    backgroundColor: "#fff",
  },
  box: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    //paddingRight: 15,
  },
  username: {
    fontSize: 12,
  },
  rightContent: {
    alignItems: "flex-start",
    flexDirection: "column",
    minWidth: 100,
  },
  amount: {
    fontSize: 12,
  },
  label: {
    fontSize: 12,
    color: "#acafc2",
  },
  listContainer: {
    //paddingTop: 20
  },
});
