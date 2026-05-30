import { StyleProp, TextStyle, ViewStyle } from "react-native";

export enum POSTION {
  TOP = 0,
  BOTTOM,
}

export interface ToastOptions {
  duration?: number;
  position?: POSTION;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}
