import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
  SafeAreaView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Entypo } from "@expo/vector-icons";
import patch from "@/api/PatchVersion";
import { getFeedbackMessage, replyFeedback } from "@/api/post/my";
import { useToast } from "@/components/common/toast";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { format } from "date-fns";
import { Colors } from "@/constants/Colors";
import { HideScreenHeader } from "@/components/common/Header";
import { Icon } from "@rneui/themed";
import { MAX_WIDTH } from "@/hooks/useMaxWidth";

interface FeedbackDetailProps {
  visible: boolean;
  feedbackId: string;
  onClose: () => void;
  onRefresh: () => void;
}

interface DetailData {
  advice?: {
    id: number;
    content: string;
    createTime: string;
  };
  adviceList?: {
    content: string;
    createTime: string;
    contentType: number;
  }[];
}
interface FeedbackReply {
  id: number | string;
  contentType: 0 | 1; // 0=我, 1=客服
  content: string;
  createTime: number;
  file?: string;
}
const PAGE_SIZE = 50;

function resolveFeedbackImageUrl(fileUrl: string): string {
  if (!fileUrl) return "";
  const trimmed = String(fileUrl).trim();
  if (!trimmed) return "";
  if (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("file:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  const base = (patch.DOMAIN_URL || "").replace(/\/$/, "");
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

/**
 * Robust image attachment that renders immediately without depending on
 * Image.getSize(), which silently fails on real Android/iOS devices
 * (especially for URLs requiring auth headers or under certain network
 * conditions). The image is shown right away at a capped fallback size;
 * onLoad then tightens the dimensions to the true intrinsic values.
 */
function FeedbackReplyAttachment({
  uri,
  maxWidth,
  maxHeight,
  alignSelf,
}: {
  uri: string;
  maxWidth: number;
  maxHeight: number;
  alignSelf: "flex-end" | "flex-start";
}) {
  // null = not yet loaded, false = error
  const [size, setSize] = useState<{ w: number; h: number } | null | false>(null);

  // Reset whenever the URI changes
  useEffect(() => {
    setSize(null);
  }, [uri]);

  const display = useMemo(() => {
    if (size === null || size === false) return null;
    const scale = Math.min(1, maxWidth / size.w, maxHeight / size.h);
    return {
      w: Math.max(1, Math.round(size.w * scale)),
      h: Math.max(1, Math.round(size.h * scale)),
    };
  }, [size, maxWidth, maxHeight]);

  // While size is unknown we render the image at the full fallback bounds so
  // the native layer can decode it and fire onLoad. We hide it visually so
  // there's no jarring layout shift.
  const isLoading = size === null;
  const isError = size === false;

  return (
    <View
      style={{
        marginTop: 12,
        alignSelf,
        maxWidth,
        // Reserve space for the spinner until we know the final size
        minHeight: isLoading ? 80 : undefined,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isLoading && (
        <ActivityIndicator color="#888" style={{ position: "absolute" }} />
      )}
      {isError ? null : (
        <Image
          source={{ uri }}
          accessibilityLabel="Feedback attachment"
          onLoad={(e) => {
            const src = e.nativeEvent.source as {
              width?: number;
              height?: number;
            };
            const w = Number(src?.width);
            const h = Number(src?.height);
            if (w > 0 && h > 0) {
              setSize({ w, h });
            } else {
              // Fallback: treat as square using maxWidth
              setSize({ w: maxWidth, h: maxWidth });
            }
          }}
          onError={() => {
            setSize(false);
          }}
          style={
            display
              ? {
                width: display.w,
                height: display.h,
                borderRadius: 8,
              }
              : {
                // Render off-screen at full bounds so the native image
                // layer can fetch & decode, then onLoad gives us real dims.
                position: "absolute",
                width: maxWidth,
                height: maxHeight,
                opacity: 0,
              }
          }
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const FeedbackDetail = ({
  visible,
  feedbackId,
  onClose,
  onRefresh,
}: FeedbackDetailProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { theme } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  /** PC/Web：限制內容最大寬度並置中，避免氣泡與輸入區橫向撐破版面 */
  const contentMaxWidth = Math.min(windowWidth, 560);
  const bubbleMaxWidth = Math.min(windowWidth * 0.85, MAX_WIDTH);
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState<DetailData>({});
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [replies, setReplies] = useState<Array<FeedbackReply>>([]);

  // Fetch feedback detail
  const fetchDetail = async (scrollToBottom = false) => {
    if (!feedbackId) return;
    setLoading(true);
    const params = { feedbackId, pageNo: 1, pageSize: PAGE_SIZE };
    await getFeedbackMessage(params)
      .then(({ data }) => {
        if (data.data) {
          setReplies(
            (data.data.list || [])
              .map(
                (item: any) =>
                ({
                  id: item.id,
                  contentType: item.type === 0 ? 0 : 1,
                  content: item.content,
                  createTime: Number(item.createTime),
                  file:
                    item.file ??
                    item.fileUrl ??
                    item.imageUrl ??
                    undefined,
                } as FeedbackReply)
              )
              .sort(
                (a: FeedbackReply, b: FeedbackReply) =>
                  a.createTime - b.createTime
              )
          );

          if (scrollToBottom) {
            setTimeout(() => {
              scrollRef.current?.scrollToEnd({ animated: true });
            }, 300);
          }
        } else {
          toast.error(data.msg || t("common.operationFailed"));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Submit reply
  const handleSubmitReply = async () => {
    const content = replyContent.trim();
    if (!content) return;

    setSubmitting(true);
    await replyFeedback({
      feedbackId,
      content,
    })
      .then(({ data }) => {
        if (data.data) {
          setReplyContent("");
          toast.success(t("common.operationSuccess"));
          fetchDetail(true);
        } else {
          toast.error(data.msg || t("common.operationFailed"));
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  // Handle close
  const handleClose = () => {
    setDetailData({});
    setReplyContent("");
    onRefresh();
    onClose();
  };

  const formatDate = (timestamp?: number | string) => {
    if (!timestamp) return "";
    const ts = typeof timestamp === "string" ? Number(timestamp) : timestamp;
    return format(new Date(ts), "yyyy-MM-dd HH:mm:ss");
  };

  // Fetch data when feedbackId changes or modal becomes visible
  useEffect(() => {
    if (visible && feedbackId) {
      fetchDetail();
    }
  }, [visible, feedbackId]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: Colors[theme].background,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            alignItems: "center",
            minHeight: 0,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: contentMaxWidth,
              flex: 1,
              minHeight: 0,
              minWidth: 0,
            }}
          >
            <HideScreenHeader
              title={t("userFeedback.detailTitle")}
              leftSelf={
                <Pressable
                  className="flex flex-row items-center"
                  onPress={handleClose}
                >
                  <Icon
                    name="chevron-left"
                    type="feather"
                    color={Colors[theme].text}
                    size={24}
                  />
                </Pressable>
              }
            />
            <View
              className={`flex-1 w-full bg-${theme}-blockBg1 p-3`}
              style={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              {loading && !detailData.advice ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color={`${theme}-primary`} />
                </View>
              ) : (
                <>
                  <ScrollView
                    className="flex-1 p-4"
                    ref={scrollRef}
                    style={{ minHeight: 200, width: "100%", maxWidth: "100%" }}
                    contentContainerStyle={{ flexGrow: 1, width: "100%", maxWidth: "100%" }}
                  >
                    {/* Replies */}
                    {replies?.map((reply) => (
                      <View
                        key={reply.id}
                        className={`mb-5 ${reply.contentType === 0 ? "items-end" : "items-start"
                          }`}
                      >
                        <View
                          className={`flex-row ${reply.contentType === 0
                            ? "justify-end"
                            : "justify-between"
                            } mb-2`}
                          style={{
                            flexWrap: "wrap",
                            maxWidth: "100%",
                            gap: 4,
                          }}
                        >
                          <Text
                            className={`text-${theme}-lightText font-bold`}
                            style={{ flexShrink: 1, minWidth: 0 }}
                          >
                            {reply.contentType === 0
                              ? t("userFeedback.myReply")
                              : t("common.customerService")}
                          </Text>
                          <Text
                            className={`text-${theme}-lightText text-xs ml-2`}
                            style={{ flexShrink: 0 }}
                          >
                            {formatDate(reply.createTime)}
                          </Text>
                        </View>
                        {/* Text-only bubble — attachment sits below (Vue: .message-bubble + sibling .feedback-image) */}
                        <View
                          className={`p-3 rounded-lg max-w-[80%] ${reply.contentType === 0
                            ? `bg-${theme}-primary`
                            : `bg-${theme}-cardBg1`
                            }`}
                          style={{
                            minWidth: 0,
                            maxWidth: bubbleMaxWidth,
                            alignSelf:
                              reply.contentType === 0 ? "flex-end" : "flex-start",
                          }}
                        >
                          {reply.contentType !== 0 && (
                            <Entypo
                              className="absolute"
                              name="triangle-left"
                              size={24}
                              color={Colors[theme].cardBg1}
                              style={{ left: -14 }}
                            />
                          )}
                          <Text
                            className={`${reply.contentType === 0
                              ? `text-${theme}-activeColor`
                              : `text-${theme}-text`
                              }`}
                            style={[
                              { flexShrink: 1, maxWidth: "100%", minWidth: 0 },
                              Platform.OS === "web"
                                ? ({
                                  overflowWrap: "anywhere",
                                  wordBreak: "break-word",
                                } as object)
                                : undefined,
                            ]}
                          >
                            {reply.content}
                          </Text>
                          {reply.contentType === 0 && (
                            <Entypo
                              className="absolute"
                              name="triangle-right"
                              size={24}
                              color={Colors[theme].primary}
                              style={{ right: -14 }}
                            />
                          )}
                        </View>
                        {reply.file ? (
                          <FeedbackReplyAttachment
                            uri={resolveFeedbackImageUrl(reply.file)}
                            maxWidth={bubbleMaxWidth}
                            maxHeight={300}
                            alignSelf={
                              reply.contentType === 0 ? "flex-end" : "flex-start"
                            }
                          />
                        ) : null}
                      </View>
                    ))}
                  </ScrollView>
                  {/* Reply Box */}
                  <View
                    className={`bg-${theme}-cardBg1 rounded-lg p-3 mb-3 text-${theme}-text`}
                  >
                    <TextInput
                      className={`text-${theme}-lightText text-base`}
                      placeholder={t("userFeedback.enterReply")}
                      placeholderTextColor={Colors[theme]?.lightText || "#adb7ba"}
                      value={replyContent}
                      onChangeText={setReplyContent}
                      multiline
                      maxLength={200}
                      numberOfLines={6}
                      {...(Platform.OS === "android"
                        ? { textAlignVertical: "top" as const }
                        : {})}
                      style={{
                        width: "100%",
                        minHeight: Platform.OS === "ios" ? 144 : 120,
                        paddingVertical: Platform.OS === "ios" ? 12 : 10,
                      }}
                    />
                    <Text
                      className={`text-right text-${theme}-lightText text-xs`}
                    >{`${replyContent.length}/200`}</Text>
                  </View>
                  <Pressable
                    className={`h-[40px] justify-center items-center px-4 rounded-lg text-${theme}-text bg-${theme}-primary ${!replyContent.trim() || submitting ? "opacity-50" : ""
                      }`}
                    onPress={() => {
                      handleSubmitReply();
                    }}
                    disabled={!replyContent.trim() || submitting}
                  >
                    <Text className={`text-${theme}-btnText`}>
                      {t("userFeedback.replyText")}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default FeedbackDetail;
