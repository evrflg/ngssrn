import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ClearCacheIconProps {
  size?: number;
  color?: string;
}

const ClearCacheIcon: React.FC<ClearCacheIconProps> = ({
  size = 24,
  color = 'currentColor'
}) => {

  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width={size}
      height={size} viewBox="0 0 22 12" fill={color}>
      <Path
        d="M21.9932 10.5423L20.7943 0H1.34113L0.00677288 10.5288C-0.0745079 11.1847 0.433497 11.7663 1.09729 11.7663H3.77278L4.31465 6.66081C4.36207 6.19421 4.78202 5.8561 5.24938 5.90344C5.71675 5.95077 6.05542 6.37003 6.00801 6.83663L5.48645 11.7595H14.2377L13.2894 3.90858C13.2352 3.44198 13.5671 3.01596 14.0345 2.96186C14.5018 2.90776 14.9286 3.23911 14.9828 3.70571L15.9581 11.7595H17.9834L17.5702 8.37165C17.516 7.90506 17.8479 7.47904 18.3153 7.42494C18.7826 7.37084 19.2094 7.70219 19.2635 8.16879L19.697 11.7595H20.8959C21.553 11.7595 22.0677 11.1915 21.9932 10.5356V10.5423Z"
        fill={color}
      />
    </Svg>
  );
};

export default ClearCacheIcon;


