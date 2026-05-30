import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { VerifySlide } from './VerifySlide';
import { View } from 'react-native';
import { getCode } from "@/api";
import { useTranslation } from "react-i18next";
import CommonModal from "@/components/common/modal/CommonModal";

export const VerifyCode = React.forwardRef(({
  onVerifyCallback,
  verifyType,
}: {
  onVerifyCallback: (data: any) => void,
  verifyType: string
}, ref) => {
  const filterModalRef = useRef<any>(null);
  const { t } = useTranslation();
  const [initPicData, setInitPicData] = useState(null)

  const toggleVerify = useCallback(() => {
    filterModalRef.current?.openModal();
  }, []);

  React.useImperativeHandle(
    ref,
    () => ({
      toggleVerify,
    }),
    [toggleVerify],
  );

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    await getPictrue()
  }

  const getPictrue = async () => {
    //获取验证码图片
    const data = {
      captchaType: "blockPuzzle",
    }
    const captcha = await getCode(data)
    const res = captcha?.data
    if (res?.repCode === '0000' && res?.repData) {
      setInitPicData(res?.repData)
    }
  }

  return (
    <CommonModal
      ref={filterModalRef}
      extendBottomSafeArea={false}
      contentStyle={styles.modalContent}
    >
        <View
          style={styles.verifybox}>
          <View style={styles.verifyboxTop}>
            <Text style={{ fontSize: 15, color: '#45494c' }}>{t("login.verifySlide.verifyComplete")}</Text>
            <AntDesign onPress={() => {
              filterModalRef.current?.closeModal();
            }} name="close" size={20} color="#333" />
          </View>
          <View style={styles.verifyboxBottom}>
            <VerifySlide data={{ filterModalRef: filterModalRef, onVerifyCallback: onVerifyCallback, initPicData: initPicData, getPictrue }} />
          </View>
        </View>
    </CommonModal>
  )
})

const styles = StyleSheet.create({
  /** 覆盖 CommonModal 默认贴底布局，使弹层在屏幕正中 */
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifybox: {
    backgroundColor: '#fff',
    paddingVertical: 3,
    borderRadius: 5,
    overflow: 'hidden',
    width: 350,
  },
  verifyboxTop: {
    height: 40,
    paddingVertical: 0,
    paddingHorizontal: 15,
    fontSize: 14,
    lineHeight: 40,
    color: '#45494c',
    textAlign: 'left',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  verifyboxBottom: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  }
});

