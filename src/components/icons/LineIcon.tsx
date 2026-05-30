import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface LineIconProps {
  size?: number;
  color?: string;
}

const LineIcon: React.FC<LineIconProps> = ({
  color = 'currentColor'
}) => {

  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.12493 14.7628V19.9057L17.6965 14.7628H9.12493Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.8814 6.98753H16.3922V8.22183H18.7151V8.85956H16.3922V10.2173H18.8814V10.7933H15.4048V6.37209H18.8814V6.98753ZM14.6231 10.7933H13.6991L11.6607 7.8104V10.7933H10.6956V6.3498H11.6607L13.6562 9.45614V6.3498H14.6231V10.7933ZM8.98813 10.7933H9.95329V6.37209H8.98813V10.7933ZM8.41212 10.7933H5.12064V6.37209H6.10809V10.2173H8.41212V10.7933ZM12.0002 0C5.37265 0 0 3.83663 0 8.57155C0 13.3065 5.37265 17.1431 12.0002 17.1431C18.6277 17.1431 24.0003 13.3065 24.0003 8.57155C24.0003 3.83663 18.6277 0 12.0002 0Z"
        fill={color}
      />
    </Svg>
  );
};

export default LineIcon;





