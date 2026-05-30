import { Dimensions } from 'react-native';

// 头像图片
export const avatarImages = {
  '1': require('../assets/images/avatars/1.png'),
  '2': require('../assets/images/avatars/2.png'),
  '3': require('../assets/images/avatars/3.png'),
  '4': require('../assets/images/avatars/4.png'),
  '5': require('../assets/images/avatars/5.png'),
  '6': require('../assets/images/avatars/6.png'),
  '7': require('../assets/images/avatars/7.png'),
  '8': require('../assets/images/avatars/8.png'),
  '9': require('../assets/images/avatars/9.png'),
  '10': require('../assets/images/avatars/10.png'),
  '11': require('../assets/images/avatars/11.png'),
  '12': require('../assets/images/avatars/12.png'),
  '13': require('../assets/images/avatars/13.png'),
  '14': require('../assets/images/avatars/14.png'),
  '15': require('../assets/images/avatars/15.png'),
  '16': require('../assets/images/avatars/16.png'),
  '17': require('../assets/images/avatars/17.png'),
  '18': require('../assets/images/avatars/18.png'),
  '19': require('../assets/images/avatars/19.png'),
  '20': require('../assets/images/avatars/20.png'),
  '21': require('../assets/images/avatars/21.png'),
  '22': require('../assets/images/avatars/22.png'),
  '23': require('../assets/images/avatars/23.png'),
  '24': require('../assets/images/avatars/24.png'),
  '25': require('../assets/images/avatars/25.png'),
  '26': require('../assets/images/avatars/26.png'),
  '27': require('../assets/images/avatars/27.png'),
  '28': require('../assets/images/avatars/28.png'),
  '29': require('../assets/images/avatars/29.png'),
  '30': require('../assets/images/avatars/30.png'),
  '31': require('../assets/images/avatars/31.png'),
  '32': require('../assets/images/avatars/32.png'),
  '33': require('../assets/images/avatars/33.png'),
  '34': require('../assets/images/avatars/34.png'),
  '35': require('../assets/images/avatars/35.png'),
  '36': require('../assets/images/avatars/36.png'),
  '37': require('../assets/images/avatars/37.png'),
  '38': require('../assets/images/avatars/38.png'),
  '39': require('../assets/images/avatars/39.png'),
} as const;

export type AvatarKey = keyof typeof avatarImages;
export const AVATAR_STORAGE_KEY = 'selectedAvatar';

export const NUM_COLUMNS = 3;
export const AVATAR_SIZE = Math.min((Dimensions.get('window').width - 60) / NUM_COLUMNS, 100);

