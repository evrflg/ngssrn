import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface FacebookIconProps {
  size?: number;
  color?: string;
}

const FacebookIcon: React.FC<FacebookIconProps> = ({
  size = 24,
  color = 'currentColor'
}) => {
  const height = (size * 21) / 24;

  return (
    <Svg
      width={size}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.7625 0H4.23611C1.90605 0 0 1.90605 0 4.23811V19.7625C0 22.0946 1.90605 24.0006 4.23611 24.0006H13.7683V12.0203H11.1783V10.0503H13.7683V8.30021C13.7683 7.38818 13.9563 6.63417 14.3324 6.04015C14.7064 5.44214 15.2704 4.99612 16.0204 4.70612C16.7704 4.41411 17.7184 4.26811 18.8605 4.26811C19.2065 4.26811 19.5525 4.27811 19.8965 4.29411C20.2425 4.31211 20.5285 4.33611 20.7545 4.36411V6.29216C20.5645 6.27416 20.3525 6.26016 20.1205 6.25016C19.8885 6.24016 19.6525 6.23616 19.4145 6.23616C18.5565 6.23616 17.9144 6.40616 17.4844 6.75017C17.0564 7.09018 16.8424 7.61419 16.8424 8.31421V10.0503H20.6665V12.0203H16.8784V24.0006H19.7625C22.0926 24.0006 24.0006 22.0946 24.0006 19.7625V4.23811C24.0006 1.90605 22.0926 0 19.7625 0Z"
        fill={color}
      />
    </Svg>
  );
};

export default FacebookIcon;





