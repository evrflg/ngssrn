import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useCommon } from "@/hooks/CommonProvider";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { View, Image, Text, Platform, useWindowDimensions } from "react-native";
import Svg, {
  Defs,
  Marker,
  Path,
  TSpan,
  Text as SVGText,
} from "react-native-svg";
import TopLeftBadge from "./TopLeftBadge";

const MAX_CHART_WIDTH = 465;

interface ProfileCardProp {
  tag: "B1" | "B2" | "B3" | "C1" | "C2" | "C3";
  totalBetNum: string;
  position: {
    top: number;
    left: number;
  };
}
const AVATARS = {
  B1: require("@/assets/images/promotion/B1B3.png"),
  B2: require("@/assets/images/promotion/B2.png"),
  B3: require("@/assets/images/promotion/B1B3.png"),
  C1: require("@/assets/images/promotion/C1C3.png"),
  C2: require("@/assets/images/promotion/C2.png"),
  C3: require("@/assets/images/promotion/C1C3.png"),
};
const isWeb = Platform.OS === "web";

export default function () {
  const { width: windowWidth } = useWindowDimensions();
  const width =
    isWeb && windowWidth > MAX_CHART_WIDTH ? MAX_CHART_WIDTH : windowWidth;

  const { language } = useCommon();
  const { t } = useTranslation();
  const {
    theme,
    themeColors: { textGray },
  } = useTheme();
  const longText = language !== "zh-CN";
  const PAGE_PADDING = 12 * 2;
  const DESIGN_WIDTH = 320;
  const rawWidth = Math.max(0, width - PAGE_PADDING);
  const scale = rawWidth < DESIGN_WIDTH ? rawWidth / DESIGN_WIDTH : 1;
  const SVGWidth = scale < 1 ? DESIGN_WIDTH : rawWidth;
  const HEIGHT = 390;
  const PROFILE_CARD_SIZE = 100;
  const CARD_B_TOP = 90;
  const CARD_B_BOTTOM = CARD_B_TOP + PROFILE_CARD_SIZE;
  const CARD_C_TOP = 290;
  const GAP = (SVGWidth - PROFILE_CARD_SIZE * 3) / 4;
  const B1_A_PATH = `M ${GAP + PROFILE_CARD_SIZE / 2} ${CARD_B_TOP - 18} L ${PROFILE_CARD_SIZE + GAP * 2} 10`;
  const B2_A_PATH = `M ${GAP * 2 + PROFILE_CARD_SIZE * 1.5} ${CARD_B_TOP - 18} L ${SVGWidth / 2} 10`;
  const B3_A_PATH = `M ${GAP * 3 + PROFILE_CARD_SIZE * 2.5} ${CARD_B_TOP - 18} L ${SVGWidth / 2 + PROFILE_CARD_SIZE / 2} 10`;
  const C1_B1_PATH = `M ${GAP + PROFILE_CARD_SIZE / 2} ${CARD_C_TOP - 18} L ${GAP + PROFILE_CARD_SIZE / 2} ${CARD_B_BOTTOM}`;
  const C2_B1_PATH = `M ${GAP * 2 + PROFILE_CARD_SIZE + PROFILE_CARD_SIZE / 4} ${CARD_C_TOP - 18} L ${GAP + PROFILE_CARD_SIZE} ${CARD_B_BOTTOM}`;
  const C3_B3_PATH = `M ${SVGWidth - GAP - PROFILE_CARD_SIZE / 2} ${CARD_C_TOP - 18} L ${SVGWidth - GAP - PROFILE_CARD_SIZE / 2} ${CARD_B_BOTTOM}`;
  const C1_A_PATH = `M ${GAP + PROFILE_CARD_SIZE / 4} ${CARD_C_TOP} L ${GAP / 2} ${CARD_C_TOP} L ${GAP / 2} ${CARD_B_TOP - 10} L ${GAP + PROFILE_CARD_SIZE / 2} 10`;
  const C2_A_PATH = `M ${GAP * 2 + PROFILE_CARD_SIZE + (PROFILE_CARD_SIZE / 4) * 3} ${CARD_C_TOP} L ${GAP * 2 + GAP / 2 + PROFILE_CARD_SIZE * 2} ${CARD_C_TOP} L ${GAP * 2 + GAP / 2 + PROFILE_CARD_SIZE * 2} ${CARD_B_TOP} L ${SVGWidth / 2 + 25} 10`;
  const C3_A_PATH = `M ${SVGWidth - GAP - PROFILE_CARD_SIZE / 4} ${CARD_C_TOP} L ${SVGWidth - GAP / 2} ${CARD_C_TOP} L ${SVGWidth - GAP / 2} ${CARD_B_TOP - 10} L ${SVGWidth - GAP - PROFILE_CARD_SIZE / 2} 10`;

  const chartData = [
    {
      textContent: [t("promotion.chart.b1Commission", { value: 15 })],
      textX: GAP,
      textY: CARD_B_TOP - 5,
    },
    {
      textContent: [t("promotion.chart.b2Commission", { value: 90 })],
      textX: GAP * 2 + PROFILE_CARD_SIZE,
      textY: CARD_B_TOP - 5,
    },
    {
      textContent: [t("promotion.chart.b3Commission", { value: 60 })],
      textX: GAP * 3 + PROFILE_CARD_SIZE * 2,
      textY: CARD_B_TOP - 5,
    },
    {
      textContent: [t("promotion.chart.c1Commission", { value: 10 })],
      textX: GAP,
      textY: CARD_C_TOP - 5,
    },
    {
      textContent: [t("promotion.chart.c2Commission", { value: 20 })],
      textX: GAP * 2 + PROFILE_CARD_SIZE,
      textY: CARD_C_TOP - 5,
    },
    {
      textContent: [t("promotion.chart.c3Commission", { value: 600 })],
      textX: GAP * 3 + PROFILE_CARD_SIZE * 2,
      textY: CARD_C_TOP - 5,
    },
    {
      textContent: [
        t("promotion.chart.c1Contribution", { value: 20 }),
        t("promotion.chart.difference", { value: 2 }),
      ],
      textX: GAP / 2,
      textY: 30,
    },
    {
      textContent: [
        t("promotion.chart.c2Contribution", { value: 40 }),
        t("promotion.chart.contributionFrom", { value: 2 }),
      ],
      textX: SVGWidth / 2,
      textY: CARD_C_TOP - 80,
    },
    {
      textContent: [
        t("promotion.chart.c3Contribution", { value: 0 }),
        t("promotion.chart.noLevelDifference"),
      ],
      textX: SVGWidth - GAP - PROFILE_CARD_SIZE / 1.5 - (longText ? 35 : 0),
      textY: 30,
    },
  ];
  const formatNumber = (num: number): number =>
    language === "CN" ? num : num / 100;

  return (
    <>
      <View
        className={`flex-row items-center justify-around p-3 border border-${theme}-primary rounded-lg bg-${theme}-btnText`}
      >
        <TopLeftBadge />
        <View className="size-[57px] relative">
          <Image
            source={require("@/assets/images/promotion/A.png")}
            style={{
              width: 57,
              height: 57,
            }}
            className={`border rounded-full border-${theme}-primary`}
          />
          <Text
            className={`size-4 text-[11px] leading-4 text-[#fff] text-center bg-${theme}-primary rounded-lg right-0 bottom-0  absolute`}
          >
            A
          </Text>
        </View>
        <View className="flex-1 ml-2.5">
          <Text className={`text-[11px] leading-4 text-${theme}-textGray`}>
            {t("promotion.summary.totalPerformance", {
              value: formatNumber(331),
              commission: 225,
            })}
            {"\n"}
            {t("promotion.summary.subordinatePerformance", { value: "180K" })}
            {"\n"}
            {t("promotion.summary.contribution", { value: 165 })}
            {"\n"}
            {t("promotion.summary.otherPerformance", {
              value: formatNumber(313),
            })}
            {"\n"}
            {t("promotion.summary.contribution", { value: 60 })}
          </Text>
        </View>
      </View>
      <View
        style={
          scale < 1
            ? {
              width: rawWidth,
              overflow: "hidden",
            }
            : undefined
        }
      >
        <View
          className={`relative border border-${theme}-primary rounded-lg bg-${theme}-btnText`}
          style={
            scale < 1
              ? {
                transform: [
                  { scale },
                  { translateX: (rawWidth - DESIGN_WIDTH) / 2 },
                  { translateY: (HEIGHT * (1 - scale)) / 2 },
                ],
                width: DESIGN_WIDTH,
              }
              : undefined
          }
        >
          <TopLeftBadge />
          <Svg width={SVGWidth} height={HEIGHT}>
            <Defs>
              <Marker
                id="GreenArrow"
                viewBox="0 0 10 10"
                refX="0"
                refY="5"
                markerUnits="strokeWidth"
                markerWidth="6"
                markerHeight="3"
                orient="auto"
              >
                <Path fill="#19a916" d="M 0 0 L 10 5 L 0 10 z" />
              </Marker>
              <Marker
                id="OrangeArrow"
                viewBox="0 0 10 10"
                refX="0"
                refY="5"
                markerUnits="strokeWidth"
                markerWidth="6"
                markerHeight="3"
                orient="auto"
              >
                <Path fill="#ebba4b" d="M 0 0 L 10 5 L 0 10 z" />
              </Marker>
            </Defs>
            <Path
              d={C1_A_PATH}
              fill="none"
              stroke="#19a916"
              strokeWidth="2"
              markerEnd="url(#GreenArrow)"
            />
            <Path
              d={B1_A_PATH}
              fill="none"
              stroke="#ebba4b"
              strokeWidth="2"
              markerEnd="url(#OrangeArrow)"
            />
            <Path
              d={C1_B1_PATH}
              fill="none"
              stroke="#19a916"
              strokeWidth="2"
              markerEnd="url(#GreenArrow)"
            />
            <Path
              d={C2_B1_PATH}
              fill="none"
              stroke="#19a916"
              strokeWidth="2"
              markerEnd="url(#GreenArrow)"
            />
            <Path
              d={B2_A_PATH}
              fill="none"
              stroke="#ebba4b"
              strokeWidth="2"
              markerEnd="url(#OrangeArrow)"
            />
            <Path
              d={C2_A_PATH}
              fill="none"
              stroke="#19a916"
              strokeWidth="2"
              markerEnd="url(#GreenArrow)"
            />
            <Path
              d={B3_A_PATH}
              fill="none"
              stroke="#ebba4b"
              strokeWidth="2"
              markerEnd="url(#OrangeArrow)"
            />
            <Path
              d={C3_B3_PATH}
              fill="none"
              stroke="#19a916"
              strokeWidth="2"
              markerEnd="url(#GreenArrow)"
            />
            <Path
              d={C3_A_PATH}
              fill="none"
              stroke="#19a916"
              strokeWidth="2"
              markerEnd="url(#GreenArrow)"
            />
            {chartData.map((data, index) => (
              <SVGText
                key={index}
                x={data.textX}
                y={data.textY}
                fontSize="10"
                fill={textGray}
              >
                {data.textContent.map((text, idx) => (
                  <TSpan key={text} x={data.textX} dy={idx ? 14 : 0}>
                    {text}
                  </TSpan>
                ))}
              </SVGText>
            ))}
          </Svg>
          <ProfileCard
            tag="B1"
            totalBetNum="500"
            position={{ top: CARD_B_TOP, left: GAP }}
          />
          <ProfileCard
            tag="B2"
            totalBetNum="3000"
            position={{ top: CARD_B_TOP, left: GAP * 2 + PROFILE_CARD_SIZE }}
          />
          <ProfileCard
            tag="B3"
            totalBetNum="2000"
            position={{
              top: CARD_B_TOP,
              left: GAP * 3 + PROFILE_CARD_SIZE * 2,
            }}
          />
          <ProfileCard
            tag="C1"
            totalBetNum="1000"
            position={{ top: CARD_C_TOP, left: GAP }}
          />
          <ProfileCard
            tag="C2"
            totalBetNum="2000"
            position={{ top: CARD_C_TOP, left: GAP * 2 + PROFILE_CARD_SIZE }}
          />
          <ProfileCard
            tag="C3"
            totalBetNum="20000"
            position={{
              top: CARD_C_TOP,
              left: GAP * 3 + PROFILE_CARD_SIZE * 2,
            }}
          />
        </View>
      </View>
    </>
  );
}

const ProfileCard: FC<ProfileCardProp> = (props) => {
  const { position, tag, totalBetNum } = props;
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={position} className="size-[100px] absolute">
      <View className="size-[45px] mx-auto z-10 relative">
        <Image
          source={AVATARS[tag]}
          style={{
            width: 43,
            height: 43,
          }}
          className={`rounded-full border border-${theme}-primary`}
        />
        <Text
          className={
            "size-4 text-[9px] leading-4 " +
            (tag.startsWith("C")
              ? `text-${theme}-primary`
              : `text-${theme}-btnText bg-${theme}-primary`) +
            " text-center font-semibold rounded-lg right-0 bottom-0 absolute"
          }
        >
          {tag}
        </Text>
      </View>
      <View
        className={`h-[68px] -mt-[22px] pt-7 rounded-lg border border-${theme}-primary`}
      >
        <View
          className={`h-0.5 ${tag.startsWith("C") ? "w-0.5 rounded" : "w-3"} mx-auto bg-${theme}-primary`}
        ></View>
        <Text className={`text-[11px] text-${theme}-textGray text-center`}>
          {t("promotion.chart.totalBetTimes")}
          {"\n" + totalBetNum}
        </Text>
      </View>
    </View>
  );
};
