import React from "react";
import Svg, { Path, G, Mask, Defs, LinearGradient, Stop } from "react-native-svg";

interface MyCenterDepositProps {
  width?: number;
  height?: number;
  themeColor?: string;
  secondaryColor?: string;
}

export default function MyCenterDeposit1({
  width = 52,
  height = 50,
  themeColor = "#4781FF",
  secondaryColor = "#47B5FF",
}: MyCenterDepositProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 52 50" fill="none">
      <Defs>
        <LinearGradient
          id="paint0_linear_837_25738"
          x1="12.6663"
          y1="20.4202"
          x2="32.6366"
          y2="13.9314"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={secondaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_837_25738"
          x1="12.9124"
          y1="21.175"
          x2="32.8827"
          y2="14.6863"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={themeColor} />
          <Stop offset="1" stopColor={themeColor} />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear_837_25738"
          x1="2.77961"
          y1="21.5315"
          x2="23.3282"
          y2="14.8548"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={secondaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient
          id="paint3_linear_837_25738"
          x1="3.06672"
          y1="22.2756"
          x2="23.8098"
          y2="15.5358"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={themeColor} />
          <Stop offset="1" stopColor={themeColor} />
        </LinearGradient>
        <LinearGradient
          id="paint4_linear_837_25738"
          x1="6.79838"
          y1="33.8931"
          x2="46.7389"
          y2="20.9156"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={secondaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient
          id="paint5_linear_837_25738"
          x1="6.77061"
          y1="33.8121"
          x2="46.7111"
          y2="20.8347"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={themeColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient
          id="paint6_linear_837_25738"
          x1="838.34"
          y1="-238.167"
          x2="1111.14"
          y2="601.424"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="white" stopOpacity={0.5} />
          <Stop offset="1" stopColor="white" stopOpacity={0.1} />
        </LinearGradient>
        <LinearGradient
          id="paint7_linear_837_25738"
          x1="838.093"
          y1="-238.921"
          x2="1110.89"
          y2="600.669"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="white" stopOpacity={0.5} />
          <Stop offset="1" stopColor="white" stopOpacity={0.1} />
        </LinearGradient>
        <LinearGradient
          id="paint8_linear_837_25738"
          x1="32.817"
          y1="23.8447"
          x2="37.3741"
          y2="22.364"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={secondaryColor} />
          <Stop offset="1" stopColor={themeColor} />
        </LinearGradient>
      </Defs>

      <Path
        d="M26.0553 7.39608L14.1493 11.2646C11.9224 11.9881 10.7037 14.3799 11.4273 16.6068L13.9054 24.2335C14.6289 26.4604 17.0207 27.679 19.2476 26.9555L31.1536 23.087C33.3805 22.3634 34.5992 19.9717 33.8756 17.7448L31.3975 10.1181C30.674 7.8912 28.2822 6.67253 26.0553 7.39608Z"
        fill="url(#paint0_linear_837_25738)"
      />
      <Path
        d="M26.3014 8.15096L14.3954 12.0195C12.1685 12.743 10.9498 15.1348 11.6734 17.3617L14.1515 24.9884C14.875 27.2153 17.2668 28.4339 19.4937 27.7104L31.3997 23.8419C33.6266 23.1183 34.8452 20.7265 34.1217 18.4997L31.6436 10.8729C30.9201 8.64609 28.5283 7.42741 26.3014 8.15096Z"
        fill="url(#paint1_linear_837_25738)"
      />
      <G opacity={0.3976}>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.7109 12.0571L20.0259 9.35544C20.8795 9.07807 21.8153 9.36839 22.362 10.0802L26.8996 15.9876L18.0944 21.7058L11.7109 12.0571Z"
          fill={themeColor}
        />
      </G>
      <Path
        d="M4.26255 12.3759L15.902 8.59405C16.7881 8.30614 17.7583 8.63055 18.293 9.39353L24.0059 17.5455C25.3497 19.463 24.8846 22.1068 22.9672 23.4506C22.6227 23.692 22.2442 23.8808 21.8442 24.0107L9.36084 28.0668C7.13398 28.7904 4.7422 27.5717 4.01865 25.3448L1.54057 17.7181C0.817022 15.4913 2.03569 13.0995 4.26255 12.3759Z"
        fill="url(#paint2_linear_837_25738)"
      />
      <Mask id="mask0_837_25738" maskUnits="userSpaceOnUse" x={1} y={8} width={24} height={21}>
        <Path
          d="M4.26255 12.3789L15.902 8.59698C16.7881 8.30907 17.7583 8.63348 18.293 9.39646L24.0059 17.5485C25.3497 19.4659 24.8846 22.1097 22.9672 23.4535C22.6227 23.6949 22.2442 23.8837 21.8442 24.0137L9.36084 28.0698C7.13398 28.7933 4.7422 27.5746 4.01865 25.3478L1.54057 17.721C0.817022 15.4942 2.03569 13.1024 4.26255 12.3789Z"
          fill="white"
        />
      </Mask>
      <G mask="url(#mask0_837_25738)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.54966 13.1201L16.3571 9.2836C17.2412 8.99633 18.2093 9.31861 18.7448 10.0784L24.481 18.2172C25.8299 20.1311 25.3719 22.7761 23.458 24.125C23.1111 24.3695 22.7294 24.5605 22.3257 24.6917L9.64795 28.811C7.42109 29.5345 5.02931 28.3158 4.30576 26.089L1.82768 18.4623C1.10413 16.2354 2.3228 13.8436 4.54966 13.1201Z"
          fill="url(#paint3_linear_837_25738)"
        />
      </G>
      <Path
        d="M37.6857 6.77259L5.80943 17.1298C3.58257 17.8534 2.3639 20.2452 3.08745 22.472L10.5093 45.3142C11.2329 47.541 13.6246 48.7597 15.8515 48.0361L47.7278 37.6789C49.9547 36.9554 51.1733 34.5636 50.4498 32.3367L43.0279 9.49457C42.3044 7.26771 39.9126 6.04904 37.6857 6.77259Z"
        fill="url(#paint4_linear_837_25738)"
      />
      <Mask id="mask1_837_25738" maskUnits="userSpaceOnUse" x={2} y={6} width={49} height={43}>
        <Path
          d="M37.6838 6.77259L5.80748 17.1298C3.58062 17.8534 2.36194 20.2452 3.08549 22.472L10.5074 45.3142C11.2309 47.541 13.6227 48.7597 15.8495 48.0361L47.7259 37.6789C49.9527 36.9554 51.1714 34.5636 50.4478 32.3367L43.026 9.49457C42.3024 7.26771 39.9106 6.04904 37.6838 6.77259Z"
          fill="#ECCD8D"
        />
      </Mask>
      <G mask="url(#mask1_837_25738)">
        <Path
          d="M37.9299 7.52845L6.05357 17.8857C3.82671 18.6092 2.60804 21.001 3.33159 23.2279L10.2096 44.3963C10.9332 46.6232 13.325 47.8419 15.5518 47.1183L47.4281 36.7611C49.655 36.0375 50.8737 33.6457 50.1501 31.4189L43.2721 10.2504C42.5485 8.02357 40.1567 6.8049 37.9299 7.52845Z"
          fill="url(#paint5_linear_837_25738)"
        />
      </G>
      <Path
        d="M33.0743 19.3093L44.9613 15.4469L47.7422 24.0056L35.8551 27.8679C33.4917 28.6359 30.9533 27.3424 30.1854 24.979C29.4174 22.6156 30.7108 20.0772 33.0743 19.3093Z"
        fill="url(#paint6_linear_837_25738)"
      />
      <Path
        d="M32.8282 18.5544L44.7152 14.692L47.4961 23.2507L35.609 27.1131C33.2456 27.881 30.7072 26.5876 29.9393 24.2242C29.1713 21.8607 30.4648 19.3223 32.8282 18.5544Z"
        fill="url(#paint7_linear_837_25738)"
      />
      <Path
        d="M35.6704 24.8675C36.9288 24.4587 37.619 23.1117 37.212 21.8591C36.805 20.6065 35.4549 19.9226 34.1965 20.3314C32.9381 20.7403 32.2479 22.0872 32.6549 23.3398C33.0619 24.5924 34.412 25.2764 35.6704 24.8675Z"
        fill={themeColor}
      />
      <Mask id="mask2_837_25738" maskUnits="userSpaceOnUse" x={32} y={20} width={6} height={5}>
        <Path
          d="M35.6704 24.8675C36.9288 24.4587 37.619 23.1117 37.212 21.8591C36.805 20.6065 35.4549 19.9226 34.1965 20.3314C32.9381 20.7403 32.2479 22.0872 32.6549 23.3398C33.0619 24.5924 34.412 25.2764 35.6704 24.8675Z"
          fill="#ECCD8D"
        />
      </Mask>
      <G mask="url(#mask2_837_25738)">
        <Path
          d="M35.8325 25.3724C37.0909 24.9635 37.7811 23.6166 37.3741 22.364C36.9671 21.1114 35.617 20.4274 34.3586 20.8363C33.1002 21.2452 32.41 22.5921 32.817 23.8447C33.224 25.0973 34.5741 25.7813 35.8325 25.3724Z"
          fill="url(#paint8_linear_837_25738)"
        />
      </G>
    </Svg>
  );
}
