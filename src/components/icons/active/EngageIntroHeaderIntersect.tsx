import React, { useId } from "react";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
  type SvgProps,
} from "react-native-svg";

const VIEWBOX_W = 27.8408;
const VIEWBOX_H = 46.4014;

export type EngageIntroHeaderIntersectProps = Omit<
  SvgProps,
  "viewBox" | "width" | "height"
> & {
  width?: SvgProps["width"];
  height?: SvgProps["height"];
  /** 渐变起点（对应设计稿左侧高光） */
  startColor?: string;
  startOpacity?: number;
  /** 渐变终点 */
  endColor?: string;
  endOpacity?: number;
};

/** 已知高度时，按 viewBox 比例计算宽度（不变形） */
export function engageIntroIntersectAspectWidth(height: number) {
  return (height * VIEWBOX_W) / VIEWBOX_H;
}

/**
 * 积分说明弹窗标题区左侧 Intersect 高光（Figma 导出）。
 * 渐变 id 按实例去重，避免 Web 多实例 url(#…) 冲突。
 */
export default function EngageIntroHeaderIntersect({
  width = VIEWBOX_W,
  height = VIEWBOX_H,
  preserveAspectRatio = "none",
  startColor = "#FFFFFF",
  startOpacity = 0.3,
  endColor = "#FFFFFF",
  endOpacity = 0,
  ...svgRest
}: EngageIntroHeaderIntersectProps) {
  const gid = `eiint${useId().replace(/[^a-zA-Z0-9]/g, "") || "0"}-paint`;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      preserveAspectRatio={preserveAspectRatio as SvgProps["preserveAspectRatio"]}
      fill="none"
      {...svgRest}
    >
      <Defs>
        <SvgLinearGradient
          id={gid}
          x1={27.8408}
          y1={23.2007}
          x2={0}
          y2={23.2007}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={startColor} stopOpacity={startOpacity} />
          <Stop offset="1" stopColor={endColor} stopOpacity={endOpacity} />
        </SvgLinearGradient>
      </Defs>
      <Path
        d="M27.2881 0C27.6501 2.21953 27.8408 4.49746 27.8408 6.81934C27.8406 25.0548 16.2307 40.5761 0 46.4014V16C1.92924e-06 7.16345 7.16345 2.09384e-07 16 0H27.2881Z"
        fill={`url(#${gid})`}
      />
    </Svg>
  );
}
