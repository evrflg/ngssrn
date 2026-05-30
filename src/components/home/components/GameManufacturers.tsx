import { View, StyleSheet, Text, Image } from "react-native";
import { useMemo, useCallback, useState } from "react";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { stationConfig } from "@/store/tenant/tenantSlice";
import {
  manufacturerDarkAll,
  manufacturerDarkShort,
  manufacturerLightAll,
  manufacturerLightShort,
  type ManufacturerImageItem,
} from "./manufacturerAssets";

function useManufacturerList(
  themeId: string,
  showAll: boolean,
): ManufacturerImageItem[] {
  const isDark = themeId === "greenBlack";
  return useMemo(() => {
    const short = isDark ? manufacturerDarkShort : manufacturerLightShort;
    const rest = isDark ? manufacturerDarkAll : manufacturerLightAll;
    return showAll ? [...short, ...rest] : short;
  }, [isDark, showAll]);
}

const GAP_COMPACT = 12;
const GAP_ALL = 5;
/** 厂商 logo 网格统一每行个数 */
const COLS = 3;

function ManufacturerImageGrid({
  items,
  showAll,
}: {
  items: ManufacturerImageItem[];
  showAll: boolean;
}) {
  const [rowW, setRowW] = useState(0);
  const onLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      setRowW(e.nativeEvent.layout.width-12);
    },
    [],
  );

  const gap = showAll ? GAP_ALL : GAP_COMPACT;
  const cellWMeasured =
    rowW > 0 ? (rowW - gap * (COLS - 1)) / COLS : undefined;
  /** 首帧 onLayout 前兜底，约等于 3 列 + 间距 */
  const cellWFallback = `${100 / COLS - 1.5}%` as const;

  if (showAll) {
    return (
      <View
        onLayout={onLayout}
        style={[styles.gridAll, { paddingVertical: 12 }]}
      >
        {items.map((item, index) => {
          const isRowEnd = index % COLS === COLS - 1;
          const cellStyle =
            cellWMeasured != null
              ? {
                  width: cellWMeasured,
                  marginRight: isRowEnd ? 0 : gap,
                  marginBottom: gap,
                }
              : {
                  width: cellWFallback,
                  marginRight: isRowEnd ? 0 : gap,
                  marginBottom: gap,
                };
          return (
            <View key={item.name} style={[styles.cellAll, cellStyle]}>
              <Image
                source={item.src}
                style={styles.imgAll}
                resizeMode="contain"
                accessibilityLabel={item.name}
              />
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View
      onLayout={onLayout}
      style={[styles.gridCompact, { paddingVertical: 12 }]}
    >
      {items.map((item, index) => {
        const isRowEnd = index % COLS === COLS - 1;
        const cellStyle =
          cellWMeasured != null
            ? {
                width: cellWMeasured,
                marginRight: isRowEnd ? 0 : gap,
                marginBottom: gap,
              }
            : {
                width: cellWFallback,
                marginRight: isRowEnd ? 0 : gap,
                marginBottom: gap,
              };
        return (
          <View key={item.name} style={[styles.cellCompact, cellStyle]}>
            <Image
              source={item.src}
              style={styles.imgCompact}
              resizeMode="contain"
              accessibilityLabel={item.name}
            />
          </View>
        );
      })}
    </View>
  );
}

export const GameManufacturers = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const indexFooter: any = useSelector(
    (state: RootState) => state?.selfConfig?.indexFooter,
  );
  const siteCfg = useSelector(stationConfig);
  const showAll = Boolean(siteCfg?.isShowAllGameManufacturer);
  const list = useManufacturerList(theme, showAll);

  const grid = <ManufacturerImageGrid items={list} showAll={showAll} />;

  return (
    <View
      style={[styles.container, { marginTop: indexFooter == 2 ? 0 : 10 }]}
    >
      {indexFooter == 1 && (
        <>
          <View className="justify-left items-center flex-row mb-2.5">
            <View
              className="rounded-md w-2 h-2 mr-1"
              style={{ backgroundColor: Colors[theme].primary }}
            />
            <Text
              className="font-medium"
              style={{ color: Colors[theme].text, fontSize: 13 }}
            >
              {t("home.bottomArea.gameManufacturers")}
            </Text>
          </View>
          <View
            style={[
              styles.card,
              { backgroundColor: Colors[theme].cardBg1, padding: 15 },
            ]}
          >
            {grid}
          </View>
        </>
      )}

      {indexFooter == 2 && (
        <>
          <View className="justify-left items-center flex-row mb-2.5">
            <Text
              className="font-medium"
              style={{ color: Colors[theme].text, fontSize: 13 }}
            >
              {t("home.bottomArea.gameManufacturers")}
            </Text>
          </View>
          <View style={styles.card}>{grid}</View>
        </>
      )}

      {indexFooter == 3 && (
        <View
          style={[
            styles.card,
            { backgroundColor: Colors[theme].cardBg1, padding: 15 },
          ]}
        >
          {grid}
        </View>
      )}

      {indexFooter == 4 && (
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors[theme].cardBg1,
              padding: 15,
              borderRadius: 8,
              marginTop: 6,
            },
          ]}
        >
          <View className="justify-left items-center flex-row mb-2.5 ml-4">
            <View
              className="rounded-md w-2 h-2 mr-1"
              style={{ backgroundColor: Colors[theme].primary }}
            />
            <Text
              className="font-medium"
              style={{ color: Colors[theme].text, fontSize: 13 }}
            >
              {t("home.bottomArea.gameManufacturers")}
            </Text>
          </View>
          {grid}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  card: {
    overflow: "hidden",
  },
  gridCompact: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  cellCompact: {
    justifyContent: "center",
    alignItems: "center",
  },
  imgCompact: {
    width: "100%",
    height: 40,
    maxWidth: "100%",
  },
  gridAll: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  cellAll: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 0,
  },
  imgAll: {
    width: "100%",
    height: 36,
    maxWidth: "100%",
  },
});
