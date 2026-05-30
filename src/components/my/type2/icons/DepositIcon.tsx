import React from "react";
import Svg, { Path } from "react-native-svg";

interface DepositIconProps {
  width?: number;
  height?: number;
}

const DepositIcon: React.FC<DepositIconProps> = ({
  width = 30,
  height = 31,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 30 31" fill="none">
      <Path
        d="M29.7148 3.84089C29.7147 1.41904 27.5001 -0.397783 25.1248 0.0752638L9.58922 3.16964C7.79292 3.52744 6.49922 5.10431 6.49922 6.93589V15.8321C6.49925 17.6726 7.80518 19.2543 9.61234 19.6028L25.148 22.5978C27.5167 23.0544 29.7148 21.2395 29.7148 18.8271V3.84089Z"
        fill="#FFB700"
      />
      <Path
        d="M0 11.8882C0 9.46619 2.2148 7.64903 4.59013 8.12215L20.1258 11.2166C21.9221 11.5744 23.2157 13.151 23.2157 14.9826V23.8786C23.2157 25.7191 21.9098 27.3007 20.1026 27.6492L4.56696 30.6444C2.19822 31.1011 0 29.2862 0 26.8739V11.8882Z"
        fill="#FFB700"
        fillOpacity={0.5}
      />
      <Path
        d="M6.85742 18.2859H15.0625C15.901 18.2859 16.3672 17.3159 15.8434 16.6612L14.8574 15.4287"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M16 21.7141H7.79491C6.95641 21.7141 6.49023 22.6841 7.01404 23.3388L8 24.5713"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default DepositIcon;
