
import { Text, View, Image, ImageBackground } from 'react-native';
import { screen } from "@/utils/screen" 
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from "@/constants/Colors";
import { I18nText } from '@/components/I18nText';
import { useTheme } from '@/hooks/theme/ThemeProvider';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { AnimatedNumber } from '@/components/common/BaseProgress'

const WINDOW_WIDTH = screen.get('window').width
export const BanlanceInfo = () => {
    const { theme } = useTheme();
    const userInfo = useSelector((state: RootState) => state?.user?.userInfo);

    return (
      <View className="pt-4">
        <LinearGradient style={{ borderRadius: 12 }} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }} colors={[Colors[theme].gradient, Colors[theme].primary]}>
          <ImageBackground
            source={require('@/assets/images/wallet/wenli.png')}
            style={{ height: 135, width: WINDOW_WIDTH - 36 }}
            resizeMode='stretch'
          >
            <View className='flex-row px-4 mt-4'>
              <Image 
                source={require('@/assets/images/wallet/bag.png')} 
                className="mb-2"
                style={{ width:18, height:18 }}
                resizeMode="contain"
              />
              <I18nText i18nKey="wallet.balance" className={`text-${theme}-btnText text-sm mb-1 ml-1.5`} />
            </View>
            <View className='px-4'>
              <AnimatedNumber
                to={Number(userInfo?.money ?? 0)}
                className={`text-${theme}-btnText text-2xl font-bold`}
              />
            </View>
            <View className="w-full absolute bottom-2 flex-row items-center justify-between px-4">
              <Image
                source={require('@/assets/images/wallet/cip.png')}
                style={{ width: 24, height: 16 }}
                resizeMode="contain"
              />
              <View className="flex-row mt-1">
                <Text className={`text-white mr-2 text-xl`}>****</Text>
                <Text className={`text-white text-xl`}>****</Text>
              </View>
            </View>
          </ImageBackground>
        </LinearGradient>
      </View>
    )
  }