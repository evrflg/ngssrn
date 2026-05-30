import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import {
  betRecordGetEffectiveGameType,
  betRecordGetPartnerList,
  betRecordGetGameRecord,
} from "@/api/post/record";
import DateRangePicker from "@/components/common/DateRangePicker";
import { SimpleHeader } from "@/components/common/Header";
import NoData from "@/components/common/NoData";
import { useToast } from "@/components/common/toast";
import DropdownButton from "@/components/record/DropdownButton";
import PopWindow from "@/components/record/PopWindow";
import RecordTab from "@/components/record/RecordTab";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { yearMonthDayHourMinSecond } from "@/assets/js/date";
import { screen } from "@/utils/screen";
import { formatMoney } from "@/utils/utils";
import {
  BetRecordListItem,
  BetRecordItem as BetRecordListItemType,
} from "../../components/record/BetRecordListItem";
import { RootState } from "@/store/store";
import { TimeRange } from "@/types";
import ListNoMore from "@/components/common/ListNoMore";

// 定义 Tab 数据结构
interface GameTypeItem {
  id: number;
  name: string;
  icon: string;
  selectIcon: string;
  gameType: number;
}

// 定义平台数据结构
interface PartnerInfo {
  id: number;
  name: string;
  partnerCode: string;
  gameType: number;
}

// 定义游戏记录数据结构
interface BetRecordItem {
  id: number;
  betNo: string | null;
  gameType: number;
  partnerName: string;
  userAccount: string;
  gameName: string | null;
  betAmount: number;
  validBet: number;
  bonusAmount: number;
  winLossAmount: number;
  betTime: string;
  qiHao: string | null;
  playName: string | null;
  content?: string;
  openHaoma?: string;
  openStatus?: string;
  feeMoney?: number;
}

// 定义游戏类型枚举(值后边的注释是vue版本对应的 num，但是在这里没有影响，所以直接用后台返回的type)
export enum GameType {
  SPORTS = 0,
  LIVE = 1,
  ELECTRONIC = 2, // 电子
  LOTTERY = 3, // 7
  CHESS = 4, // 3
  FISHING = 7, //4
  ESPORT = 6, // 电竞
}

// 定义平台选项接口
export interface PlatformOption {
  name: string;
  value: string;
  platform: number | string;
}

// 游戏类型图标映射
const GAME_TYPE_ICON_MAP: Record<number, string> = {
  8: "lottery", // 彩票
  1: "real", // 真人
  6: "qipai", // 棋牌
  4: "sport", // 体育
  3: "fishing", // 捕鱼
  7: "dianjing", // 电竞
  2: "dianzi", // 电子
};

// 游戏类型名称映射
const GAME_TYPE_NAME_MAP: Record<number, string> = {
  8: "games.name.lottery", // 彩票
  1: "games.name.live", // 真人
  6: "games.name.chess", // 棋牌
  4: "games.name.sport", // 体育
  3: "games.name.fishing", // 捕鱼
  7: "games.name.esport", // 电竞
  2: "games.name.egame", // 电子
};

let totalDataNumber = 0;
export default function BetRecord() {
  const toast = useToast();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [baseIndex, setBaseIndex] = useState(0); // 当前选中的 tab
  const [selectedPlatformIndex, setSelectedPlatformIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BetRecordItem[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformOption>({
    // 平台
    name: t("betRecord.allPlatform"),
    value: "",
    platform: "",
  });
  const [gameTypes, setGameTypes] = useState<GameTypeItem[]>([
    {
      id: 0,
      name: t("status.allText"),
      icon: "all",
      selectIcon: "all",
      gameType: 0,
    },
  ]);
  const [partners, setPartners] = useState<PartnerInfo[]>([]);
  const [isPopWindowVisible, setIsPopWindowVisible] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [dateRange, setDateRange] = useState<TimeRange>();
  const [isViewLoading, setIsViewLoading] = useState(false);
  /** 用于强制触发列表刷新（比如回到“全部”但 dateRange 仍是今天时） */
  const [refreshSeq, setRefreshSeq] = useState(0);
  const PAGE_SIZE = 20;
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  /** 避免同一筛选条件被重复触发请求（会导致列表闪烁） */
  const inFlightQueryKeyRef = useRef<string | null>(null);

  // Modal相关状态
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<BetRecordListItemType | null>(null);
  const screenWidth = Dimensions.get("window").width;
  const isWeb = Platform.OS === "web";
  const modalWidth = isWeb
    ? Math.min(screenWidth * 0.9, 440)
    : screenWidth - 80;
  const isMountedRef = useRef(true);

  // 处理列表项点击
  const handleItemPress = useCallback(
    (index: number, item: BetRecordListItemType) => {
      setSelectedItem(item);
      setModalVisible(true);
    },
    [],
  );

  // 关闭Modal
  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedItem(null);
  }, []);

  // 获取游戏类型数据
  const fetchGameTypes = async () => {
    toast.loading(true);

    try {
      const res = await betRecordGetEffectiveGameType({});
      if (res.data?.code === 0 && res.data?.data && isMountedRef.current) {
        // API 返回的是数字数组，需要转换为对象数组
        const gameTypeNumbers = res.data.data;
        const gameTypeObjects = gameTypeNumbers.map((gameType: number) => ({
          id: gameType,
          name: GAME_TYPE_NAME_MAP[gameType] || `${gameType}`,
          icon: GAME_TYPE_ICON_MAP[gameType] || "all",
          selectIcon: GAME_TYPE_ICON_MAP[gameType] || "all",
          gameType: gameType,
        }));

        // 将默认元素添加到数组开头
        const defaultElement = {
          id: 0,
          name: t("status.allText"),
          icon: "all",
          selectIcon: "all",
          gameType: 0, // 0 表示全部
        };

        setGameTypes([defaultElement, ...gameTypeObjects]);
        setIsDataLoaded(true);
      } else {
        if (res.data?.msg) {
          toast.error(res.data.msg);
        }
      }
    } catch (error) {
      console.error("获取游戏类型失败:", error);
    } finally {
      toast.loading(false);
    }
  };

  // 获取平台列表数据
  const fetchPartners = async (gameType: number) => {
    toast.loading(true);

    try {
      // 当gameType为0（默认元素）时，不传递gameType参数
      const params = gameType === 0 ? {} : { gameType };
      const res = await betRecordGetPartnerList(params);
      if (res.data?.code === 0 && res.data?.data && isMountedRef.current) {
        setPartners(res.data.data);
      } else {
        if (res.data?.msg) {
          toast.error(res.data.msg);
        }
      }
    } catch (error) {
      console.error("获取平台列表失败:", error);
    } finally {
      toast.loading(false);
    }
  };

  // 获取游戏记录数据
  const fetchGameRecords = async (
    isLoadMore: boolean = false,
    queryKey?: string,
  ) => {
    if (isLoadMore && !hasMore) return;

    const currentGameType = gameTypes[baseIndex];
    if (!currentGameType || currentGameType.gameType === undefined) return;

    if (!isLoadMore && queryKey) {
      if (inFlightQueryKeyRef.current === queryKey) return;
      inFlightQueryKeyRef.current = queryKey;
    }

    setLoading(true);

    const param: any = {
      partnerId: selectedPlatform.platform
        ? selectedPlatform.platform.toString()
        : undefined,
      betTime: dateRange,
      pageNo: (isLoadMore ? pageNumber : 1).toString(),
      pageSize: PAGE_SIZE.toString(),
      userId: userInfo?.memberId,
    };

    // 当不是默认元素（gameType不为0）时，才添加gameType参数
    if (currentGameType.gameType !== 0) {
      param.gameType = currentGameType.gameType.toString();
    }

    toast.loading(true);
    try {
      const res = await betRecordGetGameRecord(param);
      if (res.data?.code === 0 && res.data?.data && isMountedRef.current) {
        const newData = res.data.data.list || [];
        totalDataNumber = Number(res.data.data.total) ?? 0;
        if (isLoadMore) {
          setData((prevData) => [...prevData, ...newData]);
          setPageNumber((prev) => prev + 1);
        } else {
          setData(newData);
          setPageNumber(newData.length === PAGE_SIZE ? 2 : 1);
        }
        setHasMore(newData.length === PAGE_SIZE);
      } else {
        if (res.data?.msg) {
          toast.error(res.data.msg);
        }
      }
    } catch (error) {
      console.error("获取游戏记录失败:", error);
    } finally {
      if (!isLoadMore && queryKey && inFlightQueryKeyRef.current === queryKey) {
        inFlightQueryKeyRef.current = null;
      }
      if (isMountedRef.current) {
        setLoading(false);
      }
      toast.loading(false);
    }
  };

  // 初始化时获取游戏类型
  useEffect(() => {
    fetchGameTypes();

    // 组件卸载时清理
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 当游戏类型变化时获取对应的平台列表
  useEffect(() => {
    if (gameTypes.length > 0) {
      const currentGameType = gameTypes[baseIndex];
      if (currentGameType && currentGameType.gameType !== undefined) {
        fetchPartners(currentGameType.gameType);
      }
    }
  }, [gameTypes, baseIndex]);

  // 当依赖项变化时获取游戏记录
  useEffect(() => {
    if (
      gameTypes.length <= 0 ||
      !dateRange?.length ||
      refreshSeq === 0 ||
      selectedPlatform.platform === undefined
    )
      return;
    console.log("~~~~~~~~~~~~", gameTypes.length);
    // 只依赖“真正影响查询参数”的字段，避免 gameTypes / selectedPlatform 对象引用变化引起重复请求
    const partnerId = selectedPlatform.platform
      ? String(selectedPlatform.platform)
      : "";
    const gameType = gameTypes[baseIndex]?.gameType ?? "";
    const qk = `${userInfo?.memberId ?? ""}|${partnerId}|${gameType}|${dateRange[0]}|${dateRange[1]}|${refreshSeq}`;
    fetchGameRecords(false, qk);
  }, [
    baseIndex,
    dateRange,
    refreshSeq,
    selectedPlatform.platform,
    userInfo?.memberId,
    gameTypes.length,
  ]);
  // useEffect(() => {
  //   if (gameTypes.length <= 0 || !dateRange?.length) return;
  //   console.log('~~~~~~~~~~~~');
  //   // 只依赖“真正影响查询参数”的字段，避免 gameTypes / selectedPlatform 对象引用变化引起重复请求
  //   const partnerId = selectedPlatform.platform ? String(selectedPlatform.platform) : "";
  //   const gameType = gameTypes[baseIndex]?.gameType ?? "";
  //   const qk = `${userInfo?.memberId ?? ""}|${partnerId}|${gameType}|${dateRange[0]}|${dateRange[1]}|${refreshSeq}`;
  //   fetchGameRecords(false, qk);
  // }, [
  //   baseIndex,
  //   dateRange,
  //   refreshSeq,
  //   selectedPlatform.platform,
  //   userInfo?.memberId,
  //   gameTypes.length,
  // ]);

  // 上拉加载
  const handleEndReached = React.useCallback(() => {
    if (hasMore && !loading && gameTypes.length > 0) {
      fetchGameRecords(true);
    }
  }, [hasMore, loading, gameTypes]);

  // 根据当前选中的 tab 获取对应的平台列表
  const getCurrentPlatforms = useCallback(() => {
    if (partners.length > 0) {
      return [
        { name: t("betRecord.allPlatform"), value: "", platform: "" },
        ...partners.map((partner) => ({
          name: partner.name,
          value: partner.partnerCode,
          platform: partner.id.toString(),
        })),
      ];
    }
    return [{ name: t("betRecord.allPlatform"), value: "", platform: "" }];
  }, [partners, t]);

  // 重置日期范围
  const handleResetDateRange = useCallback(() => {
    if (isViewLoading) return;
    setIsViewLoading(true);
    requestAnimationFrame(() => {
      setIsViewLoading(false);
    });

    // 强制触发一次刷新，确保“回到全部”时即使筛选值没变也会重新拉取
    setRefreshSeq((s) => s + 1);
  }, [isViewLoading]);

  // 计算骨骼占位的 tab 宽度（模拟 RecordTab 的逻辑）
  const skeletonTabWidth = screen.get("window").width / Math.min(8, 5.3);

  // 骨骼占位组件
  const SkeletonTab = () => (
    <View style={[styles.skeletonTabContainer, { width: skeletonTabWidth }]}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonText} />
    </View>
  );

  // 骨骼占位 topTab
  const skeletonTopTab = (
    <View
      style={styles.topContainer}
      className={`bg-${theme}-btnText rounded-sm`}
    >
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            marginTop: 10,
          }}
          scrollEventThrottle={16}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <View
              key={index}
              style={{ position: "relative", width: skeletonTabWidth }}
            >
              <View
                style={[
                  { width: skeletonTabWidth },
                  {
                    borderRadius: 8,
                  },
                ]}
              >
                <SkeletonTab />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  // 下注游戏类型
  const topTab = (
    <View
      style={styles.topContainer}
      className={`bg-${theme}-btnText rounded-sm`}
    >
      <View style={styles.tabContainer}>
        <RecordTab
          selectedIndex={baseIndex}
          setIndex={(index: number) => {
            setData([]);
            setBaseIndex(index);
            // 重置平台选择为第一项
            setSelectedPlatform({
              name: t("betRecord.allPlatform"),
              value: "",
              platform: "",
            });
            setSelectedPlatformIndex(0);
            // 重置日期为今天
            handleResetDateRange();
            // 切 Tab 时强制触发一次列表刷新（避免 iOS 下 FlatList/状态复用导致不刷新）
            //setRefreshSeq((s) => s + 1);
          }}
          tabs={gameTypes.map((tab) => ({
            name: t(tab.name),
            icon: GAME_TYPE_ICON_MAP[tab.gameType] || "all",
          }))}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} className={`bg-${theme}-background`}>
      <SimpleHeader title={t("betRecord.title")} />

      {/* 显示骨骼占位或真实的 topTab */}
      {!isDataLoaded || gameTypes.length === 0 ? skeletonTopTab : topTab}

      <View style={styles.dropdownBtnsRow}>
        <DropdownButton
          text={selectedPlatform.name}
          style={{ flex: 1 }}
          onPress={() => setIsPopWindowVisible(true)}
        />
        <DateRangePicker
          onConfirm={setDateRange}
          style={{ flex: 1 }}
          showLabel
        />
      </View>
      {data.length > 0 ? (
        <FlatList
          key={`${baseIndex}-${selectedPlatformIndex}`}
          extraData={`${baseIndex}-${selectedPlatformIndex}-${refreshSeq}`}
          data={data}
          renderItem={({ item, index }) => (
            <BetRecordListItem
              item={item}
              currentTabType={gameTypes[baseIndex]?.gameType}
              index={index}
              onItemPress={handleItemPress}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          // contentContainerStyle={styles.listContainer}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          className="hide-scrollbar"
          ListFooterComponent={
            totalDataNumber === data.length ? <ListNoMore /> : null
          }
        />
      ) : !loading && dateRange?.length && gameTypes.length > 0 ? (
        <NoData style={{ marginTop: 150 }} />
      ) : null}

      <PopWindow
        isVisible={isPopWindowVisible}
        setIsVisible={setIsPopWindowVisible}
        data={getCurrentPlatforms().map((item: PlatformOption) => ({
          title: item.name,
        }))}
        onItemPress={(index) => {
          const platforms = getCurrentPlatforms();
          setSelectedPlatform(platforms[index]);
          setSelectedPlatformIndex(index);
        }}
        selectedIndex={selectedPlatformIndex}
        setSelectedIndex={setSelectedPlatformIndex}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: Colors[theme].btnText,
                width: modalWidth,
                marginHorizontal: isWeb ? 0 : 40,
              },
            ]}
          >
            {selectedItem && (
              <View style={styles.modalBody}>
                <Text
                  style={[styles.playNameText, { color: Colors[theme].text }]}
                >
                  {selectedItem.playName}
                </Text>

                <Text
                  style={[styles.betTimeText, { color: Colors[theme].text }]}
                >
                  {yearMonthDayHourMinSecond(selectedItem.betTime)}
                </Text>

                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor: "#e6e8e8",
                      width: modalWidth,
                      marginLeft: -20,
                    },
                  ]}
                />

                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.leftDot,
                      { backgroundColor: Colors[theme].primary },
                    ]}
                  />
                  <Text
                    style={[styles.infoLabel, { color: Colors[theme].text }]}
                  >
                    {t("betRecord.platformType")}
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: Colors[theme].text }]}
                  >
                    {selectedItem.partnerName}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.leftDot,
                      { backgroundColor: Colors[theme].primary },
                    ]}
                  />
                  <Text
                    style={[styles.infoLabel, { color: Colors[theme].text }]}
                  >
                    {t("betRecord.username")}
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: Colors[theme].text }]}
                  >
                    {userInfo.member.username}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.leftDot,
                      { backgroundColor: Colors[theme].primary },
                    ]}
                  />
                  <Text
                    style={[styles.infoLabel, { color: Colors[theme].text }]}
                  >
                    {t("betRecord.gameType")}
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: Colors[theme].text }]}
                  >
                    {t(gameTypes[baseIndex]?.name || "")}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.leftDot,
                      { backgroundColor: Colors[theme].primary },
                    ]}
                  />
                  <Text
                    style={[styles.infoLabel, { color: Colors[theme].text }]}
                  >
                    {t("betRecord.orderId")}
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: Colors[theme].text }]}
                  >
                    {selectedItem.betNo}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.leftDot,
                      { backgroundColor: Colors[theme].primary },
                    ]}
                  />
                  <Text
                    style={[styles.infoLabel, { color: Colors[theme].text }]}
                  >
                    {t("betRecord.betTime")}
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: Colors[theme].text }]}
                  >
                    {yearMonthDayHourMinSecond(selectedItem.betTime)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.leftDot,
                      { backgroundColor: Colors[theme].primary },
                    ]}
                  />
                  <Text
                    style={[styles.infoLabel, { color: Colors[theme].text }]}
                  >
                    {t("wallet.recordList.withdrawFeeAmount")}
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: Colors[theme].text }]}
                  >
                    {formatMoney(selectedItem.feeMoney ?? 0)}
                  </Text>
                </View>

                <View style={styles.rectangleContainer}>
                  <View
                    style={[
                      styles.rectangle,
                      { backgroundColor: Colors[theme].background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rectangleTopText,
                        { color: Colors[theme].text },
                      ]}
                    >
                      {selectedItem.betAmount}
                    </Text>
                    <Text
                      style={[
                        styles.rectangleBottomText,
                        { color: Colors[theme].lightText },
                      ]}
                    >
                      {t("betRecord.betAmount")}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.rectangle,
                      { backgroundColor: Colors[theme].background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rectangleTopText,
                        {
                          color:
                            selectedItem.winLossAmount > 0
                              ? "#4caf50"
                              : "#FF4500",
                        },
                      ]}
                    >
                      {selectedItem.winLossAmount}
                    </Text>
                    <Text
                      style={[
                        styles.rectangleBottomText,
                        { color: Colors[theme].lightText },
                      ]}
                    >
                      {t("betRecord.winLossAmount")}
                    </Text>
                  </View>
                </View>

                <View style={styles.rectangleContainer}>
                  <View
                    style={[
                      styles.rectangle,
                      { backgroundColor: Colors[theme].background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rectangleTopText,
                        { color: Colors[theme].text },
                      ]}
                    >
                      {selectedItem.validBet}
                    </Text>
                    <Text
                      style={[
                        styles.rectangleBottomText,
                        { color: Colors[theme].lightText },
                      ]}
                    >
                      {t("promotion.validBet")}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.rectangle,
                      { backgroundColor: Colors[theme].background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rectangleTopText,
                        { color: Colors[theme].text },
                      ]}
                    >
                      {selectedItem.qiHao ?? "--"}
                    </Text>
                    <Text
                      style={[
                        styles.rectangleBottomText,
                        { color: Colors[theme].lightText },
                      ]}
                    >
                      {t("betRecord.gameCode")}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.returnButton,
                    { backgroundColor: Colors[theme].primary },
                  ]}
                  onPress={closeModal}
                >
                  <Text
                    style={[
                      styles.returnButtonText,
                      { color: Colors[theme].btnText },
                    ]}
                  >
                    {t("common.fanhui")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topContainer: {
    marginTop: 8,
    marginLeft: 15,
    marginRight: 15,
  },
  tabContainer: {
    position: "relative",
  },
  dropdownBtnsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 12,
    gap: 12,
    alignItems: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 15,
    paddingLeft: 20,
    gap: 8,
  },
  checkboxText: {
    fontSize: 14,
    color: "#666666",
  },
  listContainer: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  toolItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    width: "100%",
  },
  toolItemText: {
    marginLeft: 8,
    fontSize: 14,
  },
  item: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 12,
    padding: 0,
    maxHeight: "80%",
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalBody: {
    padding: 20,
  },
  playNameText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 10,
  },
  betTimeText: {
    fontSize: 16,
    textAlign: "left",
  },
  divider: {
    height: 1,
    marginVertical: 8,
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  leftDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
    textAlign: "left",
  },
  infoValue: {
    fontSize: 14,
    textAlign: "right",
  },
  rectangleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  rectangle: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  rectangleTopText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  rectangleBottomText: {
    fontSize: 12,
  },
  returnButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  returnButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  // 骨骼占位样式
  skeletonTabContainer: {
    alignItems: "center",
    justifyContent: "space-between",
    height: 55,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  skeletonIcon: {
    width: 22,
    height: 22,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonText: {
    width: 30,
    height: 12,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
  },
});
