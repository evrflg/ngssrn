import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

interface PCheckBoxIconProps extends SvgProps {
  bgColor?: string;
  checkColor?: string;
}

export const PCheckBoxIcon = ({ bgColor, checkColor, ...props }: PCheckBoxIconProps) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    {...props}
  >
    <Path d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2Z" fill={bgColor} />
    <Path d="M10.5795 15.5816C10.3795 15.5816 10.1895 15.5016 10.0495 15.3616L7.21945 12.5316C6.92945 12.2416 6.92945 11.7616 7.21945 11.4716C7.50945 11.1816 7.98945 11.1816 8.27945 11.4716L10.5795 13.7716L15.7195 8.63156C16.0095 8.34156 16.4895 8.34156 16.7795 8.63156C17.0695 8.92156 17.0695 9.40156 16.7795 9.69156L11.1095 15.3616C10.9695 15.5016 10.7795 15.5816 10.5795 15.5816Z" fill={checkColor} />
  </Svg>
);