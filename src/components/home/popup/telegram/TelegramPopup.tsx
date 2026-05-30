import { bindTelegram, checkTgBind } from "@/api";
import { RootState } from "@/store/store";
import { getStoreJson, removeStorage, setStoreJson } from "@/utils/storage";
import { usePathname } from "expo-router";
import { useCallback, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { usePopupEligibility } from "../common/usePopupEligibility";
import { CloseButton } from "../common/CloseButton";
import { Content } from "./Content";
import { PopupModal } from "../common/PopupModal";

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const STORAGE_KEY = "tg_bind_hide_date";
/** 与 ProPopup 遮罩接近；原 PopupModal backdropOpacity 0.8 */
const MODAL_BACKDROP = "rgba(0,0,0,0.8)";

interface TelegramPopupProps {
  visible?: boolean;
  onClose?: () => void;
  onQueueStateChange?: (canShow: boolean) => void;
  standalone?: boolean;
  hideCheckBox?: boolean;
}

export const TelegramPopup = ({
  visible,
  onClose,
  onQueueStateChange,
  standalone = false,
  hideCheckBox = false,
}: TelegramPopupProps = {}) => {
  const pathname = usePathname();

  const userInfo: any = useSelector(
    (state: RootState) => state?.user?.userInfo,
  );

  const checkEligibility = useCallback(async () => {
    const [hideDate, isBind] = await Promise.all([
      getStoreJson(STORAGE_KEY),
      checkTgBind()
        .then(({ data: { data } }) => data?.data?.toggle && !data?.data?.bind)
        .catch(() => false),
    ]);
    const today = getToday();
    if (today === hideDate) return false;
    return !isBind;
  }, []);

  const enabled = !standalone && pathname === "/home" && !!userInfo?.isLogin;
  const { canShow: canShowPopup } = usePopupEligibility(
    checkEligibility,
    [enabled],
    {
      enabled,
      onResult: onQueueStateChange,
    },
  );

  const [isChecked, setIsChecked] = useState(false);
  const isVisible = standalone ? !!visible : !!visible && canShowPopup;

  const onClosePop = useCallback(async () => {
    if (isChecked) {
      await setStoreJson(STORAGE_KEY, getToday());
    } else {
      await removeStorage(STORAGE_KEY);
    }
    onClose?.();
  }, [isChecked, onClose]);

  const handleBind = useCallback(async () => {
    const resp = await bindTelegram();
    if (resp.data?.data) {
      Linking.canOpenURL(resp.data.data).then((canOpen) => {
        if (canOpen) Linking.openURL(resp.data.data);
      });
    }
    await onClosePop();
  }, [onClosePop]);

  if (!isVisible) return null;

  const inner = (
    <>
      <Content
        isChecked={isChecked}
        onToggleChecked={() => setIsChecked((p) => !p)}
        onBind={handleBind}
        hideCheckBox={hideCheckBox}
      />
      <CloseButton onClose={onClosePop} />
    </>
  );

  /**
   * Web：全页 Modal（PopupModal / react-native-modal）。
   * iOS/Android：与 VIP ProPopup 一致——屏内 absolute 叠层，不叠 RN Modal，减轻首页 push 其它页时的闪屏。
   */
  if (Platform.OS === "web") {
    return (
      <PopupModal
        id="telegram-popup"
        isVisible={isVisible}
        onClose={onClosePop}
        style={styles.modalContainer}
      >
        {inner}
      </PopupModal>
    );
  }

  return (
    <View style={styles.nativeOverlay} pointerEvents="box-none">
      <Pressable
        style={[StyleSheet.absoluteFillObject, { backgroundColor: MODAL_BACKDROP }]}
        onPress={onClosePop}
      />
      <View style={styles.nativeContentLayer} pointerEvents="box-none">
        <View style={styles.modalContainer} pointerEvents="box-none">
          {inner}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    overflow: "visible",
    width: "100%",
  },
  nativeOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100000,
    ...Platform.select({
      android: { elevation: 100 },
      default: {},
    }),
  },
  nativeContentLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});
