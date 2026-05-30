/*
 * @FilePath: \ngss-rn\src\components\common\DateRangePicker.tsx
 * @Description: 日期范围选择器
 */
import {
  View,
  Text,
  Easing,
  Animated,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal as RNModal,
  Platform,
  useWindowDimensions,
  InteractionManager,
} from "react-native";
import { useEffect, useState, useRef, useMemo } from "react";
import { Icon } from "@rneui/themed";
import { type TimeRange } from "@/types";
import { Colors } from "@/constants/Colors";
import { formatDateTime } from "@/utils/date";
import { useTranslation } from "react-i18next";
import { useCommon } from "@/hooks/CommonProvider";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  DatePickerModal,
  DatePickerModalContent,
} from "react-native-paper-dates";
import { useTheme as usePaperTheme } from "react-native-paper";
import Modal from "react-native-modal";
import { I18nText } from "../I18nText";
import { CalendarDate } from "react-native-paper-dates/lib/typescript/Date/Calendar";
import { type Option, OPTIONS, getDateRange, formatDate } from "@/utils/date";
import { useDynamicMaxWidth } from "@/hooks/useMaxWidth";
import { DATE_PICKER_LOCALE_MAP } from "@/lang/language";

const SHEET_ANIM_IN_MS = 400;
const SHEET_ANIM_OUT_MS = 340;
const BACKDROP_ANIM_IN_MS = 240;
const BACKDROP_ANIM_OUT_MS = 280;
/** iOS：paper-dates 的 DatePickerModal 用 RN Modal slide 退场，与父级 onConfirm 触发的列表/toast 同帧叠在一起易整页触摸卡死，须错开 */
const IOS_CALENDAR_CONFIRM_DEFER_MS = 380;

interface DateRangePickerProps {
  style?: StyleProp<ViewStyle>; // 父组件定义样式
  textStyle?: StyleProp<TextStyle>; // 日期/标签文字样式（用于 rf 适配）
  showLabel?: boolean; // 显示为标签（今天，昨天等 - 用于小宽度表单）
  onConfirm: (params: TimeRange) => void; // 确认回调
}
function glyphStyleForDateRangeText(
  textStyle: StyleProp<TextStyle> | undefined,
): TextStyle {
  const fs = StyleSheet.flatten(textStyle)?.fontSize;
  const fontSize = typeof fs === "number" ? fs : 12;
  const lineHeight = Math.round(fontSize * 1.38);
  if (Platform.OS === "android") {
    return {
      lineHeight,
      includeFontPadding: false,
      textAlignVertical: "center",
    };
  }
  return { lineHeight };
}

export default function DateRangePicker({
  style = {},
  textStyle,
  showLabel,
  onConfirm,
}: DateRangePickerProps) {
  const { maxWidth } = useDynamicMaxWidth();
  const { height: windowHeight } = useWindowDimensions();
  /** Web：日历根节点是 flex:1，父级必须有确定高度，否则 RN Web 上 flex 子项高度塌成 0，只能看到表头 */
  const webDatePickerSheetHeight = useMemo(
    () => Math.min(640, Math.max(420, Math.round(windowHeight * 0.88))),
    [windowHeight],
  );
  const didInit = useRef(false);
  const deferredParentConfirmRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isMountedRef = useRef(true);
  const { t } = useTranslation();
  const { language } = useCommon();
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const {
    theme,
    themeColors: { primary, text },
  } = useTheme();
  const paperTheme = usePaperTheme();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [activeOption, setActiveOption] = useState("today");
  const [selectVisible, setSelectVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const today = new Date();
  const displayAsLabel = showLabel && activeOption !== "custom";

  const showSelectModal = () => setSelectVisible(true);
  const hideSelectModal = () => setSelectVisible(false);
  const showDateRangePicker = () => setDatePickerVisible(true);
  const onDismiss = () => setDatePickerVisible(false);
  const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formatDateWithTimeZone = (date: Date) =>
    formatDate(date, deviceTimezone);

  function onSelect(option: Option) {
    setActiveOption(option);
    if (option === "custom") {
      hideSelectModal();
      setTimeout(showDateRangePicker, 300);
    } else {
      const { startTime, endTime } = getDateRange(option);
      setStartDate(startTime);
      setEndDate(endTime);
      const timeRange: TimeRange = [
        formatDateWithTimeZone(startTime),
        formatDateWithTimeZone(endTime),
      ];
      onConfirm(timeRange);
      hideSelectModal();
    }
  }
  function onConfirmDates({
    startDate,
    endDate,
  }: {
    startDate: CalendarDate;
    endDate: CalendarDate;
  }) {
    // 日历库返回的 Date 以 UTC 00:00:00 对齐，设为设备本地时间当天的边界
    const parsedStartDate = startDate ? new Date(startDate) : new Date();
    const parsedEndDate = endDate ? new Date(endDate) : new Date();
    parsedStartDate.setHours(0, 0, 0, 0);
    parsedEndDate.setHours(23, 59, 59, 999);

    setDatePickerVisible(false);
    setStartDate(parsedStartDate);
    setEndDate(parsedEndDate);
    const timeRange: TimeRange = [
      formatDateWithTimeZone(parsedStartDate),
      formatDateWithTimeZone(parsedEndDate),
    ];
    if (Platform.OS === "ios") {
      if (deferredParentConfirmRef.current != null) {
        clearTimeout(deferredParentConfirmRef.current);
      }
      InteractionManager.runAfterInteractions(() => {
        if (!isMountedRef.current) return;
        deferredParentConfirmRef.current = setTimeout(() => {
          deferredParentConfirmRef.current = null;
          if (!isMountedRef.current) return;
          onConfirm(timeRange);
        }, IOS_CALENDAR_CONFIRM_DEFER_MS);
      });
    } else {
      onConfirm(timeRange);
    }
  }

  useEffect(() => {
    Animated.timing(rotateAnimation, {
      toValue: selectVisible ? 1 : 0,
      duration: 220,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [selectVisible]);
  useEffect(() => {
    if (!didInit.current) {
      onSelect("today");
      didInit.current = true;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (deferredParentConfirmRef.current != null) {
        clearTimeout(deferredParentConfirmRef.current);
        deferredParentConfirmRef.current = null;
      }
    };
  }, []);

  const glyphStyle = glyphStyleForDateRangeText(textStyle);

  const sheetAnimationIn = useMemo(
    () => ({
      from: { translateY: windowHeight },
      to: { translateY: 0 },
      easing: Easing.out(Easing.cubic),
    }),
    [windowHeight],
  );

  const sheetAnimationOut = useMemo(
    () => ({
      from: { translateY: 0 },
      to: { translateY: windowHeight },
      easing: Easing.in(Easing.cubic),
    }),
    [windowHeight],
  );

  return (
    <>
      <TouchableOpacity
        className={`h-10 min-w-28 rounded-lg bg-${theme}-btnText flex-row items-center
        shadow shadow-black/10 shadow-offset-[1px/1px] shadow-radius-[2px] elevation-[4]`}
        style={[
          style,
          {
            paddingHorizontal: 12,
            paddingVertical: 6,
            gap: 4,
            justifyContent: "center",
            minWidth: 0,
          },
        ]}
        onPress={showSelectModal}
      >
        {displayAsLabel ? (
          <View className="flex flex-1 flex-row justify-between items-center px-1">
            <I18nText
              i18nKey={"dateRangePicker." + activeOption}
              className={`text-xs text-[#acafc2] flex-1 text-center`}
              style={[textStyle, glyphStyle]}
            />
            <View className="w-4" style={{ position: "absolute", right: 0 }}>
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons color={"#888"} name={"chevron-down"} size={15} />
              </Animated.View>
            </View>
          </View>
        ) : (
          <>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 0,
                gap: 4,
              }}
            >
              <Text
                className={`text-xs text-[#acafc2]`}
                style={[textStyle, glyphStyle, { flexShrink: 1, minWidth: 0 }]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {formatDateTime(startDate, "/")}
              </Text>
              <Text
                className={`text-xs text-[#acafc2]`}
                style={[textStyle, glyphStyle, { flexShrink: 0 }]}
              >
                -
              </Text>
              <Text
                className={`text-xs text-[#acafc2]`}
                style={[textStyle, glyphStyle, { flexShrink: 1, minWidth: 0 }]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {formatDateTime(endDate, "/")}
              </Text>
            </View>
            {!showLabel && (
              <Icon
                size={16}
                style={{ width: 16, flexShrink: 0 }}
                name="calendar"
                type="antdesign"
                color={text}
              />
            )}
          </>
        )}
      </TouchableOpacity>
      {(Platform.OS !== "ios" || selectVisible) && (
        <Modal
          isVisible={Platform.OS === "ios" ? true : selectVisible}
          onBackdropPress={hideSelectModal}
          onModalHide={hideSelectModal}
          style={{
            margin: 0,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
          animationIn={sheetAnimationIn}
          animationOut={sheetAnimationOut}
          animationInTiming={SHEET_ANIM_IN_MS}
          animationOutTiming={SHEET_ANIM_OUT_MS}
          backdropOpacity={0.5}
          backdropTransitionInTiming={BACKDROP_ANIM_IN_MS}
          backdropTransitionOutTiming={BACKDROP_ANIM_OUT_MS}
          useNativeDriver
          hideModalContentWhileAnimating={false}
          statusBarTranslucent={Platform.OS === "android"}
        >
          <View
            style={{
              backgroundColor: Colors[theme].cardBg1,
              width: "100%",
              maxWidth,
              overflow: "hidden",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            {OPTIONS.map((option) => (
              <Pressable key={option} onPress={() => onSelect(option)}>
                <View className="h-10 flex items-center justify-center">
                  <View className="relative">
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: -24,
                        opacity: activeOption === option ? 1 : 0,
                      }}
                    >
                      <Icon
                        type="antdesign"
                        name="check"
                        size={19}
                        color={primary}
                      />
                    </View>
                    <I18nText
                      i18nKey={"dateRangePicker." + option}
                      className={
                        activeOption === option
                          ? `text-${theme}-primary`
                          : `text-${theme}-text`
                      }
                    />
                  </View>
                </View>
              </Pressable>
            ))}
            {Platform.OS !== "web" && <View style={{ height: 16 }} />}
          </View>
        </Modal>
      )}
      {Platform.OS === "web" ? (
        <RNModal
          visible={datePickerVisible}
          transparent
          animationType="fade"
          onRequestClose={onDismiss}
        >
          <View style={styles.webDateModalRoot}>
            <TouchableWithoutFeedback onPress={onDismiss}>
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  { backgroundColor: paperTheme.colors.backdrop },
                ]}
              />
            </TouchableWithoutFeedback>
            <View
              style={[StyleSheet.absoluteFillObject, styles.webDateModalCenter]}
              pointerEvents="box-none"
            >
              <View
                style={[
                  styles.webDateModalCard,
                  {
                    backgroundColor: paperTheme.colors.surface,
                    height: webDatePickerSheetHeight,
                  },
                ]}
              >
                <View style={styles.webDateModalBody}>
                  <DatePickerModalContent
                    mode="range"
                    locale={
                      DATE_PICKER_LOCALE_MAP.get(language.toLowerCase()) || "en"
                    }
                    onDismiss={onDismiss}
                    startDate={startDate}
                    endDate={endDate}
                    onConfirm={onConfirmDates}
                    saveLabel={t("common.confirm")}
                    startLabel={t("dateRangePicker.startTime")}
                    endLabel={t("dateRangePicker.endTime")}
                    label={t("dateRangePicker.selectDateRange")}
                    validRange={{ endDate: today }}
                    disableSafeTop
                    disableStatusBar
                    statusBarOnTopOfBackdrop={false}
                  />
                </View>
              </View>
            </View>
          </View>
        </RNModal>
      ) : (
        <DatePickerModal
          locale={DATE_PICKER_LOCALE_MAP.get(language.toLowerCase()) || "en"}
          mode="range"
          visible={datePickerVisible}
          onDismiss={onDismiss}
          startDate={startDate}
          endDate={endDate}
          onConfirm={onConfirmDates}
          saveLabel={t("common.confirm")}
          startLabel={t("dateRangePicker.startTime")}
          endLabel={t("dateRangePicker.endTime")}
          label={t("dateRangePicker.selectDateRange")}
          validRange={{
            endDate: today,
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  webDateModalRoot: {
    flex: 1,
  },
  webDateModalCenter: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  webDateModalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 10,
    overflow: "hidden",
  },
  webDateModalBody: {
    flex: 1,
    minHeight: 0,
    width: "100%",
  },
});
