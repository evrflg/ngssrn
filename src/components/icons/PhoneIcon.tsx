import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface PhoneIconProps {
  size?: number;
  color?: string;
}

const PhoneIcon: React.FC<PhoneIconProps> = ({
  color = 'currentColor'
}) => {

  return (
    <Svg
      width="20px"
      height="20px"
      viewBox="0 0 24 24"
    >
      <G
        id="画板备份-3"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
      >
        <G
          id="编组"
          transform="translate(4, 0)"
          fill={color}
        >
          <Path
            id="Fill-1"
            d="M8,21 C7.448,21 7,20.552 7,20 C7,19.448 7.448,19 8,19 C8.552,19 9,19.448 9,20 C9,20.552 8.552,21 8,21 L8,21 Z M0,17 L0,19.552 C0,22 2,24 4.448,24 L11.552,24 C14,24 16,22 16,19.552 L16,17 L0,17 Z"
          />
          <Path
            id="Fill-3"
            d="M16,15 L16,4.448 C16,2 14,0 11.552,0 L4.448,0 C2,0 0,2 0,4.448 L0,15 L16,15 Z"
          />
        </G>
      </G>
    </Svg>
  );
};

export default PhoneIcon;





