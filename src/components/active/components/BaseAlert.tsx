import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import BaseModal from "@/components/common/BaseModal";
import { Divider } from "@rneui/themed";
import { useTranslation } from "react-i18next";

type AnimationType =
  | "slideInDown"
  | "slideInUp"
  | "slideOutDown"
  | "slideOutUp"
  | "fadeIn"
  | "fadeOut"
  | "bounce"
  | "zoomIn"
  | "zoomOut";
interface BaseAlertProps {
  modalRef: any;
  content: string | React.ReactNode | (() => React.ReactNode);
  onCancel?: () => void;
  onConfrim?: () => void;
  containerStyle?: any;
  leftText?: string;
  rightText?: string;
  aniIn?: AnimationType;
  aniOut?: AnimationType;
  hideCancel?: boolean;
  props?: any;
}

export const BaseAlert = ({
  modalRef,
  content,
  onCancel,
  onConfrim,
  containerStyle,
  leftText,
  rightText,
  aniIn = "slideInDown",
  aniOut = "slideOutUp",
  hideCancel = false,
  props = {},
}: BaseAlertProps) => {
  const { t } = useTranslation();
  const resolvedLeftText = leftText ?? t("common.cancel");
  const resolvedRightText = rightText ?? t("common.confirm");

  const handleClose = (callback?: () => void) => {
    modalRef.current?.toggleModal();
    callback?.();
  };

  const renderContent = () => {
    if (typeof content === "function") return content();
    return <Text className="text-center text-charcoal-700 text-base">{content}</Text>;
  };

  return (
    <BaseModal
      ref={modalRef}
      coverScreen={false}
      backdropOpacity={0.3}
      animationIn={aniIn}
      animationOut={aniOut}
      className="justify-center"
      {...props}
    >
      <View className="bg-white w-full rounded-lg">
        <View className="px-5 pt-16 pb-10" style={containerStyle}>
          {renderContent()}
        </View>
        <Divider color="#E5E6EB" />
        <View className="flex flex-row">
          {!hideCancel && (
            <>
              <TouchableOpacity
                className="flex-1 py-4 justify-center items-center"
                onPress={() => handleClose(onCancel)}
              >
                <Text className="text-base">{resolvedLeftText}</Text>
              </TouchableOpacity>
              <Divider orientation="vertical" color="#E5E6EB" />
            </>
          )}
          <TouchableOpacity
            className={`py-4 justify-center items-center ${hideCancel ? "flex-1" : "flex-1"}`}
            onPress={() => handleClose(onConfrim)}
          >
            <Text className="text-base text-red-500">{resolvedRightText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseModal>
  );
};
