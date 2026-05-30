import { View, Text, StyleSheet, Image, Pressable, Platform, Linking } from "react-native";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Colors } from "@/constants/Colors";
import Ionicons from '@expo/vector-icons/Ionicons';
import CommonModal from "@/components/common/modal/CommonModal";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { changeIsShowGameModel, changeIsShowGameTipPopup, updateGameWebViewData } from "@/store/game/gameSlice";
import { getStoreJson } from "@/utils/storage";
import { autoExchangeAccInfo } from "../../utils/util";
const isWeb = Platform.OS === "web";
const GameTipPopup = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isShowGameTipPopup, gameTipPopupData }: any = useSelector((state: RootState) => state.game);
  const dispatch = useDispatch();
  const bgColor = theme === 'greenBlack' ? '#202222' : '#fff';
  if (!isShowGameTipPopup) return null;

  /** 关弹窗；仅点关闭/遮罩时为 true：tipType===1 会继续打开游戏 WebView。点底部按钮时应为 false，避免与跳转充值/客服冲突 */
  const dismissPopup = (isOpenGame: boolean) => {
    dispatch(changeIsShowGameTipPopup(false));
    if (isOpenGame && gameTipPopupData?.tipType == 1) {
      if (gameTipPopupData?.gameType == 8) {
        if (isWeb) {
          window.location.href = gameTipPopupData?.gameUrl;
        } else {
          Linking.openURL(gameTipPopupData?.gameUrl);
        }
      } else {
        dispatch(updateGameWebViewData({ url: gameTipPopupData?.gameUrl, gameId: gameTipPopupData?.gameId }));
        dispatch(changeIsShowGameModel(true));
      }
    }else if (gameTipPopupData?.tipType == 6) {
      goToRecharge();
    }
  };

  const onCloseOrBackdrop = (isOpenGame: boolean) => () => dismissPopup(isOpenGame);

  const goPage = async () => {
    if (gameTipPopupData?.tipType == 1 || gameTipPopupData?.tipType == 2) {
      router.push("/wallet/recharge");
    } else if (gameTipPopupData?.tipType == 3) {
      router.push("/my/customerService");
    } else if (gameTipPopupData?.tipType == 4||gameTipPopupData?.tipType == 5||gameTipPopupData?.tipType == 6) {
      goToRecharge();
    }
  }

  const goToRecharge = async () => {
    await new Promise((resolve) => setTimeout(resolve, Platform.OS === "ios" ? 100 : 0));
    getStoreJson("lastGame").then((res: any) => {
      if (res?.gameId) {
        autoExchangeAccInfo(dispatch, res?.gameId);
      }
    });
    dispatch(changeIsShowGameModel(false));
    router.push("/wallet/recharge");
  }

  return (
    <View >
      <CommonModal
        visible={isShowGameTipPopup}
        onClose={onCloseOrBackdrop(true)}
        onBackdropPress={onCloseOrBackdrop(true)}
        contentStyle={{ justifyContent: 'center' }}
        extendBottomSafeArea={false}
      >
        <View style={styles.popupStack}>
          <View style={[styles.container, { backgroundColor: bgColor }]}>
            <Image
              source={require('@/assets/images/wallet/warning.webp')}
              style={styles.image}
              resizeMode="contain"
            />
            {gameTipPopupData?.tipType == 1 &&
            <Text style={[styles.title, { color: Colors[theme].text }]}>
              {t("games.gameTipPopup.tipText")}</Text>}
            {gameTipPopupData?.tipType == 2 && (
              <View
                className="flex-row flex-wrap justify-center items-center px-1"
                style={styles.titleRow}
              >
                <Text style={[styles.title, { color: Colors[theme].text, marginTop: 0 }]}>
                  {gameTipPopupData?.errorMsg}
                </Text>
                <Text style={[styles.title, { color: Colors[theme].goldColor, marginTop: 0 }]}>
                  {gameTipPopupData?.value}
                </Text>
              </View>
            )}
            {gameTipPopupData?.tipType == 3 && (
              <View
                className="flex-row flex-wrap justify-center items-center px-1"
                style={styles.titleRow}
              >
                <Text style={[styles.title, { color: Colors[theme].text, marginTop: 0 }]}>
                  {gameTipPopupData?.errorMsg}
                </Text>
                <Text style={[styles.title, { color: Colors[theme].goldColor, marginTop: 0 }]}>
                  {t("games.gameTipPopup.contactCustomerService")}
                </Text>
              </View>
            )}
            {gameTipPopupData?.tipType == 4 &&
            <Text style={[styles.title, { color: Colors[theme].text }]}>
              {t("games.gameTipPopup.inGameTips1")}</Text>}
              {gameTipPopupData?.tipType == 5 &&
            <Text style={[styles.title, { color: Colors[theme].text }]}>
              {t("games.gameTipPopup.inGameTips2")}</Text>}
              {gameTipPopupData?.tipType == 6 &&
            <Text style={[styles.title, { color: Colors[theme].text }]}>
              {t("games.gameTipPopup.inGameTips3")}</Text>}
            <Pressable
              onPress={() => {
                dismissPopup(false);
                goPage();
              }}
              style={styles.button}
            >
              <LinearGradient
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={{
                  height: 30,
                  borderRadius: 25,
                  paddingHorizontal: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                colors={[Colors[theme].primary, Colors[theme].gradient]}
              >
                <Text style={{ color: Colors[theme].btnText, fontSize: 14, fontWeight: 'bold' }}>
                  {(gameTipPopupData?.tipType == 1 || gameTipPopupData?.tipType == 2 || 
                    gameTipPopupData?.tipType == 4||gameTipPopupData?.tipType == 5||
                    gameTipPopupData?.tipType == 6)&&t("games.gameTipPopup.goToRecharge")}
                  {(gameTipPopupData?.tipType == 3 )&&t("games.gameTipPopup.contactCustomerService")}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
          <Pressable
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            style={styles.closeOutside}
            onPress={onCloseOrBackdrop(true)}
          >
            <Ionicons name="close-circle-outline" size={34} color="#fff" />
          </Pressable>
        </View>
      </CommonModal>
    </View>
  )
}

export default GameTipPopup;

const styles = StyleSheet.create({
  popupStack: {
    alignItems: "center",
    width: "100%",
  },
  container: {
    width: 300,
    height: 209,
    padding: 10,
    borderRadius: 8,
    position: 'relative',
    alignItems: 'center',
  },
  image: {
    width: 110,
    height: 100,
    position: 'absolute',
    top: -50,
    left: '50%',
    transform: [{ translateX: '-50%' }],
  },
  closeOutside: {
    marginTop: 9,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    marginTop: 65,
    maxWidth: "100%",
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 65,
  },
  button: {
    marginTop: 40,
    width: '100%',
    height: 30,
    borderRadius: 25,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
})