import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  DeviceEventEmitter,
  StyleSheet,
  Pressable,
} from "react-native";
import { rf } from "@/utils/scaleFont";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { getFeedback } from "@/api/post/my";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import FeedbackDetail from "./FeedbackDetail";
import DateRangePicker from "@/components/common/DateRangePicker";
import { format } from "date-fns";
import { Colors } from "@/constants/Colors";
import { TimeRange } from "@/types";
import NoData from "@/components/common/NoData";

interface FeedbackItem {
  id: string;
  type: number;
  feedbackContent: string;
  file?: string;
  status?: number;
  createTime?: number;
}

const PAGE_SIZE = 20;

const FeedbackList = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string>("");
  const [dateRange, setDateRange] = useState<TimeRange>()

  const statusMap = new Map([
    [0, t("userFeedback.waitingProcess")],
    [1, t("userFeedback.replied")],
    [2, t("userFeedback.adopted")],
    [3, t("userFeedback.ignored")],
  ]);

  const statusColorMap = new Map([
    [0, Colors[theme].primary],
    [1, "#2196f3"],
    [2, "#4caf50"],
    [3, "#9e9e9e"],
  ]);

  // Fetch feedback list
  const fetchFeedbackList = async () => {
    if (!dateRange?.length) return;
    setLoading(true);
    const params = {
      startTime: dateRange?.[0],
      endTime: dateRange?.[1],
      pageNo: currentPage,
      pageSize: PAGE_SIZE,
    };
    await getFeedback(params)
      .then(({ data }) => {
        if (data.data) {
          setTotalCount(Number(data.data.total || 0));
          if (Array.isArray(data.data.list)) {
            const newItems: FeedbackItem[] = data.data.list.map(
              (item: any) => ({
                id: String(item.id),
                type: Number(item.type || 0),
                feedbackContent: item.feedbackContent ?? "",
                file: item.file ?? undefined,
                status: item.status ?? 0,
                createTime: item.createTime
                  ? Number(item.createTime)
                  : undefined,
              })
            );
            if (currentPage > 1)
              setFeedbackItems((items) => items.concat(newItems));
            else setFeedbackItems(newItems);
          }
        } else {
          DeviceEventEmitter.emit("showErrMsg", {
            msg: data.msg || "Failed to get feedback list",
          });
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Handle page change
  const handlePageChange = (pageNum: number) => {
    if (pageNum === currentPage || pageNum < 1 || pageNum > totalPages) return;
    fetchFeedbackList();
  };

  // Initial load
  useEffect(() => {
    if (dateRange?.length) {
      fetchFeedbackList();
    }
  }, [dateRange, currentPage]);

  // Handle refresh
  const handleRefresh = () => {
    if (loading) return;
    setRefreshing(true);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (range: TimeRange) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  // Open feedback detail
  const handleOpenDetail = (item: FeedbackItem) => {
    setSelectedFeedbackId(item.id);
    setShowDetailModal(true);
  };

  // Close detail modal
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedFeedbackId("");
    setCurrentPage(1);
  };

  // Render feedback item
  const renderFeedbackItem = ({ item }: { item: FeedbackItem }) => (
    <Pressable
      className={`bg-${theme}-cardBg1 rounded-lg p-3 mb-3 shadow-sm`}
      onPress={() => handleOpenDetail(item)}
      key={`feedback-item-${item.id}`}
    >
      <View className="flex-row justify-between items-center mb-1" style={{ gap: 8 }}>
        <View className="flex-row flex-1" style={{ minWidth: 0, marginRight: 8 }}>
          <Text
            className={`text-${theme}-text`}
            style={{ fontSize: rf(12), flexShrink: 0 }}
          >
            ID:{" "}
          </Text>
          <Text
            className={`text-${theme}-text font-medium`}
            style={{ fontSize: rf(12), flex: 1, minWidth: 0 }}
            numberOfLines={2}
            ellipsizeMode="middle"
          >
            {item.id}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text
            className="mr-1"
            style={{ color: statusColorMap.get(item.status || 0), fontSize: rf(12) }}
          >
            {statusMap.get(item.status || 0) ?? ""}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            className={`text-${theme}-primary`}
            color={Colors[theme].primary}
          />
        </View>
      </View>
      <View>
        <View className="flex-row justify-between mb-1">
          <Text
            className={`text-${theme}-text`}
            style={{ fontSize: rf(12) }}
          >
            {t("userFeedback.feedContent")}:
          </Text>
          <Text
            className={`text-${theme}-text`}
            style={{ fontSize: rf(12) }}
          >
            {format(new Date(Number(item.createTime)), "yyyy-MM-dd HH:mm:ss")}
          </Text>
        </View>

        <Text
          className={`text-${theme}-primary leading-5`}
          style={{ fontSize: rf(14), maxWidth: "100%" }}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {item.feedbackContent}
        </Text>
      </View>
    </Pressable>
  );

  // Render footer (loading indicator)
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="p-3 justify-center items-center">
        <ActivityIndicator size="small" color={`${theme}-primary`} />
      </View>
    );
  };

  // Render no data
  const renderNoData = () => {
    if (loading || feedbackItems.length > 0) return null;
    return (
      <View className="flex-1 justify-center items-center p-5">
        <NoData />
      </View>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis
    if (startPage > 1) {
      pages.push(
        <TouchableOpacity
          key="first"
          onPress={() => handlePageChange(1)}
          className={`px-3 py-2 mx-1 rounded ${currentPage === 1 ? `bg-${theme}-primary` : `bg-${theme}-cardBg1`
            }`}
        >
          <Text
            className={
              currentPage === 1 ? "text-white" : `text-${theme}-text`
            }
            style={{ fontSize: rf(14) }}
          >
            1
          </Text>
        </TouchableOpacity>
      );
      if (startPage > 2) {
        pages.push(
          <Text
            key="ellipsis1"
            className={`text-${theme}-text mx-2`}
            style={{ fontSize: rf(14) }}
          >
            ...
          </Text>
        );
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          onPress={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 rounded ${currentPage === i ? `bg-${theme}-primary` : `bg-${theme}-cardBg1`
            }`}
        >
          <Text
            className={
              currentPage === i ? "text-white" : `text-${theme}-text`
            }
            style={{ fontSize: rf(14) }}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    // Add last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <Text
            key="ellipsis2"
            className={`text-${theme}-text mx-2`}
            style={{ fontSize: rf(14) }}
          >
            ...
          </Text>
        );
      }
      pages.push(
        <TouchableOpacity
          key="last"
          onPress={() => handlePageChange(totalPages)}
          className={`px-3 py-2 mx-1 rounded ${currentPage === totalPages
            ? `bg-${theme}-primary`
            : `bg-${theme}-cardBg1`
            }`}
        >
          <Text
            className={
              currentPage === totalPages ? "text-white" : `text-${theme}-text`
            }
            style={{ fontSize: rf(14) }}
          >
            {totalPages}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View className="flex-row justify-center items-center py-4">{pages}</View>
    );
  };

  return (
    <View className="flex-1 p-3">
      <View
        className="flex-row justify-between items-center"
        style={styles.dropdownBtnsRow}
      >
        <DateRangePicker
          style={{ height: 45, flex: 1 }}
          textStyle={{ fontSize: rf(14) }}
          onConfirm={handleDateRangeChange}
        />
      </View>
      {/* Feedback List */}
      <FlatList
        data={feedbackItems}
        renderItem={renderFeedbackItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingBottom: 20,
          flexGrow: feedbackItems.length ? undefined : 1,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          <>
            {renderFooter()}
            {renderPagination()}
          </>
        }
        ListEmptyComponent={renderNoData}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        className="hide-scrollbar"
      />

      {/* Feedback Detail Modal */}
      <FeedbackDetail
        visible={showDetailModal}
        feedbackId={selectedFeedbackId}
        onClose={handleCloseDetail}
        onRefresh={() => fetchFeedbackList()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownBtnsRow: {
    marginVertical: 12,
    gap: 12,
  },
  optionsModal: {
    margin: 0,
    alignItems: "center",
    justifyContent: "flex-end",
  },
});

export default FeedbackList;
