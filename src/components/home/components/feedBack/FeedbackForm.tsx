import { createFeedback, uploadFile } from "@/api/post/my";
import { useToast } from "@/components/common/toast";
import { BaseButton } from "@/components/ui/BaseButton";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { rf } from "@/utils/scaleFont";
import { fetchImageFromUri } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
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

interface Option {
  id: number;
  name: string;
}

type PickedFile = File | { uri: string; name: string; type: string };

const isWeb = Platform.OS === "web";
const { maxWidth } = useMaxWidth();

const FeedbackForm = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { theme } = useTheme();
  const [feedbackContent, setFeedbackContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShowType, setIsShowType] = useState(false);
  const [selectedImage, selectImage] = useState<string | undefined>(undefined);
  const [file, setFile] = useState<PickedFile | undefined>(undefined);

  const options: Array<Option> = [
    { id: 0, name: t("userFeedback.authFeedBack") },
    { id: 1, name: t("userFeedback.gameFeedback") },
    { id: 2, name: t("userFeedback.depositFeedback") },
    { id: 3, name: t("userFeedback.withdrawlFeedback") },
    { id: 4, name: t("userFeedback.activityFeedback") },
  ];
  const [selectedType, setSelectedType] = useState<Option>(options[0]);

  const handleSubmit = async () => {
    const content = feedbackContent.trim();
    if (!content && !selectedImage) return;
    try {
      setIsSubmitting(true);
      let filePath = "";
      if (file) {
        try {
          const uploadResponse = await uploadFile(file);
          if (uploadResponse.data?.data?.url) {
            filePath = uploadResponse.data.data.url;
          } else {
            throw new Error("Upload failed");
          }
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          toast.error(t("common.operationFailed"));
          return;
        }
      }

      const response = await createFeedback({
        type: selectedType.id,
        feedbackContent: content,
        file: filePath || undefined,
      });

      const body = response?.data;
      if (body?.data) {
        setFeedbackContent("");
        selectImage("");
        setFile(undefined);
        toast.success(t("common.operationSuccess"));
      } else {
        const code = body?.code ?? body?.repCode;
        const fb = body?.msg || t("common.operationFailed");
        toast.error(code != null && `${code}` !== "" ? t(String(code), { defaultValue: fb }) : fb);
      }
    } catch {
      toast.error(t("common.operationFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = () => {
    selectImage(undefined);
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          toast.error(t("userFeedback.imageUploadHint"));
          return;
        }
        selectImage(asset.uri);
        if (asset.file) {
          setFile(asset.file);
        } else if (asset.uri && !asset.file) {
          const name = asset.fileName || asset.uri.split("/").pop() || "image.jpg";
          const ext = name.includes(".") ? name.split(".").pop() : "jpeg";
          const type = asset.mimeType || `image/${ext}`;
          if (isWeb) {
            const blob = await fetchImageFromUri(asset.uri);
            setFile(new File([blob], name, { type }));
          } else {
            setFile({ uri: asset.uri, name, type });
          }
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      toast.error(t("common.operationFailed"));
    }
  };

  const renderTypeModal = () => (
    <Modal
      isVisible={isShowType}
      onBackdropPress={() => setIsShowType(false)}
      onSwipeComplete={() => setIsShowType(false)}
      swipeDirection={["down"]}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      propagateSwipe
      animationInTiming={260}
      animationOutTiming={220}
      backdropTransitionInTiming={260}
      backdropTransitionOutTiming={220}
      style={styles.optionsModal}
    >
      <TouchableOpacity activeOpacity={1} onPress={() => setIsShowType(false)}>
        <View
          style={{
            backgroundColor: Colors[theme].cardBg1,
            width: maxWidth,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingVertical: 10,
            paddingHorizontal: 15,
          }}
        >
          <FlatList
            data={options}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const isActive = selectedType.id === item.id;
              return (
                <Pressable
                  className="flex-row items-center justify-center gap-2"
                  style={{
                    paddingVertical: 12,
                    borderRadius: 8,
                    marginBottom: 2,
                    paddingHorizontal: 10,
                    alignItems: "center",
                  }}
                  onPress={() => {
                    setSelectedType(item);
                    setIsShowType(false);
                  }}
                >
                  <View className="relative items-center justify-center">
                    {isActive && (
                      <Ionicons
                        className="absolute"
                        name="checkmark"
                        size={24}
                        color={Colors[theme].primary}
                        style={{ left: -30 }}
                      />
                    )}
                    <Text
                      className="text-center items-center flex"
                      style={{
                        color: isActive ? Colors[theme].primary : Colors[theme].darkColor,
                        fontWeight: isActive ? "bold" : "normal",
                        fontSize: rf(14),
                      }}
                    >
                      {item.name}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <ScrollView className={`flex-1 bg-${theme}-background`}>
      <View className="m-4 mb-0" style={{ marginBottom: 0 }}>
        <Pressable
          className="flex-row items-center h-[40px]"
          style={{
            borderRadius: 8,
            backgroundColor: Colors[theme].cardBg1,
            paddingHorizontal: 14,
          }}
          onPress={() => setIsShowType(true)}
        >
          <Text
            className="flex-1"
            style={{
              color: "#888",
              fontSize: rf(14),
              textAlign: "center",
            }}
          >
            {selectedType.name}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color="#b0b0b0"
            style={{
              transform: [{ rotate: isShowType ? "180deg" : "0deg" }],
            }}
          />
        </Pressable>
        {renderTypeModal()}
      </View>
      <View className={`bg-${theme}-cardBg1  rounded-lg m-4 `}>
        <TextInput
          className={`p-3 border-radius-lg bg-${theme}-cardBg1 text-${theme}-lightText min-h-[120px]`}
          style={{ fontSize: rf(16) }}
          multiline
          numberOfLines={6}
          placeholder={t("userFeedback.enterSuggestion")}
          placeholderTextColor={Colors[theme]?.lightText || "#adb7ba"}
          value={feedbackContent}
          onChangeText={setFeedbackContent}
          maxLength={200}
        />
        <Text className={`self-end px-3 pb-2 text-${theme}-lightText`} style={{ fontSize: rf(12) }}>
          {feedbackContent.length}/200
        </Text>
      </View>
      <View className="mx-4">
        {selectedImage ? (
          <View className="relative">
            <Image source={{ uri: selectedImage }} style={styles.image} resizeMode="cover" />
            <Pressable
              className="absolute items-center justify-center"
              onPress={handleRemoveImage}
              style={styles.removeIcon}
            >
              <Ionicons name="close" size={12} color="white" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handleImageUpload}
            className="items-center justify-center"
            style={[
              styles.imagePicker,
              {
                backgroundColor: Colors[theme].cardBg1,
                borderColor: Colors[theme].primary,
              },
            ]}
          >
            <Ionicons
              name="camera"
              size={24}
              color={Colors[theme].primary}
              style={{ marginBottom: 4 }}
            />
            <Text
              className="text-center"
              style={{ color: Colors[theme].darkColor, fontSize: rf(12) }}
            >
              {t("userFeedback.uploadImage")}
            </Text>
          </Pressable>
        )}
        <Text className={`mt-2 text-${theme}-darkColor`} style={{ fontSize: rf(12) }}>
          {t("userFeedback.imageUploadHint")}
        </Text>
      </View>
      <BaseButton
        onPress={handleSubmit}
        disabled={!feedbackContent.trim()}
        isLoading={isSubmitting}
        i18nKey="common.submit"
        variant="solid"
        roundedFull={true}
        size="lg"
        className="m-4"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  optionsModal: {
    margin: 0,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeIcon: {
    top: -5,
    left: 85,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    width: 20,
    height: 20,
  },
  imagePicker: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 12,
  },
});

export default FeedbackForm;
