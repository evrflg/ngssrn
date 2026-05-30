import { Svg, ClipPath, Defs, Path, Rect, SvgProps } from "react-native-svg";

export default function ({ color }: SvgProps) {
  return (
    <Svg width="130" height="34" viewBox="0 0 130 34" fill="none">
      <Rect x={-4} y={-4} width={137.914} height={42} fill="transparent" />
      <Path
        fill={color}
        fillOpacity={0.25}
        d="M129.914 24C129.914 29.5228 125.437 34 119.914 34H0C8.83656 34 16 26.8366 16 18V10C16 4.47715 20.4772 0 26 0H119.914C125.437 0 129.914 4.47715 129.914 10V24Z"
      />

      <Defs>
        <ClipPath id="bgblur_0_2_11897_clip_path" transform="translate(4 4)">
          <Path d="M129.914 24C129.914 29.5228 125.437 34 119.914 34H0C8.83656 34 16 26.8366 16 18V10C16 4.47715 20.4772 0 26 0H119.914C125.437 0 129.914 4.47715 129.914 10V24Z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
