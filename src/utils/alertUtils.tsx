
let alertModalApi: { show: Function; hide: Function } | null = null;

export const registerAlertModal = (api: { show: Function; hide: Function }) => {
  alertModalApi = api;
};

export const showAlert = (options: any) => {
  if (!alertModalApi) {
    console.warn('AlertModal not registered. Please register it in your app root.');
    return;
  }
  alertModalApi.show(options);
};

// Convenience methods for different alert types
export const showSuccessAlert = (message: string, title?: string) =>
  showAlert({ 
    message, 
    type: 'success', 
    showConfirm: false,
    showCancel: false,
    autoDismiss: true,
    confirmText: undefined,
    cancelText: undefined
  });

export const showErrorAlert = (message: string, title?: string) =>
  showAlert({ 
    message, 
    type: 'error', 
    showConfirm: false,
    showCancel: false,
    autoDismiss: true,
    confirmText: undefined,
    cancelText: undefined,
    duration: 2000
  });

export const showWarningAlert = (message: string, title?: string) =>
  showAlert({ title, message, type: 'warning', showCancel: false });

export const showConfirmAlert = (options: any) =>
  showAlert({ ...options, type: 'info', showCancel: true }); 