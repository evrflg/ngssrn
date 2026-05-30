/* 站内短信 */
import { messageList, readMessage, markAllAsRead, batchDeleteMessage } from "@/api";
import { HideScreenHeader } from "@/components/common/Header";
import ClearActionIcon from "@/components/icons/my/ClearActionIcon";
import DeleteActionIcon from "@/components/icons/my/DeleteActionIcon";
import EditActionIcon from "@/components/icons/my/EditActionIcon";
import NoData from "@/components/common/NoData";
import { LetterIcon, LetterOpenIcon } from "@/components/icons/my/index";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useToast } from "@/components/common/toast";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchUnreadMessageCount } from "@/store/user/userSlice";
import { LinearGradient } from "expo-linear-gradient";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import { rf } from "@/utils/scaleFont";
import ListNoMore from "@/components/common/ListNoMore";
import { parseContent, type ParsedContent } from "@/utils/message";

interface MessageItem {
  id: string;
  userId: string;
  userType: number;
  templateId: number;
  templateCode: string;
  templateNickname: string;
  templateContent: string;
  templateType: number;
  templateParams: {
    [key: string]: Record<string, never>;
  };
  readStatus: boolean;
  readTime?: string;
  createTime: number;
  isSelected?: boolean;
}
type DetailData = ParsedContent & {
  templateNickname: MessageItem['templateNickname']
}

//时间格式化
function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = padZero(date.getMonth() + 1);
  const dd = padZero(date.getDate());
  const hh = padZero(date.getHours());
  const min = padZero(date.getMinutes());
  const ss = padZero(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function padZero(value: number) {
  return value < 10 ? `0${value}` : value;
}

let totalDataNumber = 0;
const MessageListItem = ({
  item,
  onPress,
  isEdit,
}: {
  item: MessageItem;
  onPress: (data: MessageItem & DetailData) => void;
  isEdit: boolean;
}) => {
  const { theme } = useTheme();
  const message = parseContent(item.templateContent)

  return (
    <TouchableOpacity onPress={() => onPress({
      ...message,
      ...item
    })} style={styles.messageItem}>
      <View style={[styles.messageContent, { backgroundColor: Colors[theme].cardBg1 }]}>
        <View style={styles.left}>
          {isEdit ? (
            item.isSelected ? (
              <View
                className="flex justify-center items-center"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: Colors[theme].primary,
                  backgroundColor: Colors[theme].primary,
                }}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            ) : (
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: Colors[theme].text,
                }}
              ></View>
            )
          ) : item.readStatus ? (
            <LetterOpenIcon width={20} height={20} fill={Colors[theme].primary} />
          ) : (
            <LetterIcon width={20} height={20} fill={Colors[theme].primary} />
          )}
        </View>
        <View style={styles.center}>
          <Text style={[styles.messageTitle, { color: Colors[theme].text, fontSize: rf(13) }]}>
            {item.templateNickname}
          </Text>
          <Text
            style={[styles.messageDescription, { color: Colors[theme].text, fontSize: rf(11) }]}
          >
            { message?.content }
          </Text>
          <Text style={{ color: Colors[theme].text, fontSize: rf(11) }}>
            {formatDate(item.createTime)}
          </Text>
        </View>
        <View style={styles.right}>
          {!isEdit && <Ionicons name="chevron-forward" size={12} color="#666" />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function Message() {
  const [messageVisible, setMessageVisible] = useState(false); //消息弹窗
  const [selectedMessage, setSelectedMessage] = useState<DetailData>(); // 选中的消息
  const [messages, setMessages] = useState<MessageItem[]>([]); // 消息列表
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 100;
  const [isEdit, setIsEdit] = useState(false);
  const selectedMessages = useMemo(() => messages.filter((item) => item.isSelected), [messages]);
  const selectedCount = useMemo(
    () => messages.filter((item) => item.isSelected).length,
    [messages],
  );
  const allSelected = useMemo(
    () => messages.length > 0 && selectedCount === messages.length,
    [messages.length, selectedCount],
  );

  // 未读消息数量
  const unreadMessageCount = useSelector(
    (state: RootState) => state?.user?.unreadMessageCount || 0,
  );
  const hasUnreadMessage = useMemo(() => unreadMessageCount > 0, [unreadMessageCount]);

  const handleCloseModal = () => {
    setMessageVisible(false);
  };

  const loadMessages = async (page: number) => {
    setLoading(true);
    const res = await messageList({ pageNo: String(page), pageSize: String(PAGE_SIZE) });
    const list = res?.data?.data?.list || [];
    totalDataNumber = Number(res?.data?.data?.total) ?? 0;
    if (list.length > 0) {
      setMessages((prev) => {
        const newMessages = [...prev, ...list];
        return newMessages;
      });
      setHasMore(list.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages(1);
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPageNumber((prev) => prev + 1);
      loadMessages(pageNumber + 1);
    }
  };

  const handleMessagePress = async (message: MessageItem & DetailData, index: number) => {
    if (isEdit) {
      setMessages((prevList) => {
        const newList = [...prevList];
        newList[index] = {
          ...newList[index],
          isSelected: !newList[index]?.isSelected,
        };
        return newList;
      });
      return;
    }

    setSelectedMessage(message);
    setMessageVisible(true);

    // 如果是未读消息，调用已读接口
    if (!message.readStatus) {
      setMessages((prevList) => {
        const newList = [...prevList];
        newList[index] = {
          ...newList[index],
          readStatus: true,
        };
        return newList;
      });
      const res: any = await readMessage({ ids: message.id });
      if (res) {
        setMessages((prevList) => {
          const newList = [...prevList];
          newList[index] = {
            ...newList[index],
            readStatus: true,
            readTime: new Date().toISOString(),
          };
          return newList;
        });
        dispatch(fetchUnreadMessageCount());
      }
    }
  };

  const onClaimClick = () => {
    if (selectedMessage?.type === 'activity') {
      // 跳转到活动详情页
      router.push({
        pathname: "/active/activeCenter",
        params: {
          id: selectedMessage.id,
          type: "0",
        },
      });
    } else {
      router.push({ pathname: '/my/balanceGold'})
    }

    setMessageVisible(false);
  };
  // 标记所有站内信为已读
  const handleMarkAllAsRead = async () => {
    try {
      const res: any = await markAllAsRead();

      if (res?.status === 200) {
        const readTime = new Date().toISOString();
        setMessages((prevList) =>
          prevList.map((item) => ({
            ...item,
            readStatus: true,
            readTime: item.readTime || readTime,
          })),
        );
        toast.success(t("common.operationSuccess"));
        dispatch(fetchUnreadMessageCount());
      } else {
        toast.warn(t("common.operationFailed"));
      }
    } catch {
      toast.error(t("common.operationFailed"));
    }
  };

  // 编辑站内信
  const handleEditMessage = () => {
    setIsEdit((prev) => {
      const next = !prev;
      if (!next) {
        setMessages((prevList) => prevList.map((item) => ({ ...item, isSelected: false })));
      }
      return next;
    });
    setMessageVisible(false);
  };

  // 批量删除选中消息
  const handleBatchDelete = async () => {
    if (selectedCount === 0) {
      toast.warn(t("message.pleaseSelectMessage"));
      return;
    }

    let ids: string[] = [];
    selectedMessages.forEach((item) => {
      ids.push(item.id);
    });
    const res: any = await batchDeleteMessage(ids);
    if (res?.status === 200) {
      setMessages((prevList) => prevList.filter((item) => !item.isSelected));
      setIsEdit(false);
      toast.success(t("common.operationSuccess"));
      dispatch(fetchUnreadMessageCount());
    } else {
      toast.warn(t("common.operationFailed"));
    }
  };

  const handleSelectAll = () => {
    setMessages((prevList) => {
      const shouldSelectAll = prevList.some((item) => !item.isSelected);
      return prevList.map((item) => ({ ...item, isSelected: shouldSelectAll }));
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        overflow: "hidden",
        backgroundColor: Colors[theme].background,
      }}
    >
      <HideScreenHeader
        title={t("pageName.message")}
        rightSelf={
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable
              onPress={isEdit || !hasUnreadMessage ? undefined : handleMarkAllAsRead}
              hitSlop={8}
              style={{
                paddingHorizontal: 4,
                paddingVertical: 2,
                opacity: isEdit || !hasUnreadMessage ? 0.4 : 1,
              }}
            >
              <ClearActionIcon width={16} height={16} color={Colors[theme].text} />
            </Pressable>
            <Pressable
              onPress={!messages.length ? undefined : handleEditMessage}
              hitSlop={8}
              style={{
                paddingHorizontal: 4,
                paddingVertical: 2,
                marginLeft: 6,
                opacity: isEdit || !messages.length ? 0.4 : 1,
              }}
            >
              {isEdit ? (
                <EvilIcons name="close-o" size={20} color={Colors[theme].text} />
              ) : (
                <EditActionIcon width={16} height={16} color={Colors[theme].text} />
              )}
            </Pressable>
          </View>
        }
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor: Colors[theme].background,
          },
        ]}
      >
        {messages.length > 0 ? (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <MessageListItem
                item={item}
                onPress={data => handleMessagePress(data, index)}
                isEdit={isEdit}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="mail-open-outline" size={48} color="#999" />
                <Text style={[styles.emptyText, { fontSize: rf(14) }]}> {t("common.noData")}</Text>
              </View>
            }
            ListFooterComponent={
              hasMore && loading ? (
                <ActivityIndicator style={{ marginVertical: 16 }} />
              ) : totalDataNumber === messages.length ? (
                <ListNoMore />
              ) : null
            }
            onEndReached={() => {
              if (hasMore && !loading) loadMore();
            }}
            onEndReachedThreshold={0.2}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 justify-center">
            <NoData />
          </View>
        )}
        {isEdit && (
          <View
            style={{
              height: 100,
              backgroundColor: Colors[theme].cardBg1,
              flexDirection: "column",
              alignItems: "stretch",
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
          >
            <Pressable
              style={{
                width: "100%",
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                borderBottomWidth: 3,
                borderBottomColor: Colors[theme].background,
              }}
              onPress={handleSelectAll}
            >
              <View
                className="flex justify-center items-center"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 14,
                  backgroundColor: "#fff",
                }}
              >
                <Ionicons name="checkmark" size={10} color="#666" />
              </View>
              <Text style={{ color: Colors[theme].text, fontSize: rf(12), marginLeft: 6 }}>
                {allSelected ? t("common.unSelectAll") : t("common.selectAll")}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleBatchDelete}
              style={{
                width: "100%",
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DeleteActionIcon width={14} height={14} color={Colors[theme].primary} />
              <View style={{ width: 6 }} />
              <Text style={{ color: Colors[theme].primary, fontSize: rf(12) }}>
                {t("common.delete")}
              </Text>
            </Pressable>
          </View>
        )}
        {messageVisible && selectedMessage && (
          <Modal
            isVisible={messageVisible}
            animationIn="fadeIn"
            animationOut="fadeOut"
            backdropOpacity={0.4}
            style={{
              margin: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalIcon}>
                <Image
                  source={require("@/assets/images/myCenter/message.png")}
                  style={styles.modalIconImage}
                  resizeMode="contain"
                />
              </View>
              <LinearGradient
                colors={[Colors[theme].primary, Colors[theme].gradient]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.modalHeader}
              >
                <Text style={[styles.modalHeaderText, { fontSize: rf(14) }]}>
                  {selectedMessage.templateNickname}
                </Text>
              </LinearGradient>
              <View style={[styles.modalContent, { backgroundColor: Colors[theme].cardBg1 }]}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  className="hide-scrollbar"
                  contentContainerStyle={{ flexGrow: 1, paddingBottom: 12 }}
                  style={{ flex: 1 }}
                >
                  <Text
                    style={[
                      styles.modalText,
                      { color: Colors[theme].text, fontSize: rf(12), lineHeight: rf(18) },
                    ]}
                  >
                    { selectedMessage?.content }
                  </Text>
                </ScrollView>
                {/* 领取按钮*/}
                {selectedMessage?.type && (
                  <LinearGradient
                    colors={[Colors[theme].primary, Colors[theme].gradient]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.claimButton}
                  >
                    <TouchableOpacity onPress={onClaimClick}>
                      <Text style={[styles.claimButtonText, { fontSize: rf(12) }]}>
                        
                        {t("status.claim.goingToClaim")}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                )}
              </View>
              <TouchableOpacity
                style={styles.closeButtonWrapper}
                activeOpacity={0.8}
                onPress={handleCloseModal}
              >
                <View style={styles.closeButton}>
                  <Ionicons name="close" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    position: "relative",
  },
  messageItem: {
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: "#000",
  },
  messageContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  left: {
    marginRight: 12,
  },
  center: {
    flex: 1,
  },
  messageTitle: {
    fontWeight: 500,
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    color: "#999",
    marginTop: 16,
  },
  right: {
    //marginLeft: 8,
  },
  messageDescription: {
    color: "#666",
    marginBottom: 4,
  },
  modalContainer: {
    //backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 6,
    overflow: "hidden",
    width: "85%",
    maxWidth: 350,
  },
  modalIcon: {
    height: 35,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    position: "relative",
    zIndex: 2,
    paddingLeft: 10,
  },
  modalIconImage: {
    width: 42,
    height: 42,
  },
  modalHeader: {
    marginTop: -12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  modalHeaderText: {
    color: "white",
    fontWeight: "500",
  },
  modalContent: {
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    width: "100%",
    height: 200,
    padding: 12,
    flexDirection: "column",
  },
  modalText: {
    textAlign: "left",
  },
  claimButton: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "center",
    minWidth: "50%",
  },
  claimButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "500",
  },
  closeButtonWrapper: {
    marginTop: 24,
    alignSelf: "center",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
});
