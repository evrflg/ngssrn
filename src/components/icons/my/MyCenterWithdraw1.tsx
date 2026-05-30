import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

interface MyCenterWithdrawProps {
  width?: number;
  height?: number;
  themeColor?: string;
  secondaryColor?: string;
}

export default function MyCenterWithdraw1({
  width = 55,
  height = 50,
  themeColor = "#4781FF",
  secondaryColor = "#47B5FF",
}: MyCenterWithdrawProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 55 50" fill="none">
      <Defs>
        <LinearGradient
          id="paint0_linear_withdraw"
          x1="46.2681"
          y1="28.3619"
          x2="20.199"
          y2="46.555"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={secondaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_withdraw"
          x1="52.3287"
          y1="29.2959"
          x2="26.9431"
          y2="49.872"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={secondaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear_withdraw"
          x1="10.1928"
          y1="34.42"
          x2="49.812"
          y2="21.547"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={themeColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
        <LinearGradient
          id="paint3_linear_withdraw"
          x1="48.8522"
          y1="18.6297"
          x2="43.2912"
          y2="37.5844"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={secondaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
      </Defs>

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M41.8519 16.627L30.3578 6.27589L29.7303 5.79778L29.0779 5.48514L28.3775 5.2668L27.6444 5.19022L26.9422 5.20854L26.2388 5.38464L25.5662 5.65563L24.9322 6.04526L24.3681 6.56952L6.34898 26.5888L5.89464 27.2086L5.55832 27.8687L5.36375 28.5614L5.26348 29.3022L5.30555 29.9968L5.45794 30.708L5.72895 31.3806L6.1423 32.007L6.66656 32.5711L18.1607 42.9222L18.7882 43.4003L19.4406 43.7129L20.141 43.9313L20.8741 44.0079L21.5763 43.9895L22.2797 43.8134L22.9523 43.5424L23.5863 43.1528L24.1504 42.6285L42.1695 22.6093L42.6238 21.9895L42.9602 21.3294L43.1547 20.6367L43.255 19.8958L43.2129 19.2013L43.0605 18.4901L42.7895 17.8175L42.3762 17.1911L41.8519 16.627Z"
        fill="url(#paint0_linear_withdraw)"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.28413 18.711L41.3116 8.30462L42.015 8.12853L42.7172 8.11021L43.3951 8.17848L44.0404 8.3885L44.6376 8.69283L45.1945 9.11519L45.6719 9.61583L46.0384 10.1787L46.3409 10.8674L52.9706 31.2715L53.123 31.9827L53.165 32.6772L53.0731 33.3629L52.8631 34.0082L52.5588 34.6054L52.1602 35.1546L51.6596 35.632L51.073 36.0063L50.4081 36.301L18.3807 46.7073L17.6696 46.8597L16.9751 46.9017L16.2895 46.8097L15.6442 46.5997L15.047 46.2954L14.4978 45.8968L14.0204 45.3961L13.6461 44.8095L13.3514 44.1446L6.72171 23.7404L6.56162 23.0055L6.52725 22.3347L6.61922 21.6491L6.8215 20.98L7.12578 20.3828L7.52437 19.8336L8.03267 19.3799L8.61155 18.982L9.28413 18.711Z"
        fill="url(#paint1_linear_withdraw)"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.44038 19.1885L41.4678 8.78216L42.1712 8.60607L42.8735 8.58774L43.5514 8.65601L44.1966 8.86604L44.7939 9.17037L45.3508 9.59273L45.8282 10.0934L46.1947 10.6563L46.4971 11.3449L53.1268 31.749L53.2792 32.4602L53.3213 33.1548L53.2293 33.8404L53.0193 34.4857L52.715 35.083L52.3164 35.6322L51.8159 36.1096L51.2293 36.4838L50.5644 36.7785L18.5369 47.1849L17.8258 47.3372L17.1313 47.3793L16.4457 47.2873L15.8004 47.0773L15.2032 46.7729L14.654 46.3743L14.1766 45.8736L13.8024 45.287L13.5077 44.6221L6.87796 24.218L6.71787 23.4831L6.6835 22.8122L6.77547 22.1266L6.97775 21.4576L7.28203 20.8603L7.68062 20.3111L8.18892 19.8574L8.7678 19.4595L9.44038 19.1885Z"
        fill="url(#paint2_linear_withdraw)"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.33594 25.664L46.9551 12.791L49.3449 20.146L9.72571 33.019L7.33594 25.664Z"
        fill="url(#paint3_linear_withdraw)"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M44.7305 17.3963L45.2115 17.4236L45.5086 17.773L45.5845 18.168L45.3763 18.5767L44.9255 18.7231L44.5169 18.5149L44.3924 18.2931L44.3242 17.9218L44.3811 17.6934L44.7305 17.3963ZM42.7647 11.3462L43.2457 11.3736L43.5428 11.7229L44.8533 15.7563L44.883 16.009L44.6748 16.4176L44.224 16.5641L43.8154 16.3559L43.6909 16.134L42.3803 12.1006L42.4153 11.6433L42.7647 11.3462Z"
        fill="white"
        fillOpacity={0.8}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M42.523 29.7356L43.1155 29.6218L43.6754 29.6497L44.1866 29.8508L44.6575 30.17L45.0252 30.5751L45.2814 31.1214L45.365 31.5401L45.2955 32.3759L44.9112 33.1303L44.2759 33.6777L43.8643 33.8639L43.2956 33.97L42.728 33.9183L42.193 33.7249L41.7535 33.4218L41.3781 32.9929L41.1297 32.4704L41.0158 31.8778L41.0752 31.3339L41.2448 30.8067L41.5639 30.3358L42.0005 29.9841L42.523 29.7356Z"
        fill={themeColor}
        fillOpacity={0.6}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M45.5152 28.7639L46.1077 28.6501L46.6675 28.678L47.1788 28.8791L47.6497 29.1983L48.0174 29.6034L48.2736 30.1497L48.3572 30.5685L48.2877 31.4042L47.9034 32.1586L47.2681 32.706L46.4378 32.9758L45.6021 32.9063L44.8477 32.5219L44.3004 31.8866L44.1219 31.4987L44.008 30.9061L44.0673 30.3623L44.2607 29.8273L44.5561 29.3641L44.9926 29.0124L45.5152 28.7639Z"
        fill={themeColor}
        fillOpacity={0.6}
      />
    </Svg>
  );
}
