import React from 'react';
import { Image, StyleProp, Text, View, ViewStyle } from 'react-native';
import { I18nText } from '@/components/I18nText';
import { Colors } from '@/constants/Colors';
import { MoneySelectorCheckedIcon } from '@/components/icons/wallet';

type RechargeTabContentProps = {
  tab: any;
  index: number;
  currentIndex: number;
  theme: string;
  depositBonusInfo?: { giftType?: number; giftValue?: number | string };
  style?: StyleProp<ViewStyle>;
};

export const RechargeTabContent = React.memo(
  ({
    tab,
    index,
    currentIndex,
    theme,
    depositBonusInfo = { giftType: 0, giftValue: 0 },
    style = {},
  }: RechargeTabContentProps) => {
    const borderStyles = () => {
      return index === currentIndex ? `border border-${theme}-primary` : '';
    };

    return (
      <View
        key={index}
        className={`relative overflow-hidden flex-1 rounded-lg bg-${theme}-btnText flex items-center px-2 py-3 ${borderStyles()}`}
        style={style}
      >
        <Image
          source={tab.icon}
          style={{ width: 31, height: 31 }}
          resizeMode="contain"
        />
        <I18nText
          i18nKey={tab.i18n}
          className={`mt-1 text-sm text-center ${index === currentIndex ? `text-${theme}-primary` : `text-${theme}-text`}`}
          style={{ textAlign: 'center', width: '100%' }}
        />
        {tab.badge != null && String(tab.badge).length > 0 ? (
          <Text
            className={`text-${theme}-primary absolute top-0 right-1 font-medium`}
            style={{ fontSize: 10 }}
          >
            {tab.badge}
          </Text>
        ) : null}

        {index === currentIndex && (
          <View pointerEvents="none" className="absolute -right-px -bottom-px">
            <MoneySelectorCheckedIcon fill={Colors[theme].primary} width={30} height={22} />
          </View>
        )}

      </View>
    );
  },
);
