import { StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { changesShowLanguageModal } from "@/store/user/userSlice"
import { LangList } from './LangList';
import { View } from 'react-native';
import React from 'react';
import CommonModal from '../modal/CommonModal';

export const SelectLanguagePopup = React.memo(() => {
  const showLanguageModal = useSelector((state: RootState) => state.user.showLanguageModal);
  const dispatch: AppDispatch = useDispatch();

  //关闭语言选择
  const toHideLanguageModel = () => {
    dispatch(changesShowLanguageModal(false))
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1000 }}>
      <CommonModal
        visible={showLanguageModal}
        onClose={toHideLanguageModel}
      >
        <LangList />
      </CommonModal>
    </View>
  )
})