// vip卡片
import { getVipConfig } from "@/components/active/components/activeConfg";
import { LinearGradient } from "expo-linear-gradient";
import React, { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

export interface MemberSalaryRspDto {
  daySalary?: number;
  dayDeposit?: number;
  dayBetnum?: number;
  weekSalary?: number;
  weekDeposit?: number;
  weekBetnum?: number;
  monthSalary?: number;
  monthDeposit?: number;
  monthBetnum?: number;
  birthdayBonus?: number;
}

export interface VipItem {
  betNum: number;
  betRate: number;
  createDatetime: number;
  depositMoney: number;
  icon: string;
  id: number;
  level: number;
  memberCount: number;
  name: string;
  original: number;
  partnerId: number;
  remark: string;
  skipMoney: number;
  stationId: number;
  status: number;
  type: number;
  upgradeMoney: number;
  upgradeSendMsg: number;
  memberSalaryRspDto?: MemberSalaryRspDto;
  isReached?: boolean;
}

export interface DegreeInfo {
  curDegreeName: string; // 当前等级名称
  curDegreeLevel: number; // 当前等级
  curDegreeDepositMoney: number; // 当前等级的存款金额
  curDegreeBetNum: number; // 当前等级的投注数量

  newDegreeName: string; // 新等级名称
  newDegreeLevel: number; // 新等级
  newDegreeDepositMoney: number; // 新等级的存款金额
  newDegreeBetNum: number; // 新等级的投注数量

  nextDegreeDepositMoney: number; // 下一等级的存款金额
  nextDegreeBetNum: number; // 下一等级的投注数量

  type: number; // 升级类型（例如，1代表充值，2代表打码）
  userDegreeIcon: string | null; // 用户等级图标，可能为空
}

export type VipCarouseProps = {
  data: VipItem[];
  info: DegreeInfo | null;
  onIndexChange?: (index: number) => void;
  /**
   * 首次挂载时默认页（对应 Carousel 的 defaultIndex，仅初次挂载读取）。
   * @see https://github.com/dohooo/react-native-reanimated-carousel
   */
  initialIndex?: number;
  /** Measured container width (carousel uses full width; card scales inside). */
  layoutWidth: number;
  /** Slide height = layoutWidth * heightRatio. Default 0.42 */
  heightRatio?: number;
  /** Inner VIP card width = layoutWidth * cardWidthRatio. Default 0.88 */
  cardWidthRatio?: number;
  /** Parallax horizontal offset. Default 44 */
  parallaxScrollingOffset?: number;
  /** 非當前項縮放（越小相鄰卡越明顯露出邊緣）。Default 0.99 */
  parallaxScrollingScale?: number;
};

const Carouse = forwardRef<ICarouselInstance, VipCarouseProps>(
  (
    {
      data,
      info,
      onIndexChange,
      initialIndex = 0,
      layoutWidth,
      heightRatio = 0.42,
      cardWidthRatio = 0.88,
      parallaxScrollingOffset = 44,
      parallaxScrollingScale = 0.999,
    },
    ref,
  ) => {
    const width = layoutWidth * cardWidthRatio;
    const { t } = useTranslation();
    const safeDefaultIndex =
      data.length === 0
        ? 0
        : Math.min(Math.max(0, Math.floor(initialIndex)), data.length - 1);

    const getColorByLevel = (level: number): string => {
      return level < 11 ? "rgba(255, 255, 255, 1)" : "rgba(102, 52, 9, 1)";
    };

    /** 與 Web `useVipColors` / profile type4 Swiper 漸層一致（等級索引勿與舊版 RN 混淆） */
    const getBackgroundColors = (level: number): [string, string] => {
      switch (true) {
        case level === 0:
          return ["rgb(166, 183, 208)", "rgb(136, 158, 190)"];
        case level === 1:
          return ["rgb(255, 205, 163)", "rgb(255, 153, 102)"];
        case level === 2:
          return ["rgb(248, 189, 131)", "rgb(248, 189, 131)"];
        case level === 3:
          return ["rgb(255, 164, 147)", "rgb(255, 120, 120)"];
        case level === 4:
          return ["rgb(120, 219, 235)", "rgb(120, 219, 235)"];
        case level === 5:
          return ["rgb(223, 145, 251)", "rgb(239, 130, 213)"];
        case level === 6:
          return ["rgb(97, 220, 166)", "rgb(34, 155, 95)"];
        case level === 7:
          return ["rgb(87, 183, 51)", "rgb(34, 155, 95)"];
        case level === 8:
          return ["rgb(84, 186, 241)", "rgb(61, 119, 232)"];
        case level === 9:
          return ["rgb(208, 132, 226)", "rgb(141, 73, 255)"];
        case level === 10:
          return ["rgb(238, 175, 58)", "rgb(249, 139, 59)"];
        default:
          return ["rgb(208, 133, 226)", "rgb(141, 72, 254)"];
      }
    };

    // 等级进度条背景色
    const getVipProgressBg = (level: number): string => {
      switch (true) {
        case level === 0:
          return "rgb(116, 138, 170)";
        case level === 1:
          return "rgb(116, 138, 170)";
        case level === 2:
          return "rgb(214, 125, 38)";
        case level === 3:
          return "rgb(240, 92, 92)";
        case level === 4:
          return "rgb(50, 182, 232)";
        case level === 5:
          return "rgb(234, 106, 202)";
        case level === 6:
          return "rgb(30, 177, 139)";
        case level === 7:
          return "rgb(27, 148, 88)";
        case level === 8:
          return "rgb(52, 112, 230)";
        case level === 9:
          return "rgb(128, 56, 245)";
        case level === 10:
          return "rgb(239, 123, 39)";
        case level >= 11:
          return "rgb(114, 49, 255)";
        default:
          return "rgb(0, 0, 0)"; // fallback
      }
    };

    const setDepositView = (
      item: VipItem,
      info: DegreeInfo | null,
      index: string,
    ): React.ReactNode => {
      if (!info) return null;

      const isDepositType = info.type === 1;
      const currentValue = isDepositType
        ? info.curDegreeDepositMoney
        : info.curDegreeBetNum;

      const targetValue = isDepositType ? item.depositMoney : item.betNum;
      const label = isDepositType
        ? t("pageName.recharge")
        : t("active.vip.xiazhu");

      const isUpgrading = targetValue > currentValue;

      const rate = info
        ? info.type == 1
          ? info.curDegreeDepositMoney / item.depositMoney
          : info.curDegreeBetNum / item.betNum
        : 0;
      const percentage = `${Math.min(rate, 1) * 100}%` as `${number}%`;
      const { card } = getVipConfig(item.level);
      switch (index) {
        //卡片头部文字
        case "upgrading":
          return (
            <View className="flex-row w-full justify-start items-start self-start ml-1">
              <Image
                resizeMode="contain"
                style={styles.styleLock}
                source={
                  isUpgrading
                    ? require("@/assets/images/active/vip/ununlocked.png")
                    : require("@/assets/images/active/vip/haveReached.png")
                }
              />
              <Text
                style={[
                  styles.lockFont,
                  { color: getColorByLevel(item.level) },
                ]}
              >
                {isUpgrading ? t("active.vip.weijs") : t("active.vip.yijs")}
              </Text>
            </View>
          );
        //卡片左侧文字
        case "leftop":
          return (
            <View className="w-full justify-start items-start self-start ml-1">
              <Text
                ellipsizeMode="tail"
                numberOfLines={2}
                style={[styles.deposit, { color: getColorByLevel(item.level) }]}
              >
                {isUpgrading
                  ? `${t("active.vip.shenjiHint", { name: item.name, label: label, value: targetValue - currentValue })}`
                  : `${t("active.vip.helloHint", { name: item.name })}`}
              </Text>
            </View>
          );
        //进度条右上部文字
        case "rightop":
          return (
            <Text
              style={[
                styles.rightTopText,
                { color: getColorByLevel(item.level) },
              ]}
            >
              {`${isUpgrading ? item.name : t("status.completed")}`}
            </Text>
          );
        //大名鼎鼎的进度条
        case "progress":
          return (
            <LinearGradient
              style={styles.progressBar}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              colors={[card.shadow.e, card.shadow.s]}
              locations={[0, 1]}
            >
              <View
                style={[
                  styles.progressBarBackground,
                  { backgroundColor: getVipProgressBg(item.level) },
                ]}
              />
              <LinearGradient
                style={[styles.progressBarFill, { width: percentage }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                colors={[card.pro.s, card.pro.e]}
              />
            </LinearGradient>
          );
        //进度条左下部文字
        case "leftbottom":
          return isUpgrading ? (
            <LinearGradient
              style={[
                styles.leftBottomContainer,
                { borderWidth: 1, borderColor: card.color.e },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[card.color.s, card.color.e]}
            >
              <Text
                style={[
                  styles.leftBottomText,
                  { color: getColorByLevel(item.level) },
                ]}
              >
                {`${currentValue}/${targetValue}`}
              </Text>
            </LinearGradient>
          ) : (
            <Text
              style={[
                styles.leftBottomText,
                { marginTop: 4, color: getColorByLevel(item.level) },
              ]}
            >
              {t("active.vip.targetUpgradeHint", {
                label,
                amount: targetValue,
                suffix: t("active.vip.kesj"),
              })}
            </Text>
          );
        //进度条右下部文字
        case "rightbottom":
          return (
            isUpgrading && (
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={[
                  styles.rightBottomText,
                  { color: getColorByLevel(item.level) },
                ]}
              >
                {t("active.vip.targetUpgradeHint", {
                  label,
                  amount: targetValue,
                  suffix: t("active.vip.kesj"),
                })}
              </Text>
            )
          );
        default:
          return null;
      }
    };

    return (
      <Carousel
        ref={ref}
        loop={false}
        defaultIndex={safeDefaultIndex}
        pagingEnabled={true}
        snapEnabled={true}
        width={layoutWidth}
        height={layoutWidth * heightRatio}
        autoPlay={false}
        data={data}
        onSnapToItem={(index) => {
          if (Number.isInteger(index) && onIndexChange) {
            onIndexChange(index);
          }
        }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale,
          parallaxScrollingOffset,
        }}
        renderItem={({ item }) => {
          const backgroundColors = getBackgroundColors(item.level);
          return (
            <LinearGradient
              style={[styles.vipContent, { width: width, height: "100%" }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              locations={[0, 0.8]}
              colors={backgroundColors}
            >
              <ImageBackground
                source={require("@/assets/images/active/vip/bg-v.png")}
                style={[styles.cardBg, { width: width, height: "100%" }]}
                resizeMode="contain"
                imageStyle={{ marginLeft: "20%" }}
              >
                <View className="w-full justify-between flex-row h-[65%]">
                  {/* 左边文字 */}
                  <View
                    style={{
                      width: "65%",
                      height: "100%",
                      // justifyContent: "space-between",
                    }}
                  >
                    <View className="w-full flex-row items-center mt-1">
                      <Image
                        source={
                          item.isReached
                            ? require("@/assets/images/active/vip/vip-reached.png")
                            : require("@/assets/images/active/vip/vip.png")
                        }
                        resizeMode="contain"
                        style={styles.vipIcon}
                      />
                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={[
                          styles.vipFont,
                          { color: "#FFEF93" },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </View>
                    {setDepositView(item, info, "upgrading")}
                    {/* {setDepositView(item, info, "leftop")} */}
                  </View>
                  {/* 徽章 */}
                  <View
                    className="flex-row justify-start items-end"
                    style={{ width: "35%", height: "100%" }}
                  >
                    <Image
                      source={getVipConfig(item.level).card.badge}
                      resizeMode="contain"
                      style={styles.vipBadage}
                    />
                  </View>
                </View>
                <View className="w-full h-[35%] justify-around">
                  {setDepositView(item, info, "rightop")}
                  {setDepositView(item, info, "progress")}
                  <View className="w-full justify-between flex-row">
                    {setDepositView(item, info, "leftbottom")}
                    {setDepositView(item, info, "rightbottom")}
                  </View>
                </View>
              </ImageBackground>
            </LinearGradient>
          );
        }}
      />
    );
  },
);

Carouse.displayName = "VipCarouse";

const styles = StyleSheet.create({
  vipContent: {
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
    overflow: "hidden",
  },
  cardBg: {
    width: 375,
    height: 210,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  vipIcon: {
    width: 20,
    height: 20,
  },
  vipFont: {
    marginLeft: 5,
    fontSize: 16,
  },
  styleLock: {
    marginRight: 2,
    width: 14,
    height: 14,
  },
  lockFont: {
    marginLeft: 2,
    fontSize: 12,
  },
  vipBadage: {
    width: "100%",
    height: "100%",
  },
  deposit: {
    fontSize: 12,
    textAlign: "left",
    flexWrap: "wrap",
    lineHeight: 18,
  },

  depositText: {
    fontSize: 12,
    textAlign: "left",
    flexWrap: "wrap",
    lineHeight: 20,
  },

  rightTopText: {
    fontSize: 12,
    marginBottom: 4,
    width: "100%",
    textAlign: "right",
  },
  progressBar: {
    width: "100%",
    height: 10,
    borderRadius: 10,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    borderRadius: 8,
    position: "absolute",
    left: -2,
    right: -2,
  },
  progressBarFill: {
    height: 10,
    borderRadius: 10,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  leftBottomContainer: {
    marginTop: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    justifyContent: "center",
    overflow: "hidden",
  },
  leftBottomText: {
    fontSize: 12,
  },
  rightBottomText: {
    marginTop: 4,
    fontSize: 12,
  },
});

export default Carouse;
