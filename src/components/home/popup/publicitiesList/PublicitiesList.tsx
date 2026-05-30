import React, { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { TypeContentProvider } from "./typeContent/TypeContentContext";
import { TypeContent } from "./typeContent/TypeContent";
import { usePublicityData } from "./hook/usePublicityData";
import { useMaxWidth } from "@/hooks/useMaxWidth";
import { CloseButton } from "../common/CloseButton";
import { PopupModal } from "../common/PopupModal";
import { PublicityType } from "@/types/publicity";

interface PublicitiesListProps {
  visible?: boolean;
  onClose?: () => void;
  onQueueStateChange?: (canShow: boolean) => void;
  /** 独立模式：不参与首页队列，由数据驱动显隐（如充值页只弹 DEPOSIT_TUTORIAL） */
  standalone?: boolean;
  /** 独立模式下指定要展示的宣传类型，如 [PublicityType.DEPOSIT_TUTORIAL] */
  publicityTypesOverride?: PublicityType[];
  /** 额外控制开关：不在对应页面时传 false，避免语言切换时误请求 */
  enabled?: boolean;
}

export const PublicitiesList = ({
  visible,
  onClose: onExternalClose,
  onQueueStateChange,
  standalone = false,
  publicityTypesOverride,
  enabled = true,
}: PublicitiesListProps) => {
  const { maxWidth } = useMaxWidth();
  const [dismissed, setDismissed] = useState(false);
  const { filteredPublicities, hasPopupContent, loaded } = usePublicityData({
    enabled,
    publicityTypesOverride,
  });
  // 首页队列模式：visible 由队列控制；独立模式：有内容且未点击关闭时展示
  const showPublicitiesPopup = standalone
    ? hasPopupContent && !dismissed
    : !!visible && hasPopupContent;

  useEffect(() => {
    if (standalone || !loaded) return;
    onQueueStateChange?.(hasPopupContent);
  }, [standalone, hasPopupContent, loaded, onQueueStateChange]);

  // 关闭宣传弹窗，稳定引用减少子组件重渲染
  const handleClose = useCallback(() => {
    if (standalone) setDismissed(true);
    onExternalClose?.();
  }, [standalone, onExternalClose]);

  // 没有宣传数据时，不挂弹窗内容
  if (!showPublicitiesPopup) return null;

  return (
    <PopupModal
      id="publicities-popup"
      isVisible={showPublicitiesPopup}
      // onClose={handleClose}
      style={{ margin: 0 }}
    >
      <View
        className="justify-center items-center"
        style={{ width: maxWidth * 0.88, marginHorizontal: "auto" }}
      >
        <View style={[styles.modal, { width: "100%" }]}>
          <Image
            source={require("@/assets/images/promotion/popup.png")}
            style={styles.imageBg}
            resizeMode="contain"
          />
          <TypeContentProvider
            onRequestClose={handleClose}
            publicityType={PublicityType.DEPOSIT_TUTORIAL}
            publicities={filteredPublicities}
          >
            <TypeContent />
          </TypeContentProvider>
        </View>
        <CloseButton onClose={handleClose} />
      </View>
    </PopupModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    borderRadius: 10,
  },
  imageBg: {
    width: "100%",
    height: 120,
  },
});
