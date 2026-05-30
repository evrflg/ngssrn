import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

export default function ScreenshotIcon(props: SvgProps) {
  const { width = 40, height = 40, ...rest } = props;
  const fillColor = props.fill || "#4781FF";

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 180 180"
      fill="none"
      {...rest}
    >
      <Path
        d="M138.82 46.2706C140.424 44.8874 142.658 45.8872 142.277 47.956L128.367 123.528C127.979 125.634 125.417 126.558 123.753 125.191L96.5 102.8L118.338 76.7436C119.259 75.6443 117.849 74.2846 116.814 75.2743L90.5 100.5L70.8286 89.7984C68.9095 88.7544 68.9802 85.9856 70.9584 85.0405L138.82 46.2706Z"
        fill={fillColor}
      />
      <Path
        d="M50 115C50 109.477 54.4772 105 60 105H85L110 125H60C54.4772 125 50 120.523 50 115Z"
        fill={fillColor}
        opacity={0.5}
      />
      <Path
        d="M108 125L128.367 123.528C127.979 125.634 125.417 126.558 123.753 125.191L108 125Z"
        fill={fillColor}
        opacity={0.5}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M90 0C139.706 0 180 40.2944 180 90C180 139.706 139.706 180 90 180C40.2944 180 0 139.706 0 90C0 40.2944 40.2944 0 90 0ZM90 9C45.2649 9 9 45.2649 9 90C9 134.735 45.2649 171 90 171C134.735 171 171 134.735 171 90C171 45.2649 134.735 9 90 9Z"
        fill={fillColor}
      />
    </Svg>
  );
}
