import React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";

interface BitcoinIconProps {
  width?: number;
  height?: number;
  fill?: string;
  fillOpacity?: number;
}

const BitcoinIcon: React.FC<BitcoinIconProps> = ({
  width = 60,
  height = 60,
  fill = "white",
  fillOpacity = 0.85,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 60 60" fill="none">
      <Defs>
        <ClipPath id="clip0_729_6857">
          <Rect width="60" height="60" fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0_729_6857)">
        <Path
          d="M36.4286 26.2574C36.4286 26.2574 38.1522 25.1829 40.7256 21.4306C43.2989 17.6782 41.4412 12.8191 38.8033 8.71945C36.1965 4.60571 28.7291 5.31435 28.7291 5.31435L26.3695 0.0899612L19.8082 3.05343L21.9319 7.75538L19.3198 8.93515L17.1961 4.23319L10.5105 7.25284L12.6342 11.9548L2.12368 16.702L4.15021 21.1888L9.56362 20.4088L23.7493 51.8166L19.6539 55.1834L21.701 59.5499L31.714 55.0275L34.0736 60.2519L41.008 57.1198L38.6484 51.8955L41.2294 50.7297L43.589 55.9541L50.5856 52.794L47.9373 46.516C53.3142 42.4224 52.993 36.2403 52.2064 33.0065C47.8414 21.4357 36.3975 26.2714 36.3975 26.2714L36.4286 26.2574ZM18.4088 16.4508L24.317 13.7823C27.209 12.4761 30.6272 13.7443 31.918 16.6024L32.0291 16.8482C33.8335 20.8433 32.0259 25.5449 27.9834 27.3707L24.0964 29.1263L18.3777 16.4648L18.4088 16.4508ZM38.9059 44.342L32.3135 47.3195L26.6087 34.6888L33.2011 31.7112C36.746 30.1101 40.8839 31.6453 42.4662 35.1487C44.0486 38.6522 42.4647 42.7716 38.9197 44.3727L38.9059 44.342Z"
          fill={fill}
          fillOpacity={fillOpacity}
        />
      </G>
    </Svg>
  );
};

export default BitcoinIcon;
