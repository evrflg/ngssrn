// 自定义活动
import React, { useEffect, useRef, useState } from 'react';
import { TextInput, Pressable, Text, View, StyleSheet } from 'react-native';
import { joinAct } from '@/api';
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { missionTheme } from "@/components/active/components/activeConfg";
import { Colors } from '@/constants/Colors';
import { useToast } from '@/components/common/toast';
import { useTranslation } from 'react-i18next';

type CustomActivityProps = {
  param: any;
  data: any;
};

const CustomActivityButton = ({
  onPress,
  children,
  theme,
  disabled = false,
}: {
  onPress: () => void;
  children: React.ReactNode;
  theme: string;
  disabled?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={{
      marginHorizontal: 12,
      borderRadius: 6,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      minHeight: 36,
    }}
  >
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      colors={[Colors[theme].primary, Colors[theme].gradient]}
      style={[
        StyleSheet.absoluteFillObject,
        { borderRadius: 6, opacity: disabled ? 0.5 : 1 },
      ]}
    />
    <Text
      className="text-[13]"
      style={{
        color: Colors[theme].btnText,
        textAlign: 'center',
      }}
    >
      {children}
    </Text>
  </Pressable>
);

const CustomActivity: React.FC<CustomActivityProps> = ({ param, data }) => {
  const inputRef = useRef<TextInput>(null);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [hasFocused, setHasFocused] = useState(false);
  /** 领取成功后 props 未必立即刷新，用本地计数驱动按钮文案重渲染 */
  const [claimedTimesDisplay, setClaimedTimesDisplay] = useState(() =>
    Number(data?.optional?.claimedTimes ?? 0),
  );
  const { t } = useTranslation();
  const { theme } = useTheme();
  const toast = useToast();

  useEffect(() => {
    setClaimedTimesDisplay(Number(data?.optional?.claimedTimes ?? 0));
  }, [data?.id, data?.optional?.claimedTimes]);

  const claimTimesLimitNum = Number(data?.optional?.claimTimesLimit ?? 0);
  const claimExhausted =
    param?.type == 0 && claimedTimesDisplay >= claimTimesLimitNum;

  const handleSubmit = () => {
    if (param.type == 0) {
      if (claimedTimesDisplay >= claimTimesLimitNum) return;
      joinAct({ activityId: data.id, treasureId: '' }).then((res) => {
        if (res?.data?.data) {
          toast.success(t("common.sqSuccess"));
          setClaimedTimesDisplay((n) => n + 1);
        } else {
          toast.error(t(res?.data?.code) || t("common.sqFailed"));
        }
      });
      return;
    }

    if (param.type == 9) {
      if (!showInput) {
        setShowInput(true);
        setHasFocused(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
        return;
      }

      // 如果还没有尝试过聚焦，先聚焦输入框
      if (!hasFocused) {
        setHasFocused(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
        return;
      }

      // 如果已经聚焦过了，检查输入值
      if (!inputValue.trim()) {
        toast.warn(t("active.center.qenter"));
        setHasFocused(false);
        return;
      }

      joinAct({ activityId: data.id, answer: inputValue }).then((res) => {
        if (res.data.success) {
          toast.success(t("common.operationSuccess"));
          if (data.leftTodayApplyTimes > 0) {
            data.leftTodayApplyTimes -= 1;
          }
        } else {
          toast.error(
            t("common.sqFailedWithDetail", {
              detail: String(res?.data?.msg ?? ""),
            }),
          );
        }
        setInputValue('');
        setHasFocused(false);
      });
    }
  };

  // applyPreferential 领取按钮1-不显示，2-显示
  return (
    param?.type == 9 ? (
      <View className='w-full'>
        {showInput && (
          <TextInput ref={inputRef}
            style={[styles.input,
            { backgroundColor: missionTheme[theme].content.a, color: Colors[theme].lightText, }]}
            placeholder={t("active.center.qinput")}
            value={inputValue}
            onChangeText={setInputValue}
            onFocus={() => setHasFocused(true)}
            placeholderTextColor={Colors[theme].lightText} />
        )}
        <CustomActivityButton theme={theme} onPress={handleSubmit} >
          {t("active.center.putHint")}
        </CustomActivityButton>
      </View>
    ) : (
      param?.type == 0 ? (
      <View className='w-full mb-3'>
          <CustomActivityButton
            theme={theme}
            onPress={handleSubmit}
            disabled={claimExhausted}
          >
            {claimExhausted ? t("status.claim.claimed") : t("status.claim.claim")}
          </CustomActivityButton>
        </View>
      ) : (
        <View className='w-full mb-3'>
          <CustomActivityButton theme={theme} onPress={handleSubmit} >
            {t("status.claim.claim")}
          </CustomActivityButton>
        </View>
      )
    )
      
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    marginVertical: 8,
    width: '100%',
  },
  inputContainer: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    color: '#000',
  },
  applyButton: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});

export default CustomActivity;