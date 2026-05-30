import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BaseModal from './BaseModal';
import { Divider } from '@rneui/themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/ThemeProvider';
import { useTranslation } from 'react-i18next';

type AnimationType =
  | 'slideInDown'
  | 'slideInUp'
  | 'slideOutDown'
  | 'slideOutUp'
  | 'fadeIn'
  | 'fadeOut'
  | 'bounce'
  | 'zoomIn'
  | 'zoomOut';

interface AlertModalProps {
  message?: string | React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  showConfirm?: boolean;
  containerStyle?: any;
  animationIn?: AnimationType;
  animationOut?: AnimationType;
  visible?: boolean;
}

export const AlertModal = ({
  message = '',
  type = 'info',
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  showCancel = true,
  showConfirm = true,
  containerStyle,
  animationIn = 'zoomIn',
  animationOut = 'zoomOut',
  visible = false,
}: AlertModalProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const resolvedConfirmText = confirmText || t("common.confirm");
  const resolvedCancelText = cancelText || t("common.cancel");

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={40} color={Colors[theme].success} />;
      case 'warning':
        return <Ionicons name="warning" size={40} color={Colors[theme].warning} />;
      case 'error':
        return <Ionicons name="close-circle" size={40} color={Colors[theme].error} />;
      default:
        return <Ionicons name="information-circle" size={40} color={Colors[theme].primary} />;
    }
  };

  const renderContent = () => {
    if (typeof message === 'function') {
      const result = (message as () => React.ReactNode)();
      if (typeof result === 'string' || typeof result === 'number') {
        return <Text style={styles.messageText}>{result}</Text>;
      }
      return result;
    }
    if (typeof message === 'string' || typeof message === 'number') {
      return <Text style={styles.messageText}>{message}</Text>;
    }
    return message;
  };

  return (
    <BaseModal
      isVisible={visible}
      coverScreen={false}
      backdropOpacity={0.3}
      animationIn={animationIn}
      animationOut={animationOut}
      style={styles.modal}
    >
      <View style={[styles.container, containerStyle]}>
        <View style={styles.content}>
          {getIcon()}
          {renderContent()}
        </View>
        {(showCancel || showConfirm) && (
          <>
            <Divider color="#E5E6EB" />
            <View style={styles.buttonContainer}>
              {showCancel && (
                <>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={onCancel}
                  >
                    <Text style={styles.cancelText}>{resolvedCancelText}</Text>
                  </TouchableOpacity>
                  <Divider orientation="vertical" color="#E5E6EB" />
                </>
              )}
              {showConfirm && (
                <TouchableOpacity
                  style={[styles.button, !showCancel && styles.fullWidthButton]}
                  onPress={onConfirm}
                >
                  <Text style={[styles.confirmText, { color: Colors[theme].primary }]}>
                    {resolvedConfirmText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    minWidth: 200,
    maxWidth: 320,
    overflow: 'hidden',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    height: 50,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidthButton: {
    width: '100%',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 