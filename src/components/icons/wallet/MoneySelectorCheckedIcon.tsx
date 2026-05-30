import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

type Props = {
  /** 主色块，传 Colors[theme].primary */
  fill?: string;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * 金额选中角标（与 Web money-selector__checked-svg 同源）。
 * viewBox 按 path 实际坐标 0–32×24；展示尺寸默认 30×22。
 */
export default function MoneySelectorCheckedIcon({
  fill = "#000",
  width = 30,
  height = 22,
  style,
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 32 24"
      style={style}
    >
      <Path
        fill={fill}
        d="M32 0V16C32 20.4183 28.4183 24 24 24H0L32 0Z"
      />
      <Path
        fill="#FFFFFF"
        d="M28.9945 12.6411C28.9945 12.6411 27.0754 13.2808 24.8364 15.8396C22.7574 18.1586 22.2776 19.1181 21.478 20.3976C21.398 20.3176 20.1985 17.9986 17 16.3194L18.6792 14.7201C18.6792 14.7201 20.1985 15.7597 21.2381 17.6788C21.2381 17.6788 23.8769 13.6007 28.9945 11.6016V12.6411Z"
      />
    </Svg>
  );
}
