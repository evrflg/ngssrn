import { memo, useCallback, useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Image,
  ImageBackground,
  type LayoutChangeEvent,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import {
  getPromotionTutorialPalette,
  PT_IMG,
  type PromotionTutorialPalette,
} from "./promotionTutorialTheme";
import {
  PTArrowDown,
  PTCoin1,
  PTCoin2,
  PTCoin3,
  PTMoneys1,
  PTMoneys2,
  PTMoneys3,
  PTPeople1,
  PTPeople2,
  PTPeople3,
  PTTickCircle,
} from "./PromotionTutorialIcons";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { useTheme, type ThemeType } from "@/hooks/theme/ThemeProvider";
import { GradientBorderAreaBox } from "./GradientBorderAreaBox";

const MAX_BOX = 340;

const TITLE_BANNER_PATH =
  "M200 0C191.163 3.70472e-07 184 7.16344 184 16V24C184 29.5228 179.523 34 174 34H26C20.4772 34 16 29.5228 16 24V16C16 7.16344 8.83656 3.70473e-07 0 0L200 0Z";

function SectionTitleBanner({ theme }: { theme: ThemeType }) {
  const rawId = useId();
  const gradId = `pt-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const grad =
    theme === "greenBlack"
      ? {
          x1: "11",
          y1: "17",
          x2: "183",
          y2: "17",
          c1: "#A9E782",
          c2: "#75EB92",
        }
      : theme === "blueWhite"
        ? {
            x1: "-23.6686",
            y1: "17",
            x2: "179.882",
            y2: "17",
            c1: "#47B5FF",
            c2: "#4781FF",
          }
        : {
            x1: "-23.6686",
            y1: "17",
            x2: "179.882",
            y2: "17",
            c1: "#FFD900",
            c2: "#F48D16",
          };

  return (
    <Svg
      width={200}
      height={34}
      viewBox="0 0 200 34"
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      <Defs>
        <SvgLinearGradient
          id={gradId}
          x1={grad.x1}
          y1={grad.y1}
          x2={grad.x2}
          y2={grad.y2}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={grad.c1} />
          <Stop offset="1" stopColor={grad.c2} />
        </SvgLinearGradient>
      </Defs>
      <Path d={TITLE_BANNER_PATH} fill={`url(#${gradId})`} />
    </Svg>
  );
}

function SectionTitle({
  label,
  palette,
  theme,
}: {
  label: string;
  palette: PromotionTutorialPalette;
  theme: ThemeType;
}) {
  return (
    <View style={styles.sectionTitleWrap}>
      <SectionTitleBanner theme={theme} />
      <Text
        style={[
          styles.sectionTitleText,
          {
            color: palette.titleTextOnBanner,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const AbcdBadge = memo(function AbcdBadge({ label }: { label: string }) {
  return (
    <View style={styles.abcdBadge} pointerEvents="none">
      <Image source={PT_IMG.abcd} style={styles.abcdImg} resizeMode="stretch" />
      <Text style={styles.abcdText}>{label}</Text>
    </View>
  );
});

const VipLabel = memo(function VipLabel({
  variant,
  text,
}: {
  variant: "vip6" | "vip2" | "vip1" | "vip0";
  text: string;
}) {
  const src =
    variant === "vip6"
      ? PT_IMG.vip6
      : variant === "vip2"
        ? PT_IMG.vip2
        : variant === "vip1"
          ? PT_IMG.vip1
          : PT_IMG.vip0;
  return (
    <ImageBackground source={src} style={styles.vipBg} resizeMode="stretch">
      <Text style={styles.vipText}>{text}</Text>
    </ImageBackground>
  );
});

const Info2Row = memo(function Info2Row({
  palette,
  left,
  value,
  tick,
}: {
  palette: PromotionTutorialPalette;
  left: ReactNode;
  value: string;
  tick?: boolean;
}) {
  return (
    <View style={[styles.info2, { backgroundColor: palette.info2Bg }]}>
      <View style={styles.info2Left}>{left}</View>
      <Text style={[styles.info2Val, { color: palette.info2Text }]}>
        {value}
      </Text>
      {tick ? (
        <PTTickCircle
          g1={palette.tickG1}
          g2={palette.tickG2}
          inner={palette.tickInner}
          size={18}
        />
      ) : (
        <View style={{ width: 18 }} />
      )}
    </View>
  );
});

export const NewPromotionTutorialContent = memo(
  function NewPromotionTutorialContent() {
    const { theme } = useTheme();
    const { width: windowWidth } = useWindowDimensions();
    const [measuredInnerW, setMeasuredInnerW] = useState(0);
    const { t } = useTranslation();
    const palette = useMemo(
      () => getPromotionTutorialPalette(theme as ThemeType),
      [theme],
    );

    /** ScrollView content 内实际宽度；Web 手机框内不能用 windowWidth，否则会横向溢出、右侧裁切 */
    const fullBleedWidth =
      measuredInnerW > 0 ? measuredInnerW + 32 : windowWidth;
    const topPadH = fullBleedWidth < 360 ? 20 : 50;
    const boxW = Math.min(
      MAX_BOX,
      Math.max(0, fullBleedWidth - 2 * topPadH),
    );

    const onPageLayout = useCallback((e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      if (w <= 0) return;
      setMeasuredInnerW((prev) => (Math.abs(prev - w) < 0.5 ? prev : w));
    }, []);
    const themeColors = Colors[
      theme as keyof typeof Colors
    ] as (typeof Colors)["greenBlack"];
    const cellBg = themeColors.background;
    const borderSec = themeColors.secondary;

    const pg = palette.pageText;

    return (
      <View style={styles.page} onLayout={onPageLayout}>
        <ImageBackground
          source={palette.topBg}
          style={[
            styles.topArea,
            {
              marginHorizontal: -16,
              width: fullBleedWidth,
              paddingHorizontal: topPadH,
            },
          ]}
          imageStyle={styles.topAreaImg}
          resizeMode="stretch"
        >
          <View style={styles.topInner}>
            <AreaRow1
              img={PT_IMG.lock1}
              sub="0/3"
              text={t("promotion.step1")}
              palette={palette}
            />
            <PTArrowDown g1={palette.peopleG1} g2={palette.peopleG2} />
            <AreaRow1
              img={PT_IMG.lock2}
              sub="3/3"
              text={t("promotion.step2")}
              palette={palette}
            />
            <PTArrowDown g1={palette.peopleG1} g2={palette.peopleG2} />
            <AreaRow2
              img={PT_IMG.bet}
              text={t("promotion.step3")}
              palette={palette}
            />
            <PTArrowDown g1={palette.peopleG1} g2={palette.peopleG2} />
            <AreaRow2
              img={PT_IMG.purse}
              text={t("promotion.step4")}
              palette={palette}
            />
            <PTArrowDown g1={palette.peopleG1} g2={palette.peopleG2} />
            <AreaRow2
              img={PT_IMG.withdrawal}
              text={t("promotion.step5")}
              palette={palette}
            />
            <PTArrowDown g1={palette.peopleG1} g2={palette.peopleG2} />
            <AreaRow2
              img={PT_IMG.wallet}
              text={t("promotion.step6")}
              palette={palette}
              longText
            />
          </View>
        </ImageBackground>

        <View
          style={[
            styles.exampleArea,
            {
              backgroundColor: palette.boxBg,
              width: fullBleedWidth,
              marginHorizontal: -16,
            },
          ]}
        >
          <SectionTitle
            label={t("promotion.title1")}
            palette={palette}
            theme={theme as ThemeType}
          />

          <View style={[styles.exampleTopWrap, { width: boxW }]}>
            <GradientBorderAreaBox
              borderColor={palette.exampleBorder}
              fillColors={palette.exampleTopFillColors}
              fillLocations={palette.exampleTopFillLocations}
              fillStart={palette.exampleTopFillStart}
              fillEnd={palette.exampleTopFillEnd}
              fillBaseColor={palette.exampleInnerBg}
              borderRadius={10}
              paddingV={10}
              paddingH={10}
              edgeThickness={2}
              style={{ width: boxW, maxWidth: boxW, alignSelf: "center" }}
            >
              <Image
                source={PT_IMG.arrowLeft}
                style={styles.lineBoxLeft}
                resizeMode="stretch"
              />
              <Image
                source={PT_IMG.arrowRight}
                style={styles.lineBoxRight}
                resizeMode="stretch"
              />
              <AbcdBadge label="A" />
              <View style={styles.exampleTopInner}>
                <View style={styles.info1}>
                  <View style={[styles.avatarLg, { borderColor: borderSec }]}>
                    <Image
                      source={PT_IMG.figure1}
                      style={styles.avatarImg}
                      resizeMode="contain"
                    />
                  </View>
                  <View>
                    <Text style={[styles.nameTxt, { color: palette.nameDark }]}>
                      {t("promotion.maxTop")}
                    </Text>
                    <VipLabel variant="vip6" text="VIP6" />
                  </View>
                </View>
                <Info2Row
                  palette={palette}
                  left={
                    <>
                      <PTPeople1 />
                      <Text
                        style={[
                          styles.info2Label,
                          { color: palette.info2Text },
                        ]}
                      >
                        {t("promotion.directDepositNum")}
                      </Text>
                    </>
                  }
                  value="5"
                  tick
                />
                <Info2Row
                  palette={palette}
                  left={
                    <>
                      <PTCoin1 />
                      <Text
                        style={[
                          styles.info2Label,
                          { color: palette.info2Text },
                        ]}
                      >
                        {t("promotion.directDepositAmount")}
                      </Text>
                    </>
                  }
                  value="1000"
                  tick
                />
                <Info2Row
                  palette={palette}
                  left={
                    <>
                      <PTMoneys1 />
                      <Text
                        style={[
                          styles.info2Label,
                          { color: palette.info2Text },
                        ]}
                      >
                        {t("promotion.directBetAmount")}
                      </Text>
                    </>
                  }
                  value="2000"
                  tick
                />
              </View>
            </GradientBorderAreaBox>
          </View>

          <Middle1 palette={palette} t={t} boxW={boxW} />

          <View style={[styles.row2, { width: boxW }]}>
            <ItemCard
              boxW={boxW}
              palette={palette}
              cellBg={cellBg}
              borderSec={borderSec}
              pg={pg}
              badge="B2"
              figure={PT_IMG.figure3}
              vipVariant="vip2"
              vipText="VIP2"
              p={palette}
              g1={palette.peopleG1}
              g2={palette.peopleG2}
              line="1"
              depositToday="500"
              betToday="500"
              t={t}
              rows={[
                { people: true, v: "1", tick: true },
                { coin: "3", v: "50", grey: true, tick: false },
                { moneys: "2", v: "100", tick: true },
              ]}
            />
            <ItemCard
              boxW={boxW}
              palette={palette}
              cellBg={cellBg}
              borderSec={borderSec}
              pg={pg}
              badge="B1"
              figure={PT_IMG.figure2}
              vipVariant="vip2"
              vipText="VIP2"
              p={palette}
              g1={palette.peopleG1}
              g2={palette.peopleG2}
              line="1"
              depositToday="500"
              betToday="500"
              t={t}
              rows={[
                { people: true, v: "1", tick: true },
                { coin: "2", v: "50", tick: true },
                { moneys: "2", v: "100", tick: true },
              ]}
            />
          </View>

          <Middle2 palette={palette} t={t} boxW={boxW} />

          <View style={[styles.row2, { width: boxW }]}>
            <ItemCard
              boxW={boxW}
              palette={palette}
              cellBg={cellBg}
              borderSec={borderSec}
              pg={pg}
              badge="C2"
              figure={PT_IMG.figure5}
              vipVariant="vip1"
              vipText="VIP1"
              p={palette}
              g1={palette.peopleG1}
              g2={palette.peopleG2}
              line="1"
              leftLine
              depositToday="0"
              betToday="1000"
              t={t}
              rows={[
                { people: true, v: "1", tick: true },
                { coin: "2", v: "20", tick: true },
                { moneys: "2", v: "50", tick: true },
              ]}
            />
            <ItemCard
              boxW={boxW}
              palette={palette}
              cellBg={cellBg}
              borderSec={borderSec}
              pg={pg}
              badge="C1"
              figure={PT_IMG.figure4}
              vipVariant="vip1"
              vipText="VIP1"
              p={palette}
              g1={palette.peopleG1}
              g2={palette.peopleG2}
              line="2"
              depositToday="500"
              betToday="500"
              t={t}
              rows={[
                { people: "3", v: "1", grey: true, tick: false },
                { coin: "3", v: "20", grey: true, tick: false },
                { moneys: "3", v: "50", grey: true, tick: false },
              ]}
            />
          </View>

          <Middle3 palette={palette} t={t} boxW={boxW} />

          <View style={[styles.row2, { width: boxW }]}>
            <ItemCard
              boxW={boxW}
              palette={palette}
              cellBg={cellBg}
              borderSec={borderSec}
              pg={pg}
              badge="D2"
              figure={PT_IMG.figure6}
              vipVariant="vip0"
              vipText="VIP0"
              p={palette}
              g1={palette.peopleG1}
              g2={palette.peopleG2}
              line="3"
              depositToday="30"
              betToday="5000"
              t={t}
              rows={[
                { people: true, v: "0", tick: true },
                { coin: "2", v: "0", tick: true },
                { moneys: "2", v: "0", tick: true },
              ]}
            />
            <View style={{ flex: 1, minWidth: 0 }} />
          </View>
        </View>

        <View style={[styles.tipsFullBleed, { width: fullBleedWidth }]}>
          <TipsBlock
            title={t("promotion.title2")}
            body={t("promotion.text1")}
            palette={palette}
            theme={theme as ThemeType}
            single
          />
          <TipsBlock
            title={t("promotion.title3")}
            palette={palette}
            theme={theme as ThemeType}
            paras={[
              t("promotion.text2"),
              t("promotion.text3"),
              t("promotion.text4"),
              t("promotion.text5"),
              t("promotion.text6"),
              t("promotion.text7"),
            ]}
          />
          <TipsBlock
            title={t("promotion.title4")}
            palette={palette}
            theme={theme as ThemeType}
            paras={[
              t("promotion.text8"),
              t("promotion.text9"),
              t("promotion.text10"),
              t("promotion.text11"),
              t("promotion.text12"),
            ]}
          />
        </View>
      </View>
    );
  },
);

function AreaRow1({
  img,
  sub,
  text,
  palette,
}: {
  img: number;
  sub: string;
  text: string;
  palette: PromotionTutorialPalette;
}) {
  return (
    <GradientBorderAreaBox
      borderColor={palette.border}
      fillColors={palette.areaBoxFillColors}
      fillLocations={palette.areaBoxFillLocations}
      fillStart={palette.areaBoxFillStart}
      fillEnd={palette.areaBoxFillEnd}
      borderRadius={10}
      paddingV={12}
      paddingH={10}
      style={styles.areaBoxOuter}
    >
      <View style={styles.areaBox1Inner}>
        <View style={styles.imgBox}>
          <Image source={img} style={styles.lockImg} resizeMode="contain" />
          <Text style={[styles.lockSub, { color: palette.pageText }]}>
            {sub}
          </Text>
        </View>
        <Text style={[styles.areaText, { color: palette.pageText }]}>
          {text}
        </Text>
      </View>
    </GradientBorderAreaBox>
  );
}

function AreaRow2({
  img,
  text,
  palette,
  longText,
}: {
  img: number;
  text: string;
  palette: PromotionTutorialPalette;
  longText?: boolean;
}) {
  return (
    <GradientBorderAreaBox
      borderColor={palette.border}
      fillColors={palette.areaBoxFillColors}
      fillLocations={palette.areaBoxFillLocations}
      fillStart={palette.areaBoxFillStart}
      fillEnd={palette.areaBoxFillEnd}
      borderRadius={10}
      paddingV={12}
      paddingH={10}
      style={styles.areaBoxOuter}
    >
      <View style={styles.areaBox2Inner}>
        <Image source={img} style={styles.icon42} resizeMode="contain" />
        <Text
          style={[
            styles.areaText,
            longText && styles.areaTextLong,
            { color: palette.pageText, flex: 1 },
          ]}
        >
          {text}
        </Text>
      </View>
    </GradientBorderAreaBox>
  );
}

function Middle1({
  palette,
  t,
  boxW,
}: {
  palette: PromotionTutorialPalette;
  t: (k: string) => string;
  boxW: number;
}) {
  return (
    <View style={[styles.middle1, { width: boxW }]}>
      <ArrowPill palette={palette} label={t("promotion.mapText1")} longArrow />
      <Text style={[styles.numMid, { color: palette.pageText }]}>
        {t("promotion.num1")}
      </Text>
      <ArrowPill palette={palette} label={t("promotion.mapText1")} longArrow />
    </View>
  );
}

function Middle2({
  palette,
  t,
  boxW,
}: {
  palette: PromotionTutorialPalette;
  t: (k: string) => string;
  boxW: number;
}) {
  const itemW = (boxW - 5) / 2;
  return (
    <View style={[styles.middleBand, { width: boxW }]}>
      <View style={styles.middleBandNumOverlay} pointerEvents="box-none">
        <Text style={[styles.numMid, { color: palette.pageText }]}>
          {t("promotion.num2")}
        </Text>
      </View>
      <View style={styles.middleBandTwoCols}>
        <View style={{ width: itemW }} />
        <View style={[styles.middleBandCol, { width: itemW }]}>
          <ArrowPill
            palette={palette}
            label={t("promotion.mapText1")}
            narrow
            longArrow
          />
        </View>
      </View>
      <View style={styles.middle2OnLeftLine} pointerEvents="box-none">
        <ArrowPill
          palette={palette}
          label={t("promotion.mapText2")}
          narrow
          showArrow={false}
        />
      </View>
      <View style={styles.middle2OnRightLine} pointerEvents="box-none">
        <ArrowPill
          palette={palette}
          label={t("promotion.mapText2")}
          narrow
          showArrow={false}
        />
      </View>
    </View>
  );
}

function Middle3({
  palette,
  t,
  boxW,
}: {
  palette: PromotionTutorialPalette;
  t: (k: string) => string;
  boxW: number;
}) {
  const itemW = (boxW - 5) / 2;
  return (
    <View style={[styles.middleBand, { width: boxW }]}>
      <View style={styles.middleBandNumOverlay} pointerEvents="box-none">
        <Text style={[styles.numMid, { color: palette.pageText }]}>
          {t("promotion.num3")}
        </Text>
      </View>
      <View style={styles.middleBandTwoCols}>
        <View style={[styles.middleBandCol, { width: itemW }]}>
          <ArrowPill
            palette={palette}
            label={t("promotion.mapText1")}
            narrow
            longArrow
          />
        </View>
        <View style={{ width: itemW }} />
      </View>
      <View style={styles.middle3OnLeftLine} pointerEvents="box-none">
        <ArrowPill
          palette={palette}
          label={t("promotion.mapText3")}
          narrow
          showArrow={false}
        />
      </View>
    </View>
  );
}

const ArrowPill = memo(function ArrowPill({
  palette,
  label,
  narrow,
  showArrow = true,
  longArrow,
}: {
  palette: PromotionTutorialPalette;
  label: string;
  narrow?: boolean;
  showArrow?: boolean;
  longArrow?: boolean;
}) {
  return (
    <View style={[styles.arrowBox, longArrow && styles.arrowBoxLong]}>
      {showArrow ? (
        <Image
          source={PT_IMG.union}
          style={[
            styles.unionBg,
            longArrow && styles.unionBgLong,
            longArrow
              ? { tintColor: palette.lineColor, opacity: 1 }
              : { opacity: 0.35 },
          ]}
          resizeMode="stretch"
        />
      ) : null}
      <LinearGradient
        colors={palette.arrowPillGradient}
        style={[
          styles.arrowPill,
          { borderColor: palette.arrowPillBorder },
          narrow && { maxWidth: 56, paddingHorizontal: 4 },
        ]}
      >
        <Text
          style={[styles.arrowPillText, { color: palette.arrowPillText }]}
          numberOfLines={2}
        >
          {label}
        </Text>
      </LinearGradient>
    </View>
  );
});

type RowSpec =
  | { people: true; v: string; tick: boolean; grey?: boolean }
  | { people: "3"; v: string; grey: boolean; tick: false }
  | { coin: "2" | "3"; v: string; tick: boolean; grey?: boolean }
  | { moneys: "2" | "3"; v: string; tick: boolean; grey?: boolean };

const ItemCard = memo(function ItemCard({
  boxW,
  palette,
  cellBg,
  borderSec,
  pg,
  badge,
  figure,
  vipVariant,
  vipText,
  p,
  g1,
  g2,
  line,
  leftLine,
  depositToday,
  betToday,
  t,
  rows,
}: {
  boxW: number;
  palette: PromotionTutorialPalette;
  cellBg: string;
  borderSec: string;
  pg: string;
  badge: string;
  figure: number;
  vipVariant: "vip6" | "vip2" | "vip1" | "vip0";
  vipText: string;
  p: PromotionTutorialPalette;
  g1: string;
  g2: string;
  line: "1" | "2" | "3";
  leftLine?: boolean;
  depositToday: string;
  betToday: string;
  t: (k: string) => string;
  rows: RowSpec[];
}) {
  const itemW = (boxW - 5) / 2;
  const lineStyle =
    line === "1" ? styles.line1 : line === "2" ? styles.line2 : styles.line3;
  return (
    <GradientBorderAreaBox
      borderColor={palette.border}
      fillColors={palette.areaBoxFillColors}
      fillLocations={palette.areaBoxFillLocations}
      fillStart={palette.areaBoxFillStart}
      fillEnd={palette.areaBoxFillEnd}
      borderRadius={10}
      paddingV={12}
      paddingH={10}
      style={{ ...styles.itemBox, width: itemW }}
    >
      {leftLine ? (
        <Image source={PT_IMG.leftLine} style={styles.leftLineImg} />
      ) : null}
      <AbcdBadge label={badge} />
      <View style={styles.itemInner}>
        <View
          style={[
            styles.vertLine,
            {
              backgroundColor: palette.lineColor,
              shadowColor: palette.lineShadow,
            },
            lineStyle,
          ]}
        />
        <View style={styles.top1}>
          <View style={[styles.avatarSm, { borderColor: borderSec }]}>
            <Image
              source={figure}
              style={styles.avatarImg}
              resizeMode="contain"
            />
          </View>
          <VipLabel variant={vipVariant} text={vipText} />
        </View>
        <View style={styles.top2}>
          <View style={[styles.cell, { backgroundColor: cellBg }]}>
            <Text
              style={[styles.cellLabel, { color: pg }]}
              numberOfLines={2}
            >
              {t("promotion.todayDeposit")}
            </Text>
            <Text
              style={[styles.cellVal, { color: pg }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
            >
              {depositToday}
            </Text>
          </View>
          <View style={[styles.cell, { backgroundColor: cellBg }]}>
            <Text
              style={[styles.cellLabel, { color: pg }]}
              numberOfLines={2}
            >
              {t("promotion.todayBet")}
            </Text>
            <Text
              style={[styles.cellVal, { color: pg }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
            >
              {betToday}
            </Text>
          </View>
        </View>
        {rows.map((row, i) => (
          <ItemRow
            key={i}
            row={row}
            palette={p}
            g1={g1}
            g2={g2}
            cellBg={cellBg}
            pg={pg}
          />
        ))}
      </View>
    </GradientBorderAreaBox>
  );
});

function ItemRow({
  row,
  palette,
  g1,
  g2,
  cellBg,
  pg,
}: {
  row: RowSpec;
  palette: PromotionTutorialPalette;
  g1: string;
  g2: string;
  cellBg: string;
  pg: string;
}) {
  if ("people" in row && row.people === true) {
    return (
      <View style={[styles.itemBottom, { backgroundColor: cellBg }]}>
        <View style={styles.info2Left}>
          <PTPeople2 g1={g1} g2={g2} />
          <Text style={{ color: pg, fontSize: 13 }}>{row.v}</Text>
        </View>
        {row.tick ? (
          <PTTickCircle
            g1={palette.tickG1}
            g2={palette.tickG2}
            inner={palette.tickInner}
            size={18}
          />
        ) : (
          <View style={{ width: 18 }} />
        )}
      </View>
    );
  }
  if ("people" in row && row.people === "3") {
    return (
      <View style={[styles.itemBottom, { backgroundColor: cellBg }]}>
        <View style={styles.info2Left}>
          <PTPeople3 color={palette.greyMuted} />
          <Text style={{ color: palette.greyMuted, fontSize: 13 }}>
            {row.v}
          </Text>
        </View>
        <View style={{ width: 18 }} />
      </View>
    );
  }
  if ("coin" in row) {
    return (
      <View style={[styles.itemBottom, { backgroundColor: cellBg }]}>
        <View style={styles.info2Left}>
          {row.coin === "3" ? (
            <PTCoin3 color={palette.greyMuted} />
          ) : (
            <PTCoin2 g1={g1} g2={g2} />
          )}
          <Text
            style={{
              fontSize: 13,
              color: row.grey ? palette.greyMuted : pg,
            }}
          >
            {row.v}
          </Text>
        </View>
        {row.tick ? (
          <PTTickCircle
            g1={palette.tickG1}
            g2={palette.tickG2}
            inner={palette.tickInner}
            size={18}
          />
        ) : (
          <View style={{ width: 18 }} />
        )}
      </View>
    );
  }
  return (
    <View style={[styles.itemBottom, { backgroundColor: cellBg }]}>
      <View style={styles.info2Left}>
        {row.moneys === "3" ? (
          <PTMoneys3 color={palette.greyMuted} />
        ) : (
          <PTMoneys2 g1={g1} g2={g2} />
        )}
        <Text
          style={{
            fontSize: 13,
            color: row.grey ? palette.greyMuted : pg,
          }}
        >
          {row.v}
        </Text>
      </View>
      {row.tick ? (
        <PTTickCircle
          g1={palette.tickG1}
          g2={palette.tickG2}
          inner={palette.tickInner}
          size={18}
        />
      ) : (
        <View style={{ width: 18 }} />
      )}
    </View>
  );
}

function TipsBlock({
  title,
  body,
  paras,
  palette,
  theme,
  single,
}: {
  title: string;
  body?: string;
  paras?: string[];
  palette: PromotionTutorialPalette;
  theme: ThemeType;
  single?: boolean;
}) {
  return (
    <View style={[styles.tipsBox, { backgroundColor: palette.boxBg }]}>
      <SectionTitle label={title} palette={palette} theme={theme} />
      <View
        style={[styles.tipsTexts, { backgroundColor: palette.tipsTextsBg }]}
      >
        {single && body ? (
          <Text
            style={[
              styles.tipsPara,
              {
                color: palette.pageText,
                textAlign: "left",
                writingDirection: "ltr",
              },
            ]}
          >
            {body}
          </Text>
        ) : null}
        {paras
          ? paras.map((p, i) => (
              <Text
                key={i}
                style={[
                  styles.tipsPara,
                  {
                    color: palette.pageText,
                    textAlign: "left",
                    writingDirection: "ltr",
                  },
                ]}
              >
                {p}
              </Text>
            ))
          : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: "100%", paddingBottom: 24 },
  topArea: { width: "100%", paddingVertical: 30, paddingHorizontal: 24 },
  topAreaImg: { borderRadius: 0 },
  topInner: { alignItems: "center", gap: 5 },
  areaBoxOuter: {
    width: "100%",
    alignSelf: "stretch",
  },
  areaBox1Inner: { flexDirection: "row", alignItems: "center", gap: 10 },
  imgBox: { alignItems: "center", marginTop: -20 },
  lockImg: { width: 50, height: 50 },
  lockSub: { marginTop: 5, fontSize: 13, fontWeight: "600" },
  areaText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
  },
  areaTextLong: { fontSize: 11, lineHeight: 16 },
  areaBox2Inner: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon42: { width: 42, height: 42 },
  exampleArea: {
    borderRadius: 20,
    marginBottom: 15,
    paddingTop: 0,
    paddingBottom: 8,
    alignItems: "center",
  },
  sectionTitleWrap: {
    position: "relative",
    width: 200,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitleText: { fontSize: 13, fontWeight: "600", zIndex: 1 },
  exampleTopWrap: {
    marginTop: 15,
    position: "relative",
    alignItems: "center",
    overflow: "visible",
  },
  lineBoxLeft: {
    position: "absolute",
    left: -25,
    width: 14,
    height: 696,
    top: "50%",
    marginTop: 0,
    zIndex: 0,
  },
  lineBoxRight: {
    position: "absolute",
    right: -25,
    width: 14,
    height: 456,
    top: "50%",
    marginTop: 0,
    zIndex: 0,
  },
  exampleTopInner: { width: "100%", gap: 5, zIndex: 1 },
  abcdBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 10,
    overflow: "hidden",
  },
  abcdImg: { ...StyleSheet.absoluteFillObject, width: 24, height: 24 },
  abcdText: { color: "#fff", fontSize: 12, fontWeight: "600", lineHeight: 24 },
  info1: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarLg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    overflow: "hidden",
  },
  avatarSm: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  nameTxt: { fontSize: 13, fontWeight: "500" },
  vipBg: { width: 52, height: 22, justifyContent: "center" },
  vipText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "right",
    paddingRight: 8,
    lineHeight: 20,
  },
  info2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 24,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  info2Left: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
  info2Label: { fontSize: 12 },
  info2Val: { fontSize: 12, fontWeight: "600" },
  middle1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 42,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  middleBand: {
    position: "relative",
    marginTop: 4,
    minHeight: 42,
  },
  middle2OnLeftLine: {
    position: "absolute",
    left: -35,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 5,
  },
  middle2OnRightLine: {
    position: "absolute",
    right: -35,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 5,
  },
  middle3OnLeftLine: {
    position: "absolute",
    left: -35,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 5,
  },
  middleBandTwoCols: {
    flexDirection: "row",
    gap: 5,
    width: "100%",
    alignItems: "center",
    minHeight: 42,
    zIndex: 2,
  },
  middleBandCol: {
    justifyContent: "center",
    alignItems: "center",
  },
  middleBandNumOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "box-none",
    zIndex: 1,
  },
  numMid: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  arrowBox: {
    maxWidth: 72,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  arrowBoxLong: {
    minHeight: 40,
  },
  unionBg: {
    position: "absolute",
    left: "50%",
    marginLeft: -6,
    top: 0,
    width: 12,
    height: "100%",
    opacity: 0.35,
  },
  unionBgLong: {
    width: 18,
    marginLeft: -9,
  },
  arrowPill: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 1,
  },
  arrowPillText: {
    fontSize: 8,
    lineHeight: 10,
    textAlign: "center",
    fontWeight: "600",
  },
  row2: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
    marginTop: 8,
    alignItems: "flex-start",
  },
  itemBox: {
    position: "relative",
    overflow: "visible",
  },
  leftLineImg: {
    position: "absolute",
    left: -25,
    top: "47%",
    width: 14,
    height: 3,
    zIndex: 3,
  },
  itemInner: {
    borderRadius: 8,
    width: "100%",
    padding: 10,
    paddingBottom: 14,
    gap: 5,
    overflow: "hidden",
  },
  vertLine: {
    position: "absolute",
    width: 2,
    height: 42,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    top: -42,
    zIndex: 0,
  },
  line1: { left: "50%", marginLeft: -1 },
  line2: { left: 25 },
  line3: { right: 25 },
  top1: { flexDirection: "row", alignItems: "center", gap: 10, zIndex: 1 },
  top2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: 5,
    width: "100%",
    zIndex: 1,
  },
  cell: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  cellLabel: {
    fontSize: 8,
    textAlign: "center",
    lineHeight: 10,
    width: "100%",
  },
  cellVal: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
    width: "100%",
  },
  itemBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 5,
    zIndex: 1,
  },
  itemBottomVal: { fontSize: 13 },
  tipsFullBleed: {
    marginHorizontal: -16,
    alignSelf: "center",
  },
  tipsBox: {
    width: "100%",
    paddingHorizontal: 31,
    paddingBottom: 15,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: "center",
  },
  tipsTexts: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  tipsPara: { fontSize: 12, lineHeight: 18, marginBottom: 8 },
});
