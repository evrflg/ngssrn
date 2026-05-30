
import { Colors } from '@/constants/Colors';
import { useTheme } from "@/hooks/theme/ThemeProvider";

import tinycolor from 'tinycolor2';
const generateColorShades = (baseColor: string) => {
  const shades = {
    50: tinycolor(baseColor).lighten(52).toString(),
    100: tinycolor(baseColor).lighten(42).toString(),
    150: tinycolor(baseColor).lighten(38).toString(),
    155: tinycolor(baseColor).lighten(37).toString(),
    160: tinycolor(baseColor).lighten(35).toString(),
    200: tinycolor(baseColor).lighten(26).toString(),
    270: tinycolor(baseColor).lighten(17).toString(),
    300: tinycolor(baseColor).lighten(12).toString(),
    400: tinycolor(baseColor).lighten(6).toString(),
    500: tinycolor(baseColor).toString(),
    600: tinycolor(baseColor).darken(6).toString(),
    700: tinycolor(baseColor).darken(12).toString(),
    800: tinycolor(baseColor).darken(18).toString(),
    900: tinycolor(baseColor).darken(24).toString(),
  };

  return shades;
};

export function useThemeColor(
  props: any,
  colorName: keyof typeof Colors.greenBlack & keyof typeof Colors.blue & keyof typeof Colors.orange
) {
  const { theme, themeColors } = useTheme()//主题
  const themeColor = generateColorShades(themeColors?.primary ?? '')
  Colors[theme] = { ...Colors[theme], themeColor }
  const colorFromProps = props[theme];
  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
