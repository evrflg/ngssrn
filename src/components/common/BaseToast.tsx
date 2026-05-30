import React, { useRef, useEffect } from 'react';
import FlashMessage from 'react-native-flash-message';
import type { FlashMessageProps } from "react-native-flash-message";
import { showErrorMessage, showSuccessMessage, showWarningMessage, showMsg, showLoading, hideMsg, registerFlashMessage } from "@/utils/utils";

export interface BaseToastRef {
  showErrorMessage: (msg?: string) => void;
  showSuccessMessage: (msg?: string) => void;
  showWarningMessage: (msg?: string) => void;
  showLoading: (msg?: string) => void;
  showMsg: (msg?: string) => void;
  hideMsg: () => void;
}

export const BaseToast = React.forwardRef((props: FlashMessageProps, ref) => {
  const flashRef = useRef<FlashMessage>(null)

  useEffect(() => {
    if (!ref) {
      registerFlashMessage(null);
    } else {
      registerFlashMessage(flashRef?.current);
    }
    return () => {
      registerFlashMessage(null);
    };
  }, [ref])

  React.useImperativeHandle(ref, () => {
    return {
      showErrorMessage,
      showSuccessMessage,
      showWarningMessage,
      showLoading,
      showMsg,
      hideMsg,
    };
  })

  return (
    <FlashMessage ref={flashRef} position={'center'} {...props} />
  );
})
