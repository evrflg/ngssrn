import React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

interface HeaderTextIconProps {
  width?: number;
  height?: number;
  fill?: string;
  fillOpacity?: number;
}

const HeaderTextIcon: React.FC<HeaderTextIconProps> = ({
  width = 17,
  height = 16,
  fill = "#A9E782",
  fillOpacity = 0.5
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 17 16"
      fill="none"
    >
      <Defs>
        <ClipPath id="clip0_630_5160">
          <Rect
            width="17"
            height="16"
            fill="white"
          />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0_630_5160)">
        <Path
          d="M4.95403 9.246H2.20977C1.90676 9.246 1.66113 9.49683 1.66113 9.80623V15.4398C1.66113 15.7492 1.90676 16 2.20977 16H4.95403C5.25703 16 5.50266 15.7492 5.50266 15.4398V9.80623C5.50266 9.49683 5.25703 9.246 4.95403 9.246Z"
          fill={fill}
          fillOpacity={fillOpacity}
        />
        <Path
          d="M9.77825 7.63452H7.03399C6.73098 7.63452 6.48535 7.88534 6.48535 8.19475V15.4409C6.48535 15.7503 6.73098 16.0011 7.03399 16.0011H9.77825C10.0812 16.0011 10.3269 15.7503 10.3269 15.4409V8.19475C10.3269 7.88534 10.0812 7.63452 9.77825 7.63452Z"
          fill={fill}
          fillOpacity={fillOpacity}
        />
        <Path
          d="M14.7152 6.18149H11.9818C11.6758 6.18149 11.4277 6.43481 11.4277 6.7473V15.4342C11.4277 15.7467 11.6758 16 11.9818 16H14.7152C15.0212 16 15.2693 15.7467 15.2693 15.4342V6.7473C15.2693 6.43481 15.0212 6.18149 14.7152 6.18149Z"
          fill={fill}
          fillOpacity={fillOpacity}
        />
        <Path
          d="M0.0101239 5.56761L0.595916 7.43243C0.630889 7.54403 0.747829 7.60653 0.858211 7.57305L13.1467 3.74854C13.2582 3.71394 13.3762 3.77867 13.4101 3.8925L13.6287 4.64021C13.6746 4.79757 13.8702 4.84667 13.9817 4.72838L16.9424 1.60471C17.0527 1.48865 17.0025 1.29447 16.8506 1.24871L12.6954 0.00884077C12.5358 -0.039147 12.3883 0.111512 12.4342 0.274447L12.7205 1.29112C12.7522 1.40495 12.6888 1.52324 12.5773 1.55672L0.151108 5.2953C0.0374463 5.3299 -0.0259417 5.45266 0.0101239 5.56761Z"
          fill={fill}
        />
      </G>
    </Svg>
  );
};

export default HeaderTextIcon;