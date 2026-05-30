
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper'

const orangeWhite = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#F48D16',
    primaryContainer: '#ffd88c',
  },
}
const blueWhite = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4781ff',
    primaryContainer: '#a5c2ff',

  },
}
const greenBlack = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#75eb92',
    primaryContainer: '#54af6a',
  },
}

export default {
  orangeWhite,
  blueWhite,
  greenBlack
}