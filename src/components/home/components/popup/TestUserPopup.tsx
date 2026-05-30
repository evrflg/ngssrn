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
import { changeIsShowTestUserPopup } from "@/store/user/userSlice";
const TestUserPopup = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { userInfo, isShowTestUserPopup }: any = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const bgColor = theme === 'greenBlack' ? '#202222' : '#fff';
  if (!isShowTestUserPopup || !userInfo?.isTestUser) return null;


  const goPage = () => {
    dispatch(changeIsShowTestUserPopup(false));
    router.push("/register");
  }

  return (
    <View >
      <CommonModal
        visible={isShowTestUserPopup }
        contentStyle={{ justifyContent: 'center' }}
        extendBottomSafeArea={false}
      >
        <View style={styles.popupStack}>
          <View style={[styles.container, { backgroundColor: bgColor }]}>
            <Image
              source={require('@/assets/images/common/trial_tips.png')}
              style={styles.image}
              resizeMode="contain"
            />
           
            <Text style={[styles.title, { color: Colors[theme].text }]}>
              {t('navigation.functionNotUnlocked')}
            </Text>
            <Text style={[styles.text, { color: Colors[theme].text }]}>
              {t('navigation.registerOfficialAccount')}
            </Text>
            <Text style={[styles.text, { color: Colors[theme].text }]}>
              {t('navigation.andGetExclusiveNewbieReward')}
            </Text>

            <Pressable
              onPress={() => {
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
                  {t('pageName.register')}
                </Text>
              </LinearGradient>
            </Pressable>
          
          
          </View>
          <Pressable
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            style={styles.closeOutside}
            onPress={()=>{
              dispatch(changeIsShowTestUserPopup(false));
            }}
          >
            <Ionicons name="close-circle-outline" size={34} color="#fff" />
          </Pressable>
        </View>
      </CommonModal>
    </View>
  )
}

export default TestUserPopup;

const styles = StyleSheet.create({
  popupStack: {
    alignItems: "center",
    width: "100%",
  },
  container: {
    width: 300,
    minHeight: 209,
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
  title: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    width: '100%',
    height: 30,
    borderRadius: 25,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
})