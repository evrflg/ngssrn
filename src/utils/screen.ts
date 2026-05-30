import { Platform } from 'react-native';
import { Dimensions } from 'react-native';
import { MAX_WIDTH } from '@/hooks/useMaxWidth';

const windowWidth: any = Dimensions.get('window').width
export const isWeb = Platform.OS === 'web'
export const isDesktop = isWeb && windowWidth > 768
const screenMaxWidth = MAX_WIDTH

interface Screen {
  get(type: 'window' | 'screen'): { width: number, height: number }
}
export const screen: Screen = {
  get: (type) => {
    if (type === 'window') {
      return {
        // width: isDesktop ? screenMaxWidth : windowWidth,
        width: Math.min(screenMaxWidth, windowWidth),
        height: Dimensions.get('window').height,
      }
    }
    if (type === 'screen') {
      return {
        // width: isDesktop ? screenMaxWidth : Dimensions.get('screen').width,
        width: Math.min(screenMaxWidth, Dimensions.get('screen').width),
        height: Dimensions.get('screen').height,
      }
    }
    return { width: 0, height: 0 }
  }
}