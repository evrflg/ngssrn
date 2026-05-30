import { BaseToast, BaseToastRef } from '@/components/common/BaseToast';
import { isDesktop } from "@/utils/screen";
import React, { useCallback, useRef, useState } from 'react';
import { View } from "react-native";
import Modal, { ModalProps } from 'react-native-modal';

export interface ModalRefs {
  toggleModal: () => void,
  openModal: () => void,
  closeModal: () => void,
  isVisible: boolean,
  [key: string]: any;
}

type ModalRef = React.ForwardedRef<ModalRefs>;

interface BaseModalProps extends ModalProps {
  children: React.ReactNode,
  needToast?: boolean,
  onVisibleChange?: (visible: boolean) => void,
  centerOnDesktop?: boolean,
}

const BaseModal = React.forwardRef(({
  children,
  needToast = false,
  onVisibleChange,
  centerOnDesktop = true,
  ...props
}: Partial<BaseModalProps>, ref: ModalRef) => {
  const messageRef = useRef<BaseToastRef>(null)
  const [isModalVisible, setModalVisible] = useState(false);
  const modalRef = useRef(null);

  const toggleModal = useCallback(() => {
    const newIsVisible = !isModalVisible;
    setModalVisible(newIsVisible);
    onVisibleChange?.(newIsVisible)
  }, [isModalVisible])

  const closeModal = () => {
    setModalVisible(false);
    onVisibleChange?.(false)
  }

  const openModal = () => {
    setModalVisible(true);
    onVisibleChange?.(true)
  }

  React.useImperativeHandle(
    ref, () => {
      return {
        toggleModal,
        closeModal,
        openModal,
        isVisible: isModalVisible
      }
    }, [isModalVisible]
  );

  // 设置默认属性
  const _defaultProps: Partial<ModalProps> = {
    isVisible: isModalVisible,
    backdropOpacity: 0.5,
    onBackdropPress: toggleModal,
  };

  return (
    <Modal
      ref={modalRef}
      {..._defaultProps}
      {...props}
    >
      {needToast && <BaseToast ref={messageRef} />}
      {
        (isDesktop && centerOnDesktop) ? <View className='mx-auto'>
          {children}
        </View> : children
      }
    </Modal >
  );
})

export default BaseModal;
