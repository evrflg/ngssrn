import React, { useMemo } from "react";
import Svg, {
  ClipPath,
  Defs,
  G,
  Path,
  Stop,
  LinearGradient as SVGLinearGradient,
} from "react-native-svg";

type TabShapeProps = {
  width?: number;
  height?: number;
  gradientStartColor?: string;
  gradientEndColor?: string;
};

export const IntroTabShape: React.FC<TabShapeProps> = ({
  width = 169,
  height = 34,
  gradientStartColor = "#DBA662",
  gradientEndColor = "#ECCD8D",
}) => {
  const gradientId = useMemo(
    () => `paint0_linear_left_${Math.random().toString(36).slice(2, 10)}`,
    [],
  );

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 169 34"
      preserveAspectRatio="none"
      fill="none"
    >
      <Path
        d="M0 10C0 4.47715 4.47715 0 10 0H169C160.163 3.70472e-07 153 7.16344 153 16V24C153 29.5228 148.523 34 143 34H10C4.47715 34 0 29.5228 0 24V10Z"
        fill={`url(#${gradientId})`}
      />
      <Defs>
        <SVGLinearGradient
          id={gradientId}
          x1="172"
          y1="17"
          x2="0"
          y2="17"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={gradientStartColor} />
          <Stop offset="1" stopColor={gradientEndColor} />
        </SVGLinearGradient>
      </Defs>
    </Svg>
  );
};

export const RulesTabShape: React.FC<TabShapeProps> = ({
  width = 169,
  height = 34,
  gradientStartColor = "#DBA662",
  gradientEndColor = "#ECCD8D",
}) => {
  const gradientId = useMemo(
    () => `paint0_linear_right_${Math.random().toString(36).slice(2, 10)}`,
    [],
  );
  const clipPathId = useMemo(
    () => `bgblur_clip_path_${Math.random().toString(36).slice(2, 10)}`,
    [],
  );

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 169 34"
      preserveAspectRatio="none"
      fill="none"
    >
      <Defs>
        <SVGLinearGradient
          id={gradientId}
          x1="-3"
          y1="17"
          x2="169"
          y2="17"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={gradientStartColor} />
          <Stop offset="1" stopColor={gradientEndColor} />
        </SVGLinearGradient>
        <ClipPath id={clipPathId}>
          <Path d="M169 10C169 4.47715 164.523 0 159 0H0C8.83655 3.70472e-07 16 7.16344 16 16V24C16 29.5228 20.4772 34 26 34H159C164.523 34 169 29.5228 169 24V10Z" />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${clipPathId})`}>
        <Path
          d="M169 10C169 4.47715 164.523 0 159 0H0C8.83655 3.70472e-07 16 7.16344 16 16V24C16 29.5228 20.4772 34 26 34H159C164.523 34 169 29.5228 169 24V10Z"
          fill={`url(#${gradientId})`}
        />
      </G>
    </Svg>
  );
};
