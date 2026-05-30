/* * 活跃度变动记录（接口与筛选逻辑对齐 ngss-vue3 activity/pointRecord，UI 对齐 my/tranctionsRecord） */

import { getBatchDictData, getEngageRecordDetail } from "@/api";
import DateRangePicker from "@/components/common/DateRangePicker";
import ListNoMore from "@/components/common/ListNoMore";
import NoData from "@/components/common/NoData";
import { SimpleHeader } from "@/components/common/Header";
import { useToast } from "@/components/common/toast";
import DropdownButton from "@/components/record/DropdownButton";
import PopWindow from "@/components/record/PopWindow";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { TimeRange } from "@/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 20;
const FILTER_PREFIX_ST = "st:";
const FILTER_PREFIX_SC = "sc:";
const BOX_SOURCE_TYPE_VALUE = "99";

interface PickerColumn {
  text: string;
  value: string;
}

interface TypeData {
  label: string;
  value: string;
}

interface EngageRecordItem {
  id?: number | string;
  username?: string;
  uid?: string;
  memberId?: number;
  remark?: string;
  engage?: number;
  sourceName?: string;
  sourceId?: number | string;
  sourceType?: number | string;
  sourceCatalog?: string;
  engageType?: string | number;
  afterEngage?: number;
  beforeEngage?: number;
  bizNo?: string;
  createTime?: string | number;
}

function parseDictRows(data: unknown): {
  map: Record<string, string>;
  ordered: PickerColumn[];
} {
  const map: Record<string, string> = {};
  const ordered: PickerColumn[] = [];
  if (!Array.isArray(data)) return { map, ordered };
  data.forEach((item: { label: string; value: string | number }) => {
    const v = String(item.value);
    map[v] = item.label;
    ordered.push({ text: item.label, value: v });
  });
  return { map, ordered };
}

function mergeUnifiedOriginColumns(
  allLabel: string,
  activityTypeOrdered: PickerColumn[],
  activityBoxTypeOrdered: PickerColumn[],
  rewardCatalogOrdered: PickerColumn[],
  rewardBoxOrdered: PickerColumn[],
): TypeData[] {
  const next: TypeData[] = [{ label: allLabel, value: "" }];

  const pushSt = (text: string, rawValue: string) => {
    const id = `${FILTER_PREFIX_ST}${rawValue}`;
    next.push({ label: text, value: id });
  };
  const pushSc = (text: string, rawValue: string) => {
    const id = `${FILTER_PREFIX_SC}${rawValue}`;
    next.push({ label: text, value: id });
  };

  const stIndexByRaw = new Map<string, number>();
  for (const c of activityTypeOrdered) {
    pushSt(c.text, c.value);
    stIndexByRaw.set(c.value, next.length - 1);
  }
  for (const c of activityBoxTypeOrdered) {
    const idx = stIndexByRaw.get(c.value);
    if (idx !== undefined) {
      next[idx] = { label: c.text, value: `${FILTER_PREFIX_ST}${c.value}` };
    } else {
      pushSt(c.text, c.value);
      stIndexByRaw.set(c.value, next.length - 1);
    }
  }

  const seenSc = new Set<string>();
  for (const c of rewardCatalogOrdered) {
    if (seenSc.has(c.value)) continue;
    seenSc.add(c.value);
    pushSc(c.text, c.value);
  }
  for (const c of rewardBoxOrdered) {
    if (seenSc.has(c.value)) continue;
    seenSc.add(c.value);
    pushSc(c.text, c.value);
  }

  return next;
}

export default function PointBoxRecord() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();

  const [createTime, setCreateTime] = useState<TimeRange | undefined>(undefined);
  const [types, setTypes] = useState<TypeData[]>([]);
  const [selectedType, setSelectedType] = useState<TypeData>({
    value: "",
    label: t("recordChange.allText"),
  });
  const [dictsReady, setDictsReady] = useState(false);

  const [sourceTypeLabelMap, setSourceTypeLabelMap] = useState<Record<string, string>>({});
  const [boxSourceTypeLabelMap, setBoxSourceTypeLabelMap] = useState<Record<string, string>>({});
  const [catalogLabelMap, setCatalogLabelMap] = useState<Record<string, string>>({});
  const [boxCatalogLabelMap, setBoxCatalogLabelMap] = useState<Record<string, string>>({});

  const [dataList, setDataList] = useState<EngageRecordItem[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [listFetchCompleted, setListFetchCompleted] = useState(false);

  const [isPopWindowVisible, setIsPopWindowVisible] = useState(false);

  const mergedCatalogLabelMap = useMemo(
    () => ({ ...catalogLabelMap, ...boxCatalogLabelMap }),
    [catalogLabelMap, boxCatalogLabelMap],
  );

  const isBoxEngageRecord = (row: EngageRecordItem) =>
    String(row.sourceType ?? "") === BOX_SOURCE_TYPE_VALUE;

  const boxCatalogKey = (row: EngageRecordItem) => {
    const raw =
      row.engageType != null && row.engageType !== "" ? row.engageType : row.sourceCatalog;
    return raw != null && raw !== "" ? String(raw) : "";
  };

  const displaySourceName = useCallback(
    (row: EngageRecordItem) => {
      if (row.sourceName) return row.sourceName;
      const key = row.sourceType != null && row.sourceType !== "" ? String(row.sourceType) : "";
      if (isBoxEngageRecord(row) && key && boxSourceTypeLabelMap[key]) {
        return boxSourceTypeLabelMap[key];
      }
      if (key && sourceTypeLabelMap[key]) return sourceTypeLabelMap[key];
      return "-";
    },
    [boxSourceTypeLabelMap, sourceTypeLabelMap],
  );

  const displayCatalog = useCallback(
    (row: EngageRecordItem) => {
      const cat = boxCatalogKey(row);
      return (cat && mergedCatalogLabelMap[cat]) || cat || "-";
    },
    [mergedCatalogLabelMap],
  );

  const formatDateTime = (ts: string | number | undefined) => {
    if (ts === undefined || ts === null || ts === "") return "-";
    const d =
      typeof ts === "number"
        ? new Date(ts)
        : new Date(String(ts).replace(/-/g, "/"));
    if (Number.isNaN(d.getTime())) return "-";
    const pad = (x: number) => String(x).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await getBatchDictData(
          "activity_type,reward_catalogs,activity_box_type,reward_box_type",
        );
        if (cancelled) return;

        if (res?.data?.code !== 0) {
          if (!cancelled) setDictsReady(true);
          return;
        }

        const payload = res?.data?.data ?? {};
        const activityRows = Array.isArray(payload.activity_type) ? payload.activity_type : [];
        const rewardCatalogRows = Array.isArray(payload.reward_catalogs)
          ? payload.reward_catalogs
          : [];
        const boxTypeRows = Array.isArray(payload.activity_box_type)
          ? payload.activity_box_type
          : [];
        const rewardBoxRows = Array.isArray(payload.reward_box_type) ? payload.reward_box_type : [];

        const a1 = parseDictRows(activityRows);
        const catalogs = parseDictRows(rewardCatalogRows);
        const boxTypeMap: Record<string, string> = {};
        const boxTypeOrdered: PickerColumn[] = [];
        boxTypeRows.forEach((item: { label: string; value: string | number }) => {
          const v = String(item.value);
          boxTypeMap[v] = item.label;
          boxTypeOrdered.push({ text: item.label, value: v });
        });
        const a4 = parseDictRows(rewardBoxRows);

        setSourceTypeLabelMap(a1.map);
        setCatalogLabelMap(catalogs.map);
        setBoxSourceTypeLabelMap(boxTypeMap);
        setBoxCatalogLabelMap(a4.map);

        const merged = mergeUnifiedOriginColumns(
          t("recordChange.allText"),
          a1.ordered,
          boxTypeOrdered,
          catalogs.ordered,
          a4.ordered,
        );
        setTypes(merged);
        setDictsReady(true);
      } catch (e) {
        console.error("load engage dicts failed", e);
        if (!cancelled) setDictsReady(true);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    if (types.length > 0) {
      setSelectedType(types[0]);
    }
  }, [types]);

  /** 与 tranctionsRecord 一致：普通函数 + effect 依赖筛选条件，避免 loadMore 闭包与 effect 循环依赖 */
  const requestEngageRecord = (isLoadMore: boolean) => {
    if (!dictsReady || !createTime?.length) return;
    if (isLoadMore && !hasMore) return;
    if (isLoading) return;

    if (!isLoadMore) {
      setListFetchCompleted(false);
    }

    setIsLoading(true);
    toast.loading(true);

    const param: Record<string, unknown> = {
      createTime,
      pageNo: isLoadMore ? pageNo : 1,
      pageSize: PAGE_SIZE,
    };
    const fid = selectedType.value;
    if (fid.startsWith(FILTER_PREFIX_ST)) {
      param.sourceType = fid.slice(FILTER_PREFIX_ST.length);
    } else if (fid.startsWith(FILTER_PREFIX_SC)) {
      param.sourceCatalog = fid.slice(FILTER_PREFIX_SC.length);
    }

    void getEngageRecordDetail(param)
      .then((res) => {
        if (res?.data?.code === 0) {
          const rawList = res.data?.data?.list;
          const list: EngageRecordItem[] = Array.isArray(rawList) ? rawList : [];
          const totalRaw = res.data?.data?.total;
          const total =
            typeof totalRaw === "number" && Number.isFinite(totalRaw)
              ? totalRaw
              : Number(totalRaw) || 0;
          setTotalCount(total);

          if (list.length > 0) {
            if (isLoadMore) {
              setDataList((prev) => [...prev, ...list]);
              setPageNo((p) => p + 1);
            } else {
              setDataList(list);
              setPageNo(list.length === PAGE_SIZE ? 2 : 1);
            }
            setHasMore(list.length === PAGE_SIZE);
          } else {
            setHasMore(false);
            if (!isLoadMore) {
              setDataList([]);
            }
          }
        } else {
          if (res?.data?.msg) {
            toast.error(String(res.data.msg));
          }
          if (!isLoadMore) setDataList([]);
          setHasMore(false);
        }
      })
      .catch((err) => {
        console.error("getEngageRecordDetail failed", err);
        if (!isLoadMore) setDataList([]);
        setHasMore(false);
      })
      .finally(() => {
        setIsLoading(false);
        setListFetchCompleted(true);
        toast.loading(false);
      });
  };

  useEffect(() => {
    setDataList([]);
    setPageNo(1);
    if (dictsReady && createTime?.length) {
      requestEngageRecord(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅在筛选条件变化时重新拉第一页，与 tranctionsRecord 一致
  }, [createTime, selectedType.value, dictsReady]);

  const handleEndReached = () => {
    if (hasMore && !isLoading) {
      requestEngageRecord(true);
    }
  };

  const renderItem = ({ item }: { item: EngageRecordItem }) => (
    <View style={[styles.recordItem, { backgroundColor: Colors[theme].cardBg1 }]}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: Colors[theme].lightText }]}>
          {t("active.engageSourceName")}
        </Text>
        <Text style={[styles.value, { color: Colors[theme].text }]}>{displaySourceName(item)}</Text>
      </View>
      <View style={styles.hr} />

      <View style={styles.row}>
        <Text style={[styles.label, { color: Colors[theme].lightText }]}>
          {t("active.engageCategory")}
        </Text>
        <Text style={[styles.value, { color: Colors[theme].text }]}>{displayCatalog(item)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: Colors[theme].lightText }]}>
          {t("active.engageChange")}
        </Text>
        <Text style={[styles.value, { color: Colors[theme].primary }]}>
          {item.engage != null ? String(item.engage) : "-"}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: Colors[theme].lightText }]}>
          {t("active.engageAfterChange")}
        </Text>
        <Text style={[styles.value, { color: Colors[theme].text }]}>
          {item.afterEngage != null ? String(item.afterEngage) : "-"}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: Colors[theme].lightText }]}>
          {t("active.engageId")}
        </Text>
        <Text style={[styles.value, { color: Colors[theme].text }]}>{item.uid || "-"}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: Colors[theme].lightText }]}>
          {t("active.createTime")}
        </Text>
        <Text style={[styles.value, { color: Colors[theme].text }]}>
          {item.createTime ? formatDateTime(item.createTime) : "-"}
        </Text>
      </View>
    </View>
  );

  const listFooter = useMemo(() => {
    if (!listFetchCompleted || dataList.length === 0) return null;
    if (totalCount > 0 && dataList.length >= totalCount) return <ListNoMore />;
    if (!hasMore) return <ListNoMore />;
    return null;
  }, [listFetchCompleted, dataList.length, totalCount, hasMore]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <SimpleHeader title={t("active.engageRecord")} />
      <View style={styles.dropdownBtnsRow}>
        <DropdownButton
          className="h-10"
          text={selectedType?.label || t("recordChange.allText")}
          style={{ flex: 1 }}
          onPress={() => setIsPopWindowVisible(true)}
        />
        <DateRangePicker style={{ flex: 1 }} onConfirm={setCreateTime} showLabel />
      </View>

      {dataList.length > 0 ? (
        <FlatList
          style={styles.list}
          data={dataList}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.id != null ? String(item.id) : `${item.createTime ?? ""}-${index}`
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          className="hide-scrollbar"
          contentContainerStyle={styles.listContent}
          ListFooterComponent={listFooter}
        />
      ) : !isLoading && listFetchCompleted ? (
        <NoData style={{ marginTop: 150 }} />
      ) : null}

      <PopWindow
        isVisible={isPopWindowVisible}
        setIsVisible={setIsPopWindowVisible}
        data={types.map((ty) => ({ title: ty.label }))}
        onItemPress={(index) => {
          const newType = types[index];
          if (newType?.value !== selectedType?.value) {
            setDataList([]);
            setPageNo(1);
            setHasMore(true);
            setSelectedType(types[index]);
            setIsPopWindowVisible(false);
          }
        }}
        selectedIndex={types.findIndex((ty) => ty.value === selectedType?.value)}
        setSelectedIndex={() => {}}
        hideHeader={true}
      />
    </SafeAreaView>
  );
}

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
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  recordItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  hr: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(128,128,128,0.35)",
    marginVertical: 8,
  },
  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    flexShrink: 0,
  },
  value: {
    fontSize: 13,
    flex: 1,
    textAlign: "right",
  },
});
