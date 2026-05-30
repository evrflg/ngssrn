/**
 * 自动热更组件
 */
import { useFocusEffect } from "expo-router";
import * as Updates from "expo-updates";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfiremModal } from "./modal/ConfirmModal";
import { useToast } from "./toast/src/ToastProvider";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

let loading = false;

export const AutoUpdateView = () => {
  const toast = useToast();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const isCurrentAppId = useSelector((state: RootState) => state?.tenant?.isCurrentAppId);

  // 获取是否有热更并弹窗
  const getAutoCheckUpdate = async () => {
    try {
      // const autoCheckUpdate = await getStorage('autoCheckUpdate')
      // if (autoCheckUpdate === 'true' || !autoCheckUpdate) {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) setVisible(true);
      // }
    } catch {
    } finally {
      loading = false;
    }
  };

  // 加载热更版本
  const sureUpdate = async () => {
    try {
      toast.loading(true);
      // 下载更新
      await Updates.fetchUpdateAsync();
      // 重启应用
      await Updates.reloadAsync();
    } catch (error) {
      alert(error);
      console.warn("加载热更版本失败", error);
    } finally {
      toast.loading(false);
      loading = false;
    }
  };

  // 每次屏幕获取焦点时执行
  useFocusEffect(
    React.useCallback(() => {
      if (loading) return;
      loading = true;
      getAutoCheckUpdate();
    }, []),
  );

  // 如果当前应用ID不匹配，则不显示热更组件
  if (!isCurrentAppId) return null;

  return (
    <View>
      <ConfiremModal
        isVisible={[visible, setVisible]}
        title={t("autoUpdateView.newVersionDetectedUpdateNow")}
        onCancel={() => {
          // setStorage('autoCheckUpdate', 'false')
        }}
        onConfirm={() => {
          sureUpdate();
        }}
        onModalHide={() => {
          setVisible(false);
        }}
      />
    </View>
  );
};
