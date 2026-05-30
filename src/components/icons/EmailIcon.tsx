import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface EmailIconProps {
  size?: number;
  color?: string;
}

const EmailIcon: React.FC<EmailIconProps> = ({
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
        d="M8.4784 9.35664C10.5973 10.9955 13.4053 10.9921 15.4127 9.43207L23.9191 4.10746C23.5351 1.78801 21.5225 0 19.0985 0H4.90238C2.47836 0 0.465775 1.78801 0.0800577 4.10574L8.4784 9.35664Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.8841 11.5363C15.4801 12.6335 13.7624 13.1855 12.0292 13.1855C10.2686 13.1855 8.49092 12.6146 7.00805 11.4609L0 7.0843V15.6695C0 18.3644 2.2063 20.5724 4.90118 20.5724H19.099C21.7939 20.5724 24.0002 18.3644 24.0002 15.6695V7.08773L16.8841 11.5363Z"
        fill={color}
      />
    </Svg>
  );
};

export default EmailIcon;
