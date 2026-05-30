/** 我的分享-奖金信息*/
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, DeviceEventEmitter } from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { BetHisType, getUserAwardList } from "@/api";
import DateRangePicker from "../common/DateRangePicker";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/common/toast";
import { format } from "date-fns";
import { TimeRange } from "@/types";
import { I18nText } from "../I18nText";
import NoData from "../common/NoData";

interface Data {
  username?: string;
  rewardAmount?: number;
  claimedTime?: string | number;
  createTime?: string | number;
  sourceType?: string;
}

const pageSize = 20;

export const BonusInformation = () => {
  const { theme } = useTheme();
  const toast = useToast();
  const [dataList, setDataList] = useState<Data[]>([]);
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<TimeRange>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [finished, setFinished] = useState<boolean>(false);
  const [sourceTypeMap, setSourceTypeMap] = useState<Record<string, string>>({});

  const handleDateRangeConfirm = (range: TimeRange) => {
    setPageNumber(1);
    setDateRange(range);
  };

  useEffect(() => {
    getTypes();
  }, []);

  useEffect(() => {
    if (dateRange?.length) {
      getBonusData();
    }
  }, [dateRange, pageNumber]);

  const getBonusData = () => {
    if (!dateRange?.length) return;
    const params = {
      pageNo: pageNumber,
      pageSize,
      claimedTime: dateRange,
    };
    toast.loading(true);
    getUserAwardList(params)
      .then(({ data }) => {
        if (data.data) {
          if (pageNumber > 1) setDataList((list) => list.concat(data.data));
          else setDataList(data.data);
          if (data.data.length < pageSize) setFinished(true);
        } else {
          DeviceEventEmitter.emit("showErrMsg", {
            msg: data.msg || "Failed to get userawards list",
          });
        }
      })
      .finally(() => {
        toast.loading(false);
      });
  };

  const getTypes = () => {
    BetHisType({ type: "activity_type" }).then(({ data }) => {
      if (data.data) {
        const dictList: Record<string, string> = data.data.reduce(
          (obj: Record<string, string>, item: { value: string; label: string }) => {
            obj[item.value] = item.label;
            return obj;
          },
          {},
        );
        dictList["0"] = t("active.taskRecord.ssfanshui");
        setSourceTypeMap(dictList);
      } else {
        DeviceEventEmitter.emit("showErrMsg", {
          msg: data.msg || "Failed to types list",
        });
      }
    });
  };

  const renderItem = ({ item, index }: { item: Data; index: number }) => {
    const timestamp = item.claimedTime || item.createTime;
    return (
      <View
        style={[
          styles.itemContent,
          {
            backgroundColor:
              index % 2 === 0 ? Colors[theme].shadowColor : Colors[theme].activeColor,
          },
        ]}
      >
        <View style={styles.box}>
          <Text style={[styles.username, { color: Colors[theme].darkColor }]}>{item.username}</Text>
          <View style={styles.rightContent}>
            <Text style={styles.label}>{sourceTypeMap[item.sourceType || ""] || "--"}</Text>
          </View>
        </View>
        <View style={styles.box}>
          <Text style={styles.label}>
            {timestamp ? format(new Date(Number(timestamp)), "yyyy-MM-dd HH:mm:ss") : "-"}
          </Text>
          <View style={styles.rightContent}>
            <Text style={[styles.label, { color: Colors[theme].primary }]}>
              {t("agent.bonus")}：{item.rewardAmount}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className={`bg-${theme}-background gap-3`} style={[styles.container]}>
      <View className="flex-row justify-between items-center">
        <View style={{ flex: 1 }}>
          <DateRangePicker onConfirm={handleDateRangeConfirm} showLabel />
        </View>
      </View>

      {dataList.length > 0 ? (
        <FlatList
          data={dataList}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onEndReached={() => {
            if (!finished) setPageNumber((pg) => pg + 1);
          }}
          ListFooterComponent={
            <I18nText
              i18nKey="common.noMore"
              className={`text-center text-${theme}-textGray my-4`}
            />
          }
        />
      ) : (
        <View className="flex-1" style={{ justifyContent: "center", alignItems: "center" }}>
          <NoData />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContent: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    marginBottom: 10,
  },
  evenItem: {
    backgroundColor: "#fff",
  },
  box: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
    paddingRight: 15,
  },
  username: {
    fontSize: 12,
    color: "#333",
    flex: 1,
  },
  rightContent: {
    //alignItems: 'flex-start',
    //flexDirection: 'column',
    minWidth: 100,
  },
  amount: {
    fontSize: 12,
  },
  label: {
    fontSize: 12,
    color: "#999",
  },
  listContainer: {
    // paddingHorizontal: 5,
    // paddingVertical: 15,
  },
});
