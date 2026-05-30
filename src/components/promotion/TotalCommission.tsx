import {
  FC,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  Text,
  View,
  Easing,
  Animated,
  ScrollView,
  TouchableOpacity,
  Pressable
} from 'react-native';
import { Icon } from '@rneui/themed';
import { I18nText } from '../I18nText';
import { useTranslation } from 'react-i18next';
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { getRebateConfig } from '@/api/post/promotion'
import NoData from "@/components/common/NoData";
import Ionicons from '@expo/vector-icons/Ionicons';
import CommonDialog from '@/components/common/Dialog';
import ChessIcon from '@/components/icons/promotion/chess.svg';
import EGameIcon from '@/components/icons/promotion/eGame.svg';
import FishingIcon from '@/components/icons/promotion/fishing.svg';
import LiveCasinoIcon from '@/components/icons/promotion/liveCasino.svg';
import LotteryIcon from '@/components/icons/promotion/lottery.svg';
import SlotIcon from '@/components/icons/promotion/slot.svg';
import SportIcon from '@/components/icons/promotion/sport.svg';

interface RowData {
  id: string
  rebateLevelName: string
  dailyRechargeUsers: number
  dailyRechargeTotal: number
  dailyBetTotal: number
  rates: Array<{
    id: string
    agentLevel: number
    lottery: number
    liveCasino: number
    egame: number
    sports: number
    esports: number
    fishing: number
    chess: number
  }>
}
type TableRowProp = {
  row: RowData
  expandedId: string
  setExpandedId(value: string): void
}

const COLLAPSED_HEIGHT = 40

// 表格行
const TableRow: FC<TableRowProp> = ({ row, expandedId, setExpandedId }) => {
  const contentRef = useRef<View>(null);
  const { theme, themeColors: { primary } } = useTheme();
  const [contentHeight, setContentHeight] = useState(0);

  const heightAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  // 根据动态获取的高度设置动画 outputRange
  const height = heightAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_HEIGHT, COLLAPSED_HEIGHT + contentHeight],
  });
  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  useEffect(() => {
    const isExpanded = expandedId === row.id;
    if (contentHeight > 0) {
      Animated.timing(rotateAnimation, {
        toValue: isExpanded ? 1 : 0,
        duration: 220,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
      Animated.timing(heightAnimation, {
        toValue: isExpanded ? 1 : 0,
        duration: 220,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    }
  }, [expandedId, contentHeight]);

  const onToggleExpand = () => {
    const needClose = expandedId === row.id;
    if (needClose) {
      setExpandedId('');
    } else {
      setExpandedId(row.id);
    }
  };

  const onLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  return (
    <Animated.View style={{ height, overflow: 'hidden' }}>
      <Pressable onPress={onToggleExpand}>
        <View className='h-10 flex-row justify-between items-center'>
          <Text className={`flex-1 text-xs text-${theme}-text text-center`}>{row.rebateLevelName}</Text>
          <Text className={`flex-1 text-xs text-${theme}-text text-center`}>{row.dailyRechargeUsers}</Text>
          <Text className={`flex-1 text-xs text-${theme}-text text-center`}>{row.dailyRechargeTotal}</Text>
          <Text className={`flex-1 text-xs text-${theme}-text text-center`}>{row.dailyBetTotal}</Text>
          <View className='w-[18px]'>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons
                color={'#666'}
                name={'chevron-down'}
                size={18}
              />
            </Animated.View>
          </View>
        </View>
      </Pressable>
      <View
        ref={contentRef}
        onLayout={onLayout}
        style={{ position: 'absolute', top: COLLAPSED_HEIGHT, width: '100%' }}
      >
        <View className={`${theme === 'greenBlack' && 'bg-greenBlack-background'} border-t border-l border-[rgb(112,112,112)]`}>
          <View className='flex flex-row'>
            <View className='w-16 justify-center items-center p-1 border-r border-b border-[#707070]'>
              <I18nText type="tiptitle" i18nKey="agent.agentLevel" className={`text-[#707070] text-center font-semibold`} />
            </View>
            <View className='flex-1 justify-center items-center py-2 border-r border-b border-[#707070]'>
              <LotteryIcon fill={primary} />
            </View>
            <View className='flex-1 justify-center items-center py-2 border-r border-b border-[#707070]'>
              <LiveCasinoIcon fill={primary} />
            </View>
            <View className='flex-1 justify-center items-center py-2 border-r border-b border-[#707070]'>
              <SlotIcon fill={primary} />
            </View>
            <View className='flex-1 justify-center items-center py-2 border-r border-b border-[#707070]'>
              <SportIcon fill={primary} />
            </View>
            <View className='flex-1 justify-center items-center py-2 border-r border-b border-[#707070]'>
              <EGameIcon fill={primary} />
            </View>
            <View className='flex-1 justify-center items-center py-2 border-r border-b border-[#707070]'>
              <FishingIcon fill={primary} />
            </View>
            <View className='flex-1 justify-center items-center py-2 border-r border-b border-[#707070]'>
              <ChessIcon fill={primary} />
            </View>
          </View>
          {row.rates.map(item => (
            <View className='h-7 flex flex-row' key={item.id}>
              <View className='w-16 justify-center items-center p-1 border-r border-b border-[#707070]'>
                <Text className={`text-xs text-[#707070]`}>{item.agentLevel}</Text>
              </View>
              <View className='flex-1 justify-center items-center py-1 border-r border-b border-[#707070]'>
                <Text className={`text-xs text-[#707070]`}>{item.lottery}%</Text>
              </View>
              <View className='flex-1 justify-center items-center py-1 border-r border-b border-[#707070]'>
                <Text className={`text-xs text-[#707070]`}>{item.liveCasino}%</Text>
              </View>
              <View className='flex-1 justify-center items-center py-1 border-r border-b border-[#707070]'>
                <Text className={`text-xs text-[#707070]`}>{item.egame}%</Text>
              </View>
              <View className='flex-1 justify-center items-center py-1 border-r border-b border-[#707070]'>
                <Text className={`text-xs text-[#707070]`}>{item.sports}%</Text>
              </View>
              <View className='flex-1 justify-center items-center py-1 border-r border-b border-[#707070]'>
                <Text className={`text-xs text-[#707070]`}>{item.esports}%</Text>
              </View>
              <View className='flex-1 justify-center items-center py-1 border-r border-b border-[#707070]'>
                <Text className={`text-xs text-[#707070]`}>{item.fishing}%</Text>
              </View>
              <View className='flex-1 justify-center items-center py-1 border-r border-b border-[#707070]'>
                <Text className={`text-xs text-[#707070]`}>{item.chess}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

export default function TotalCommission() {
  const [visible, setVisible] = useState(false)
  const [expandedId, setExpandedId] = useState<string>('');
  const [commission, setCommission] = useState<Array<RowData>>([])
  const { theme, themeColors: { primary } } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (visible && !commission.length) {
      getRebateConfig().then(({ data: { data } }) => {
        setCommission(data.list)
      })
    }
    return () => setExpandedId('')
  }, [visible])

  return (
    <>
      <TouchableOpacity
        className={`flex-row justify-center items-center rounded-3xl h-[26px] px-3 py-1 leading-1 bg-${theme}-gradientEnd`}
        onPress={() => setVisible(true)}>
        <I18nText i18nKey="promotion.totalCommission" className={`text-${theme}-btnText`} />
        <Icon
          name='questioncircleo'
          type='antdesign'
          color={theme === 'blackGreen' ? '#292c2b' : '#fff'}
          style={{
            marginLeft: 6,
            backgroundColor: primary,
            borderRadius: 6
          }}
          size={12}
        />
      </TouchableOpacity>
      <CommonDialog
        visible={visible}
        setVisible={setVisible}
        title={t('promotion.rebateCondition')}
        titleHasBackground

      >
        <>
          <View className='min-h-8 flex-row justify-between'>
            <I18nText i18nKey="promotion.grade" className={`flex-1 text-${theme}-text text-center`} />
            <I18nText i18nKey="agent.todayTotalTechargeUsers" className={`flex-1 text-${theme}-text text-center`} />
            <I18nText i18nKey="wallet.recharge.rechargeAmount" className={`flex-1 text-${theme}-text text-center`} />
            <I18nText i18nKey="betRecord.betAmount" className={`flex-1 text-${theme}-text text-center`} />
            <View className='w-[18px]' />
          </View>
          <View className='h-[1px] bg-gray-600' />
          {
            commission.length
              ? <ScrollView className='max-h-96'>
                {
                  commission.map(row => <TableRow {...{ row, expandedId, setExpandedId }} key={row.id} />)
                }
              </ScrollView>
              : <NoData style={{ marginVertical: 36 }} />
          }
        </>
      </CommonDialog>
    </>
  )
}
