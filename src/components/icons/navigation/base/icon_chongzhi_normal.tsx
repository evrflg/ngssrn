

import Svg, { Path } from 'react-native-svg';

const Icon = ({ color }: { color: string }) => {
  return (
    <Svg
     
      width="22"
      height="21"
      viewBox="0 0 22 21"
      fill="none"
    >
      <Path
        d="M12.8281 18.6494C17.2464 18.6494 20.8281 15.0677 20.8281 10.6494C20.8281 6.23114 17.2464 2.64941 12.8281 2.64941C8.40985 2.64941 4.82812 6.23114 4.82812 10.6494C4.82812 15.0677 8.40985 18.6494 12.8281 18.6494Z"
        fill={color}
        fillOpacity="0.25"
      />
      <Path
        d="M1.5 14.5V15C1.5 17.7614 3.73858 20 6.5 20H15.5C18.2614 20 20.5 17.7614 20.5 15V9C20.5 6.23858 18.2614 4 15.5 4H6.5C3.73858 4 1.5 6.23858 1.5 9V10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <Path
        d="M18.5 4.5V4.33914C18.5 2.0991 16.444 0.423289 14.25 0.875V0.875L10 1.75L5.49174 2.67817C3.16769 3.15665 1.5 5.20267 1.5 7.57546L1.5 10"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M20.5 14.5V9.5H16C14.6193 9.5 13.5 10.6193 13.5 12C13.5 13.3807 14.6193 14.5 16 14.5H20.5Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M16 12H16.2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default Icon;
