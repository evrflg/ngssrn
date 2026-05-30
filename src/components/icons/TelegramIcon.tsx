import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface TelegramIconProps {
  size?: number;
  color?: string;
}

const TelegramIcon: React.FC<TelegramIconProps> = ({
  size = 24,
  color = 'currentColor'
}) => {
  const height = (size * 21) / 24;

  return (
    <Svg
      width={size}
      height={height}
      viewBox="0 0 24 21"
      fill="none"
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.365222 10.1287C-0.145965 10.3475 -0.113679 11.0829 0.419032 11.2461C2.14989 11.7788 4.8834 12.5555 6.06361 12.5555C7.85725 12.5555 18.6191 5.38092 18.6191 5.38092L7.85725 14.3491V20.5533C7.85725 20.8439 8.23392 20.9569 8.39534 20.7147L11.4445 16.1427L19.6594 21.0717C20.0199 21.2887 20.4881 21.0735 20.5562 20.6573L24 0L0.365222 10.1287Z"
        fill={color}
      />
    </Svg>
  );
};

export default TelegramIcon;


