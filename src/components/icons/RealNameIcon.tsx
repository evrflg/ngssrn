import React from 'react';
import Svg, { Path, G, Defs, Polygon, Use, Mask } from 'react-native-svg';

interface RealNameIconProps {
  size?: number;
  color?: string;
}

const RealNameIcon: React.FC<RealNameIconProps> = ({
  size = 24,
  color = 'currentColor'
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Defs>
        <Polygon
          id="path-1"
          points="0 0 21.3329067 0 21.3329067 9.6 0 9.6"
        />
      </Defs>
      <G
        stroke="none"
        fill="none"
        fillRule="evenodd"
      >
        <G
          transform="translate(1, 0)"
        >
          <Path
            d="M16.8,6.4 C16.8,9.93493333 13.9349333,12.8 10.4,12.8 C6.86506667,12.8 4,9.93493333 4,6.4 C4,2.86506667 6.86506667,0 10.4,0 C13.9349333,0 16.8,2.86506667 16.8,6.4"
            fill={color}
          />
          <G transform="translate(0, 14)">
            <Mask
              id="mask-2"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="21.3329067"
              height="9.6"
            >
              <Use href="#path-1" fill="white" />
            </Mask>
            <Path
              d="M21.2245333,9.6 C21.2693333,9.24586667 21.3333333,8.89813333 21.3333333,8.53333333 C21.3333333,3.84 17.4933333,0 12.8,0 L8.53333333,0 C3.84,0 0,3.84 0,8.53333333 C0,8.89813333 0.064,9.24586667 0.1088,9.6 L21.2245333,9.6 Z"
              fill={color}
              mask="url(#mask-2)"
            />
          </G>
        </G>
      </G>
    </Svg>
  );
};

export default RealNameIcon;





