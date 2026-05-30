/**用户列表 */
import { getUserPageList, getVips } from "@/api";
import { useToast } from "@/components/common/toast";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useDynamicMaxWidth } from "@/hooks/useMaxWidth";
import { TimeRange } from "@/types";
import { rf } from "@/utils/scaleFont";
import { Ionicons } from "@expo/vector-icons";
import { Icon } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import DateRangePicker from "../common/DateRangePicker";
import NoData from "../common/NoData";
import { I18nText } from "../I18nText";

interface UserItem {
  id?: number;
  username?: string;
  type?: number;
  degreeId?: number;
  level?: number;
  uid?: string;
  onlineStatus?: number;
  cashBalance?: number;
  degreeName?: string;
}

interface VipOption {
  id: string;
  levelName: string;
}

const PAGE_SIZE = 20;
const SEARCH_ROW_HEIGHT = 32;

export default function UserList() {
  const { maxWidth } = useDynamicMaxWidth();
  const { theme } = useTheme();
  const toast = useToast();
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isShowType, setIsShowType] = useState(false);
  const [options, setOptions] = useState<Array<VipOption>>([
    { id: "", levelName: t("agent.allLevel") },
  ]);
  const [selectedType, setSelectedType] = useState({
    id: "",
    levelName: t("agent.allLevel"),
  });
  const [member, setMember] = useState("");
  const [dateRange, setDateRange] = useState<TimeRange>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [finished, setFinished] = useState<boolean>(false);

  const getUsers = () => {
    if (!dateRange?.length) return;
    const params = {
      pageNumber,
      pageSize: PAGE_SIZE,
      username: member,
      degreeId: selectedType.id,
      createStartTime: dateRange?.[0],
      createEndTime: dateRange?.[1],
    };

    getUserPageList(params).then(({ data }) => {
      if (data.data) {
        if (data.data.records.length < PAGE_SIZE) setFinished(true);
        if (pageNumber > 1) setUsers((list) => list.concat(data.data.records));
        else {
          setUsers(data.data.records);
        }
      } else {
        toast.warn(data.msg);
      }
    });
  };

  //用户类型名称  120 代理 130 会员  150 前台试玩 160 后台试玩
  const getTypeName = (type: number) => {
    switch (type) {
      case 1:
        return t("agent.proxy");
      case 3:
        return t("agent.frontDeskTrial");
      case 4:
        return t("agent.backendTrial");
      default:
        return "";
    }
  };

  const getVipsList = () => {
    getVips(undefined).then(({ data }) => {
      if (data.data) {
        const vipOptions: VipOption[] = data.data
          .sort((a: any, b: any) => a.level - b.level)
          .map((item: any) => ({
            id: item.id,
            levelName: item.name,
          }));
        setOptions((list) => list.concat(vipOptions));
      } else {
        toast.error(data.msg || "Failed to get VIPs list");
      }
    });
  };

  useEffect(() => {
    getVipsList();
  }, []);

  useEffect(() => {
    if (!dateRange?.length) return;
    getUsers();
  }, [pageNumber, dateRange]);

  const renderItem = ({ item, index }: { item: UserItem; index: number }) => (
    <View
      className={`bg-${theme}-cardBg1`}
      key={item.id}
      style={[styles.box, { boxShadow: `0 4px 4px ${Colors[theme].shadowColor}` }]}
    >
      <View style={[styles.header]}>
        <Text className={`font-medium text-${theme}-text`} style={{ fontSize: rf(13) }}>
          {item.username}
        </Text>
        <Text
          className="font-medium"
          style={[
            item.onlineStatus === 0 ? styles.onlineStatus : styles.offlineStatus,
            { fontSize: rf(12) },
          ]}
        >
          {item.onlineStatus === 0 ? t("status.online") : t("status.offline")}
        </Text>
      </View>
      <View className={`bg-${theme}-gray h-px my-2`} />
      <View style={styles.infoRow}>
        <Text className={`text-${theme}-textGray font-medium`} style={{ fontSize: rf(13) }}>
          {t("agent.customerType")}
        </Text>
        <Text className={`font-medium text-${theme}-primary`} style={{ fontSize: rf(13) }}>
          {getTypeName(item.type || 0)}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text className={`text-${theme}-textGray font-medium`} style={{ fontSize: rf(13) }}>
          {t("my.membershipLevel")}
        </Text>
        <Text className={`font-medium text-${theme}-text`} style={{ fontSize: rf(13) }}>
          {item.degreeName}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text className={`text-${theme}-textGray font-medium`} style={{ fontSize: rf(13) }}>
          {t("wallet.balance")}
        </Text>
        <Text className={`font-medium text-${theme}-primary`} style={{ fontSize: rf(13) }}>
          {(item.cashBalance || 0).toFixed(2)}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text className={`text-${theme}-textGray font-medium`} style={{ fontSize: rf(13) }}>
          {t("agent.agentLevel")}
        </Text>
        <Text className={`font-medium text-${theme}-text`} style={{ fontSize: rf(13) }}>
          {item.level}
        </Text>
      </View>
    </View>
  );
  const hideTypeModal = () => {
    setIsShowType(false);
  };

  // 下拉弹窗
  const renderTypeModal = () => (
    <Modal
      isVisible={isShowType}
      onBackdropPress={hideTypeModal}
      onSwipeComplete={hideTypeModal}
      swipeDirection={["down"]}
      style={{
        margin: 0,
        alignItems: "center",
        justifyContent: "flex-end",
      }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      animationOutTiming={100}
    >
      <View
        className="py-2 rounded-t-[20px]"
        style={{
          height: 320,
          backgroundColor: Colors[theme].cardBg1,
          width: maxWidth,
        }}
      >
        <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
          {options.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => {
                setSelectedType(option);
                setIsShowType(false);
              }}
            >
              <View className="h-10 flex items-center justify-center">
                <View className="relative">
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: -24,
                      opacity: selectedType?.id === option.id ? 1 : 0,
                    }}
                  >
                    <Icon type="antdesign" name="check" size={19} color={Colors[theme].primary} />
                  </View>
                  <I18nText
                    i18nKey={option.levelName}
                    className={
                      selectedType?.id === option.id
                        ? `text-${theme}-primary`
                        : `text-${theme}-text`
                    }
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View
      className={`flex-1 bg-${theme}-background gap-3`}
      style={{ minHeight: 0 }}
    >
      <View className="gap-2 p-2">
        <View className="flex-row gap-2">
          <View className="min-w-0 flex-1">
            <TouchableOpacity
              className={`flex-1 flex-row bg-${theme}-cardBg1 items-center`}
              style={styles.filterOptionBtn}
              onPress={() => setIsShowType(true)}
              activeOpacity={0.8}
            >
              <Text className="flex-1" style={{ color: "#888", fontSize: rf(12) }}>
                {selectedType.levelName}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color="#b0b0b0"
                style={{
                  transform: [{ rotate: isShowType ? "180deg" : "0deg" }],
                }}
              />
            </TouchableOpacity>
            {renderTypeModal()}
          </View>
          <View className="min-w-0 flex-1 overflow-hidden">
            <DateRangePicker
              showLabel
              onConfirm={setDateRange}
              style={{ height: 32, minWidth: "auto" }}
            />
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="min-w-0 flex-1">
            <TextInput
              placeholder={t("agent.member")}
              value={member}
              onChangeText={setMember}
              placeholderTextColor={Colors[theme].lightText}
              style={[
                styles.searchInput,
                {
                  width: "100%",
                  height: SEARCH_ROW_HEIGHT,
                  color: Colors[theme].text,
                  backgroundColor: Colors[theme].cardBg1,
                  fontSize: rf(12),
                  ...(Platform.OS === "android" ? { textAlignVertical: "center" as const } : {}),
                },
              ]}
            />
          </View>
          <View className="min-w-0 flex-1">
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.searchButtonTouchable, { height: SEARCH_ROW_HEIGHT, width: "100%" }]}
              onPress={getUsers}
            >
              <LinearGradient
                colors={[Colors[theme].primary, Colors[theme].gradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.searchButtonGradient}
              >
                <Text className={`text-${theme}-btnText font-bold`} style={{ fontSize: rf(13) }}>
                  {t("common.search")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {users.length > 0 ? (
        <View
          style={{
            flex: 1,
            minHeight: 0,
            paddingHorizontal: 16,
            paddingBottom: 16,
          }}
        >
          <FlatList
            style={{ flex: 1 }}
            data={users}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            className="hide-scrollbar"
            onEndReached={() => {
              if (!finished) setPageNumber((pg) => pg + 1);
            }}
          />
        </View>
      ) : (
        <View className="flex-1" style={{ justifyContent: "center", alignItems: "center" }}>
          <NoData />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  onlineStatus: {
    fontSize: 12,
    color: "#12B76A",
  },
  offlineStatus: {
    color: "#939393",
    fontSize: 12,
  },
  filterOptionBtn: {
    height: 32,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  searchInput: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 0,
  },
  searchButtonTouchable: {
    borderRadius: 8,
    overflow: "hidden",
  },
  searchButtonGradient: {
    flex: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
});
